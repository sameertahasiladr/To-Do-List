import { FormEvent, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { BrandMark } from "../components/Navbar";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <section className="login-art" aria-hidden="true">
        <div className="login-art-top">
          <BrandMark size={34} />
          <span>To-DO-List</span>
        </div>

        <div className="login-art-body">
          <p className="login-kicker">Today</p>
          <ul className="sample-list">
            <li className="sample done"><span className="sample-check" />Send the invoice</li>
            <li className="sample done"><span className="sample-check" />Book dentist appointment</li>
            <li className="sample"><span className="sample-check" />Review the pull request</li>
            <li className="sample"><span className="sample-check" />Plan next week</li>
          </ul>
        </div>

        <p className="login-art-foot">Small tasks, finished.</p>
      </section>

      <div className="login-pane">
        <form className="form login-form" onSubmit={submit}>
          <div>
            <h1>Welcome back</h1>
            <p className="muted">Sign in to see your tasks.</p>
          </div>
          {error && <div className="alert" role="alert">{error}</div>}
          <label>Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
              autoFocus
            />
          </label>
          <label>Password
            <div className="pw-field">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="button" className="pw-toggle" aria-pressed={showPassword} onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </label>
          <button className="btn btn-primary btn-lg" disabled={busy}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
          <p className="login-note">Accounts are created by an administrator.</p>
        </form>
      </div>
    </div>
  );
}