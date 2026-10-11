import sys, json, numpy as np
sys.path.insert(0, sys.argv[1])
from svgpath import flatten, resample
from PIL import Image
from skimage.draw import polygon as rpoly
from skimage.morphology import skeletonize
D=sys.argv[1]
ID=np.array(Image.open(D+'/../morph/public/faces/idmap.png')).astype(int)
H,W=ID.shape
OUTER="M125.426 42.7851C135.636 33.8373 145.219 29.2627 155.624 39.6821C163.949 48.0178 155.75 59.536 150.61 64.253C159.933 73.9221 148.516 82.2995 141.641 85.28C150.965 94.9491 157.996 126.803 160.346 141.521C163.601 153.394 160.572 177.258 122.42 177.732C84.2672 178.206 78.8193 160.954 74.6535 141.039L72.2808 102.102L68.3271 98.5594L59.5808 97.304C69.3867 70.446 69.8054 67.5308 85.0162 54.8377C96.8093 44.9967 101.678 52.7655 103.756 59.0145C107.576 56.5872 117.258 49.9434 125.426 42.7851Z"
FACE="M140.089 90.9303C130.102 77.5953 94.1593 72.0804 76.6537 90.395C78.0322 104.974 77.3627 134.399 79.322 145.217C82.4 162.21 92.174 170.102 110.781 172.773C126.266 174.996 141.905 171.81 148.396 167.636C161.939 158.926 154.81 135.19 154.81 135.19C151.623 120.683 148.079 101.598 140.089 90.9303Z"
EAR="M74.249 101.967C72.0171 98.7623 53.4737 92.1789 53.7708 110.278C54.0417 126.786 65.3549 132.68 75.7351 131.203"
def mask_poly(P):
    m=np.zeros((H,W),bool); rr,cc=rpoly(P[:,1],P[:,0],(H,W)); m[rr,cc]=True; return m
def ends(m):
    ys,xs=np.nonzero(m); P=np.stack([xs,ys],1).astype(float); c=P.mean(0)
    u,s,vt=np.linalg.svd(P-c,full_matrices=False); ax=vt[0]; t=(P-c)@ax
    a=c+ax*np.percentile(t,1); b=c+ax*np.percentile(t,99)
    return sorted([a,b],key=lambda p:p[0])
cen=lambda m: np.argwhere(m)[:,::-1].mean(0)
src=[]; dst=[]; wts=[]
def add(a,b,w=1): src.append(a); dst.append(b); wts.append(w)
add([96.4317,110.035],cen(ID==5),3); add([136.002,103.812],cen(ID==7),3)
bl=ends(ID==9); add([91.6487,101.911],bl[0]); add([98.1069,98.375],bl[1])
br=ends(ID==11); add([128.722,92.3541],br[0]); add([136.011,93.4003],br[1])
mo=ends(ID==13); add([106.128,144.009],mo[0],2); add([119.659,153.389],mo[1],2)
src=np.array(src,float); dst=np.array(dst,float); w=np.array(wts,float)
def simfit(src,dst,w):
    ws=w/w.sum(); ms=(src*ws[:,None]).sum(0); md=(dst*ws[:,None]).sum(0)
    A=(src-ms); B=(dst-md)
    a=(ws*(A[:,0]*B[:,0]+A[:,1]*B[:,1])).sum(); b=(ws*(A[:,0]*B[:,1]-A[:,1]*B[:,0])).sum()
    n=(ws*(A**2).sum(1)).sum(); s=np.hypot(a,b)/n; th=np.arctan2(b,a)
    R=s*np.array([[np.cos(th),-np.sin(th)],[np.sin(th),np.cos(th)]])
    t=md-R@ms; return R,t,s,th
R,t,s,th=simfit(src,dst,w)
T=lambda P: P@R.T+t
print('scale',s,'rot deg',np.degrees(th),'t',t)
print('feature residuals px', np.round(np.linalg.norm(T(src)-dst,axis=1),1))
head3=ID>0
outer=flatten(OUTER)[0][0]; face=flatten(FACE)[0][0]; ear=flatten(EAR)[0][0]
earpoly=np.vstack([ear,[[77.5,101]]])
head2=mask_poly(T(outer))|mask_poly(T(earpoly))
iou=(head2&head3).sum()/(head2|head3).sum(); print('head silhouette IoU',round(iou,4))
hair3=(ID==3)|(ID==4); 
hair2=mask_poly(T(outer))&np.logical_not(mask_poly(T(face)))
print('ink-region vs 3D hair IoU',round((hair2&hair3).sum()/(hair2|hair3).sum(),4))
for k,i in [('eyeL',5),('eyeR',7)]:
    pass
json.dump({'R':R.tolist(),'t':t.tolist(),'s':s,'th':th},open(D+'/align.json','w'))
# overlay
ref=np.array(Image.open(D+'/../ref.png')).astype(float)
ov=ref*0.55+255*0.45
ov[head2&np.logical_not(head3)]=[255,60,60]; ov[head3&np.logical_not(head2)]=[60,120,255]
ov[hair2]=ov[hair2]*0.5
for P,_ in flatten(OUTER)+flatten(FACE)+flatten(EAR):
    Q=resample(T(P),2000); q=np.round(Q).astype(int); ok=(q[:,0]>=0)&(q[:,0]<W)&(q[:,1]>=0)&(q[:,1]<H); ov[q[ok,1],q[ok,0]]=[0,0,0]
Image.fromarray(ov.clip(0,255).astype(np.uint8)).save(D+'/align.png')
