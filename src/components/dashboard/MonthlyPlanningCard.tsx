import { InitialSetupModal } from "@/components/dashboard/modals/InitialSetupModal";
import { useExpenses } from "@/hooks/useApi";
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
  rendaTotal: number;
  metaInvestimento: number;
  limitesGastos: number;
  reservaLivre: number;
}

interface ProgressoMensal {
  gastosRealizados: number;
  investimentosRealizados: number;
  diasRestantes: number;
}

export function MonthlyPlanningCard() {
  const { getExpenses } = useExpenses();
  const [expenses, setExpenses] = useState<Expense[]>([]);

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
    rendaTotal: 0,
    metaInvestimento: 0,
    limitesGastos: 0,
    reservaLivre: 0,
  });

  const [progresso, setProgresso] = useState<ProgressoMensal>({
    gastosRealizados: totalExpenses,
    investimentosRealizados: 0,
    diasRestantes: 0,
  });

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    // Carregar dados do planejamento
    const savedPlanejamento = localStorage.getItem("planejamentoFinanceiro");
    if (savedPlanejamento) {
      const data = JSON.parse(savedPlanejamento);
      setPlanejamento(data);
      setIsConfigured(data.rendaTotal > 0);
    }

    // Calcular dias restantes no mês
    const today = new Date();
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const diasRestantes = lastDay.getDate() - today.getDate();

    // Carregar gastos realizados
    const gastosRealizados = parseFloat(
      localStorage.getItem("gastosTotal") || "0"
    );

    setProgresso({
      gastosRealizados,
      investimentosRealizados: 0,
      diasRestantes,
    });
  }, []);

  const percentualGastosUsado =
    planejamento.limitesGastos > 0
      ? (progresso.gastosRealizados / planejamento.limitesGastos) * 100
      : 0;

  const percentualInvestimento =
    planejamento.metaInvestimento > 0
      ? (progresso.investimentosRealizados / planejamento.metaInvestimento) *
        100
      : 0;

  const saldoRestanteGastos =
    planejamento.limitesGastos - progresso.gastosRealizados;
  const isOverBudget = saldoRestanteGastos < 0;

  const mediaGastosDiaria =
    progresso.diasRestantes > 0
      ? Math.abs(saldoRestanteGastos) / progresso.diasRestantes
      : 0;

  const handleSetupComplete = (data: any) => {
    const totalRenda = data.salarioFixo + data.receitasExtras;
    const valorInvestimento = (totalRenda * data.metaInvestimento) / 100;
    const valorGastos = (totalRenda * data.percentualGastos) / 100;
    const valorLivre = totalRenda - valorInvestimento - valorGastos;

    const novoPlanejamento = {
      rendaTotal: totalRenda,
      metaInvestimento: valorInvestimento,
      limitesGastos: valorGastos,
      reservaLivre: valorLivre,
    };

    localStorage.setItem(
      "planejamentoFinanceiro",
      JSON.stringify(novoPlanejamento)
    );
    setPlanejamento(novoPlanejamento);
    setIsConfigured(true);
    setShowSetupModal(false);
  };

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
            R$ {planejamento.rendaTotal.toLocaleString("pt-BR")}
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
              {planejamento.limitesGastos.toLocaleString("pt-BR")}
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
              R$ {planejamento.metaInvestimento.toLocaleString("pt-BR")}
            </span>
            <span className="font-medium text-success-600">
              R${" "}
              {(
                planejamento.metaInvestimento -
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
        />
      )}
    </>
  );
}
