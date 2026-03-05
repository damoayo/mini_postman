/**
 * HeadersEditor — 요청 헤더를 키-값 쌍으로 편집하는 컴포넌트
 *
 * 학습 포인트:
 * 1. 배열 state를 불변(immutable)하게 업데이트하는 패턴
 *    - 직접 배열을 수정하면 React가 변경을 감지 못함
 *    - spread 연산자(...)로 새 배열을 만들어야 리렌더링 발생
 * 2. Record<string, string>을 배열 [{key, value}]로 변환하여 관리
 *    - 객체는 순서가 보장되지 않고 동적 추가/삭제가 까다로움
 *    - 배열로 관리하면 index 기반의 CRUD가 쉬움
 * 3. 부모에게 데이터를 전달할 때 배열 → Record 변환
 *
 * 1. 기본 헤더(Default Headers) vs 사용자 헤더(Custom Headers)
 *    - Postman처럼 기본 헤더를 미리 세팅하고 체크/언체크로 켜고 끔
 *    - isDefault: true인 행은 삭제 불가 (삭제 버튼 숨김)
 * 2. method에 따라 Content-Type 자동 표시
 *    - POST/PUT → Content-Type: application/json 활성화
 *    - GET/DELETE → Content-Type 비활성화 (body가 없으므로)
 * 3. 불변성(Immutable) 업데이트 패턴
 *    - React가 변경을 감지하려면 새 배열/객체를 만들어야 함
 */
import { useEffect, useState } from 'react';

interface HeaderRow {
  key: string;
  value: string;
  enabled: boolean;
  isDefault: boolean;   // 기본 헤더 여부 (true면 삭제 불가)
  description?: string; // 헤더 설명 (hover 시 툴팁으로 표시)
}

interface HeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
  method?: string;  // 현재 HTTP 메서드 (Content-Type 자동 제어용)
}

/**
 * 기본 헤더 목록 — Postman의 auto-generated headers와 유사
 *
 * 왜 이런 헤더가 필요한가?
 * - Content-Type: 서버에게 "내가 보내는 데이터는 JSON이야"라고 알려줌
 * - Accept: 서버에게 "어떤 형식의 응답이든 받을 수 있어"라고 알려줌
 * - User-Agent: 서버에게 "나는 MiniPostman이야"라고 자기소개
 */
const DEFAULT_HEADERS: HeaderRow[] = [
  {
    key: 'Content-Type',
    value: 'application/json',
    enabled: true,
    isDefault: true,
    description: '요청 본문의 데이터 형식을 지정 (POST/PUT 시 자동 활성화)',
  },
  {
    key: 'Accept',
    value: '*/*',
    enabled: true,
    isDefault: true,
    description: '서버에게 어떤 응답 형식이든 수용 가능함을 알림',
  },
  {
    key: 'User-Agent',
    value: 'MiniPostman/1.0',
    enabled: true,
    isDefault: true,
    description: '클라이언트 식별 정보 (브라우저 대신 우리 앱 이름)',
  },
  {
    key: 'Accept-Encoding',
    value: 'gzip, deflate, br',
    enabled: false,
    isDefault: true,
    description: '서버에게 압축된 응답을 보내도 된다고 알림 (성능 최적화)',
  },
  {
    key: 'Connection',
    value: 'keep-alive',
    enabled: false,
    isDefault: true,
    description: '연결을 유지하여 여러 요청에 재사용 (성능 최적화)',
  },
];

