import { ApiRequest, ApiResponse } from '@/types';

// Backend API 기본 URL
const API_BASE_URL = 'http://localhost:8080/api';

// API 요청 실행 함수
export async function executeRequest(request: ApiRequest): Promise<ApiResponse> {
  // 1. 시작 시간 기록
  const startTime = Date.now();

  // 2. fetch 옵션 구성
  const options: RequestInit = {
    method: request.method,
    headers: {
      ...request.headers,
      'Content-Type': 'application/json',
    },
  };
  // 3. body가 존재하면 JSON 문자열로 변환
  if (request.body && request.method !== 'GET') {  // GET이 아닐 때만!
    options.body = request.body;
  }

  // 4. fetch로 요청 보내기 + 응답 받기
  try {
    const response = await fetch(request.url, options);
    const responseBody = await response.text();
    const executionTime = Date.now() - startTime;

    // 5. ApiResponse 객체로 반환
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      body: responseBody,
      executionTime,
    };

  } catch (error) {
    throw new Error(`Request failed: ${error}`);
  }
}