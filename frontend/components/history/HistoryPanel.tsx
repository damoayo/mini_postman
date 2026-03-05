/**
 * HistoryPanel — 히스토리 사이드바 컴포넌트
 *
 * 학습 포인트:
 * 1. useEffect + fetch로 컴포넌트 마운트 시 데이터 로딩
 * 2. 로딩/에러/빈 상태 3가지 UI 상태 처리
 * 3. 부모에서 refreshTrigger를 받아 외부에서 새로고침 가능
 *    → 요청 전송 후 히스토리를 자동으로 갱신할 때 사용
 */

import { useEffect, useState } from 'react';
import HistoryList, { HistoryItem } from './HistoryList';

interface HistoryPanelProps {
  onSelect: (item: HistoryItem) => void;
  refreshTrigger?: number;  // 이 값이 바뀔 때마다 히스토리를 다시 불러옴
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HistoryPanel({ onSelect, refreshTrigger }: HistoryPanelProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [methodFilter, setMethodFilter] = useState<string>('ALL');

  /**
   * 히스토리 데이터 fetching
   *
   * 학습 포인트:
   * - useEffect의 의존성 배열에 refreshTrigger를 넣으면
   *   부모에서 숫자를 +1 할 때마다 이 effect가 다시 실행됨
   * - AbortController로 언마운트 시 불필요한 fetch를 취소할 수 있음 (심화)
   */
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE_URL}/api/histories`);
        if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
        const data: HistoryItem[] = await res.json();
        setItems(data);
      } catch (err) {
        if (err instanceof TypeError && err.message === 'Failed to fetch') {
          setError('서버에 연결할 수 없습니다');
        } else if (err instanceof Error) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [refreshTrigger]);

  // 메서드별 필터링
  const filtered =
    methodFilter === 'ALL'
      ? items
      : items.filter((item) => item.method === methodFilter);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden h-full">
      <div className="p-4">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-gray-800">History</h2>
          <span className="text-xs text-gray-400">{items.length}건</span>
        </div>

        {/* 메서드 필터 */}
        <div className="flex gap-1 mb-3 flex-wrap">
          {['ALL', 'GET', 'POST', 'PUT', 'DELETE'].map((m) => (
            <button
              key={m}
              onClick={() => setMethodFilter(m)}
              className={`text-xs px-2 py-1 rounded-full font-semibold transition-colors ${
                methodFilter === m
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>

        {/* 상태별 UI */}
        {loading && (
          <div className="text-center py-8 text-gray-400">
            <div className="animate-spin text-2xl mb-2">⏳</div>
            <p className="text-sm">로딩 중...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-4 text-red-500 text-sm">
            <p>⚠️ {error}</p>
          </div>
        )}

        {!loading && !error && (
          <HistoryList items={filtered} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}