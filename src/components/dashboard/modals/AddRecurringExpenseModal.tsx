import { Calendar, DollarSign, RefreshCw, Tag, X } from "lucide-react";
import { useState } from "react";

interface RecurringExpenseData {
  description: string;
  category: string;
  valor: number;
  diaVencimento: number;
  ativo: boolean;
  tipo: "fixo" | "variavel";
}

interface Props {
  onClose: () => void;
  onAdd: (expense: RecurringExpenseData) => void;
}

export function AddRecurringExpenseModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState<RecurringExpenseData>({
    description: "",
    category: "",
    valor: 0,
    diaVencimento: 1,
    ativo: true,
    tipo: "fixo",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.description && form.category && form.valor > 0) {
      onAdd(form);
      onClose();
    }
  };

  const categorys = [
    { value: "Moradia", icon: "🏠", color: "bg-blue-100 text-blue-700" },
    { value: "Transporte", icon: "🚗", color: "bg-purple-100 text-purple-700" },
    { value: "Alimentação", icon: "🍽️", color: "bg-green-100 text-green-700" },
    { value: "Saúde", icon: "⚕️", color: "bg-red-100 text-red-700" },
    { value: "Educação", icon: "📚", color: "bg-yellow-100 text-yellow-700" },
    {
      value: "Assinaturas",
      icon: "📱",
      color: "bg-indigo-100 text-indigo-700",
    },
    { value: "Seguros", icon: "🛡️", color: "bg-gray-100 text-gray-700" },
    { value: "Outros", icon: "📦", color: "bg-neutral-100 text-neutral-700" },
  ];

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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-neutral-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-warning rounded-xl">
              <RefreshCw className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Despesa Recorrente
              </h3>
              <p className="text-sm text-neutral-500">
                Gasto que se repete mensalmente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tipo de despesa */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700">
              Tipo da Despesa
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, tipo: "fixo" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.tipo === "fixo"
                    ? "border-danger-300 bg-danger-50 text-danger-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <DollarSign className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Valor Fixo</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, tipo: "variavel" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.tipo === "variavel"
                    ? "border-warning-300 bg-warning-50 text-warning-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <RefreshCw className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Valor Variável</span>
              </button>
            </div>
            <p className="text-xs text-neutral-500">
              {form.tipo === "fixo"
                ? "Ex: Aluguel, Financiamento (valor sempre igual)"
                : "Ex: Conta de luz, água (valor pode variar)"}
            </p>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              Descrição
            </label>
            <input
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Ex: Aluguel, Netflix, Conta de Luz..."
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              required
            />
          </div>

          {/* Categoria */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Tag className="w-4 h-4" />
              Categoria
            </label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              required
            >
              <option value="">Selecione uma category</option>
              {categorys.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.value}
                </option>
              ))}
            </select>
          </div>

          {/* Valor e Dia de Vencimento */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">
                {form.tipo === "fixo" ? "Valor (R$)" : "Valor Médio (R$)"}
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.valor || ""}
                onChange={(e) =>
                  setForm({ ...form, valor: Number(e.target.value) })
                }
                placeholder="0,00"
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                required
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
                <Calendar className="w-4 h-4" />
                Dia Vencimento
              </label>
              <select
                value={form.diaVencimento}
                onChange={(e) =>
                  setForm({ ...form, diaVencimento: Number(e.target.value) })
                }
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              >
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <option key={day} value={day}>
                    Dia {day}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Preview */}
          {form.valor > 0 && form.description && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h4 className="font-semibold text-orange-900 mb-2">Preview</h4>
              <div className="space-y-1">
                <p className="text-sm text-orange-800">
                  <span className="font-medium">{form.description}</span>
                </p>
                <p className="text-sm text-orange-700">
                  {categorys.find((c) => c.value === form.category)?.icon}{" "}
                  {form.category} • Vence dia {form.diaVencimento} • {form.tipo}
                </p>
                <p className="text-lg font-bold text-orange-800">
                  R${" "}
                  {form.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                  {form.tipo === "variavel" && (
                    <span className="text-sm font-normal"> (médio)</span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 rounded-xl transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-gradient-warning text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Adicionar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
