#!/bin/zsh
# pipeline.sh PARAMS.json NAME : fitted params -> full model -> warp -> passes -> light ->
# albedo -> GLB + fit.json -> harness render -> pixel diff. Everything on local disk.
set -e
F=${0:A:h}; cd $F
PARAMS=$1; N=$2
B=/Applications/Blender.app/Contents/MacOS/Blender
mkdir -p $N
cp build_fit/build_head.py $N/build_head.py
cp $PARAMS $N/fit_params.json
$B -b -P $N/build_head.py -- $F/$N 2>&1 | grep -E "WROTE|Error|Traceback" | head -3
$B -b $N/face.blend -P warp.py -- $N/fit_params.json ref_parts_full.npy $F/$N/face_warped.blend 7 2>&1 | grep -E "^WARP iter4|Error|Traceback" | head -3
$B -b $N/face_warped.blend -P projuv.py -- $N/fit_params.json $F/$N/face_proj.blend 2>&1 | grep -E "PROJUV|Error|Traceback" | head -3
$B -b $N/face_proj.blend -P render_passes2.py -- $N/fit_params.json $F/$N/passes 802 862 $F/$N/face_ao.blend 2>&1 | grep -E "PASSES|Error|Traceback" | head -3
python3 lightfit.py $N/passes $N/light.json
python3 albedo2.py $N/passes $N/light.json $N/tex
$B -b $N/face_ao.blend -P finalize.py -- $N/fit_params.json $N/light.json $N/tex $F/$N/final.glb $F/$N/fit.json 2>&1 | grep -E "FINAL|Error|Traceback" | head -3
H=$F/../harness
cp $N/final.glb $H/public/faces/face.glb; cp $N/fit.json $H/public/faces/fit.json; cp $N/tex/idmap.png $H/public/faces/idmap.png; cp $N/tex/Skin_ratio_raw.png $H/public/faces/skin-raw.png; cp $N/tex/margins.png $H/public/faces/margins.png
node snapfit.mjs $F/$N/site.png >/dev/null
python3 pixdiff.py $N/site.png $N/site_diff.png
