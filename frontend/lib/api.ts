import { ApiRequest, ApiResponse } from '@/types';

// Backend API 기본 URL (환경별로 분리 가능)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

/**
 * API 요청 실행 함수
 *
 * 학습 포인트:
 * 1. fetch API를 래핑(wrapping)하여 공통 로직을 한 곳에서 관리
 * 2. 에러 처리를 중앙화하여 컴포넌트에서 일관되게 사용 가능
 * 3. 응답 시간 측정 로직을 캡슐화
 */

export async function executeRequest(request: ApiRequest): Promise<ApiResponse> {
  const startTime = Date.now();

  // fetch 옵션 구성
  const options: RequestInit = {
    method: request.method,
    headers: {
      ...request.headers,
      'Content-Type': 'application/json',
    },
  };

  // GET 요청에는 body를 포함하지 않음 (HTTP 스펙)
  if (request.body && request.method !== 'GET') {
    options.body = request.body;
  }

  const response = await fetch(request.url, options);
  const responseBody = await response.text();
  const executionTime = Date.now() - startTime;

  // 응답 헤더를 Record<string, string> 형태로 변환
  const headers: Record<string, string> = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });

  return {
    status: response.status,
    statusText: response.statusText,
    headers,
    body: responseBody,
    executionTime,
  };
}

/**
 * Backend의 내부 API를 호출하는 전용 함수
 * 예: fetchFromBackend('/users') → http://localhost:8080/api/users
 */
export async function fetchFromBackend(
  path: string,
  method: ApiRequest['method'] = 'GET',
  body?: string
): Promise<ApiResponse> {
  return executeRequest({
    method,
    url: `${API_BASE_URL}/api${path}`,
    body,
  });
}