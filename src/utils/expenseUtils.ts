import { ApiExpense, Expense } from "@/types/expense";

export const convertApiExpenseToExpense = (
  apiExpense: ApiExpense
): Expense => ({
  id: apiExpense.id, // Manter como number
  descricao: apiExpense.description,
  categoria: apiExpense.category.name,
  valor: apiExpense.amount,
  data: apiExpense.date.split("T")[0], // Converter ISO date para YYYY-MM-DD
});
