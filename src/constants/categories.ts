// src/constants/categories.ts
export interface CategorySuggestion {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: "income" | "expense";
}

// Categorias de renda
export const INCOME_CATEGORIES: CategorySuggestion[] = [
  {
    id: "salario",
    name: "Salário",
    icon: "💼",
    color: "#10B981",
    type: "income",
  },
  {
    id: "freelance",
    name: "Freelance",
    icon: "💻",
    color: "#3B82F6",
    type: "income",
  },
  {
    id: "investimentos",
    name: "Investimentos",
    icon: "📈",
    color: "#8B5CF6",
    type: "income",
  },
  {
    id: "outros-renda",
    name: "Outros",
    icon: "💰",
    color: "#F59E0B",
    type: "income",
  },
];

// Categorias de despesas
export const EXPENSE_CATEGORIES: CategorySuggestion[] = [
  {
    id: "aluguel",
    name: "Aluguel",
    icon: "🏠",
    color: "#3B82F6",
    type: "expense",
  },
  {
    id: "transporte",
    name: "Transporte",
    icon: "🚗",
    color: "#8B5CF6",
    type: "expense",
  },
  {
    id: "alimentacao",
    name: "Alimentação",
    icon: "🍽️",
    color: "#10B981",
    type: "expense",
  },
  {
    id: "educacao",
    name: "Educação",
    icon: "📚",
    color: "#F59E0B",
    type: "expense",
  },
  {
    id: "lazer",
    name: "Lazer",
    icon: "🎮",
    color: "#EC4899",
    type: "expense",
  },
  {
    id: "outros-despesa",
    name: "Outros",
    icon: "📝",
    color: "#6B7280",
    type: "expense",
  },
];

// Todas as categorias
export const ALL_CATEGORIES: CategorySuggestion[] = [
  ...INCOME_CATEGORIES,
  ...EXPENSE_CATEGORIES,
];

// Utilitários para obter categorias
export const getCategoryByName = (
  name: string
): CategorySuggestion | undefined => {
  return ALL_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === name.toLowerCase()
  );
};

export const getCategoryIcon = (categoryName: string): string => {
  const category = getCategoryByName(categoryName);
  return category?.icon || "📝";
};

export const getCategoryColor = (categoryName: string): string => {
  const category = getCategoryByName(categoryName);
  return category?.color || "#6B7280";
};

export const getIncomeCategorySuggestions = (): string[] => {
  return INCOME_CATEGORIES.map((cat) => cat.name);
};

export const getExpenseCategorySuggestions = (): string[] => {
  return EXPENSE_CATEGORIES.map((cat) => cat.name);
};
