import { useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { ThemeToggle } from "../components/ui";
import { api } from "../lib/api";

export function LoginPage({ locked, onSignedIn }: { locked: boolean; onSignedIn: () => Promise<void> }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.login(password);
      await onSignedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setBusy(false);
    }
  };

  return (
    <main className="center-screen login">
      <div className="login-theme">
        <ThemeToggle />
      </div>
      <form className="glass card narrow" onSubmit={submit} aria-describedby={error ? "login-error" : undefined}>
        <span className="brand-mark large" aria-hidden="true">
          <Icon name="cube" size={24} />
        </span>
        <h1>Image → 3D</h1>
        {locked ? (
          <p className="muted">
            This deployment is locked because <code>APP_PASSWORD</code> isn't set. Add it in the Vercel project settings and redeploy.
          </p>
        ) : (
          <>
            <p className="muted">Turn an image into a 3D illustration, then a three.js model. Private: enter the password to continue.</p>
            <div className="field">
              <label className="field-label" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={!!error}
              />
            </div>
            {error && (
              <p id="login-error" className="error-text" role="alert">
                {error}
              </p>
            )}
            <button className="btn primary block" type="submit" disabled={busy || !password}>
              <Icon name="lock" size={16} /> {busy ? "Checking…" : "Unlock"}
            </button>
          </>
        )}
      </form>
    </main>
  );
}
