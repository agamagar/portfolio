// The footer illustration (annotations mscy7c0y, msd7x0nd, msd8b2vc).
//
// This is Figma node 42:1592, VERBATIM. Not a derivation of it.
//
// The previous pass hand-built an outline by stripping fills off node 39:1952,
// because 39 exports as a solid silhouette and "outline only" was not something
// it could be made to export. That was the wrong node. 42:1592 is the outline
// the drawing was actually authored as, and it is not outline-everywhere: the
// hair, the thought bubble and the eyes are DELIBERATE solid fills, and the head
// is a compound path — an outer contour with an inner one — which is what gives
// it the hand-drawn ink look rather than a uniform traced edge. Outlining those
// three, as the derived version did, flattened exactly the parts that carry the
// drawing's character.
//
// The only edit to the node's own output is colour. It paints entirely in
// `white`, having been authored for the dark ground; every one of those is
// `currentColor` here, so the ink comes from the theme and one asset serves both
// grounds. The varying stroke widths (0.956 to 1.33) are the artwork's own and
// are left alone — they are what makes the line feel drawn rather than plotted.
export default function FootIllus({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 110 97"
      width="110"
      height="97"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M64.7851 51.8908V53.0602V55.8209L56.0077 70.0841C54.5821 72.4007 51.0587 71.7884 50.4984 69.1266L47.8088 56.3514V54.1717" stroke="currentColor" strokeWidth="1.30442" strokeLinecap="round" />
      <path d="M56.2967 6.48395C53.1136 2.7704 49.9306 0.648358 45.6865 3.8314C42.2917 6.37788 44.6261 10.9041 46.2176 12.8493C42.3981 15.82 46.0402 19.3921 48.3391 20.8069C44.5194 23.7778 40.3816 34.7776 38.7901 39.9059C37.0218 43.9732 36.8808 52.6379 50.4615 54.7599C64.0421 56.8818 67.3896 51.0832 69.8946 44.1948L72.212 30.3559L73.8033 29.2957H76.987C74.8649 19.216 74.8641 18.1543 70.0895 12.8493C66.388 8.73678 64.2541 11.2584 63.1931 13.3804C61.9553 12.3194 58.8431 9.4547 56.2967 6.48395ZM48.6026 22.9029C52.1309 19.3746 62.1409 18.7431 68.4649 22.898C70.8981 24.4967 71.3811 27.6599 70.8715 30.5264C69.924 35.8553 68.9659 42.5978 68.0161 45.4471C66.0487 51.3494 61.9763 53.588 54.8651 53.588C49.2291 53.5879 43.8152 51.6521 41.7141 49.8311C37.3429 46.0427 41.0667 37.9781 41.0879 37.9324C42.9666 32.9226 45.2075 26.2982 48.6026 22.9029Z" fill="currentColor" />
      <path d="M57.9965 44.5719C57.8197 45.9866 56.5111 48.4977 52.6915 47.2245" stroke="currentColor" strokeWidth="1.33452" strokeLinecap="round" />
      <path d="M109.348 95.0782L95.0239 59.5342C93.9629 56.3512 89.7189 50.4095 81.2308 52.1071L64.785 55.8207" stroke="currentColor" strokeWidth="1.30442" strokeLinecap="round" />
      <path d="M71.6815 30.3563C75.5718 28.7647 83.777 27.4915 85.4746 35.1308C87.5967 44.68 74.139 45.7863 69.8949 44.1948" stroke="currentColor" strokeWidth="1.20408" strokeLinecap="round" />
      <path d="M80.1696 34.6005C78.7549 34.4237 75.6073 34.8127 74.334 37.7836" stroke="currentColor" strokeWidth="1.20408" strokeLinecap="round" />
      <path d="M78.5784 75.9801L85.475 95.0783" stroke="currentColor" strokeWidth="1.30442" strokeLinecap="round" />
      <path d="M3.05609 95.9495L24.9985 59.7571C26.827 56.7411 30.484 51.3554 38.1639 53.9405L47.4894 57.172" stroke="currentColor" strokeWidth="1.30442" strokeLinecap="round" />
      <path d="M55.1005 29.3143C52.9327 31.4821 49.1662 36.3053 51.4424 38.2563" stroke="currentColor" strokeWidth="1.33452" strokeLinecap="round" />
      <path d="M65.3157 29.2954C65.1388 28.7649 64.4669 27.7039 63.1936 27.7039" stroke="currentColor" strokeWidth="0.95624" strokeLinecap="round" />
      <path d="M52.5833 23.9904C52.0528 23.6367 50.7796 23.1416 49.9308 23.9904" stroke="currentColor" strokeWidth="0.95624" strokeLinecap="round" />
      <circle cx="1.58613" cy="1.58613" r="1.58613" transform="matrix(-1.0034 0 0 1.0034 64.7851 30.3565)" fill="currentColor" />
      <circle cx="1.58613" cy="1.58613" r="1.58613" transform="matrix(-1.0034 0 0 1.0034 50.9917 26.1123)" fill="currentColor" />
      {/* the thought bubble (the solid fill at the top-left, 0..16 x 0..15 of the viewBox) is REMOVED: pin mtr6hepa "remove this chat bubble", 07 Sep 2026. It was the last path of node 42:1592; the rest is verbatim. */}
    </svg>
  );
}
