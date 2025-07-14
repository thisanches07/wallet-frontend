import BalanceCard from "./BalanceCard";
import ExpensesCard from "./ExpensesCard";
import ImprovedQuickActionsCard from "./ImprovedQuickActionsCard";
import ImprovedReceipesCard from "./ImprovedReceipesCard";

export default function SummaryCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <BalanceCard />
      <ImprovedReceipesCard />
      <ExpensesCard />
      <ImprovedQuickActionsCard />
    </div>
  );
}
