import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { List, TrendingDown, TrendingUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import IncomesListModal from "../modals/IncomesListModal";

export default function ReceipesCard() {
  const { selectedMonth, selectedYear, isCurrentMonth } = useSelectedMonth();
  const { incomes, loading } = useMonthlyData(selectedMonth, selectedYear);

  const [isEditing, setIsEditing] = useState(false);
  const [totalReceitas, setTotalReceitas] = useState(0);
  const [inputValue, setInputValue] = useState(0);
  const [previousReceitas] = useState(4500); // Valor anterior para comparação
  const [isModalOpen, setIsModalOpen] = useState(false);
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
    <div className="bg-white border border-neutral-200/80 p-4 sm:p-6 rounded-2xl shadow-sm transition-all duration-300 group">
      {/* Linha 1: Ícone + Título + Botão */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-success shadow-sm">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-neutral-700">
            Receitas Totais
          </h3>
        </div>

        {incomes.length > 0 && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-2 hover:bg-success-50 rounded-lg transition-colors group/btn"
            title="Ver todas as receitas"
          >
            <List
              size={16}
              className="text-neutral-400 group-hover/btn:text-success-600"
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
              if (e.key === "Enter") {
                e.preventDefault();
                saveChanges();
              }
            }}
            className="text-lg sm:text-xl font-bold text-neutral-900 border-2 border-primary-300 rounded-lg px-2 py-1 w-full max-w-48 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 transition-all"
          />
        ) : (
          <p
            className="font-bold tracking-tight text-success-600"
            style={{
              fontSize: "clamp(0.5rem, 2.2vw, 1.4rem)",
              lineHeight: "1.1",
              whiteSpace: "nowrap",
              width: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
            title={`R$ ${totalReceitas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
          >
            R${" "}
            {totalReceitas.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
        )}
      </div>

      {/* Linha 3: Detalhamento das Receitas */}
      {incomes.length > 0 && (
        <div className="mb-3 space-y-1">
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

      {/* Linha 4: Período */}
      <div className="mb-2">
        <p className="text-sm sm:text-base text-neutral-500 font-medium">
          {isCurrentMonth()
            ? "Este mês"
            : `${selectedMonth + 1}/${selectedYear}`}
        </p>
      </div>

      {/* Linha 5: Comparativo */}
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
            {isGrowing ? "+" : ""}
            {Math.abs(changePercentage).toFixed(1)}% vs mês anterior
          </span>
        </div>
      )}

      {/* Modal */}
      <IncomesListModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
