// src/context/CategoriesContext.tsx (Novo sistema sem API)
import {
  ALL_CATEGORIES,
  CategorySuggestion,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
} from "@/constants/categories";
import React, { createContext, useContext } from "react";

interface CategoriesContextProps {
  categories: CategorySuggestion[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  getCategoryById: (id: string) => CategorySuggestion | undefined;
  getExpenseCategories: () => CategorySuggestion[];
  getIncomeCategories: () => CategorySuggestion[];
}

const CategoriesContext = createContext<CategoriesContextProps>(
  {} as CategoriesContextProps
);

export const CategoriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // Agora usamos as categorys fixas ao invés de chamadas à API
  const categories = ALL_CATEGORIES;
  const loading = false;
  const error = null;

  const refreshCategories = async () => {
    // Não faz nada, pois as categorys são fixas
    return Promise.resolve();
  };

  const getCategoryById = (id: string): CategorySuggestion | undefined => {
    return categories.find((category) => category.id === id);
  };

  const getExpenseCategories = (): CategorySuggestion[] => {
    return EXPENSE_CATEGORIES;
  };

  const getIncomeCategories = (): CategorySuggestion[] => {
    return INCOME_CATEGORIES;
  };

  const value: CategoriesContextProps = {
    categories,
    loading,
    error,
    refreshCategories,
    getCategoryById,
    getExpenseCategories,
    getIncomeCategories,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error(
      "useCategories deve ser usado dentro de um CategoriesProvider"
    );
  }
  return context;
};
