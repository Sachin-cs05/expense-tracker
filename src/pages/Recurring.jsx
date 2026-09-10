import { useCallback, useEffect, useState } from "react";
import { differenceInCalendarDays } from "date-fns";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { Badge, Card, ConfirmDialog, EmptyState, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { RecurringFormModal } from "../components/forms/RecurringFormModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

export default function Recurring() {
  const { showToast } = useToast();
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingPayment, setEditingPayment] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setPayments(await api.getRecurringPayments());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggle(id) {
    try {
      await api.toggleRecurringPayment(id);
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  async function handleDelete(id) {
    try {
      await api.deleteRecurringPayment(id);
      showToast("Recurring payment removed.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Recurring Payments</h2>
          <p className="muted-copy">Subscriptions and bills that repeat on schedule.</p>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            setEditingPayment(null);
            setIsFormOpen(true);
          }}
        >
          <Icon name="plus" size={16} />
          Add Recurring Payment
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows rows={4} />
      ) : payments.length ? (
        <div className="recurring-list">
          {payments.map((payment) => {
            const daysUntil = differenceInCalendarDays(new Date(payment.nextPaymentDate), new Date());
            return (
              <Card className="recurring-card" key={payment.id}>
                <div className="recurring-main">
                  <div>
                    <div className="recurring-title-row">
                      <h3>{payment.name}</h3>
                      <Badge tone={payment.active ? "positive" : "neutral"}>{payment.active ? "Active" : "Paused"}</Badge>
                    </div>
                    <p className="muted-copy">
                      {payment.category} • {payment.frequency}
                    </p>
                  </div>
                  <div className="recurring-amount">
                    <p className="summary-card-value">{formatCurrency(payment.amount)}</p>
                    <p className="muted-copy">
                      Next: {payment.nextPaymentDate} {daysUntil >= 0 ? `(${daysUntil}d)` : ""}
                    </p>
                  </div>
                </div>
                <div className="row-actions">
                  <button type="button" className="btn btn-ghost" onClick={() => handleToggle(payment.id)}>
                    {payment.active ? "Pause" : "Resume"}
                  </button>
                  <button
                    type="button"
                    className="icon-button"
                    onClick={() => {
                      setEditingPayment(payment);
                      setIsFormOpen(true);
                    }}
                    aria-label="Edit recurring payment"
                  >
                    <Icon name="edit" size={15} />
                  </button>
                  <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(payment.id)} aria-label="Delete recurring payment">
                    <Icon name="trash" size={15} />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="repeat"
            title="No recurring payments yet"
            description="Add subscriptions and bills so you never lose track of what repeats."
            actionLabel="Add Recurring Payment"
            onAction={() => {
              setEditingPayment(null);
              setIsFormOpen(true);
            }}
          />
        </Card>
      )}

      <RecurringFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSaved={load} payment={editingPayment} />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete recurring payment?"
        description="This action can't be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
