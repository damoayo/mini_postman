/**
 * RequestPanel — 요청 영역 전체를 관리하는 컴포넌트
 *
 * 학습 포인트:
 * 1. 콜백(Callback) 패턴으로 자식 → 부모 데이터 전달
 *    - onSend 콜백이 호출되면 부모(page.tsx)에서 API 요청 실행
 * 2. 탭 UI — 요청 영역에도 Body/Headers 탭 추가 (Postman과 동일한 UX)
 * 3. 조건부 렌더링 — method에 따라 Body 탭 표시 여부 결정
 */

import { useState } from 'react';
import BodyEditor from './BodyEditor';
import HeadersEditor from './HeadersEditor';
import MethodSelector from './MethodSelector';
import UrlInput from './UrlInput';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface RequestPanelProps {
  method: HttpMethod;
  url: string;
  body: string;
  headers: Record<string, string>;
  loading: boolean;
  onMethodChange: (method: HttpMethod) => void;
  onUrlChange: (url: string) => void;
  onBodyChange: (body: string) => void;
  onHeadersChange: (headers: Record<string, string>) => void;
  onSend: () => void;
}

export default function RequestPanel({
  method,
  url,
  body,
  headers,
  loading,
  onMethodChange,
  onUrlChange,
  onBodyChange,
  onHeadersChange,
  onSend,
}: RequestPanelProps) {
  const [activeTab, setActiveTab] = useState<'body' | 'headers'>('body');

  // Body 탭이 의미 있는 메서드인지 판별
  const hasBody = method === 'POST' || method === 'PUT';

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Method + URL + Send 행 */}
        <div className="flex gap-3">
          <MethodSelector method={method} onChange={onMethodChange} />
          <UrlInput value={url} onChange={onUrlChange} />

          {/* Send Button */}
          <button
            onClick={onSend}
            disabled={loading}
            className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                </svg>
                Sending...
              </span>
            ) : 'Send'}
          </button>
        </div>

        {/* 요청 탭 (Postman처럼 Body / Headers 탭) */}
        <div className="border-b border-gray-200 mt-4">
          <div className="flex gap-4">
            {hasBody && (
              <button
                onClick={() => setActiveTab('body')}
                className={`pb-2 px-1 font-semibold text-sm transition-colors ${
                  activeTab === 'body'
                    ? 'text-orange-600 border-b-2 border-orange-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Body
              </button>
            )}
            <button
              onClick={() => setActiveTab('headers')}
              className={`pb-2 px-1 font-semibold text-sm transition-colors ${
                activeTab === 'headers'
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Headers
            </button>
          </div>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="mt-4">
          {activeTab === 'body' && hasBody && (
            <BodyEditor value={body} onChange={onBodyChange} />
          )}
          {activeTab === 'headers' && (
            <HeadersEditor headers={headers} onChange={onHeadersChange} />
          )}
        </div>
      </div>
    </div>
  );
}