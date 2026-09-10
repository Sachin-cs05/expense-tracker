import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";
import { useAppData } from "../../context/AppDataContext.jsx";

const paymentMethods = ["Bank Transfer", "Cash", "UPI", "Cheque", "Other"];

function emptyForm(categories) {
  return {
    amount: "",
    source: "",
    category: categories[0]?.name || "",
    date: format(new Date(), "yyyy-MM-dd"),
    paymentMethod: "Bank Transfer",
    notes: "",
    spaceId: ""
  };
}

export function IncomeFormModal({ isOpen, onClose, onSaved, income = null }) {
  const { incomeCategories, spaces } = useAppData();
  const { showToast } = useToast();
  const [form, setForm] = useState(() => emptyForm(incomeCategories));
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    if (income) {
      setForm({
        amount: String(income.amount),
        source: income.source,
        category: income.category,
        date: income.date,
        paymentMethod: income.paymentMethod || "Bank Transfer",
        notes: income.notes || "",
        spaceId: income.spaceId || ""
      });
    } else {
      setForm(emptyForm(incomeCategories));
    }
  }, [isOpen, income, incomeCategories]);

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
      const saved = income ? await api.updateIncome(income.id, payload) : await api.createIncome(payload);
      showToast(income ? "Income updated." : "Income added.");
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
      title={income ? "Edit income" : "Add income"}
      subtitle="Record money coming in."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="income-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : income ? "Save changes" : "Add income"}
          </button>
        </>
      }
    >
      <form id="income-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Amount
          <input name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={updateField} required />
        </label>
        <label>
          Source
          <input name="source" value={form.source} onChange={updateField} placeholder="e.g. Acme Corp salary" required />
        </label>
        <div className="form-row">
          <label>
            Category
            <select name="category" value={form.category} onChange={updateField} required>
              {incomeCategories.map((category) => (
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
