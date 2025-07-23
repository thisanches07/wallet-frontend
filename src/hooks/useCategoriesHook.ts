// src/hooks/useCategories.ts
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/constants/categories";

export function useCategories() {
  // Retorna as categorias fixas, sem chamadas à API
  return {
    categories: [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES],
    loading: false,
    error: null,
    hasCategories: true,
    getExpenseCategories: () => EXPENSE_CATEGORIES,
    getIncomeCategories: () => INCOME_CATEGORIES,
    getCategoryById: (id: string) =>
      [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(
        (cat) => cat.id === id
      ),
  };
}

// Hook específico para formulários de despesas
export function useExpenseForm() {
  const categories = EXPENSE_CATEGORIES;

  return {
    categories,
    loading: false,
    error: null,
    hasCategories: categories.length > 0,
  };
}

// Hook específico para formulários de receitas
export function useIncomeForm() {
  const categories = INCOME_CATEGORIES;

  return {
    categories,
    loading: false,
    error: null,
    hasCategories: categories.length > 0,
  };
}
