import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const mockData = [
  { category: "Moradia", indicado: 1500, gasto: 1700 },
  { category: "Transporte", indicado: 500, gasto: 400 },
  { category: "Alimentação", indicado: 800, gasto: 950 },
  { category: "Lazer", indicado: 300, gasto: 600 },
  { category: "Outros", indicado: 200, gasto: 180 },
];

const COLORS = {
  indicado: "#0ea5e9", // primary blue
  gasto: "#8b5cf6", // purple
};

export function ExpensesBarChart() {
  return (
    <div className="bg-white border border-neutral-200 p-6 rounded-card shadow-card transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-10 h-10 bg-primary-100 rounded-card">
          <BarChart3 className="w-5 h-5 text-primary-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">
            Gastos por Categoria
          </h2>
          <p className="text-sm text-neutral-600">
            Comparação entre orçado e realizado
          </p>
        </div>
      </div>

      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={mockData}
            margin={{ top: 10, right: 30, left: 60, bottom: 10 }}
            barGap={8}
            barSize={20}
          >
            <XAxis
              type="number"
              stroke="#6b7280"
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickLine={{ stroke: "#e5e7eb" }}
              axisLine={{ stroke: "#e5e7eb" }}
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke="#6b7280"
              tick={{ fontSize: 12, fill: "#374151" }}
              tickLine={false}
              axisLine={false}
              width={80}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                fontSize: "14px",
              }}
              labelStyle={{ color: "#374151", fontWeight: "600" }}
              formatter={(value: number, name: string) => [
                `R$ ${value.toLocaleString("pt-BR")}`,
                name === "indicado" ? "Orçado" : "Realizado",
              ]}
            />
            <Legend
              wrapperStyle={{
                paddingTop: "20px",
                fontSize: "14px",
              }}
              formatter={(value: string) => (
                <span style={{ color: "#374151", fontWeight: "500" }}>
                  {value === "indicado" ? "Orçado" : "Realizado"}
                </span>
              )}
            />
            <Bar
              dataKey="indicado"
              fill={COLORS.indicado}
              radius={[0, 4, 4, 0]}
            />
            <Bar dataKey="gasto" fill={COLORS.gasto} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
