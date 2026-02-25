export interface ApiRequest {
    method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
}

export interface ApiResponse {
    status: number;
  data: any;
  headers: Record<string, string>;
}