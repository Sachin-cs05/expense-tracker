import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const frequencies = ["weekly", "monthly", "yearly"];

function emptyForm(categories) {
  return {
    name: "",
    amount: "",
    category: categories[0]?.name || "",
    frequency: "monthly",
    nextPaymentDate: format(new Date(), "yyyy-MM-dd"),
    active: true,
    notes: ""
  };
}

export function RecurringFormModal({ isOpen, onClose, onSaved, payment = null }) {
  const { expenseCategories } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => emptyForm(expenseCategories));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setForm(payment ? { ...payment } : emptyForm(expenseCategories));
  }, [isOpen, payment, expenseCategories]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const saved = payment
        ? await api.updateRecurringPayment(payment.id, form)
        : await api.createRecurringPayment(form);
      showToast(payment ? "Recurring payment updated." : "Recurring payment added.");
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
      title={payment ? "Edit recurring payment" : "Add recurring payment"}
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="recurring-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </>
      }
    >
      <form id="recurring-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Name
          <input name="name" value={form.name} onChange={updateField} placeholder="e.g. Netflix" required />
        </label>
        <div className="form-row">
          <label>
            Amount
            <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={updateField} required />
          </label>
          <label>
            Frequency
            <select name="frequency" value={form.frequency} onChange={updateField}>
              {frequencies.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={updateField} required>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Next payment
            <input name="nextPaymentDate" type="date" value={form.nextPaymentDate} onChange={updateField} required />
          </label>
        </div>
        <label>
          Notes
          <textarea name="notes" value={form.notes} onChange={updateField} rows={2} placeholder="Optional" />
        </label>
      </form>
    </Modal>
  );
}
