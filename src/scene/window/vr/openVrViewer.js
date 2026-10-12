// Opens the VR viewer over the room: the camera dollies to the headset, then the
// overlay fades in; closing reverses both. This module and VrViewer are one lazy chunk
// (useWindowScene imports it on the first click on the headset).
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import VrViewer from "./VrViewer.jsx";
import "./vrViewer.css";

let open = false;

export function openVrViewer({ engine, reduced }) {
  if (open) return Promise.resolve();
  open = true;
  const host = document.createElement("div");
  host.className = "vrv-host";
  document.body.appendChild(host);
  const root = createRoot(host);
  const prevFocus = document.activeElement;
  // reduced motion: no camera move, only the overlay's fade
  if (!reduced) engine.focusVr(true);
  return new Promise((resolve) => {
    const done = () => {
      root.unmount();
      host.remove();
      open = false;
      if (prevFocus && prevFocus.isConnected) prevFocus.focus?.({ preventScroll: true });
      resolve();
    };
    const onClose = () => {
      if (!reduced) engine.focusVr(false);
      // the overlay has faded by now; the camera finishes its way back on its own
      done();
    };
    root.render(createElement(VrViewer, { reduced, onClose, delay: reduced ? 0 : 520 }));
  });
}
