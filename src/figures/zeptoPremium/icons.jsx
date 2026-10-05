// Compact line/solid icons for the Zepto Premium figures. Line set inherits
// currentColor; sized by the consuming CSS. Same convention as the other
// figures/*/icons.jsx sets: 24x24 viewBox, 2px round stroke, solid-fill accents
// where a shape needs to read as "chosen"/"filled" rather than outlined.
const L = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" };

// Growth / traction
export const IGrowth = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M12 21v-8" /><path d="M12 13c0-4 3-6 7-6-1 4-3 6-7 6z" /><path d="M12 13c0-3-2-5-6-5 1 3 2 5 6 5z" /></svg>);
export const IOrdersUp = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M4 20v-4M9 20v-8M14 20v-12M19 20v-16" /><path d="M15 4h4v4" /></svg>);
export const IBasketDiverse = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M4 9h16l-1.6 10.2A2 2 0 0116.4 21H7.6a2 2 0 01-2-1.8z" /><path d="M8 9V7a4 4 0 018 0v2" /><circle cx="9.5" cy="14" r="1.3" fill="currentColor" stroke="none" /><rect x="13" y="12.8" width="2.6" height="2.6" fill="currentColor" stroke="none" /><path d="M11.3 17.8l1.3-2.3 1.3 2.3z" fill="currentColor" stroke="none" /></svg>);

// The user / the brand
export { IconUser as IUser } from "../ds/Primitives";
export const IBrand = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M13 7l-4.5 6h3.5l-1 4 4.5-6h-3.5z" fill="currentColor" stroke="none" /></svg>);

// Personas
export const IPersonaEvolvingElite = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 20h4v-4h4v-4h4v-4h4v-4" /><path d="M20.5 3.3l.6 1.3 1.4.2-1 1 .2 1.4-1.2-.7-1.2.7.2-1.4-1-1 1.4-.2z" fill="currentColor" stroke="none" /></svg>);
export const IPersonaHealthMaximizer = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M12 21s-7-4.4-9.5-9A5.5 5.5 0 0112 5a5.5 5.5 0 019.5 7c-2.5 4.6-9.5 9-9.5 9z" /><path d="M4 12h3l1.5-3 2 5 1.5-3h4" /></svg>);
export const IPersonaGourmetExplorer = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="13" r="8" /><path d="M15 10l-2 6-6 2 2-6z" fill="currentColor" stroke="none" /><path d="M9 3v2M12 2v3M15 3v2" /></svg>);
export const IPersonaHolisticElite = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 3a4.5 4.5 0 000 9 4.5 4.5 0 010 9" /><circle cx="12" cy="7.5" r="1.3" fill="currentColor" stroke="none" /><circle cx="12" cy="16.5" r="1.3" fill="currentColor" stroke="none" /></svg>);

// Curation / discovery / a space that deserves its own place
export const ICuration = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="3" y="3" width="7" height="7" rx="1.2" /><rect x="14" y="3" width="7" height="7" rx="1.2" /><rect x="3" y="14" width="7" height="7" rx="1.2" /><path d="M17.5 13.3l1.3 2.7 3 .4-2.2 2 .5 3-2.6-1.4-2.6 1.4.5-3-2.2-2 3-.4z" fill="currentColor" stroke="none" /></svg>);
export const IDiscovery = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="10.5" cy="10.5" r="7" /><path d="M21 21l-4.35-4.35" /><path d="M10.5 7.2l1 2.3 2.3 1-2.3 1-1 2.3-1-2.3-2.3-1 2.3-1z" fill="currentColor" stroke="none" /></svg>);
export const IDedicatedSurface = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M3 8V5a2 2 0 012-2h3M16 3h3a2 2 0 012 2v3M21 16v3a2 2 0 01-2 2h-3M8 21H5a2 2 0 01-2-2v-3" /><rect x="8" y="8" width="8" height="8" rx="1.5" /></svg>);

// Quantity / quality — matched pair, deliberate opposites
export const IQuantity = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><circle cx="6" cy="6" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="6" r="1.6" fill="currentColor" stroke="none" /><circle cx="18" cy="6" r="1.6" fill="currentColor" stroke="none" /><circle cx="6" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="6" cy="18" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="18" r="1.6" fill="currentColor" stroke="none" /><circle cx="18" cy="18" r="1.6" fill="currentColor" stroke="none" /></svg>);
export const IQuality = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M12 3l6 6-6 12-6-12z" /><path d="M6 9h12M9.5 9L12 3l2.5 6M9.5 9L12 21M14.5 9L12 21" /></svg>);

// Invite only / catalog / deep checks
export const IInviteOnly = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="3" y="6" width="18" height="13" rx="1.5" /><path d="M3 7l9 6 9-6" /><path d="M12 12.2l1 2 2.2.3-1.6 1.5.4 2.2-2-1.1-2 1.1.4-2.2-1.6-1.5 2.2-.3z" fill="currentColor" stroke="none" /></svg>);
export const ICatalog = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><rect x="4" y="4" width="16" height="16" rx="1.5" /><path d="M8 9h8M8 13h8M8 17h5" /></svg>);
export const IDeepChecks = () => (<svg viewBox="0 0 24 24" {...L} aria-hidden><path d="M11 3l6 2.6v4.4c0 3.8-2.5 6.6-6 7.8-3.5-1.2-6-4-6-7.8V5.6z" /><circle cx="10.3" cy="10" r="2.6" /><path d="M12.2 11.9L15 14.7" /></svg>);
