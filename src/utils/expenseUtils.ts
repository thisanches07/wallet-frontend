import { ApiExpense, Expense } from "@/types/expense";

export const convertApiExpenseToExpense = (
  apiExpense: ApiExpense
): Expense => ({
  id: apiExpense.id, // Manter como number
  itemId: apiExpense?.itemId,
  description: apiExpense.description,
  category: apiExpense.category,
  valor: Number(apiExpense.amount), // Garantir que é número
  data: apiExpense.date.split("T")[0], // Converter ISO date para YYYY-MM-DD
  source: apiExpense.source,
});
