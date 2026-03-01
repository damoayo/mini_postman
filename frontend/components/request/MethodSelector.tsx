type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface MethodSelectorProps {
  method: HttpMethod;
  onChange: (method: HttpMethod) => void;
}

export default function MethodSelector({ method, onChange }: MethodSelectorProps) {
  const colorMap: Record<HttpMethod, string> = {
    GET: 'text-green-600 border-green-300 bg-green-50',
    POST: 'text-yellow-600 border-yellow-300 bg-yellow-50',
    PUT: 'text-blue-600 border-blue-300 bg-blue-50',
    DELETE: 'text-red-600 border-red-300 bg-red-50',
  };

  return (
    <select
      value={method}
      onChange={(e) => onChange(e.target.value as HttpMethod)}
      className={`border-2 rounded-lg px-4 py-3 font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 transition-colors ${colorMap[method]}`}
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
      <option value="PUT">PUT</option>
      <option value="DELETE">DELETE</option>
    </select>
  );
}