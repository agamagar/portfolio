#!/bin/zsh
# refine.sh NAME ROUNDS : site render -> per-pixel correction into the textures -> GLB, repeated
set -e
F=${0:A:h}; cd $F
N=$1; R=${2:-3}
B=/Applications/Blender.app/Contents/MacOS/Blender
H=$F/../harness
for i in $(seq 1 $R); do
  python3 refine.py $N
  $B -b $N/face_ao.blend -P finalize.py -- $N/fit_params.json $N/light.json $N/tex $F/$N/final.glb $F/$N/fit.json 2>&1 | grep -E "Error|Traceback" | head -3
  cp $N/final.glb $H/public/faces/face.glb; cp $N/fit.json $H/public/faces/fit.json; cp $N/tex/idmap.png $H/public/faces/idmap.png; cp $N/tex/Skin_ratio_raw.png $H/public/faces/skin-raw.png; cp $N/tex/margins.png $H/public/faces/margins.png
  node snapfit.mjs $F/$N/site.png >/dev/null
  echo "round $i: $(python3 pixdiff.py $N/site.png $N/site_diff.png)"
done
