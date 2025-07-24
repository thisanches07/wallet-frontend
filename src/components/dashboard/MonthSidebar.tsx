// components/MonthSidebar.tsx
import { useSummary } from "@/context/SummaryContext";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Calendar, CheckCircle, TrendingUp } from "lucide-react";

interface Props {
  selected: number;
  onSelect: (monthIndex: number) => void;
}

export function MonthSidebar({ selected, onSelect }: Props) {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const { getMonthData, loading } = useSummary();
  console.log("getMonthData(currentMonth)", getMonthData(currentMonth));

  const months = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  const monthsToDisplay = months.slice(0, currentMonth).reverse();

  const isMobile = useMediaQuery("(max-width: 768px)");

  if (isMobile) return null; // usaremos outro componente para mobile

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-neutral-200/50 h-full shadow-lg">
      <div className="p-4 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
            <Calendar className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Visão Anual</h2>
            <p className="text-xs text-neutral-600">{currentYear}</p>
          </div>
        </div>
      </div>

      {/* Mês Atual */}
      <div className="p-4 bg-gradient-to-br from-primary-50 to-blue-50 border-b border-primary-100">
        <button
          onClick={() => onSelect(currentMonth)}
          className={`w-full bg-white/70 rounded-xl p-4 border border-primary-200 shadow-sm hover:bg-white/90 transition-all ${
            selected === currentMonth ? "ring-2 ring-primary-300" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                {months[currentMonth]}
              </div>
              <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Atual
              </div>
            </div>
          </div>

          {(() => {
            const data = getMonthData(currentMonth);
            const income = data?.totalIncomes || 0;
            const expenses = data?.totalExpenses || 0;
            const balance = income - expenses;
            const savingsRate = income > 0 ? (balance / income) * 100 : 0;
            const isPositive = balance >= 0;

            return (
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-neutral-600">Saldo</span>
                  <span
                    className={`font-bold ${
                      isPositive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3.5 h-3.5 inline ${
                        !isPositive && "rotate-180"
                      }`}
                    />{" "}
                    R$ {Math.abs(balance).toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isPositive ? "bg-emerald-500" : "bg-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max((Math.abs(balance) / 2000) * 100, 8),
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-neutral-500">
                  <span>Taxa de economia</span>
                  <span
                    className={`${
                      savingsRate > 20
                        ? "text-emerald-600"
                        : savingsRate > 10
                        ? "text-amber-600"
                        : "text-red-500"
                    } font-semibold`}
                  >
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })()}
        </button>
      </div>

      {/* Lista de meses anteriores */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {loading ? (
          <p className="text-center text-sm text-gray-500 py-4">
            Carregando...
          </p>
        ) : (
          monthsToDisplay.map((month, index) => {
            const realIndex = currentMonth - (index + 1);
            const data = getMonthData(realIndex);
            const income = data?.totalIncomes || 0;
            const expenses = data?.totalExpenses || 0;
            const balance = income - expenses;
            const isPositive = balance >= 0;

            return (
              <button
                key={realIndex}
                onClick={() => onSelect(realIndex)}
                className={`w-full p-3 rounded-lg transition-all duration-200 text-left border ${
                  selected === realIndex
                    ? "bg-primary-50 border-primary-200 shadow-sm"
                    : "hover:bg-neutral-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                      {month}
                    </span>
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isPositive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    R$ {Math.abs(balance).toLocaleString("pt-BR")}
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Progresso anual */}
      <div className="p-3 border-t border-neutral-100">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2 text-xs font-bold">
            <span>Progresso Anual</span>
            <span className="text-primary-600">
              {Math.round(((currentMonth + 1) / 12) * 100)}%
            </span>
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full"
              style={{ width: `${((currentMonth + 1) / 12) * 100}%` }}
            />
          </div>
          <p className="text-xs text-neutral-600 mt-2">
            {currentMonth + 1} de 12 meses completos
          </p>
        </div>
      </div>
    </aside>
  );
}
