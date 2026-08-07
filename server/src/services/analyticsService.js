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
  const smartData = await getSmartData(ownerId, {
    selectedMonth,
    monthlyExpenses,
    monthSpend,
    budget: currentBudget
  });

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
      : null,
    forecast: smartData.forecast,
    smartInsights: smartData.insights,
    alerts: smartData.alerts,
    recurringExpenses: smartData.recurringExpenses
  };
}

async function getSmartData(ownerId, { selectedMonth, monthlyExpenses, monthSpend, budget }) {
  const insights = [];
  const alerts = [];
  const forecast = createForecast(selectedMonth, monthSpend, budget?.amount);
  const previousMonth = getPreviousMonth(selectedMonth);
  const previousMonthExpenses = await listExpenses(ownerId, { month: previousMonth });
  const previousMonthSpend = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  if (previousMonthSpend > 0) {
    const changePercent = Math.round(((monthSpend - previousMonthSpend) / previousMonthSpend) * 100);

    if (changePercent >= 10) {
      insights.push({
        type: "spending_increase",
        message: `Your spending is ${changePercent}% higher than last month.`,
        value: changePercent
      });
    } else if (changePercent <= -10) {
      insights.push({
        type: "spending_decrease",
        message: `Your spending is ${Math.abs(changePercent)}% lower than last month.`,
        value: Math.abs(changePercent)
      });
    }
  }

  const topCategory = getTopCategory(monthlyExpenses);
  if (topCategory) {
    insights.push({
      type: "top_category",
      message: `${topCategory.category} is your largest spending category this month.`,
      category: topCategory.category,
      amount: topCategory.amount
    });
  }

  if (budget && monthSpend > 0) {
    const budgetUsed = Math.round((monthSpend / budget.amount) * 100);

    if (budgetUsed >= 100) {
      insights.push({
        type: "budget_exceeded",
        message: `You have exceeded this month's budget by ${Number((monthSpend - budget.amount).toFixed(2))}.`,
        value: budgetUsed
      });
      alerts.push({ severity: "danger", message: `Your ${selectedMonth} budget has been exceeded.` });
    } else if (budgetUsed >= 80) {
      insights.push({
        type: "budget_warning",
        message: `You have used ${budgetUsed}% of this month's budget.`,
        value: budgetUsed
      });
      alerts.push({ severity: "warning", message: `You have used ${budgetUsed}% of your ${selectedMonth} budget.` });
    }
  }

  if (forecast?.isOverBudget) {
    insights.push({
      type: "forecast_warning",
      message: `At your current pace, you may exceed your budget by ${forecast.projectedOverage}.`,
      value: forecast.projectedOverage
    });
    alerts.push({ severity: "warning", message: "Your current spending pace may exceed this month's budget." });
  }

  const recurringExpenses = await findRecurringExpenses(ownerId);
  if (recurringExpenses.length) {
    alerts.push({ severity: "info", message: `${recurringExpenses.length} recurring payment${recurringExpenses.length === 1 ? "" : "s"} detected.` });
  }

  return { forecast, insights, alerts, recurringExpenses };
}

async function findRecurringExpenses(ownerId) {
  const expenses = await listExpenses(ownerId, {});
  const groups = new Map();

  for (const expense of expenses) {
    const description = expense.description.trim().toLowerCase().replace(/\s+/g, " ");
    const key = `${expense.category}:${description}`;
    const current = groups.get(key) || [];
    current.push(expense);
    groups.set(key, current);
  }

  return Array.from(groups.values())
    .map((items) => items.sort((left, right) => left.date.localeCompare(right.date)))
    .filter((items) => {
      if (items.length < 2) return false;
      const latest = items.at(-1);
      const previous = items.at(-2);
      const monthsApart = monthDifference(previous.date, latest.date);
      const amountSimilar = Math.abs(previous.amount - latest.amount) <= Math.max(1, latest.amount * 0.1);
      return monthsApart >= 1 && monthsApart <= 2 && amountSimilar;
    })
    .map((items) => {
      const latest = items.at(-1);
      return {
        description: latest.description,
        category: latest.category,
        amount: latest.amount,
        lastDate: latest.date,
        occurrences: items.length
      };
    })
    .slice(0, 5);
}

function monthDifference(leftDate, rightDate) {
  const left = new Date(`${leftDate}T00:00:00`);
  const right = new Date(`${rightDate}T00:00:00`);
  return (right.getFullYear() - left.getFullYear()) * 12 + right.getMonth() - left.getMonth();
}

function createForecast(selectedMonth, monthSpend, budgetAmount) {
  const today = format(new Date(), "yyyy-MM-dd");

  // A forecast is only meaningful for the month currently in progress.
  if (selectedMonth !== today.slice(0, 7)) {
    return null;
  }

  const daysInMonth = new Date(Number(selectedMonth.slice(0, 4)), Number(selectedMonth.slice(5, 7)), 0).getDate();
  const daysElapsed = Number(today.slice(8, 10));
  const daysRemaining = daysInMonth - daysElapsed;
  const averageDailySpend = monthSpend / daysElapsed;
  const projectedSpend = averageDailySpend * daysInMonth;
  const remainingBudget = budgetAmount === undefined ? null : budgetAmount - monthSpend;
  const dailyBudgetAvailable =
    budgetAmount === undefined || daysRemaining === 0 ? null : Math.max(0, remainingBudget / daysRemaining);

  return {
    month: selectedMonth,
    daysElapsed,
    daysRemaining,
    averageDailySpend: Number(averageDailySpend.toFixed(2)),
    projectedSpend: Number(projectedSpend.toFixed(2)),
    remainingBudget: remainingBudget === null ? null : Number(remainingBudget.toFixed(2)),
    dailyBudgetAvailable: dailyBudgetAvailable === null ? null : Number(dailyBudgetAvailable.toFixed(2)),
    isOverBudget: budgetAmount === undefined ? false : projectedSpend > budgetAmount,
    projectedOverage: budgetAmount === undefined ? 0 : Number(Math.max(0, projectedSpend - budgetAmount).toFixed(2))
  };
}

function getPreviousMonth(month) {
  const year = Number(month.slice(0, 4));
  const monthIndex = Number(month.slice(5, 7)) - 1;
  return format(new Date(year, monthIndex - 1, 1), "yyyy-MM");
}

function getTopCategory(expenses) {
  const totals = new Map();

  for (const expense of expenses) {
    totals.set(expense.category, (totals.get(expense.category) || 0) + expense.amount);
  }

  const highest = Array.from(totals.entries()).sort(([, left], [, right]) => right - left)[0];
  return highest ? { category: highest[0], amount: Number(highest[1].toFixed(2)) } : null;
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
