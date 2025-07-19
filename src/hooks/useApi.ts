// src/hooks/useApi.ts
import { authService } from "@/services/authService";
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";

export function useApi() {
  const { logout } = useAuth();

  const apiCall = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}) => {
      const response = await authService.apiCall<T>(endpoint, options);

      // Se retornar erro de autenticação, fazer logout automático
      if (!response.success && response.error?.includes("Unauthorized")) {
        logout();
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      if (!response.success) {
        throw new Error(response.error || "Erro na requisição");
      }

      return response.data;
    },
    [logout]
  );

  // Métodos específicos para sua API
  const api = useMemo(
    () => ({
      // Usuário
      getUserProfile: () => apiCall("/api/users/me"),
      updateUserProfile: (data: any) =>
        apiCall("/api/users/me", {
          method: "PUT",
          body: JSON.stringify(data),
        }),

      // Transações
      getTransactions: (filters?: { month?: number; year?: number }) => {
        const params = new URLSearchParams();
        if (filters?.month !== undefined)
          params.append("month", filters.month.toString());
        if (filters?.year !== undefined)
          params.append("year", filters.year.toString());
        const query = params.toString() ? `?${params.toString()}` : "";
        return apiCall(`/api/transactions${query}`);
      },
      getExpenses: (filters?: { month?: number; year?: number }) => {
        const params = new URLSearchParams();
        if (filters?.month !== undefined)
          params.append("month", filters.month.toString());
        if (filters?.year !== undefined)
          params.append("year", filters.year.toString());
        const query = params.toString() ? `?${params.toString()}` : "";
        return apiCall(`/api/expenses${query}`);
      },
      createExpense: (expense: any) =>
        apiCall("/api/expenses", {
          method: "POST",
          body: JSON.stringify(expense),
        }),
      deleteExpense: (id: number) => {
        return apiCall(`/api/expenses/${id}`, {
          method: "DELETE",
        });
      },
      createTransaction: (transaction: any) =>
        apiCall("/api/transactions", {
          method: "POST",
          body: JSON.stringify(transaction),
        }),
      updateTransaction: (id: string, transaction: any) =>
        apiCall(`/api/transactions/${id}`, {
          method: "PUT",
          body: JSON.stringify(transaction),
        }),
      deleteTransaction: (id: string) =>
        apiCall(`/api/transactions/${id}`, {
          method: "DELETE",
        }),

      // Receitas/Incomes
      getIncomes: (filters?: { month?: number; year?: number }) => {
        const params = new URLSearchParams();
        if (filters?.month !== undefined)
          params.append("month", filters.month.toString());
        if (filters?.year !== undefined)
          params.append("year", filters.year.toString());
        const query = params.toString() ? `?${params.toString()}` : "";
        return apiCall(`/api/incomes${query}`);
      },
      createIncome: (income: any) =>
        apiCall("/api/incomes", {
          method: "POST",
          body: JSON.stringify(income),
        }),
      deleteIncome: (id: number) => {
        return apiCall(`/api/incomes/${id}`, {
          method: "DELETE",
        });
      },
      // Categorias
      getCategories: () => apiCall("/api/categories"),

      // Relatórios
      getReports: (params?: any) => {
        const query = params
          ? `?${new URLSearchParams(params).toString()}`
          : "";
        return apiCall(`/api/reports${query}`);
      },

      // Metas
      getGoals: () => apiCall("/api/goals"),
      createGoal: (goal: any) =>
        apiCall("/api/goals", {
          method: "POST",
          body: JSON.stringify(goal),
        }),

      // Summary mensal
      getMonthlySummary: (year: number) => 
        apiCall(`/api/summary/monthly?year=${year}`),
      
      // Exportar dados mensais em Excel
      exportMonthlySummary: async (year: number, month: number) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/summary/export-monthly?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Obter o blob diretamente da resposta
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error('Erro ao exportar:', error);
          throw new Error("Erro ao exportar dados");
        }
      },

      // Exportar relatório completo por categoria
      exportMonthlySummaryByCategory: async (year: number, month: number) => {
        try {
          const token = localStorage.getItem('authToken');
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/summary/export-monthly-by-category?year=${year}&month=${month}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Obter o blob diretamente da resposta
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error('Erro ao exportar relatório completo:', error);
          throw new Error("Erro ao exportar relatório completo");
        }
      },
    }),
    [apiCall]
  );

  return api;
}

// Hook para usar em componentes específicos
export function useTransactions() {
  const api = useApi();

  return {
    getTransactions: api.getTransactions,
    createTransaction: api.createTransaction,
    updateTransaction: api.updateTransaction,
    deleteTransaction: api.deleteTransaction,
  };
}

export function useExpenses() {
  const api = useApi();

  return useMemo(
    () => ({
      getExpenses: (filters?: { month?: number; year?: number }) =>
        api.getExpenses(filters),
      createExpense: api.createExpense,
      deleteExpense: api.deleteExpense,
    }),
    [api]
  );
}

export function useIncomes() {
  const api = useApi();

  return useMemo(
    () => ({
      getIncomes: (filters?: { month?: number; year?: number }) =>
        api.getIncomes(filters),
      createIncome: api.createIncome,
      deleteIncome: api.deleteIncome,
    }),
    [api]
  );
}

export function useReports() {
  const api = useApi();

  return {
    getReports: api.getReports,
  };
}

export function useExport() {
  const api = useApi();

  return {
    exportMonthlySummary: api.exportMonthlySummary,
    exportMonthlySummaryByCategory: api.exportMonthlySummaryByCategory,
  };
}
