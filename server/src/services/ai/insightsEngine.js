import { generateJSON } from "./geminiClient.js";
import { buildFinancialContext } from "./dataAggregator.js";

/**
 * Generate AI-enhanced spending insights from actual user data.
 * All numbers are computed deterministically; AI provides interpretation.
 */
export async function generateInsights(ownerId) {
  const context = await buildFinancialContext(ownerId);
  const insights = [];

  const { summary, categoryBreakdown, budget, monthlyTrend } = context;

  // 1. Month-over-month expense change
  if (summary.expenseChangePercent !== null) {
    const direction = summary.expenseChangePercent >= 0 ? "increased" : "decreased";
    insights.push({
      type: summary.expenseChangePercent >= 10 ? "warning" : summary.expenseChangePercent <= -10 ? "positive" : "neutral",
      icon: summary.expenseChangePercent >= 0 ? "trending-up" : "trending-down",
      title: "Monthly Spending Change",
      message: `Your spending ${direction} by ${Math.abs(summary.expenseChangePercent)}% compared to last month (₹${summary.currentMonthExpenses} vs ₹${summary.previousMonthExpenses}).`,
      value: summary.expenseChangePercent,
      metric: "expense_change"
    });
  }

  // 2. Top spending category
  const categories = categoryBreakdown.currentMonth;
  const sortedCategories = Object.entries(categories).sort(([, a], [, b]) => b - a);
  if (sortedCategories.length > 0) {
    const [topCat, topAmount] = sortedCategories[0];
    const pctOfTotal = summary.currentMonthExpenses > 0
      ? Math.round((topAmount / summary.currentMonthExpenses) * 100)
      : 0;
    insights.push({
      type: pctOfTotal > 40 ? "warning" : "info",
      icon: "tag",
      title: "Largest Category",
      message: `${topCat} is your biggest expense category, representing ${pctOfTotal}% of this month's spending (₹${topAmount}).`,
      value: topAmount,
      metric: "top_category",
      category: topCat
    });
  }

  // 3. Category comparison (current vs previous month)
  const prevCategories = categoryBreakdown.previousMonth;
  for (const [cat, current] of sortedCategories.slice(0, 5)) {
    const prev = prevCategories[cat] || 0;
    if (prev > 0) {
      const changePct = Math.round(((current - prev) / prev) * 100);
      if (Math.abs(changePct) >= 20) {
        insights.push({
          type: changePct > 0 ? "warning" : "positive",
          icon: changePct > 0 ? "trending-up" : "trending-down",
          title: `${cat} Spending ${changePct > 0 ? "Increase" : "Decrease"}`,
          message: `Your ${cat} expenses ${changePct > 0 ? "increased" : "decreased"} by ${Math.abs(changePct)}% compared to last month (₹${current} vs ₹${prev}).`,
          value: changePct,
          metric: "category_change",
          category: cat
        });
      }
    }
  }

  // 4. Savings rate
  if (summary.savingsRate !== null) {
    insights.push({
      type: summary.savingsRate >= 20 ? "positive" : summary.savingsRate >= 0 ? "info" : "warning",
      icon: "piggy-bank",
      title: "Savings Rate",
      message: summary.savingsRate >= 0
        ? `You're saving ${summary.savingsRate}% of your income this month (₹${Math.round(summary.currentMonthIncome - summary.currentMonthExpenses)} saved).`
        : `You're spending ${Math.abs(summary.savingsRate)}% more than your income this month.`,
      value: summary.savingsRate,
      metric: "savings_rate"
    });
  }

  // 5. Budget status
  if (budget) {
    const budgetUsed = Math.round((budget.spent / budget.amount) * 100);
    insights.push({
      type: budgetUsed >= 100 ? "danger" : budgetUsed >= 80 ? "warning" : "positive",
      icon: "target",
      title: "Budget Status",
      message: budgetUsed >= 100
        ? `You've exceeded your monthly budget by ₹${Math.abs(budget.remaining)} (${budgetUsed}% used).`
        : `You've used ${budgetUsed}% of your ₹${budget.amount} budget with ₹${budget.remaining} remaining.`,
      value: budgetUsed,
      metric: "budget_status"
    });
  }

  // 6. Spending trend (average over available months)
  const nonZeroMonths = monthlyTrend.filter(m => m.total > 0);
  if (nonZeroMonths.length >= 2) {
    const avgMonthly = Math.round(nonZeroMonths.reduce((s, m) => s + m.total, 0) / nonZeroMonths.length);
    const deviation = summary.currentMonthExpenses - avgMonthly;
    if (Math.abs(deviation) > avgMonthly * 0.15) {
      insights.push({
        type: deviation > 0 ? "warning" : "positive",
        icon: "bar-chart",
        title: "Spending vs Average",
        message: deviation > 0
          ? `You've spent ₹${Math.abs(deviation)} more than your monthly average of ₹${avgMonthly}.`
          : `You've spent ₹${Math.abs(deviation)} less than your monthly average of ₹${avgMonthly}.`,
        value: deviation,
        metric: "vs_average"
      });
    }
  }

  // Try to get AI-generated summary if available
  let aiSummary = null;
  try {
    const limitedInsights = insights.slice(0, 5).map(i => i.message).join("\n");
    const prompt = `Based on these financial insights for a user, write a brief 2-3 sentence overall financial summary. Be encouraging but honest. Use ₹ for currency.

Insights:
${limitedInsights}

Current month income: ₹${summary.currentMonthIncome}
Current month expenses: ₹${summary.currentMonthExpenses}`;

    const result = await generateJSON(
      "You are a financial insights generator. Return JSON: {\"summary\": \"...\", \"recommendation\": \"...\"}",
      prompt
    );

    if (result?.summary) {
      aiSummary = result;
    }
  } catch {
    // AI enhancement failed, continue with deterministic insights only
  }

  return {
    insights: insights.slice(0, 8),
    aiSummary,
    generatedAt: new Date().toISOString()
  };
}
