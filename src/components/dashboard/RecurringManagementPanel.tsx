import { AddIncomeModal } from "@/components/dashboard/modals/AddIncomeModal";
import { AddRecurringExpenseModal } from "@/components/dashboard/modals/AddRecurringExpenseModal";
import {
  Calendar,
  DollarSign,
  Edit,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

interface IncomeData {
  id: string;
  tipo: "recorrente" | "pontual";
  descricao: string;
  valor: number;
  categoria: "salario" | "freelance" | "investimento" | "bonus" | "outros";
  dataRecebimento?: string;
  recorrencia?: "mensal" | "quinzenal" | "semanal";
}

interface RecurringExpenseData {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  diaVencimento: number;
  ativo: boolean;
  tipo: "fixo" | "variavel";
}

export function RecurringManagementPanel() {
  const [receitas, setReceitas] = useState<IncomeData[]>([]);
  const [despesasRecorrentes, setDespesasRecorrentes] = useState<
    RecurringExpenseData[]
  >([]);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"receitas" | "despesas">(
    "receitas"
  );

  useEffect(() => {
    // Carregar receitas
    const savedReceitas = localStorage.getItem("receitasDetalhadas");
    if (savedReceitas) {
      setReceitas(JSON.parse(savedReceitas));
    }

    // Carregar despesas recorrentes
    const savedDespesas = localStorage.getItem("despesasRecorrentes");
    if (savedDespesas) {
      setDespesasRecorrentes(JSON.parse(savedDespesas));
    }
  }, []);

  const addReceita = (receita: Omit<IncomeData, "id">) => {
    const novaReceita = { ...receita, id: Date.now().toString() };
    const novasReceitas = [...receitas, novaReceita];
    setReceitas(novasReceitas);
    localStorage.setItem("receitasDetalhadas", JSON.stringify(novasReceitas));
  };

  const addDespesaRecorrente = (despesa: Omit<RecurringExpenseData, "id">) => {
    const novaDespesa = { ...despesa, id: Date.now().toString() };
    const novasDespesas = [...despesasRecorrentes, novaDespesa];
    setDespesasRecorrentes(novasDespesas);
    localStorage.setItem("despesasRecorrentes", JSON.stringify(novasDespesas));
  };

  const removeReceita = (id: string) => {
    const novasReceitas = receitas.filter((r) => r.id !== id);
    setReceitas(novasReceitas);
    localStorage.setItem("receitasDetalhadas", JSON.stringify(novasReceitas));
  };

  const removeDespesa = (id: string) => {
    const novasDespesas = despesasRecorrentes.filter((d) => d.id !== id);
    setDespesasRecorrentes(novasDespesas);
    localStorage.setItem("despesasRecorrentes", JSON.stringify(novasDespesas));
  };

  const toggleDespesaAtiva = (id: string) => {
    const novasDespesas = despesasRecorrentes.map((d) =>
      d.id === id ? { ...d, ativo: !d.ativo } : d
    );
    setDespesasRecorrentes(novasDespesas);
    localStorage.setItem("despesasRecorrentes", JSON.stringify(novasDespesas));
  };

  const totalReceitasRecorrentes = receitas
    .filter((r) => r.tipo === "recorrente")
    .reduce((acc, r) => acc + r.valor, 0);

  const totalDespesasRecorrentes = despesasRecorrentes
    .filter((d) => d.ativo)
    .reduce((acc, d) => acc + d.valor, 0);

  return (
    <>
      <div className="bg-white border border-neutral-200/80 rounded-2xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-900">
                  Gestão de Recorrências
                </h2>
                <p className="text-sm text-neutral-500">
                  Gerencie receitas e despesas que se repetem
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("receitas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "receitas"
                  ? "bg-success-100 text-success-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              💰 Receitas
            </button>
            <button
              onClick={() => setActiveTab("despesas")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "despesas"
                  ? "bg-danger-100 text-danger-700"
                  : "text-neutral-600 hover:bg-neutral-100"
              }`}
            >
              💸 Despesas
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "receitas" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-success-50 rounded-xl">
                <div>
                  <p className="text-sm text-success-700 font-medium">
                    Total Receitas Recorrentes
                  </p>
                  <p className="text-xl font-bold text-success-800">
                    R$ {totalReceitasRecorrentes.toLocaleString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => setShowIncomeModal(true)}
                  className="flex items-center gap-2 bg-success-600 text-white px-4 py-2 rounded-lg hover:bg-success-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Receita
                </button>
              </div>

              {/* Lista de receitas */}
              <div className="space-y-3">
                {receitas.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    <p className="font-medium">Nenhuma receita cadastrada</p>
                    <p className="text-sm">Adicione suas fontes de renda</p>
                  </div>
                ) : (
                  receitas.map((receita) => (
                    <div
                      key={receita.id}
                      className="flex items-center justify-between p-4 border border-neutral-200 rounded-xl hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            receita.tipo === "recorrente"
                              ? "bg-success-100 text-success-600"
                              : "bg-primary-100 text-primary-600"
                          }`}
                        >
                          {receita.tipo === "recorrente" ? (
                            <RefreshCw className="w-5 h-5" />
                          ) : (
                            <Calendar className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {receita.descricao}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {receita.categoria} • {receita.tipo}
                            {receita.recorrencia && ` • ${receita.recorrencia}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-success-600">
                          R$ {receita.valor.toLocaleString("pt-BR")}
                        </p>
                        <div className="flex gap-1">
                          <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeReceita(receita.id)}
                            className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "despesas" && (
            <div className="space-y-4">
              {/* Summary */}
              <div className="flex items-center justify-between p-4 bg-danger-50 rounded-xl">
                <div>
                  <p className="text-sm text-danger-700 font-medium">
                    Total Despesas Recorrentes
                  </p>
                  <p className="text-xl font-bold text-danger-800">
                    R$ {totalDespesasRecorrentes.toLocaleString("pt-BR")}
                  </p>
                </div>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="flex items-center gap-2 bg-danger-600 text-white px-4 py-2 rounded-lg hover:bg-danger-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Nova Despesa
                </button>
              </div>

              {/* Lista de despesas */}
              <div className="space-y-3">
                {despesasRecorrentes.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <RefreshCw className="w-12 h-12 mx-auto mb-3 text-neutral-400" />
                    <p className="font-medium">Nenhuma despesa recorrente</p>
                    <p className="text-sm">Adicione gastos fixos mensais</p>
                  </div>
                ) : (
                  despesasRecorrentes.map((despesa) => (
                    <div
                      key={despesa.id}
                      className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
                        despesa.ativo
                          ? "border-neutral-200 hover:shadow-sm"
                          : "border-neutral-100 bg-neutral-50 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            despesa.tipo === "fixo"
                              ? "bg-danger-100 text-danger-600"
                              : "bg-warning-100 text-warning-600"
                          }`}
                        >
                          {despesa.tipo === "fixo" ? (
                            <DollarSign className="w-5 h-5" />
                          ) : (
                            <RefreshCw className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-neutral-900">
                            {despesa.descricao}
                          </h4>
                          <p className="text-sm text-neutral-500">
                            {despesa.categoria} • {despesa.tipo} • Dia{" "}
                            {despesa.diaVencimento}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-danger-600">
                          R$ {despesa.valor.toLocaleString("pt-BR")}
                          {despesa.tipo === "variavel" && (
                            <span className="text-xs text-neutral-500 ml-1">
                              (médio)
                            </span>
                          )}
                        </p>
                        <div className="flex gap-1">
                          <button
                            onClick={() => toggleDespesaAtiva(despesa.id)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                              despesa.ativo
                                ? "bg-success-100 text-success-700 hover:bg-success-200"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {despesa.ativo ? "Ativo" : "Pausado"}
                          </button>
                          <button className="p-2 text-neutral-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeDespesa(despesa.id)}
                            className="p-2 text-neutral-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <AddIncomeModal
          onClose={() => setShowIncomeModal(false)}
          onAdd={(income) => {
            addReceita(income);
            setShowIncomeModal(false);
          }}
        />
      )}

      {showExpenseModal && (
        <AddRecurringExpenseModal
          onClose={() => setShowExpenseModal(false)}
          onAdd={(expense) => {
            addDespesaRecorrente(expense);
            setShowExpenseModal(false);
          }}
        />
      )}
    </>
  );
}
