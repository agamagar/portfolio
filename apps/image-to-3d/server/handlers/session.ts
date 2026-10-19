/**
 * GET    /api/session  → what the client needs to render: who is signed in, auth options, limits
 * POST   /api/session  {action:"mock", email, name?, invite?}  local-only sign-in
 *                      {action:"consent"}                       agree to the current Terms + Privacy
 * DELETE /api/session  → sign out
 */
import { quotaView } from "../quota.js";
import { clearCookie, currentUser, guardConfigured, requireUser, sessionCookie, sessionToken } from "../auth.js";
import { spentToday } from "../budget.js";
import type { Deps } from "../deps.js";
import { clientIp, HttpError, json, readJson } from "../http.js";
import { wipeUserData } from "./library.js";
import { createSession, deleteUser, destroySession, hasConsented, recordConsent, SESSION_TTL_S, signInOrSignUp, TERMS_VERSION, type User } from "../users.js";

export function publicUser(u: User) {
  return { id: u.id, email: u.email, name: u.name, role: u.role, consented: hasConsented(u) };
}

export async function getSession(req: Request, d: Deps): Promise<Response> {
  const configured = (() => {
    try {
      guardConfigured(d);
      return true;
    } catch {
      return false;
    }
  })();
  const user = configured ? await currentUser(d, req) : null;
  let spent: number | null = null;
  if (user && d.store && d.kv) spent = await spentToday(d.store).catch(() => null);
  const quota = user && d.kv ? await quotaView(d.env, d.kv, user).catch(() => null) : null;
  return json({
    quota,
    authenticated: !!user,
    user: user ? publicUser(user) : null,
    locked: !configured,
    auth: { google: !!d.env.googleClientId, mock: d.env.mockAuth, inviteRequired: d.env.inviteRequired },
    termsVersion: TERMS_VERSION,
    contactEmail: d.env.contactEmail ?? null,
    storage: d.store?.kind ?? null,
    apiConfigured: !!d.api,
    mock: d.env.mock === "fixtures",
    maxRefinePasses: d.env.maxRefinePasses,
    // the global daily dollar cap is only shown to admins; users see their own quota (see quota.ts)
    budget: user?.role === "admin" ? { spentUsd: spent, limitUsd: d.env.dailyBudgetUsd } : null,
  });
}

export async function postSession(req: Request, d: Deps): Promise<Response> {
  d.loginLimiter.check(`login:${clientIp(req)}`);
  guardConfigured(d);
  const body = await readJson<{ action?: unknown; email?: unknown; name?: unknown; invite?: unknown; confirm?: unknown }>(req, 4096);

  if (body.action === "consent") {
    const user = await requireUser(d, req, { consent: false });
    return json({ user: publicUser(await recordConsent(d.env, d.kv!, user)) });
  }
  if (body.action === "delete-account") {
    // everything the user stored, their account and every session; irreversible
    const user = await requireUser(d, req, { consent: false });
    if (body.confirm !== user.email) throw new HttpError(400, "Type your email address to confirm.", "confirm_required");
    await wipeUserData(d, user);
    await deleteUser(d.kv!, user);
    return json({ ok: true }, 200, { "set-cookie": clearCookie(req) });
  }
  if (body.action === "mock") {
    if (!d.env.mockAuth) throw new HttpError(404, "Not found", "not_found");
    const { user } = await signInOrSignUp(d.env, d.kv!, { email: String(body.email ?? ""), name: String(body.name ?? ""), invite: body.invite });
    const token = await createSession(d.kv!, user.id);
    return json({ ok: true, user: publicUser(user) }, 200, { "set-cookie": sessionCookie(req, token, SESSION_TTL_S) });
  }
  throw new HttpError(400, "Unknown action", "bad_request");
}

export async function logout(req: Request, d: Deps): Promise<Response> {
  if (d.kv) await destroySession(d.kv, sessionToken(req)).catch(() => {});
  return json({ ok: true }, 200, { "set-cookie": clearCookie(req) });
}
