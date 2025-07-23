import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useIncomes } from "@/hooks/useApi";
import { useBankConnections } from "@/hooks/useBankConnections";
import { Calendar, DollarSign, Trash2, X } from "lucide-react";
import { useEffect, useState } from "react";

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
  const { incomes } = useMonthlyData(selectedMonth, selectedYear);
  const { connectedBanks } = useBankConnections();

  const [deletedIds, setDeletedIds] = useState<Set<number>>(new Set());
  const [animatingIds, setAnimatingIds] = useState<Set<number>>(new Set());
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [localIncomes, setLocalIncomes] = useState(incomes);

  useEffect(() => {
    if (animatingIds.size === 0) {
      setLocalIncomes(incomes);
    }
  }, [incomes, animatingIds.size]);

  const visibleIncomes = localIncomes.filter(
    (income) => !deletedIds.has(income.id)
  );

  const handleClose = () => {
    setDeletedIds(new Set());
    setAnimatingIds(new Set());
    setLocalIncomes(incomes);
    onClose();
  };

  const handleDelete = async (incomeId: number) => {
    if (!incomeId) return;
    setDeletingId(incomeId);
    try {
      setAnimatingIds((prev) => new Set(prev).add(incomeId));
      setTimeout(() => {
        setDeletedIds((prev) => new Set(prev).add(incomeId));
        setTimeout(() => {
          setAnimatingIds((prev) => {
            const newSet = new Set(prev);
            newSet.delete(incomeId);
            return newSet;
          });
        }, 100);
      }, 300);
      await deleteIncome(incomeId);
      window.dispatchEvent(
        new CustomEvent("incomeDeleted", {
          detail: { id: incomeId, month: selectedMonth, year: selectedYear },
        })
      );
    } catch (error) {
      console.error("Erro ao deletar receita:", error);
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

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      Salário: "💼",
      Freelance: "💻",
      Investimentos: "📈",
      Outros: "💰",
    };
    return icons[category] || "💰";
  };

  const getIncomeIcon = (income: any) => {
    console.log("object ->", income);
    if (!income.itemId) {
      return (
        <span className="text-lg">{getCategoryIcon(income.category)}</span>
      );
    }
    const bank = connectedBanks.find((b) => b.id === income.itemId);
    if (bank?.imageUrl) {
      return (
        <img
          src={bank.imageUrl}
          alt={bank.name}
          className="w-6 h-6 rounded-lg object-cover"
        />
      );
    }
    return <span className="text-lg">🏦</span>;
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
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
                      <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center">
                        {getIncomeIcon(income)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-neutral-900">
                          {income.description || "Receita"}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          {income.date && (
                            <span className="text-sm text-neutral-500 flex items-center gap-1">
                              <Calendar size={14} />
                              {new Date(income.date).toLocaleDateString(
                                "pt-BR"
                              )}
                            </span>
                          )}
                          {income.category && (
                            <span className="text-xs text-neutral-500 capitalize">
                              {income.category}
                            </span>
                          )}
                          {income.tipo && (
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                income.tipo === "recorrente"
                                  ? "bg-danger-100 text-danger-700"
                                  : "bg-neutral-100 text-neutral-700"
                              }`}
                            >
                              {income.tipo}
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
                      disabled={
                        income.source !== "MANUAL" || deletingId === income.id
                      }
                      className={`p-2 rounded-lg transition-colors group ${
                        income.source !== "MANUAL"
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:bg-danger-50"
                      }`}
                      title={
                        income.source !== "MANUAL"
                          ? "Receita importada do Open Finance"
                          : "Excluir receita"
                      }
                    >
                      {deletingId === income.id ? (
                        <div className="w-4 h-4 border-2 border-danger-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2
                          size={16}
                          className={
                            income.source !== "MANUAL"
                              ? "text-neutral-300"
                              : "text-neutral-400 group-hover:text-danger-600"
                          }
                        />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

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
