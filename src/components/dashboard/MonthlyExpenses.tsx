import { AddExpenseModal } from "@/components/dashboard/modals/AddExpenseModal";
import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useExpenses } from "@/hooks/useApi";
import { Calendar, Plus, Receipt, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

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

export function MonthlyExpenses() {
  const { selectedMonth, selectedYear } = useSelectedMonth();
  const { expenses, loading, error } = useMonthlyData(
    selectedMonth,
    selectedYear
  );
  const { deleteExpense } = useExpenses();
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [justAdded, setJustAdded] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Escutar evento de nova despesa apenas para atualizar a marcação visual
  useEffect(() => {
    const handleExpenseAdded = (e: CustomEvent) => {
      const newExpense = e.detail;
      if (!newExpense || !newExpense.id) return;

      setJustAdded(newExpense.id);
      setTimeout(() => setJustAdded(null), 3000);
    };

    window.addEventListener(
      "expenseAdded",
      handleExpenseAdded as EventListener
    );

    return () => {
      window.removeEventListener(
        "expenseAdded",
        handleExpenseAdded as EventListener
      );
    };
  }, []);

  // Função para deletar despesa
  const handleDelete = async (expenseId: number) => {
    if (!expenseId) return;

    setDeletingId(expenseId);
    try {
      // Fazer o delete na API
      await deleteExpense(expenseId);

      // Disparar evento customizado para atualizar os dados do contexto
      window.dispatchEvent(
        new CustomEvent("expenseDeleted", {
          detail: {
            id: expenseId, // Passar como number
            month: selectedMonth,
            year: selectedYear,
          },
        })
      );
    } catch (error) {
      console.error("Erro ao deletar despesa:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryIcon = (categoria: string): string => {
    const iconMap: Record<string, string> = {
      Moradia: "🏠",
      Transporte: "🚗",
      Alimentação: "🍔",
      Lazer: "🎮",
      Saúde: "⚕️",
      Educação: "📚",
      Outros: "📝",
    };
    return iconMap[categoria] || "📝";
  };

  const getCategoryColor = (categoria: string): string => {
    const colorMap: Record<string, string> = {
      Moradia: "bg-primary-100 text-primary-700 border-primary-200",
      Transporte: "bg-purple-100 text-purple-700 border-purple-200",
      Alimentação: "bg-success-100 text-success-700 border-success-200",
      Lazer: "bg-pink-100 text-pink-700 border-pink-200",
      Saúde: "bg-red-100 text-red-700 border-red-200",
      Educação: "bg-indigo-100 text-indigo-700 border-indigo-200",
      Outros: "bg-neutral-100 text-neutral-700 border-neutral-200",
    };
    return (
      colorMap[categoria] ||
      "bg-neutral-100 text-neutral-700 border-neutral-200"
    );
  };

  const totalExpenses = expenses.reduce(
    (acc: number, item) => acc + +item.valor,
    0
  );

  const displayedExpenses = showAll ? expenses : expenses.slice(0, 4);

  return (
    <div
      className={`bg-white border border-neutral-200/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col max-w-full ${
        showAll ? "max-h-[calc(100vh-200px)]" : "h-fit"
      }`}
    >
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 rounded-t-2xl p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">💳 Gastos Mensais</h2>
            <p className="text-primary-100 text-sm">
              {expenses.length} transações este mês
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">
              Total gasto no mês
            </p>
            <p className="text-2xl font-bold text-white">
              R${" "}
              {totalExpenses.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Gasto</span>
          </button>
        </div>
      </div>

      <div className={`p-4 ${showAll ? "flex-1 overflow-y-auto min-h-0" : ""}`}>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-2 text-sm text-gray-600">
              Carregando despesas...
            </span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-red-500" />
            </div>
            <h4 className="text-red-900 font-medium text-sm mb-1">
              Erro ao carregar
            </h4>
            <p className="text-red-600 text-xs mb-3">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="text-xs font-medium text-red-600 hover:text-red-800"
            >
              Tentar novamente
            </button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {displayedExpenses.map((item, index: number) => (
                <div
                  key={item.id}
                  className={`group p-3 rounded-xl border transition-all duration-300 ease-in-out overflow-hidden ${
                    justAdded === item.id
                      ? "border-green-200 bg-green-50 shadow-md opacity-100 transform scale-100 translate-x-0 max-h-96"
                      : "border-neutral-100 hover:border-neutral-200 bg-neutral-25 hover:bg-white hover:shadow-sm opacity-100 transform scale-100 translate-x-0 max-h-96"
                  } animate-fade-in`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="text-sm">
                        {getCategoryIcon(item.categoria)}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-neutral-900 text-sm truncate">
                          {item.descricao}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-medium border ${getCategoryColor(
                              item.categoria
                            )}`}
                          >
                            {item.categoria}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 flex items-center gap-2">
                      <div className="text-right">
                        <p className="text-sm font-bold text-danger-600">
                          -R$ {item.valor.toLocaleString("pt-BR")}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                          <Calendar className="w-3 h-3" />
                          <span>
                            {new Date(item.data).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deletingId === item.id}
                        className="p-1.5 hover:bg-danger-50 rounded-lg transition-colors group disabled:opacity-50"
                        title="Excluir despesa"
                      >
                        {deletingId === item.id ? (
                          <div className="w-3 h-3 border border-danger-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Trash2
                            size={14}
                            className="text-neutral-400 group-hover:text-danger-600"
                          />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {expenses.length > 4 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full mt-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
              >
                {showAll ? `Mostrar menos` : `Ver mais (${expenses.length})`}
              </button>
            )}

            {expenses.length === 0 && !loading && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
                  <Receipt className="w-6 h-6 text-neutral-400" />
                </div>
                <h4 className="text-neutral-900 font-medium text-sm mb-1">
                  Nenhuma despesa
                </h4>
                <p className="text-neutral-600 text-xs mb-3">
                  Adicione sua primeira despesa
                </p>
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 bg-gradient-primary text-white text-xs font-medium px-3 py-2 rounded-lg transition-all hover:scale-105"
                >
                  <Plus className="w-3 h-3" />
                  Adicionar
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onAdd={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
