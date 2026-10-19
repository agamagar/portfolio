import { getDeps } from "../server/deps.js";
import { getAdmin, postAdmin } from "../server/handlers/admin.js";
import { route } from "../server/http.js";

export const GET = route((req) => getAdmin(req, getDeps()));
export const POST = route((req) => postAdmin(req, getDeps()));
