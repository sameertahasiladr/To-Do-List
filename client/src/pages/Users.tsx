import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth";
import ConfirmDialog from "../components/ConfirmDialog";
import { useToast } from "../toast";
import { initials } from "../initials";
import { Role, User } from "../types";

interface FormState {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}
const empty: FormState = { name: "", email: "", password: "", role: "USER" };
export default function Users() {
  const { user: me } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [toDelete, setToDelete] = useState<User | null>(null);
  const load = useCallback(async () => {
    try {
      setUsers(await api<User[]>("/users"));
    } catch (err) {
      setError((err as Error).message);
    }
  }, []);
  useEffect(() => { load(); }, [load]);
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form) return;
    setFormError("");
    const { id, password, ...rest } = form;
    const body = { ...rest, ...(password ? { password } : {}) };
    try {
      if (id) await api(`/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      else await api("/users", { method: "POST", body: JSON.stringify(body) });
      toast.success(id ? "User updated" : "User created");
      setForm(null);
      await load();
    } catch (err) {
      setFormError((err as Error).message);
    }
  };
  const remove = async (u: User) => {
    setToDelete(null);
    try {
      await api(`/users/${u.id}`, { method: "DELETE" });
      toast.success("User deleted");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  const changeRole = async (u: User, role: Role) => {
    try {
      await api(`/users/${u.id}`, { method: "PATCH", body: JSON.stringify({ role }) });
      toast.success("Role updated");
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  };
  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p className="muted page-sub">{users.length} {users.length === 1 ? "account" : "accounts"}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setFormError(""); setForm(empty); }}>Add user</button>
      </div>
      {error && <div className="alert" role="alert">{error}</div>}
      {form && (
        <form className="panel form" onSubmit={submit}>
          <h2 className="form-title">{form.id ? "Edit user" : "Add user"}</h2>
          {formError && <div className="alert" role="alert">{formError}</div>}
          <div className="row">
            <label>Name
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </label>
            <label>Email
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </label>
          </div>
          <div className="row">
            <label>{form.id ? "New password (optional)" : "Password"}
              <input type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!form.id} />
            </label>
            <label>Role
              <select value={form.role} disabled={form.id === me?.id} onChange={(e) => setForm({ ...form, role: e.target.value as Role })}>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
          </div>
          <div className="form-actions">
            <button className="btn btn-primary">{form.id ? "Save changes" : "Add user"}</button>
            <button type="button" className="btn btn-ghost" onClick={() => setForm(null)}>Cancel</button>
          </div>
        </form>
      )}
      <div className="panel table-wrap">
        <table>
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Email</th><th scope="col">Role</th><th scope="col"><span className="sr-only">Actions</span></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td data-label="Name">
                  <span className="person">
                    <span className="avatar" aria-hidden="true">{initials(u.name)}</span>
                    <span>{u.name}{u.id === me?.id && <span className="you">You</span>}</span>
                  </span>
                </td>
                <td data-label="Email" className="email">{u.email}</td>
                <td data-label="Role">
                  <select aria-label={`Role for ${u.name}`} value={u.role} disabled={u.id === me?.id} onChange={(e) => changeRole(u, e.target.value as Role)}>
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </td>
                <td className="actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => { setFormError(""); setForm({ id: u.id, name: u.name, email: u.email, password: "", role: u.role }); }}>Edit</button>
                  <button className="btn btn-danger btn-sm" disabled={u.id === me?.id} onClick={() => setToDelete(u)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ConfirmDialog
        open={!!toDelete}
        title="Delete user?"
        message={`${toDelete?.email ?? ""} and all of their tasks will be permanently deleted.`}
        onConfirm={() => toDelete && remove(toDelete)}
        onCancel={() => setToDelete(null)}
      />
    </>
  );
}
