import { InitialSetupModal } from "@/components/dashboard/modals/InitialSetupModal";
import { useExpenses, useIncomeAllocation } from "@/hooks/useApi";
import { Expense } from "@/types/expense";
import { convertApiExpenseToExpense } from "@/utils/expenseUtils";
import {
  Calendar,
  DollarSign,
  Settings,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";

interface PlanejamentoData {
  totalMonthlyIncome: number;
  investmentsAmount: number;
  expensesAmount: number;
  leisureAmount: number;
  investmentsPercentage: number;
  expensesPercentage: number;
  leisurePercentage: number;
  // Dados originais opcionais que podem vir da API
  fixedSalary?: number;
  extraIncome?: number;
}

interface ProgressoMensal {
  gastosRealizados: number;
  investimentosRealizados: number;
  diasRestantes: number;
}

export function MonthlyPlanningCard() {
  const { getExpenses } = useExpenses();
  const {
    getAllocation,
    createAllocation,
    updateAllocation,
    previewAllocation,
  } = useIncomeAllocation();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const apiExpenses = await getExpenses();
        if (Array.isArray(apiExpenses)) {
          const convertedExpenses = apiExpenses.map(convertApiExpenseToExpense);
          setExpenses(convertedExpenses);
        } else {
          setExpenses([]);
        }
      } catch (err) {
        console.error("Erro ao carregar despesas:", err);
        setExpenses([]);
      }
    };

    // Primeira carga
    loadExpenses();

    // Escutar evento de nova despesa
    const handleExpenseAdded = () => {
      loadExpenses(); // Atualiza as despesas
    };

    window.addEventListener("expenseAdded", handleExpenseAdded);

    // Cleanup
    return () => {
      window.removeEventListener("expenseAdded", handleExpenseAdded);
    };
  }, [getExpenses]);

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + Number(expense.valor),
    0
  );

  const [planejamento, setPlanejamento] = useState<PlanejamentoData>({
    totalMonthlyIncome: 0,
    investmentsAmount: 0,
    expensesAmount: 0,
    leisureAmount: 0,
    investmentsPercentage: 0,
    expensesPercentage: 0,
    leisurePercentage: 0,
  });

  const [progresso, setProgresso] = useState<ProgressoMensal>({
    gastosRealizados: totalExpenses,
    investimentosRealizados: 0,
    diasRestantes: 0,
  });

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    const loadAllocationData = async () => {
      try {
        setLoading(true);
        const allocationData = (await getAllocation()) as PlanejamentoData;
        if (allocationData) {
          setPlanejamento(allocationData);
          setIsConfigured(allocationData.totalMonthlyIncome > 0);
        }
      } catch (error) {
        console.error("Erro ao carregar alocação:", error);
        setIsConfigured(false);
      } finally {
        setLoading(false);
      }
    };

    loadAllocationData();

    // Calcular dias restantes no mês
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diasRestantes = lastDay.getDate() - today.getDate();

    setProgresso((prev) => ({
      ...prev,
      diasRestantes,
      gastosRealizados: totalExpenses,
    }));
  }, [getAllocation, totalExpenses]);

  const percentualGastosUsado =
    planejamento.expensesAmount > 0
      ? (progresso.gastosRealizados / planejamento.expensesAmount) * 100
      : 0;

  const percentualInvestimento =
    planejamento.investmentsAmount > 0
      ? (progresso.investimentosRealizados / planejamento.investmentsAmount) *
        100
      : 0;

  const saldoRestanteGastos =
    planejamento.expensesAmount - progresso.gastosRealizados;
  const isOverBudget = saldoRestanteGastos < 0;

  const mediaGastosDiaria =
    progresso.diasRestantes > 0
      ? Math.abs(saldoRestanteGastos) / progresso.diasRestantes
      : 0;

  const handleSetupComplete = async (data: any) => {
    try {
      setLoading(true);

      // Se já existe uma alocação, atualizar; se não, criar
      const allocationData = isConfigured
        ? await updateAllocation({
            fixedSalary: data.salarioFixo,
            extraIncome: data.receitasExtras,
            investmentsPercentage: data.metaInvestimento,
            expensesPercentage: data.percentualGastos,
          })
        : await createAllocation({
            fixedSalary: data.salarioFixo,
            extraIncome: data.receitasExtras,
            investmentsPercentage: data.metaInvestimento,
            expensesPercentage: data.percentualGastos,
          });

      setPlanejamento(allocationData as PlanejamentoData);
      setIsConfigured(true);
      setShowSetupModal(false);

      // Disparar evento para notificar outros componentes sobre a atualização da alocação
      window.dispatchEvent(
        new CustomEvent("allocationUpdated", {
          detail: allocationData,
        })
      );
    } catch (error) {
      console.error("Erro ao salvar alocação:", error);
      alert("Erro ao salvar planejamento. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Função para preparar dados iniciais para o modal baseado na alocação atual
  const getInitialDataForModal = () => {
    if (!isConfigured || !planejamento.totalMonthlyIncome) return undefined;

    return {
      salarioFixo: planejamento.fixedSalary || planejamento.totalMonthlyIncome,
      receitasExtras: planejamento.extraIncome || 0,
      metaInvestimento: planejamento.investmentsPercentage,
      percentualGastos: planejamento.expensesPercentage,
    };
  };

  // Se estiver carregando, mostra loading
  if (loading) {
    return (
      <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="ml-2 text-sm text-gray-600">
            Carregando planejamento...
          </span>
        </div>
      </div>
    );
  }

  // Se não estiver configurado, mostra o card de configuração
  if (!isConfigured) {
    return (
      <>
        <div className="bg-gradient-to-br from-blue-50 to-primary-50 border border-primary-200 p-6 rounded-2xl shadow-sm">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="font-bold text-primary-900 mb-2">
              Configure seu Planejamento
            </h3>
            <p className="text-sm text-primary-700 mb-4">
              Defina sua renda e metas para começar o acompanhamento mensal
            </p>
            <button
              onClick={() => setShowSetupModal(true)}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors font-medium"
            >
              Configurar Agora
            </button>
          </div>
        </div>

        {showSetupModal && (
          <InitialSetupModal
            onClose={() => setShowSetupModal(false)}
            onComplete={handleSetupComplete}
            initialData={getInitialDataForModal()}
          />
        )}
      </>
    );
  }

  // Se configurado, mostra o planejamento completo
  return (
    <>
      <div className="bg-white border border-neutral-200/80 p-6 rounded-2xl shadow-sm space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-900">
                Planejamento Mensal
              </h3>
              <p className="text-sm text-neutral-500">
                {progresso.diasRestantes} dias restantes no mês
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowSetupModal(true)}
            className="p-2 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {/* Renda Total */}
        <div className="bg-neutral-50 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-neutral-600">
              Renda Total
            </span>
            <DollarSign className="w-4 h-4 text-neutral-500" />
          </div>
          <p className="text-xl font-bold text-neutral-900">
            R$ {planejamento.totalMonthlyIncome.toLocaleString("pt-BR")}
          </p>
        </div>

        {/* Gastos Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              Gastos do Mês
            </span>
            <span
              className={`text-sm font-bold ${
                isOverBudget ? "text-danger-600" : "text-neutral-600"
              }`}
            >
              {percentualGastosUsado.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isOverBudget
                  ? "bg-gradient-danger"
                  : percentualGastosUsado > 80
                  ? "bg-gradient-warning"
                  : "bg-gradient-primary"
              }`}
              style={{ width: `${Math.min(percentualGastosUsado, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              R$ {totalExpenses.toLocaleString("pt-BR")} de R${" "}
              {planejamento.expensesAmount.toLocaleString("pt-BR")}
            </span>
            <span
              className={`font-medium ${
                isOverBudget ? "text-danger-600" : "text-primary-600"
              }`}
            >
              {isOverBudget ? "+" : ""}R${" "}
              {Math.abs(saldoRestanteGastos).toLocaleString("pt-BR")}{" "}
              {isOverBudget ? "acima" : "restante"}
            </span>
          </div>
        </div>

        {/* Investment Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-neutral-700">
              Meta de Investimento
            </span>
            <span className="text-sm font-bold text-neutral-600">
              {percentualInvestimento.toFixed(1)}%
            </span>
          </div>

          <div className="w-full bg-neutral-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-gradient-success transition-all duration-500"
              style={{ width: `${Math.min(percentualInvestimento, 100)}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-neutral-500">
              R$ {progresso.investimentosRealizados.toLocaleString("pt-BR")} de
              R$ {planejamento.investmentsAmount.toLocaleString("pt-BR")}
            </span>
            <span className="font-medium text-success-600">
              R${" "}
              {(
                planejamento.investmentsAmount -
                progresso.investimentosRealizados
              ).toLocaleString("pt-BR")}{" "}
              restante
            </span>
          </div>
        </div>

        {/* Daily Budget Insight */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            {isOverBudget ? (
              <TrendingDown className="w-4 h-4 text-danger-500" />
            ) : (
              <TrendingUp className="w-4 h-4 text-success-500" />
            )}
            <span className="text-sm font-medium text-neutral-700">
              {isOverBudget ? "Atenção ao Orçamento" : "Você pode gastar"}
            </span>
          </div>
          <p className="text-lg font-bold text-neutral-900">
            R$ {mediaGastosDiaria.toLocaleString("pt-BR")} / dia
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {isOverBudget
              ? "Você precisa economizar nos próximos dias"
              : "Para manter-se dentro do orçamento"}
          </p>
        </div>
      </div>

      {showSetupModal && (
        <InitialSetupModal
          onClose={() => setShowSetupModal(false)}
          onComplete={handleSetupComplete}
          initialData={getInitialDataForModal()}
        />
      )}
    </>
  );
}
