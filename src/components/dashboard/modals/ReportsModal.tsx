import { useSelectedMonth } from "@/context/SelectedMonthContext";
import { useApi } from "@/hooks/useApi";
import {
  Calendar,
  Download,
  FileText,
  PieChart,
  TrendingUp,
  X,
} from "lucide-react";
import { useState } from "react";

interface ReportsModalProps {
  onClose: () => void;
}

export function ReportsModal({ onClose }: ReportsModalProps) {
  const { selectedYear, selectedMonth } = useSelectedMonth();
  const {
    exportYearlyEvolution,
    exportMonthlySummary,
    exportMonthlySummaryByCategory,
  } = useApi();
  const [loading, setLoading] = useState<string | null>(null);

  const handleYearlyEvolutionExport = async () => {
    setLoading("yearly-evolution");
    try {
      const blob = await exportYearlyEvolution(selectedYear);

      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `evolucao-anual-${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar evolução anual:", error);
      alert("Erro ao exportar evolução anual. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const handleMonthlySummaryExport = async () => {
    setLoading("monthly-summary");
    try {
      const blob = await exportMonthlySummary(selectedYear, selectedMonth);

      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumo-mensal-${selectedMonth + 1}-${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar resumo mensal:", error);
      alert("Erro ao exportar resumo mensal. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const handleMonthlySummaryByCategoryExport = async () => {
    setLoading("monthly-by-category");
    try {
      const blob = await exportMonthlySummaryByCategory(
        selectedYear,
        selectedMonth
      );

      // Criar URL do blob e fazer download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumo-mensal-categorys-${
        selectedMonth + 1
      }-${selectedYear}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Erro ao exportar resumo mensal por category:", error);
      alert("Erro ao exportar resumo mensal por category. Tente novamente.");
    } finally {
      setLoading(null);
    }
  };

  const reports = [
    {
      id: "yearly-evolution",
      title: "Evolução Anual",
      description:
        "Exporta a evolução das receitas e despesas ao longo de um ano específico para um arquivo Excel (.xlsx). O arquivo contém três abas: Evolução Anual, Estatísticas Mensais e Resumo Anual.",
      icon: TrendingUp,
      color: "bg-blue-50 text-blue-600 border-blue-200",
      action: handleYearlyEvolutionExport,
      isLoading: loading === "yearly-evolution",
    },
    {
      id: "monthly-summary",
      title: "Resumo Mensal",
      description:
        "Exporta o resumo completo do mês selecionado com todas as receitas, despesas e totalizações organizadas em Excel.",
      icon: Calendar,
      color: "bg-green-50 text-green-600 border-green-200",
      action: handleMonthlySummaryExport,
      isLoading: loading === "monthly-summary",
    },
    {
      id: "monthly-by-category",
      title: "Resumo Mensal por Categoria",
      description:
        "Exporta o detalhamento completo das despesas do mês organizadas por category, incluindo gráficos e análises detalhadas.",
      icon: PieChart,
      color: "bg-purple-50 text-purple-600 border-purple-200",
      action: handleMonthlySummaryByCategoryExport,
      isLoading: loading === "monthly-by-category",
    },
    // Placeholder para futuros relatórios
    {
      id: "future-report-1",
      title: "Relatório em Breve",
      description: "Novos relatórios serão adicionados em futuras versões.",
      icon: FileText,
      color: "bg-gray-50 text-gray-400 border-gray-200",
      action: () => {},
      isLoading: false,
      disabled: true,
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 p-6 text-white flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">📊 Relatórios</h2>
                <p className="text-primary-100 text-sm">
                  Exporte seus dados financeiros para análise
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-10 h-10 bg-white/20 hover:bg-white/30 rounded-xl backdrop-blur-sm transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="space-y-4">
              {reports.map((report) => (
                <div
                  key={report.id}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    report.disabled
                      ? "border-gray-200 bg-gray-50 opacity-60"
                      : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm bg-white"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-xl border ${report.color}`}
                    >
                      <report.icon className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {report.title}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed mb-4">
                        {report.description}
                      </p>

                      {!report.disabled && (
                        <button
                          onClick={report.action}
                          disabled={report.isLoading}
                          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white font-medium px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                          {report.isLoading ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Exportando...</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span>Exportar para Excel</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Year and Month Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Período selecionado: {selectedMonth + 1}/{selectedYear}
                </span>
              </div>
              <p className="text-blue-600 text-xs">
                Os relatórios "Resumo Mensal" usam o mês selecionado. O
                "Evolução Anual" usa todo o ano {selectedYear}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
