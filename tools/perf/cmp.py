import json,sys
a=json.load(open(sys.argv[1]))['scenarios']; b=json.load(open(sys.argv[2]))['scenarios']
rows=[('load','fcp'),('load','lcp'),('load','tbt'),('load','jsKB'),('load','cssKB'),('load','totalKB'),('load','requests'),('scrollDown','p95'),('scrollDown','over16_7'),('scrollDown','longTaskMs'),('memBack','jsHeapMB'),('memStart','domNodes')]
for k in b:
    if k not in a: continue
    print(k)
    for s,m in rows:
        x=a[k].get(s,{}).get(m); y=b[k].get(s,{}).get(m)
        if x is not None and y is not None: print(f'  {s}.{m}: {x} -> {y}')
