---
name: Dassh figure design system
description: The product system the case-study figures are built in. Colours and component anatomy are taken verbatim from the shipped Dassh product (Figma uPhIrXFWQ1EXgQBSvPiuxQ); the type and spacing scales are a compact ramp that preserves the source's proportions at figure size, with a 1:1 override for live surfaces. Flat by default, depth carried by hairlines rather than shadow.

# Source of truth is src/figures/ds/tokens.css. This frontmatter is the portable
# export, so the impeccable detector can enforce it. If a token changes there,
# change it here in the same commit.

colors:
  # Surfaces. The source product uses NO shadows: depth is carried by 0.5 to 1px
  # borders and a #FDFDFD-against-#FFFFFF surface step.
  bg: "#fbfaf7"                 # warm app canvas
  surface: "#ffffff"            # cards, side panel, chrome planes
  field: "#fdfdfd"              # inputs
  muted: "#f5f5f5"              # muted chip fill

  # Lines. Split by JOB, not by shade: a boundary a person clicks holds 3:1
  # (WCAG 2.1 SC 1.4.11), a divider is decoration and deliberately sits below it.
  border: "#d9d9d9"             # inputs, buttons, tabs, dashed zones
  border-control: "#929292"     # a boundary a person CLICKS. 3.06:1 on field
  border-card: "#d4d4d4"        # card and panel outer
  line: "#d5d7da"               # hairline, rows within a pane
  line-strong: "#c4c7cd"        # a boundary between two PLANES

  # Text. Every value measured against the worst ground it actually lands on.
  text: "#181d27"
  text-alt: "#1e1e1e"
  text-2: "#50535a"             # 7.07:1 on muted
  text-3: "#707070"             # 4.54:1 on muted, 4.95:1 on white
  placeholder: "#6e6e6e"        # 4.53:1 on muted
  pill-text: "#252b37"

  primary: "#1e1e1e"
  on-primary: "#ffffff"

  # The real Dassh product palette. These are the brand, not decoration, and they
  # are the reason the four annotation tones below are legible as product colours
  # rather than as an invented scheme.
  purple: "#42307d"             # Brand/900
  teal: "#00995c"               # Forest Teal/500
  blue: "#4384c5"               # Mystic Blue/500
  blue-100: "#cbecff"
  blue-deep: "#1b3a5c"
  teal-100: "#c1f7d6"
  green: "#039855"
  accent: "#ea580c"
  ink-strong: "#0b0b0b"

  # Voice-agent tones: five concerns a spoken turn can be annotated against,
  # mapped onto the palette above rather than a new one. Each has a FILL (the
  # brand hue) and an INK (a darkened value for the same tone used as text,
  # because the brand hues land at 3.2 to 3.9:1 on white).
  tone-register-ink: "#42307d"
  tone-numbers-ink: "#00673e"
  tone-repair-ink: "#9a3a08"
  tone-trust-ink: "#2e5b88"
  tone-provisional-ink: "#7a4a05"
  tone-neutral-ink: "#555961"

  focal-blue: "#3b82f6"
  focal-green: "#22c55e"
  focal-amber: "#f59e0b"
  focal-red: "#ef4444"
  anno: "#3b82f6"
  on-anno: "#ffffff"
  popup: "#1f1f22"
  popup-text: "#f3f3f3"
  shim: "#e7e9ed"

  # Conventional macOS window chrome, used only for the faux browser-window dots in
  # the figure scaffold. Literal on purpose: they are a quotation of an OS, not part
  # of this palette, and remapping them by theme would break the quotation.
  window-red: "#f0625a"
  window-yellow: "#f5bf4f"
  window-green: "#5bc46b"

  # Shadow scrim. Declared so an rgba black in a box-shadow reads as intentional rather
  # than as palette drift: a shadow is an absence of light, correct in both themes, and
  # it is the one colour in this file that is deliberately NOT theme-remapped.
  scrim: "#000000"

