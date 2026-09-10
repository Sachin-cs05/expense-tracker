import { useEffect, useState } from "react";
import { Modal } from "../../ui/Modal.jsx";
import { api } from "../../lib/api.js";
import { useToast } from "../../context/ToastContext.jsx";

const iconChoices = ["🗂️", "🏠", "🎓", "💼", "🚗", "🏡", "🎯", "✈️", "🎉"];
const colorChoices = ["#4F46E5", "#F59E0B", "#EF4444", "#10B981", "#0EA5E9", "#EC4899", "#8B5CF6"];

export function SpaceFormModal({ isOpen, onClose, onSaved, space = null }) {
  const { showToast } = useToast();
  const [form, setForm] = useState({ name: "", icon: iconChoices[0], color: colorChoices[0], description: "" });
  const [errorMessage, setErrorMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setErrorMessage("");
    setForm(space ? { name: space.name, icon: space.icon, color: space.color, description: space.description || "" } : { name: "", icon: iconChoices[0], color: colorChoices[0], description: "" });
  }, [isOpen, space]);

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const saved = space ? await api.updateSpace(space.id, form) : await api.createSpace(form);
      showToast(space ? "Space updated." : "Space created.");
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
      title={space ? "Edit space" : "New space"}
      subtitle="Group transactions under a personal context."
      footer={
        <>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="space-form" className="btn btn-primary" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save space"}
          </button>
        </>
      }
    >
      <form id="space-form" className="stack-form" onSubmit={handleSubmit}>
        {errorMessage ? <p className="form-error">{errorMessage}</p> : null}
        <label>
          Name
          <input value={form.name} onChange={(event) => setForm((c) => ({ ...c, name: event.target.value }))} placeholder="e.g. College" required />
        </label>
        <label>
          Description
          <input value={form.description} onChange={(event) => setForm((c) => ({ ...c, description: event.target.value }))} placeholder="Optional" />
        </label>
        <div>
          <p className="field-label">Icon</p>
          <div className="swatch-row">
            {iconChoices.map((icon) => (
              <button type="button" key={icon} className={`swatch-btn ${form.icon === icon ? "active" : ""}`} onClick={() => setForm((c) => ({ ...c, icon }))}>
                {icon}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="field-label">Color</p>
          <div className="swatch-row">
            {colorChoices.map((color) => (
              <button type="button" key={color} className={`color-swatch ${form.color === color ? "active" : ""}`} style={{ background: color }} onClick={() => setForm((c) => ({ ...c, color }))} aria-label={color} />
            ))}
          </div>
        </div>
      </form>
    </Modal>
  );
}
