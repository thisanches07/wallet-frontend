// components/dashboard/ExpensesBarChart.tsx

const mockData = [
  { category: "Moradia", indicado: 1500, gasto: 1700 },
  { category: "Transporte", indicado: 500, gasto: 400 },
  { category: "Alimentação", indicado: 800, gasto: 950 },
  { category: "Lazer", indicado: 300, gasto: 600 },
  { category: "Outros", indicado: 200, gasto: 180 },
];

const COLORS = ["#60a5fa", "#f87171"];

export function ExpensesComparison() {
  return (
    <div className="bg-[#1a1a1d] p-4 rounded grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div>
        <h2 className="text-lg font-semibold mb-2 text-white">
          Resumo por Categoria
        </h2>
        <table className="w-full text-sm text-gray-300">
          <thead className="text-xs uppercase text-left text-gray-500">
            <tr>
              <th className="py-2">Categoria</th>
              <th className="py-2">Indicado</th>
              <th className="py-2">Gasto</th>
            </tr>
          </thead>
          <tbody>
            {mockData.map((item) => (
              <tr key={item.category} className="border-b border-gray-700">
                <td className="py-2">{item.category}</td>
                <td className="py-2 text-blue-400">
                  R$ {item.indicado.toFixed(2)}
                </td>
                <td className="py-2 text-red-400">
                  R$ {item.gasto.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
