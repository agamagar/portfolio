// Where people use Stella: four scenes from Figma 1864:4038 (the kitchen one is the hero). 2x JPEGs, lazy via Img.
// Two by two at every width (dasshPlaces.css); the case data's caption ties the scenes to the numbers the rules set.
import { useEffect, useRef, useState } from "react";
import Img from "../../ui/Img";
import "./dasshPlaces.css";

const PLACES = [
  { src: "place-sofa.jpg", label: "On the sofa", alt: "A person in a teal polo reading their phone on a grey sofa at home, a tabby cat asleep beside them" },
  { src: "place-office.jpg", label: "At the office", alt: "A person in a black turtleneck reading their phone in a sunlit office, holding a takeaway coffee and a coat" },
  { src: "place-cafe.jpg", label: "At a café", alt: "A person in a mustard corduroy shirt using their phone at a café window counter, a closed laptop and a sandwich beside them" },
  { src: "place-dorm.jpg", label: "In a dorm", alt: "A person sitting on a dorm room floor against the bed, smiling at their phone, a laptop open behind them" },
];

// The figures above mount late, so this strip first lands about 2,500 px down, inside Chrome's lazy-load range, and
// loading="lazy" alone fetches all four on page load. Hold the images until the strip is really close.
export default function DasshPlaces() {
  const ref = useRef(null);
  const [near, setNear] = useState(false);
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setNear(true); io.disconnect(); }
    }, { rootMargin: "500px 0px" });
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);
  return (
    <ul className="dsh-places" ref={ref}>
      {PLACES.map((p) => (
        <li key={p.src}>
          {near
            ? <Img className="article__figure-img--real" src={"/figures/dassh/" + p.src} alt={p.alt} width={1636} height={1190} />
            : <div className="article__figure-img--real dsh-places__hold" />}
          <span>{p.label}</span>
        </li>
      ))}
    </ul>
  );
}
