import { getDeps } from "../server/deps.js";
import { deleteItem, getLibrary, patchItem, saveItem } from "../server/handlers/library.js";
import { route } from "../server/http.js";

export const GET = route((req) => getLibrary(req, getDeps()));
export const POST = route((req) => saveItem(req, getDeps()));
export const PATCH = route((req) => patchItem(req, getDeps()));
export const DELETE = route((req) => deleteItem(req, getDeps()));
