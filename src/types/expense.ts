export type Expense = {
  id: number;
  itemId?: string;
  description: string;
  category: string;
  valor: number;
  data: string;
  tipo?: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
  source: "MANUAL" | "PLUGGY";
};

export type ApiExpense = {
  id: number;
  itemId?: string;
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
