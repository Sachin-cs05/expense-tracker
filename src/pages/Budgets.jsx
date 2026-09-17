import { useCallback, useEffect, useState } from "react";
import { format } from "date-fns";
import { api } from "../lib/api.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { Card, EmptyState, ProgressBar, Skeleton } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { BudgetFormModal } from "../components/forms/BudgetFormModal.jsx";
import { VoiceExpenseModal } from "../components/voice/VoiceExpenseModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Budgets() {
  const { expenseCategories } = useAppData();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [summary, setSummary] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSummary(await api.getSummary({ month }));
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryColor = (name) => expenseCategories.find((category) => category.name === name)?.color || "#6B7280";
  const categoryIcon = (name) => expenseCategories.find((category) => category.name === name)?.icon || "🏷️";
  const spentCategories = summary ? summary.categoryTotals.filter((entry) => entry.total > 0).sort((a, b) => b.total - a.total) : [];
  const budgetAmount = summary?.budget?.amount;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Budgets</h2>
          <p className="muted-copy">Set a monthly ceiling and watch where it goes.</p>
        </div>
        <div className="page-header-actions">
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="month-picker" />
          <button
            type="button"
            className="btn btn-secondary voice-quick-btn"
            onClick={() => setIsVoiceOpen(true)}
            title="Add expense with voice"
          >
            <Icon name="mic" size={16} />
            <span className="voice-btn-label">Voice Entry</span>
          </button>
          <button type="button" className="btn btn-primary" onClick={() => setIsFormOpen(true)}>
            <Icon name="plus" size={16} />
            {budgetAmount ? "Update Budget" : "Create Budget"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton height={100} />
      ) : budgetAmount ? (
        <div className="summary-grid summary-grid-3">
          <Card className="summary-card">
            <p className="summary-card-label">Total Budget</p>
            <p className="summary-card-value">{formatCurrency(budgetAmount)}</p>
          </Card>
          <Card className="summary-card">
            <p className="summary-card-label">Total Spent</p>
            <p className="summary-card-value">{formatCurrency(summary.budgetStatus.spent)}</p>
          </Card>
          <Card className={`summary-card ${summary.budgetStatus.exceeded ? "summary-negative" : "summary-positive"}`}>
            <p className="summary-card-label">Remaining</p>
            <p className="summary-card-value">{formatCurrency(summary.budgetStatus.remaining)}</p>
          </Card>
        </div>
      ) : (
        <Card>
          <EmptyState icon="target" title="No budget set for this month" description="Create a monthly budget to track your spending against it." actionLabel="Create Budget" onAction={() => setIsFormOpen(true)} />
        </Card>
      )}

      {budgetAmount ? (
        <Card>
          <div className="card-header">
            <h3>Overall progress</h3>
          </div>
          <ProgressBar value={(summary.budgetStatus.spent / budgetAmount) * 100} tone={summary.budgetStatus.exceeded ? "danger" : "primary"} />
          <p className="muted-copy" style={{ marginTop: 8 }}>
            {Math.round((summary.budgetStatus.spent / budgetAmount) * 100)}% of this month's budget used
          </p>
        </Card>
      ) : null}

      <Card>
        <div className="card-header">
          <h3>Spending by category</h3>
        </div>
        {isLoading ? (
          <Skeleton height={160} />
        ) : spentCategories.length ? (
          <div className="budget-category-grid">
            {spentCategories.map((entry) => {
              const shareOfBudget = budgetAmount ? (entry.total / budgetAmount) * 100 : null;
              return (
                <div className="budget-category-card" key={entry.category}>
                  <div className="budget-category-head">
                    <span className="category-icon-badge" style={{ background: `${categoryColor(entry.category)}22`, color: categoryColor(entry.category) }}>
                      {categoryIcon(entry.category)}
                    </span>
                    <p>{entry.category}</p>
                  </div>
                  <p className="budget-category-amount">{formatCurrency(entry.total)}</p>
                  {shareOfBudget !== null ? (
                    <>
                      <ProgressBar value={shareOfBudget} tone={shareOfBudget > 40 ? "warning" : "primary"} />
                      <p className="muted-copy">{Math.round(shareOfBudget)}% of monthly budget</p>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState icon="tag" title="No spending yet" description="Once you log expenses this month, the breakdown appears here." />
        )}
      </Card>

      <VoiceExpenseModal isOpen={isVoiceOpen} onClose={() => setIsVoiceOpen(false)} onSaved={load} />
      <BudgetFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={load} defaultMonth={month} />
    </div>
  );
}
