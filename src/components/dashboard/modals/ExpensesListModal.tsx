import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useExpenses } from "@/hooks/useApi";
import { Calendar, ShoppingBag, Trash2, X } from "lucide-react";
import { useState } from "react";

interface ExpensesListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExpensesListModal({
  isOpen,
  onClose,
}: ExpensesListModalProps) {
  const { deleteExpense } = useExpenses();
  const { selectedMonth, selectedYear } = useSelectedMonth();
  const { expenses, refresh } = useMonthlyData(selectedMonth, selectedYear);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());

  // Filtrar despesas excluindo as que foram deletadas
  const visibleExpenses = expenses.filter(
    (expense) => !deletedIds.has(expense.id)
  );

  // Resetar lista de deletados quando modal fechar
  const handleClose = () => {
    setDeletedIds(new Set());
    setAnimatingIds(new Set());
    onClose();
  };

  const handleDelete = async (expenseId: number) => {
    if (!expenseId) return;

    setDeletingId(expenseId);
    try {
      // Iniciar animação de fade-out
      setAnimatingIds((prev) => new Set(prev).add(expenseId));

      // Aguardar animação antes de remover da lista
      setTimeout(() => {
        setDeletedIds((prev) => new Set(prev).add(expenseId));
      }, 300); // Duração da animação

      // Fazer o delete na API
      await deleteExpense(expenseId);

      // Disparar evento customizado para atualizar os dados do contexto
      window.dispatchEvent(
        new CustomEvent("expenseDeleted", {
          detail: {
            id: expenseId,
            month: selectedMonth,
            year: selectedYear,
          },
        })
      );
    } catch (error) {
      console.error("Erro ao deletar despesa:", error);
      // Em caso de erro, remover da animação e da lista de deletados
      setAnimatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(expenseId);
        return newSet;
      });
      setDeletedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(expenseId);
        return newSet;
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const getCategoryIcon = (categoria: string) => {
    const icons: Record<string, string> = {
      alimentacao: "🍽️",
      transporte: "🚗",
      moradia: "🏠",
      saude: "⚕️",
      educacao: "📚",
      lazer: "🎮",
      compras: "🛒",
      outros: "💸",
    };
    return icons[categoria] || "💸";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Gastos de {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {visibleExpenses.length} gasto
              {visibleExpenses.length !== 1 ? "s" : ""} encontrado
              {visibleExpenses.length !== 1 ? "s" : ""}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-neutral-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[60vh] p-6">
          {visibleExpenses.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag
                size={48}
                className="text-neutral-300 mx-auto mb-4"
              />
              <p className="text-neutral-500 text-lg">
                Nenhuma despesa encontrada
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                Os gastos deste mês aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleExpenses.map((expense) => (
                <div
                  key={expense.id}
                  className={`flex items-center justify-between p-4 bg-neutral-50 rounded-xl transition-all duration-300 ease-in-out overflow-hidden ${
                    animatingIds.has(expense.id)
                      ? "opacity-0 transform scale-95 translate-x-4 max-h-0 py-0 mb-0"
                      : "opacity-100 transform scale-100 translate-x-0 max-h-96 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-danger-100 flex items-center justify-center">
                        <span className="text-lg">
                          {getCategoryIcon(expense.categoria)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {expense.descricao || "Despesa"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {expense.data && (
                            <span className="text-sm text-neutral-500 flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(expense.data).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          )}
                          {expense.categoria && (
                            <span className="text-xs text-neutral-500 capitalize">
                              {expense.categoria}
                            </span>
                          )}
                          {expense.tipo && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                expense.tipo === "recorrente"
                                  ? "bg-danger-100 text-danger-700"
                                  : "bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {expense.tipo}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-danger-600 text-lg">
                      R${" "}
                      {Number(expense.valor).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    <button
                      onClick={() => handleDelete(expense.id)}
                      disabled={deletingId === expense.id}
                      className="p-2 hover:bg-danger-50 rounded-lg transition-colors group disabled:opacity-50"
                      title="Excluir despesa"
                    >
                      {deletingId === expense.id ? (
                        <div className="w-4 h-4 border-2 border-danger-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2
                          size={16}
                          className="text-neutral-400 group-hover:text-danger-600"
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {visibleExpenses.length > 0 && (
          <div className="border-t border-neutral-200 p-6">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">
                Total do mês:
              </span>
              <span className="text-xl font-bold text-danger-600">
                R${" "}
                {visibleExpenses
                  .reduce((acc, expense) => acc + Number(expense.valor), 0)
                  .toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
