export type Expense = {
  id: number; // Mantém como number já que vem da API
  descricao: string;
  categoria: string; // Mudança: agora é string ao invés de ID
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
  category: string; // Mudança: agora é string ao invés de categoryId
  user: {
    id: number;
    firebase_uuid: string;
    name: string;
    email: string;
  };
};
