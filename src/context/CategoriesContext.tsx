// src/context/CategoriesContext.tsx
import { useAuth } from "@/hooks/useAuth";
import { authService } from "@/services/authService";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  type?: "expense" | "income";
  createdAt?: string;
  updatedAt?: string;
}

interface CategoriesContextProps {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refreshCategories: () => Promise<void>;
  getCategoryById: (id: string) => Category | undefined;
  getExpenseCategories: () => Category[];
  getIncomeCategories: () => Category[];
}

const CategoriesContext = createContext<CategoriesContextProps>(
  {} as CategoriesContextProps
);

export const CategoriesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user, token } = useAuth();

  const fetchCategories = async () => {
    if (!token) {
      console.log("❌ Sem token para carregar categorias");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Carregando categorias...");
      console.log("🔑 Token:", token ? "✅ Existe" : "❌ Não existe");

      const response = await authService.apiCall<Category[]>("/api/categories");
      console.log("📦 Response categorias:", response);

      if (response.success && response.data) {
        setCategories(response.data);
        console.log(
          "✅ Categorias carregadas:",
          response.data.length,
          "categorias"
        );
      } else {
        throw new Error(response.error || "Erro ao carregar categorias");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erro desconhecido";
      setError(errorMessage);
      console.error("❌ Erro ao carregar categorias:", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Carregar categorias automaticamente quando o usuário fizer login
  useEffect(() => {
    console.log("🔄 CategoriesContext useEffect:", {
      user: !!user,
      token: !!token,
    });
    if (user && token) {
      console.log("✅ Iniciando carregamento de categorias");
      fetchCategories();
    } else {
      // Limpar categorias quando logout
      console.log("🧹 Limpando categorias (sem user/token)");
      setCategories([]);
      setError(null);
    }
  }, [user, token]);

  const refreshCategories = async () => {
    await fetchCategories();
  };

  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((category) => category.id === id);
  };

  const getExpenseCategories = (): Category[] => {
    return categories.filter(
      (category) => category.type === "expense" || !category.type
    );
  };

  const getIncomeCategories = (): Category[] => {
    return categories.filter((category) => category.type === "income");
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
