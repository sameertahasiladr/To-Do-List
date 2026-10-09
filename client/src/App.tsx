import { Navigate, Route, Routes } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "./auth";
import { Role } from "./types";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Users from "./pages/Users";
import AddTask from "./pages/AddTask";

function Protected({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  if (loading) return <p className="center muted">Loading…</p>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
export default function App() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Home /></Protected>} />
          <Route path="/add" element={<Protected role="USER"><AddTask /></Protected>} />
          <Route path="/users" element={<Protected role="ADMIN"><Users /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}