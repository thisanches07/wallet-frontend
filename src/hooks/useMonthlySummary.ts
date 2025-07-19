import { useCallback, useEffect, useState } from "react";
import { useApi } from "./useApi";

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

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.getMonthlySummary(year);
      setSummaryData(response as MonthlySummaryData[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao buscar dados");
      console.error("Erro ao buscar summary mensal:", err);
    } finally {
      setLoading(false);
    }
  }, [api, year]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Função para obter dados de um mês específico
  const getMonthData = useCallback((month: number): MonthlySummaryData | null => {
    return summaryData.find(data => data.month === month + 1) || null;
  }, [summaryData]);

  // Função para comparar com o mês anterior
  const getComparison = useCallback((month: number, type: 'totalIncomes' | 'totalExpenses' | 'balance'): ComparisonData => {
    const currentData = getMonthData(month);
    const previousData = getMonthData(month - 1);

    const current = currentData?.[type] || 0;
    const previous = previousData?.[type] || 0;
    const change = current - previous;
    const changePercentage = previous !== 0 ? (change / Math.abs(previous)) * 100 : 0;

    return {
      current,
      previous,
      change,
      changePercentage,
      isPositive: change >= 0,
    };
  }, [getMonthData]);

  // Funções específicas para cada tipo
  const getIncomeComparison = useCallback((month: number) => getComparison(month, 'totalIncomes'), [getComparison]);
  const getExpenseComparison = useCallback((month: number) => getComparison(month, 'totalExpenses'), [getComparison]);
  const getBalanceComparison = useCallback((month: number) => getComparison(month, 'balance'), [getComparison]);

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
