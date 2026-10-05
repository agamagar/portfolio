#!/usr/bin/env python3
"""Watch Dev Mode ANNOTATIONS in the Scheduled Delivery Figma file.

The other half of the bridge already has a watcher: tools/agentation/watch-annotations.py
picks up pins left on the live site. This one picks up notes left on the DESIGN,
so feedback reaches the session from whichever side Agam happens to be sitting on.

Two things it deliberately does NOT do:

  * it does not fetch the file to poll. The column's full tree is 13.9 MB and a
    `depth=1` request is 56 KB, and both carry the file-level `lastModified` - so
    the poll is the cheap call and the tree is pulled only when the file actually
    moved. (The sibling watcher learned this the hard way: it was pulling 14 MB
    every three minutes to read one timestamp, and timed out several times an
    hour on a phone hotspot.)

  * it does not report the machine being offline. A laptop that sleeps or drops
    wifi cannot resolve api.figma.com, and treating that as an event killed the
    watch loop overnight for a reason Agam can already see in his menu bar.
    Nothing is lost by staying quiet: the snapshot on disk means the next
    successful poll still diffs against the last notes this watcher saw, so a
    note added while offline is reported when the network returns. Offline runs
    go to a log file instead of stdout.

  * it does not report every file change. Agam edits this file constantly; an
    annotation changing is rare. A tick that finds the file modified but the
    notes identical prints nothing, so a line from this watcher always means a
    note was added, edited or deleted.

Annotations come back on the REST node payload as `annotations: [{label |
labelMarkdown, ...}]`, which is why this can run as a plain script instead of
needing the MCP.

Run: python3 tools/figma/watch-figma-annotations.py [interval-seconds]
"""
import json, os, socket, subprocess, sys, time, urllib.request, urllib.error

FILE = "HBBgHT1u7e5jsz7BEEZ3fT"
COL = "3:2701"                       # the case-study column
SNAP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "figma-annotations-watch.json")
INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 180
# this file lives in the Zepto account, so it needs THAT pat - the personal one 404s
PAT = subprocess.run(["security", "find-generic-password", "-s", "figma-pat-zep", "-w"],
                     capture_output=True, text=True).stdout.strip()


def get(ids, depth=None):
    url = f"https://api.figma.com/v1/files/{FILE}/nodes?ids={ids}" + (f"&depth={depth}" if depth else "")
    req = urllib.request.Request(url, headers={"X-Figma-Token": PAT})
    with urllib.request.urlopen(req, timeout=180) as r:
        return json.load(r)


def touched():
    """file-level lastModified, for 56 KB instead of 13.9 MB"""
    return get(COL, depth=1).get("lastModified")


def read_annotations():
    """{nodeId: {name, frame, labels[]}} for every annotated node in the column"""
    d = get(COL)
    root = d["nodes"][COL]["document"]
    out = {}

    def walk(n, frame):
        anns = n.get("annotations")
        if anns:
            labels = [a.get("label") or a.get("labelMarkdown") or "" for a in anns]
            out[n["id"]] = {"name": n.get("name", "")[:60], "frame": frame, "labels": labels}
        for c in n.get("children", []):
            walk(c, frame)

    for child in root.get("children", []):
        walk(child, child.get("name", "")[:60])
    return d.get("lastModified"), out


def diff(before, after):
    ev = []
    for nid, rec in after.items():
        if nid not in before:
            for l in rec["labels"]:
                ev.append(f'NEW annotation on {nid} "{rec["name"]}" [frame: {rec["frame"]}] :: {l}')
        elif before[nid]["labels"] != rec["labels"]:
            ev.append(f'EDITED annotation on {nid} "{rec["name"]}" [frame: {rec["frame"]}] :: '
                      f'{" | ".join(before[nid]["labels"])} -> {" | ".join(rec["labels"])}')
    for nid, rec in before.items():
        if nid not in after:
            ev.append(f'REMOVED annotation on {nid} "{rec["name"]}" :: {" | ".join(rec["labels"])}')
    return ev


prev = None
if os.path.exists(SNAP):
    try:
        prev = json.load(open(SNAP))
    except Exception:
        prev = None
if prev is None:
    lm, anns = read_annotations()
    prev = {"lastModified": lm, "annotations": anns}
    json.dump(prev, open(SNAP, "w"))
    print(f"BASELINE {len(anns)} annotation(s) in {COL} · lastModified {lm}", flush=True)
    for nid, rec in anns.items():
        print(f'  {nid} "{rec["name"]}" :: {" | ".join(rec["labels"])}', flush=True)

LOG = os.path.join(os.environ.get("TMPDIR", "/tmp"), "figma-annotations-watch.log")


def offline(e):
    """Is this "no network" rather than "Figma refused"?

    The distinction is the difference between a watch loop that survives a
    closed lid and one that does not. A DNS failure, a refused connection or a
    timeout means this machine cannot reach the internet; an HTTPError means it
    reached Figma and Figma answered, which IS worth waking someone for.
    """
    if isinstance(e, urllib.error.HTTPError):
        return False
    return isinstance(e, (urllib.error.URLError, socket.gaierror, ConnectionError, TimeoutError, OSError))


def log(msg):
    try:
        with open(LOG, "a") as f:
            f.write(f"{time.strftime('%Y-%m-%d %H:%M:%S')} {msg}\n")
    except Exception:
        pass


fails = 0        # the API answered, and said something wrong
away = 0         # this machine has no network
while True:
    time.sleep(INTERVAL)
    try:
        lm = touched()
        if lm == prev["lastModified"]:
            fails = 0
            if away:
                log(f"back online after {away} missed poll(s)")
                away = 0
            continue
        lm, anns = read_annotations()
        fails = 0
        if away:
            log(f"back online after {away} missed poll(s)")
            away = 0
    except Exception as e:
        if offline(e):
            away += 1
            if away == 1:
                log(f"offline: {str(e)[:120]}")
            continue
        fails += 1
        # these arrive in ones and twos; only a run of them means something real
        if fails >= 3:
            print(f"ERROR figma annotation poll failed {fails}x: {str(e)[:120]}", flush=True)
        continue
    ev = diff(prev["annotations"], anns)
    if ev:
        print(f"ANNOTATION CHANGE · lastModified {lm}", flush=True)
        for e in ev:
            print("  " + e, flush=True)
    # a file edit that did not touch the notes is silence, by design
    prev = {"lastModified": lm, "annotations": anns}
    json.dump(prev, open(SNAP, "w"))
