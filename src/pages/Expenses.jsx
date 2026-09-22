import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Card, ConfirmDialog, EmptyState, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { ExpenseFormModal } from "../components/forms/ExpenseFormModal.jsx";
import { VoiceExpenseModal } from "../components/voice/VoiceExpenseModal.jsx";

const PAGE_SIZE = 10;

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Expenses() {
  const { expenseCategories } = useAppData();
  const { showToast } = useToast();
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({ search: "", category: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);
  const [editingExpense, setEditingExpense] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      const query = {};
      if (filters.search) query.search = filters.search;
      if (filters.category) query.category = filters.category;
      if (filters.startDate) query.startDate = filters.startDate;
      if (filters.endDate) query.endDate = filters.endDate;
      setExpenses(await api.getExpenses(query));
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => setPage(1), [filters]);

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageTransaction = expenses.length ? totalSpent / expenses.length : 0;

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return expenses.slice(start, start + PAGE_SIZE);
  }, [expenses, page]);

  const totalPages = Math.max(1, Math.ceil(expenses.length / PAGE_SIZE));

  async function handleDelete(id) {
    try {
      await api.deleteExpense(id);
      showToast("Expense deleted.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Expenses</h2>
          <p className="muted-copy">Track and manage everything you spend.</p>
        </div>
        <div className="page-header-actions">
          <button
            type="button"
            className="btn btn-secondary voice-quick-btn"
            onClick={() => setIsVoiceOpen(true)}
            title="Add expense with voice"
          >
            <Icon name="mic" size={16} />
            <span className="voice-btn-label">Voice Entry</span>
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
          >
            <Icon name="plus" size={16} />
            Add Expense
          </button>
        </div>
      </div>

      <div className="summary-grid summary-grid-3">
        <Card className="summary-card">
          <p className="summary-card-label">Total Spent</p>
          <p className="summary-card-value">{formatCurrency(totalSpent)}</p>
        </Card>
        <Card className="summary-card">
          <p className="summary-card-label">Transactions</p>
          <p className="summary-card-value">{expenses.length}</p>
        </Card>
        <Card className="summary-card">
          <p className="summary-card-label">Average Transaction</p>
          <p className="summary-card-value">{formatCurrency(averageTransaction)}</p>
        </Card>
      </div>

      <Card>
        <div className="filter-bar">
          <div className="search-field">
            <Icon name="search" size={16} />
            <input
              placeholder="Search expenses"
              value={filters.search}
              onChange={(event) => setFilters((f) => ({ ...f, search: event.target.value }))}
            />
          </div>
          <select value={filters.category} onChange={(event) => setFilters((f) => ({ ...f, category: event.target.value }))}>
            <option value="">All categories</option>
            {expenseCategories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
          <input type="date" value={filters.startDate} onChange={(event) => setFilters((f) => ({ ...f, startDate: event.target.value }))} />
          <input type="date" value={filters.endDate} onChange={(event) => setFilters((f) => ({ ...f, endDate: event.target.value }))} />
        </div>

        {isLoading ? (
          <SkeletonRows rows={6} />
        ) : paginated.length ? (
          <>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th>Category</th>
                    <th>Payment</th>
                    <th>Amount</th>
                    <th aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((expense) => (
                    <tr key={expense.id}>
                      <td data-label="Date">{expense.date}</td>
                      <td data-label="Description">{expense.description}</td>
                      <td data-label="Category">
                        <span className="category-pill" data-category={expense.category}>{expense.category}</span>
                      </td>
                      <td data-label="Payment">{expense.paymentMethod}</td>
                      <td data-label="Amount" className="amount-negative">
                        -{formatCurrency(expense.amount)}
                      </td>
                      <td data-label="Actions" className="cell-actions">
                        <div className="row-actions">
                          <button
                            type="button"
                            className="icon-button"
                            onClick={() => {
                              setEditingExpense(expense);
                              setIsFormOpen(true);
                            }}
                            aria-label="Edit expense"
                          >
                            <Icon name="edit" size={15} />
                          </button>
                          <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(expense.id)} aria-label="Delete expense">
                            <Icon name="trash" size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 ? (
              <div className="pagination">
                <button type="button" className="btn btn-ghost" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
                  Previous
                </button>
                <span className="muted-copy">
                  Page {page} of {totalPages}
                </span>
                <button type="button" className="btn btn-ghost" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}>
                  Next
                </button>
              </div>
            ) : null}
          </>
        ) : (
          <EmptyState
            icon="wallet"
            title="No expenses yet"
            description="Start tracking your spending to understand where your money goes."
            actionLabel="Add Expense"
            onAction={() => {
              setEditingExpense(null);
              setIsFormOpen(true);
            }}
          />
        )}
      </Card>

      <VoiceExpenseModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSaved={load}
        onOpenEditForm={(exp) => {
          setEditingExpense(exp);
          setIsFormOpen(true);
        }}
      />
      <ExpenseFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={load} expense={editingExpense} />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete expense?"
        description="This action can't be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
