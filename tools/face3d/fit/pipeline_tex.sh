#!/bin/zsh
# pipeline_tex.sh NAME : from NAME/face_warped.blend: projected UVs -> passes -> light ->
# textures -> GLB -> two browser refinement rounds (the geometry steps are skipped)
set -e
F=${0:A:h}; cd $F
N=$1
B=/Applications/Blender.app/Contents/MacOS/Blender
$B -b $N/face_warped.blend -P projuv.py -- $N/fit_params.json $F/$N/face_proj.blend 2>&1 | grep -E "PROJUV done|Error|Traceback" | head -3
$B -b $N/face_proj.blend -P render_passes2.py -- $N/fit_params.json $F/$N/passes 802 862 $F/$N/face_ao.blend 2>&1 | grep -E "PASSES|Error|Traceback" | head -3
python3 lightfit.py $N/passes $N/light.json >/dev/null
rm -rf $N/tex; python3 albedo2.py $N/passes $N/light.json $N/tex
$B -b $N/face_ao.blend -P finalize.py -- $N/fit_params.json $N/light.json $N/tex $F/$N/final.glb $F/$N/fit.json 2>&1 | grep -E "Error|Traceback" | head -3
cp $N/final.glb ../harness/public/faces/face.glb; cp $N/fit.json ../harness/public/faces/fit.json; cp $N/tex/idmap.png ../harness/public/faces/idmap.png; cp $N/tex/Skin_ratio_raw.png ../harness/public/faces/skin-raw.png; cp $N/tex/margins.png ../harness/public/faces/margins.png
node snapfit.mjs $F/$N/site.png >/dev/null
echo "before refine: $(python3 pixdiff.py $N/site.png $N/site_diff.png)"
./refine.sh $N 2 | grep round
