import { BalanceCard } from "@/components/dashboard/cards/BalanceCard";
import { ExpensesCard } from "@/components/dashboard/cards/ExpensesCard";
import { ReceipesCard } from "@/components/dashboard/cards/ReceipesCard";
import { DashboardData } from "@/types/dashboard";

export function SummaryIndicators({ data }: { data: DashboardData }) {
  const saldo = data.income - data.expenses - data.invested;
  const total = data.income + data.invested - data.expenses;

  const cards = [
    { label: "Balanço Total", value: total, color: "text-yellow-400" },
    { label: "Receitas", value: data.income, color: "text-green-400" },
    { label: "Despesas", value: data.expenses, color: "text-red-400" },
    { label: "Investido", value: data.invested, color: "text-blue-400" },
    { label: "Saldo", value: saldo, color: "text-white" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-stretch">
      <BalanceCard data={data} />
      <ReceipesCard data={data} />
      <ExpensesCard data={data} />
    </div>
  );
}
