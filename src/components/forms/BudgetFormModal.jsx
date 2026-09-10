import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

export function BudgetFormModal({ isOpen, onClose, onSaved, defaultMonth }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ month: defaultMonth || format(new Date(), "yyyy-MM"), amount: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ month: defaultMonth || format(new Date(), "yyyy-MM"), amount: "" });
      setErrorMessage("");
    }
  }, [isOpen, defaultMonth]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const saved = await api.saveBudget(form);
      showToast("Budget saved.");
      onSaved?.(saved);
      onClose();
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set a budget"
      subtitle="One budget per month — saving again updates it."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="budget-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save budget"}
          </button>
        </>
      }
    >
      <form id="budget-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Month
          <input name="month" type="month" value={form.month} onChange={updateField} required />
        </label>
        <label>
          Budget amount
          <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={updateField} required />
        </label>
      </form>
    </Modal>
  );
}
