import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { Expense } from "@/types/expense";
import { filterByMonth } from "@/utils/dateUtils";
import { convertApiExpenseToExpense } from "@/utils/expenseUtils";
import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";
import { useAuth } from "./useAuth";

interface IncomeData {
  tipo: "recorrente" | "pontual";
  description: string;
  amount: number;
  category: "salario" | "freelance" | "investimento" | "bonus" | "outros";
}

interface MonthlyData {
  expenses: Expense[];
  incomes: IncomeData[];
  loading: boolean;
  error: string | null;
}

// Cache global para evitar requisições duplicadas
const dataCache = new Map<string, MonthlyData>();

export function useMonthlyData() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { getExpenses, getIncomes } = useApi();
  const { user, token } = useAuth();

  const cacheKey = `${selectedYear}-${selectedMonth}`;

  const [data, setData] = useState<MonthlyData>(() => {
    const cachedData = dataCache.get(cacheKey);
    if (cachedData && !cachedData.loading) {
      return cachedData;
    }
    // Inicializar sempre com loading: true para forçar carregamento inicial
    return {
      expenses: [],
      incomes: [],
      loading: true,
      error: null,
    };
  });

  const loadData = useCallback(async () => {
    // Não fazer requisição se não há usuário autenticado
    if (!user || !token) {
      const emptyData: MonthlyData = {
        expenses: [],
        incomes: [],
        loading: false,
        error: null,
      };
      setData(emptyData);
      return;
    }

    // Se já temos dados no cache e não estamos carregando, não fazer nova requisição
    const cachedData = dataCache.get(cacheKey);
    if (cachedData && !cachedData.loading) {
      setData(cachedData);
      return;
    }

    try {
      setData((prev) => ({ ...prev, loading: true, error: null }));

      // Fazer requisições em paralelo
      const [expensesResult, incomesResult] = await Promise.all([
        loadExpenses(),
        loadIncomes(),
      ]);

      const newData: MonthlyData = {
        expenses: expensesResult || [],
        incomes: incomesResult || [],
        loading: false,
        error: null,
      };

      // Atualizar cache
      dataCache.set(cacheKey, newData);
      setData(newData);
    } catch (error) {
      // Só tratar como erro se o usuário ainda está autenticado
      if (user && token) {
        const errorData: MonthlyData = {
          expenses: [],
          incomes: [],
          loading: false,
          error:
            error instanceof Error ? error.message : "Erro ao carregar dados",
        };

        dataCache.set(cacheKey, errorData);
        setData(errorData);
      } else {
        // Se não há usuário, apenas definir estado vazio silenciosamente
        const emptyData: MonthlyData = {
          expenses: [],
          incomes: [],
          loading: false,
          error: null,
        };
        setData(emptyData);
      }
    }
  }, [
    cacheKey,
    selectedMonth,
    selectedYear,
    user,
    token,
    getExpenses,
    getIncomes,
  ]);

  const loadExpenses = async (): Promise<Expense[]> => {
    try {
      // Tentar carregar despesas com filtro primeiro
      const apiExpenses = await getExpenses({
        month: selectedMonth,
        year: selectedYear,
      });

      // Se retornou null (usuário não autenticado), retornar array vazio
      if (apiExpenses === null) {
        return [];
      }

      if (Array.isArray(apiExpenses)) {
        return apiExpenses.map(convertApiExpenseToExpense);
      } else {
        // Fallback: buscar todas e filtrar localmente
        const allExpenses = await getExpenses();

        // Se retornou null, retornar array vazio
        if (allExpenses === null) {
          return [];
        }

        if (Array.isArray(allExpenses)) {
          const convertedExpenses = allExpenses.map(convertApiExpenseToExpense);
          return filterByMonth(convertedExpenses, selectedMonth, selectedYear);
        }
        return [];
      }
    } catch (error) {
      console.error("Erro ao carregar despesas:", error);
      return [];
    }
  };

  const loadIncomes = async (): Promise<IncomeData[]> => {
    try {
      // Tentar carregar receitas com filtro primeiro
      const apiIncomes = await getIncomes({
        month: selectedMonth,
        year: selectedYear,
      });

      // Se retornou null (usuário não autenticado), retornar array vazio
      if (apiIncomes === null) {
        return [];
      }

      if (Array.isArray(apiIncomes)) {
        return apiIncomes;
      } else {
        // Fallback: buscar todas e filtrar localmente
        const allIncomes = await getIncomes();

        // Se retornou null, retornar array vazio
        if (allIncomes === null) {
          return [];
        }

        if (Array.isArray(allIncomes)) {
          return filterByMonth(allIncomes, selectedMonth, selectedYear);
        }
        return [];
      }
    } catch (error) {
      console.error("Erro ao carregar receitas:", error);
      return [];
    }
  };

  // Invalidar cache quando novos dados são adicionados (apenas para o mês atual)
  const invalidateCurrentMonth = useCallback(() => {
    if (isCurrentMonth()) {
      const currentCacheKey = `${new Date().getFullYear()}-${new Date().getMonth()}`;
      dataCache.delete(currentCacheKey);
      loadData();
    }
  }, [isCurrentMonth, loadData]);

  // Carregar dados quando o mês muda
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Escutar eventos de novos dados apenas para o mês atual
  useEffect(() => {
    const handleExpenseAdded = () => invalidateCurrentMonth();
    const handleIncomeAdded = () => invalidateCurrentMonth();

    window.addEventListener("expenseAdded", handleExpenseAdded);
    window.addEventListener("incomeAdded", handleIncomeAdded);

    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded);
      window.removeEventListener("incomeAdded", handleIncomeAdded);
    };
  }, [invalidateCurrentMonth]);

  return {
    ...data,
    refresh: loadData,
    invalidateCurrentMonth,
  };
}
