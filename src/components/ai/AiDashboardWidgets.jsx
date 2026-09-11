import { useEffect, useState } from "react";
import { api } from "../../lib/api.js";
import { Card, Skeleton } from "../../ui/Primitives.jsx";
import { Icon } from "../../ui/Icon.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}

export function FinancialHealthGauge() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    api.aiHealth()
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (error) return null; // Silently hide on error

  return (
    <Card className="ai-health-card">
      <div className="card-header">
        <h3><Icon name="activity" size={16} /> Financial Health</h3>
      </div>
      {isLoading ? (
        <Skeleton height={140} />
      ) : data ? (
        <div className="health-gauge-container">
          <div className="health-gauge">
            <svg viewBox="0 0 120 120" className="health-gauge-svg">
              <circle cx="60" cy="60" r="50" fill="none" stroke="var(--border)" strokeWidth="8" strokeDasharray="235.6" strokeDashoffset="78.5" transform="rotate(135 60 60)" />
              <circle cx="60" cy="60" r="50" fill="none" stroke={getHealthColor(data.score)} strokeWidth="8" strokeDasharray="235.6" strokeDashoffset={235.6 - (data.score / 100) * 157.1} strokeLinecap="round" transform="rotate(135 60 60)" className="health-gauge-fill" />
            </svg>
            <div className="health-gauge-label">
              <span className="health-score">{data.score}</span>
              <span className="health-max">/100</span>
            </div>
          </div>
          <div className="health-rating" style={{ color: getHealthColor(data.score) }}>{data.rating}</div>
          {data.positiveFactors?.length > 0 && (
            <div className="health-factors">
              {data.positiveFactors.slice(0, 2).map((f, i) => (
                <span key={i} className="health-factor health-factor-positive">✓ {f}</span>
              ))}
            </div>
          )}
          {data.negativeFactors?.length > 0 && (
            <div className="health-factors">
              {data.negativeFactors.slice(0, 2).map((f, i) => (
                <span key={i} className="health-factor health-factor-negative">⚠ {f}</span>
              ))}
            </div>
          )}
          {data.aiExplanation?.topTip && (
            <p className="health-tip"><Icon name="zap" size={14} /> {data.aiExplanation.topTip}</p>
          )}
        </div>
      ) : null}
    </Card>
  );
}

export function AiInsightsPanel() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.aiInsights()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && (!data || !data.insights?.length)) return null;

  return (
    <Card className="ai-insights-card">
      <div className="card-header">
        <h3><Icon name="sparkles" size={16} /> AI Insights</h3>
      </div>
      {isLoading ? (
        <Skeleton height={120} />
      ) : (
        <div className="ai-insight-list">
          {data.aiSummary?.summary && (
            <p className="ai-summary-text">{data.aiSummary.summary}</p>
          )}
          {data.insights.slice(0, 5).map((insight, i) => (
            <div key={i} className={`ai-insight-row ai-insight-${insight.type}`}>
              <span className="ai-insight-icon">
                {insight.type === "positive" ? "✅" : insight.type === "warning" || insight.type === "danger" ? "⚠️" : "💡"}
              </span>
              <span className="ai-insight-message">{insight.message}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

export function PredictionCard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.aiPrediction()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && (!data || !data.available)) return null;

  return (
    <Card className="ai-prediction-card">
      <div className="card-header">
        <h3><Icon name="zap" size={16} /> Expense Prediction</h3>
      </div>
      {isLoading ? (
        <Skeleton height={100} />
      ) : data?.available ? (
        <div className="prediction-content">
          <div className="prediction-main">
            <span className="prediction-label">Next month estimate</span>
            <span className="prediction-value">{formatCurrency(data.predicted)}</span>
            <span className="prediction-range muted-copy">
              Range: {formatCurrency(data.range.low)} – {formatCurrency(data.range.high)}
            </span>
          </div>
          <div className="prediction-meta">
            <span className={`prediction-confidence confidence-${data.confidenceLabel.toLowerCase()}`}>
              {data.confidenceLabel} confidence
            </span>
            <span className={`prediction-trend trend-${data.trend}`}>
              {data.trend === "increasing" ? "📈" : data.trend === "decreasing" ? "📉" : "➡️"} {data.trend}
              {data.trendAmount > 0 ? ` (${formatCurrency(data.trendAmount)})` : ""}
            </span>
          </div>
        </div>
      ) : null}
    </Card>
  );
}

export function AnomalyAlerts() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    api.aiAnomalies()
      .then(setData)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  if (!isLoading && (!data || !data.anomalies?.length)) return null;

  return (
    <Card className="ai-anomaly-card">
      <div className="card-header">
        <h3><Icon name="alertTriangle" size={16} /> Unusual Expenses</h3>
      </div>
      {isLoading ? (
        <Skeleton height={80} />
      ) : (
        <div className="anomaly-list">
          {data.anomalies.slice(0, 3).map((anomaly, i) => (
            <div key={i} className="anomaly-item">
              <div className="anomaly-icon">🚨</div>
              <div className="anomaly-detail">
                <span className="anomaly-desc">{anomaly.description}</span>
                <span className="anomaly-amount">{formatCurrency(anomaly.amount)}</span>
              </div>
              <p className="anomaly-reason muted-copy">{anomaly.reason}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

function getHealthColor(score) {
  if (score >= 80) return "#10B981";
  if (score >= 60) return "#F59E0B";
  if (score >= 40) return "#F97316";
  return "#EF4444";
}
