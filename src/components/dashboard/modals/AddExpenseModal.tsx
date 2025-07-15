import { useCategories } from "@/context/CategoriesContext";
import { useExpenses } from "@/hooks/useApi";
import { Calendar, DollarSign, Receipt, Tag, X } from "lucide-react";
import { useState } from "react";

interface AddExpenseModalProps {
  onClose: () => void;
  onAdd: (expense: ExpenseData) => void;
}

type ApiExpense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    type: string;
  };
};

interface ExpenseData {
  id?: string;
  descricao: string;
  categoria: string; // ID da categoria
  valor: number;
  data: string;
  tipo: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
  categoriaInfo?: {
    id: string;
    name: string;
    icon?: string;
    color?: string;
    type?: string;
  };
}

// Categorias fallback caso não consiga carregar do backend
const fallbackCategories = [
  {
    id: "moradia",
    name: "Moradia",
    icon: "🏠",
    color: "#3B82F6",
    type: "expense" as const,
  },
  {
    id: "transporte",
    name: "Transporte",
    icon: "🚗",
    color: "#8B5CF6",
    type: "expense" as const,
  },
  {
    id: "alimentacao",
    name: "Alimentação",
    icon: "🍔",
    color: "#10B981",
    type: "expense" as const,
  },
  {
    id: "lazer",
    name: "Lazer",
    icon: "🎮",
    color: "#EC4899",
    type: "expense" as const,
  },
  {
    id: "saude",
    name: "Saúde",
    icon: "⚕️",
    color: "#EF4444",
    type: "expense" as const,
  },
  {
    id: "educacao",
    name: "Educação",
    icon: "📚",
    color: "#6366F1",
    type: "expense" as const,
  },
  {
    id: "outros",
    name: "Outros",
    icon: "📝",
    color: "#6B7280",
    type: "expense" as const,
  },
];

