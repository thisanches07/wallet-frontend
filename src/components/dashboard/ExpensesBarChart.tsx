import { useCategories } from "@/context/CategoriesContext";
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

// Paleta de cores profissionais para categorias
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
  const { categories, getCategoryById } = useCategories();

  // Processar dados de despesas por categoria
  const chartData = useMemo(() => {
    if (!expenses.length || loading) return [];

    // Função para normalizar strings (remover acentos e converter para minúsculo)
    const normalizeString = (str: string) => {
      return str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, ""); // Remove acentos
    };

    // Função para encontrar categoria por nome (mesmo com acentos diferentes)
    const findCategoryByName = (categoryName: string) => {
      const normalizedName = normalizeString(categoryName);
      return categories.find(
        (cat) => normalizeString(cat.name) === normalizedName
      );
    };

    // Agrupar despesas por categoria
    const categoryGroups = expenses.reduce((acc, expense) => {
      const categoryId = expense.categoria;

      // Primeiro tenta buscar por ID (como antes)
      let category = getCategoryById(categoryId);

      // Se não encontrar por ID, tenta buscar por nome
      if (!category && typeof categoryId === "string") {
        category = findCategoryByName(categoryId);
      }

      const categoryName = category?.name || "Outros";
      const categoryKey = category?.id?.toString() || categoryId; // Usar ID da categoria como chave

      if (!acc[categoryKey]) {
        acc[categoryKey] = {
          category: categoryKey,
          categoryName,
          realizado: 0,
          count: 0,
        };
      }

      acc[categoryKey].realizado += Number(expense.valor);
      acc[categoryKey].count += 1;

      return acc;
    }, {} as Record<string, Omit<CategoryData, "color" | "percentage">>);

    // Converter para array e calcular percentuais
    const total = Object.values(categoryGroups).reduce(
      (sum, cat) => sum + cat.realizado,
      0
    );

    const processedData = Object.values(categoryGroups)
      .map((cat, index) => ({
        ...cat,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
        percentage: total > 0 ? (cat.realizado / total) * 100 : 0,
      }))
      .sort((a, b) => b.realizado - a.realizado) // Ordenar por valor decrescente
      .slice(0, 8); // Mostrar apenas top 8 categorias

    return processedData;
  }, [expenses, loading, getCategoryById]);

  const totalExpenses = useMemo(() => {
    return chartData.reduce((sum, item) => sum + item.realizado, 0);
  }, [chartData]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
          <p className="font-semibold text-gray-900 mb-2">
            {data.categoryName}
          </p>
          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Valor:</span>{" "}
              {formatCurrency(data.realizado)}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Participação:</span>{" "}
              {data.percentage.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Transações:</span> {data.count}
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
        <div className="animate-pulse">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
            <div>
              <div className="h-5 bg-gray-200 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-64"></div>
            </div>
          </div>
          <div className="h-80 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (!chartData.length) {
    return (
      <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Gastos por Categoria
            </h2>
            <p className="text-sm text-neutral-600">
              Análise detalhada dos seus gastos
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center h-80 text-gray-500">
          <BarChart3 className="w-16 h-16 mb-4 opacity-30" />
          <p className="text-lg font-medium mb-2">Nenhuma despesa encontrada</p>
          <p className="text-sm text-center">
            Adicione algumas despesas para ver a análise por categoria
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-sm transition-all duration-300 hover:shadow-md">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900">
              Gastos por Categoria
            </h2>
            <p className="text-sm text-neutral-600">
              Análise detalhada dos seus gastos mensais
            </p>
          </div>
        </div>

        {/* Total Summary */}
        <div className="text-right">
          <div className="text-2xl font-bold text-neutral-900">
            {formatCurrency(totalExpenses)}
          </div>
          <div className="text-sm text-neutral-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {chartData.length} categorias
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={chartData}
            margin={{ top: 10, right: 30, left: 80, bottom: 10 }}
            barGap={12}
            barSize={24}
          >
            <XAxis
              type="number"
              stroke="#6B7280"
              tick={{ fontSize: 11, fill: "#6B7280", fontWeight: 500 }}
              tickLine={{ stroke: "#E5E7EB" }}
              axisLine={{ stroke: "#E5E7EB" }}
              tickFormatter={formatCurrency}
            />
            <YAxis
              dataKey="categoryName"
              type="category"
              stroke="#6B7280"
              tick={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
              tickLine={false}
              axisLine={false}
              width={75}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="realizado"
              radius={[0, 8, 8, 0]}
              className="drop-shadow-sm"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend/Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {chartData.slice(0, 4).map((item, index) => (
            <div key={item.category} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <div className="min-w-0 flex-1">
                <div className="text-xs font-medium text-gray-900 truncate">
                  {item.categoryName}
                </div>
                <div className="text-xs text-gray-500">
                  {item.percentage.toFixed(1)}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
