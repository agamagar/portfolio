#!/bin/zsh
# pack.sh IN.glb OUT.glb : meshopt-compress a fitted rig for the site (EXT_meshopt_compression +
# KHR_mesh_quantization at 16-bit positions and UVs, 12-bit normals and AO). FaceSV's loader
# decodes it; measured on the noir rig, the site render is pixel-identical and the file 2.9x
# smaller. NOT for face.glb or face-noir.glb: the hero's morph (faceRig3D) reads raw object-space
# positions (its ear split), which quantization rescales.
set -e
npx --yes @gltf-transform/cli@4.1.1 meshopt $1 $2 --level medium --quantize-position 16 --quantize-texcoord 16 \
  --quantize-normal 12 --quantize-color 12 --quantize-generic 16
