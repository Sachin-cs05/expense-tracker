import { useEffect, useState } from "react";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const emptyForm = { name: "", targetAmount: "", savedAmount: "0", targetDate: "" };

export function SavingsGoalFormModal({ isOpen, onClose, onSaved, goal = null, mode = "edit" }) {
  const { showToast } = useToast();
  const [form, setForm] = useState(emptyForm);
  const [addAmount, setAddAmount] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setAddAmount("");
    setForm(
      goal
        ? {
            name: goal.name,
            targetAmount: String(goal.targetAmount),
            savedAmount: String(goal.savedAmount),
            targetDate: goal.targetDate
          }
        : emptyForm
    );
  }, [isOpen, goal]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      let saved;
      if (mode === "addMoney") {
        const newSaved = Number(form.savedAmount) + Number(addAmount || 0);
        saved = await api.updateSavingsGoal(goal.id, { ...form, savedAmount: newSaved });
        showToast("Added to your savings goal.");
      } else if (goal) {
        saved = await api.updateSavingsGoal(goal.id, form);
        showToast("Goal updated.");
      } else {
        saved = await api.createSavingsGoal(form);
        showToast("Goal created.");
      }
      onSaved?.(saved);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  const title = mode === "addMoney" ? "Add money to goal" : goal ? "Edit savings goal" : "New savings goal";

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="goal-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : mode === "addMoney" ? "Add money" : "Save goal"}
          </button>
        </>
      }
    >
      <form id="goal-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        {mode === "addMoney" ? (
          <>
            <p className="muted-copy">
              Currently saved ₹{Number(form.savedAmount).toFixed(2)} of ₹{Number(form.targetAmount).toFixed(2)}
            </p>
            <label>
              Amount to add
              <input type="number" min="0" step="0.01" value={addAmount} onChange={(event) => setAddAmount(event.target.value)} required autoFocus />
            </label>
          </>
        ) : (
          <>
            <label>
              Goal name
              <input name="name" value={form.name} onChange={updateField} placeholder="e.g. New laptop" required />
            </label>
            <div className="form-row">
              <label>
                Target amount
                <input name="targetAmount" type="number" min="1" value={form.targetAmount} onChange={updateField} required />
              </label>
              <label>
                Already saved
                <input name="savedAmount" type="number" min="0" value={form.savedAmount} onChange={updateField} />
              </label>
            </div>
            <label>
              Target date
              <input name="targetDate" type="date" value={form.targetDate} onChange={updateField} required />
            </label>
          </>
        )}
      </form>
    </Modal>
  );
}
