import { format } from "date-fns";
import {
  createExpense,
  deleteExpense,
  findExpenseById,
  listExpenses,
  updateExpense
} from "../repositories/expenseRepository.js";
import { expenseSchema } from "../validation.js";

export async function getExpenses(ownerId, filters) {
  return listExpenses(ownerId, filters);
}

export async function addExpense(ownerId, payload) {
  const validated = expenseSchema.parse(payload);
  const timestamp = new Date().toISOString();

  return createExpense({
    ownerId,
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function editExpense(ownerId, id, payload) {
  if (!(await findExpenseById(ownerId, id))) {
    return null;
  }

  const validated = expenseSchema.parse(payload);

  return updateExpense(ownerId, id, {
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    updatedAt: new Date().toISOString()
  });
}

export async function removeExpense(ownerId, id) {
  if (!(await findExpenseById(ownerId, id))) {
    return false;
  }

  await deleteExpense(ownerId, id);
  return true;
}
