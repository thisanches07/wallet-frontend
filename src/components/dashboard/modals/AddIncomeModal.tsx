import { INCOME_CATEGORIES } from "@/constants/categories";
import { useIncomes } from "@/hooks/useApi";
import { Calendar, DollarSign, Tag, X } from "lucide-react";
import { useState } from "react";

interface AddIncomeModalProps {
  onClose: () => void;
  onAdd: (income: IncomeData) => void;
}

type ApiIncome = {
  id: number;
  description: string;
  amount: number;
  startDate: string;
  endDate: string;
  category: string;
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
};

interface IncomeData {
  id?: string;
  descricao: string;
  categoria: string;
  valor: number;
  dataRecebimento?: string;
  tipo: "pontual" | "recorrente";
  recorrencia?: "diaria" | "semanal" | "mensal" | "anual";
}

export function AddIncomeModal({ onClose, onAdd }: AddIncomeModalProps) {
  const { createIncome } = useIncomes();

  const [form, setForm] = useState<IncomeData>({
    descricao: "",
    categoria: "",
    valor: 0,
    dataRecebimento: new Date().toISOString().split("T")[0],
    tipo: "pontual",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const convertApiIncomeToIncome = (apiIncome: ApiIncome): IncomeData => {
    return {
      id: apiIncome.id.toString(),
      descricao: apiIncome.description,
      categoria: apiIncome.category,
      valor: apiIncome.amount,
      dataRecebimento: apiIncome.startDate.split("T")[0],
      tipo: "pontual",
    };
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
    }

    if (!form.categoria.trim()) {
      newErrors.categoria = "Categoria é obrigatória";
    }

    if (form.valor <= 0) {
      newErrors.valor = "Valor deve ser maior que zero";
    }

    if (!form.dataRecebimento) {
      newErrors.dataRecebimento = "Data é obrigatória";
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
      const startDate = new Date(form.dataRecebimento!);
      startDate.setHours(0, 0, 0, 0);

      let endDate: Date | undefined = undefined;
      if (form.tipo === "pontual") {
        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
      }

      const apiIncomeData = {
        description: form.descricao,
        amount: form.valor,
        startDate: startDate.toISOString(),
        endDate: endDate?.toISOString(),
        category: form.categoria,
      };

      const apiResponse = await createIncome(apiIncomeData);
      const convertedIncome = convertApiIncomeToIncome(
        apiResponse as ApiIncome
      );

      onAdd(convertedIncome);
      window.dispatchEvent(
        new CustomEvent("incomeAdded", { detail: convertedIncome })
      );
      onClose();
    } catch (error) {
      console.error("Erro ao criar receita:", error);
      setErrors({
        submit: "Erro ao criar receita. Tente novamente.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof IncomeData, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categoria
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INCOME_CATEGORIES.map((category) => (
                  <button
                    key={category.name}
                    type="button"
                    onClick={() =>
                      handleInputChange("categoria", category.name)
                    }
                    className={`p-3 text-sm font-medium border rounded-lg transition-all flex items-center justify-center gap-2 ${
                      form.categoria === category.name
                        ? "bg-blue-50 text-blue-700 border-blue-300 ring-2 ring-blue-500 ring-opacity-20"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    <span style={{ color: category.color }}>
                      {category.icon}
                    </span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
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
              form="income-form"
              disabled={isSubmitting}
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
