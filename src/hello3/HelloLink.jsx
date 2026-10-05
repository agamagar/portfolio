// A link that respects the site router for internal paths and behaves like a
// normal anchor for everything else, including modifier-clicks (a cmd-click that
// does not open a new tab is one of the fastest ways to make a site feel fake).

export default function HelloLink({ to, onNavigate, className, style, children, blank, ...rest }) {
  const internal = typeof to === "string" && to.startsWith("/") && !blank;
  return (
    <a
      href={to}
      className={className}
      style={style}
      target={blank ? "_blank" : undefined}
      rel={blank ? "noopener noreferrer" : undefined}
      onClick={(e) => {
        if (!internal || !onNavigate) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        onNavigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
