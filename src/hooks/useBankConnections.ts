import { PluggyAccount, PluggyConnection } from "@/services/pluggyService";
import type { Item } from "pluggy-sdk";
import { useCallback, useEffect, useState } from "react";
import { PluggyItem, usePluggyItems } from "./usePluggyItems";

export interface ConnectedBank {
  id: string;
  name: string;
  status: "connected" | "error" | "syncing" | "waiting_input";
  lastSync?: Date;
  imageUrl?: string;
  primaryColor?: string;
  accounts?: PluggyAccount[];
  connection?: PluggyConnection;
  item?: Item;
}

export function useBankConnections() {
  const [connectedBanks, setConnectedBanks] = useState<ConnectedBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPluggyWidget, setShowPluggyWidget] = useState(false);
  const [connectToken, setConnectToken] = useState<string>("");
  const [pendingResolve, setPendingResolve] = useState<
    ((bank: ConnectedBank | null) => void) | null
  >(null);
  const [pendingReject, setPendingReject] = useState<
    ((error: Error) => void) | null
  >(null);

  const { removePluggyItem, getPluggyItems } = usePluggyItems();

  const mapPluggyConnectionToBank = useCallback(
    (
      connection: PluggyConnection,
      accounts?: PluggyAccount[]
    ): ConnectedBank => {
      let status: ConnectedBank["status"] = "connected";

      switch (connection.status) {
        case "UPDATED":
          status = "connected";
          break;
        case "UPDATING":
        case "MERGING":
          status = "syncing";
          break;
        case "WAITING_USER_INPUT":
          status = "waiting_input";
          break;
        case "ERROR":
          status = "error";
          break;
      }

      return {
        id: connection.id,
        name: connection.connector.name,
        status,
        lastSync: connection.lastUpdatedAt
          ? new Date(connection.lastUpdatedAt)
          : undefined,
        imageUrl: connection.connector.imageUrl,
        primaryColor: connection.connector.primaryColor,
        accounts,
        connection,
      };
    },
    []
  );

  const mapItemToBank = useCallback((item: Item): ConnectedBank => {
    return {
      id: item.id,
      name: item.connector.name,
      status: "connected",
      lastSync: item.lastUpdatedAt ? new Date(item.lastUpdatedAt) : new Date(),
      imageUrl: item.connector.imageUrl,
      primaryColor: item.connector.primaryColor,
      item,
    };
  }, []);

  const mapPluggyItemToBank = useCallback(
    (pluggyItem: PluggyItem): ConnectedBank => {
      return {
        id: pluggyItem.itemId,
        name: pluggyItem.institution,
        status: "connected",
        lastSync: new Date(pluggyItem.connectedAt),
        imageUrl: pluggyItem.imageUrl, // Agora vem da API backend
        primaryColor: undefined, // API não retorna primaryColor ainda
      };
    },
    []
  );

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Carregando bancos conectados da API...");

      // Buscar itens Pluggy conectados da API
      const pluggyItems = await getPluggyItems();
      console.log("✅ Itens carregados:", pluggyItems);

      // Mapear para ConnectedBank
      const banks = pluggyItems.map(mapPluggyItemToBank);
      setConnectedBanks(banks);

      console.log("✅ Bancos conectados carregados:", banks.length);
    } catch (err) {
      console.error("❌ Erro ao carregar conexões:", err);
      setError("Erro ao carregar conexões bancárias");
      // Em caso de erro, manter lista vazia
      setConnectedBanks([]);
    } finally {
      setLoading(false);
    }
  }, [getPluggyItems, mapPluggyItemToBank]);

  const handlePluggySuccess = useCallback(
    async (itemData: { item: Item }) => {
      console.log("✅ Conexão bem-sucedida:", itemData);

      try {
        // Recarregar a lista de bancos da API para garantir sincronização
        console.log("🔄 Recarregando lista de bancos...");
        await loadConnections();

        const newBank = mapItemToBank(itemData.item);

        if (pendingResolve) {
          pendingResolve(newBank);
          setPendingResolve(null);
        }
      } catch (error) {
        console.error("❌ Erro ao recarregar lista:", error);

        // Fallback: adicionar localmente se falhar o reload
        const newBank = mapItemToBank(itemData.item);
        setConnectedBanks((prev) => [...prev, newBank]);

        if (pendingResolve) {
          pendingResolve(newBank);
          setPendingResolve(null);
        }
      }

      setShowPluggyWidget(false);
      setConnectToken("");
    },
    [mapItemToBank, pendingResolve, loadConnections]
  );

  const handlePluggyError = useCallback(
    (error: any) => {
      console.error("❌ Erro no Pluggy:", error);

      if (pendingReject) {
        pendingReject(new Error("Erro ao conectar com o banco"));
        setPendingReject(null);
      }

      setShowPluggyWidget(false);
      setConnectToken("");
    },
    [pendingReject]
  );

  const handlePluggyClose = useCallback(() => {
    console.log("🚪 Widget fechado pelo usuário");

    // Em vez de rejeitar, resolve com null para indicar cancelamento
    if (pendingResolve) {
      pendingResolve(null); // Resolve com null para indicar cancelamento
      setPendingResolve(null);
    }
    if (pendingReject) {
      setPendingReject(null);
    }

    setShowPluggyWidget(false);
    setConnectToken("");
  }, [pendingResolve, pendingReject]);

  const connectBank = useCallback(async (): Promise<ConnectedBank | null> => {
    try {
      // URL base do seu backend
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      console.log("🔄 Iniciando processo de conexão bancária...");
      console.log("📡 Backend URL:", BACKEND_URL);

      // 1. Obter token de conexão através do seu backend
      const tokenRes = await fetch(`${BACKEND_URL}/api/pluggy/connect-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // Adicione headers de autenticação se necessário
          // "Authorization": `Bearer ${token}`
        },
      });

      if (!tokenRes.ok) {
        throw new Error(`Erro ao obter token: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      console.log("🔑 Token recebido:", tokenData);

      const accessToken = tokenData.data.accessToken;
      console.log(
        "✅ Access Token:",
        accessToken ? "Recebido" : "ERRO - Token vazio"
      );

      if (!accessToken) {
        throw new Error("Token de acesso não recebido do backend");
      }

      // 2. Configurar o widget Pluggy
      console.log("🚀 Abrindo Pluggy Connect Widget...");

      return new Promise<ConnectedBank | null>((resolve, reject) => {
        setPendingResolve(() => resolve);
        setPendingReject(() => reject);
        setConnectToken(accessToken);
        setShowPluggyWidget(true);
      });
    } catch (error) {
      console.error("💥 Erro no processo de conexão:", error);
      throw error;
    }
  }, []);

  const disconnectBank = useCallback(
    async (bankId: string) => {
      try {
        console.log("🗑️ Desvinculando banco:", bankId);

        // Chamar API backend para remover o item Pluggy
        await removePluggyItem(bankId);
        console.log("✅ Item removido do backend com sucesso");

        // Recarregar lista da API para garantir sincronização
        console.log("🔄 Recarregando lista de bancos...");
        await loadConnections();
        console.log("✅ Lista recarregada após desconexão");
      } catch (error) {
        console.error("❌ Erro ao desconectar banco:", error);
        throw error;
      }
    },
    [removePluggyItem, loadConnections]
  );

  const syncBank = useCallback(async (bankId: string) => {
    try {
      setConnectedBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId ? { ...bank, status: "syncing" } : bank
        )
      );

      // Simular sincronização
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setConnectedBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId
            ? { ...bank, status: "connected", lastSync: new Date() }
            : bank
        )
      );
    } catch (error) {
      console.error("Erro ao sincronizar banco:", error);
      setConnectedBanks((prev) =>
        prev.map((bank) =>
          bank.id === bankId ? { ...bank, status: "error" } : bank
        )
      );
      throw error;
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  return {
    connectedBanks,
    loading,
    error,
    connectBank,
    disconnectBank,
    syncBank,
    refreshConnections: loadConnections,
    // Estados do widget
    showPluggyWidget,
    connectToken,
    handlePluggySuccess,
    handlePluggyError,
    handlePluggyClose,
  };
}
