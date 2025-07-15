import { Calendar, CheckCircle, TrendingUp } from "lucide-react";

interface Props {
  selected: number; // ex: 0 para Jan, 1 para Feb...
  onSelect: (monthIndex: number) => void;
}

export function MonthSidebar({ selected, onSelect }: Props) {
  const currentMonth = new Date().getMonth(); // 0-based
  const currentYear = new Date().getFullYear();

  const months = [
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

  const monthsShort = [
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

  // Mock data
  const monthlyPerformance = [
    { income: 4500, expenses: 3200, goal: 4000 },
    { income: 4800, expenses: 3400, goal: 4200 },
    { income: 5200, expenses: 3800, goal: 4500 },
    { income: 4900, expenses: 3600, goal: 4300 },
    { income: 5100, expenses: 3900, goal: 4600 },
    { income: 5000, expenses: 4200, goal: 4400 },
    { income: 5300, expenses: 4100, goal: 4700 },
  ];

  const monthsToDisplay = months.slice(0, currentMonth).reverse();
  console.log("meses a serem exibidos ->", monthsToDisplay);
  const performanceToDisplay = monthlyPerformance
    .slice(0, currentMonth)
    .reverse();

  return (
    <aside className="w-64 bg-white/80 backdrop-blur-sm border-r border-neutral-200/50 h-full shadow-lg">
      {/* Header */}
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
          className={`w-full bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-primary-200 shadow-sm transition-all hover:bg-white/90 hover:shadow-md ${
            selected === currentMonth ? "ring-2 ring-primary-300" : ""
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="bg-primary-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold">
                {monthsShort[currentMonth]}
              </div>
              <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                Atual
              </div>
            </div>
          </div>

          {(() => {
            const performance = monthlyPerformance[currentMonth] || {
              income: 0,
              expenses: 0,
            };
            const balance = performance.income - performance.expenses;
            const isPositive = balance >= 0;
            const savingsRate =
              performance.income > 0 ? (balance / performance.income) * 100 : 0;

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-neutral-600">
                    Saldo
                  </span>
                  <div
                    className={`flex items-center gap-1 font-bold ${
                      isPositive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    <TrendingUp
                      className={`w-3.5 h-3.5 ${!isPositive && "rotate-180"}`}
                    />
                    <span className="text-sm">
                      R$ {Math.abs(balance).toLocaleString("pt-BR")}
                    </span>
                  </div>
                </div>

                <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isPositive
                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                        : "bg-gradient-to-r from-red-400 to-red-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        Math.max((Math.abs(balance) / 2000) * 100, 8),
                        100
                      )}%`,
                    }}
                  />
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-neutral-500">Taxa de economia</span>
                  <span
                    className={`font-semibold ${
                      savingsRate > 20
                        ? "text-emerald-600"
                        : savingsRate > 10
                        ? "text-amber-600"
                        : "text-red-500"
                    }`}
                  >
                    {savingsRate.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })()}
        </button>
      </div>

      {/* Lista de meses (invertida) */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {monthsToDisplay.map((month, index) => {
            console.log("mes ->", month, "index ->", index);
            const realIndex = currentMonth - (index + 1);
            const performance = performanceToDisplay[index] || {
              income: 0,
              expenses: 0,
            };
            const balance = performance.income - performance.expenses;
            const isPositive = balance >= 0;
            const isSelected = selected === realIndex;
            const isCurrentMonth = realIndex === currentMonth;

            return (
              <button
                key={month}
                onClick={() => onSelect(realIndex)}
                className={`w-full p-3 rounded-lg transition-all duration-200 text-left border ${
                  isSelected
                    ? "bg-primary-50 border-primary-200 shadow-sm"
                    : isCurrentMonth
                    ? "bg-emerald-50 border-emerald-200 hover:bg-emerald-100"
                    : "hover:bg-neutral-50 border-transparent hover:border-neutral-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded ${
                        isSelected
                          ? "bg-primary-100 text-primary-700"
                          : isCurrentMonth
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-neutral-100 text-neutral-600"
                      }`}
                    >
                      {monthsShort[realIndex]}
                    </span>
                    {isCurrentMonth ? (
                      <div className="flex items-center gap-1 bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full text-xs font-semibold">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                        Atual
                      </div>
                    ) : (
                      <CheckCircle className="w-3 h-3 text-emerald-500" />
                    )}
                  </div>

                  <div
                    className={`text-xs font-medium ${
                      isPositive ? "text-emerald-600" : "text-red-500"
                    }`}
                  >
                    R$ {Math.abs(balance).toLocaleString("pt-BR")}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Rodapé */}
      <div className="p-3 border-t border-neutral-100">
        <div className="bg-neutral-50 rounded-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-neutral-900">
              Progresso Anual
            </h3>
            <span className="text-xs font-bold text-primary-600">
              {Math.round(((currentMonth + 1) / 12) * 100)}%
            </span>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-700"
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
