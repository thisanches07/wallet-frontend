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
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-md bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
    />
  );
}
