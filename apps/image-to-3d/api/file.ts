import { getDeps } from "../server/deps.js";
import { getFile } from "../server/handlers/file.js";
import { route } from "../server/http.js";

export const GET = route((req) => getFile(req, getDeps()));
