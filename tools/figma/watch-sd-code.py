#!/usr/bin/env python3
"""Code-side watcher for the Scheduled Delivery case (the reverse bridge).
Polls src/App.jsx, extracts the SD case (header fields + sections: heading,
nav, tldr, serif, figures, scenes, plates, flags) and prints one line per
structural change so the session can mirror it into the Figma column.
Run: python3 tools/figma/watch-sd-code.py [interval-seconds]
"""
import json, os, re, sys, time, hashlib
SRC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "..", "src", "App.jsx")
SNAP = os.path.join(os.environ.get("TMPDIR", "/tmp"), "sd-code-watch.json")
INTERVAL = int(sys.argv[1]) if len(sys.argv) > 1 else 20
def extract():
    s = open(SRC, encoding="utf-8").read()
    i = s.find('"scheduled-delivery": {'); k = s.find("sections: [", i)
    head = s[i:k]
    g4 = lambda key, src: (re.search(r'\n\s{4}' + key + r':\s*\n?\s*"((?:[^"\\]|\\.)*)"', src) or [None, None])[1]
    facts = [list(m) for m in re.findall(r'\{ label: "([^"]+)", value: "([^"]+)" \}', head)]  # lists, so a reloaded snapshot compares equal
    case = {"title": g4("title", head), "lead": (g4("lead", head) or "")[:400], "eyebrow": g4("eyebrow", head), "meta": g4("meta", head),
            "facts": facts, "heroFirst": "heroFirst: true" in head, "heroToggleHidden": "heroToggleHidden: true" in head}
    depth = 0; j = k + len("sections: ["); start = j
    while True:
        c = s[j]
        if c in "[{(": depth += 1
        elif c in "]})":
            if depth == 0: break
            depth -= 1
        j += 1
    arr = s[start:j]; objs = []; depth = 0; cur = None
    for p, c in enumerate(arr):
        if c == "{":
            if depth == 0: cur = p
            depth += 1
        elif c == "}":
            depth -= 1
            if depth == 0 and cur is not None: objs.append(arr[cur:p + 1]); cur = None
    secs = []
    for o in objs:
        g = lambda key: (re.search(r'\n\s{8}' + key + r':\s*\n?\s*"((?:[^"\\]|\\.)*)"', o) or [None, None])[1]
        figs = re.findall(r'\bfig: "(\w+)"', o)
        key = g("h") or ("breaker:" + figs[0] if "breaker" in o and figs else "untitled")
        body = re.findall(r'\n\s{10}"((?:[^"\\]|\\.)*)",', o)
        secs.append({"key": key, "nav": g("nav"), "group": g("group"), "tldr": g("tldr"), "serif": g("serif"), "figs": figs,
                     "scenes": o.count("scene: {"), "plates": o.count("embed:") + o.count("fig:") if "plates:" in o else 0,
                     "noHeading": "noHeading: true" in o, "bodyHash": hashlib.md5("\n".join(body).encode()).hexdigest()[:8], "paras": len(body)})
    return {"case": case, "sections": secs}
def diff(a, b):
    ev = []
    if a["case"] != b["case"]:
        for f in b["case"]:
            if a["case"].get(f) != b["case"].get(f): ev.append(f"HEADER {f} changed: {json.dumps(b['case'].get(f))[:160]}")
    ao = [x["key"] for x in a["sections"]]; bo = [x["key"] for x in b["sections"]]
    A = {x["key"]: x for x in a["sections"]}; B = {x["key"]: x for x in b["sections"]}
    for kk in bo:
        if kk not in A: ev.append(f"NEW section {kk!r} at position {bo.index(kk)+1} · figs {B[kk]['figs']} scenes {B[kk]['scenes']} · tldr: {(B[kk]['tldr'] or '')[:80]!r}")
    for kk in ao:
        if kk not in B: ev.append(f"REMOVED section {kk!r}")
    common = [x for x in bo if x in A]
    if [x for x in ao if x in B] != common: ev.append("ORDER changed: " + " > ".join(common))
    for kk in common:
        for f in ("tldr", "serif", "figs", "scenes", "plates", "noHeading", "nav"):
            if A[kk].get(f) != B[kk].get(f): ev.append(f"EDITED {kk!r} · {f}: {json.dumps(B[kk].get(f))[:140]}")
        if A[kk]["bodyHash"] != B[kk]["bodyHash"]: ev.append(f"EDITED {kk!r} · body copy ({A[kk]['paras']}->{B[kk]['paras']} strings)")
    return ev
prev = None
if os.path.exists(SNAP):
    try: prev = json.load(open(SNAP))
    except Exception: prev = None
if prev is None:
    prev = extract(); json.dump(prev, open(SNAP, "w")); print(f"BASELINE {len(prev['sections'])} sections · title {prev['case']['title']!r}", flush=True)
last_m = os.path.getmtime(SRC)
while True:
    time.sleep(INTERVAL)
    try:
        m = os.path.getmtime(SRC)
        if m == last_m: continue
        last_m = m; time.sleep(2)
        cur = extract()
    except Exception as e:
        print(f"ERROR extract failed: {str(e)[:120]}", flush=True); continue
    if not cur["sections"] or len(cur["sections"]) < max(3, len(prev["sections"]) // 2):
        print("SKIP transient parse (file mid-edit)", flush=True); continue  # do not snapshot a half-written file
    ev = diff(prev, cur)
    if ev:
        print("CHANGE in src/App.jsx (scheduled-delivery)", flush=True)
        for e in ev: print("  " + e, flush=True)
    prev = cur; json.dump(prev, open(SNAP, "w"))
