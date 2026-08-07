export function SmartInsightsPanel({ summary }) {
  const insights = summary?.smartInsights || [];
  const alerts = summary?.alerts || [];
  const recurring = summary?.recurringExpenses || [];
  const forecast = summary?.forecast;

  return (
    <div>
      <div className="section-heading"><div><p className="eyebrow">Smart Assistant</p><h2>Spending insights</h2></div></div>
      {forecast ? <div className="forecast-card"><span>Projected month-end spend</span><strong>₹{forecast.projectedSpend.toFixed(2)}</strong><small>Average ₹{forecast.averageDailySpend.toFixed(2)} per day</small></div> : null}
      <div className="insight-list">
        {[...alerts, ...insights].slice(0, 5).map((item, index) => <p className={`insight-item ${item.severity || "info"}`} key={`${item.message}-${index}`}>{item.message}</p>)}
        {!insights.length && !alerts.length ? <p className="muted-copy">Add a few expenses to unlock personalized insights.</p> : null}
      </div>
      {recurring.length ? <div className="recurring-list"><p className="recurring-title">Detected recurring payments</p>{recurring.map((item) => <p key={`${item.description}-${item.lastDate}`}>{item.description} · ₹{item.amount.toFixed(2)}</p>)}</div> : null}
    </div>
  );
}
