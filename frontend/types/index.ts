// API 요청 타입
export interface ApiRequest {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';  // 4가지만 허용 (Java enum처럼)
  url: string;
  headers?: Record<string, string>;  // 선택사항
  body?: string;                     // 선택사항 (POST/PUT 시 사용)
}

// API 응답 타입
export interface ApiResponse {
  status: number;                    // HTTP 상태코드 (200, 404 등)
  headers: Record<string, string>;   // 응답 헤더
  body: string;                      // 응답 본문
  executionTime: number;             // 응답 시간 (ms)
}