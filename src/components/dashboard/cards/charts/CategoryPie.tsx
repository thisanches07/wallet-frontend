import { CustomTooltip } from "@/components/dashboard/cards/charts/CustomTooltip";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#60a5fa", "#f87171", "#fbbf24", "#34d399", "#a78bfa"];

export function CategoryPie({
  data,
}: {
  data: { nome: string; valor: number }[];
}) {
  const total = data.reduce((acc, cur) => acc + cur.valor, 0);
  const formatted = data.map((c) => ({
    ...c,
    percent: ((c.valor / total) * 100).toFixed(1),
  }));

  return (
    <div className="w-[130px] h-[130px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={formatted}
            dataKey="valor"
            nameKey="nome"
            cx="50%"
            cy="50%"
            outerRadius={55}
            innerRadius={25}
            paddingAngle={2}
            stroke="#fff"
          >
            {formatted.map((_, i) => (
              <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>

          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
