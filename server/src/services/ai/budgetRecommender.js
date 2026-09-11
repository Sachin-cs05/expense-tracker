import { buildFinancialContext } from "./dataAggregator.js";

/**
 * Generate smart per-category budget recommendations based on actual spending patterns.
 * Uses income-proportional allocation adjusted by historical patterns.
 */
export async function recommendBudget(ownerId) {
  const context = await buildFinancialContext(ownerId);
  const { summary, categoryBreakdown, monthlyTrend, _raw } = context;
  const { currentMonthIncome, currentMonthExpenses } = summary;

  // Determine income baseline
  const income = currentMonthIncome > 0
    ? currentMonthIncome
    : summary.previousMonthIncome > 0
      ? summary.previousMonthIncome
      : null;

  if (!income) {
    return {
      available: false,
      message: "Please add your income data so we can recommend a personalized budget.",
      recommendations: []
    };
  }

  // Calculate average spending per category over available months
  const categoryAverages = calculateCategoryAverages(_raw.allExpenses, monthlyTrend);

  // Generate recommendations using 50/30/20 rule as a baseline
  const needsTarget = income * 0.50;    // 50% needs (bills, food, transport)
  const wantsTarget = income * 0.30;    // 30% wants (shopping, entertainment)
  const savingsTarget = income * 0.20;  // 20% savings

  const needsCategories = ["Food", "Bills", "Travel"];
  const wantsCategories = ["Shopping", "Entertainment"];

  const recommendations = [];
  let totalRecommended = 0;

  // Build recommendations for each category with actual spending data
  const allCategories = new Set([
    ...Object.keys(categoryBreakdown.currentMonth),
    ...Object.keys(categoryAverages)
  ]);

  for (const category of allCategories) {
    const currentSpend = categoryBreakdown.currentMonth[category] || 0;
    const avgSpend = categoryAverages[category] || currentSpend;

    // Determine if it's a "need" or "want" category
    const isNeed = needsCategories.some(n => category.toLowerCase().includes(n.toLowerCase()));

    // Base recommendation: slightly below average, adjusted by 50/30/20
    let recommended;
    if (avgSpend > 0) {
      // Use historical average as primary signal, but cap proportionally
      const maxProportion = isNeed ? 0.25 : 0.15; // Max % of income per category
      recommended = Math.min(avgSpend, income * maxProportion);

      // If they've been underspending, keep it lower
      if (currentSpend > 0 && currentSpend < avgSpend * 0.8) {
        recommended = Math.round((currentSpend + avgSpend) / 2);
      }
    } else {
      recommended = isNeed ? Math.round(income * 0.10) : Math.round(income * 0.05);
    }

    recommended = Math.round(recommended / 100) * 100; // Round to nearest 100
    totalRecommended += recommended;

    const status = currentSpend > recommended * 1.2 ? "over" : currentSpend < recommended * 0.8 ? "under" : "on-track";

    recommendations.push({
      category,
      recommended,
      currentSpend: Math.round(currentSpend),
      averageSpend: Math.round(avgSpend),
      status,
      type: isNeed ? "need" : "want",
      tip: generateCategoryTip(category, currentSpend, recommended, avgSpend)
    });
  }

  // Add savings recommendation
  const currentSavings = Math.max(0, income - currentMonthExpenses);
  const recommendedSavings = Math.round(savingsTarget / 100) * 100;

  recommendations.push({
    category: "Savings",
    recommended: recommendedSavings,
    currentSpend: Math.round(currentSavings),
    averageSpend: null,
    status: currentSavings >= recommendedSavings ? "on-track" : "under",
    type: "savings",
    tip: currentSavings >= recommendedSavings
      ? "Great job! You're meeting your savings target."
      : `Try to save at least ₹${recommendedSavings} (20% of income) each month.`
  });

  // Sort: needs first, then wants, then savings
  const typeOrder = { need: 0, want: 1, savings: 2 };
  recommendations.sort((a, b) => typeOrder[a.type] - typeOrder[b.type] || b.recommended - a.recommended);

  return {
    available: true,
    income: Math.round(income),
    totalRecommendedSpending: totalRecommended,
    recommendedSavings,
    recommendations,
    methodology: "Based on the 50/30/20 rule adjusted by your actual spending patterns",
    disclaimer: "These are suggested guidelines based on your spending history, not professional financial advice."
  };
}

function calculateCategoryAverages(allExpenses, monthlyTrend) {
  const monthsWithData = monthlyTrend.filter(m => m.total > 0).length || 1;
  const categoryTotals = {};

  for (const expense of allExpenses) {
    categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
  }

  const averages = {};
  for (const [category, total] of Object.entries(categoryTotals)) {
    averages[category] = total / monthsWithData;
  }

  return averages;
}

function generateCategoryTip(category, current, recommended, average) {
  if (current === 0) {
    return `No ${category.toLowerCase()} expenses this month yet.`;
  }

  if (current > recommended * 1.3) {
    const savings = Math.round(current - recommended);
    return `Reducing ${category.toLowerCase()} spending to ₹${recommended} could save you ₹${savings} this month.`;
  }

  if (current <= recommended * 0.7) {
    return `Your ${category.toLowerCase()} spending is well within budget. Great discipline!`;
  }

  return `Your ${category.toLowerCase()} spending is on track with the recommended budget.`;
}
