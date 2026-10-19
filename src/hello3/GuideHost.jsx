// Carries the Agam cursor onto case-study pages (Agam, 19 Oct 2026: "guide someone to the important parts of the case
// study"). The cursor lives in the home page; once the visitor has activated it there (clicked the face) a flag is set
// for the visit, and on /work/* this host mounts it again in guide-only mode. Route changes are not announced by the
// router, so the path is read on a slow timer (a string compare).
import { useEffect, useState } from "react";
import SiteCursor from "./SiteCursor";

const wanted = () => {
  try { return /^\/work\//.test(location.pathname) && sessionStorage.getItem("agam-cursor-active") === "1"; } catch { return false; }
};

export default function GuideHost() {
  const [path, setPath] = useState(() => location.pathname);
  useEffect(() => { const t = setInterval(() => setPath((p) => (p === location.pathname ? p : location.pathname)), 400); return () => clearInterval(t); }, []);
  return wanted() ? <SiteCursor key={path} caseMode /> : null;
}
