import { useCallback, useEffect, useState } from "react";
import { formatUsd } from "../../shared/models";
import { Icon } from "../components/Icon";
import { Spinner, useToast } from "../components/ui";
import { api, type AdminSummary } from "../lib/api";

/** Spend, usage, invites and reports. Admins only (ADMIN_EMAILS). */
export function AdminPage() {
  const toast = useToast();
  const [data, setData] = useState<AdminSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [uses, setUses] = useState(1);
  const [newCode, setNewCode] = useState<string | null>(null);

  const load = useCallback(
    () =>
      api
        .admin()
        .then(setData, (e) =>
          setError(e instanceof Error ? e.message : String(e)),
        ),
    [],
  );
  useEffect(() => {
    void load();
  }, [load]);

  const act = async (body: Record<string, unknown>, done?: string) => {
    try {
      const r = await api.adminAction(body);
      if (r.code) setNewCode(r.code);
      if (done) toast(done);
      await load();
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  };

  if (error) return <p className="page error-text">{error}</p>;
  if (!data)
    return (
      <div className="center-block">
        <Spinner label="Loading" />
      </div>
    );
  const max = Math.max(0.01, ...data.days.map((d) => d.usd));

  return (
    <div className="page admin">
      <div className="page-head">
        <div>
          <h1>Admin</h1>
          <p className="muted">
            Today {formatUsd(data.today.usd)} of{" "}
            {formatUsd(data.today.limitUsd)} ({Math.round(data.today.pct)}%).
            Alerts at {data.alerts.thresholds.join(", ")}%
            {data.alerts.webhook
              ? " to your webhook."
              : "; no webhook set, so they only reach the logs."}
          </p>
        </div>
      </div>

      <section className="glass card" aria-label="Spend by day">
        <h2>Spend, last 14 days</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Day (UTC)</th>
              <th>Spend</th>
              <th>Calls</th>
              <th aria-hidden="true" />
            </tr>
          </thead>
          <tbody>
            {data.days.map((d) => (
              <tr key={d.day}>
                <td className="mono">{d.day}</td>
                <td className="mono">{formatUsd(d.usd)}</td>
                <td className="mono">{d.calls}</td>
                <td>
                  <div
                    className="bar"
                    style={{ width: `${(d.usd / max) * 100}%` }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass card" aria-label="Users">
        <h2>Users ({data.users.length})</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Models this month</th>
              <th>Spend today</th>
              <th>Blocked today</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((u) => (
              <tr key={u.id}>
                <td>
                  {u.email}
                  {u.role === "admin" ? " (admin)" : ""}
                </td>
                <td className="mono">{u.modelsThisMonth}</td>
                <td className="mono">{formatUsd(u.usdToday)}</td>
                <td className="mono">{u.blocksToday}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass card" aria-label="Invite codes">
        <h2>Invite codes</h2>
        <form
          className="row"
          onSubmit={(e) => {
            e.preventDefault();
            void act({ action: "create-invite", maxUses: uses, note });
          }}
        >
          <label className="sr-only" htmlFor="invite-note">
            Note
          </label>
          <input
            id="invite-note"
            placeholder="Who is it for?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={80}
          />
          <label className="sr-only" htmlFor="invite-uses">
            Uses
          </label>
          <input
            id="invite-uses"
            type="number"
            min={1}
            max={1000}
            value={uses}
            onChange={(e) => setUses(Number(e.target.value))}
          />
          <button className="btn primary" type="submit">
            <Icon name="sparkle" size={16} /> New code
          </button>
        </form>
        {newCode && (
          <p role="status">
            New code: <code className="mono">{newCode}</code>
          </p>
        )}
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Used</th>
              <th>Note</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.invites.map((i) => (
              <tr key={i.code}>
                <td className="mono">{i.code}</td>
                <td className="mono">
                  {i.uses} / {i.maxUses}
                </td>
                <td>{i.note}</td>
                <td>
                  <button
                    type="button"
                    className="btn small"
                    onClick={() =>
                      void act(
                        { action: "revoke-invite", code: i.code },
                        "Revoked",
                      )
                    }
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="glass card" aria-label="Reports">
        <h2>Reports ({data.reports.length})</h2>
        {data.reports.length === 0 && <p className="muted">None.</p>}
        <table className="table">
          <tbody>
            {data.reports.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.at).toLocaleString()}</td>
                <td>{r.reason}</td>
                <td>{r.details}</td>
                <td>
                  <a href={`/s/${r.token}`} target="_blank" rel="noreferrer">
                    View
                  </a>
                </td>
                <td>
                  <button
                    type="button"
                    className="btn small danger"
                    onClick={() =>
                      void act(
                        { action: "takedown", token: r.token },
                        "Taken down",
                      )
                    }
                  >
                    Take down
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
