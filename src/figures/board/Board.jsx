import { forwardRef, useImperativeHandle, useLayoutEffect, useMemo, useRef } from "react";
import { mountBoard } from "./core/mount.js";

/**
 * <Board spec={...} animate="inview" />  — a whiteboard written in the Marker Hand font.
 * `spec` is a layout ({ layout: "mindmap", outline }) or raw primitives ({ items: [...] }); see ./index.js.
 * animate: true | false | "inview" (write itself when scrolled into view). Reduced motion shows the finished board.
 * The SVG is mounted imperatively so React never reconciles (and never reverts) the animated attributes.
 * Ref: { replay, finish, pause, play, seek, exportSVG, toPNG, duration }.
 */
const Board = forwardRef(function Board({ spec, animate = "inview", speed = 1, className, style, onDone, onTime }, ref) {
  const host = useRef(null);
  const ctl = useRef(null);
  const key = useMemo(() => JSON.stringify(spec), [spec]);

  useLayoutEffect(() => {
    ctl.current = mountBoard(host.current, JSON.parse(key), { animate, speed, onDone, onTime });
    return () => {
      ctl.current?.destroy();
      ctl.current = null;
    };
    // onDone/onTime are read once per mount on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, animate, speed]);

  useImperativeHandle(ref, () => ({
    replay: () => ctl.current?.replay(),
    finish: () => ctl.current?.finish(),
    pause: () => ctl.current?.pause(),
    play: () => ctl.current?.play(),
    seek: (t) => ctl.current?.seek(t),
    exportSVG: () => ctl.current?.exportSVG(),
    toPNG: (s) => ctl.current?.toPNG(s),
    get duration() { return ctl.current?.duration ?? 0; },
  }), []);

  return <div ref={host} className={className} style={style} data-board />;
});

export default Board;
