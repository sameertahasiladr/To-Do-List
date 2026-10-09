import { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import { useToast } from "../toast";
import Segmented from "../components/Segmented";
import { Priority, Status } from "../types";

export default function AddTask() {
  const navigate = useNavigate();
  const toast = useToast();
  const [name, setName] = useState("");
  const [status, setStatus] = useState<Status>("INCOMPLETE");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Task name is required");
    setError("");
    setBusy(true);
    try {
      await api("/tasks", {
        method: "POST",
        body: JSON.stringify({ name, status, priority, dueDate: dueDate || null }),
      });
      toast.success("Task added");
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Add task</h1>
          <p className="muted page-sub">Give it a name, set how urgent it is, and add a due date if it has one.</p>
        </div>
      </div>
      <form className="panel form" onSubmit={submit} noValidate>
        {error && <div className="alert" role="alert">{error}</div>}
        <label>Task name
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
        <label>Due date (optional)
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </label>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>{busy ? "Adding…" : "Add task"}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate("/")}>Cancel</button>
        </div>
      </form>
    </>
  );
}
