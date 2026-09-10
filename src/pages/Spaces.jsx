import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAppData } from "../context/AppDataContext.jsx";
import { useToast } from "../context/ToastContext.jsx";
import { Card, ConfirmDialog, EmptyState, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { SpaceFormModal } from "../components/forms/SpaceFormModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Spaces() {
  const { refreshSpaces } = useAppData();
  const { showToast } = useToast();
  const [spaces, setSpaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSpace, setEditingSpace] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [expandedSpaceId, setExpandedSpaceId] = useState(null);
  const [spaceTransactions, setSpaceTransactions] = useState([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setSpaces(await api.getSpaces());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleExpand(space) {
    if (expandedSpaceId === space.id) {
      setExpandedSpaceId(null);
      return;
    }
    setExpandedSpaceId(space.id);
    setIsLoadingTransactions(true);
    try {
      const [expenses, incomes] = await Promise.all([
        api.getExpenses({ spaceId: space.id }),
        api.getIncomes({ spaceId: space.id })
      ]);
      const combined = [
        ...expenses.map((expense) => ({ ...expense, kind: "expense", label: expense.description })),
        ...incomes.map((income) => ({ ...income, kind: "income", label: income.source }))
      ].sort((a, b) => b.date.localeCompare(a.date));
      setSpaceTransactions(combined.slice(0, 8));
    } finally {
      setIsLoadingTransactions(false);
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteSpace(id);
      showToast("Space deleted. Its transactions are now unassigned.");
      load();
      refreshSpaces();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Spaces</h2>
          <p className="muted-copy">Organize your finances into separate personal contexts.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingSpace(null);
            setIsFormOpen(true);
          }}
        >
          <Icon name="plus" size={16} />
          Create Space
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : spaces.length ? (
        <div className="space-grid">
          {spaces.map((space) => (
            <Card className="space-card" key={space.id}>
              <div className="space-card-head">
                <span className="category-icon-badge" style={{ background: `${space.color}22`, color: space.color }}>
                  {space.icon}
                </span>
                <div className="row-actions">
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setEditingSpace(space);
                      setIsFormOpen(true);
                    }}
                    aria-label="Edit space"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(space.id)} aria-label="Delete space">
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
              <h3>{space.name}</h3>
              {space.description ? <p className="muted-copy">{space.description}</p> : null}
              <div className="space-stats">
                <div>
                  <p className="muted-copy">Spending</p>
                  <p className="amount-negative">{formatCurrency(space.totals.totalSpending)}</p>
                </div>
                <div>
                  <p className="muted-copy">Income</p>
                  <p className="amount-positive">{formatCurrency(space.totals.totalIncome)}</p>
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-block" onClick={() => toggleExpand(space)}>
                {expandedSpaceId === space.id ? "Hide transactions" : `View ${space.totals.transactionCount} transactions`}
              </button>

              {expandedSpaceId === space.id ? (
                <div className="space-transaction-list">
                  {isLoadingTransactions ? (
                    <SkeletonRows rows={2} />
                  ) : spaceTransactions.length ? (
                    spaceTransactions.map((item) => (
                      <div className="mini-list-row" key={`${item.kind}-${item.id}`}>
                        <div>
                          <p className="mini-list-title">{item.label}</p>
                          <p className="muted-copy">{item.date}</p>
                        </div>
                        <span className={item.kind === "expense" ? "amount-negative" : "amount-positive"}>
                          {item.kind === "expense" ? "-" : "+"}
                          {formatCurrency(item.amount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="muted-copy">No transactions assigned yet.</p>
                  )}
                </div>
              ) : null}
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="grid"
            title="No spaces yet"
            description="Create a space like Personal, College, or Freelance to organize your finances by context."
            actionLabel="Create Space"
            onAction={() => {
              setEditingSpace(null);
              setIsFormOpen(true);
            }}
          />
        </Card>
      )}

      <SpaceFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSaved={() => {
          load();
          refreshSpaces();
        }}
        space={editingSpace}
      />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete space?"
        description="Transactions assigned to this space will become unassigned rather than deleted."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
