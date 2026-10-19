import { getDeps } from "../server/deps.js";
import { getShared, reportShared } from "../server/handlers/shared.js";
import { route } from "../server/http.js";

export const GET = route((req) => getShared(req, getDeps()));
export const POST = route((req) => reportShared(req, getDeps()));
