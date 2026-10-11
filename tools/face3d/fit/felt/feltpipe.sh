#!/bin/zsh
# feltpipe.sh PARAMS.json NAME [REFINE_ROUNDS=3] : the clay pipeline (../pipeline.sh) run on the
# felt tile. Felt wears no props, so its rig is the clay build re-fitted, not noir's hat path:
# fitted params -> full model -> 2.5D warp -> projected UVs -> passes -> SH light -> albedo
# (raw + clean skin, margins, id map) -> GLB + fit json -> harness render -> browser
# refinement rounds -> pixel diff with the backdrop plate. Run from fit/ (the parent folder),
# where ref.webp, ref_parts*.npy, felt.png and felt-back.webp sit (felt/segfelt.py and
# felt/feltplates.py make them). H = the local harness with the felt rig wired in.
# TEX_ONLY=1 keeps NAME's geometry and passes and redoes the light and textures onwards.
set -e
# felt's beads and raised brows cast soft shadows wider than clay's: wider feature margins,
# and the clean skin under them diffused in rather than smeared from the nearest texel
export FIT_GROW=${FIT_GROW:-eye:11,brow:14,mouth:14} FIT_CLEAN_FILL=${FIT_CLEAN_FILL:-diffuse} FIT_K=${FIT_K:-skin:0}
F=${0:A:h:h}; cd $F
PARAMS=$1; N=$2; R=${3:-3}
B=/Applications/Blender.app/Contents/MacOS/Blender
H=${HARNESS:-$F/../harness}; PORT=${PORT:-58741}
mkdir -p $N
if [[ -z $TEX_ONLY ]]; then
cp build_fit/build_head.py $N/build_head.py
cp $PARAMS $N/fit_params.json
$B -b -P $N/build_head.py -- $F/$N 2>&1 | grep -E "WROTE|Error|Traceback" | head -3
$B -b $N/face.blend -P warp.py -- $N/fit_params.json ref_parts_full.npy $F/$N/face_warped.blend 7 2>&1 | grep -E "^WARP iter|Error|Traceback" | head -12
$B -b $N/face_warped.blend -P projuv.py -- $N/fit_params.json $F/$N/face_proj.blend 2>&1 | grep -E "PROJUV done|Error|Traceback" | head -3
$B -b $N/face_proj.blend -P render_passes2.py -- $N/fit_params.json $F/$N/passes 802 862 $F/$N/face_ao.blend 2>&1 | grep -E "PASSES|Error|Traceback" | head -3
fi
python3 lightfit.py $N/passes $N/light.json >/dev/null
rm -rf $N/tex; python3 albedo2.py $N/passes $N/light.json $N/tex
ship() {
  $B -b $N/face_ao.blend -P finalize.py -- $N/fit_params.json $N/light.json $N/tex $F/$N/final.glb $F/$N/fit.json 2>&1 | grep -E "Error|Traceback" | head -3
  cp $N/final.glb $H/public/faces/face-felt.glb; cp $N/fit.json $H/public/faces/fit-felt.json; cp $N/tex/idmap.png $H/public/faces/idmap-felt.png
  cp $N/tex/Skin_ratio_raw.png $H/public/faces/skin-raw-felt.png; cp $N/tex/margins.png $H/public/faces/margins-felt.png; cp felt-back.webp $H/public/faces/
  node felt/snapfelt.mjs $F/$N/site.png $PORT >/dev/null
}
ship
echo "before refine: $(python3 felt/feltdiff.py $N/site.png $N/site_diff.png)"
for i in $(seq 1 $R); do
  python3 refine.py $N
  ship
  echo "round $i: $(python3 felt/feltdiff.py $N/site.png $N/site_diff.png)"
done
