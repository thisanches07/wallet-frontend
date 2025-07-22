import { API_CONFIG } from "@/lib/firebase";
import { useCallback } from "react";
import { useAuth } from "./useAuth";

export interface PluggyItem {
  id: number;
  itemId: string;
  institution: string;
  imageUrl: string;
  connectedAt: string;
}

export interface PluggyAccount {
  id: string;
  name: string;
  balance: number;
  currency: string;
  type: string;
  subtype?: string;
  number?: string;
  itemId: string;
}

export interface AddPluggyItemRequest {
  itemId: string;
  institution: string;
  imageUrl: string;
}

export function usePluggyItems() {
  const { token, user } = useAuth();

  const makeRequest = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
      if (!user || !token) {
        throw new Error("Usuário não autenticado");
      }

      const baseUrl = API_CONFIG.backendUrl;

      const response = await fetch(`${baseUrl}${endpoint}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          // Se não conseguir fazer parse do JSON, usar mensagem padrão
        }
        throw new Error(errorMessage);
      }

      // Para respostas 204 (No Content), retornar null
      if (response.status === 204) {
        return null as T;
      }

      return response.json();
    },
    [token, user]
  );

  const getPluggyItems = useCallback(async (): Promise<PluggyItem[]> => {
    try {
      const data = await makeRequest<{ data: PluggyItem[] }>(
        "/api/pluggy-items"
      );
      return data?.data || [];
    } catch (error) {
      console.error("❌ Erro ao buscar itens Pluggy:", error);
      throw error;
    }
  }, [makeRequest]);

  const addPluggyItem = useCallback(
    async (
      itemId: string,
      institution: string,
      imageUrl: string
    ): Promise<PluggyItem> => {
      try {
        const payload: AddPluggyItemRequest = { itemId, institution, imageUrl };
        const data = await makeRequest<{ data: PluggyItem }>(
          "/api/pluggy-items",
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );
        return data.data;
      } catch (error) {
        console.error("❌ Erro ao adicionar item Pluggy:", error);
        throw error;
      }
    },
    [makeRequest]
  );

  const removePluggyItem = useCallback(
    async (itemId: string): Promise<void> => {
      try {
        await makeRequest<void>(`/api/pluggy-items/${itemId}`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error("❌ Erro ao remover item Pluggy:", error);
        throw error;
      }
    },
    [makeRequest]
  );

  const getAccounts = useCallback(
    async (itemId: string): Promise<PluggyAccount[]> => {
      try {
        const data = await makeRequest<{ data: PluggyAccount[] }>(
          `/api/pluggy-items/${itemId}/accounts`
        );
        return data?.data || [];
      } catch (error) {
        console.error("❌ Erro ao buscar contas do item Pluggy:", error);
        throw error;
      }
    },
    [makeRequest]
  );

  return {
    getPluggyItems,
    addPluggyItem,
    removePluggyItem,
    getAccounts,
  };
}
