import { useEffect, useState } from "react";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const iconChoices = ["🏷️", "🍔", "🚗", "🛍️", "💡", "🎬", "💼", "🧑‍💻", "📈", "🎁", "🏠", "🐾", "💊", "🎓", "✈️"];
const colorChoices = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981", "#0EA5E9", "#EC4899", "#8B5CF6", "#6B7280"];

export function CategoryFormModal({ isOpen, onClose, onSaved, defaultType = "expense" }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", icon: iconChoices[0], color: colorChoices[0], type: defaultType });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setForm({ name: "", icon: iconChoices[0], color: colorChoices[0], type: defaultType });
      setErrorMessage("");
    }
  }, [isOpen, defaultType]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const saved = await api.createCategory(form);
      showToast("Category created.");
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
      title="New category"
      subtitle="Create a custom category for expenses or income."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="category-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Create category"}
          </button>
        </>
      }
    >
      <form id="category-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))} placeholder="e.g. Pet Care" required />
        </label>
        <label>
          Type
          <select value={form.type} onChange={(event) => setForm((c) => ({ ...c, type: event.target.value }))}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>
        <div>
          <p className="field-label">Icon</p>
          <div className="swatch-row">
            {iconChoices.map((icon) => (
              <button
                type="button"
                key={icon}
                className={`swatch-btn ${form.icon === icon ? "active" : ""}`}
                onClick={() => setForm((c) => ({ ...c, icon }))}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">Color</p>
          <div className="swatch-row">
            {colorChoices.map((color) => (
              <button
                type="button"
                key={color}
                className={`color-swatch ${form.color === color ? "active" : ""}`}
                style={{ background: color }}
                onClick={() => setForm((c) => ({ ...c, color }))}
                aria-label={color}
              />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
