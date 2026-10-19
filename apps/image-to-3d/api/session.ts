import { getDeps } from "../server/deps.js";
import { getSession, logout, postSession } from "../server/handlers/session.js";
import { route } from "../server/http.js";

export const GET = route((req) => getSession(req, getDeps()));
export const POST = route((req) => postSession(req, getDeps()));
export const DELETE = route((req) => logout(req, getDeps()));
