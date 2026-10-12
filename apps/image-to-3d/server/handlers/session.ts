import { checkPassword, clearCookie, isAuthenticated, sessionCookie } from "../auth.js";
import { spentToday } from "../budget.js";
import type { Deps } from "../deps.js";
import { clientIp, HttpError, json, readJson } from "../http.js";

/** GET: what the client needs to render (auth state, limits, storage). Never secrets. */
export async function getSession(req: Request, d: Deps): Promise<Response> {
  const authed = isAuthenticated(d.env, req);
  let spent: number | null = null;
  if (authed && d.store) spent = await spentToday(d.store).catch(() => null);
  return json({
    authenticated: authed,
    passwordRequired: !!d.env.appPassword || d.env.isProduction,
    locked: d.env.isProduction && !d.env.appPassword,
    publicGallery: d.env.publicGallery,
    storage: d.store?.kind ?? null,
    apiConfigured: !!d.api,
    mock: d.env.mock === "fixtures",
    maxRefinePasses: d.env.maxRefinePasses,
    budget: authed ? { spentUsd: spent, limitUsd: d.env.dailyBudgetUsd } : null,
  });
}

export async function login(req: Request, d: Deps): Promise<Response> {
  d.loginLimiter.check(`login:${clientIp(req)}`);
  const body = await readJson<{ password?: unknown }>(req, 4096);
  if (!d.env.appPassword) {
    if (d.env.isProduction) throw new HttpError(503, "APP_PASSWORD is not set on the server, so the app is locked.", "not_configured");
    return json({ ok: true, open: true });
  }
  if (!checkPassword(d.env, body.password)) throw new HttpError(401, "That password isn't right.", "bad_password");
  return json({ ok: true }, 200, { "set-cookie": sessionCookie(d.env, req) });
}

export async function logout(req: Request): Promise<Response> {
  return json({ ok: true }, 200, { "set-cookie": clearCookie(req) });
}
