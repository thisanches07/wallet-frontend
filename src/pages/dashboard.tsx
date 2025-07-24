import { ClientOnly } from "@/components/ClientOnly";
import SummaryCards from "@/components/dashboard/cards/SummaryCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExpensesBarChart } from "@/components/dashboard/ExpensesBarChart";
import { ExpensesComparison } from "@/components/dashboard/ExpensesComparison";
import { MonthlyExpenses } from "@/components/dashboard/MonthlyExpenses";
import { MonthlyPlanningCard } from "@/components/dashboard/MonthlyPlanningCard";
import { MonthSidebar } from "@/components/dashboard/MonthSidebar";
import MonthSelectorMobile from "@/components/dashboard/MonthSidebarMobile";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Topbar } from "@/components/Topbar";
import { MonthlyDataProvider } from "@/context/MonthlyDataContext";
import {
  SelectedMonthProvider,
  useSelectedMonth,
} from "@/context/SelectedMonthContext";
import { SummaryProvider } from "@/context/SummaryContext";
import { useAuth } from "@/hooks/useAuth";
import { DashboardData } from "@/types/dashboard";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <ClientOnly
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <SelectedMonthProvider>
        <SummaryProvider>
          <MonthlyDataProvider>
            <DashboardContent />
          </MonthlyDataProvider>
        </SummaryProvider>
      </SelectedMonthProvider>
    </ClientOnly>
  );
}

function DashboardContent() {
  const { selectedMonth, setSelectedMonth } = useSelectedMonth();

  // Remover mock data - usar apenas dados reais do backend
  const { user, loading } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);

  const monthAbbr = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  useEffect(() => {
    if (!loading) {
      if (user) {
        // TODO: Carregar dados reais do backend
        // setData(realDataFromBackend);

        // Por enquanto, mostrar dashboard vazio para usuários reais
        setData({
          income: 0,
          expenses: 0,
          invested: 0,
          categories: [],
          recentTransactions: [],
        });
      } else {
        router.push("/");
      }
    }
  }, [user, loading, router]);

  if (loading || !data)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="flex flex-col items-center gap-6 p-8">
          {/* Loading spinner melhorado */}
          <div className="relative">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-blue-400 rounded-full animate-ping"></div>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-neutral-800 mb-2">
              Carregando dashboard...
            </p>
            <p className="text-sm text-neutral-600">
              Preparando seus dados financeiros
            </p>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <Topbar />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on mobile, shown on larger screens */}
        <div className="hidden lg:block">
          <MonthSidebar selected={selectedMonth} onSelect={setSelectedMonth} />
          <MonthSelectorMobile
            selected={selectedMonth}
            onSelect={setSelectedMonth}
          />
        </div>

        <main className="flex-1 p-3 lg:p-6 overflow-y-auto">
          <div className="max-w-8xl mx-auto h-full flex flex-col">
            <DashboardHeader selectedMonth={monthAbbr[selectedMonth]} />

            {/* Mobile Month Selector - Only shown on mobile */}
            <div className="lg:hidden mb-4">
              <div className="bg-white rounded-xl border border-neutral-200 p-4">
                <h3 className="text-sm font-semibold text-neutral-700 mb-3">
                  Selecionar Mês
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {monthAbbr
                    .slice(0, new Date().getMonth() + 1)
                    .map((month, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedMonth(index)}
                        className={`p-2 rounded-lg text-xs font-medium transition-all ${
                          selectedMonth === index
                            ? "bg-blue-500 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        {month}
                      </button>
                    ))}
                </div>
              </div>
            </div>

            {/* Layout principal responsivo */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Área principal de conteúdo */}
              <div className="xl:col-span-9 space-y-4 lg:space-y-6 overflow-y-auto pr-0 xl:pr-2">
                {/* Cards de resumo */}
                <div className="animate-slide-in">
                  <SummaryCards />
                </div>

                {/* Seção de Transações - Posição privilegiada */}
                <div className="animate-slide-in [animation-delay:50ms]">
                  <MonthlyExpenses />
                </div>

                {/* Gráficos principais */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-slide-in [animation-delay:100ms]">
                  <div className="min-w-0">
                    <ExpensesBarChart />
                  </div>
                  <div className="min-w-0">
                    <ExpensesComparison />
                  </div>
                </div>

                {/* Insights e Recomendações */}
                {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 animate-slide-in [animation-delay:200ms]">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-blue-900 mb-2">
                        💡 Insights Inteligentes
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">
                            Oportunidade de Economia
                          </h4>
                          <p className="text-sm text-blue-700">
                            Você gastou 15% a mais em Lazer este mês. Considere
                            reduzir R$ 150 para atingir sua meta.
                          </p>
                        </div>
                        <div className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-blue-100">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">
                            Meta de Investimento
                          </h4>
                          <p className="text-sm text-blue-700">
                            Você está R$ 200 abaixo da meta de investimento.
                            Transfira o valor até dia 25.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                 </div> */}
              </div>

              {/* Sidebar direita */}
              <div className="xl:col-span-3 flex justify-center overflow-y-auto animate-slide-in [animation-delay:300ms]">
                <div className="w-full max-w-sm space-y-4 xl:sticky xl:top-6">
                  <MonthlyPlanningCard />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Notification Center */}
      <NotificationCenter />

      {/* Componente de Debug - Apenas para Desenvolvimento */}
      {/* <AuthDebug /> */}
    </div>
  );
}
