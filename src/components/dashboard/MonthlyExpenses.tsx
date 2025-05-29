// MonthlyExpenses.tsx
import { useState } from "react";

type Expense = {
  id: string;
  descricao: string;
  categoria: "Moradia" | "Transporte" | "Alimentação" | "Lazer" | "Outros";
  valor: number;
  data: string;
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
];

const categoriaIcone = {
  Moradia: "🏠",
  Transporte: "🚗",
  Alimentação: "🍔",
  Lazer: "🎮",
  Outros: "🛆",
};

const categoriaCores = {
  Moradia: "bg-blue-100 text-blue-800",
  Transporte: "bg-purple-100 text-purple-800",
  Alimentação: "bg-green-100 text-green-800",
  Lazer: "bg-pink-100 text-pink-800",
  Outros: "bg-gray-100 text-gray-800",
};

export function MonthlyExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>(mockGastos);
  const [showModal, setShowModal] = useState(false);

  const addExpense = (expense: Expense) => {
    setExpenses((prev) => [...prev, expense]);
    setShowModal(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 h-[calc(100vh-150px)] overflow-y-auto">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Gastos do mês
        </h3>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-1 rounded"
        >
          + Adicionar
        </button>
      </div>

      <ul className="space-y-2">
        {expenses.map((item) => (
          <li
            key={item.id}
            className="flex justify-between items-start p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition"
          >
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-white">
                {categoriaIcone[item.categoria]} {item.descricao}
              </p>
              <div className="text-xs text-gray-500 flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full font-medium ${
                    categoriaCores[item.categoria]
                  }`}
                >
                  {item.categoria}
                </span>
                <span>{new Date(item.data).toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
            <p className="text-red-600 font-semibold text-sm">
              - R$ {item.valor.toFixed(2)}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
