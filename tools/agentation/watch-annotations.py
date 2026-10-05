#!/usr/bin/env python3
"""Live watcher for Agentation annotations (portfolio, :5173).

Polls http://localhost:4747/pending every 5s and prints one line per NEW
pending annotation whose page url is on localhost:5173. Errors are printed
to stdout, never swallowed (a silent watcher is worse than none).

Usage:
  watch_annotations.py          # run forever (for Monitor)
  watch_annotations.py --once   # single poll, print current pending, exit
"""
import json
import os
import sys
import time
import urllib.request
import urllib.error

PENDING_URL = "http://localhost:4747/pending"
# All portfolio dev-server ports (dev / verify / verify-2 / lan). Other projects
# (:5180 shape, :5182 shader-viewer) share the agentation server; keep them out.
FILTER_HOSTS = tuple(f"localhost:{p}" for p in (os.environ.get("AGENTATION_PORTS") or "5173,5174,5175,5177").split(","))
POLL_SECS = 5
once = "--once" in sys.argv

# SEEN IS PERSISTED (2026-09-16). It used to live only in memory, so every
# restart of this watcher replayed the entire pending queue as if it were new -
# and since a Monitor caps at 30 minutes, that meant the same nine pins arriving
# every half hour, which is how a real pin gets lost in its own backlog. On a
# first ever run the queue is baselined SILENTLY (one summary line, not one line
# per pin) because those pins are not news; only pins that appear after this
# watcher first saw the queue are announced.
SNAP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "agentation-watch-seen.json")


def load_seen():
    try:
        with open(SNAP) as f:
            return set(json.load(f))
    except Exception:
        return None


def save_seen(ids):
    try:
        with open(SNAP, "w") as f:
            json.dump(sorted(ids), f)
    except Exception:
        pass  # a watcher that cannot write its snapshot still works, just noisily


seen = load_seen()
first_run = seen is None
if first_run:
    seen = set()
server_down = False  # emit the down/up transition once, not every poll
# A BLIP IS NOT AN OUTAGE (2026-08-18). The server is a single-threaded Node
# process writing SQLite on a Drive path, so a poll occasionally waits past the
# timeout while the server is mid-write - it answers in ~6ms the rest of the
# time. Reporting each of those produced a stream of down/up notifications for
# a server that was never actually down. Only a RUN of failures counts, and the
# timeout is longer than one slow write.
misses = 0
MISSES_BEFORE_ALARM = 3


def fetch_pending():
    with urllib.request.urlopen(PENDING_URL, timeout=10) as r:
        return json.loads(r.read().decode("utf-8"))


def fmt(a):
    url = a.get("url") or ""
    path = url
    for host in FILTER_HOSTS:
        if host in url:
            path = url.split(host, 1)[-1]
            break
    target = a.get("cssClasses") or a.get("element") or a.get("elementPath") or "?"
    comment = (a.get("comment") or "").strip().replace("\n", " ")
    return f"NEW {a['id']} [{path}] ({target}) :: {comment}"


while True:
    try:
        data = fetch_pending()
        misses = 0
        if server_down:
            print("OK: agentation server reachable again", flush=True)
            server_down = False
        fresh = []
        for a in data.get("annotations", []):
            url = a.get("url") or ""
            if not any(host in url for host in FILTER_HOSTS):
                continue
            if a.get("status") != "pending":
                continue
            if a["id"] in seen:
                continue
            seen.add(a["id"])
            fresh.append(a)
        if first_run:
            # baseline: count them, name them compactly, do not shout each one
            print(f"BASELINE {len(fresh)} pending pin(s) already open, not re-reported: "
                  + ", ".join(a["id"] for a in fresh), flush=True)
            first_run = False
        else:
            for a in fresh:
                print(fmt(a), flush=True)
        if fresh:
            save_seen(seen)
    except (urllib.error.URLError, OSError, TimeoutError) as e:
        misses += 1
        if misses >= MISSES_BEFORE_ALARM and not server_down:
            print(
                f"ERROR: agentation server unreachable ({misses} polls): {e}",
                flush=True,
            )
            server_down = True
    except Exception as e:
        print(f"ERROR: watcher exception: {type(e).__name__}: {e}", flush=True)
    if once:
        break
    time.sleep(POLL_SECS)
