// Demo cursor used by figures that show a pointer driving the UI. Position it in
// the frame's unscaled coordinate space (see centerInFrame). `press` triggers the
// click dip; bump `clickN` to replay the ripple.
export default function Cursor({ x, y, visible, press, clickN }) {
  return (
    <>
      <div
        className="ds-cursor"
        data-visible={visible}
        data-press={press}
        style={{ transform: `translate(${x}px, ${y}px)` }}
      >
        <svg className="ds-cursor__ptr" width="22" height="22" viewBox="0 0 24 24" fill="#fff" stroke="#1e1e1e" strokeWidth="1.4" strokeLinejoin="round" aria-hidden>
          <path d="M5 3l5.5 16 2.2-6.3 6.3-2.2L5 3z" />
        </svg>
      </div>
      {visible && press && (
        <span key={clickN} className="ds-ripple" style={{ left: `${x}px`, top: `${y}px` }} />
      )}
    </>
  );
}
