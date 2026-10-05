import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import "./whiteboard.css";

// Mini whiteboard — a section-level figure: any image sits on the surface of a
// hand-drawn whiteboard easel (the illustration exported from Figma), and on
// click the image expands into a modal lightbox. A section sets
// `whiteboard: "<src>"` or `whiteboard: { src, alt, caption }`.

const EASEL = "/figures/whiteboard/easel.png";

function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return createPortal(
    <div className="wb-lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={alt || "Expanded image"}>
      <button className="wb-lb__close" onClick={onClose} aria-label="Close">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
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

export default function Whiteboard({ src, alt, caption }) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <div className="wb-wrap">
      <button
        type="button"
        className="wb"
        onClick={() => setOpen(true)}
        aria-label={alt ? `Expand: ${alt}` : "Expand whiteboard image"}
      >
        <img className="wb__easel" src={EASEL} alt="" aria-hidden="true" />
        <span className="wb__board">
          <img className="wb__img" src={src} alt={alt || ""} />
        </span>
        <span className="wb__zoom" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <path d="M21 21l-4.3-4.3M11 8v6M8 11h6" />
          </svg>
        </span>
      </button>
      {caption && <span className="wb__caption">{caption}</span>}
      {open && <Lightbox src={src} alt={alt} onClose={close} />}
    </div>
  );
}
