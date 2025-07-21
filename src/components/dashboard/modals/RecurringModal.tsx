import {
  Calendar,
  DollarSign,
  Plus,
  RefreshCw,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

interface RecurringExpense {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  diaVencimento: number;
  ativo: boolean;
  tipo: "fixo" | "variavel";
}

interface Props {
  onClose: () => void;
}

export function RecurringModal({ onClose }: Props) {
  const [expenses] = useState<RecurringExpense[]>([
    {
      id: "1",
      descricao: "Aluguel",
      categoria: "Moradia",
      valor: 1200,
      diaVencimento: 5,
      ativo: true,
      tipo: "fixo",
    },
    {
      id: "2",
      descricao: "Internet",
      categoria: "Assinaturas",
      valor: 80,
      diaVencimento: 10,
      ativo: true,
      tipo: "fixo",
    },
    {
      id: "3",
      descricao: "Spotify",
      categoria: "Assinaturas",
      valor: 16.9,
      diaVencimento: 15,
      ativo: true,
      tipo: "fixo",
    },
  ]);

  const totalRecorrente = expenses
    .filter((exp) => exp.ativo)
    .reduce((acc, exp) => acc + exp.valor, 0);

  const getCategoryIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      Moradia: "🏠",
      Transporte: "🚗",
      Alimentação: "🍽️",
      Saúde: "⚕️",
      Educação: "📚",
      Assinaturas: "📱",
      Seguros: "🛡️",
      Outros: "📦",
    };
    return icons[categoria] || "📝";
  };

  const getCategoryColor = (categoria: string) => {
    const colors: Record<string, string> = {
      Moradia: "bg-blue-100 text-blue-700 border-blue-200",
      Transporte: "bg-purple-100 text-purple-700 border-purple-200",
      Alimentação: "bg-green-100 text-green-700 border-green-200",
      Saúde: "bg-red-100 text-red-700 border-red-200",
      Educação: "bg-yellow-100 text-yellow-700 border-yellow-200",
      Assinaturas: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Seguros: "bg-gray-100 text-gray-700 border-gray-200",
      Outros: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };
    return colors[categoria] || "bg-gray-100 text-gray-700 border-gray-200";
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
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Gestão de Recorrências</h2>
                <p className="text-blue-100 text-sm">
                  Gerencie seus gastos mensais fixos
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

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-220px)]">
          {/* Summary */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900">
                  Total Mensal Recorrente
                </h3>
                <p className="text-2xl font-bold text-blue-700">
                  R${" "}
                  {totalRecorrente.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="text-right text-sm text-blue-600">
                <p>
                  {expenses.filter((exp) => exp.ativo).length} despesas ativas
                </p>
                <p>
                  {expenses.filter((exp) => !exp.ativo).length} despesas
                  inativas
                </p>
              </div>
            </div>
          </div>

          {/* Add New Button */}
          <button className="w-full p-4 border-2 border-dashed border-blue-300 text-blue-600 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            Adicionar Nova Recorrência
          </button>

          {/* Expenses List */}
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Despesas Recorrentes
            </h3>

            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {getCategoryIcon(expense.categoria)}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {expense.descricao}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(
                            expense.categoria
                          )}`}
                        >
                          {expense.categoria}
                        </span>
                        <span className="text-xs text-gray-500">
                          Vence dia {expense.diaVencimento}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-md text-xs font-medium ${
                            expense.tipo === "fixo"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {expense.tipo === "fixo"
                            ? "Valor Fixo"
                            : "Valor Variável"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="font-bold text-gray-900">
                        R${" "}
                        {expense.valor.toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-gray-500">por mês</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                        <Settings className="w-4 h-4" />
                      </button>
                      <div
                        className={`w-3 h-3 rounded-full ${
                          expense.ativo ? "bg-green-500" : "bg-gray-300"
                        }`}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-green-700">
                <DollarSign className="w-4 h-4" />
                <span className="text-sm font-medium">Próximo Vencimento</span>
              </div>
              <p className="text-lg font-bold text-green-800 mt-1">
                Internet - 5 dias
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 text-blue-700">
                <Calendar className="w-4 h-4" />
                <span className="text-sm font-medium">Economia Potencial</span>
              </div>
              <p className="text-lg font-bold text-blue-800 mt-1">
                R$ 96,90/mês
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600">
              💡 Dica: Revise suas recorrências mensalmente para otimizar gastos
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
