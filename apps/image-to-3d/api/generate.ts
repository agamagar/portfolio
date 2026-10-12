import { getDeps } from "../server/deps.js";
import { generate } from "../server/handlers/generate.js";
import { route } from "../server/http.js";

export const POST = route((req) => generate(req, getDeps()));
