import { useState, type FormEvent } from "react";
import { Icon } from "../components/Icon";
import { ThemeToggle } from "../components/ui";
import { api, type Session } from "../lib/api";

const AUTH_ERRORS: Record<string, string> = {
  invite_required: "You need a valid invite code to create an account during the beta.",
  cancelled: "Sign-in was cancelled.",
  bad_state: "That sign-in expired. Try again.",
  oauth_failed: "Google sign-in failed. Try again.",
  not_configured: "Sign-in isn't configured on this deployment.",
};

export function LoginPage({ session, onSignedIn }: { session: Session; onSignedIn: () => Promise<void> }) {
  const [email, setEmail] = useState("");
  const [invite, setInvite] = useState("");
  const authError = new URLSearchParams(location.search).get("auth_error");
  const [error, setError] = useState<string | null>(authError ? (AUTH_ERRORS[authError] ?? "Sign-in failed.") : null);
  const [busy, setBusy] = useState(false);
  const { auth, locked } = session;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api.mockLogin(email, invite);
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
      <div className="glass card narrow">
        <span className="brand-mark large" aria-hidden="true">
          <Icon name="cube" size={24} />
        </span>
        <h1>Image → 3D</h1>
        {locked ? (
          <p className="muted">
            Sign-in isn't set up on this deployment yet. Set the Google, Upstash and <code>SESSION_SECRET</code> variables listed in the README, then redeploy.
          </p>
        ) : (
          <>
            <p className="muted">Turn one to three photos into a 3D illustration, then a three.js model. Free: 5 models a month. Private beta.</p>
            {auth.inviteRequired && (
              <div className="field">
                <label className="field-label" htmlFor="invite">
                  Invite code <span className="muted">(new accounts)</span>
                </label>
                <input id="invite" autoComplete="off" spellCheck={false} value={invite} onChange={(e) => setInvite(e.target.value)} />
              </div>
            )}
            {error && (
              <p id="login-error" className="error-text" role="alert">
                {error}
              </p>
            )}
            {auth.google && (
              <a className="btn primary block" href={`/api/auth?action=google&invite=${encodeURIComponent(invite.trim())}`}>
                <Icon name="lock" size={16} /> Continue with Google
              </a>
            )}
            {auth.mock && (
              <form onSubmit={submit} aria-label="Local sign-in">
                <div className="field">
                  <label className="field-label" htmlFor="email">
                    Email <span className="muted">(local mock sign-in, no password)</span>
                  </label>
                  <input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={!!error} />
                </div>
                <button className="btn primary block" type="submit" disabled={busy || !email}>
                  <Icon name="lock" size={16} /> {busy ? "Signing in…" : "Sign in"}
                </button>
              </form>
            )}
          </>
        )}
      </div>
    </main>
  );
}
