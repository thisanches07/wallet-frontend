import { ApiExpense, Expense } from "@/types/expense";

export const convertApiExpenseToExpense = (
  apiExpense: ApiExpense
): Expense => ({
  id: apiExpense.id, // Manter como number
  description: apiExpense.description,
  categoria: apiExpense.category,
  valor: Number(apiExpense.amount), // Garantir que é número
  data: apiExpense.date.split("T")[0], // Converter ISO date para YYYY-MM-DD
  source: apiExpense.source,
});
