import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useIncomeAllocation } from "@/hooks/useApi";
import { Expense } from "@/types/expense";
import { Eye, FileText, TrendingDown, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

interface ComparisonData {
  category: string;
  indicado: number;
  gasto: number;
}

interface AllocationData {
  totalMonthlyIncome: number;
  investmentsAmount: number;
  expensesAmount: number;
  leisureAmount: number;
  investmentsPercentage: number;
  expensesPercentage: number;
  leisurePercentage: number;
}

export function ExpensesComparison() {
  const [showModal, setShowModal] = useState(false);
  const [allocationData, setAllocationData] = useState<AllocationData | null>(
    null
  );
  const [comparisonData, setComparisonData] = useState<ComparisonData[]>([]);

  const { getAllocation } = useIncomeAllocation();
  const { selectedMonth, selectedYear } = useSelectedMonth();

  // Usar o MonthlyDataContext para obter as despesas
  const monthData = useMonthlyData(selectedMonth, selectedYear);
  const { expenses, loading: expensesLoading } = monthData;

  // Carregar dados da alocação
  useEffect(() => {
    const loadAllocationData = async () => {
      try {
        // Verificar se há token antes de fazer a chamada
        const { authService } = await import("@/services/authService");
        const token = authService.getToken();
        
        if (!token) {
          setAllocationData(null);
          return;
        }

        const allocation = (await getAllocation()) as AllocationData;
        setAllocationData(allocation);
      } catch (error) {
        console.error("Erro ao carregar alocação:", error);
        setAllocationData(null);
      }
    };

    loadAllocationData();
  }, [getAllocation]);

  // Escutar mudanças na alocação de renda
  useEffect(() => {
    const handleAllocationUpdate = async () => {
      try {
        const allocation = (await getAllocation()) as AllocationData;
        setAllocationData(allocation);
      } catch (error) {
        console.error("Erro ao recarregar alocação:", error);
      }
    };

    window.addEventListener("allocationUpdated", handleAllocationUpdate);

    return () => {
      window.removeEventListener("allocationUpdated", handleAllocationUpdate);
    };
  }, [getAllocation]);

  // Processar dados de comparação
  useEffect(() => {
    if (!allocationData) {
      setComparisonData([]);
      return;
    }

    // Calcular gastos reais por categoria
    const gastosPorCategoria = expenses.reduce(
      (acc: Record<string, number>, expense: Expense) => {
        const categoria = expense.categoria.toLowerCase();
        const valor = Number(expense.valor) || 0; // Garantir que é número
        acc[categoria] = (acc[categoria] || 0) + valor;
        return acc;
      },
      {} as Record<string, number>
    );

    // Separar lazer do resto das despesas
    const gastoLazer = gastosPorCategoria["lazer"] || 0;
    const gastoOutrasDespesas = Object.entries(gastosPorCategoria)
      .filter(([categoria]) => categoria !== "lazer")
      .reduce((acc, [, valor]) => acc + Number(valor), 0); // Garantir que é número

    // Criar dados de comparação
    const comparison: ComparisonData[] = [
      {
        category: "Despesas Gerais",
        indicado: allocationData.expensesAmount,
        gasto: gastoOutrasDespesas,
      },
      {
        category: "Lazer",
        indicado: allocationData.leisureAmount,
        gasto: gastoLazer,
      },
    ];

    setComparisonData(comparison);
  }, [allocationData, expenses]);

  const totalIndicado = comparisonData.reduce(
    (acc: number, item: ComparisonData) => acc + Number(item.indicado || 0),
    0
  );
  const totalGasto = comparisonData.reduce(
    (acc: number, item: ComparisonData) => acc + Number(item.gasto || 0),
    0
  );
  const totalDiff = Number(totalGasto) - Number(totalIndicado);
  const totalPercentage =
    totalIndicado > 0
      ? ((Math.abs(totalDiff) / totalIndicado) * 100).toFixed(1)
      : "0";

  if (expensesLoading || !allocationData) {
    return (
      <div className="bg-white border border-neutral-200 p-6 rounded-card shadow-card transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-card">
            <FileText className="w-5 h-5 text-neutral-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Análise Detalhada
            </h2>
            <p className="text-sm text-neutral-600">Comparação por categoria</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (!allocationData || comparisonData.length === 0) {
    return (
      <div className="bg-white border border-neutral-200 p-6 rounded-card shadow-card transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-card">
            <FileText className="w-5 h-5 text-neutral-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Análise Detalhada
            </h2>
            <p className="text-sm text-neutral-600">Comparação por categoria</p>
          </div>
        </div>
        <div className="text-center py-12">
          <p className="text-neutral-500">
            Configure sua alocação de renda primeiro para ver a análise
            detalhada.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white border border-neutral-200 p-6 rounded-card shadow-card transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-card">
            <FileText className="w-5 h-5 text-neutral-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Análise Detalhada
            </h2>
            <p className="text-sm text-neutral-600">Comparação por categoria</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
            disabled={comparisonData.length === 0}
          >
            <Eye className="w-4 h-4" />
            Ver detalhes
          </button>
        </div>

        {/* Resumo total */}
        <div className="mb-6 p-4 bg-gradient-to-r from-neutral-50 to-neutral-25 rounded-lg border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-neutral-900">Total Geral</h3>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                totalDiff > 0 ? "text-danger-600" : "text-success-600"
              }`}
            >
              {totalDiff > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{totalPercentage}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Orçado Total
              </p>
              <p className="font-bold text-primary-600">
                R$ {totalIndicado.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Gasto Total
              </p>
              <p className="font-bold text-neutral-900">
                R$ {totalGasto.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Diferença
              </p>
              <p
                className={`font-bold ${
                  totalDiff > 0 ? "text-danger-600" : "text-success-600"
                }`}
              >
                {totalDiff > 0 ? "+" : "-"}R${" "}
                {Math.abs(totalDiff).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Categorias principais */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">
            Principais Categorias
          </h4>
          {comparisonData.map((item) => {
            const diff = (item.gasto || 0) - (item.indicado || 0);
            const excedeu = diff > 0;
            const percentage =
              (item.indicado || 0) > 0
                ? ((Math.abs(diff) / (item.indicado || 1)) * 100).toFixed(1)
                : "0";

            return (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 bg-neutral-25 rounded-lg border border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-neutral-900 text-sm">
                      {item.category}
                    </h5>
                    <p className="text-xs text-neutral-500">
                      R$ {(item.gasto || 0).toLocaleString("pt-BR")} / R${" "}
                      {(item.indicado || 0).toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    excedeu ? "text-danger-600" : "text-success-600"
                  }`}
                >
                  {excedeu ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal detalhado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl">
                  <FileText className="w-6 h-6 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Análise Detalhada
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Comparação completa por categoria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {comparisonData.map((item) => {
                  const diff = (item.gasto || 0) - (item.indicado || 0);
                  const excedeu = diff > 0;
                  const percentage =
                    (item.indicado || 0) > 0
                      ? ((Math.abs(diff) / (item.indicado || 1)) * 100).toFixed(
                          1
                        )
                      : "0";

                  return (
                    <div
                      key={item.category}
                      className="p-6 bg-neutral-50 rounded-xl border border-neutral-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {item.category}
                        </h3>
                        <div
                          className={`flex items-center gap-2 text-base font-bold ${
                            excedeu ? "text-danger-600" : "text-success-600"
                          }`}
                        >
                          {excedeu ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          <span>{percentage}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 text-sm mb-4">
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Orçado
                          </p>
                          <p className="text-lg font-bold text-primary-600">
                            R$ {(item.indicado || 0).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Realizado
                          </p>
                          <p className="text-lg font-bold text-neutral-900">
                            R$ {(item.gasto || 0).toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Diferença
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              excedeu ? "text-danger-600" : "text-success-600"
                            }`}
                          >
                            {excedeu ? "+" : "-"}R${" "}
                            {Math.abs(diff).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar melhorada */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Progresso</span>
                          <span>
                            {(item.indicado || 0) > 0
                              ? Math.min(
                                  ((item.gasto || 0) / (item.indicado || 1)) *
                                    100,
                                  100
                                ).toFixed(1)
                              : "0"}
                            %
                          </span>
                        </div>
                        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${
                              excedeu
                                ? "bg-gradient-to-r from-red-400 to-red-600"
                                : "bg-gradient-to-r from-green-400 to-green-600"
                            }`}
                            style={{
                              width: `${
                                (item.indicado || 0) > 0
                                  ? Math.min(
                                      ((item.gasto || 0) /
                                        (item.indicado || 1)) *
                                        100,
                                      100
                                    )
                                  : 0
                              }%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
