import re, numpy as np
def parse(d):
    toks = re.findall(r'[MCLZmclz]|-?\d*\.?\d+(?:e-?\d+)?', d)
    subs=[]; cur=[]; i=0; cmd=None; pos=np.zeros(2)
    while i < len(toks):
        t=toks[i]
        if re.match(r'[A-Za-z]', t): cmd=t; i+=1
        if cmd in 'Zz':
            subs.append((cur,True)); cur=[]; cmd=None; continue
        if cmd=='M':
            p=np.array([float(toks[i]),float(toks[i+1])]); i+=2
            if cur: subs.append((cur,False))
            cur=[('M',[p])]; pos=p; cmd='L'
        elif cmd=='L':
            p=np.array([float(toks[i]),float(toks[i+1])]); i+=2; cur.append(('L',[pos,p])); pos=p
        elif cmd=='C':
            a=[float(x) for x in toks[i:i+6]]; i+=6
            c1,c2,p=np.array(a[0:2]),np.array(a[2:4]),np.array(a[4:6]); cur.append(('C',[pos,c1,c2,p])); pos=p
        else: raise ValueError(t)
    if cur: subs.append((cur,False))
    return subs
def flatten(d, n=40):
    """list of (Nx2 polyline, closed)"""
    out=[]
    for segs,closed in parse(d):
        pts=[]
        for kind,ps in segs:
            if kind=='M': pts.append(ps[0])
            elif kind=='L': pts.append(ps[1])
            else:
                p0,c1,c2,p3=ps; t=np.linspace(0,1,n+1)[1:,None]
                pts.extend(((1-t)**3*p0+3*(1-t)**2*t*c1+3*(1-t)*t**2*c2+t**3*p3))
        P=np.array(pts)
        if closed and np.linalg.norm(P[0]-P[-1])<1e-6: P=P[:-1]
        out.append((P,closed))
    return out
def resample(P, n, closed=False):
    Q=np.vstack([P,P[:1]]) if closed else P
    seg=np.linalg.norm(np.diff(Q,axis=0),axis=1); s=np.concatenate([[0],np.cumsum(seg)])
    L=s[-1]; ts=np.linspace(0,L,n,endpoint=not closed)
    return np.stack([np.interp(ts,s,Q[:,0]),np.interp(ts,s,Q[:,1])],1)
