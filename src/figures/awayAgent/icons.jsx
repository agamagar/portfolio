// Compact line/solid icons for the Away agent figures. Line set inherits
// currentColor; sized by the consuming CSS.
const L = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

// Re-export, not a copy. Both families shipped a byte-identical check glyph and the
// design system owned none, which is why the rail carried its own.
export { IconCheck as ICheck } from "../ds/Primitives";
export const IPlane = () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M21 16v-2l-8-5V3.5a1.5 1.5 0 00-3 0V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5z" /></svg>);
export const ISearch = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>);
export const IMic = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0014 0M12 18v3" /></svg>);
export const IImage = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9.5" r="1.8" /><path d="M21 16l-5-5L4 20" /></svg>);
export { IconCal as ICal } from "../ds/Primitives";
export { IconClock as IClock } from "../ds/Primitives";
export { IconAlert as IAlert } from "../ds/Primitives";
export const IShield = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /><path d="M9 12l2 2 4-4" /></svg>);
export const ISend = () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M3 11l18-8-8 18-2-7z" /></svg>);
export const IArrow = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const ISpark = () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M12 2l1.8 5.8L19 9l-5.2 1.2L12 16l-1.8-5.8L5 9l5.2-1.2z" /><circle cx="18.5" cy="17.5" r="1.5" /></svg>);
export const IBell = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M6 9a6 6 0 1112 0c0 5 2 6 2 6H4s2-1 2-6z" /><path d="M10 20a2 2 0 004 0" /></svg>);
export { IconPin as IPin } from "../ds/Primitives";
export const IDoc = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M14 3H7a2 2 0 00-2 2v14a2 2 0 002 2h10a2 2 0 002-2V8z" /><path d="M14 3v5h5M9 13h6M9 17h4" /></svg>);
export const ICard = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="2.5" y="5" width="19" height="14" rx="2.5" /><path d="M2.5 10h19" /></svg>);
export const ISun = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="12" r="4.5" /><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" /></svg>);
export const ITrend = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 17l6-6 4 4 8-8" /><path d="M21 7v5h-5" /></svg>);
export const IRoute = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="5" cy="6" r="2.5" /><circle cx="19" cy="18" r="2.5" /><path d="M7.5 6H14a4 4 0 010 8H10a4 4 0 000 8" transform="translate(0 -2)" /></svg>);
export const IWifi = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M5 12.5a10 10 0 0114 0M8 16a5 5 0 018 0" /><circle cx="12" cy="19.5" r="1" fill="currentColor" stroke="none" /></svg>);
export const IX = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>);
export const ICoin = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v10M9.5 9.5a2.5 2 0 012.5-1.5c1.5 0 2.5.8 2.5 2s-1 1.8-2.5 2-2.5.8-2.5 2 1 1.5 2.5 1.5a2.5 2 0 002.5-1.5" /></svg>);
