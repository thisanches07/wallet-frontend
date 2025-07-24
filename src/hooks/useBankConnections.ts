// src/hooks/useBankConnections.ts

import { PluggyAccount, PluggyConnection } from "@/services/pluggyService";
import type { Item } from "pluggy-sdk";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";
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
  const api = useApi();

  const mapPluggyItemToBank = useCallback(
    (pluggyItem: PluggyItem): ConnectedBank => {
      return {
        id: pluggyItem.itemId,
        name: pluggyItem.institution,
        status: "connected",
        lastSync: new Date(pluggyItem.connectedAt),
        imageUrl: pluggyItem.imageUrl,
        primaryColor: undefined,
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

  const loadConnections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("📡 Carregando bancos conectados da API...");
      const pluggyItems = await getPluggyItems();
      console.log("✅ Itens carregados:", pluggyItems);

      const banks = pluggyItems.map(mapPluggyItemToBank);
      setConnectedBanks(banks);
      console.log("✅ Bancos conectados carregados:", banks.length);
    } catch (err) {
      console.error("❌ Erro ao carregar conexões:", err);
      setError("Erro ao carregar conexões bancárias");
      setConnectedBanks([]);
    } finally {
      setLoading(false);
    }
  }, [getPluggyItems, mapPluggyItemToBank]);

  const handlePluggySuccess = useCallback(
    async (itemData: { item: Item }) => {
      console.log("✅ Conexão bem-sucedida:", itemData);

      try {
        await loadConnections();
        const newBank = mapItemToBank(itemData.item);

        if (pendingResolve) {
          pendingResolve(newBank);
          setPendingResolve(null);
        }
      } catch (error) {
        console.error("❌ Erro ao recarregar lista:", error);

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

    if (pendingResolve) {
      pendingResolve(null);
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
      const BACKEND_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

      console.log("🔄 Iniciando processo de conexão bancária...");
      const tokenRes = await fetch(`${BACKEND_URL}/api/pluggy/connect-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!tokenRes.ok) {
        throw new Error(`Erro ao obter token: ${tokenRes.status}`);
      }

      const tokenData = await tokenRes.json();
      const accessToken = tokenData.data.accessToken;

      if (!accessToken) {
        throw new Error("Token de acesso não recebido do backend");
      }

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
        await removePluggyItem(bankId);
        console.log("✅ Item removido do backend com sucesso");

        await loadConnections();
        console.log("✅ Lista recarregada após desconexão");
      } catch (error) {
        console.error("❌ Erro ao desconectar banco:", error);
        throw error;
      }
    },
    [removePluggyItem, loadConnections]
  );

  const syncBank = useCallback(
    async (bankId: string) => {
      try {
        setConnectedBanks((prev) =>
          prev.map((bank) =>
            bank.id === bankId ? { ...bank, status: "syncing" } : bank
          )
        );

        await api.syncPluggyItem(bankId);

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
    },
    [api]
  );

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
    showPluggyWidget,
    connectToken,
    handlePluggySuccess,
    handlePluggyError,
    handlePluggyClose,
  };
}
