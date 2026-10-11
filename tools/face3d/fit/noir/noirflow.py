# Optical flow between two part maps: where does each feature of OURS sit in REF?
#   python3 flow.py OURS_IDS.npy REF_IDS.npy OUT_FLOW.npy
# Each part map becomes a smooth multi-channel image (one blurred channel per part), and
# TV-L1 flow is run per channel and averaged, weighted by where each part has an edge.
import sys
import numpy as np
from scipy import ndimage as nd
from skimage.registration import optical_flow_tvl1

ours, ref = np.load(sys.argv[1]), np.load(sys.argv[2])
# the coat covers these pixels: there the reference agrees with whatever we draw
ref = ref.copy(); ref[ref == 6] = ours[ref == 6]
H, W = ours.shape
acc = np.zeros((2, H, W)); wsum = np.zeros((H, W)) + 1e-6
for lab, weight in ((0, 3.0), (5, 2.0), (2, 1.5), (3, 1.0), (4, 1.0), (1, 1.0)):
    a = nd.gaussian_filter((ours == lab).astype(float), 3)
    b = nd.gaussian_filter((ref == lab).astype(float), 3)
    if a.sum() < 10 or b.sum() < 10:
        continue
    # flow v with ref(x + v) ~ ours(x): the feature at x in ours sits at x + v in ref
    v = optical_flow_tvl1(a, b, attachment=30, tightness=0.3, num_warp=8, num_iter=20)
    w = weight * (np.hypot(*np.gradient(a)) + np.hypot(*np.gradient(b)) + 1e-3)
    acc += v * w; wsum += w
flow = acc / wsum
# smooth so neighbouring vertices move together (no tearing), then save
SM = float(sys.argv[4]) if len(sys.argv) > 4 else 4.0
flow = np.stack([nd.gaussian_filter(flow[0], SM), nd.gaussian_filter(flow[1], SM)])
np.save(sys.argv[3], flow.astype(np.float32))
print("flow max px", float(np.abs(flow).max()))
