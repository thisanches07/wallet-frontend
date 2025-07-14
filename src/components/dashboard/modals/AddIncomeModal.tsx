import { Calendar, DollarSign, RefreshCw, Tag, X } from "lucide-react";
import { useState } from "react";

interface IncomeData {
  tipo: "recorrente" | "pontual";
  descricao: string;
  valor: number;
  categoria: "salario" | "freelance" | "investimento" | "bonus" | "outros";
  dataRecebimento?: string;
  recorrencia?: "mensal" | "quinzenal" | "semanal";
}

interface Props {
  onClose: () => void;
  onAdd: (income: IncomeData) => void;
}

export function AddIncomeModal({ onClose, onAdd }: Props) {
  const [form, setForm] = useState<IncomeData>({
    tipo: "recorrente",
    descricao: "",
    valor: 0,
    categoria: "salario",
    recorrencia: "mensal",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.descricao && form.valor > 0) {
      onAdd(form);
      onClose();
    }
  };

  const categoriaOptions = {
    salario: { label: "💼 Salário", color: "bg-blue-100 text-blue-700" },
    freelance: {
      label: "💻 Freelance",
      color: "bg-purple-100 text-purple-700",
    },
    investimento: {
      label: "📈 Investimentos",
      color: "bg-green-100 text-green-700",
    },
    bonus: { label: "🎁 Bônus", color: "bg-yellow-100 text-yellow-700" },
    outros: { label: "📦 Outros", color: "bg-gray-100 text-gray-700" },
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-neutral-200 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 bg-gradient-success rounded-xl">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-neutral-900">
                Nova Receita
              </h3>
              <p className="text-sm text-neutral-500">
                Adicionar fonte de renda
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
          {/* Tipo de receita */}
          <div className="space-y-3">
            <label className="text-sm font-semibold text-neutral-700">
              Tipo de Receita
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, tipo: "recorrente" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.tipo === "recorrente"
                    ? "border-success-300 bg-success-50 text-success-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <RefreshCw className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Recorrente</span>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, tipo: "pontual" })}
                className={`p-3 rounded-xl border-2 transition-all ${
                  form.tipo === "pontual"
                    ? "border-primary-300 bg-primary-50 text-primary-700"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
                }`}
              >
                <Calendar className="w-4 h-4 mx-auto mb-1" />
                <span className="text-xs font-medium">Pontual</span>
              </button>
            </div>
          </div>

          {/* Descrição */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              Descrição
            </label>
            <input
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              placeholder="Ex: Salário Empresa X, Projeto Freelance..."
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
              value={form.categoria}
              onChange={(e) =>
                setForm({ ...form, categoria: e.target.value as any })
              }
              className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              required
            >
              {Object.entries(categoriaOptions).map(([value, config]) => (
                <option key={value} value={value}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          {/* Valor */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-neutral-700">
              Valor (R$)
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

          {/* Recorrência (apenas para receitas recorrentes) */}
          {form.tipo === "recorrente" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">
                Frequência
              </label>
              <select
                value={form.recorrencia}
                onChange={(e) =>
                  setForm({ ...form, recorrencia: e.target.value as any })
                }
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              >
                <option value="mensal">Mensal</option>
                <option value="quinzenal">Quinzenal</option>
                <option value="semanal">Semanal</option>
              </select>
            </div>
          )}

          {/* Data (apenas para receitas pontuais) */}
          {form.tipo === "pontual" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-neutral-700">
                Data de Recebimento
              </label>
              <input
                type="date"
                value={
                  form.dataRecebimento ||
                  new Date().toISOString().substring(0, 10)
                }
                onChange={(e) =>
                  setForm({ ...form, dataRecebimento: e.target.value })
                }
                className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
                required
              />
            </div>
          )}

          {/* Preview */}
          {form.valor > 0 && (
            <div className="bg-success-50 border border-success-200 rounded-xl p-4">
              <h4 className="font-semibold text-success-900 mb-2">Preview</h4>
              <div className="space-y-1">
                <p className="text-sm text-success-800">
                  <span className="font-medium">{form.descricao}</span>
                </p>
                <p className="text-sm text-success-700">
                  {categoriaOptions[form.categoria].label} •
                  {form.tipo === "recorrente"
                    ? ` ${form.recorrencia}`
                    : " pontual"}
                </p>
                <p className="text-lg font-bold text-success-800">
                  R${" "}
                  {form.valor.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
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
              className="flex-1 px-4 py-3 bg-gradient-success text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              Adicionar Receita
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
