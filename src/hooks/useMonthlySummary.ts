import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";
import { useAuth } from "./useAuth";

export interface MonthlySummaryData {
  year: number;
  month: number;
  totalIncomes: number;
  totalExpenses: number;
  balance: number;
}

export interface ComparisonData {
  current: number;
  previous: number;
  change: number;
  changePercentage: number;
  isPositive: boolean;
}

export function useMonthlySummary(year: number) {
  const [summaryData, setSummaryData] = useState<MonthlySummaryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const api = useApi();
  const { user, token } = useAuth();

  const fetchSummary = useCallback(async () => {
    // Não fazer requisição se não há usuário autenticado
    if (!user || !token) {
      setLoading(false);
      setSummaryData([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.getMonthlySummary(year);

      // Se a resposta for null (usuário não autenticado), apenas parar silenciosamente
      if (response === null) {
        setLoading(false);
        return;
      }

      setSummaryData(response as MonthlySummaryData[]);
    } catch (err) {
      // Só logar erro se não for problema de autenticação
      if (user && token) {
        setError(err instanceof Error ? err.message : "Erro ao buscar dados");
        console.error("Erro ao buscar summary mensal:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [api, year, user, token]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Função para obter dados de um mês específico
  const getMonthData = useCallback(
    (month: number): MonthlySummaryData | null => {
      return summaryData.find((data) => data.month === month + 1) || null;
    },
    [summaryData]
  );

  // Função para comparar com o mês anterior
  const getComparison = useCallback(
    (
      month: number,
      type: "totalIncomes" | "totalExpenses" | "balance"
    ): ComparisonData => {
      const currentData = getMonthData(month);
      const previousData = getMonthData(month - 1);

      const current = currentData?.[type] || 0;
      const previous = previousData?.[type] || 0;
      const change = current - previous;
      const changePercentage =
        previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;

      return {
        current,
        previous,
        change,
        changePercentage,
        isPositive: change >= 0,
      };
    },
    [getMonthData]
  );

  // Funções específicas para cada tipo
  const getIncomeComparison = useCallback(
    (month: number) => getComparison(month, "totalIncomes"),
    [getComparison]
  );
  const getExpenseComparison = useCallback(
    (month: number) => getComparison(month, "totalExpenses"),
    [getComparison]
  );
  const getBalanceComparison = useCallback(
    (month: number) => getComparison(month, "balance"),
    [getComparison]
  );

  // Função para refetch (útil quando houver mudanças) - agora usa o fetchSummary memoizado
  const refetch = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  return {
    summaryData,
    loading,
    error,
    getMonthData,
    getIncomeComparison,
    getExpenseComparison,
    getBalanceComparison,
    refetch,
  };
}
