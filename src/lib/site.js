// Which site this build is. VITE_SITE=private opens every case study (the
// private.agamagarwal.com build); anything else is the public site, where every
// /work/<slug> shows a lock screen and the case content is never bundled.
// vite.config.js fills it in: unset means private on `npm run dev` (local work is
// unchanged) and public on a build. It is a compile-time constant, so the bundler
// folds it and drops the dead branch.
export const PRIVATE_SITE = import.meta.env.VITE_SITE === "private";
