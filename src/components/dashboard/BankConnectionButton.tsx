import { PluggyWidget } from "@/components/PluggyWidget";
import { ConnectedBank, useBankConnections } from "@/hooks/useBankConnections";
import {
  AlertCircle,
  CheckCircle,
  CreditCard,
  Link,
  Loader2,
  Plus,
  RefreshCw,
  X,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface BankConnectionButtonProps {
  onConnect?: (bank: ConnectedBank) => void;
}

export function BankConnectionButton({ onConnect }: BankConnectionButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const {
    connectedBanks,
    loading,
    connectBank,
    disconnectBank,
    syncBank,
    showPluggyWidget,
    connectToken,
    handlePluggySuccess,
    handlePluggyError,
    handlePluggyClose,
  } = useBankConnections();

  // Calcular posição do dropdown
  useEffect(() => {
    if (showDropdown && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right - window.scrollX,
      });
    }
  }, [showDropdown]);

  const handleConnect = useCallback(async () => {
    try {
      setIsConnecting(true);

      // Conectar banco usando o Pluggy Connect widget
      const newBank = await connectBank();

      // Se o usuário cancelou (fechou o modal), newBank será null
      if (newBank) {
        // Callback para o componente pai apenas se a conexão foi bem-sucedida
        onConnect?.(newBank);
      }
    } catch (error) {
      console.error("Erro ao conectar banco:", error);
    } finally {
      setIsConnecting(false);
      setShowDropdown(false);
    }
  }, [connectBank, onConnect]);

  const handleDisconnect = useCallback(
    async (bankId: string) => {
      try {
        await disconnectBank(bankId);
      } catch (error) {
        console.error("Erro ao desconectar banco:", error);
        alert("Erro ao desconectar banco. Tente novamente.");
      }
    },
    [disconnectBank]
  );

  const handleSync = useCallback(
    async (bankId: string) => {
      try {
        await syncBank(bankId);
      } catch (error) {
        console.error("Erro ao sincronizar banco:", error);
        alert("Erro ao sincronizar dados. Tente novamente.");
      }
    },
    [syncBank]
  );

  const getStatusIcon = (status: ConnectedBank["status"]) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="w-3 h-3 text-green-500" />;
      case "error":
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case "syncing":
        return <Loader2 className="w-3 h-3 text-blue-500 animate-spin" />;
      case "waiting_input":
        return <AlertCircle className="w-3 h-3 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: ConnectedBank["status"]) => {
    switch (status) {
      case "connected":
        return "Conectado";
      case "error":
        return "Erro na conexão";
      case "syncing":
        return "Sincronizando...";
      case "waiting_input":
        return "Aguardando ação";
      default:
        return "";
    }
  };

  return (
    <div className="relative">
      {/* Botão Principal */}
      <button
        ref={buttonRef}
        onClick={() => setShowDropdown(!showDropdown)}
        className="group relative flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-green-600 via-green-700 to-emerald-600 hover:from-green-700 hover:via-green-800 hover:to-emerald-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] min-w-[160px]"
      >
        {/* Efeito shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></div>

        <CreditCard className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />

        <div className="flex flex-col items-start relative z-10">
          <span className="font-bold text-sm tracking-tight">
            {connectedBanks.length > 0 ? "Bancos" : "Conectar Banco"}
          </span>
          {connectedBanks.length > 0 && (
            <span className="text-xs text-green-100">
              {connectedBanks.length} conectado
              {connectedBanks.length > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {connectedBanks.length > 0 && (
          <div className="flex items-center gap-1 relative z-10">
            {connectedBanks.slice(0, 3).map((bank) => (
              <div key={bank.id} className="relative">
                {getStatusIcon(bank.status)}
              </div>
            ))}
            {connectedBanks.length > 3 && (
              <span className="text-xs text-green-100 ml-1">
                +{connectedBanks.length - 3}
              </span>
            )}
          </div>
        )}
      </button>

      {/* Dropdown Menu */}
      {showDropdown && (
        <>
          {/* Overlay transparente para fechar o dropdown */}
          <div
            className="fixed inset-0 z-[99998]"
            onClick={() => setShowDropdown(false)}
          />

          <div
            className="fixed w-80 bg-white rounded-2xl shadow-2xl border border-neutral-200/80 backdrop-blur-sm z-[99999] overflow-hidden transition-all duration-200 ease-out"
            style={{
              top: `${dropdownPosition.top}px`,
              right: `${dropdownPosition.right}px`,
            }}
          >
            {/* Header do dropdown */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 border-b border-green-100">
              <h3 className="font-bold text-green-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Conexões Bancárias
              </h3>
              <p className="text-sm text-green-700 mt-1">
                Gerencie suas conexões com instituições financeiras
              </p>
            </div>

            {/* Lista de bancos conectados */}
            {connectedBanks.length > 0 && (
              <div className="p-4 space-y-3">
                <h4 className="font-semibold text-neutral-800 text-sm">
                  Bancos Conectados ({connectedBanks.length})
                </h4>
                {connectedBanks.map((bank) => (
                  <div
                    key={bank.id}
                    className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                        style={{
                          backgroundColor: bank.primaryColor || "#6366f1",
                        }}
                      >
                        {bank.imageUrl ? (
                          <img
                            src={bank.imageUrl}
                            alt={bank.name}
                            className="w-6 h-6 rounded"
                          />
                        ) : (
                          <CreditCard className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-neutral-800 text-sm">
                          {bank.name}
                        </p>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(bank.status)}
                          <span className="text-xs text-neutral-600">
                            {getStatusText(bank.status)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {bank.lastSync && (
                        <span className="text-xs text-neutral-500">
                          {bank.lastSync.toLocaleDateString("pt-BR")}
                        </span>
                      )}

                      {/* Botões de ação */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleSync(bank.id)}
                          disabled={bank.status === "syncing"}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                          title="Sincronizar"
                        >
                          <RefreshCw
                            className={`w-3 h-3 ${
                              bank.status === "syncing" ? "animate-spin" : ""
                            }`}
                          />
                        </button>
                        <button
                          onClick={() => handleDisconnect(bank.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Desconectar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Botão para adicionar novo banco */}
            <div className="p-4 border-t border-neutral-100">
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center justify-center gap-3 p-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white rounded-xl font-semibold transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Conectar Novo Banco
                  </>
                )}
              </button>

              <p className="text-xs text-neutral-500 text-center mt-3">
                Conecte com segurança através do Pluggy
              </p>
            </div>

            {/* Informações sobre Pluggy */}
            <div className="bg-blue-50 p-4 border-t border-blue-100">
              <div className="flex items-start gap-3">
                <Link className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-semibold text-blue-900 text-sm">
                    Tecnologia Pluggy
                  </h5>
                  <p className="text-xs text-blue-700 mt-1">
                    Conexão segura e criptografada com mais de 200 instituições
                    financeiras no Brasil
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Widget Pluggy */}
      {showPluggyWidget && connectToken && (
        <PluggyWidget
          connectToken={connectToken}
          onSuccess={handlePluggySuccess}
          onError={handlePluggyError}
          onClose={handlePluggyClose}
        />
      )}
    </div>
  );
}
