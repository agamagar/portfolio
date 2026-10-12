import { getDeps } from "../server/deps.js";
import { judge } from "../server/handlers/generate.js";
import { route } from "../server/http.js";

export const POST = route((req) => judge(req, getDeps()));
