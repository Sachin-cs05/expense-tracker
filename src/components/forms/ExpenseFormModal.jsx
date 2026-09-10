import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const paymentMethods = ["Cash", "Card", "UPI", "Bank Transfer", "Other"];

function emptyForm(categories) {
  return {
    amount: "",
    category: categories[0]?.name || "",
    date: format(new Date(), "yyyy-MM-dd"),
    description: "",
    paymentMethod: "Cash",
    notes: "",
    spaceId: ""
  };
}

export function ExpenseFormModal({ isOpen, onClose, onSaved, expense = null }) {
  const { expenseCategories, spaces } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => emptyForm(expenseCategories));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setSuggestion("");
    if (expense) {
      setForm({
        amount: String(expense.amount),
        category: expense.category,
        date: expense.date,
        description: expense.description,
        paymentMethod: expense.paymentMethod || "Cash",
        notes: expense.notes || "",
        spaceId: expense.spaceId || ""
      });
    } else {
      setForm(emptyForm(expenseCategories));
    }
  }, [isOpen, expense, expenseCategories]);

  useEffect(() => {
    if (!isOpen || expense || form.description.trim().length < 2) {
      setSuggestion("");
      return undefined;
    }
    const timeoutId = setTimeout(async () => {
      try {
        const { category } = await api.suggestCategory(form.description);
        if (category) {
          setSuggestion(category);
          setForm((current) => ({ ...current, category }));
        }
      } catch {
        setSuggestion("");
      }
    }, 350);
    return () => clearTimeout(timeoutId);
  }, [form.description, isOpen, expense]);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const payload = { ...form, spaceId: form.spaceId || null };
      const saved = expense ? await api.updateExpense(expense.id, payload) : await api.createExpense(payload);
      showToast(expense ? "Expense updated." : "Expense added.");
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
      title={expense ? "Edit expense" : "Add expense"}
      subtitle="Log a purchase and keep your categories accurate."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="expense-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : expense ? "Save changes" : "Add expense"}
          </button>
        </>
      }
    >
      <form id="expense-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Amount
          <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={updateField} required />
        </label>
        <label>
          Description
          <input name="description" value={form.description} onChange={updateField} placeholder="e.g. Swiggy dinner" required />
          {suggestion ? <span className="field-hint">Suggested category: {suggestion}</span> : null}
        </label>
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
            Payment method
            <select name="paymentMethod" value={form.paymentMethod} onChange={updateField}>
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Date
            <input name="date" type="date" value={form.date} onChange={updateField} required />
          </label>
          <label>
            Space
            <select name="spaceId" value={form.spaceId} onChange={updateField}>
              <option value="">No space</option>
              {spaces.map((space) => (
                <option key={space.id} value={space.id}>
                  {space.icon} {space.name}
                </option>
              ))}
            </select>
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
