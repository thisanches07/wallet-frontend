import SummaryCards from "@/components/dashboard/cards/SummaryCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExpensesBarChart } from "@/components/dashboard/ExpensesBarChart";
import { ExpensesComparison } from "@/components/dashboard/ExpensesComparison";
import { MonthlyExpenses } from "@/components/dashboard/MonthlyExpenses";
import { MonthlyPlanningCard } from "@/components/dashboard/MonthlyPlanningCard";
import { MonthSidebar } from "@/components/dashboard/MonthSidebar";
import { NotificationCenter } from "@/components/dashboard/NotificationCenter";
import { Topbar } from "@/components/Topbar";
import { MonthlyDataProvider } from "@/context/MonthlyDataContext";
import {
  SelectedMonthProvider,
  useSelectedMonth,
} from "@/context/SelectedMonthContext";
import { useAuth } from "@/hooks/useAuth";
import { DashboardData } from "@/types/dashboard";
import { TrendingUp } from "lucide-react";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  return (
    <SelectedMonthProvider>
      <MonthlyDataProvider>
        <DashboardContent />
      </MonthlyDataProvider>
    </SelectedMonthProvider>
  );
}

function DashboardContent() {
  const { selectedMonth, setSelectedMonth } = useSelectedMonth();
  const mockData: DashboardData = {
    income: 5000,
    expenses: 4200,
    invested: 400,
    categories: [
      { name: "Essenciais", value: 65 },
      { name: "Lazer", value: 20 },
      { name: "Investimentos", value: 15 },
    ],
    recentTransactions: [
      { date: "2025-05-25", type: "Renda", value: 4800, category: "Salário" },
      { date: "2025-05-26", type: "Despesa", value: 1200, category: "Aluguel" },
    ],
  };

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
        setData(mockData);
      } else if (process.env.NEXT_PUBLIC_NODE_ENV === "development") {
        setData(mockData);
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
            <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-primary-400 rounded-full animate-ping"></div>
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

      <div className="flex flex-1">
        <MonthSidebar selected={selectedMonth} onSelect={setSelectedMonth} />

        <main className="flex-1 p-3 lg:p-6 overflow-hidden">
          <div className="max-w-8xl mx-auto h-full flex flex-col">
            <DashboardHeader selectedMonth={monthAbbr[selectedMonth]} />

            {/* Layout principal responsivo */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 flex-1 min-h-0">
              {/* Área principal de conteúdo */}
              <div className="xl:col-span-9 space-y-6 overflow-y-auto pr-2">
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
                  <div>
                    <ExpensesBarChart />
                  </div>
                  <div>
                    <ExpensesComparison />
                  </div>
                </div>

                {/* Insights e Recomendações */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 animate-slide-in [animation-delay:200ms]">
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
                </div>
              </div>

              {/* Sidebar direita */}
              <div className="xl:col-span-3 flex justify-center overflow-y-auto animate-slide-in [animation-delay:300ms]">
                <div className="w-full max-w-sm space-y-4 sticky top-6">
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
