import { Icon } from "./Icon.jsx";
import { Modal } from "./Modal.jsx";

export function Card({ children, className = "", ...rest }) {
  return (
    <div className={`card ${className}`} {...rest}>
      {children}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function ProgressBar({ value, tone = "primary" }) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={Math.round(clamped)} aria-valuemin={0} aria-valuemax={100}>
      <div className={`progress-fill progress-${tone}`} style={{ width: `${clamped}%` }} />
    </div>
  );
}

export function EmptyState({ icon = "info", title, description, actionLabel, onAction }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <Icon name={icon} size={26} />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && onAction ? (
        <button type="button" className="btn btn-primary" onClick={onAction}>
          <Icon name="plus" size={16} />
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}

export function Skeleton({ height = 16, width = "100%", radius = 8 }) {
  return <span className="skeleton" style={{ height, width, borderRadius: radius }} />;
}

export function SkeletonRows({ rows = 4 }) {
  return (
    <div className="skeleton-stack">
      {Array.from({ length: rows }).map((_, index) => (
        <Skeleton key={index} height={48} radius={12} />
      ))}
    </div>
  );
}

export function ConfirmDialog({ isOpen, title, description, confirmLabel = "Delete", onConfirm, onClose, danger = true }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="380px">
      <p className="muted-copy">{description}</p>
      <div className="confirm-actions">
        <button type="button" className="btn btn-ghost" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className={`btn ${danger ? "btn-danger" : "btn-primary"}`}
          onClick={() => {
            onConfirm();
            onClose();
          }}
        >
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
