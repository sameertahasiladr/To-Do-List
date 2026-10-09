import { useState } from "react";
import { dateOnly, dueInfo } from "../dates";
import { Priority, Task, TaskChanges } from "../types";

interface Props {
  task: Task;
  canModify: boolean;
  showOwner: boolean;
  onUpdate: (changes: TaskChanges, message: string) => void;
  onDelete: () => void;
}

const PRIORITY_LABEL: Record<Priority, string> = { LOW: "Low", MEDIUM: "Medium", HIGH: "High" };

export default function TaskItem({ task, canModify, showOwner, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(task.name);
  const [priority, setPriority] = useState<Priority>(task.priority);
  const [dueDate, setDueDate] = useState(task.dueDate ? dateOnly(task.dueDate) : "");
  const done = task.status === "COMPLETE";
  const due = dueInfo(task.dueDate, done);
  const save = () => {
    if (!name.trim()) return;
    onUpdate({ name: name.trim(), priority, dueDate: dueDate || null }, "Task updated");
    setEditing(false);
  };
  const cancel = () => {
    setName(task.name);
    setPriority(task.priority);
    setDueDate(task.dueDate ? dateOnly(task.dueDate) : "");
    setEditing(false);
  };

  if (editing) {
    return (
      <li className={`task editing prio-${task.priority}`}>
        <div className="edit-grid">
          <input
            className="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            maxLength={200}
            aria-label="Task name"
            autoFocus
          />
          <select value={priority} onChange={(e) => setPriority(e.target.value as Priority)} aria-label="Priority">
            <option value="LOW">Low priority</option>
            <option value="MEDIUM">Medium priority</option>
            <option value="HIGH">High priority</option>
          </select>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} aria-label="Due date" />
        </div>
        <div className="actions">
          <button className="btn btn-primary btn-sm" onClick={save} disabled={!name.trim()}>Save changes</button>
          <button className="btn btn-ghost btn-sm" onClick={cancel}>Cancel</button>
        </div>
      </li>
    );
  }

  return (
    <li className={`task prio-${task.priority} ${done ? "done" : ""}`}>
      {canModify ? (
        <input
          type="checkbox"
          checked={done}
          aria-label={done ? `Mark "${task.name}" incomplete` : `Mark "${task.name}" complete`}
          onChange={() =>
            onUpdate({ status: done ? "INCOMPLETE" : "COMPLETE" }, done ? "Marked as incomplete" : "Marked as complete")
          }
        />
      ) : (
        <span className={`state-dot ${done ? "on" : ""}`} aria-hidden="true" />
      )}
      <div className="task-body">
        <span className="task-name">{task.name}</span>
        <div className="meta">
          <span className={`chip status-${task.status}`}>{done ? "Complete" : "Incomplete"}</span>
          <span className="prio-label"><i className="dot" />{PRIORITY_LABEL[task.priority]} priority</span>
          {due && <span className={`chip due-${due.tone}`}>{due.label}</span>}
          {showOwner && <span className="owner">{task.user.name}</span>}
        </div>
      </div>
      {canModify && (
        <div className="actions">
          <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>Edit</button>
          <button className="btn btn-danger btn-sm" onClick={onDelete}>Delete</button>
        </div>
      )}
    </li>
  );
}
