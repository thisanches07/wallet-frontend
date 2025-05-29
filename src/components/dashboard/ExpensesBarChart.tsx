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
  indicado: "#3b82f6", // azul
  gasto: "#8b5cf6", // roxo elegante
};

export function ExpensesBarChart() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Gastos por Categoria
      </h2>
      <div className="h-80 w-full">
        <ResponsiveContainer>
          <BarChart
            layout="vertical"
            data={mockData}
            margin={{ top: 10, right: 10, left: 40, bottom: 10 }}
            barGap={4}
            barSize={18}
          >
            <XAxis
              type="number"
              stroke="#4b5563" // text-gray-700 - agora mais visível
              tick={{ fontSize: 12 }}
            />
            <YAxis
              dataKey="category"
              type="category"
              stroke="#4b5563"
              tick={{ fontSize: 12 }}
              width={100}
            />
            <Tooltip
              formatter={(value: number, name: string) => [
                `R$ ${value.toFixed(2)}`,
                name.toLowerCase() === "gasto" ? "Gasto" : "Indicado",
              ]}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelClassName="text-sm font-medium text-gray-700"
            />
            <Legend
              wrapperStyle={{ fontSize: 12 }}
              align="center"
              iconType="circle"
            />
            <Bar
              dataKey="indicado"
              fill={COLORS.indicado}
              radius={[0, 4, 4, 0]}
              name="Indicado"
            />
            <Bar
              dataKey="gasto"
              fill={COLORS.gasto}
              radius={[0, 4, 4, 0]}
              name="Gasto"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
