interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
}

export default function UrlInput({ value, onChange }: UrlInputProps) {
  return (
    <input
      type="text"
      placeholder="Enter request URL"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 border-2 text-gray-400 border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
    />
  );
}