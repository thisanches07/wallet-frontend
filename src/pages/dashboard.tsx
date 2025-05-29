import { SummaryCards } from "@/components/dashboard/cards/SummaryCards";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ExpensesBarChart } from "@/components/dashboard/ExpensesBarChart";
import { ExpensesComparison } from "@/components/dashboard/ExpensesComparison";
import { MonthlyExpenses } from "@/components/dashboard/MonthlyExpenses";
import { MonthSidebar } from "@/components/dashboard/MonthSidebar";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/hooks/useAuth";
import { DashboardData } from "@/types/dashboard";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function DashboardPage() {
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
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth()
  );

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
    return <p className="text-white text-center mt-10">Carregando...</p>;

  return (
    <div className="min-h-screen flex flex-col">
      <Topbar />

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] flex-1">
        <MonthSidebar selected={selectedMonth} onSelect={setSelectedMonth} />

        <main className="p-6 h-[calc(100vh-64px)] overflow-hidden">
          <DashboardHeader selectedMonth={monthAbbr[selectedMonth]} />

          <div className="flex flex-col lg:flex-row gap-6 mt-6 h-full">
            <div className="flex-1 space-y-6 overflow-y-auto pr-2">
              <SummaryCards data={data} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpensesBarChart />
                <ExpensesComparison />
              </div>
            </div>

            <div className="w-full lg:w-[320px] h-full overflow-y-auto">
              <MonthlyExpenses />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
