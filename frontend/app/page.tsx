'use client';

/**
 * page.tsx — 메인 페이지 (오케스트레이터)
 *
 * 학습 포인트:
 * 1. 이 파일은 "상태 관리"와 "API 호출"만 담당
 *    - UI 렌더링 세부사항은 모두 하위 컴포넌트에게 위임
 * 2. Lifting State Up — 여러 컴포넌트가 공유하는 state는 가장 가까운 공통 조상에서 관리
 *    - method, url, body, headers → RequestPanel과 handleSend 모두 사용
 *    - response → ResponsePanel에서 사용
 * 3. 레이아웃 — Postman처럼 좌측 히스토리 사이드바 + 우측 메인 영역
 */

import { HistoryItem } from '@/components/history/HistoryList';
import HistoryPanel from '@/components/history/HistoryPanel';
import RequestPanel from '@/components/request/RequestPanel';
import ResponsePanel from '@/components/response/ResponsePanel';
import { executeRequest } from '@/lib/api';
import { ApiResponse } from '@/types';
import { useState } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export default function Home() {
  // ── 요청 관련 state ──
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [url, setUrl] = useState('http://localhost:8080/api/users');
  const [requestBody, setRequestBody] = useState('');
  const [requestHeaders, setRequestHeaders] = useState<Record<string, string>>({});

  // ── 응답 관련 state ──
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── 히스토리 새로고침 트리거 ──
  const [historyRefresh, setHistoryRefresh] = useState(0);

  /**
   * API 요청 실행
   * - 요청 성공 시 히스토리 새로고침 트리거를 +1 하여 HistoryPanel이 자동 갱신되도록 함
   */
  // handleSend는 RequestPanel의 onSend 콜백으로 전달되어, Send 버튼 클릭 시 호출됩니다.
  const handleSend = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // executeRequest는 /lib/api.ts에 정의된 함수로, 실제 API 요청을 수행합니다.
      const result = await executeRequest({
        method,
        url,
        headers: Object.keys(requestHeaders).length > 0 ? requestHeaders : undefined,
        body: requestBody || undefined,
      });
      setResponse(result);

      // ★ 히스토리 저장 (백엔드에 POST)
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/histories`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            method,                                          // "GET", "POST" 등
            url,                                             // 요청 URL
            headers: JSON.stringify(requestHeaders),         // 헤더를 JSON 문자열로
            requestBody: requestBody || null,                // 요청 본문
            responseBody: result.body || null,                // 응답 본문
            statusCode: result.status,                       // 200, 404 등
          }),
        });
      } catch {
        // 히스토리 저장 실패는 무시 (메인 기능에 영향 X)
        console.error('히스토리 저장 실패');
      }
      // 히스토리 새로고침 트리거
      setHistoryRefresh((prev) => prev + 1);
    } catch (err) {
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
      } else if (err instanceof Error) {
        setError(`요청 실패: ${err.message}`);
      } else {
        setError('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * 히스토리 항목을 클릭하면 해당 요청 정보를 폼에 복원
   */
  const handleHistorySelect = (item: HistoryItem) => {
    setMethod(item.method as HttpMethod);
    setUrl(item.url);
    // 선택 시 이전 응답은 초기화
    setResponse(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ── 헤더 ── */}
      <div className="bg-linear-to-r from-orange-500 to-pink-500 px-6 py-4 shadow-lg">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span>🚀</span>
          Mini Postman
        </h1>
      </div>

      {/* ── 메인 레이아웃 (사이드바 + 콘텐츠) ── */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex gap-6">
          {/* 좌측: 히스토리 사이드바 */}
          <div className="w-72 shrink-0">
            <HistoryPanel
              onSelect={handleHistorySelect}
              refreshTrigger={historyRefresh}
            />
          </div>

          {/* 우측: 메인 영역 */}
          <div className="flex-1 space-y-4">
            {/* 요청 패널 */}
            <RequestPanel
              method={method}
              url={url}
              body={requestBody}
              headers={requestHeaders}
              loading={loading}
              onMethodChange={setMethod}
              onUrlChange={setUrl}
              onBodyChange={setRequestBody}
              onHeadersChange={setRequestHeaders}
              onSend={handleSend}
            />

            {/* 응답 패널 */}
            {response && (
              <ResponsePanel
                status={response.status}
                statusText={response.statusText}
                headers={response.headers}
                body={response.body}
                executionTime={response.executionTime}
              />
            )}

            {/* Empty State */}
            {!response && !loading && !error && (
              <div className="bg-white rounded-xl shadow-md p-12 text-center">
                <div className="text-gray-400 text-6xl mb-4">📡</div>
                <p className="text-gray-500 text-lg">
                  Enter a URL and click Send to get a response
                </p>
              </div>
            )}

            {/* Error 표시 */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-red-500 text-xl">⚠️</span>
                  <span className="text-red-700">{error}</span>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600 font-bold"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}