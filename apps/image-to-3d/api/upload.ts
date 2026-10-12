import { getDeps } from "../server/deps.js";
import { upload } from "../server/handlers/library.js";
import { route } from "../server/http.js";

export const PUT = route((req) => upload(req, getDeps()));
