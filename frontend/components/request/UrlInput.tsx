interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <input
      type="text"
      placeholder="URL을 입력하세요"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}