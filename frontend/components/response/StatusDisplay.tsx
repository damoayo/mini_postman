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

export default function StatusDisplay({ status, executionTime }: StatusDisplayProps) {
  return (
    // <div className={`inline-flex items-center px-3 py-1 rounded ${getStatusColor(status)}`}>
    //   <span className="font-bold">Status: {status}</span>
    //   <span className="ml-2 text-sm text-gray-600">{executionTime} ms</span>
    // </div>

    <div className="flex items-center gap-4 mb-4">
    
      {/* 상태 코드 표시 */}
      <span className={`px-3 py-1 rounded-full font-bold ${getStatusColor(status)}`}>
        Status: {status}
      </span>
    
      {/* 응답 시간 표시 */}
      <span className="text-gray-500">
        Time: {executionTime}ms
      </span>
    
    </div>
  );
}