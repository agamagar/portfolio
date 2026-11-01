// THE <img> for figure images (stack-audit pick 2, 25 Oct). One place for what every figure image needs:
//   - width and height from the image's own size (imgDims.json, written by tools/figure-images.py dims), so the page
//     reserves its space before it loads and nothing below it jumps. img.css keeps the ratio when CSS sets a width;
//   - lazy below the fold by default; `priority` for the hero (eager, fetchpriority high); `eager` for layers that
//     crossfade or animate in, which must already be decoded when they show;
//   - the WebP copy, where tools/figure-images.py webp made one that passed its no-visible-loss check (imgWebp.json).
// Every other prop goes to the <img> as is, and an explicit width, height, loading or decoding wins.
import "./img.css";
import DIMS from "./imgDims.json";

// optional: the conversion commit adds imgWebp.json; without it, every image keeps its original file
const WEBP = Object.values(import.meta.glob("./imgWebp.json", { eager: true, import: "default" }))[0] || {};

const key = (src) => (typeof src === "string" ? src.split(/[?#]/)[0] : "");

// the file to load: the WebP copy when there is one (a query string, such as a cache-buster, is kept)
export function imgSrc(src) {
  return WEBP[key(src)] ? src.replace(/\.(png|jpe?g)(?=[?#]|$)/i, ".webp") : src;
}

export default function Img({ src, priority = false, eager = false, className, ...rest }) {
  const d = DIMS[key(src)];
  return (
    <img
      src={imgSrc(src)}
      width={d?.[0]}
      height={d?.[1]}
      loading={priority || eager ? "eager" : "lazy"}
      decoding={priority ? undefined : "async"}
      {...(priority ? { fetchpriority: "high" } : null)}
      className={className ? `fimg ${className}` : "fimg"}
      {...rest}
    />
  );
}
