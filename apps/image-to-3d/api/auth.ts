import { getDeps } from "../server/deps.js";
import { authRoute } from "../server/handlers/auth.js";
import { route } from "../server/http.js";

export const GET = route((req) => authRoute(req, getDeps()));
