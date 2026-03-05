/**
 * HeadersDisplay — 응답 헤더를 테이블 형태로 표시하는 컴포넌트
 *
 * 학습 포인트:
 * 1. Object.entries()로 객체를 [key, value] 배열로 변환
 * 2. 검색 필터링 — Array.filter()와 toLowerCase() 조합
 */

import { useState } from 'react';

interface HeadersDisplayProps {
  headers: Record<string, string>;
}

export default function HeadersDisplay({ headers }: HeadersDisplayProps) {
  const [search, setSearch] = useState('');

  const entries = Object.entries(headers);

  // 검색 필터링
  const filtered = search
    ? entries.filter(
        ([key, value]) =>
          key.toLowerCase().includes(search.toLowerCase()) ||
          value.toLowerCase().includes(search.toLowerCase())
      )
    : entries;

  return (
    <div className="space-y-3">
      {/* 검색 입력 */}
      {entries.length > 3 && (
        <input
          type="text"
          placeholder="Filter headers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
        />
      )}

      {/* 헤더 목록 */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="space-y-2">
          {filtered.map(([key, value]) => (
            <div key={key} className="flex gap-4 text-sm">
              <span className="font-bold text-gray-700 min-w-50">{key}:</span>
              <span className="text-gray-600 flex-1 break-all">{value}</span>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-gray-400 text-sm">No headers match your filter.</p>
          )}
        </div>
      </div>
    </div>
  );
}