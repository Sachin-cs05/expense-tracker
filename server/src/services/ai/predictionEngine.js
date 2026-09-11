import { buildFinancialContext } from "./dataAggregator.js";

const MIN_MONTHS_FOR_PREDICTION = 3;

/**
 * Predict next month's expenses using weighted linear regression.
 * Pure JavaScript — no Python or ML libraries needed.
 */
export async function predictExpenses(ownerId) {
  const context = await buildFinancialContext(ownerId);
  const { monthlyTrend } = context;

  // Filter to months with actual spending
  const dataPoints = monthlyTrend.filter(m => m.total > 0);

  if (dataPoints.length < MIN_MONTHS_FOR_PREDICTION) {
    return {
      available: false,
      message: `Not enough historical data to make a reliable prediction. You need at least ${MIN_MONTHS_FOR_PREDICTION} months of expense data (currently have ${dataPoints.length}).`,
      dataPoints: dataPoints.length,
      requiredPoints: MIN_MONTHS_FOR_PREDICTION
    };
  }

  // Weighted linear regression (recent months weighted more heavily)
  const n = dataPoints.length;
  const values = dataPoints.map(d => d.total);
  const weights = dataPoints.map((_, i) => 1 + i * 0.5); // Recent months weigh more

  // Weighted least squares
  const { slope, intercept } = weightedLinearRegression(values, weights);
  const predicted = intercept + slope * n;

  // Simple moving average as alternative
  const recentAvg = values.slice(-3).reduce((s, v) => s + v, 0) / Math.min(3, values.length);

  // Blend: 60% regression, 40% recent average
  const blendedPrediction = Math.round(predicted * 0.6 + recentAvg * 0.4);
  const finalPrediction = Math.max(0, blendedPrediction);

  // Calculate confidence and range
  const variance = calculateVariance(values);
  const stdDev = Math.sqrt(variance);
  const coeffOfVariation = values.length > 0 ? stdDev / (values.reduce((s, v) => s + v, 0) / values.length) : 1;

  // Confidence: lower CV = higher confidence
  const confidence = Math.max(0, Math.min(100, Math.round((1 - coeffOfVariation) * 100)));

  const lowerBound = Math.max(0, Math.round(finalPrediction - stdDev));
  const upperBound = Math.round(finalPrediction + stdDev);

  // Determine trend direction
  const recentTrend = values.length >= 2
    ? values[values.length - 1] - values[values.length - 2]
    : 0;

  return {
    available: true,
    predicted: finalPrediction,
    range: {
      low: lowerBound,
      high: upperBound
    },
    confidence,
    confidenceLabel: confidence >= 70 ? "High" : confidence >= 40 ? "Moderate" : "Low",
    trend: recentTrend > 0 ? "increasing" : recentTrend < 0 ? "decreasing" : "stable",
    trendAmount: Math.abs(Math.round(recentTrend)),
    historicalData: dataPoints.map(d => ({
      month: d.month,
      actual: d.total
    })),
    methodology: "Weighted linear regression blended with recent moving average",
    disclaimer: "This is an estimate based on your historical spending patterns. Actual spending may vary."
  };
}

function weightedLinearRegression(values, weights) {
  const n = values.length;
  let sumW = 0, sumWX = 0, sumWY = 0, sumWXX = 0, sumWXY = 0;

  for (let i = 0; i < n; i++) {
    const w = weights[i];
    const x = i;
    const y = values[i];
    sumW += w;
    sumWX += w * x;
    sumWY += w * y;
    sumWXX += w * x * x;
    sumWXY += w * x * y;
  }

  const denom = sumW * sumWXX - sumWX * sumWX;
  if (Math.abs(denom) < 1e-10) {
    // Degenerate case: return flat prediction
    return { slope: 0, intercept: sumWY / sumW };
  }

  const slope = (sumW * sumWXY - sumWX * sumWY) / denom;
  const intercept = (sumWY - slope * sumWX) / sumW;

  return { slope, intercept };
}

function calculateVariance(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
}
