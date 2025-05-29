// components/dashboard/cards/charts/CustomTooltip.tsx
export function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) {
  if (active && payload && payload.length) {
    const { value } = payload[0];
    return (
      <div className="bg-white p-2 rounded shadow text-sm border border-gray-200 max-w-[220px]">
        <p className="text-gray-800 font-medium">{label}</p>
        <p className="text-gray-600">R$ {value.toFixed(2)}</p>
      </div>
    );
  }
  return null;
}
