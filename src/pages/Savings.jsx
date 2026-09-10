import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { Card, ConfirmDialog, EmptyState, ProgressBar, SkeletonRows } from "../ui/Primitives.jsx";
import { Icon } from "../ui/Icon.jsx";
import { SavingsGoalFormModal } from "../components/forms/SavingsGoalFormModal.jsx";

function formatCurrency(value = 0) {
  return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

const goalEmojis = ["💻", "✈️", "🏠", "🚗", "🎓", "💍", "📱", "🎮", "🏝️"];

function emojiForGoal(name, index) {
  return goalEmojis[index % goalEmojis.length];
}

export default function Savings() {
  const { showToast } = useToast();
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState(null); // { mode, goal }
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    try {
      setGoals(await api.getSavingsGoals());
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id) {
    try {
      await api.deleteSavingsGoal(id);
      showToast("Savings goal deleted.");
      load();
    } catch (error) {
      showToast(error.message, "error");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Savings Goals</h2>
          <p className="muted-copy">Give your savings a destination.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalState({ mode: "create", goal: null })}>
          <Icon name="plus" size={16} />
          New Goal
        </button>
      </div>

      {isLoading ? (
        <SkeletonRows rows={3} />
      ) : goals.length ? (
        <div className="goal-grid">
          {goals.map((goal, index) => {
            const progress = Math.min(100, (goal.savedAmount / goal.targetAmount) * 100);
            return (
              <Card className="goal-card" key={goal.id}>
                <div className="goal-card-head">
                  <span className="goal-emoji">{emojiForGoal(goal.name, index)}</span>
                  <div className="row-actions">
                    <button type="button" className="icon-button" onClick={() => setModalState({ mode: "edit", goal })} aria-label="Edit goal">
                      <Icon name="edit" size={15} />
                    </button>
                    <button type="button" className="icon-button danger" onClick={() => setPendingDeleteId(goal.id)} aria-label="Delete goal">
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
                <h3>{goal.name}</h3>
                <p className="muted-copy">
                  {formatCurrency(goal.savedAmount)} / {formatCurrency(goal.targetAmount)}
                </p>
                <ProgressBar value={progress} tone={progress >= 100 ? "positive" : "primary"} />
                <div className="goal-card-footer">
                  <span className="muted-copy">{Math.round(progress)}%</span>
                  <span className="muted-copy">Target: {goal.targetDate}</span>
                </div>
                <button type="button" className="btn btn-secondary btn-block" onClick={() => setModalState({ mode: "addMoney", goal })}>
                  Add Money
                </button>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon="piggyBank"
            title="No savings goals yet"
            description="Create a goal to start putting money aside for something specific."
            actionLabel="New Goal"
            onAction={() => setModalState({ mode: "create", goal: null })}
          />
        </Card>
      )}

      <SavingsGoalFormModal
        isOpen={Boolean(modalState)}
        mode={modalState?.mode}
        goal={modalState?.goal}
        onClose={() => setModalState(null)}
        onSaved={load}
      />
      <ConfirmDialog
        isOpen={Boolean(pendingDeleteId)}
        title="Delete savings goal?"
        description="This action can't be undone."
        onConfirm={() => handleDelete(pendingDeleteId)}
        onClose={() => setPendingDeleteId(null)}
      />
    </div>
  );
}
