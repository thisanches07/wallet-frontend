// types/dashboard.ts

export type Category = {
  name: string;
  value: number;
};

export type Transaction = {
  date: string;
  type: string;
  value: number;
  category: string;
};

export type DashboardData = {
  income: number;
  expenses: number;
  invested: number;
  categories: Category[];
  recentTransactions: Transaction[];
};
