/**
 * BodyDisplay — 응답 본문을 보기 좋게 표시하는 컴포넌트
 *
 * 학습 포인트:
 * 1. 관심사 분리: "포맷팅 로직"을 page.tsx에서 이 컴포넌트로 이동
 * 2. JSON 파싱 실패에 대한 방어적 프로그래밍 (try-catch)
 * 3. 복사 기능 — navigator.clipboard API 활용
 */

import { useState } from 'react';

interface BodyDisplayProps {
  body: string;
}

function formatBody(body: string): string {
  if (!body) return '(Empty)';
  try {
    const parsed = JSON.parse(body);
    return JSON.stringify(parsed, null, 2);
  } catch {
    return body;
  }
}

export default function BodyDisplay({ body }: BodyDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formatBody(body));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API가 지원되지 않는 환경 대비
      console.error('복사 실패');
    }
  };

  return (
    <div className="relative">
      {/* 복사 버튼 */}
      <button
        onClick={handleCopy}
        className="absolute top-3 right-3 text-gray-400 hover:text-white text-xs bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded transition-colors"
        title="Copy to clipboard"
      >
        {copied ? '✓ Copied!' : '📋 Copy'}
      </button>

      <div className="bg-gray-900 rounded-lg p-4 overflow-auto max-h-96">
        <pre className="text-green-400 text-sm font-mono whitespace-pre-wrap">
          {formatBody(body)}
        </pre>
      </div>
    </div>
  );
}