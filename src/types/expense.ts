export type Expense = {
  id: number;
  description: string;
  categoria: string;
  valor: number;
  data: string;
  tipo?: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
  source: "MANUAL" | "PLUGGY";
};

export type ApiExpense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  category: string;
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
  source: "MANUAL" | "PLUGGY";
};
