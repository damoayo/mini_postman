/**
 * ResponsePanel — 응답 영역 전체를 관리하는 컴포넌트
 *
 * 학습 포인트:
 * 1. 컴포넌트 합성(Composition) — 작은 컴포넌트를 조합하여 큰 컴포넌트를 만드는 패턴
 * 2. 탭(Tab) UI 상태 관리 — 부모(page.tsx)에서 관리하던 activeTab을 이 컴포넌트 내부로 이동
 *    → page.tsx의 state가 줄어들어 더 깔끔해짐 (상태 위치 최적화)
 * 3. Response 크기 표시 — new Blob()으로 바이트 크기 계산
 */

import { useState } from 'react';
import BodyDisplay from './BodyDisplay';
import HeadersDisplay from './HeaderDisplay';
import StatusDisplay from './StatusDisplay';

interface ResponsePanelProps {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  body: string;
  executionTime: number;
}

export default function ResponsePanel({
  status,
  statusText,
  headers,
  body,
  executionTime,
}: ResponsePanelProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  // 응답 크기 계산 (바이트 → 사람이 읽기 좋은 형태)
  const responseSize = new Blob([body]).size;
  const formattedSize =
    responseSize > 1024
      ? `${(responseSize / 1024).toFixed(1)} KB`
      : `${responseSize} B`;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* 상태 표시 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800">Response</h2>
          <div className="flex items-center gap-4">
            <StatusDisplay status={status} executionTime={executionTime} />
            <span className="text-xs text-gray-400">{formattedSize}</span>
          </div>
        </div>

        {/* 탭 */}
        <div className="border-b border-gray-200 mb-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('body')}
              className={`pb-2 px-1 font-semibold transition-colors ${
                activeTab === 'body'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Body
            </button>
            <button
              onClick={() => setActiveTab('headers')}
              className={`pb-2 px-1 font-semibold transition-colors ${
                activeTab === 'headers'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Headers ({Object.keys(headers).length})
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        {activeTab === 'body' && <BodyDisplay body={body} />}
        {activeTab === 'headers' && <HeadersDisplay headers={headers} />}
      </div>
    </div>
  );
}