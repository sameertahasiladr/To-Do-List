import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../auth";
import AddTaskDialog from "../components/AddTaskDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import StatsBar from "../components/StatsBar";
import TaskItem from "../components/TaskItem";
import { todayLocal } from "../dates";
import { useToast } from "../toast";
import { Priority, Stats, Status, Task, TaskChanges, TaskPage } from "../types";


const DEFAULTS: Record<string, string> = { sort: "createdAt", page: "1" };

const ORDER: Record<string, "asc" | "desc"> = { createdAt: "desc", name: "asc", status: "asc", dueDate: "asc" };

export default function Home() {
  const { user } = useAuth();
  const toast = useToast();
  const isAdmin = user?.role === "ADMIN";

  const [data, setData] = useState<TaskPage | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<Task | null>(null);


  const [params, setParams] = useSearchParams();
  const status = (params.get("status") ?? "") as "" | Status;
  const priority = (params.get("priority") ?? "") as "" | Priority;
  const due = params.get("due") ?? "";
  const sort = params.get("sort") ?? DEFAULTS.sort;
  const page = Math.max(1, Number(params.get("page")) || 1);
  const search = params.get("search") ?? "";
  const adding = params.get("add") === "1";

  const [searchInput, setSearchInput] = useState(search);

  const updateParams = useCallback(
    (changes: Record<string, string>, opts: { resetPage?: boolean; replace?: boolean } = {}) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([key, value]) => {
        if (!value || value === DEFAULTS[key]) next.delete(key);
        else next.set(key, value);
      });
      if (opts.resetPage ?? true) next.delete("page");
      setParams(next, { replace: opts.replace });
    },
    [params, setParams]
  );

  
  useEffect(() => {
    if (searchInput === search) return;
    const t = setTimeout(() => updateParams({ search: searchInput.trim() }, { replace: true }), 350);
    return () => clearTimeout(t);
  }, [searchInput, search, updateParams]);


  useEffect(() => { setSearchInput(search); }, [search]);

  const load = useCallback(async () => {
    const query = new URLSearchParams({ page: String(page), limit: "8", sort, order: ORDER[sort] ?? "desc", today: todayLocal() });
    if (status) query.set("status", status);
    if (priority) query.set("priority", priority);
    if (due) query.set("due", due);
    if (search) query.set("search", search);
    try {
      setData(await api<TaskPage>(`/tasks?${query}`));
      setError("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [page, sort, status, priority, due, search]);

  const loadStats = useCallback(async () => {
    try {
      setStats(await api<Stats>(`/tasks/stats?today=${todayLocal()}`));
    } catch {
   
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { loadStats(); }, [loadStats]);

  const refresh = () => Promise.all([load(), loadStats()]);


  const update = async (task: Task, changes: TaskChanges, message: string) => {
    const previous = data;
    setData((d) => d && { ...d, items: d.items.map((t) => (t.id === task.id ? ({ ...t, ...changes } as Task) : t)) });
    if (changes.status && changes.status !== task.status) {
      const delta = changes.status === "COMPLETE" ? 1 : -1;
      setStats((s) => s && { ...s, complete: s.complete + delta, incomplete: s.incomplete - delta });
    }
    try {
      await api(`/tasks/${task.id}`, { method: "PATCH", body: JSON.stringify(changes) });
      toast.success(message);
      
      if (status && changes.status) await load();
    } catch (err) {
      setData(previous);
      loadStats();
      toast.error((err as Error).message);
    }
  };

  const remove = async (task: Task) => {
    setToDelete(null);
    const previous = data;
    setData((d) => d && { ...d, items: d.items.filter((t) => t.id !== task.id), total: d.total - 1 });
    setStats((s) => s && {
      ...s,
      total: s.total - 1,
      complete: s.complete - (task.status === "COMPLETE" ? 1 : 0),
      incomplete: s.incomplete - (task.status === "COMPLETE" ? 0 : 1),
    });
    try {
      await api(`/tasks/${task.id}`, { method: "DELETE" });
      toast.success("Task deleted");
   
      if (data && data.items.length === 1 && page > 1) updateParams({ page: String(page - 1) }, { resetPage: false });
      else load();
    } catch (err) {
      setData(previous);
      loadStats();
      toast.error((err as Error).message);
    }
  };

  const openAdd = () => updateParams({ add: "1" }, { resetPage: false });
  const closeAdd = () => updateParams({ add: "" }, { resetPage: false, replace: true });

  const hasFilters = !!(status || priority || due || search || sort !== DEFAULTS.sort);
  const clearFilters = () => {
    setSearchInput("");
    updateParams({ status: "", priority: "", due: "", search: "", sort: "" });
  };

  return (
    <>
      <div className="page-head">
        <h1>{isAdmin ? "All tasks" : "My tasks"}</h1>
        {!isAdmin && <button className="btn btn-primary" onClick={openAdd}>Add task</button>}
      </div>

      <StatsBar stats={stats} />

      <div className="toolbar" role="search">
        <div className="search grow">
          <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            placeholder="Search tasks"
            aria-label="Search tasks"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
        <select aria-label="Filter by status" value={status} onChange={(e) => updateParams({ status: e.target.value })}>
          <option value="">All statuses</option>
          <option value="INCOMPLETE">Incomplete</option>
          <option value="COMPLETE">Complete</option>
        </select>
        <select aria-label="Filter by priority" value={priority} onChange={(e) => updateParams({ priority: e.target.value })}>
          <option value="">All priorities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>
        <select aria-label="Filter by due date" value={due} onChange={(e) => updateParams({ due: e.target.value })}>
          <option value="">Any due date</option>
          <option value="overdue">Overdue</option>
          <option value="today">Due today</option>
          <option value="week">Next 7 days</option>
        </select>
        <select aria-label="Sort tasks" value={sort} onChange={(e) => updateParams({ sort: e.target.value })}>
          <option value="createdAt">Sort: Newest</option>
          <option value="name">Sort: Name</option>
          <option value="status">Sort: Status</option>
          <option value="dueDate">Sort: Due date</option>
        </select>
        {hasFilters && <button className="btn btn-ghost btn-sm" onClick={clearFilters}>Clear filters</button>}
      </div>

      {error && <div className="alert" role="alert">{error}</div>}

      {loading && !data && (
        <ul className="task-list" aria-busy="true" aria-label="Loading tasks">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="task skeleton"><span className="sk sk-check" /><span className="sk sk-line" /></li>
          ))}
        </ul>
      )}

      {data && data.items.length === 0 && !loading && (
        <div className="empty">
          {hasFilters ? (
            <>
              <h2>No tasks match these filters</h2>
              <p className="muted">Try a different search, or clear the filters to see everything.</p>
              <button className="btn btn-ghost" onClick={clearFilters}>Clear filters</button>
            </>
          ) : isAdmin ? (
            <>
              <h2>No tasks yet</h2>
              <p className="muted">Tasks created by users will appear here.</p>
            </>
          ) : (
            <>
              <h2>Nothing on your list</h2>
              <p className="muted">Add your first task to start tracking progress.</p>
              <button className="btn btn-primary" onClick={openAdd}>Add task</button>
            </>
          )}
        </div>
      )}

      {data && data.items.length > 0 && (
        <ul className="task-list">
          {data.items.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              canModify={!isAdmin && task.userId === user?.id}
              showOwner={isAdmin}
              onUpdate={(changes, message) => update(task, changes, message)}
              onDelete={() => setToDelete(task)}
            />
          ))}
        </ul>
      )}

      {adding && !isAdmin && (
        <AddTaskDialog
          onClose={closeAdd}
          onCreated={() => {
            closeAdd();
            refresh();
          }}
        />
      )}

      <ConfirmDialog
        open={!!toDelete}
        title="Delete task?"
        message={`"${toDelete?.name ?? ""}" will be permanently deleted. This cannot be undone.`}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />

      {data && data.pages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => updateParams({ page: String(page - 1) }, { resetPage: false })}>Previous</button>
          <span className="muted small">Page {data.page} of {data.pages}, {data.total} tasks</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= data.pages} onClick={() => updateParams({ page: String(page + 1) }, { resetPage: false })}>Next</button>
        </nav>
      )}
    </>
  );
}