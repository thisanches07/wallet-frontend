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

// Paleta de cores profissionais para categorys
const CATEGORY_COLORS = [
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#6366F1", // Indigo
  "#EC4899", // Pink
  "#14B8A6", // Teal
  "#F97316", // Orange
  "#84CC16", // Lime
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

  // Processar dados de despesas por category
  const chartData = useMemo(() => {
    if (!expenses || expenses.length === 0 || loading) return [];

    // Agrupar despesas por category
    const categoryGroups = expenses.reduce((acc, expense) => {
      const categoryName = expense.category || "Outros";
      const category = getCategoryByName(categoryName);

      const displayName = category?.name || categoryName;
      const categoryKey = displayName;

      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          category: categoryKey,
          categoryName: displayName,
          realizado: 0,
          count: 0,
        };
      }

      acc[categoryKey].realizado += Number(expense.valor) || 0;
      acc[categoryKey].count += 1;

      return acc;
    }, {} as Record<string, Omit<CategoryData, "color" | "percentage">>);

    // Converter para array e adicionar cores e percentuais
    const totalExpenses = Object.values(categoryGroups).reduce(
      (sum, cat) => sum + cat.realizado,
      0
    );

    return Object.values(categoryGroups)
      .map((item, index) => ({
        ...item,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage:
          totalExpenses > 0 ? (item.realizado / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.realizado - a.realizado)
      .slice(0, 10); // Limitar a 10 categorys
  }, [expenses, loading]);

  const totalExpenses = chartData.reduce(
    (sum, item) => sum + item.realizado,
    0
  );

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Despesas por Categoria
            </h3>
            <p className="text-sm text-gray-600">Distribuição de gastos</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Despesas por Categoria
            </h3>
            <p className="text-sm text-gray-600">Distribuição de gastos</p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BarChart3 className="w-12 h-12 mb-4 opacity-50" />
          <p className="text-sm">Nenhuma despesa encontrada</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.categoryName}</p>
          <p className="text-sm text-gray-600">
            {`R$ ${data.realizado.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}`}
          </p>
          <p className="text-xs text-gray-500">
            {`${data.percentage.toFixed(1)}% do total`}
          </p>
          <p className="text-xs text-gray-500">
            {`${data.count} transação${data.count > 1 ? "ões" : ""}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Despesas por Categoria
            </h3>
            <p className="text-sm text-gray-600">Distribuição de gastos</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-green-600" />
          <span className="font-medium text-gray-900">
            R${" "}
            {totalExpenses.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
            })}
          </span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60,
            }}
          >
            <XAxis
              dataKey="categoryName"
              angle={-45}
              textAnchor="end"
              height={60}
              interval={0}
              fontSize={12}
              tick={{ fill: "#6B7280" }}
            />
            <YAxis
              fontSize={12}
              tick={{ fill: "#6B7280" }}
              tickFormatter={(value) =>
                `R$ ${value.toLocaleString("pt-BR", {
                  minimumFractionDigits: 0,
                })}`
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

      {/* Legenda com percentuais */}
      <div className="mt-6 space-y-2">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          Distribuição por category:
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {chartData.slice(0, 6).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-600 flex-1 truncate">
                {item.categoryName}
              </span>
              <span className="text-sm font-medium text-gray-900">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
