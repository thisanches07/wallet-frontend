import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { OfflineMessage } from "../../OfflineMessage";
import BalanceCard from "./BalanceCard";
import ExpensesCard from "./ExpensesCard";
import ImprovedQuickActionsCard from "./ImprovedQuickActionsCard";
import ReceipesCard from "./ReceipesCard";

export default function SummaryCards() {
  const { selectedMonth } = useSelectedMonth();
  const { expenses, incomes, loading, error, isOffline, refresh } =
    useMonthlyData();

  if (isOffline) {
    return (
      <div className="col-span-full">
        <OfflineMessage
          message="Não foi possível conectar ao servidor para carregar os dados financeiros"
          onRetry={refresh}
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
      <BalanceCard />
      <ReceipesCard />
      <ExpensesCard />
      <ImprovedQuickActionsCard />
    </div>
  );
}
