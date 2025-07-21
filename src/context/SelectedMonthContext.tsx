import { createContext, ReactNode, useContext, useState } from "react";

interface SelectedMonthContextType {
  selectedMonth: number;
  selectedYear: number;
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  getSelectedDate: () => { month: number; year: number };
  isCurrentMonth: () => boolean;
}

const SelectedMonthContext = createContext<
  SelectedMonthContextType | undefined
>(undefined);

interface SelectedMonthProviderProps {
  children: ReactNode;
}

export function SelectedMonthProvider({
  children,
}: SelectedMonthProviderProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number>(
    currentDate.getMonth()
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    currentDate.getFullYear()
  );

  const getSelectedDate = () => ({
    month: selectedMonth,
    year: selectedYear,
  });

  const isCurrentMonth = () => {
    const current = new Date();
    return (
      selectedMonth === current.getMonth() &&
      selectedYear === current.getFullYear()
    );
  };

  const value: SelectedMonthContextType = {
    selectedMonth,
    selectedYear,
    setSelectedMonth,
    setSelectedYear,
    getSelectedDate,
    isCurrentMonth,
  };

  return (
    <SelectedMonthContext.Provider value={value}>
      {children}
    </SelectedMonthContext.Provider>
  );
}

export function useSelectedMonth() {
  const context = useContext(SelectedMonthContext);
  if (context === undefined) {
    throw new Error(
      "useSelectedMonth must be used within a SelectedMonthProvider"
    );
  }
  return context;
}
