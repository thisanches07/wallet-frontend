import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { MonthlySummaryData, useMonthlySummary } from "@/hooks/useMonthlySummary";
import { useSelectedMonth } from "./SelectedMonthContext";

interface SummaryContextType {
  summaryData: MonthlySummaryData[];
  loading: boolean;
  error: string | null;
  getMonthData: (month: number) => MonthlySummaryData | null;
  getIncomeComparison: (month: number) => {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    isPositive: boolean;
  };
  getExpenseComparison: (month: number) => {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    isPositive: boolean;
  };
  getBalanceComparison: (month: number) => {
    current: number;
    previous: number;
    change: number;
    changePercentage: number;
    isPositive: boolean;
  };
  refetch: () => Promise<void>;
  invalidateCache: () => void;
}

const SummaryContext = createContext<SummaryContextType | undefined>(undefined);

interface SummaryProviderProps {
  children: ReactNode;
}

export function SummaryProvider({ children }: SummaryProviderProps) {
  const { selectedYear } = useSelectedMonth();
  const [currentYear, setCurrentYear] = useState(selectedYear);
  
  const {
    summaryData,
    loading,
    error,
    getMonthData,
    getIncomeComparison,
    getExpenseComparison,
    getBalanceComparison,
    refetch: originalRefetch,
  } = useMonthlySummary(selectedYear);

  // Detectar mudança de ano
  useEffect(() => {
    if (currentYear !== selectedYear) {
      setCurrentYear(selectedYear);
    }
  }, [selectedYear, currentYear]);

  // Função para forçar um refetch
  const refetch = async () => {
    await originalRefetch();
  };

  // Função para invalidar cache - versão simples
  const invalidateCache = useCallback(() => {
    // Usar setTimeout para evitar chamadas em sequência muito rápida
    setTimeout(() => {
      originalRefetch();
    }, 100);
  }, [originalRefetch]);

  // Escutar eventos de mudanças em expenses e incomes
  useEffect(() => {
    const handleDataChange = () => {
      invalidateCache();
    };

    // Escutar apenas os eventos principais
    window.addEventListener("expenseAdded", handleDataChange);
    window.addEventListener("expenseDeleted", handleDataChange);
    window.addEventListener("incomeAdded", handleDataChange);
    window.addEventListener("incomeDeleted", handleDataChange);

    return () => {
      window.removeEventListener("expenseAdded", handleDataChange);
      window.removeEventListener("expenseDeleted", handleDataChange);
      window.removeEventListener("incomeAdded", handleDataChange);
      window.removeEventListener("incomeDeleted", handleDataChange);
    };
  }, [invalidateCache]);

  const value: SummaryContextType = {
    summaryData,
    loading,
    error,
    getMonthData,
    getIncomeComparison,
    getExpenseComparison,
    getBalanceComparison,
    refetch,
    invalidateCache,
  };

  return (
    <SummaryContext.Provider value={value}>
      {children}
    </SummaryContext.Provider>
  );
}

export function useSummary() {
  const context = useContext(SummaryContext);
  if (context === undefined) {
    throw new Error("useSummary must be used within a SummaryProvider");
  }
  return context;
}
