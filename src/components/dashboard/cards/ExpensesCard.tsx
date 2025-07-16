import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { List, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ExpensesListModal from "../modals/ExpensesListModal";

export default function ExpensesCard() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { expenses, loading } = useMonthlyData(selectedMonth, selectedYear);
  const [isEditing, setIsEditing] = useState(false);
  const [gastos, setGastos] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Simulação de comparação mensal
  const previousGastos = 3200; // Mock do mês anterior

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + Number(expense.valor),
    0
  );

  const change = totalExpenses - previousGastos;
  const changePercentage =
    previousGastos > 0 ? (change / previousGastos) * 100 : 0;
  const isIncreasing = change > 0; // Para gastos, aumento é negativo

  useEffect(() => {
    const saved = localStorage.getItem("gastosTotal");
    if (saved) {
      const parsed = parseFloat(saved);
      if (!isNaN(parsed)) {
        setGastos(parsed);
        setInputValue(parsed);
      }
    }
  }, []);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveChanges = () => {
    localStorage.setItem("gastosTotal", inputValue.toString());
    setGastos(inputValue);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-neutral-200/80 p-4 sm:p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      {/* Linha 1: Ícone + Título + Botão */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-danger shadow-sm">
            <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-700">
            Gastos
          </h3>
        </div>

        {expenses.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-danger-50 rounded-lg transition-colors group/btn"
            title="Ver todos os gastos"
          >
            <List
              size={16}
              className="text-neutral-400 group-hover/btn:text-danger-600"
            />
          </button>
        )}
      </div>

      {/* Linha 2: Valor Principal */}
      <div className="mb-4 w-full overflow-hidden">
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(Number(e.target.value))}
            onBlur={saveChanges}
            onKeyDown={(e) => {
              if (e.key === "Enter") saveChanges();
            }}
            className="text-lg sm:text-xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-full max-w-48 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        ) : (
          <p
            className="font-bold tracking-tight text-danger-600"
            style={{
              fontSize: "clamp(0.5rem, 2.2vw, 1.4rem)",
              lineHeight: "1.1",
              whiteSpace: "nowrap",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={`R$ ${totalExpenses.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
          >
            R${" "}
            {totalExpenses.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      {/* Linha 3: Período */}
      <div className="mb-2">
        <p className="text-sm sm:text-base text-neutral-500 font-medium">
          {isCurrentMonth()
            ? "Este mês"
            : `${selectedMonth + 1}/${selectedYear}`}
        </p>
      </div>

      {/* Linha 4: Comparativo */}
      {Math.abs(changePercentage) > 0.1 && (
        <div
          className={`flex items-center gap-1 ${
            isIncreasing ? "text-danger-600" : "text-success-600"
          }`}
        >
          {isIncreasing ? (
            <TrendingUp size={14} className="flex-shrink-0" />
          ) : (
            <TrendingDown size={14} className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium">
            {isIncreasing ? "+" : "-"}
            {Math.abs(changePercentage).toFixed(1)}%
          </span>
        </div>
      )}

      {/* Modal */}
      <ExpensesListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
