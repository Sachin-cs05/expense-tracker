export function SummaryCards({ summary, budgetStatus }) {
  const topCategory = [...summary.categoryTotals].sort((left, right) => right.total - left.total)[0];

  return (
    <div className="summary-grid">
      <article className="summary-card accent">
        <p>Total Expenses</p>
        <h3>₹{summary.totalExpenses.toFixed(2)}</h3>
      </article>
      <article className="summary-card">
        <p>Top Category</p>
        <h3>{topCategory?.category || "N/A"}</h3>
        <span>₹{topCategory?.total?.toFixed(2) || "0.00"}</span>
      </article>
      <article className="summary-card">
        <p>Monthly Summaries</p>
        <h3>{summary.monthlySummaries.length}</h3>
        <span>Tracked months</span>
      </article>
      <article className={`summary-card ${budgetStatus?.exceeded ? "warning" : ""}`}>
        <p>Budget Status</p>
        <h3>{budgetStatus?.exceeded ? "Alert" : "On Track"}</h3>
        <span>
          {budgetStatus ? `Remaining ₹${budgetStatus.remaining.toFixed(2)}` : "Set a budget to start"}
        </span>
      </article>
    </div>
  );
}
