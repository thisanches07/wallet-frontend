import { AlertCircle, RefreshCw, WifiOff } from "lucide-react";

interface OfflineMessageProps {
  message?: string;
  onRetry?: () => void;
  showRetry?: boolean;
  className?: string;
}

export function OfflineMessage({
  message = "Sem conexão com o servidor",
  onRetry,
  showRetry = true,
  className = "",
}: OfflineMessageProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 ${className}`}
    >
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <WifiOff className="w-8 h-8 text-gray-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">Modo Offline</h3>

      <p className="text-gray-600 mb-4 max-w-sm">{message}</p>

      <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
        <AlertCircle className="w-4 h-4" />
        <span>Verifique sua conexão com a internet</span>
      </div>

      {showRetry && onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Tentar Novamente
        </button>
      )}
    </div>
  );
}

export function EmptyDataMessage({
  title = "Nenhum dado encontrado",
  message = "Não há informações para exibir no momento.",
  className = "",
}: {
  title?: string;
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
    >
      <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-blue-400" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>

      <p className="text-gray-600 max-w-sm">{message}</p>
    </div>
  );
}
