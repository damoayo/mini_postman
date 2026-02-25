interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BodyEditor({ value, onChange }: BodyEditorProps) {
  return (
    <textarea
      placeholder='{"name": "홍길동", "email": "hong@example.com"}'
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={6}
      className="w-full px-4 py-2 border rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}