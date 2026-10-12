import { useEffect, useId, useRef, useState } from "react";
import { Lock } from "iconoir-react";
import { LOCK_COPY } from "./workMeta";

// A project that is waiting on NDA approval (mv58rul2). It takes the place of
// HelloLink and keeps the row or card exactly as it was, but:
//  - there is no href, so it is not an `a[href]` and the site's project intent
//    (route prefetch, the card-to-hero transition) never sees it;
//  - role="link" + aria-disabled + aria-describedby keep it announced as a
//    project, and say why it will not open;
//  - `badge={false}` lets a row draw the lock itself, inside its title (a badge
//    child would become a grid cell of the row);
//  - hover or keyboard focus shows the lock and a glass tooltip (CSS, in
//    hello3.css); a click, Enter or Space shows the same tooltip for a moment,
//    so touch and keyboard readers get it too.
export default function LockedLink({ className, style, children, tip = "below", badge = true, ...rest }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  const flash = () => { setOpen(true); clearTimeout(timer.current); timer.current = setTimeout(() => setOpen(false), 2600); };
  return (
    <a
      role="link"
      tabIndex={0}
      aria-disabled="true"
      aria-describedby={id}
      className={`${className || ""} is-locked`}
      style={style}
      data-tip-open={open ? "" : undefined}
      data-lock-tip={tip}
      onClick={(e) => { e.preventDefault(); flash(); }}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flash(); } }}
      onBlur={() => setOpen(false)}
      {...rest}
    >
      {children}
      {badge && <span className="lock__badge" aria-hidden><Lock width={14} height={14} strokeWidth={2} /></span>}
      <span className="lock__tip" id={id} role="tooltip">
        <Lock width={14} height={14} strokeWidth={2} aria-hidden />
        {LOCK_COPY}
      </span>
    </a>
  );
}
