// The VR headset viewer's playlist (click the headset on the desk; vr/VrViewer.jsx).
//
// TO ADD A VIDEO: put the file in  public/vr/  (e.g. public/vr/trip.mp4, H.264 MP4
// or WebM) and add an entry below with  src: "/vr/trip.mp4".  Fields:
//   id        unique slug
//   title     the playlist label
//   note      one short line under it (optional)
//   src       the video URL. null + generated: "..." draws a built-in test pattern instead
//   mode      "360" | "180" | "flat": the projection it opens in (equirectangular for 360/180)
//   stereo    "mono" | "sbs" (left/right halves) | "tb" (top/bottom halves). sbs and tb are
//             shown as ONE eye (the left) unless the viewer's stereo toggle is off
//   poster    a still shown while the video loads (optional)
//   placeholder  true shows a PLACEHOLDER badge. Delete it once the real file is in
//
// No royalty-free 360 clip is bundled: none could be licence-checked offline, so the two
// first entries are generated test patterns (a lat/long grid with a moving marker).

export const vrVideos = [
  {
    id: "test-360",
    title: "Test pattern · 360°",
    note: "Generated grid, monoscopic. Front is the centre.",
    src: null,
    generated: "grid360",
    mode: "360",
    stereo: "mono",
    duration: 24,
    placeholder: true,
  },
  {
    id: "test-180-sbs",
    title: "Test pattern · 180° stereo",
    note: "Generated, side-by-side. Left eye shown as mono.",
    src: null,
    generated: "grid180sbs",
    mode: "180",
    stereo: "sbs",
    duration: 24,
    placeholder: true,
  },
  {
    id: "your-video",
    title: "Your 360° video",
    note: "PLACEHOLDER: drop a file at public/vr/your-video.mp4",
    src: "/vr/your-video.mp4",
    mode: "360",
    stereo: "mono",
    placeholder: true,
  },
];
