import { useEffect } from "react";

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title, message, confirmLabel = "Delete", onConfirm, onCancel }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
        <div className="modal-icon">!</div>
        <h2 id="modal-title">{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel} autoFocus>Cancel</button>
          <button className="btn btn-danger-solid" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
