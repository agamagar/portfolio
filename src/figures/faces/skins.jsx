// Face skins: how each part of the rig (faceRig.js) is painted. A skin never moves a
// part; it only gives colours, filters and an optional backdrop. Face.jsx renders the
// same parts for every skin, so the bounce and the emotes come for free.
//
// Clay (2026-10-08, the first reference tile): soft modelling clay under a large key
// light from the upper left. The 3D comes from SVG lighting: each part's own alpha,
// blurred, is a height map (so every shape domes up from its edges), lit by a diffuse
// and a specular distant light, plus a faint fingerprint noise in the surface.

function ClayFilter({ id, surface = 9, gloss = 0.45, shine = 22, soft = 5, grain = 0.06 }) {
  return (
    <filter id={id} x="-15%" y="-15%" width="130%" height="130%" colorInterpolationFilters="sRGB">
      {/* height: the shape's own alpha, softened so it domes from the edge inward */}
      <feGaussianBlur in="SourceAlpha" stdDeviation={soft} result="h" />
      {/* fingerprints: a little fractal noise in the height */}
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" result="n" />
      <feColorMatrix in="n" type="matrix" values={`0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 ${grain} 0`} result="nA" />
      <feComposite in="h" in2="nA" operator="arithmetic" k2="1" k3="1" result="bump" />
      <feDiffuseLighting in="bump" surfaceScale={surface} diffuseConstant="1.08" lightingColor="#ffffff" result="diff">
        <feDistantLight azimuth="225" elevation="50" />
      </feDiffuseLighting>
      <feSpecularLighting in="bump" surfaceScale={surface} specularConstant={gloss} specularExponent={shine} lightingColor="#ffffff" result="spec">
        <feDistantLight azimuth="225" elevation="58" />
      </feSpecularLighting>
      {/* colour x light, then the sheen added on top, all kept inside the shape */}
      <feComposite in="SourceGraphic" in2="diff" operator="arithmetic" k1="1.12" result="lit" />
      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
      <feComposite in="lit" in2="specIn" operator="arithmetic" k2="1" k3="1" result="out" />
      <feComposite in="out" in2="SourceAlpha" operator="in" />
    </filter>
  );
}

export const SKINS = {
  clay: {
    id: "clay",
    label: "Clay",
    bg: "#e9e8e6",
    colors: {
      skin: "#fbd8c0",
      skinShade: "#e2b79b", // the ear's inner curl and the nose ridge
      blush: "#f0b6a6",
      hair: "#5b3122",
      eye: "#2b1a14",
      mouth: "#7a3b2e",
    },
    // stroke widths for the drawn features (a clay worm is thicker than an ink line)
    widths: { brow: 4.6, mouth: 3.6, nose: 10, curl: 4.2 },
    filters: { nose: "url(#face-clay-nose)", skin: "url(#face-clay-skin)", hair: "url(#face-clay-hair)", feature: "url(#face-clay-feature)" },
    shadow: { color: "rgba(60,40,30,0.28)", blur: 5 },
    defs: (
      <>
        <ClayFilter id="face-clay-skin" surface={16} gloss={0.28} shine={16} soft={13} grain={0.007} />
        <ClayFilter id="face-clay-hair" surface={13} gloss={0.7} shine={24} soft={6} grain={0.012} />
        <ClayFilter id="face-clay-feature" surface={5} gloss={0.5} shine={30} soft={1.4} grain={0} />
        <ClayFilter id="face-clay-nose" surface={9} gloss={0.3} shine={18} soft={3.2} grain={0.004} />
      </>
    ),
  },
};

export const SKIN_ORDER = Object.keys(SKINS);
