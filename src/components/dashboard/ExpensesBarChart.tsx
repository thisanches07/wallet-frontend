// components/dashboard/ExpensesBarChart.tsx
import {
  Bar,
  BarChart,
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

const COLORS = ["#60a5fa", "#f87171"];

export function ExpensesBarChart() {
  return (
    <div className="bg-[#1a1a1d] p-4 rounded grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="h-80 w-full">
        <h2 className="text-lg font-semibold mb-2 text-white">
          Gastos por Categoria
        </h2>
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={mockData}
            margin={{ top: 10, right: 10, left: 40, bottom: 10 }}
          >
            <XAxis type="number" stroke="#ccc" />
            <YAxis dataKey="category" type="category" stroke="#ccc" />
            <Tooltip />
            <Bar dataKey="indicado" fill={COLORS[0]} name="Indicado" />
            <Bar dataKey="gasto" fill={COLORS[1]} name="Gasto" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
