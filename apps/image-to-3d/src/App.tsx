import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { formatUsd } from "../shared/models";
import { Icon } from "./components/Icon";
import { Spinner, ThemeToggle, ToastProvider } from "./components/ui";
import { api, type Session } from "./lib/api";
import { Link, navigate, useRoute } from "./lib/router";
import { CreatePage } from "./pages/Create";
import { LibraryPage } from "./pages/Library";
import { LoginPage } from "./pages/Login";
import { ViewerPage } from "./pages/Viewer";

interface SessionCtx {
  session: Session;
  refresh: () => Promise<void>;
}
const Ctx = createContext<SessionCtx | null>(null);
export const useSession = () => useContext(Ctx)!;

export function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);
  const route = useRoute();

  const refresh = useCallback(async () => {
    try {
      setSession(await api.session());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const titles = { create: "Create", library: "Library", viewer: "Model", notFound: "Not found" } as const;
    document.title = `${titles[route.name]} · Image to 3D`;
  }, [route.name]);

  if (!session) {
    return (
      <div className="center-screen">
        {error ? (
          <div className="glass card narrow" role="alert">
            <h1>Can't reach the server</h1>
            <p className="muted">{error}</p>
            <button className="btn primary" onClick={() => void refresh()}>
              Try again
            </button>
          </div>
        ) : (
          <Spinner label="Loading" />
        )}
      </div>
    );
  }

  if (!session.authenticated) return <LoginPage session={session} onSignedIn={refresh} />;

  return (
    <Ctx.Provider value={{ session, refresh }}>
      <ToastProvider>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {route.name === "create" && <CreatePage />}
          {route.name === "library" && <LibraryPage />}
          {route.name === "viewer" && <ViewerPage id={route.id} />}
          {route.name === "notFound" && (
            <div className="center-screen">
              <div className="glass card narrow">
                <h1>Nothing here</h1>
                <Link className="btn" href="/">
                  Back to Create
                </Link>
              </div>
            </div>
          )}
        </main>
      </ToastProvider>
    </Ctx.Provider>
  );
}

function Header() {
  const { session, refresh } = useSession();
  const route = useRoute();
  const spent = session.budget?.spentUsd;
  const limit = session.budget?.limitUsd;
  return (
    <header className="topbar glass">
      <Link href="/" className="brand" aria-label="Image to 3D, home">
        <span className="brand-mark" aria-hidden="true">
          <Icon name="cube" size={18} />
        </span>
        <span className="brand-name">
          Image <span aria-hidden="true">→</span>
          <span className="sr-only">to</span> 3D
        </span>
      </Link>
      <nav aria-label="Primary" className="nav">
        <Link href="/" aria-current={route.name === "create" ? "page" : undefined}>
          <Icon name="sparkle" size={16} /> Create
        </Link>
        <Link href="/library" aria-current={route.name === "library" || route.name === "viewer" ? "page" : undefined}>
          <Icon name="grid" size={16} /> Library
        </Link>
      </nav>
      <div className="topbar-end">
        {session.mock && (
          <span className="pill warn" title="ANTHROPIC_MOCK=fixtures: responses come from recorded fixtures, no credits are spent">
            Fixtures
          </span>
        )}
        {session.quota && (
          <span className="pill mono" title={`Models you've made this month${session.quota.monthly.limit === null ? " (no limit for admins)" : `, of ${session.quota.monthly.limit} free. Resets on the 1st (UTC).`}`}>
            {session.quota.monthly.used}
            {session.quota.monthly.limit === null ? "" : ` / ${session.quota.monthly.limit}`} models this month
          </span>
        )}
        {session.budget && limit !== undefined && (
          <span className="pill mono" title="Claude API spend today (UTC) against DAILY_BUDGET_USD">
            {spent === null || spent === undefined ? "—" : formatUsd(spent)} / {formatUsd(limit)} today
          </span>
        )}
        <ThemeToggle />
        {session.authenticated && (
          <button
            type="button"
            className="icon-btn"
            aria-label="Sign out"
            title="Sign out"
            onClick={async () => {
              await api.logout().catch(() => {});
              await refresh();
              navigate("/");
            }}
          >
            <Icon name="logout" />
          </button>
        )}
      </div>
    </header>
  );
}
