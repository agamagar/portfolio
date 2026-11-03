// THE laptop frame for the site, the counterpart of PhoneFrame: a lid with a rounded screen and a base,
// sized by its container. Children fill the screen box (an image, a video or an iframe).
//   <LaptopFrame><img src="/figures/x.webp" alt="" /></LaptopFrame>
import "./laptopFrame.css";

export default function LaptopFrame({ className = "", children, ...rest }) {
  return (
    <figure className={"lf " + className} {...rest}>
      <div className="lf__lid"><div className="lf__screen">{children}</div></div>
      <div className="lf__base" aria-hidden="true" />
    </figure>
  );
}
export { LaptopFrame };
