/**
 * Google sign-in.
 *   GET /api/auth?action=google&invite=CODE  → 302 to Google
 *   GET /api/auth?action=callback            → Google's redirect back: sets the session, 302 to /
 * Failures send the browser back to /?auth_error=<code> so the SPA can explain.
 */
import { googleCallback, googleStart, guardConfigured, sessionCookie } from "../auth.js";
import type { Deps } from "../deps.js";
import { clientIp, HttpError } from "../http.js";
import { createSession, SESSION_TTL_S, signInOrSignUp } from "../users.js";

function redirect(location: string, cookies: string[] = []): Response {
  const headers = new Headers({ location, "cache-control": "no-store" });
  for (const c of cookies) headers.append("set-cookie", c);
  return new Response(null, { status: 302, headers });
}

export async function authRoute(req: Request, d: Deps, fetchImpl: typeof fetch = fetch): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");
  d.loginLimiter.check(`login:${clientIp(req)}`);
  try {
    guardConfigured(d);
    if (action === "google") {
      const { location, cookie } = googleStart(d.env, req, url.searchParams.get("invite") ?? "");
      return redirect(location, [cookie]);
    }
    if (action === "callback") {
      if (url.searchParams.get("error")) return redirect("/?auth_error=cancelled");
      const { profile, invite, clearCookie } = await googleCallback(d.env, req, fetchImpl);
      const { user } = await signInOrSignUp(d.env, d.kv!, { ...profile, invite });
      const token = await createSession(d.kv!, user.id);
      return redirect("/", [clearCookie, sessionCookie(req, token, SESSION_TTL_S)]);
    }
  } catch (err) {
    if (err instanceof HttpError) return redirect(`/?auth_error=${encodeURIComponent(err.code)}`);
    throw err;
  }
  throw new HttpError(400, "Unknown action", "bad_request");
}
