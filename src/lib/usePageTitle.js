import { useEffect } from "react";

// One tab title per route (critique 28.1, 25 Oct): "<page> · Agam Agarwal", so a screen-reader user and a tab strip can
// tell which page is open. Back to the site name when the page leaves. Any route can call it:
//   usePageTitle("Scheduled Delivery")
export const SITE_TITLE = "Agam Agarwal";
export const pageTitle = (page) => (page ? `${page} · ${SITE_TITLE}` : SITE_TITLE);

export default function usePageTitle(page) {
  useEffect(() => {
    if (!page) return undefined;
    document.title = pageTitle(page);
    return () => { document.title = SITE_TITLE; };
  }, [page]);
}
