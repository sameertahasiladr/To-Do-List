import { FormEvent, useEffect, useState } from "react";
import { api } from "../api";
import { useToast } from "../toast";
import Segmented from "./Segmented";
import { Priority, Status } from "../types";

interface Props {
  onClose: () => void;
  onCreated: () => void;
}
export default function AddTaskDialog({ onClose, onCreated }: Props) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("INCOMPLETE");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !busy && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, busy]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Task name is required");
    setError("");
    setBusy(true);
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), status, priority, dueDate: dueDate || null }),
      });
      toast.success("Task added");
      onCreated();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };
  return (
    <div className="modal-backdrop" onClick={() => !busy && onClose()}>
      <form
        className="modal modal-form"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-task-title"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        noValidate
      >
        <div className="modal-head">
          <h2 id="add-task-title">Add task</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>
          {error && <div className="alert" role="alert">{error}</div>}
        <label className="modal-field">Task name
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="e.g. Finish assessment" autoFocus />
        </label>
        <div className="row">
          <Segmented<Priority>
            legend="Priority"
            name="priority"
            value={priority}
            onChange={setPriority}
            options={[{ value: "LOW", label: "Low" }, { value: "MEDIUM", label: "Medium" }, { value: "HIGH", label: "High" }]}
          />
          <Segmented<Status>
            legend="Status"
            name="status"
            value={status}
            onChange={setStatus}
            options={[{ value: "INCOMPLETE", label: "Incomplete" }, { value: "COMPLETE", label: "Complete" }]}
          />
        </div>
        <label className="modal-field">Due date (optional)
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose} disabled={busy}>Cancel</button>
          <button className="btn btn-primary" disabled={busy}>{busy ? "Adding…" : "Add task"}</button>
        </div>
      </form>
    </div>
  );
}