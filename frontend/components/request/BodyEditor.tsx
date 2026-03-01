interface BodyEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function BodyEditor({ value, onChange }: BodyEditorProps) {
  return (
    <div className="mt-6">
      <label className="block text-sm font-bold text-gray-700 mb-2">
        Request Body
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder='{"name": "홍길동", "email": "hong@test.com"}'
        className="w-full border-2 text-gray-500 border-gray-300 rounded-lg p-4 font-mono text-sm h-40 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
      />
    </div>
  );
}