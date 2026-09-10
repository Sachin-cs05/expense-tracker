import { format } from "date-fns";
import {
  createIncome,
  deleteIncome,
  findIncomeById,
  listIncomes,
  updateIncome
} from "../repositories/incomeRepository.js";
import { incomeSchema } from "../validation.js";

export async function getIncomes(ownerId, filters) {
  return listIncomes(ownerId, filters);
}

export async function addIncome(ownerId, payload) {
  const validated = incomeSchema.parse(payload);
  const timestamp = new Date().toISOString();

  return createIncome({
    ownerId,
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function editIncome(ownerId, id, payload) {
  if (!(await findIncomeById(ownerId, id))) {
    return null;
  }

  const validated = incomeSchema.parse(payload);

  return updateIncome(ownerId, id, {
    ...validated,
    date: format(new Date(validated.date), "yyyy-MM-dd"),
    updatedAt: new Date().toISOString()
  });
}

export async function removeIncome(ownerId, id) {
  if (!(await findIncomeById(ownerId, id))) {
    return false;
  }

  await deleteIncome(ownerId, id);
  return true;
}

export async function getIncomeSummary(ownerId, filters) {
  const incomes = await listIncomes(ownerId, filters);
  const total = incomes.reduce((sum, income) => sum + income.amount, 0);
  const sources = new Set(incomes.map((income) => income.source.toLowerCase()));

  return {
    total: Number(total.toFixed(2)),
    count: incomes.length,
    sourceCount: sources.size
  };
}
