import { EXPENSE_CATEGORIES } from "@/constants/categories";
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
  category: string;
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
};

interface ExpenseData {
  id?: string;
  description: string;
  categoria: string;
  valor: number;
  data: string;
  tipo: "unico" | "recorrente";
  recorrencia?: "diaria" | "semanal" | "mensal" | "anual";
  source: "MANUAL" | "PLUGGY";
}

export function AddExpenseModal({ onClose, onAdd }: AddExpenseModalProps) {
  const { createExpense } = useExpenses();

  const [formData, setFormData] = useState<ExpenseData>({
    description: "",
    categoria: "",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    tipo: "unico",
    source: "MANUAL",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertApiExpenseToExpense = (apiExpense: ApiExpense): ExpenseData => {
    return {
      id: apiExpense.id.toString(),
      description: apiExpense.description,
      categoria: apiExpense.category,
      valor: apiExpense.amount,
      data: apiExpense.date,
      tipo: "unico",
      source: "MANUAL",
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.description.trim()) {
      newErrors.description = "Descrição é obrigatória";
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = "Categoria é obrigatória";
    }

    if (formData.valor <= 0) {
      newErrors.valor = "Valor deve ser maior que zero";
    }

    if (!formData.data) {
      newErrors.data = "Data é obrigatória";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const startDate = new Date(formData.data);
      startDate.setHours(0, 0, 0, 0);

      const apiExpenseData = {
        description: formData.description,
        amount: formData.valor,
        date: startDate.toISOString(),
        category: formData.categoria,
      };

      const apiResponse = await createExpense(apiExpenseData);
      const convertedExpense = convertApiExpenseToExpense(
        apiResponse as ApiExpense
      );

      onAdd(convertedExpense);
      window.dispatchEvent(
        new CustomEvent("expenseAdded", { detail: convertedExpense })
      );
      onClose();
    } catch (error) {
      console.error("Erro ao criar despesa:", error);
      setErrors({
        submit: "Erro ao criar despesa. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ExpenseData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Ex: Aluguel, Supermercado, Gasolina..."
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors ${
                  errors.description
                    ? "border-red-500 bg-red-50"
                    : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-xs">{errors.description}</p>
              )}
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="grid grid-cols-2 gap-2">
                {EXPENSE_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() =>
                      handleInputChange("categoria", category.name)
                    }
                    className={`p-3 text-sm font-medium border rounded-xl transition-all flex items-center gap-2 ${
                      formData.categoria === category.name
                        ? "bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500 ring-opacity-20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                    disabled={isSubmitting}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
              {errors.categoria && (
                <p className="text-red-500 text-xs mt-1">{errors.categoria}</p>
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

            {/* Erro geral */}
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{errors.submit}</p>
              </div>
            )}
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
              disabled={isSubmitting}
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
