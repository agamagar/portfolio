// Compact line/solid icons for the Scheduled Delivery figures. Line set inherits
// currentColor; sized by the consuming CSS.
const L = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

export const ICheck = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M20 6L9 17l-5-5" /></svg>);
export const IBox = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><path d="M3.3 7L12 12l8.7-5M12 22V12" /></svg>);
export const IClock = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IBolt = () => (<svg viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden><path d="M13 2L4.5 13.2c-.4.5 0 1.3.7 1.3H11l-1 7.5c-.1.8.9 1.2 1.4.5L20 11.3c.4-.5 0-1.3-.7-1.3H13l1-7.5c.1-.8-.9-1.2-1.3-.5z" /></svg>);
export const ICal = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="3" y="5" width="18" height="16" rx="2.5" /><path d="M3 9h18M8 3v4M16 3v4" /></svg>);
export const IAlert = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M10.3 3.5L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L14.7 3.5a2 2 0 00-3.4 0z" /><path d="M12 9v4M12 17h.01" /></svg>);
export const IStore = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 9l1.5-5h15L21 9M4 9v10a1 1 0 001 1h14a1 1 0 001-1V9M3 9h18" /></svg>);
export const IPin = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M12 22s7-6.3 7-12a7 7 0 10-14 0c0 5.7 7 12 7 12z" /><circle cx="12" cy="10" r="2.6" /></svg>);
export const IUser = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></svg>);
export const IWarehouse = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 21V8.5l9-5 9 5V21" /><path d="M3 21h18M8 21v-6h8v6M8 12h8" /></svg>);
