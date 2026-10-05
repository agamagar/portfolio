// Compact line/solid icons for the Scheduled Delivery figures. Line set inherits
// currentColor; sized by the consuming CSS.
const L = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

// Re-export, not a copy. Both families shipped a byte-identical check glyph and the
// design system owned none, which is why the rail carried its own.
export { IconCheck as ICheck } from "../ds/Primitives";
export const IBox = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.3 7L12 12l8.7-5M12 22V12" /></svg>);
export { IconClock as IClock } from "../ds/Primitives";
export const IBolt = () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13.2c-.4.5 0 1.3.7 1.3H11l-1 7.5c-.1.8.9 1.2 1.4.5L20 11.3c.4-.5 0-1.3-.7-1.3H13l1-7.5c.1-.8-.9-1.2-1.3-.5z" /></svg>);
export { IconCal as ICal } from "../ds/Primitives";
export { IconAlert as IAlert } from "../ds/Primitives";
export const IStore = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18" /></svg>);
export { IconPin as IPin } from "../ds/Primitives";
export { IconUser as IUser } from "../ds/Primitives";
export const IWarehouse = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 21V8.5l9-5 9 5V21" /><path d="M3 21h18M8 21v-6h8v6M8 12h8" /></svg>);
