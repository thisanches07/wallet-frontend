import { getCategoryByName } from "@/constants/categories";
import { useMonthlyData } from "@/context/MonthlyDataContext";
import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { BarChart3, TrendingUp } from "lucide-react";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const CATEGORY_COLORS = [
  "#3B82F6",
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#6366F1",
  "#EC4899",
  "#14B8A6",
  "#F97316",
  "#84CC16",
];

interface CategoryData {
  category: string;
  categoryName: string;
  realizado: number;
  color: string;
  percentage: number;
  count: number;
}

export function ExpensesBarChart() {
  const { selectedMonth, selectedYear } = useSelectedMonth();
  const { expenses, loading } = useMonthlyData(selectedMonth, selectedYear);

  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0 || loading) return [];

    const grouped = expenses.reduce((acc, expense) => {
      const categoryName = expense.category || "Outros";
      const category = getCategoryByName(categoryName);
      const key = category?.name || categoryName;

      if (!acc[key]) {
        acc[key] = {
          category: key,
          categoryName: key,
          realizado: 0,
          count: 0,
        };
      }

      acc[key].realizado += Number(expense.valor) || 0;
      acc[key].count += 1;

      return acc;
    }, {} as Record<string, Omit<CategoryData, "color" | "percentage">>);

    const total = Object.values(grouped).reduce(
      (sum, cat) => sum + cat.realizado,
      0
    );

    return Object.values(grouped)
      .map((item, index) => ({
        ...item,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage: total > 0 ? (item.realizado / total) * 100 : 0,
      }))
      .sort((a, b) => b.realizado - a.realizado)
      .slice(0, 10);
  }, [expenses, loading]);

  const totalExpenses = chartData.reduce(
    (sum, item) => sum + item.realizado,
    0
  );

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Despesas por Categoria
          </h3>
        </div>
        <div className="flex justify-center items-center h-48">
          <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900">
            Despesas por Categoria
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center h-48 text-gray-500">
          <BarChart3 className="w-10 h-10 mb-2 opacity-40" />
          <p className="text-sm">Nenhuma despesa encontrada</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow">
          <p className="font-medium text-gray-900">{data.categoryName}</p>
          <p className="text-sm text-gray-600">
            R${" "}
            {data.realizado.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500">
            {data.percentage.toFixed(1)}% do total
          </p>
          <p className="text-xs text-gray-500">
            {data.count} transaç{data.count > 1 ? "ões" : "ão"}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 border border-gray-100">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-3 mb-2 sm:mb-0">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900">
              Despesas por Categoria
            </h3>
            <p className="text-sm text-gray-600 hidden sm:block">
              Distribuição de gastos mensais
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">
            R${" "}
            {totalExpenses.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Gráfico responsivo */}
      <div className="h-72 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
          >
            <XAxis
              dataKey="categoryName"
              angle={-45}
              textAnchor="end"
              interval={0}
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              height={60}
            />
            <YAxis
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              tickFormatter={(v) =>
                `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`
              }
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="realizado" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legenda responsiva */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
        {chartData.slice(0, 8).map((item) => (
          <div key={item.category} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs sm:text-sm text-gray-600 truncate">
              {item.categoryName}
            </span>
            <span className="text-xs sm:text-sm font-medium text-gray-800 ml-auto">
              {item.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ExpensesBarChart;
