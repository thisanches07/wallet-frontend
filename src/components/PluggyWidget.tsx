import dynamic from "next/dynamic";
import type { Item } from "pluggy-sdk";
import { useCallback, useState } from "react";
import type { PluggyConnect as PluggyConnectType } from "react-pluggy-connect";

const PluggyConnect = dynamic(
  () =>
    (import("react-pluggy-connect") as any).then(
      (mod: any) => mod.PluggyConnect
    ),
  { ssr: false }
) as typeof PluggyConnectType;

interface PluggyWidgetProps {
  connectToken: string;
  onSuccess: (data: { item: Item }) => void;
  onError: (error: any) => void;
  onClose: () => void;
}

export function PluggyWidget({
  connectToken,
  onSuccess,
  onError,
  onClose,
}: PluggyWidgetProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleSuccess = useCallback(
    (itemData: { item: Item }) => {
      console.log("✅ Conexão bem-sucedida no widget:", itemData);
      setIsVisible(false);
      onSuccess(itemData);
    },
    [onSuccess]
  );

  const handleError = useCallback(
    (error: any) => {
      console.error("❌ Erro no widget Pluggy:", error);
      setIsVisible(false);
      onError(error);
    },
    [onError]
  );

  const handleClose = useCallback(() => {
    console.log("🚪 Widget fechado pelo usuário");
    setIsVisible(false);
    onClose();
  }, [onClose]);

  if (!isVisible || !connectToken) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[99999] bg-black bg-opacity-50 flex items-center justify-center">
      <PluggyConnect
        connectToken={connectToken}
        onSuccess={handleSuccess}
        onError={handleError}
        onClose={handleClose}
      />
    </div>
  );
}
