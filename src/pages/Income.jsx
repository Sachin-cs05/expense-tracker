import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { Card, ConfirmDialog, EmptyState, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { IncomeFormModal } from "../components/forms/IncomeFormModal.jsx";
import { VoiceExpenseModal } from "../components/voice/VoiceExpenseModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Income() {
  const { showToast } = useToast();
  const [incomes, setIncomes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingIncome, setEditingIncome] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setIncomes(await api.getIncomes());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const total = incomes.reduce((sum, income) => sum + income.amount, 0);
  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const thisMonthTotal = incomes.filter((income) => income.date.startsWith(thisMonthKey)).reduce((sum, income) => sum + income.amount, 0);
  const sourceCount = new Set(incomes.map((income) => income.source.toLowerCase())).size;

  async function handleDelete(id) {
    try {
      await api.deleteIncome(id);
      showToast("Income deleted.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Income</h2>
          <p className="muted-copy">Every source of money coming in.</p>
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
              setEditingIncome(null);
              setIsFormOpen(true);
            }}
          >
            <Icon name="plus" size={16} />
            Add Income
          </button>
        </div>
      </div>

      <div className="summary-grid summary-grid-3">
        <Card className="summary-card">
          <p className="summary-card-label">Total Income</p>
          <p className="summary-card-value">{formatCurrency(total)}</p>
        </Card>
        <Card className="summary-card">
          <p className="summary-card-label">This Month</p>
          <p className="summary-card-value">{formatCurrency(thisMonthTotal)}</p>
        </Card>
        <Card className="summary-card">
          <p className="summary-card-label">Income Sources</p>
          <p className="summary-card-value">{sourceCount}</p>
        </Card>
      </div>

      <Card>
        {isLoading ? (
          <SkeletonRows rows={6} />
        ) : incomes.length ? (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source</th>
                  <th>Category</th>
                  <th>Payment</th>
                  <th>Amount</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {incomes.map((income) => (
                  <tr key={income.id}>
                    <td data-label="Date">{income.date}</td>
                    <td data-label="Source">{income.source}</td>
                    <td data-label="Category">
                      <span className="category-pill">{income.category}</span>
                    </td>
                    <td data-label="Payment">{income.paymentMethod}</td>
                    <td data-label="Amount" className="amount-positive">
                      +{formatCurrency(income.amount)}
                    </td>
                    <td data-label="Actions" className="cell-actions">
                      <div className="row-actions">
                        <button
                          type="button"
                          className="icon-button"
                          onClick={() => {
                            setEditingIncome(income);
                            setIsFormOpen(true);
                          }}
                          aria-label="Edit income"
                        >
                          <Icon name="edit" size={15} />
                        </button>
                        <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(income.id)} aria-label="Delete income">
                          <Icon name="trash" size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon="trendingUp"
            title="No income logged yet"
            description="Add your salary, freelance payments, or any other income source."
            actionLabel="Add Income"
            onAction={() => {
              setEditingIncome(null);
              setIsFormOpen(true);
            }}
          />
        )}
      </Card>

      <VoiceExpenseModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onSaved={load}
      />
      <IncomeFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={load} income={editingIncome} />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete income entry?"
        description="This action can't be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
