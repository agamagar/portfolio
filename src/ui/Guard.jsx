// Blank-page guards (11 Oct 2026). A render/effect throw inside <Guard> hides only that piece
// (or shows `fallback`) instead of unmounting the whole React root. Also: lazyRetry, a
// React.lazy that retries a failed chunk and then degrades to a null component.
import React from "react";

export class Guard extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(err, info) {
    console.warn(`[Guard] "${this.props.name || "section"}" failed and was hidden:`, err, info?.componentStack?.split("\n").slice(0, 3).join("\n"));
    window.__guardFailures = [...(window.__guardFailures || []), this.props.name || "section"];
  }
  render() { return this.state.failed ? (this.props.fallback ?? null) : this.props.children; }
}

// lazyRetry(() => import("./X")): two retries (cache-busted by the browser's own retry after a
// short wait), then a component that renders nothing, so Suspense never hangs and nothing throws.
export function lazyRetry(factory, tries = 3) {
  return React.lazy(async () => {
    for (let i = 0; i < tries; i++) {
      try { return await factory(); } catch (e) {
        if (i === tries - 1) { console.warn("[lazyRetry] chunk failed, rendering nothing:", e); break; }
        await new Promise((r) => setTimeout(r, 400 * (i + 1)));
      }
    }
    return { default: () => null };
  });
}

// Top-level last resort: static name, links and work list. No imports from the app.
export function StaticFallback() {
  const a = { color: "inherit", textDecoration: "underline" };
  return (
    <main style={{ maxWidth: 560, margin: "15vh auto", padding: "0 24px", font: "16px/1.6 system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 32, margin: 0 }}>Agam Agarwal</h1>
      <p>Interaction designer, Bangalore.</p>
      <p>
        <a style={a} href="https://www.linkedin.com/in/agam-agarwal/">LinkedIn</a> · <a style={a} href="mailto:agamagar117@gmail.com">Email</a>
      </p>
      <ul style={{ paddingLeft: 18 }}>
        <li><a style={a} href="/work/scheduled-delivery">Scheduled delivery</a></li>
        <li><a style={a} href="/work/away-agent">Away</a></li>
        <li><a style={a} href="/work/toppr">Toppr</a></li>
        <li><a style={a} href="/work/dassh">Dassh</a></li>
      </ul>
      <p><button onClick={() => location.reload()}>Reload</button></p>
    </main>
  );
}
