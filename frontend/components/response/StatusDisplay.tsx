interface StatusDisplayProps {
  status: number;
  executionTime: number;
}

function getStatusColor(status: number): string {
  if (status >= 200 && status < 300) return 'bg-green-100 text-green-800';
  if (status >= 300 && status < 400) return 'bg-yellow-100 text-yellow-800';
  if (status >= 400) return 'bg-red-100 text-red-800';
  return 'bg-gray-100 text-gray-800';
}

function getStatusText(status: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    404: 'Not Found',
    500: 'Internal Server Error',
  };
  return statusTexts[status] || 'Unknown';
}

export default function StatusDisplay({ status, executionTime }: StatusDisplayProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      {/* 상태 코드 표시 */}
      <span className={`px-3 py-1 rounded-full font-bold ${getStatusColor(status)}`}>
        Status: {status} {getStatusText(status)}
      </span>
      {/* 응답 시간 표시 */}
      <span className="text-gray-500">
        Time: {executionTime}ms
      </span>
    </div>
  );
}