import { generateJSON } from "./geminiClient.js";
import { buildFinancialContext } from "./dataAggregator.js";
import { detectAnomalies } from "./anomalyDetector.js";

/**
 * Calculate a composite financial health score (0-100).
 * All factors computed deterministically. AI provides explanation.
 */
export async function calculateFinancialHealth(ownerId) {
  const context = await buildFinancialContext(ownerId);
  const anomalyResult = await detectAnomalies(ownerId);
  const { summary, budget, monthlyTrend } = context;

  const factors = [];
  let totalScore = 0;
  let totalWeight = 0;

  // Factor 1: Savings Rate (weight: 25)
  const savingsRateScore = calculateSavingsRateScore(summary);
  factors.push(savingsRateScore);
  totalScore += savingsRateScore.score * savingsRateScore.weight;
  totalWeight += savingsRateScore.weight;

  // Factor 2: Expense-to-Income Ratio (weight: 20)
  const expenseRatioScore = calculateExpenseRatioScore(summary);
  factors.push(expenseRatioScore);
  totalScore += expenseRatioScore.score * expenseRatioScore.weight;
  totalWeight += expenseRatioScore.weight;

  // Factor 3: Budget Adherence (weight: 20)
  const budgetScore = calculateBudgetScore(budget);
  factors.push(budgetScore);
  totalScore += budgetScore.score * budgetScore.weight;
  totalWeight += budgetScore.weight;

  // Factor 4: Spending Consistency (weight: 15)
  const consistencyScore = calculateConsistencyScore(monthlyTrend);
  factors.push(consistencyScore);
  totalScore += consistencyScore.score * consistencyScore.weight;
  totalWeight += consistencyScore.weight;

  // Factor 5: Anomaly Impact (weight: 10)
  const anomalyScore = calculateAnomalyScore(anomalyResult);
  factors.push(anomalyScore);
  totalScore += anomalyScore.score * anomalyScore.weight;
  totalWeight += anomalyScore.weight;

  // Factor 6: Spending Trend (weight: 10)
  const trendScore = calculateTrendScore(monthlyTrend);
  factors.push(trendScore);
  totalScore += trendScore.score * trendScore.weight;
  totalWeight += trendScore.weight;

  const overallScore = totalWeight > 0 ? Math.round(totalScore / totalWeight) : 50;
  const rating = getScoreRating(overallScore);

  // Separate positive and negative factors
  const positiveFactors = factors.filter(f => f.score >= 70).map(f => f.label);
  const negativeFactors = factors.filter(f => f.score < 50).map(f => f.label);

  // Try to get AI-generated explanation
  let aiExplanation = null;
  try {
    const factorsSummary = factors.map(f => `${f.name}: ${f.score}/100 - ${f.label}`).join("\n");
    const result = await generateJSON(
      "You are a financial health advisor. Return JSON: {\"explanation\": \"2-3 sentence summary\", \"topTip\": \"single actionable tip\"}",
      `Financial health score: ${overallScore}/100 (${rating})
Income: ₹${summary.currentMonthIncome}, Expenses: ₹${summary.currentMonthExpenses}
Factors:\n${factorsSummary}
Generate a brief, encouraging explanation and one actionable tip.`
    );
    if (result?.explanation) {
      aiExplanation = result;
    }
  } catch {
    // AI explanation failed, continue with deterministic data
  }

  return {
    score: overallScore,
    rating,
    factors,
    positiveFactors,
    negativeFactors,
    aiExplanation,
    disclaimer: "This score is an educational metric for personal finance tracking, not professional financial advice.",
    calculatedAt: new Date().toISOString()
  };
}

