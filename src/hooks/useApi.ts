// src/hooks/useApi.ts
import { authService } from "@/services/authService";
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";

export function useApi() {
  const { logout, user, token } = useAuth();

  const apiCall = useCallback(
    async <T>(endpoint: string, options: RequestInit = {}) => {
      // Se não há usuário ou token, retornar null silenciosamente
      if (!user || !token) {
        console.log(
          "🔒 Tentativa de requisição sem autenticação - ignorando:",
          endpoint
        );
        return null;
      }

      const response = await authService.apiCall<T>(endpoint, options);

      // Se retornar erro de autenticação, indicar que está offline
      if (
        !response.success &&
        (response.error?.includes("Unauthorized") ||
          response.error?.includes("Token ausente") ||
          response.error?.includes("não autenticado") ||
          response.error?.includes("Token inválido"))
      ) {
        console.log("🔐 Sessão inválida detectada - modo offline");
        throw new Error("OFFLINE: Sem conexão com o servidor");
      }

      if (!response.success) {
        throw new Error(response.error || "Erro na requisição");
      }

      return response.data;
    },
    [logout, user, token]
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
      getExpenses: async (filters?: { month?: number; year?: number }) => {
        const params = new URLSearchParams();

        // Adiciona filtros à query string se definidos
        if (filters?.month !== undefined) {
          params.append("month", filters.month.toString());
        }

        if (filters?.year !== undefined) {
          params.append("year", filters.year.toString());
        }

        // Monta a query string final
        const query = params.toString() ? `?${params.toString()}` : "";
        console.log("chamando API com query:", query);
        // Faz a chamada à API
        return await apiCall(`/api/expenses${query}`);
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
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/api/summary/export-monthly?year=${year}&month=${month}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Obter o blob diretamente da resposta
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error("Erro ao exportar:", error);
          throw new Error("Erro ao exportar dados");
        }
      },

      // Exportar relatório completo por category
      exportMonthlySummaryByCategory: async (year: number, month: number) => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/api/summary/export-monthly-by-category?year=${year}&month=${month}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Obter o blob diretamente da resposta
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error("Erro ao exportar relatório completo:", error);
          throw new Error("Erro ao exportar relatório completo");
        }
      },

      // Exportar evolução anual de receitas e despesas
      exportYearlyEvolution: async (year: number) => {
        try {
          const token = localStorage.getItem("authToken");
          const response = await fetch(
            `${
              process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"
            }/api/summary/export-yearly-evolution?year=${year}`,
            {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          // Obter o blob diretamente da resposta
          const blob = await response.blob();
          return blob;
        } catch (error) {
          console.error("Erro ao exportar evolução anual:", error);
          throw new Error("Erro ao exportar evolução anual");
        }
      },

      // Income Allocation APIs
      previewIncomeAllocation: (data: {
        fixedSalary: number;
        extraIncome: number;
        investmentsPercentage: number;
        expensesPercentage: number;
      }) =>
        apiCall("/api/users/income-allocation/preview", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      createIncomeAllocation: (data: {
        fixedSalary: number;
        extraIncome: number;
        investmentsPercentage: number;
        expensesPercentage: number;
      }) =>
        apiCall("/api/users/income-allocation", {
          method: "POST",
          body: JSON.stringify(data),
        }),

      syncPluggyItem: (itemId: string) =>
        apiCall(`/api/pluggy-items/${itemId}/transactions`, {
          method: "GET",
        }),

      getIncomeAllocation: () => apiCall("/api/users/income-allocation"),

      updateIncomeAllocation: (data: {
        fixedSalary: number;
        extraIncome: number;
        investmentsPercentage: number;
        expensesPercentage: number;
      }) =>
        apiCall("/api/users/income-allocation", {
          method: "PUT",
          body: JSON.stringify(data),
        }),
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

export function useIncomeAllocation() {
  const api = useApi();

  return useMemo(
    () => ({
      previewAllocation: api.previewIncomeAllocation,
      createAllocation: api.createIncomeAllocation,
      getAllocation: api.getIncomeAllocation,
      updateAllocation: api.updateIncomeAllocation,
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
