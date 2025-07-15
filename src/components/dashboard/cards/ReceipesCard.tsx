import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function ReceipesCard() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { incomes, loading } = useMonthlyData(selectedMonth, selectedYear);

  const [isEditing, setIsEditing] = useState(false);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [previousReceitas] = useState(4500); // Valor anterior para comparação
  const inputRef = useRef<HTMLInputElement>(null);

  const change = totalReceitas - previousReceitas;
  const changePercentage =
    previousReceitas > 0 ? (change / previousReceitas) * 100 : 0;
  const isGrowing = change > 0;

  useEffect(() => {
    const total = incomes.reduce(
      (acc: number, receita) => acc + Number(receita.amount),
      0
    );
    setTotalReceitas(total);
    setInputValue(total);
  }, [incomes]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const saveChanges = () => {
    setIsEditing(false);
    // TODO: Implementar funcionalidade de ajuste se necessário
  };

  const receitasRecorrentes = incomes.filter((r) => r.tipo === "recorrente");
  const receitasPontuais = incomes.filter((r) => r.tipo === "pontual");

  return (
    <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-success shadow-sm">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-medium text-neutral-500 mb-1">
            Receitas Totais
          </h3>

          <div className="flex items-center gap-2">
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(Number(e.target.value))}
                onBlur={saveChanges}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    saveChanges();
                  }
                }}
                className="text-2xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-40 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
              />
            ) : (
              <p className="text-2xl font-bold text-success-600 tracking-tight">
                R${" "}
                {totalReceitas.toLocaleString("pt-BR", {
                  minimumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {incomes.length > 0 && (
            <div className="mt-2 space-y-1">
              {receitasRecorrentes.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Recorrente:</span>
                  <span className="font-medium text-success-700">
                    R${" "}
                    {receitasRecorrentes
                      .reduce((acc: number, r) => acc + r.amount, 0)
                      .toLocaleString("pt-BR")}
                  </span>
                </div>
              )}
              {receitasPontuais.length > 0 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-neutral-500">Pontual:</span>
                  <span className="font-medium text-primary-700">
                    R${" "}
                    {receitasPontuais
                      .reduce((acc: number, r) => acc + r.amount, 0)
                      .toLocaleString("pt-BR")}
                  </span>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-neutral-400 mt-1">
            {isCurrentMonth()
              ? "Este mês"
              : `${selectedMonth + 1}/${selectedYear}`}
          </p>

          {Math.abs(changePercentage) > 0.1 && (
            <div
              className={`flex items-center gap-1 mt-1 ${
                isGrowing ? "text-success-600" : "text-danger-600"
              }`}
            >
              {isGrowing ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              <span className="text-xs font-medium">
                {isGrowing ? "+" : ""}
                {Math.abs(changePercentage).toFixed(1)}% vs mês anterior
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
