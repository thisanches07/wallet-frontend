import { PieChart, Plus, RefreshCw, Upload } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
import { AddExpenseModal } from "../modals/AddExpenseModal";
import { AddIncomeModal } from "../modals/AddIncomeModal";
import { AddRecurringExpenseModal } from "../modals/AddRecurringExpenseModal";
import { RecurringModal } from "../modals/RecurringModal";
import { ReportsModal } from "../modals/ReportsModal";

export default function QuickActionsCard() {
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showRecurringExpenseModal, setShowRecurringExpenseModal] =
    useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRecurringModal, setShowRecurringModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
  const router = useRouter();

  const actions = [
    {
      icon: Plus,
      label: "Adicionar Gasto",
      color: "bg-danger-50 text-danger-600 hover:bg-danger-100",
      action: () => setShowExpenseModal(true),
    },
    {
      icon: Upload,
      label: "Nova Receita",
      color: "bg-success-50 text-success-600 hover:bg-success-100",
      action: () => setShowIncomeModal(true),
    },
    {
      icon: RefreshCw,
      label: "Recorrências",
      color: "bg-primary-50 text-primary-600 hover:bg-primary-100",
      action: () => setShowRecurringModal(true),
    },
    {
      icon: PieChart,
      label: "Relatórios",
      color: "bg-warning-50 text-warning-600 hover:bg-warning-100",
      action: () => setShowReportsModal(true),
    },
  ];

  return (
    <>
      <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm">
        <h3 className="text-sm font-medium text-neutral-500 mb-4">
          Ações Rápidas
        </h3>

        <div className="grid grid-cols-2 gap-3">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={action.action}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all duration-200 ${action.color}`}
              >
                <Icon size={20} />
                <span className="text-xs font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {showExpenseModal && (
        <AddExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onAdd={(expense) => {
            // Salvar no localStorage
            const existingExpenses = JSON.parse(
              localStorage.getItem("expenses") || "[]"
            );
            const newExpense = {
              ...expense,
              id: Date.now().toString(),
            };
            const updatedExpenses = [...existingExpenses, newExpense];
            localStorage.setItem("expenses", JSON.stringify(updatedExpenses));

            // Atualizar total de gastos
            const currentTotal = parseFloat(
              localStorage.getItem("gastosTotal") || "0"
            );
            const newTotal = currentTotal + expense.valor;
            localStorage.setItem("gastosTotal", newTotal.toString());

            console.log("Despesa salva:", newExpense);
            console.log("Novo total de gastos:", newTotal);
            setShowExpenseModal(false);
          }}
        />
      )}

      {showIncomeModal && (
        <AddIncomeModal
          onClose={() => setShowIncomeModal(false)}
          onAdd={(income) => {
            console.log("Nova receita adicionada:", income);
            setShowIncomeModal(false);
          }}
        />
      )}

      {showRecurringModal && (
        <RecurringModal onClose={() => setShowRecurringModal(false)} />
      )}

      {showRecurringExpenseModal && (
        <AddRecurringExpenseModal
          onClose={() => setShowRecurringExpenseModal(false)}
          onAdd={(expense) => {
            console.log("Nova despesa recorrente adicionada:", expense);
            setShowRecurringExpenseModal(false);
          }}
        />
      )}

      {showReportsModal && (
        <ReportsModal onClose={() => setShowReportsModal(false)} />
      )}
    </>
  );
}
