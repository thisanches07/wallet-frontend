import { useCategories } from "@/context/CategoriesContext";
import { useIncomes } from "@/hooks/useApi";
import { Calendar, DollarSign, Tag, X } from "lucide-react";
import { useState } from "react";

type ApiIncome = {
  id: number;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  category: {
    id: number;
    name: string;
    type: string;
  };
};

interface IncomeData {
  id?: string;
  tipo: "recorrente" | "pontual";
  descricao: string;
  valor: number;
  categoria: string;
  categoriaInfo?: {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: string;
  };
  dataRecebimento?: string;
  recorrencia?: "mensal" | "quinzenal" | "semanal";
}

interface Props {
  onClose: () => void;
  onAdd: (income: IncomeData) => void;
}

export function AddIncomeModal({ onClose, onAdd }: Props) {
  const { createIncome } = useIncomes();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    getIncomeCategories,
    loading: categoriesLoading,
    error: categoriesError,
    getCategoryById,
  } = useCategories();
  const apiCategories = getIncomeCategories();

  const [form, setForm] = useState<IncomeData>({
    tipo: "recorrente",
    descricao: "",
    valor: 0,
    categoria: "",
    recorrencia: "mensal",
    dataRecebimento: new Date().toISOString().split("T")[0],
  });

  // Helper para obter informações da categoria selecionada
  const getSelectedCategoryInfo = () => {
    if (!form.categoria) return null;
    return apiCategories.find((cat) => cat.id === form.categoria) || null;
  };

  // Função para converter API response para formato interno
  const convertApiIncomeToIncome = (apiIncome: ApiIncome): IncomeData => {
    // Buscar informações adicionais da categoria (ícone e cor) das categorias locais
    const localCategory = apiCategories.find(
      (cat) =>
        cat.name.toLowerCase() === apiIncome.category.name.toLowerCase() ||
        cat.id === apiIncome.category.id.toString()
    );

    // Determinar se é recorrente ou pontual baseado nas datas
    const startDate = new Date(apiIncome.startDate);
    const endDate = new Date(apiIncome.endDate);

    // Se a data de fim é muito no futuro (ano 2099), é uma receita recorrente mensal
    // Se as datas são do mesmo dia, é uma receita pontual
    const isRecurring = endDate.getFullYear() >= 2099;
    const isSameDay = startDate.toDateString() === endDate.toDateString();

    let tipo: "recorrente" | "pontual";
    let recorrencia: "mensal" | "quinzenal" | "semanal" | undefined;

    if (isRecurring) {
      tipo = "recorrente";
      recorrencia = "mensal"; // Por enquanto só suportamos mensais
    } else if (isSameDay) {
      tipo = "pontual";
      recorrencia = undefined;
    } else {
      // Fallback - se não é nem recorrente nem do mesmo dia, considera como pontual
      tipo = "pontual";
      recorrencia = undefined;
    }

    return {
      id: apiIncome.id.toString(),
      descricao: apiIncome.description,
      categoria: apiIncome.category.name,
      valor: apiIncome.amount,
      dataRecebimento: apiIncome.startDate.split("T")[0],
      tipo: tipo,
      recorrencia: recorrencia,
      categoriaInfo: {
        id: apiIncome.category.id.toString(),
        name: apiIncome.category.name,
        icon: localCategory?.icon || "💰",
        color: localCategory?.color || "#10B981",
        type: apiIncome.category.type,
      },
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: Record<string, string> = {};

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!form.categoria) {
      newErrors.categoria = "Selecione uma categoria";
    }

    if (form.valor <= 0) {
      newErrors.valor = "Valor deve ser maior que zero";
    }

    if (!form.dataRecebimento) {
      newErrors.dataRecebimento = "Data é obrigatória";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar dados para a API
      const selectedCategory = getSelectedCategoryInfo();
      const startDate = new Date(form.dataRecebimento!);
      startDate.setHours(0, 0, 0, 0); // Início do dia

      let endDate: Date | undefined = undefined;
      if (form.tipo === "pontual") {
        // Para receitas pontuais, início e fim no mesmo dia
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999); // Final do dia
      }

      const apiIncomeData = {
        description: form.descricao,
        amount: form.valor,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        categoryId: selectedCategory?.id
          ? parseInt(selectedCategory.id)
          : parseInt(form.categoria),
      };

      // Criar na API
      const createdIncome = (await createIncome(apiIncomeData)) as ApiIncome;

      // Converter resposta da API para formato interno
      const newIncome = convertApiIncomeToIncome(createdIncome);

      // Chamar callback para atualizar a lista no componente pai
      onAdd(newIncome);
      window.dispatchEvent(
        new CustomEvent("incomeAdded", { detail: newIncome })
      );
      // Fechar modal
      onClose();
    } catch (error) {
      console.error("Erro ao criar receita:", error);

      // Em caso de erro, criar localmente como fallback
      const selectedCategory = getSelectedCategoryInfo();
      const fallbackIncome: IncomeData = {
        id: Date.now().toString(),
        descricao: form.descricao,
        categoria: selectedCategory?.name || form.categoria,
        valor: form.valor,
        dataRecebimento: form.dataRecebimento,
        tipo: form.tipo,
        recorrencia: form.recorrencia,
        ...(selectedCategory && {
          categoriaInfo: {
            id: selectedCategory.id,
            name: selectedCategory.name,
            icon: selectedCategory.icon || "💰",
            color: selectedCategory.color || "#10B981",
            type: selectedCategory.type || "income",
          },
        }),
      };

      onAdd(fallbackIncome);
      window.dispatchEvent(
        new CustomEvent("incomeAdded", { detail: fallbackIncome })
      );
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof IncomeData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Categorias da API
  const categories = apiCategories;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
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
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Nova Receita</h3>
                <p className="text-green-100 text-sm">
                  Adicionar fonte de renda
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
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
            id="income-form"
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
                value={form.descricao}
                onChange={(e) => handleInputChange("descricao", e.target.value)}
                placeholder="Ex: Salário Empresa X, Projeto Freelance..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
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
                      form.categoria === category.id
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
                    value={form.valor > 0 ? form.valor : ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      const numValue = value === "" ? 0 : parseFloat(value);
                      handleInputChange("valor", numValue);
                    }}
                    placeholder="0,00"
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
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
                  value={
                    form.dataRecebimento ||
                    new Date().toISOString().substring(0, 10)
                  }
                  onChange={(e) =>
                    handleInputChange("dataRecebimento", e.target.value)
                  }
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors ${
                    errors.dataRecebimento
                      ? "border-red-500 bg-red-50"
                      : "border-gray-300"
                  }`}
                />
                {errors.dataRecebimento && (
                  <p className="text-red-500 text-xs">
                    {errors.dataRecebimento}
                  </p>
                )}
              </div>
            </div>

            {/* Tipo de Receita */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Tipo de Receita
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "pontual")}
                  className={`flex-1 p-3 text-sm font-medium border rounded-xl transition-all ${
                    form.tipo === "pontual"
                      ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500 ring-opacity-20"
                      : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                  }`}
                >
                  💰 Receita Única
                </button>
                <button
                  type="button"
                  onClick={() => handleInputChange("tipo", "recorrente")}
                  className={`flex-1 p-3 text-sm font-medium border rounded-xl transition-all ${
                    form.tipo === "recorrente"
                      ? "bg-green-50 text-green-700 border-green-300 ring-2 ring-green-500 ring-opacity-20"
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
              form="income-form"
              disabled={isSubmitting || categoriesLoading}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-2xl font-medium transition-all shadow-lg hover:shadow-xl text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Salvando...
                </>
              ) : (
                "Adicionar Receita"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