export function AddExpenseModal({ onClose, onAdd }: AddExpenseModalProps) {
  const { createExpense } = useExpenses();
  const {
    getExpenseCategories,
    loading: categoriesLoading,
    error: categoriesError,
    getCategoryById,
  } = useCategories();
  const apiCategories = getExpenseCategories();

  // Usar categorias da API ou fallback
  const categories =
    apiCategories.length > 0 ? apiCategories : fallbackCategories;

  const [formData, setFormData] = useState<ExpenseData>({
    descricao: "",
    categoria: "", // Inicialmente vazio
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    tipo: "unico",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper para obter informações da categoria selecionada
  const getSelectedCategoryInfo = () => {
    if (!formData.categoria) return null;
    return categories.find((cat) => cat.id === formData.categoria) || null;
  };

  // Função para converter API response para formato interno
  // API retorna: { id, description, amount, date, categoryId, user, category: { id, name, type } }
  // Convertemos para: { id, descricao, categoria, valor, data, tipo, categoriaInfo }
  const convertApiExpenseToExpense = (apiExpense: ApiExpense): ExpenseData => {
    // Buscar informações adicionais da categoria (ícone e cor) das categorias locais
    const localCategory = categories.find(
      (cat) =>
        cat.name.toLowerCase() === apiExpense.category.name.toLowerCase() ||
        cat.id === apiExpense.category.id.toString()
    );

    return {
      id: apiExpense.id.toString(),
      descricao: apiExpense.description,
      categoria: apiExpense.category.name,
      valor: apiExpense.amount,
      data: apiExpense.date.split("T")[0], // Converter ISO date para YYYY-MM-DD
      tipo: "unico",
      categoriaInfo: {
        id: apiExpense.category.id.toString(),
        name: apiExpense.category.name,
        icon: localCategory?.icon || "📝",
        color: localCategory?.color || "#6B7280",
        type: apiExpense.category.type,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!formData.categoria) {
      newErrors.categoria = "Categoria é obrigatória";
    }

    if (!formData.valor || formData.valor <= 0) {
      newErrors.valor = "Valor deve ser maior que zero";
    }

    if (!formData.data) {
      newErrors.data = "Data é obrigatória";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para a API
      const selectedCategory = getSelectedCategoryInfo();
      const apiExpenseData = {
        description: formData.descricao,
        amount: formData.valor,
        date: new Date(formData.data).toISOString(),
        categoryId: selectedCategory?.id
          ? parseInt(selectedCategory.id)
          : parseInt(formData.categoria), // Fallback para o ID da categoria
      };

      // Criar na API
      const createdExpense = (await createExpense(
        apiExpenseData
      )) as ApiExpense;

      // Converter resposta da API para formato interno
      const newExpense = convertApiExpenseToExpense(createdExpense);

      // Chamar callback para atualizar a lista no componente pai
      onAdd(newExpense);
      window.dispatchEvent(
        new CustomEvent("expenseAdded", { detail: newExpense })
      );

      // Fechar modal
      onClose();
    } catch (error) {
      console.error("Erro ao criar despesa:", error);

      // Em caso de erro, criar localmente como fallback
      const selectedCategory = getSelectedCategoryInfo();
      const fallbackExpense: ExpenseData = {
        id: Date.now().toString(),
        descricao: formData.descricao,
        categoria: selectedCategory?.name || formData.categoria,
        valor: formData.valor,
        data: formData.data,
        tipo: formData.tipo,
        recorrencia: formData.recorrencia,
        ...(selectedCategory && { categoriaInfo: selectedCategory }),
      };

      onAdd(fallbackExpense);
      window.dispatchEvent(
        new CustomEvent("expenseAdded", { detail: fallbackExpense })
      );

      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
      style={{ zIndex: 9999 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Adicionar Gasto</h2>
                <p className="text-red-100 text-sm">
                  Registre uma nova despesa
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form - scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            id="expense-form"
            className="p-6 space-y-6"
          >
            {/* Descrição */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                Descrição
              </label>
              <input
                type="text"
                value={formData.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Ex: Aluguel, Supermercado, Gasolina..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                  errors.descricao
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.descricao && (
                <p className="text-red-500 text-xs">{errors.descricao}</p>
              )}
            </div>

            {/* Categoria */}
            <div className="space-y-3">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <Tag className="w-4 h-4" />
                Categoria
                {categoriesLoading && (
                  <span className="inline-flex items-center gap-1 text-xs text-blue-600">
                    <div className="w-3 h-3 border border-blue-300 border-t-blue-600 rounded-full animate-spin"></div>
                    Carregando...
                  </span>
                )}
                {!categoriesLoading && apiCategories.length > 0 && (
                  <span className="text-xs text-green-600">
                    ✓ {apiCategories.length} categorias
                  </span>
                )}
                {!categoriesLoading && apiCategories.length === 0 && (
                  <span className="text-xs text-amber-600">
                    ⚠️ Modo offline
                  </span>
                )}
              </label>
              <div
                className={`grid grid-cols-2 gap-2 ${
                  errors.categoria
                    ? "ring-2 ring-red-500 ring-opacity-20 rounded-xl p-2"
                    : ""
                }`}
              >
                {categories.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => handleInputChange("categoria", category.id)}
                    className={`p-3 text-xs font-medium border rounded-xl transition-all ${
                      formData.categoria === category.id
                        ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500 ring-opacity-20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                    disabled={categoriesLoading}
                  >
                    {category.icon} {category.name}
                  </button>
                ))}
              </div>
              {errors.categoria && (
                <p className="text-red-500 text-xs">{errors.categoria}</p>
              )}
              {!categoriesLoading && apiCategories.length === 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-2">
                  ⚠️ Não foi possível carregar as categorias do servidor. Usando
                  categorias padrão.
                </p>
              )}
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <DollarSign className="w-4 h-4" />
                  Valor
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    R$
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.valor > 0 ? formData.valor : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === "" ? 0 : parseFloat(value);
                      handleInputChange("valor", numValue);
                    }}
                    placeholder="0,00"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                      errors.valor
                        ? "border-red-500 bg-red-50"
                        : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.valor && (
                  <p className="text-red-500 text-xs">{errors.valor}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Calendar className="w-4 h-4" />
                  Data
                </label>
                <input
                  type="date"
                  value={formData.data}
                  onChange={(e) => handleInputChange("data", e.target.value)}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                    errors.data ? "border-red-500 bg-red-50" : "border-gray-300"
                  }`}
                />
                {errors.data && (
                  <p className="text-red-500 text-xs">{errors.data}</p>
                )}
              </div>
            </div>

            {/* Tipo de Gasto */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Gasto
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "unico")}
                  className={`flex-1 p-3 text-sm font-medium border rounded-xl transition-all ${
                    formData.tipo === "unico"
                      ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500 ring-opacity-20"
                      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  💸 Gasto Único
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "recorrente")}
                  className={`flex-1 p-3 text-sm font-medium border rounded-xl transition-all ${
                    formData.tipo === "recorrente"
                      ? "bg-orange-50 text-orange-700 border-orange-300 ring-2 ring-orange-500 ring-opacity-20"
                      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  🔄 Recorrente
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Fixed Buttons - outside the scrollable area */}
        <div className="border-t bg-gray-50 p-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-2xl font-medium transition-colors text-lg"
            >
              Cancelar
            </button>
            <button
              type="submit"
              form="expense-form"
              disabled={isSubmitting || categoriesLoading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                "Adicionar Gasto"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
