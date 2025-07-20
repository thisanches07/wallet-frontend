import { ReactNode } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: ReactNode;
}

export function Portal({ children }: PortalProps) {
  // Verifica se estamos no lado do cliente
  if (typeof window === "undefined") {
    return null;
  }

  // Renderiza o conteúdo no body do documento
  return createPortal(children, document.body);
}
