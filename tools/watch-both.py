#!/usr/bin/env python3
"""Run both annotation watchers; exit the moment either says something real.

Why this exists. The two watchers (tools/figma/watch-figma-annotations.py and
tools/agentation/watch-annotations.py) were run as streaming Monitors, which cap
at 30 minutes - so keeping "watch both sides going forward" alive meant a turn
spent re-arming every half hour, all night, to report nothing.

A detached background process has no such cap, but it only wakes the session
when it EXITS. So this runs both watchers and exits on the first actionable
line. Quiet hours cost nothing; any real event wakes the session immediately;
after handling it, the session relaunches this. Both watchers keep their own
snapshots on disk, so a relaunch never replays what was already reported, and
anything that happened between exit and relaunch is still caught next time.

Actionable = a new/edited/removed pin or note, or an outage/recovery. The
watchers' own BASELINE lines are not events and never trigger an exit.

Run (detached): python3 tools/watch-both.py
"""
import os, subprocess, sys, threading, queue

HERE = os.path.dirname(os.path.abspath(__file__))
WATCHERS = {
    "figma": [sys.executable, "-u", os.path.join(HERE, "figma", "watch-figma-annotations.py"), "180"],
    "web":   [sys.executable, "-u", os.path.join(HERE, "agentation", "watch-annotations.py")],
}
ACTIONABLE = ("NEW ", "EDITED ", "REMOVED ", "ANNOTATION CHANGE", "ERROR", "OK:")

events = queue.Queue()
procs = {}


def pump(name, proc):
    for raw in proc.stdout:
        line = raw.rstrip("\n")
        if line:
            events.put((name, line))
    events.put((name, None))  # this watcher ended


for name, cmd in WATCHERS.items():
    p = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
                         text=True, bufsize=1, cwd=os.path.dirname(HERE))
    procs[name] = p
    threading.Thread(target=pump, args=(name, p), daemon=True).start()

print(f"watching figma + web (pids {', '.join(str(p.pid) for p in procs.values())})", flush=True)

exit_code = 0
try:
    while True:
        name, line = events.get()
        if line is None:
            # a watcher dying is itself an event: nobody is watching that side
            print(f"[{name}] WATCHER EXITED unexpectedly", flush=True)
            exit_code = 2
            break
        if line.startswith("BASELINE"):
            continue
        if line.lstrip().startswith(ACTIONABLE):
            # collect any lines that arrive together (a CHANGE header + its items)
            batch = [f"[{name}] {line}"]
            try:
                while True:
                    n2, l2 = events.get(timeout=1.5)
                    if l2 is None:
                        break
                    if not l2.startswith("BASELINE"):
                        batch.append(f"[{n2}] {l2}")
            except queue.Empty:
                pass
            print("\n".join(batch), flush=True)
            break
finally:
    for p in procs.values():
        try:
            p.terminate()
        except Exception:
            pass
sys.exit(exit_code)
