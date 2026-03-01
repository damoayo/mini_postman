/**
 * HistoryList — 히스토리 항목을 리스트로 렌더링하는 컴포넌트
 *
 * 학습 포인트:
 * 1. 백엔드에서 받은 데이터 타입을 프론트엔드 인터페이스로 정의
 * 2. Date 포맷팅 — toLocaleString()으로 사용자 친화적 날짜 표시
 * 3. 클릭 이벤트로 히스토리 항목을 선택하면 요청 정보를 복원
 */

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface HistoryItem {
  id: number;
  method: string;
  url: string;
  statusCode: number;
  executedAt: string;
}

interface HistoryListProps {
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
}

/** HTTP 메서드별 컬러 매핑 */
function getMethodColor(method: string): string {
  const colors: Record<string, string> = {
    GET: 'text-green-600 bg-green-50',
    POST: 'text-yellow-600 bg-yellow-50',
    PUT: 'text-blue-600 bg-blue-50',
    DELETE: 'text-red-600 bg-red-50',
  };
  return colors[method.toUpperCase()] || 'text-gray-600 bg-gray-50';
}

/** 상태 코드별 컬러 */
function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'text-green-600';
  if (status >= 300 && status < 400) return 'text-yellow-600';
  return 'text-red-600';
}

/** 날짜를 상대  시간으로 포맷 (예: "3분 전") */
function formatTimeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금 전';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

export default function HistoryList({ items, onSelect }: HistoryListProps) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-4xl mb-2">📭</div>
        <p className="text-sm">아직 요청 기록이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 transition-colors group"
        >
          <div className="flex items-center gap-2">
            {/* Method 뱃지 */}
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${getMethodColor(item.method)}`}
            >
              {item.method}
            </span>
            {/* 상태 코드 */}
            <span className={`text-xs font-mono ${getStatusColor(item.statusCode)}`}>
              {item.statusCode}
            </span>
          </div>
          {/* URL (잘려도 보이게) */}
          <p className="text-xs text-gray-500 truncate mt-1 group-hover:text-gray-700">
            {item.url}
          </p>
          {/* 시간 */}
          <p className="text-xs text-gray-400 mt-0.5">
            {formatTimeAgo(item.executedAt)}
          </p>
        </button>
      ))}
    </div>
  );
}