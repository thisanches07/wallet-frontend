export type Expense = {
  id: string;
  descricao: string;
  categoria: string;
  valor: number;
  data: string;
  tipo?: "unico" | "recorrente";
  recorrencia?: "mensal" | "semanal" | "anual";
};

export type ApiExpense = {
  id: number;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
  category: {
    id: number;
    name: string;
    type: string;
  };
};
