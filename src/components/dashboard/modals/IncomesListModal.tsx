import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useIncomes } from "@/hooks/useApi";
import { DollarSign, Trash2, X } from "lucide-react";
import { useState } from "react";

interface IncomesListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function IncomesListModal({
  isOpen,
  onClose,
}: IncomesListModalProps) {
  const { deleteIncome } = useIncomes();
  const { selectedMonth, selectedYear } = useSelectedMonth();
  const { incomes, refresh } = useMonthlyData(selectedMonth, selectedYear);
  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Filtrar receitas excluindo as que foram deletadas
  const visibleIncomes = incomes.filter((income) => !deletedIds.has(income.id));

  // Resetar lista de deletados quando modal fechar
  const handleClose = () => {
    setDeletedIds(new Set());
    setAnimatingIds(new Set());
    onClose();
  };

  const handleDelete = async (incomeId: number) => {
    if (!incomeId) return;

    setDeletingId(incomeId);
    try {
      // Iniciar animação de fade-out
      setAnimatingIds((prev) => new Set(prev).add(incomeId));

      // Aguardar animação antes de remover da lista
      setTimeout(() => {
        setDeletedIds((prev) => new Set(prev).add(incomeId));
      }, 300); // Duração da animação

      // Fazer o delete na API
      await deleteIncome(incomeId);

      // Disparar evento customizado para atualizar os dados do contexto
      window.dispatchEvent(
        new CustomEvent("incomeDeleted", {
          detail: {
            id: incomeId,
            month: selectedMonth,
            year: selectedYear,
          },
        })
      );
    } catch (error) {
      console.error("Erro ao deletar receita:", error);
      // Em caso de erro, remover da animação e da lista de deletados
      setAnimatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(incomeId);
        return newSet;
      });
      setDeletedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(incomeId);
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
      salario: "💼",
      freelance: "💻",
      investimento: "📈",
      bonus: "🎁",
      outros: "💰",
    };
    return icons[categoria] || "💰";
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              Receitas de {monthNames[selectedMonth]} {selectedYear}
            </h2>
            <p className="text-sm text-neutral-500 mt-1">
              {visibleIncomes.length} receita
              {visibleIncomes.length !== 1 ? "s" : ""} encontrada
              {visibleIncomes.length !== 1 ? "s" : ""}
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
          {visibleIncomes.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign size={48} className="text-neutral-300 mx-auto mb-4" />
              <p className="text-neutral-500 text-lg">
                Nenhuma receita encontrada
              </p>
              <p className="text-neutral-400 text-sm mt-1">
                As receitas deste mês aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleIncomes.map((income) => (
                <div
                  key={income.id}
                  className={`flex items-center justify-between p-4 bg-neutral-50 rounded-xl transition-all duration-300 ease-in-out overflow-hidden ${
                    animatingIds.has(income.id)
                      ? "opacity-0 transform scale-95 translate-x-4 max-h-0 py-0 mb-0"
                      : "opacity-100 transform scale-100 translate-x-0 max-h-96 hover:bg-neutral-100"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-success-100 flex items-center justify-center">
                        <span className="text-lg">
                          {getCategoryIcon(income.categoria)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {income.descricao || "Receita"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {income.tipo && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                income.tipo === "recorrente"
                                  ? "bg-success-100 text-success-700"
                                  : "bg-primary-100 text-primary-700"
                              }`}
                            >
                              {income.tipo}
                            </span>
                          )}
                          {income.categoria && (
                            <span className="text-xs text-neutral-500 capitalize">
                              {income.categoria}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-bold text-success-600 text-lg">
                      R${" "}
                      {Number(income.amount).toLocaleString("pt-BR", {
                        minimumFractionDigits: 2,
                      })}
                    </span>

                    <button
                      onClick={() => handleDelete(income.id)}
                      disabled={deletingId === income.id}
                      className="p-2 hover:bg-danger-50 rounded-lg transition-colors group disabled:opacity-50"
                      title="Excluir receita"
                    >
                      {deletingId === income.id ? (
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
        {visibleIncomes.length > 0 && (
          <div className="border-t border-neutral-200 p-6">
            <div className="flex justify-between items-center">
              <span className="text-neutral-600 font-medium">
                Total do mês:
              </span>
              <span className="text-xl font-bold text-success-600">
                R${" "}
                {visibleIncomes
                  .reduce((acc, income) => acc + Number(income.amount), 0)
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
