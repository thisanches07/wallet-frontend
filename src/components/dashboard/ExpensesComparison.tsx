const mockData = [
  { category: "Moradia", indicado: 1500, gasto: 1700 },
  { category: "Transporte", indicado: 500, gasto: 400 },
  { category: "Alimentação", indicado: 800, gasto: 950 },
  { category: "Lazer", indicado: 300, gasto: 600 },
  { category: "Outros", indicado: 200, gasto: 180 },
];

export function ExpensesComparison() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">
        Análise por Categoria
      </h2>

      <table className="w-full text-sm text-gray-700 table-auto border-separate border-spacing-y-2 ">
        <thead className="text-xs uppercase text-gray-500 text-left">
          <tr>
            <th>Categoria</th>
            <th>Indicado</th>
            <th>Gasto</th>
            <th className="text-right">Diferença</th>
          </tr>
        </thead>
        <tbody>
          {mockData.map((item) => {
            const diff = item.gasto - item.indicado;
            const excedeu = diff > 0;

            return (
              <tr key={item.category} className="bg-gray-50 rounded-md">
                <td className="py-2 px-2 font-medium">{item.category}</td>
                <td className="py-2 px-2 text-blue-500">
                  R$ {item.indicado.toFixed(2)}
                </td>
                <td className="py-2 px-2 text-yellow-700 font-medium">
                  R$ {item.gasto.toFixed(2)}
                </td>

                <td className="py-2 px-2 text-right font-semibold">
                  <span
                    className={excedeu ? "text-rose-500" : "text-emerald-500"}
                  >
                    {excedeu ? "+" : "-"}R$ {Math.abs(diff).toFixed(2)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
