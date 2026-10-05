#!/usr/bin/env python3
"""Layout watcher for the Scheduled Delivery Figma page (Portfolio 2026, column 315:29324).
Polls the Figma REST API, keeps a snapshot of the column (frame order, names,
visibility, per-frame text hash, header frame 559:7888 text + type), and prints
one line per change so the session can build or move site sections to match.
Run: python3 tools/figma/watch-sd-page.py [interval-seconds]
"""
import json, os, sys, time, hashlib, subprocess, urllib.request
FILE = "dUwMRorsFMXh9G6wlHOh5B"; COL = "315:29324"; HEAD = "559:7888"
SNAP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "figma-sd-watch.json")
INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 180
PAT = subprocess.run(["security", "find-generic-password", "-s", "figma-pat", "-w"], capture_output=True, text=True).stdout.strip()
def get(ids, depth=None):
    url = f"https://api.figma.com/v1/files/{FILE}/nodes?ids={ids}" + (f"&depth={depth}" if depth else "")
    req = urllib.request.Request(url, headers={"X-Figma-Token": PAT})
    with urllib.request.urlopen(req, timeout=150) as r: return json.load(r)  # 60 -> 150 (2026-09-08): Figma stalls past 60s several times an hour today
def texts(n, out):
    if n.get("type") == "TEXT":
        st = n.get("style", {}); out.append(f"{n.get('characters','')}|{st.get('fontFamily')}|{st.get('fontSize')}|{st.get('fontWeight')}")
    for c in n.get("children", []): texts(c, out)
def snapshot():
    d = get(COL + "," + HEAD)
    col = d["nodes"][COL]["document"]; head = d["nodes"][HEAD]["document"]
    frames = []
    for c in col["children"]:
        t = []; texts(c, t); bb = c.get("absoluteBoundingBox") or {}
        frames.append({"id": c["id"], "name": c["name"], "visible": c.get("visible", True), "h": int(bb.get("height", 0)),
                       "hash": hashlib.md5("\n".join(t).encode()).hexdigest()[:10], "n": len(t), "first": (t[0].split("|")[0][:50] if t else "")})
    ht = []; texts(head, ht)
    return {"lastModified": d.get("lastModified"), "frames": frames, "head": hashlib.md5("\n".join(ht).encode()).hexdigest()[:10], "headTexts": ht[:8]}
def diff(a, b):
    ev = []
    ao = [f["id"] for f in a["frames"]]; bo = [f["id"] for f in b["frames"]]
    A = {f["id"]: f for f in a["frames"]}; B = {f["id"]: f for f in b["frames"]}
    for fid in bo:
        if fid not in A: ev.append(f"NEW frame {fid} '{B[fid]['name']}' at position {bo.index(fid)+1} · first text: {B[fid]['first']!r}")
    for fid in ao:
        if fid not in B: ev.append(f"REMOVED frame {fid} '{A[fid]['name']}'")
    common = [f for f in bo if f in A]
    if [f for f in ao if f in B] != common: ev.append("ORDER changed: " + " > ".join(f"{B[f]['name']}" for f in common))
    for fid in common:
        if A[fid]["hash"] != B[fid]["hash"]: ev.append(f"EDITED frame {fid} '{B[fid]['name']}' text/type changed ({A[fid]['n']}->{B[fid]['n']} texts) · first: {B[fid]['first']!r}")
        if A[fid]["visible"] != B[fid]["visible"]: ev.append(f"VISIBILITY frame {fid} '{B[fid]['name']}' -> {B[fid]['visible']}")
        if abs(A[fid]["h"] - B[fid]["h"]) > 2: ev.append(f"RESIZED frame {fid} '{B[fid]['name']}' {A[fid]['h']} -> {B[fid]['h']}")
    if a["head"] != b["head"]: ev.append("HEADER frame 559:7888 changed: " + " || ".join(b["headTexts"])[:300])
    return ev
prev = None
if os.path.exists(SNAP):
    try: prev = json.load(open(SNAP))
    except Exception: prev = None
if prev is None:
    prev = snapshot(); json.dump(prev, open(SNAP, "w")); print(f"BASELINE {len(prev['frames'])} frames · lastModified {prev['lastModified']}", flush=True)
# 09 Sep 2026: the full snapshot walks every TEXT node under two subtrees, which
# is a big response to pull every three minutes over a phone hotspot, and it was
# timing out or losing DNS several times an hour. `lastModified` is a FILE-level
# field, so depth=1 returns it for a fraction of the bytes: the cheap call is the
# poll, and the expensive one only runs on a file that actually changed. A single
# failure is also no longer worth a line, since these come in ones and twos and
# the next tick fixes them; three in a row means something real.
def touched():
    return get(COL, depth=1).get("lastModified")
fails = 0
while True:
    time.sleep(INTERVAL)
    try:
        lm = touched()
        if lm == prev["lastModified"]:
            fails = 0; continue
        cur = snapshot()
        fails = 0
    except Exception as e:
        fails += 1
        if fails >= 3: print(f"ERROR poll failed {fails}x: {str(e)[:120]}", flush=True)
        continue
    if cur["lastModified"] == prev["lastModified"]: continue
    ev = diff(prev, cur)
    if ev:
        print(f"CHANGE lastModified {cur['lastModified']}", flush=True)
        for e in ev: print("  " + e, flush=True)
    prev = cur; json.dump(prev, open(SNAP, "w"))