typography:
  scale:
    # Two ramps, one set of steps. The base ramp is a miniature, because a figure is
    # transform-scaled down inside an article; `.ds-root--live` overrides it at 1:1 for
    # surfaces that fill a viewport. Both draw only from the steps below.
    #
    # Every step is a decision. Six half-steps were removed getting here (8.5, 9.5,
    # 10.5, 11.5, 12.5, 13.5), each within half a pixel of a neighbour: a ramp with
    # 12.5 next to 13 is one step pretending to be two, and it buys no hierarchy while
    # costing every consumer a choice it cannot make well.
    "9": "9px"      # base meta: hints, counts
    "10": "10px"    # base label, base pill
    "11": "11px"    # base sub, base tab / live meta, label, pill
    "12": "12px"    # base body, section, btn / live tab
    "13": "13px"    # base app / live sub, section, btn
    "14": "14px"    # live body
    "15": "15px"    # base title / live app, Gujarati in a phone mock
    "17": "17px"    # live title, Gujarati at full size
    "18": "18px"    # display-sm, view titles in a mock
    "20": "20px"    # display
  fonts:
    body: "Inter, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    # Anek Gujarati by Ek Type (OFL-1.1). Self-hosted, and it carries a Latin
    # companion under the SAME family, so a code-mixed line keeps one skeleton
    # across both scripts instead of falling back to Inter mid-sentence.
    gujarati: "Anek Gujarati Variable, Anek Gujarati, Gujarati Sangam MN, Nirmala UI, sans-serif"
  weights:
    regular: 400
    semi: 600

rounded:
  # Mapped onto the Material Design 3 corner scale, because the source product's
  # radii sit on it and inventing a parallel scale would mean two systems. Two steps
  # sit outside it, and both have a job the scale has no answer for. Thirteen distinct
  # radii were consolidated onto this set; 3, 5, 6, 7, 9, 10 and 14px were drift.
  mark: "2px"       # marks and bars inside a 9 to 16px glyph
  pill: "4px"       # m3 corner-xs
  btn: "8px"        # m3 corner-sm
  control: "8px"
  card: "12px"      # m3 corner-md
  frame: "16px"     # m3 corner-lg
  bezel: "30px"     # phone-mock bezel: not a card
  round: "999px"    # fully round pills and lozenges
  full: "50%"

spacing:
  # A compact echo of the source's 4/8/12/16/24 rhythm.
  "1": "4px"
  "2": "6px"
  "3": "8px"
  "4": "10px"
  "5": "12px"
  "6": "14px"
  "7": "18px"

motion:
  # Material Design 3 durations and easings. One register, so the surface reads as
  # one product; every transition in the stylesheets aliases one of these rather
  # than typing a millisecond value.
  dur-cue: "160ms"      # the smallest feedback beat: cue and tag fades
  dur-fast: "200ms"
  dur-state: "250ms"
  dur-expand: "400ms"
---

# Dassh figure design system

The system the Dassh case-study figures are built in, including the live Stella call
simulator at `/stella`. Source of truth: `src/figures/ds/tokens.css`,
`components.css`, `Primitives.jsx`. Contribution rules and the full primitive
catalogue: `src/figures/ds/README.md`.

## What is load-bearing here

This system serves a case study whose subject is trustworthy instrumentation, so a
few things that look like defects are the argument and must not be "fixed":

- A **left rule on a record row** carries provenance: how a value was got. It is
  width-and-style first and hue only third, because the two states that matter most
  (heard once, versus read back and agreed) were 1.16:1 apart in greyscale as hues
  alone. This is a table gutter marker, not a card accent.
- The record **shows what it failed to capture**, in a dashed section that stays
  visible when empty.
- On one path a system log reads `COMPLETE` while the record beside it is empty.
  That contradiction, visible in one glance, is the thesis.
- The nav **names the destinations it cannot open**, with the reason rendered.
- `Verdict` never shows a recommendation without its reasoning and a
  "not established" slot, and the human override sits at the same visual weight as
  the agreement.

## Flat by default

The source product uses no shadows. Depth is a hairline and a surface step. The only
element that floats is the figure frame itself, and in dark mode even that leans on
its border rather than a drop shadow, because a heavy shadow on a dark ground reads
as grime.

## Two themes, resolved not asserted

`useDsTheme()` reads the `dark` or `light` class the site sets on `documentElement`,
falls back to `prefers-color-scheme`, and stays reactive to both. There is
deliberately **no in-app appearance toggle** anywhere in this system.

## Checks

`npm run qa:stella` is the acceptance gate (52 checks, no test runner in this repo).
It computes contrast rather than grepping for it, and every check asserts that its own
extractor found something before asserting the something is correct.
