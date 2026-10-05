// Used only by render.mjs when the base server is unreachable: the project's own Vite config
// with a separate dependency cache, so a second dev server on :5175 never rewrites the
// node_modules/.vite/deps that Agam's server on :5173 is serving from.
import base from "../../vite.config.js";

const CACHE = "node_modules/.vite-window-light";

export default typeof base === "function"
  ? async (env) => ({ ...(await base(env)), cacheDir: CACHE })
  : { ...base, cacheDir: CACHE };
