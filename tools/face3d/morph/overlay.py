import sys, json, numpy as np
sys.path.insert(0, sys.argv[1]); D=sys.argv[1]
from svgpath import flatten, resample
from PIL import Image, ImageDraw
s,th,tx,ty=[float(v) for v in sys.argv[3:7]]
R=s*np.array([[np.cos(th),-np.sin(th)],[np.sin(th),np.cos(th)]]); T=lambda P:P@R.T+[tx,ty]
sh=Image.open(D+'/'+sys.argv[2]+'_shaded.png').convert('RGBA')
bg=Image.new('RGBA',sh.size,(235,235,235,255)); bg.alpha_composite(sh)
im=bg.convert('RGB'); dr=ImageDraw.Draw(im,'RGBA')
exec(open(D+'/../morph/src/drawing.js').read().split('export const OUTER =')[0]) if False else None
src=open(D+'/../morph/src/drawing.js').read()
import re
paths=dict(re.findall(r'(\w+): "(M[^"]+)"',src)); paths['OUTER']=re.search(r'OUTER =\s*"([^"]+)"',src).group(1); paths['FACE']=re.search(r'FACE =\s*"([^"]+)"',src).group(1)
for k,d in paths.items():
    for P,cl in flatten(d):
        Q=T(P); pts=[tuple(p) for p in Q]+([tuple(Q[0])] if cl else [])
        dr.line(pts,fill=(220,0,90,230),width=3)
for c in [(96.4317,110.035),(136.002,103.812)]:
    x,y=T(np.array([c]))[0]; r=4.41774*s; dr.ellipse([x-r,y-r,x+r,y+r],outline=(220,0,90,230),width=3)
im.save(D+'/'+sys.argv[2]+'_overlay.png')
