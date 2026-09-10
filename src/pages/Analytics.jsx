import { useCallback, useEffect, useMemo, useState } from "react";
import { format, startOfMonth, startOfYear, subDays, subMonths } from "date-fns";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { api } from "../lib/api.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { Card, EmptyState, Skeleton, Badge } from "../ui/Primitives.jsx";

const ranges = [
  { key: "today", label: "Today" },
  { key: "7d", label: "7 Days" },
  { key: "month", label: "This Month" },
  { key: "lastMonth", label: "Last Month" },
  { key: "year", label: "This Year" },
  { key: "custom", label: "Custom" }
];

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

function rangeToFilters(rangeKey, custom) {
  const today = new Date();
  if (rangeKey === "today") {
    const day = format(today, "yyyy-MM-dd");
    return { startDate: day, endDate: day };
  }
  if (rangeKey === "7d") {
    return { startDate: format(subDays(today, 6), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
  }
  if (rangeKey === "month") {
    return { month: format(today, "yyyy-MM") };
  }
  if (rangeKey === "lastMonth") {
    return { month: format(subMonths(today, 1), "yyyy-MM") };
  }
  if (rangeKey === "year") {
    return { startDate: format(startOfYear(today), "yyyy-MM-dd"), endDate: format(today, "yyyy-MM-dd") };
  }
  return { startDate: custom.startDate, endDate: custom.endDate };
}

export default function Analytics() {
  const { expenseCategories } = useAppData();
  const [rangeKey, setRangeKey] = useState("month");
  const [custom, setCustom] = useState({ startDate: format(startOfMonth(new Date()), "yyyy-MM-dd"), endDate: format(new Date(), "yyyy-MM-dd") });
  const [summary, setSummary] = useState(null);
  const [incomeTotal, setIncomeTotal] = useState(0);
  const [monthlyTrend, setMonthlyTrend] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const filters = useMemo(() => rangeToFilters(rangeKey, custom), [rangeKey, custom]);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryData, incomeData, monthly] = await Promise.all([
        api.getSummary(filters),
        api.getIncomeSummary(filters),
        api.getMonthlyData()
      ]);
      setSummary(summaryData);
      setIncomeTotal(incomeData.total);
      setMonthlyTrend(monthly.slice(-6));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  const categoryColor = (name) => expenseCategories.find((category) => category.name === name)?.color || "#6B7280";
  const topCategories = summary ? [...summary.categoryTotals].filter((c) => c.total > 0).sort((a, b) => b.total - a.total).slice(0, 5) : [];
  const incomeVsExpense = [
    { name: "Income", value: incomeTotal },
    { name: "Expenses", value: summary?.totalExpenses || 0 }
  ];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Analytics</h2>
          <p className="muted-copy">A closer look at where your money goes.</p>
        </div>
      </div>

      <div className="range-selector">
        {ranges.map((range) => (
          <button key={range.key} type="button" className={`range-chip ${rangeKey === range.key ? "active" : ""}`} onClick={() => setRangeKey(range.key)}>
            {range.label}
          </button>
        ))}
        {rangeKey === "custom" ? (
          <div className="custom-range">
            <input type="date" value={custom.startDate} onChange={(event) => setCustom((c) => ({ ...c, startDate: event.target.value }))} />
            <input type="date" value={custom.endDate} onChange={(event) => setCustom((c) => ({ ...c, endDate: event.target.value }))} />
          </div>
        ) : null}
      </div>

      <div className="grid-2">
        <Card>
          <div className="card-header">
            <h3>Income vs Expense</h3>
          </div>
          {isLoading ? (
            <Skeleton height={220} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={incomeVsExpense}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis stroke="var(--text-secondary)" fontSize={12} width={50} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  <Cell fill="#2E806D" />
                  <Cell fill="#C65D5D" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="card-header">
            <h3>Category distribution</h3>
          </div>
          {isLoading ? (
            <Skeleton height={220} />
          ) : topCategories.length ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={topCategories} dataKey="total" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={3}>
                  {topCategories.map((entry) => (
                    <Cell key={entry.category} fill={categoryColor(entry.category)} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(value) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState icon="barChart" title="Nothing to show" description="Add expenses in this range to see the breakdown." />
          )}
        </Card>
      </div>

      <Card>
        <div className="card-header">
          <h3>Monthly comparison</h3>
        </div>
        {isLoading ? (
          <Skeleton height={220} />
        ) : monthlyTrend.length ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--text-secondary)" fontSize={12} />
              <YAxis stroke="var(--text-secondary)" fontSize={12} width={50} />
              <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 10 }} formatter={(value) => formatCurrency(value)} />
              <Line type="monotone" dataKey="total" stroke="var(--primary)" strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState icon="barChart" title="No history yet" description="Monthly comparisons will appear once you've logged expenses across a few months." />
        )}
      </Card>

      <div className="grid-2">
        <Card>
          <div className="card-header">
            <h3>Top spending categories</h3>
          </div>
          {isLoading ? (
            <Skeleton height={140} />
          ) : topCategories.length ? (
            <div className="mini-list">
              {topCategories.map((category) => (
                <div className="mini-list-row" key={category.category}>
                  <div className="category-legend">
                    <span className="legend-dot" style={{ background: categoryColor(category.category) }} />
                    {category.category}
                  </div>
                  <span>{formatCurrency(category.total)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState icon="tag" title="No categories yet" description="Categorized spending will show up here." />
          )}
        </Card>

        <Card>
          <div className="card-header">
            <h3>Insights & forecast</h3>
          </div>
          {isLoading ? (
            <Skeleton height={140} />
          ) : (
            <div className="insight-list">
              {summary?.forecast ? (
                <div className="insight-row">
                  <Badge tone="info">📈</Badge>
                  <span>
                    At this pace, you're projected to spend {formatCurrency(summary.forecast.projectedSpend)} this month
                    {summary.forecast.isOverBudget ? `, which is over budget by ${formatCurrency(summary.forecast.projectedOverage)}.` : "."}
                  </span>
                </div>
              ) : null}
              {summary?.smartInsights?.length ? (
                summary.smartInsights.map((insight, index) => (
                  <div className="insight-row" key={index}>
                    <Badge tone={insight.type.includes("warning") || insight.type.includes("exceeded") ? "warning" : "info"}>
                      {insight.type.includes("warning") || insight.type.includes("exceeded") ? "⚠" : "💡"}
                    </Badge>
                    <span>{insight.message}</span>
                  </div>
                ))
              ) : !summary?.forecast ? (
                <EmptyState icon="info" title="No insights yet" description="Insights appear once there's enough spending history to compare." />
              ) : null}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
