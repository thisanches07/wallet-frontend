// src/hooks/useCategories.ts
import { useCategories as useCategoriesContext } from "@/context/CategoriesContext";

export function useCategories() {
  return useCategoriesContext();
}

// Hook específico para formulários de despesas
export function useExpenseForm() {
  const { getExpenseCategories, loading, error } = useCategories();
  const categories = getExpenseCategories();

  return {
    categories,
    loading,
    error,
    hasCategories: categories.length > 0,
  };
}

// Hook específico para formulários de receitas
export function useIncomeForm() {
  const { getIncomeCategories, loading, error } = useCategories();
  const categories = getIncomeCategories();

  return {
    categories,
    loading,
    error,
    hasCategories: categories.length > 0,
  };
}