function calculateSavingsRateScore(summary) {
  const { currentMonthIncome, currentMonthExpenses } = summary;
  let score = 50; // Default when no income

  if (currentMonthIncome > 0) {
    const savingsRate = ((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100;
    if (savingsRate >= 30) score = 100;
    else if (savingsRate >= 20) score = 85;
    else if (savingsRate >= 10) score = 70;
    else if (savingsRate >= 0) score = 55;
    else if (savingsRate >= -10) score = 35;
    else score = 15;
  }

  return {
    name: "savings_rate",
    weight: 25,
    score,
    label: currentMonthIncome > 0
      ? `Savings rate: ${Math.round(((currentMonthIncome - currentMonthExpenses) / currentMonthIncome) * 100)}%`
      : "No income data available"
  };
}

function calculateExpenseRatioScore(summary) {
  const { currentMonthIncome, currentMonthExpenses } = summary;
  let score = 50;

  if (currentMonthIncome > 0) {
    const ratio = currentMonthExpenses / currentMonthIncome;
    if (ratio <= 0.5) score = 100;
    else if (ratio <= 0.7) score = 85;
    else if (ratio <= 0.85) score = 70;
    else if (ratio <= 1.0) score = 50;
    else score = 20;
  }

  return {
    name: "expense_ratio",
    weight: 20,
    score,
    label: currentMonthIncome > 0
      ? `Spending ${Math.round((currentMonthExpenses / currentMonthIncome) * 100)}% of income`
      : "No income data for comparison"
  };
}

function calculateBudgetScore(budget) {
  if (!budget) {
    return { name: "budget_adherence", weight: 20, score: 50, label: "No budget set — consider setting one" };
  }

  const usage = budget.spent / budget.amount;
  let score;
  if (usage <= 0.8) score = 95;
  else if (usage <= 0.95) score = 80;
  else if (usage <= 1.0) score = 65;
  else if (usage <= 1.15) score = 40;
  else score = 20;

  return {
    name: "budget_adherence",
    weight: 20,
    score,
    label: `Budget ${Math.round(usage * 100)}% used (₹${budget.spent} of ₹${budget.amount})`
  };
}

function calculateConsistencyScore(monthlyTrend) {
  const nonZero = monthlyTrend.filter(m => m.total > 0);
  if (nonZero.length < 2) {
    return { name: "consistency", weight: 15, score: 50, label: "Not enough history for consistency check" };
  }

  const values = nonZero.map(m => m.total);
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const cv = Math.sqrt(values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length) / mean;

  let score;
  if (cv <= 0.1) score = 95;
  else if (cv <= 0.2) score = 80;
  else if (cv <= 0.35) score = 65;
  else if (cv <= 0.5) score = 45;
  else score = 25;

  return {
    name: "consistency",
    weight: 15,
    score,
    label: cv <= 0.2 ? "Spending is very consistent" : cv <= 0.4 ? "Moderate spending variation" : "High spending variation month-to-month"
  };
}

function calculateAnomalyScore(anomalyResult) {
  const count = anomalyResult.anomalies?.length || 0;
  let score;
  if (count === 0) score = 100;
  else if (count <= 2) score = 70;
  else if (count <= 5) score = 45;
  else score = 20;

  return {
    name: "anomalies",
    weight: 10,
    score,
    label: count === 0 ? "No unusual spending detected" : `${count} unusual transaction${count === 1 ? "" : "s"} found`
  };
}

function calculateTrendScore(monthlyTrend) {
  const nonZero = monthlyTrend.filter(m => m.total > 0);
  if (nonZero.length < 3) {
    return { name: "trend", weight: 10, score: 50, label: "Need more data for trend analysis" };
  }

  // Check if spending is trending up or down (last 3 months)
  const recent = nonZero.slice(-3);
  const firstHalf = recent.slice(0, Math.ceil(recent.length / 2)).reduce((s, m) => s + m.total, 0);
  const secondHalf = recent.slice(Math.ceil(recent.length / 2)).reduce((s, m) => s + m.total, 0);
  const avgFirst = firstHalf / Math.ceil(recent.length / 2);
  const avgSecond = secondHalf / (recent.length - Math.ceil(recent.length / 2));
  const trendPct = avgFirst > 0 ? ((avgSecond - avgFirst) / avgFirst) * 100 : 0;

  let score;
  if (trendPct <= -10) score = 90; // Spending decreasing — good
  else if (trendPct <= 0) score = 75;
  else if (trendPct <= 10) score = 60;
  else if (trendPct <= 25) score = 40;
  else score = 20; // Spending increasing rapidly

  return {
    name: "trend",
    weight: 10,
    score,
    label: trendPct <= 0 ? "Spending trend is stable or decreasing" : `Spending trending up ${Math.round(trendPct)}%`
  };
}

function getScoreRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 55) return "Fair";
  if (score >= 40) return "Needs Attention";
  return "Critical";
}
