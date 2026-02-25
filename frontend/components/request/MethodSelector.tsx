interface MethodSelectorProps {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  onChange: (method: 'GET' | 'POST' | 'PUT' | 'DELETE') => void;
}

export default function MethodSelector({ method, onChange }: MethodSelectorProps) {
  return (
    <select
      value={method}
      onChange={(e) => onChange(e.target.value as 'GET' | 'POST' | 'PUT' | 'DELETE')}
      className="px-4 py-2 border rounded bg-white font-bold"
    >
      <option value="GET">GET</option>
      <option value="POST">POST</option>
      <option value="PUT">PUT</option>
      <option value="DELETE">DELETE</option>
    </select>
  );
}