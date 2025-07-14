import { Calendar, DollarSign, Receipt, Tag, X } from "lucide-react";
import { useState } from "react";

interface AddExpenseModalProps {
  onClose: () => void;
  onAdd: (expense: ExpenseData) => void;
}

interface ExpenseData {
  descricao: string;
  categoria:
    | "Moradia"
    | "Transporte"
    | "Alimentação"
    | "Lazer"
    | "Saúde"
    | "Educação"
    | "Outros";
  valor: number;
  data: string;
  tipo: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
}

const categorias = [
  {
    value: "Moradia",
    label: "🏠 Moradia",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    value: "Transporte",
    label: "🚗 Transporte",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    value: "Alimentação",
    label: "🍔 Alimentação",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  {
    value: "Lazer",
    label: "🎮 Lazer",
    color: "bg-pink-50 text-pink-700 border-pink-200",
  },
  {
    value: "Saúde",
    label: "⚕️ Saúde",
    color: "bg-red-50 text-red-700 border-red-200",
  },
  {
    value: "Educação",
    label: "📚 Educação",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  {
    value: "Outros",
    label: "📝 Outros",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
];

export function AddExpenseModal({ onClose, onAdd }: AddExpenseModalProps) {
  const [formData, setFormData] = useState<ExpenseData>({
    descricao: "",
    categoria: "Outros",
    valor: 0,
    data: new Date().toISOString().split("T")[0],
    tipo: "unico",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validação
    const newErrors: Record<string, string> = {};

    if (!formData.descricao.trim()) {
      newErrors.descricao = "Descrição é obrigatória";
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

    // Se for recorrente mas não tiver recorrência definida
    if (formData.tipo === "recorrente" && !formData.recorrencia) {
      const updatedData = { ...formData, recorrencia: "mensal" as const };
      onAdd(updatedData);
    } else {
      onAdd(formData);
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden animate-scale-in"
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

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
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
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categorias.map((categoria) => (
                <button
                  key={categoria.value}
                  type="button"
                  onClick={() =>
                    handleInputChange("categoria", categoria.value)
                  }
                  className={`p-3 text-xs font-medium border rounded-xl transition-all ${
                    formData.categoria === categoria.value
                      ? categoria.color + " ring-2 ring-offset-2 ring-current"
                      : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                  }`}
                >
                  {categoria.label}
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

          {/* Recorrência - só aparece se for recorrente */}
          {formData.tipo === "recorrente" && (
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Frequência
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: "semanal", label: "Semanal" },
                  { value: "mensal", label: "Mensal" },
                  { value: "anual", label: "Anual" },
                ].map((freq) => (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => handleInputChange("recorrencia", freq.value)}
                    className={`p-2 text-xs font-medium border rounded-lg transition-all ${
                      formData.recorrencia === freq.value
                        ? "bg-orange-50 text-orange-700 border-orange-300"
                        : "bg-gray-50 text-gray-600 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {freq.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl font-medium transition-all shadow-lg hover:shadow-xl"
            >
              Adicionar Gasto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
