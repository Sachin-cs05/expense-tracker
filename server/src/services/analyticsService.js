import { format, startOfMonth } from "date-fns";
import { expenseCategories } from "../constants.js";
import { getBudgetByMonth, upsertBudget } from "../repositories/budgetRepository.js";
import { listExpenses } from "../repositories/expenseRepository.js";
import { budgetSchema } from "../validation.js";

export async function getCategoryTotals(ownerId, filters) {
  const expenses = await listExpenses(ownerId, filters);
  const grouped = new Map(expenseCategories.map((category) => [category, 0]));

  for (const expense of expenses) {
    grouped.set(expense.category, (grouped.get(expense.category) || 0) + expense.amount);
  }

  return Array.from(grouped.entries()).map(([category, total]) => ({
    category,
    total: Number(total.toFixed(2))
  }));
}

export async function getMonthlyTrend(ownerId) {
  const expenses = await listExpenses(ownerId, {});
  const grouped = new Map();

  for (const expense of expenses) {
    const month = expense.date.slice(0, 7);
    grouped.set(month, (grouped.get(month) || 0) + expense.amount);
  }

  return Array.from(grouped.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([month, total]) => ({
      month,
      total: Number(total.toFixed(2))
    }));
}

export async function getDailyProgression(ownerId, filters) {
  const expenses = (await listExpenses(ownerId, filters)).sort((left, right) => left.date.localeCompare(right.date));
  let runningTotal = 0;

  return expenses.map((expense) => {
    runningTotal += expense.amount;

    return {
      date: expense.date,
      amount: Number(expense.amount.toFixed(2)),
      cumulativeTotal: Number(runningTotal.toFixed(2))
    };
  });
}

export async function getSummary(ownerId, filters) {
  const expenses = await listExpenses(ownerId, filters);
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = await getCategoryTotals(ownerId, filters);
  const monthlySummaries = await getMonthlyTrend(ownerId);
  const selectedMonth =
    filters.month ||
    (filters.startDate ? format(startOfMonth(new Date(filters.startDate)), "yyyy-MM") : format(new Date(), "yyyy-MM"));
  const currentBudget = await getBudgetByMonth(ownerId, selectedMonth);
  const monthlyExpenses = await listExpenses(ownerId, { month: selectedMonth });
  const monthSpend = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return {
    totalExpenses: Number(totalExpenses.toFixed(2)),
    categoryTotals,
    monthlySummaries,
    budget: currentBudget,
    budgetStatus: currentBudget
      ? {
          month: selectedMonth,
          spent: Number(monthSpend.toFixed(2)),
          remaining: Number((currentBudget.amount - monthSpend).toFixed(2)),
          exceeded: monthSpend > currentBudget.amount
        }
      : null
  };
}

export async function saveBudget(ownerId, payload) {
  const validated = budgetSchema.parse(payload);
  const timestamp = new Date().toISOString();

  return upsertBudget({
    ownerId,
    ...validated,
    createdAt: timestamp,
    updatedAt: timestamp
  });
}

export async function fetchBudget(ownerId, month) {
  return getBudgetByMonth(ownerId, month);
}
