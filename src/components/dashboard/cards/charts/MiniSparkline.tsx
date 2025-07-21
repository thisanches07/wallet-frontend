import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface MiniSparklineProps {
  data: { mes: string; saldo: number }[];
  media?: number;
}

export function MiniSparkline({ data, media }: MiniSparklineProps) {
  return (
    <div className="w-full h-12">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, bottom: 5, left: 10, right: 10 }}
        >
          <XAxis dataKey="mes" hide />
          <YAxis domain={["auto", "auto"]} hide />
          <Tooltip
            contentStyle={{ fontSize: "0.75rem" }}
            formatter={(value) => `R$ ${value}`}
          />
          <Line
            type="monotone"
            dataKey="saldo"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
      {media !== undefined && (
        <p className="text-xs text-gray-500 text-right mt-2 mb-1">
          Média 3 meses: R$ {media.toFixed(2)}
        </p>
      )}
    </div>
  );
}
