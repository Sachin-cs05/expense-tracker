import { buildFinancialContext } from "./dataAggregator.js";

const Z_SCORE_THRESHOLD = 2.0; // Transactions > 2 standard deviations above mean
const MIN_TRANSACTIONS_PER_CATEGORY = 4; // Need enough data for meaningful detection

/**
 * Detect anomalous (unusual) expenses using Z-score per category.
 * Falls back to IQR method when categories have fewer data points.
 */
export async function detectAnomalies(ownerId) {
  const context = await buildFinancialContext(ownerId);
  const allExpenses = context._raw.allExpenses;

  if (allExpenses.length < 5) {
    return {
      anomalies: [],
      message: "Not enough transaction history for anomaly detection. Keep tracking your expenses!",
      analyzed: false
    };
  }

  // Group expenses by category
  const categoryGroups = {};
  for (const expense of allExpenses) {
    if (!categoryGroups[expense.category]) {
      categoryGroups[expense.category] = [];
    }
    categoryGroups[expense.category].push(expense);
  }

  const anomalies = [];

  for (const [category, expenses] of Object.entries(categoryGroups)) {
    if (expenses.length < MIN_TRANSACTIONS_PER_CATEGORY) continue;

    const amounts = expenses.map(e => e.amount);
    const detected = detectCategoryAnomalies(amounts, expenses, category);
    anomalies.push(...detected);
  }

  // Also check for overall outliers (regardless of category)
  const allAmounts = allExpenses.map(e => e.amount);
  const overallAnomalies = detectOverallAnomalies(allAmounts, allExpenses);
  
  // Merge, deduplicate by expense ID, sort by severity
  const seen = new Set(anomalies.map(a => a.id));
  for (const anomaly of overallAnomalies) {
    if (!seen.has(anomaly.id)) {
      anomalies.push(anomaly);
    }
  }

  anomalies.sort((a, b) => b.severity - a.severity);

  return {
    anomalies: anomalies.slice(0, 10),
    analyzed: true,
    totalTransactionsAnalyzed: allExpenses.length,
    categoriesAnalyzed: Object.keys(categoryGroups).length,
    message: anomalies.length > 0
      ? `Found ${anomalies.length} unusual transaction${anomalies.length === 1 ? "" : "s"} in your history.`
      : "No unusual spending detected. Your transactions look consistent!"
  };
}

function detectCategoryAnomalies(amounts, expenses, category) {
  const anomalies = [];
  const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);

  if (stdDev === 0) return anomalies; // All same amount, no anomalies

  for (let i = 0; i < expenses.length; i++) {
    const zScore = (amounts[i] - mean) / stdDev;

    if (zScore > Z_SCORE_THRESHOLD) {
      const expense = expenses[i];
      anomalies.push({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        severity: Math.round(zScore * 10) / 10,
        method: "z-score",
        reason: `₹${expense.amount} is significantly higher than your usual ${category} spending (average: ₹${Math.round(mean)}).`,
        averageForCategory: Math.round(mean),
        deviationPercent: Math.round(((expense.amount - mean) / mean) * 100)
      });
    }
  }

  // Fallback: IQR method for additional detection
  if (anomalies.length === 0 && amounts.length >= 6) {
    const sorted = [...amounts].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const upperFence = q3 + 1.5 * iqr;

    for (let i = 0; i < expenses.length; i++) {
      if (amounts[i] > upperFence && amounts[i] > mean * 2) {
        const expense = expenses[i];
        anomalies.push({
          id: expense.id,
          amount: expense.amount,
          category: expense.category,
          description: expense.description,
          date: expense.date,
          severity: Math.round(((amounts[i] - upperFence) / iqr) * 10) / 10,
          method: "iqr",
          reason: `₹${expense.amount} exceeds the typical range for ${category} (usual upper limit: ₹${Math.round(upperFence)}).`,
          averageForCategory: Math.round(mean),
          deviationPercent: Math.round(((expense.amount - mean) / mean) * 100)
        });
      }
    }
  }

  return anomalies;
}

function detectOverallAnomalies(amounts, expenses) {
  const anomalies = [];
  const mean = amounts.reduce((s, v) => s + v, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - mean) ** 2, 0) / amounts.length);

  if (stdDev === 0) return anomalies;

  for (let i = 0; i < expenses.length; i++) {
    const zScore = (amounts[i] - mean) / stdDev;

    if (zScore > 3.0) { // Higher threshold for overall (less category-specific)
      const expense = expenses[i];
      anomalies.push({
        id: expense.id,
        amount: expense.amount,
        category: expense.category,
        description: expense.description,
        date: expense.date,
        severity: Math.round(zScore * 10) / 10,
        method: "z-score-global",
        reason: `₹${expense.amount} is unusually high compared to your overall spending pattern (average: ₹${Math.round(mean)}).`,
        averageForCategory: Math.round(mean),
        deviationPercent: Math.round(((expense.amount - mean) / mean) * 100)
      });
    }
  }

  return anomalies;
}
