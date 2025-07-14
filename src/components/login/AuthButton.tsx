type Props = {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  loading?: boolean;
};

export function AuthButton({
  children,
  onClick,
  className = "",
  loading = false,
}: Props) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`w-full py-3.5 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
          <span>Carregando...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}
