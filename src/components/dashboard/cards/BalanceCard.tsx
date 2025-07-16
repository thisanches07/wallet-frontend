import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function BalanceCard() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { expenses, incomes } = useMonthlyData(selectedMonth, selectedYear);
  const [isEditing, setIsEditing] = useState(false);
  const [balance, setBalance] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const expensesTotal = expenses.reduce(
      (acc, expense) => acc + Number(expense.valor),
      0
    );
    const incomesTotal = incomes.reduce(
      (acc, income) => acc + Number(income.amount),
      0
    );
    const calculatedBalance = incomesTotal - expensesTotal;

    setBalance(calculatedBalance);
    setInputValue(calculatedBalance);
  }, [expenses, incomes]);

  const isPositive = balance >= 0;
  const previousBalance = 2500;
  const change = balance - previousBalance;
  const changePercentage =
    previousBalance > 0 ? (change / previousBalance) * 100 : 0;
  const isGrowing = change > 0;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveChanges = () => setIsEditing(false);

  return (
    <div className="bg-white border border-neutral-200/80 p-4 sm:p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      {/* Linha 1: Ícone + Título */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-xl shadow-sm ${
            isPositive ? "bg-gradient-success" : "bg-gradient-danger"
          } flex items-center justify-center`}
        >
          <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
        </div>
        <h3 className="text-base sm:text-lg font-semibold text-neutral-700">
          Saldo Total
        </h3>
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
            onKeyDown={(e) => e.key === "Enter" && saveChanges()}
            className="text-lg sm:text-xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-full max-w-48 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        ) : (
          <p
            className={`font-bold tracking-tight ${
              isPositive ? "text-success-600" : "text-danger-600"
            }`}
            style={{
              fontSize: "clamp(0.5rem, 2.2vw, 1.4rem)",
              lineHeight: "1.1",
              whiteSpace: "nowrap",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={`R$ ${balance.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
          >
            R$ {balance.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
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
        {!isPositive && (
          <p className="text-sm text-danger-600 font-medium mt-1">
            Atenção: Saldo negativo
          </p>
        )}
      </div>

      {/* Linha 4: Comparativo */}
      {Math.abs(changePercentage) > 0.1 && (
        <div
          className={`flex items-center gap-1 ${
            isGrowing ? "text-success-600" : "text-danger-600"
          }`}
        >
          {isGrowing ? (
            <TrendingUp size={14} className="flex-shrink-0" />
          ) : (
            <TrendingDown size={14} className="flex-shrink-0" />
          )}
          <span className="text-sm font-medium">
            {Math.abs(changePercentage).toFixed(1)}% vs mês anterior
          </span>
        </div>
      )}
    </div>
  );
}
