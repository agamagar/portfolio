// The one iPhone frame for the whole site: the "Bezel" component from Figma
// Portfolio 2026 (node 492-48278, iPhone 17 Pro Silver, exported at 3x to
// /figures/frames/iphone-17-pro.png). The screen cutout was measured off the
// export's alpha: left 5.38%, top 2.59%, 89.25% wide, 94.90% tall of the
// bezel box. Drop a screenshot in with `screen`, or any React node as children.
//
//   <IphoneFrame screen="/figures/x.png" alt="..." width={260} />
//   <IphoneFrame width={300}><LiveScreen /></IphoneFrame>
//
// For an element that already has the screen's proportions (a 360x780 plate),
// the CSS utility `.ibz` paints the same bezel around it as an ::after.
export const IPHONE_FRAME_SRC = "/figures/frames/iphone-17-pro.png";

export default function IphoneFrame({ screen, alt = "", width, className = "", style, children, ...rest }) {
  return (
    <div className={"ifr " + className} style={{ width, ...style }} {...rest}>
      <div className="ifr__screen">
        {screen ? <img className="ifr__img" src={screen} alt={alt} loading="lazy" draggable="false" /> : children}
      </div>
      <img className="ifr__bezel" src={IPHONE_FRAME_SRC} alt="" draggable="false" aria-hidden="true" />
    </div>
  );
}
