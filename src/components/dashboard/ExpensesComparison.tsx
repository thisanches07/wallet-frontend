import { Eye, FileText, TrendingDown, TrendingUp, X } from "lucide-react";
import { useState } from "react";

const mockData = [
  { category: "Moradia", indicado: 1500, gasto: 1700 },
  { category: "Transporte", indicado: 500, gasto: 400 },
  { category: "Alimentação", indicado: 800, gasto: 950 },
  { category: "Lazer", indicado: 300, gasto: 600 },
  { category: "Outros", indicado: 200, gasto: 180 },
];

export function ExpensesComparison() {
  const [showModal, setShowModal] = useState(false);

  // Mostrar apenas as 3 primeiras categorias no componente compacto
  const compactData = mockData.slice(0, 3);
  const totalIndicado = mockData.reduce((acc, item) => acc + item.indicado, 0);
  const totalGasto = mockData.reduce((acc, item) => acc + item.gasto, 0);
  const totalDiff = totalGasto - totalIndicado;
  const totalPercentage = ((Math.abs(totalDiff) / totalIndicado) * 100).toFixed(
    1
  );

  return (
    <>
      <div className="bg-white border border-neutral-200 p-6 rounded-card shadow-card transition-all duration-300">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-neutral-100 rounded-card">
            <FileText className="w-5 h-5 text-neutral-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-neutral-900">
              Análise Detalhada
            </h2>
            <p className="text-sm text-neutral-600">Comparação por categoria</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-sm font-medium"
          >
            <Eye className="w-4 h-4" />
            Ver detalhes
          </button>
        </div>

        {/* Resumo total */}
        <div className="mb-6 p-4 bg-gradient-to-r from-neutral-50 to-neutral-25 rounded-lg border border-neutral-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-neutral-900">Total Geral</h3>
            <div
              className={`flex items-center gap-1 text-sm font-bold ${
                totalDiff > 0 ? "text-danger-600" : "text-success-600"
              }`}
            >
              {totalDiff > 0 ? (
                <TrendingUp className="w-4 h-4" />
              ) : (
                <TrendingDown className="w-4 h-4" />
              )}
              <span>{totalPercentage}%</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Orçado Total
              </p>
              <p className="font-bold text-primary-600">
                R$ {totalIndicado.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Gasto Total
              </p>
              <p className="font-bold text-neutral-900">
                R$ {totalGasto.toLocaleString("pt-BR")}
              </p>
            </div>
            <div>
              <p className="text-neutral-500 text-xs uppercase tracking-wide mb-1">
                Diferença
              </p>
              <p
                className={`font-bold ${
                  totalDiff > 0 ? "text-danger-600" : "text-success-600"
                }`}
              >
                {totalDiff > 0 ? "+" : "-"}R${" "}
                {Math.abs(totalDiff).toLocaleString("pt-BR")}
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 categorias */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-neutral-700 mb-3">
            Principais Categorias
          </h4>
          {compactData.map((item) => {
            const diff = item.gasto - item.indicado;
            const excedeu = diff > 0;
            const percentage = ((Math.abs(diff) / item.indicado) * 100).toFixed(
              1
            );

            return (
              <div
                key={item.category}
                className="flex items-center justify-between p-3 bg-neutral-25 rounded-lg border border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <h5 className="font-medium text-neutral-900 text-sm">
                      {item.category}
                    </h5>
                    <p className="text-xs text-neutral-500">
                      R$ {item.gasto.toLocaleString("pt-BR")} / R${" "}
                      {item.indicado.toLocaleString("pt-BR")}
                    </p>
                  </div>
                </div>
                <div
                  className={`flex items-center gap-1 text-sm font-medium ${
                    excedeu ? "text-danger-600" : "text-success-600"
                  }`}
                >
                  {excedeu ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  <span>{percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal detalhado */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden animate-scale-in">
            {/* Header do Modal */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 bg-neutral-100 rounded-xl">
                  <FileText className="w-6 h-6 text-neutral-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">
                    Análise Detalhada
                  </h2>
                  <p className="text-sm text-neutral-600">
                    Comparação completa por categoria
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo do Modal */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              <div className="space-y-4">
                {mockData.map((item) => {
                  const diff = item.gasto - item.indicado;
                  const excedeu = diff > 0;
                  const percentage = (
                    (Math.abs(diff) / item.indicado) *
                    100
                  ).toFixed(1);

                  return (
                    <div
                      key={item.category}
                      className="p-6 bg-neutral-50 rounded-xl border border-neutral-100"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-neutral-900">
                          {item.category}
                        </h3>
                        <div
                          className={`flex items-center gap-2 text-base font-bold ${
                            excedeu ? "text-danger-600" : "text-success-600"
                          }`}
                        >
                          {excedeu ? (
                            <TrendingUp className="w-5 h-5" />
                          ) : (
                            <TrendingDown className="w-5 h-5" />
                          )}
                          <span>{percentage}%</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6 text-sm mb-4">
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Orçado
                          </p>
                          <p className="text-lg font-bold text-primary-600">
                            R$ {item.indicado.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Realizado
                          </p>
                          <p className="text-lg font-bold text-neutral-900">
                            R$ {item.gasto.toLocaleString("pt-BR")}
                          </p>
                        </div>
                        <div>
                          <p className="text-neutral-500 text-xs uppercase tracking-wide mb-2">
                            Diferença
                          </p>
                          <p
                            className={`text-lg font-bold ${
                              excedeu ? "text-danger-600" : "text-success-600"
                            }`}
                          >
                            {excedeu ? "+" : "-"}R${" "}
                            {Math.abs(diff).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar melhorada */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs text-neutral-500">
                          <span>Progresso</span>
                          <span>
                            {Math.min(
                              (item.gasto / item.indicado) * 100,
                              100
                            ).toFixed(1)}
                            %
                          </span>
                        </div>
                        <div className="w-full h-3 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-700 ${
                              excedeu
                                ? "bg-gradient-danger"
                                : "bg-gradient-success"
                            }`}
                            style={{
                              width: `${Math.min(
                                (item.gasto / item.indicado) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
