import { BarChart3, Calendar, Download, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  selectedMonth: string;
}

const fullMonthMap: Record<string, string> = {
  Jan: "Janeiro",
  Feb: "Fevereiro",
  Mar: "Março",
  Apr: "Abril",
  May: "Maio",
  Jun: "Junho",
  Jul: "Julho",
  Aug: "Agosto",
  Sep: "Setembro",
  Oct: "Outubro",
  Nov: "Novembro",
  Dec: "Dezembro",
};

export function DashboardHeader({ selectedMonth }: Props) {
  const currentYear = new Date().getFullYear();
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 30000); // Atualiza a cada 30 segundos

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    // Simular processo de exportação
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsExporting(false);
  };

  return (
    <header className="mb-8 animate-fade-in">
      {/* Container principal redesenhado */}
      <div className="relative bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/20 rounded-3xl border border-neutral-200/80 shadow-lg hover:shadow-xl transition-all duration-500 overflow-hidden">
        {/* Efeito de fundo sutil */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-100/40 via-transparent to-transparent rounded-full blur-3xl"></div>

        <div className="relative p-8">
          {/* Header superior com informações */}
          <div className="flex items-center justify-between mb-6">
            {/* Indicador de período */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/10 backdrop-blur-sm rounded-full border border-blue-200/50">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="font-semibold text-sm text-blue-700">
                {fullMonthMap[selectedMonth]} {currentYear}
              </span>
            </div>
          </div>

          {/* Conteúdo principal reorganizado */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            {/* Seção principal - Título e ícone */}
            <div className="flex items-center gap-6">
              {/* Ícone redesenhado com mais destaque */}
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl shadow-xl group-hover:shadow-2xl transition-all duration-300">
                  <BarChart3 className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              {/* Informações principais */}
              <div className="flex-1">
                <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-neutral-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent leading-tight mb-2">
                  Dashboard Financeiro
                </h1>
                <p className="text-neutral-600 font-medium">
                  Visão geral completa das suas finanças
                </p>
              </div>
            </div>

            {/* Seção de ações reorganizada */}
            <div className="flex items-center gap-4">
              {/* Botão secundário */}
              <button
                onClick={handleExport}
                disabled={isExporting}
                className="group relative flex items-center gap-3 px-5 py-3 bg-white/80 backdrop-blur-sm hover:bg-white text-neutral-700 hover:text-neutral-900 rounded-2xl border border-neutral-200/80 hover:border-neutral-300 shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
              >
                <Download
                  className={`w-4 h-4 transition-all duration-500 ${
                    isExporting
                      ? "animate-pulse scale-110"
                      : "group-hover:scale-110 group-hover:-translate-y-0.5"
                  }`}
                />
                <span className="font-semibold text-sm">
                  {isExporting ? "Exportando..." : "Exportar"}
                </span>
              </button>

              {/* Botão principal redesenhado */}
              <button className="group relative overflow-hidden flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 hover:from-blue-700 hover:via-blue-800 hover:to-indigo-700 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-1 hover:scale-[1.02]">
                {/* Efeito shimmer aprimorado */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 translate-x-[-150%] group-hover:translate-x-[150%] transition-transform duration-1000 ease-out"></div>

                <TrendingUp className="w-5 h-5 relative z-10 group-hover:scale-110 transition-transform duration-300" />
                <span className="font-bold text-sm relative z-10 tracking-tight">
                  Relatório Completo
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Borda inferior decorativa */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500"></div>
      </div>
    </header>
  );
}
