import { useSyncExternalStore, type AnchorHTMLAttributes, type MouseEvent } from "react";

export type Route = { name: "create" } | { name: "library" } | { name: "viewer"; id: string } | { name: "notFound" };

function parse(pathname: string): Route {
  if (pathname === "/" || pathname === "") return { name: "create" };
  if (pathname === "/library") return { name: "library" };
  const m = /^\/m\/([0-9a-f-]{36})\/?$/.exec(pathname);
  if (m) return { name: "viewer", id: m[1] };
  return { name: "notFound" };
}

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  window.addEventListener("popstate", fn);
  return () => {
    listeners.delete(fn);
    window.removeEventListener("popstate", fn);
  };
};

export function navigate(to: string) {
  if (to === location.pathname) return;
  history.pushState(null, "", to);
  listeners.forEach((l) => l());
  window.scrollTo({ top: 0 });
}

export function useRoute(): Route {
  const path = useSyncExternalStore(subscribe, () => location.pathname);
  return parse(path);
}

export function Link({ href, onClick, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <a
      href={href}
      onClick={(e: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
