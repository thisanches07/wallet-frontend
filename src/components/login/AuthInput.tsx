type Props = {
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
};

export function AuthInput({
  type = "text",
  placeholder,
  value,
  onChange,
}: Props) {
  return (
    <div className="relative">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50/50 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all duration-200 hover:border-gray-300"
      />
    </div>
  );
}
