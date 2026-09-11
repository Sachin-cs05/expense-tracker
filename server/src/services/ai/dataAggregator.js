import { listExpenses } from "../../repositories/expenseRepository.js";
import { listIncomes } from "../../repositories/incomeRepository.js";
import { getCategories } from "../categoryService.js";
import { getBudgetByMonth } from "../../repositories/budgetRepository.js";
import { format, subMonths } from "date-fns";

/**
 * Build a comprehensive financial context for the authenticated user.
 * Only fetches data belonging to the given ownerId.
 * Strips internal IDs and sensitive fields before returning.
 */
export async function buildFinancialContext(ownerId) {
  const now = new Date();
  const currentMonth = format(now, "yyyy-MM");
  const previousMonth = format(subMonths(now, 1), "yyyy-MM");

  const [
    allExpenses,
    allIncomes,
    currentMonthExpenses,
    previousMonthExpenses,
    currentMonthIncomes,
    previousMonthIncomes,
    expenseCategories,
    incomeCategories,
    currentBudget
  ] = await Promise.all([
    listExpenses(ownerId, {}),
    listIncomes(ownerId, {}),
    listExpenses(ownerId, { month: currentMonth }),
    listExpenses(ownerId, { month: previousMonth }),
    listIncomes(ownerId, { month: currentMonth }),
    listIncomes(ownerId, { month: previousMonth }),
    getCategories(ownerId, "expense"),
    getCategories(ownerId, "income"),
    getBudgetByMonth(ownerId, currentMonth)
  ]);

  // Calculate aggregates deterministically
  const totalExpensesAllTime = sum(allExpenses);
  const totalIncomesAllTime = sum(allIncomes);
  const currentMonthExpenseTotal = sum(currentMonthExpenses);
  const previousMonthExpenseTotal = sum(previousMonthExpenses);
  const currentMonthIncomeTotal = sum(currentMonthIncomes);
  const previousMonthIncomeTotal = sum(previousMonthIncomes);

  // Category breakdowns (current month)
  const currentMonthCategoryTotals = groupByCategory(currentMonthExpenses);
  const previousMonthCategoryTotals = groupByCategory(previousMonthExpenses);

  // Monthly trend (last 6 months)
  const monthlyTrend = buildMonthlyTrend(allExpenses, 6);
  const monthlyIncomeTrend = buildMonthlyTrend(allIncomes, 6, "income");

  // Recent transactions (last 20, stripped of IDs)
  const recentExpenses = allExpenses
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 20)
    .map(sanitizeTransaction);

  const recentIncomes = allIncomes
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10)
    .map(sanitizeIncomeTransaction);

  return {
    currentMonth,
    previousMonth,
    currency: "INR",
    summary: {
      totalExpensesAllTime: round(totalExpensesAllTime),
      totalIncomesAllTime: round(totalIncomesAllTime),
      currentMonthExpenses: round(currentMonthExpenseTotal),
      previousMonthExpenses: round(previousMonthExpenseTotal),
      currentMonthIncome: round(currentMonthIncomeTotal),
      previousMonthIncome: round(previousMonthIncomeTotal),
      currentBalance: round(currentMonthIncomeTotal - currentMonthExpenseTotal),
      expenseChangePercent: previousMonthExpenseTotal > 0
        ? round(((currentMonthExpenseTotal - previousMonthExpenseTotal) / previousMonthExpenseTotal) * 100)
        : null,
      savingsRate: currentMonthIncomeTotal > 0
        ? round(((currentMonthIncomeTotal - currentMonthExpenseTotal) / currentMonthIncomeTotal) * 100)
        : null,
      transactionCount: allExpenses.length,
      incomeCount: allIncomes.length
    },
    budget: currentBudget ? { amount: currentBudget.amount, spent: round(currentMonthExpenseTotal), remaining: round(currentBudget.amount - currentMonthExpenseTotal) } : null,
    categoryBreakdown: {
      currentMonth: currentMonthCategoryTotals,
      previousMonth: previousMonthCategoryTotals
    },
    monthlyTrend,
    monthlyIncomeTrend,
    categories: {
      expense: expenseCategories.map(c => c.name),
      income: incomeCategories.map(c => c.name)
    },
    recentExpenses,
    recentIncomes,
    // Raw data for computation services (not sent to AI)
    _raw: {
      allExpenses,
      allIncomes,
      currentMonthExpenses,
      previousMonthExpenses,
      currentMonthIncomes
    }
  };
}

/**
 * Build a lightweight context (just aggregates, no recent transactions).
 * Suitable for quick AI calls that don't need transaction details.
 */
export async function buildLightContext(ownerId) {
  const full = await buildFinancialContext(ownerId);
  const { _raw, recentExpenses, recentIncomes, ...light } = full;
  return light;
}

// ---- Utility functions ----

function sum(items) {
  return items.reduce((total, item) => total + item.amount, 0);
}

function round(value) {
  return Number(value.toFixed(2));
}

function groupByCategory(expenses) {
  const groups = {};
  for (const expense of expenses) {
    groups[expense.category] = round((groups[expense.category] || 0) + expense.amount);
  }
  return groups;
}

function buildMonthlyTrend(items, months, type = "expense") {
  const now = new Date();
  const trend = [];

  for (let i = months - 1; i >= 0; i--) {
    const month = format(subMonths(now, i), "yyyy-MM");
    const total = items
      .filter(item => item.date.startsWith(month))
      .reduce((sum, item) => sum + item.amount, 0);
    trend.push({ month, total: round(total) });
  }

  return trend;
}

function sanitizeTransaction(expense) {
  return {
    amount: expense.amount,
    category: expense.category,
    date: expense.date,
    description: expense.description,
    paymentMethod: expense.paymentMethod
  };
}

function sanitizeIncomeTransaction(income) {
  return {
    amount: income.amount,
    source: income.source,
    category: income.category,
    date: income.date
  };
}
