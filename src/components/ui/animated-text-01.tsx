import type { CSSProperties, ElementType, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * AnimatedShinyText
 *
 * A light sweep that travels across the glyphs. The mechanism is a gradient
 * clipped to the text (`background-clip: text`) whose background-position is
 * animated; the text's own colour sits underneath at partial strength, so the
 * brighter band of the gradient reads as a shine passing over it.
 *
 * Two deviations from the registry version, both deliberate:
 *
 *  - `as` defaults to `span`, not `p`, and there is no `mx-auto max-w-md`. This
 *    has to be usable INSIDE a sentence, and a block-level paragraph with auto
 *    margins cannot be.
 *  - the sweep colour is a custom property rather than a hardcoded black/white,
 *    so a caller on a tokenised page can hand it the page's own ink instead of
 *    being stuck with the default pair.
 *
 * The animation itself is declared in src/tailwind.css, where its duration is
 * derived from --m3-dur-effects-cinematic: the site's motion rule is that no
 * raw duration appears anywhere, and that token's own definition in index.css
 * describes it as a "slow hero light sweep", which is exactly this.
 */
interface AnimatedShinyTextProps {
  children?: ReactNode;
  className?: string;
  /** width of the travelling highlight band, in px */
  shimmerWidth?: number;
  style?: CSSProperties;
  as?: ElementType;
  [key: string]: unknown;
}

export function AnimatedShinyText({
  children,
  className,
  shimmerWidth = 100,
  as: Tag = "span",
  style,
  ...rest
}: AnimatedShinyTextProps) {
  return (
    <Tag
      // caller style is MERGED, not spread after: a spread would replace this
      // object wholesale and silently drop --shiny-width, which breaks the band
      style={{ "--shiny-width": `${shimmerWidth}px`, ...(style as CSSProperties) } as CSSProperties}
      className={cn(
        "animate-shiny-text bg-clip-text bg-no-repeat [background-position:0_0] [background-size:var(--shiny-width)_100%]",
        "bg-gradient-to-r from-transparent via-[var(--shiny-via,rgba(0,0,0,0.8))] via-50% to-transparent",
        className,
      )}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default AnimatedShinyText;