export default function HeadersEditor({ headers, onChange, method }: HeadersEditorProps) {
  const [rows, setRows] = useState<HeaderRow[]>(() => {
    const userEntries = Object.entries(headers);

    // 기본 헤더 + 부모에서 전달된 사용자 헤더를 합침
    const defaultRows = DEFAULT_HEADERS.map((dh) => {
      // 부모가 같은 key를 전달했으면 그 value로 덮어쓰기
      const override = userEntries.find(([k]) => k === dh.key);
      if (override) {
        return { ...dh, value: override[1], enabled: true };
      }
      return { ...dh };
    });

    // 기본 헤더에 없는 사용자 커스텀 헤더 추가
    const defaultKeys = DEFAULT_HEADERS.map((dh) => dh.key);
    const customRows = userEntries
      .filter(([k]) => !defaultKeys.includes(k))
      .map(([key, value]) => ({ key, value, enabled: true, isDefault: false }));

    return [...defaultRows, ...customRows, { key: '', value: '', enabled: true, isDefault: false }];
  });

  // 기본 헤더 접기/펼치기 상태
  const [showDefaults, setShowDefaults] = useState(false);

  // method 변경 시 Content-Type 자동 제어
  useEffect(() => {
    if (!method) return;
    const hasBody = method === 'POST' || method === 'PUT';

    setRows((prev) =>
      prev.map((row) => {
        if (row.key === 'Content-Type' && row.isDefault) {
          return { ...row, enabled: hasBody };
        }
        return row;
      })
    );
  }, [method]);

  // rows 변경 → 부모에게 Record 전달
  useEffect(() => {
    const result: Record<string, string> = {};
    rows.forEach((row) => {
      if (row.enabled && row.key.trim()) {
        result[row.key.trim()] = row.value;
      }
    });
    onChange(result);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows]);

  const updateRow = (index: number, field: keyof HeaderRow, value: string | boolean) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: '', value: '', enabled: true, isDefault: false }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      const target = prev[index];
      if (target.isDefault) return prev; // 기본 헤더는 삭제 불가

      const filtered = prev.filter((_, i) => i !== index);
      // 사용자 행이 모두 삭제되면 빈 행 하나 유지
      const hasCustom = filtered.some((r) => !r.isDefault);
      if (!hasCustom) {
        return [...filtered, { key: '', value: '', enabled: true, isDefault: false }];
      }
      return filtered;
    });
  };

  // 기본 헤더와 사용자 헤더 분리
  const defaultRows = rows.filter((r) => r.isDefault);
  const customRows = rows.filter((r) => !r.isDefault);

  // 활성화된 기본 헤더 개수
  const activeDefaultCount = defaultRows.filter((r) => r.enabled).length;

  return (
    <div className="space-y-3">
      {/* ── 기본 헤더 (접기/펼치기) ── */}
      <div>
        <button
          onClick={() => setShowDefaults(!showDefaults)}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-700 font-semibold uppercase tracking-wide"
        >
          <span className={`transition-transform ${showDefaults ? 'rotate-90' : ''}`}>
            ▶
          </span>
          Auto-generated Headers
          <span className="text-orange-500">({activeDefaultCount})</span>
        </button>

        {showDefaults && (
          <div className="mt-2 space-y-1 pl-2 border-l-2 border-orange-200">
            {defaultRows.map((row) => {
              const globalIndex = rows.indexOf(row);
              return (
                <div key={row.key} className="flex items-center gap-2 group">
                  <input
                    type="checkbox"
                    checked={row.enabled}
                    onChange={(e) => updateRow(globalIndex, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                  />
                  <span
                    className={`text-sm font-mono min-w-[160px] ${
                      row.enabled ? 'text-gray-700 font-semibold' : 'text-gray-400 line-through'
                    }`}
                  >
                    {row.key}
                  </span>
                  <span
                    className={`text-sm font-mono flex-1 ${
                      row.enabled ? 'text-gray-600' : 'text-gray-400'
                    }`}
                  >
                    {row.value}
                  </span>
                  {/* 툴팁: 헤더 설명 */}
                  {row.description && (
                    <span
                      className="text-gray-300 group-hover:text-gray-500 cursor-help text-xs"
                      title={row.description}
                    >
                      ⓘ
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── 사용자 헤더 ── */}
      <div>
        <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1 mb-1">
          <span className="w-8" />
          <span className="flex-1">Key</span>
          <span className="flex-1">Value</span>
          <span className="w-8" />
        </div>

        {customRows.map((row) => {
          const globalIndex = rows.indexOf(row);
          return (
            <div key={globalIndex} className="flex items-center gap-2 mb-1">
              <input
                type="checkbox"
                checked={row.enabled}
                onChange={(e) => updateRow(globalIndex, 'enabled', e.target.checked)}
                className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
              />
              <input
                type="text"
                placeholder="Header name"
                value={row.key}
                onChange={(e) => updateRow(globalIndex, 'key', e.target.value)}
                className={`flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all ${
                  !row.enabled ? 'opacity-50 bg-gray-100' : ''
                }`}
                disabled={!row.enabled}
              />
              <input
                type="text"
                placeholder="Header value"
                value={row.value}
                onChange={(e) => updateRow(globalIndex, 'value', e.target.value)}
                className={`flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all ${
                  !row.enabled ? 'opacity-50 bg-gray-100' : ''
                }`}
                disabled={!row.enabled}
              />
              <button
                onClick={() => removeRow(globalIndex)}
                className="text-gray-400 hover:text-red-500 transition-colors p-1"
                title="Remove header"
              >
                ✕
              </button>
            </div>
          );
        })}

        <button
          onClick={addRow}
          className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-semibold mt-2 px-1"
        >
          <span className="text-lg">+</span> Add Header
        </button>
      </div>

      {/* ── 활성 헤더 요약 ── */}
      <div className="text-xs text-gray-400 px-1">
        {rows.filter((r) => r.enabled && r.key.trim()).length}개 헤더 활성화됨
      </div>
    </div>
  );
}