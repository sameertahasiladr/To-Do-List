import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { initials } from "../initials";

export function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg className="brand-mark" width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M9 16.5l4.5 4.5L23 11.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <BrandMark />
          To-DO-List
        </NavLink>
        <nav className="nav-links" aria-label="Main">
          <NavLink to="/" end>Tasks</NavLink>
          {user.role === "USER" && <NavLink to="/add">Add task</NavLink>}
          {user.role === "ADMIN" && <NavLink to="/users">Users</NavLink>}
        </nav>
        <div className="nav-user">
          <span className="avatar" aria-hidden="true">{initials(user.name)}</span>
          <span className="who">
            <span className="who-name">{user.name}</span>
            <span className="who-role">{user.role === "ADMIN" ? "Admin" : "User"}</span>
          </span>
          <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate("/login"); }}>Log out</button>
        </div>
      </div>
    </header>
  );
}