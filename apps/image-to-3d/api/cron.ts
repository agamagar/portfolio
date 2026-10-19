import { getDeps } from "../server/deps.js";
import { cron } from "../server/handlers/cron.js";
import { route } from "../server/http.js";

export const GET = route((req) => cron(req, getDeps()));
