#!/bin/zsh
# noirpipe.sh FIT.json NAME : fitted camera + hat -> noir head -> warp -> UVs -> passes ->
# light -> albedo -> GLB + fit-noir.json. Everything on local disk.
set -e
F=${0:A:h}; cd $F
FIT=$1; N=$2; IT=${3:-7}
B=/Applications/Blender.app/Contents/MacOS/Blender
mkdir -p $N
$B -b base/face.blend -P noirbuild.py -- $FIT $F/$N/face.blend $F/$N/fit_params.json 2>&1 | grep -E "NOIRBUILD|Error|Traceback" | head -3
$B -b $N/face.blend -P noirwarp.py -- $N/fit_params.json ref_parts_full.npy $F/$N/face_warped.blend $IT 2>&1 | grep -E "^WARP iter|Error|Traceback" | head -12
$B -b $N/face_warped.blend -P noirtrim.py -- $N/fit_params.json trim_keep.npy $F/$N/face_trim.blend 2>&1 | grep -E "TRIM|Error|Traceback" | head -3
$B -b $N/face_trim.blend -P noirprojuv.py -- $N/fit_params.json $F/$N/face_proj.blend 2>&1 | grep -E "PROJUV|Error|Traceback" | head -12
$B -b $N/face_proj.blend -P noirpasses.py -- $N/fit_params.json $F/$N/passes 802 862 $F/$N/face_ao.blend 2>&1 | grep -E "PASSES|Error|Traceback" | head -3
python3 noirlight.py $N/passes $N/light.json
python3 noiralbedo.py $N/passes $N/light.json $N/tex
$B -b $N/face_ao.blend -P noirfinal.py -- $N/fit_params.json $N/light.json $N/tex $F/$N/final.glb $F/$N/fit.json 2>&1 | grep -E "FINAL|Error|Traceback" | head -3
