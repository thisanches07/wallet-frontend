import { AddExpenseModal } from "@/components/dashboard/modals/AddExpenseModal";
import { Calendar, Plus, Receipt } from "lucide-react";
import { useState } from "react";

type Expense = {
  id: string;
  descricao: string;
  categoria:
    | "Moradia"
    | "Transporte"
    | "Alimentação"
    | "Lazer"
    | "Saúde"
    | "Educação"
    | "Outros";
  valor: number;
  data: string;
  tipo?: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
};

const mockGastos: Expense[] = [
  {
    id: "1",
    descricao: "Aluguel",
    categoria: "Moradia",
    valor: 1200,
    data: "2025-05-04",
  },
  {
    id: "2",
    descricao: "Uber",
    categoria: "Transporte",
    valor: 40,
    data: "2025-05-09",
  },
  {
    id: "3",
    descricao: "Supermercado",
    categoria: "Alimentação",
    valor: 320,
    data: "2025-05-10",
  },
  {
    id: "4",
    descricao: "Cinema",
    categoria: "Lazer",
    valor: 45,
    data: "2025-05-12",
  },
  {
    id: "5",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
  {
    id: "6",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
  {
    id: "7",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
  {
    id: "8",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
  {
    id: "9",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
  {
    id: "10",
    descricao: "Gasolina",
    categoria: "Transporte",
    valor: 120,
    data: "2025-05-15",
  },
];

const categoriaIcone = {
  Moradia: "🏠",
  Transporte: "🚗",
  Alimentação: "🍔",
  Lazer: "🎮",
  Saúde: "⚕️",
  Educação: "📚",
  Outros: "📝",
};

const categoriaCores = {
  Moradia: "bg-primary-100 text-primary-700 border-primary-200",
  Transporte: "bg-purple-100 text-purple-700 border-purple-200",
  Alimentação: "bg-success-100 text-success-700 border-success-200",
  Lazer: "bg-pink-100 text-pink-700 border-pink-200",
  Saúde: "bg-red-100 text-red-700 border-red-200",
  Educação: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Outros: "bg-neutral-100 text-neutral-700 border-neutral-200",
};

export function MonthlyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockGastos);
  const [showModal, setShowModal] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense]);
    setShowModal(false);
  };

  const totalExpenses = expenses.reduce(
    (acc, expense) => acc + expense.valor,
    0
  );
  const displayedExpenses = showAll ? expenses : expenses.slice(0, 4);

  return (
    <div
      className={`bg-white border border-neutral-200/80 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col max-w-full ${
        showAll ? "max-h-[calc(100vh-200px)]" : "h-fit"
      }`}
    >
      {/* Header Destacado */}
      <div className="bg-gradient-to-r from-primary-600 via-primary-700 to-indigo-600 rounded-t-2xl p-6 text-white flex-shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">💳 Gastos Mensais</h2>
            <p className="text-primary-100 text-sm">
              {expenses.length} transações este mês
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-primary-100 text-sm font-medium mb-1">
              Total gasto no mês
            </p>
            <p className="text-2xl font-bold text-white">
              R${" "}
              {totalExpenses.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-medium px-4 py-3 rounded-xl transition-all duration-200 hover:scale-105 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Adicionar Gasto</span>
          </button>
        </div>
      </div>

      {/* Expenses List */}
      <div className={`p-4 ${showAll ? "flex-1 overflow-y-auto min-h-0" : ""}`}>
        <div className="space-y-2">
          {displayedExpenses.map((item) => (
            <div
              key={item.id}
              className="group p-3 rounded-xl border border-neutral-100 hover:border-neutral-200 hover:shadow-sm transition-all duration-200 bg-neutral-25 hover:bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm">
                    {categoriaIcone[item.categoria]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-neutral-900 text-sm truncate">
                      {item.descricao}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-0.5 rounded-md text-xs font-medium border ${
                          categoriaCores[item.categoria]
                        }`}
                      >
                        {item.categoria}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-danger-600">
                    -R$ {item.valor.toLocaleString("pt-BR")}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-neutral-400 mt-0.5">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(item.data).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Show More/Less Button */}
        {expenses.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="w-full mt-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors"
          >
            {showAll ? `Mostrar menos` : `Ver mais (${expenses.length})`}
          </button>
        )}

        {expenses.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mb-3">
              <Receipt className="w-6 h-6 text-neutral-400" />
            </div>
            <h4 className="text-neutral-900 font-medium text-sm mb-1">
              Nenhuma transação
            </h4>
            <p className="text-neutral-600 text-xs mb-3">
              Adicione sua primeira transação
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-1 bg-gradient-primary text-white text-xs font-medium px-3 py-2 rounded-lg transition-all hover:scale-105"
            >
              <Plus className="w-3 h-3" />
              Adicionar
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <AddExpenseModal
          onClose={() => setShowModal(false)}
          onAdd={(expenseData) => {
            const newExpense: Expense = {
              ...expenseData,
              id: Date.now().toString(),
            };
            setExpenses((prev) => [...prev, newExpense]);
            setShowModal(false);
          }}
        />
      )}
    </div>
  );
}
