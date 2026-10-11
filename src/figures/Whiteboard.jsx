import { lazy, Suspense, useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import "./whiteboard.css";

// Mini whiteboard — a section-level figure: any image sits on the surface of a
// hand-drawn whiteboard easel (the illustration exported from Figma), and on
// click the image expands into a modal lightbox. A section sets
// `whiteboard: "<src>"` or `whiteboard: { src, alt, caption }`.
//
// Generated boards: `whiteboard: { board: <spec>, alt, caption }` puts a board from the whiteboard engine
// (src/figures/board) on the easel instead of an image. The lightbox then writes the board out live, in the
// Marker Hand font, with replay and skip. `board` is a layout spec ({ layout: "mindmap", outline: "..." }) or
// raw primitives ({ items: [...] }); see src/figures/board/index.js for the layouts.

// the board engine (~150 KB with the font data) loads only when a figure actually uses `board`
const Board = lazy(() => import("./board/Board"));

const EASEL = "/figures/whiteboard/easel.png";

function useEscape(onClose) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
}

const CloseButton = ({ onClose }) => (
  <button className="wb-lb__close" onClick={onClose} aria-label="Close">
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  </button>
);

function Lightbox({ src, alt, onClose }) {
  useEscape(onClose);

  return createPortal(
    <div className="wb-lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt || "Expanded image"}>
      <CloseButton onClose={onClose} />
      <img
        className="wb-lb__img"
        src={src}
        alt={alt || ""}
        onClick={(e) => e.stopPropagation()}
      />
    </div>,
    document.body,
  );
}

// Lightbox for a generated board: it writes itself out; replay / skip sit under it.
function BoardLightbox({ board, alt, onClose }) {
  useEscape(onClose);
  const ref = useRef(null);
  return createPortal(
    <div className="wb-lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt || "Whiteboard"}>
      <CloseButton onClose={onClose} />
      <div className="wb-lb__stack" onClick={(e) => e.stopPropagation()}>
        <Suspense fallback={<div className="wb-lb__board" style={{ aspectRatio: "16 / 10" }} />}>
          <Board ref={ref} spec={board} animate className="wb-lb__board" />
        </Suspense>
        <div className="wb-lb__bar">
          <button type="button" onClick={() => ref.current?.replay()}>Replay</button>
          <button type="button" onClick={() => ref.current?.finish()}>Skip to end</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Whiteboard({ src, alt, caption, board }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="wb-wrap">
      <button
        type="button"
        className="wb"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Expand: ${alt}` : board ? "Expand whiteboard" : "Expand whiteboard image"}
      >
        <img className="wb__easel" src={EASEL} alt="" aria-hidden="true" />
        <span className="wb__board">
          {board ? (
            <Suspense fallback={null}>
              <Board spec={board} animate={false} className="wb__live" />
            </Suspense>
          ) : (
            <img className="wb__img" src={src} alt={alt || ""} />
          )}
        </span>
        <span className="wb__zoom" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
          </svg>
        </span>
      </button>
      {caption && <span className="wb__caption">{caption}</span>}
      {open && (board ? <BoardLightbox board={board} alt={alt} onClose={close} /> : <Lightbox src={src} alt={alt} onClose={close} />)}
    </div>
  );
}
