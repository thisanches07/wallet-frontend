import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ExpensesCard() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { expenses, loading } = useMonthlyData(selectedMonth, selectedYear);
  const [isEditing, setIsEditing] = useState(false);
  const [gastos, setGastos] = useState(0);
  const [inputValue, setInputValue] = useState(0);
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
    <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-danger shadow-sm">
          <TrendingDown className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">Gastos</h3>

          <div className="flex items-center gap-2">
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
                className="text-2xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-40 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            ) : (
              <>
                <p className="text-2xl font-bold text-danger-600 tracking-tight">
                  R${" "}
                  {totalExpenses.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </>
            )}
          </div>

          <p className="text-xs text-neutral-400 mt-1">
            {isCurrentMonth()
              ? "Este mês"
              : `${selectedMonth + 1}/${selectedYear}`}
          </p>

          {/* Indicador sutil de tendência - Para gastos, vermelho = aumento, verde = redução */}
          {Math.abs(changePercentage) > 0.1 && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                isIncreasing ? "text-danger-600" : "text-success-600"
              }`}
            >
              {isIncreasing ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="text-xs font-medium">
                {isIncreasing ? "+" : "-"}
                {Math.abs(changePercentage).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
