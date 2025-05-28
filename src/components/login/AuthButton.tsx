type Props = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
};

export function AuthButton({ children, onClick, className = "" }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full mt-2 py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-md shadow transition-all ${className}`}
    >
      {children}
    </button>
  );
}
