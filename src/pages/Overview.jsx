import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Card, ProgressBar, Skeleton, EmptyState, Badge } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { ExpenseFormModal } from "../components/forms/ExpenseFormModal.jsx";
import { FinancialHealthGauge, AiInsightsPanel, PredictionCard, AnomalyAlerts } from "../components/ai/AiDashboardWidgets.jsx";

function greetingForHour() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Overview() {
  const { user } = useAuth();
  const [month, setMonth] = useState(format(new Date(), "yyyy-MM"));
  const [summary, setSummary] = useState(null);
  const [incomeSummary, setIncomeSummary] = useState(null);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [dailyData, setDailyData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, incomeData, expenses, daily] = await Promise.all([
        api.getSummary({ month }),
        api.getIncomeSummary({ month }),
        api.getExpenses({ month }),
        api.getDailyData({ month })
      ]);
      setSummary(summaryData);
      setIncomeSummary(incomeData);
      setRecentExpenses(expenses.slice(0, 6));
      setDailyData(daily);
    } finally {
      setIsLoading(false);
    }
  }, [month]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const balance = useMemo(() => {
    if (!summary || !incomeSummary) return 0;
    return incomeSummary.total - summary.totalExpenses;
  }, [summary, incomeSummary]);

  const budgetRemaining = summary?.budgetStatus ? summary.budgetStatus.remaining : null;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2 className="greeting">
            {greetingForHour()}, {user?.name?.split(" ")[0] || "there"} 👋
          </h2>
          <p className="muted-copy">Here's where your money stands this month.</p>
        </div>
        <div className="page-header-actions">
          <input type="month" value={month} onChange={(event) => setMonth(event.target.value)} className="month-picker" />
          <button type="button" className="btn btn-primary" onClick={() => setIsAddOpen(true)}>
            <Icon name="plus" size={16} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="summary-grid">
        <SummaryCard label="Total Income" value={incomeSummary?.total} tone="positive" icon="trendingUp" loading={isLoading} />
        <SummaryCard label="Total Expenses" value={summary?.totalExpenses} tone="negative" icon="wallet" loading={isLoading} />
        <SummaryCard label="Current Balance" value={balance} tone={balance >= 0 ? "positive" : "negative"} icon="creditCard" loading={isLoading} />
        <SummaryCard
          label="Remaining Budget"
          value={budgetRemaining}
          tone={budgetRemaining === null ? "neutral" : budgetRemaining >= 0 ? "positive" : "negative"}
          icon="target"
          loading={isLoading}
          fallback="No budget set"
        />
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-header">
            <h3>Spending overview</h3>
          </div>
          {isLoading ? (
            <Skeleton height={220} />
          ) : dailyData.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={dailyData}>
                <defs>
                  <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tickFormatter={(value) => value.slice(8, 10)} stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} width={40} />
                <Tooltip
                  contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }}
                  formatter={(value) => formatCurrency(value)}
                />
                <Area type="monotone" dataKey="cumulativeTotal" stroke="var(--primary)" fill="url(#spendGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="barChart" title="No spending yet" description="Add an expense to see your trend appear here." />
          )}
        </Card>

        <Card>
          <div className="card-header">
            <h3>Budget overview</h3>
          </div>
          {isLoading ? (
            <Skeleton height={80} />
          ) : summary?.budgetStatus ? (
            <div className="budget-mini">
              <div className="budget-mini-row">
                <span>{formatCurrency(summary.budgetStatus.spent)} spent</span>
                <span className="muted-copy">of {formatCurrency(summary.budget.amount)}</span>
              </div>
              <ProgressBar
                value={(summary.budgetStatus.spent / summary.budget.amount) * 100}
                tone={summary.budgetStatus.exceeded ? "danger" : "primary"}
              />
              <p className="muted-copy">
                {summary.budgetStatus.exceeded
                  ? `Over budget by ${formatCurrency(Math.abs(summary.budgetStatus.remaining))}`
                  : `${formatCurrency(summary.budgetStatus.remaining)} remaining`}
              </p>
            </div>
          ) : (
            <EmptyState icon="target" title="No budget set" description="Set a monthly budget to track your spending against it." />
          )}
        </Card>
      </div>

      <Card>
        <div className="card-header">
          <h3>Recent transactions</h3>
        </div>
        {isLoading ? (
          <Skeleton height={160} />
        ) : recentExpenses.length ? (
          <div className="mini-list">
            {recentExpenses.map((expense) => (
              <div className="mini-list-row" key={expense.id}>
                <div>
                  <p className="mini-list-title">{expense.description}</p>
                  <p className="muted-copy">
                    {expense.category} • {expense.date}
                  </p>
                </div>
                <span className="amount-negative">-{formatCurrency(expense.amount)}</span>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState icon="wallet" title="No expenses yet" description="Start tracking your spending to understand where your money goes." actionLabel="Add Expense" onAction={() => setIsAddOpen(true)} />
        )}
      </Card>

      {!isLoading && summary?.smartInsights?.length ? (
        <Card>
          <div className="card-header">
            <h3>Financial insights</h3>
          </div>
          <div className="insight-list">
            {summary.smartInsights.map((insight, index) => (
              <div className="insight-row" key={index}>
                <Badge tone={insight.type.includes("warning") || insight.type.includes("exceeded") ? "warning" : "info"}>
                  {insight.type.includes("warning") || insight.type.includes("exceeded") ? "⚠" : "💡"}
                </Badge>
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* AI-powered sections (load independently) */}
      <div className="grid-2">
        <FinancialHealthGauge />
        <PredictionCard />
      </div>

      <AiInsightsPanel />
      <AnomalyAlerts />

      <AiQuickChat />

      <ExpenseFormModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} onSaved={loadDashboard} />
    </div>
  );
}

function AiQuickChat() {
  const navigate = useNavigate();
  return (
    <Card className="ai-quick-chat-card" onClick={() => navigate("/ai-assistant")} role="button" tabIndex={0}>
      <div className="ai-quick-chat-content">
        <div className="ai-quick-chat-icon">
          <Icon name="sparkles" size={22} />
        </div>
        <div>
          <h3>Ask FinTrack AI</h3>
          <p className="muted-copy">"Where did I spend the most?" "Can I save ₹5,000?" "Compare my months"</p>
        </div>
        <Icon name="chevronRight" size={20} className="ai-quick-chat-arrow" />
      </div>
    </Card>
  );
}

function SummaryCard({ label, value, tone, icon, loading, fallback }) {
  return (
    <Card className={`summary-card summary-${tone}`}>
      <div className="summary-card-icon">
        <Icon name={icon} size={18} />
      </div>
      <p className="summary-card-label">{label}</p>
      {loading ? (
        <Skeleton height={26} width="70%" />
      ) : value === null || value === undefined ? (
        <p className="summary-card-value muted-copy">{fallback || "—"}</p>
      ) : (
        <p className="summary-card-value">{formatCurrency(value)}</p>
      )}
    </Card>
  );
}
