// Full-page route (/brick-lab) that hosts the standalone Brick jali pattern
// studio. The editor itself is a self-contained p5 app in public/brick-lab/
// (its own document — keeps the heavy WebGL + PNG export fully isolated from
// the portfolio bundle, and it has no React/p5 dependency on the app). This
// wrapper just frames it edge-to-edge and offers a way back.
export default function BrickLab({ onBack }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 40,
        background: "#0c0906",
      }}
    >
      <iframe
        src="/brick-lab/index.html"
        title="Brick jali — pattern studio"
        style={{ width: "100%", height: "100%", border: "none", display: "block" }}
      />
      {/* The editor has its own in-canvas "← Portfolio" link, but that does a
          full navigation. This overlay button uses the app's client-side
          router for an instant return. */}
      <button
        type="button"
        onClick={onBack}
        style={{
          position: "fixed",
          // sit at the top-left of the canvas stage (past the 320px control
          // panel), matching where the editor's own back link lives
          left: 336,
          top: 14,
          zIndex: 41,
          font: "12px/1 -apple-system, Inter, sans-serif",
          color: "#9d8b72",
          background: "rgba(20,16,12,0.7)",
          border: "1px solid #2a221a",
          borderRadius: 5,
          padding: "7px 11px",
          cursor: "pointer",
          backdropFilter: "blur(6px)",
        }}
      >
        ← Portfolio
      </button>
    </div>
  );
}
