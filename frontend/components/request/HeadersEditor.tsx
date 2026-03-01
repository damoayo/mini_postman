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
 */
import { useEffect, useState } from 'react';

interface HeaderRow {
  key: string;
  value: string;
  enabled: boolean;  // Postman처럼 개별 헤더를 켜고 끄는 기능
}

interface HeadersEditorProps {
  headers: Record<string, string>;
  onChange: (headers: Record<string, string>) => void;
}

export default function HeadersEditor({ headers, onChange }: HeadersEditorProps) {
  // Record → 배열로 변환하여 내부 state로 관리
  const [rows, setRows] = useState<HeaderRow[]>(() => {
    const entries = Object.entries(headers);
    if (entries.length === 0) {
      return [{ key: '', value: '', enabled: true }]; // 빈 행 하나
    }
    return entries.map(([key, value]) => ({ key, value, enabled: true }));
  });

  // rows가 변경될 때마다 부모에게 Record 형태로 전달
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
  
  /**
   * 특정 행의 필드를 업데이트
   * - 불변성 패턴: 기존 배열을 복사 → 해당 인덱스만 수정 → 새 배열을 setState
   */
  const updateRow = (index: number, field: keyof HeaderRow, value: string | boolean) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row
      )
    );
  };

  const addRow = () => {
    setRows((prev) => [...prev, { key: '', value: '', enabled: true }]);
  };

  const removeRow = (index: number) => {
    setRows((prev) => {
      // 최소 1행은 유지
      if (prev.length <= 1) return [{ key: '', value: '', enabled: true }];
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <div className="space-y-2">
      {/* 헤더 라벨 */}
      <div className="flex gap-2 text-xs font-semibold text-gray-500 uppercase tracking-wide px-1">
        <span className="w-8" />
        <span className="flex-1">Key</span>
        <span className="flex-1">Value</span>
        <span className="w-8" />
      </div>

      {/* 각 행 렌더링 */}
      {rows.map((row, index) => (
        <div key={index} className="flex items-center gap-2">
          {/* 체크박스: 헤더 활성화/비활성화 */}
          <input
            type="checkbox"
            checked={row.enabled}
            onChange={(e) => updateRow(index, 'enabled', e.target.checked)}
            className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
          />

          {/* Key 입력 */}
          <input
            type="text"
            placeholder="Header name"
            value={row.key}
            onChange={(e) => updateRow(index, 'key', e.target.value)}
            className={`flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all ${
              !row.enabled ? 'opacity-50 bg-gray-100' : ''
            }`}
            disabled={!row.enabled}
          />

          {/* Value 입력 */}
          <input
            type="text"
            placeholder="Header value"
            value={row.value}
            onChange={(e) => updateRow(index, 'value', e.target.value)}
            className={`flex-1 border-2 border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all ${
              !row.enabled ? 'opacity-50 bg-gray-100' : ''
            }`}
            disabled={!row.enabled}
          />

          {/* 삭제 버튼 */}
          <button
            onClick={() => removeRow(index)}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
            title="Remove header"
          >
            ✕
          </button>
        </div>
      ))}

      {/* 추가 버튼 */}
      <button
        onClick={addRow}
        className="flex items-center gap-1 text-sm text-orange-600 hover:text-orange-700 font-semibold mt-2 px-1"
      >
        <span className="text-lg">+</span> Add Header
      </button>
    </div>
  );
}