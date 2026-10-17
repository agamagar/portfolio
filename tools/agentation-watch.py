# Agentation watcher: prints one line per new annotation (polls localhost:4747/pending every 10 s). Run: python3 -u tools/agentation-watch.py
import json, time, urllib.request
URL = "http://localhost:4747/pending"
def get():
    with urllib.request.urlopen(URL, timeout=8) as r:
        return json.load(r).get("annotations", [])
seen = {a["id"] for a in get()}
fails = 0
while True:
    time.sleep(10)
    try:
        for a in get():
            if a["id"] not in seen:
                seen.add(a["id"])
                el = (a.get("element") or "")[-120:]
                print(f'NEW {a["id"]} | {a.get("url","")} | {a.get("comment","")} | {el}', flush=True)
        fails = 0
    except Exception as e:
        fails += 1
        if fails in (3, 30): print(f"WARN agentation :4747 unreachable: {e}", flush=True)
