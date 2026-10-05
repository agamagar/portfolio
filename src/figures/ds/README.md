# Dassh figure design system

Tokens, primitives and scaffolds shared by every Dassh figure and interactive surface
in this portfolio. Colours and component anatomy come from the Dassh Design System
(Figma `uPhIrXFWQ1EXgQBSvPiuxQ`); motion follows `Claude/animation-base-layer.md`.

```
tokens.css       the token layer. Scoped to .ds-root so it never collides with the
                 site's own :root tokens.
components.css   styles for the primitives below.
Primitives.jsx   presentational building blocks.
Scaffold.jsx     app/phone chrome + the information-sensitive scaffold preset.
hooks.js         reduced motion, fit-to-container scaling, play-on-view sequencing.
```

## The contribution rule

**Anything built inside a figure that another surface could reuse gets promoted
here.** Build it where it is needed, prove it in context, then lift the reusable part
into `Primitives.jsx` + `components.css` (and any new token into `tokens.css`) and
leave only the surface-specific parts behind. A figure should own its *content* and
its *layout*; it should not own a button, a pill or a card that the next figure will
need to reinvent.

Two rules when promoting:

1. **Never hardcode a hue in a component.** Take a `tone` and read it from the
   `--ds-tone-*` scale via `[data-tone]`, so a consumer cannot drift off-palette.
2. **Keep cards flat.** The Dassh source carries depth with 0.5 to 1px borders and
   the `#FDFDFD` vs `#FFFFFF` surface contrast, not shadows. Only the figure frame
   floats.

## Layers

### `.ds-root`
Applies the token layer. By default it is an absolutely-positioned, transform-scaled
figure frame (see `useFitScale`). For a **live, interactive** surface add
`.ds-root--live`, which returns it to normal flow at natural size.

### Dark theme
Opt in with `data-theme="dark"` on the `.ds-root`. The Dassh source is a light
product, so dark is an **extension, not a transcription**: surfaces are re-derived as
a warm-neutral dark stack (never pure black, which would break the border-only depth
language), text is inverted through the same four-step hierarchy, and every product
hue is lifted to hold contrast on a dark ground. Because depth comes from borders
rather than shadows, `--ds-border` and `--ds-line` sit a step brighter relative to
their surface than the light theme's do.

Component CSS never needs to know which theme is active: it reads the same token
names in both.

```jsx
<div className="ds-root ds-root--live" data-theme="dark">…</div>
```

## The voice-agent set

Promoted out of the Stella call simulator (`figures/stella`) so any voice or
conversational surface can reuse it. Every one takes a `tone` from the `--ds-tone-*`
scale: `register | numbers | repair | trust | neutral`. Those four map onto the
existing product palette rather than a new one, so a spoken turn can be annotated
without inventing colour: language and register on Brand purple, data accuracy on
Forest Teal, error and recovery on the accent, trust and consent on Mystic Blue.

| Primitive | What it is | Notes |
|---|---|---|
| `<Bubble>` | one conversation turn | `side`: `start` (the agent), `end` (the person), `full` (a system record). `active` outlines it in the tone, `speaking` marks the line being voiced. `as="button"` when the turn is inspectable. |
| `<Pill tone soft>` | a small labelled tag | annotation categories, failure cases, statuses. `soft` adds the tinted background. |
| `<StatusDot tone off>` | a state dot with a soft halo | live calls, fired listeners, agent health. `off` greys it out. |
| `<Waveform tone state>` | three-bar speaking indicator | for a turn currently being voiced. Under `prefers-reduced-motion` the bars are REPLACED BY THE WORD, not frozen (see the row below for why). This entry used to say "stills", which the CSS contradicted and the row below explicitly argued against. |
| `<SoundToggle muted onToggle>` | labelled mute control | labelled on purpose: an icon alone does not tell a first-time listener whether sound is currently on. |
| `<IconSpeaker muted>` | speaker glyph | crossed out when muted. |
| `<FieldRow label value state note>` | one row of a structured record an agent is filling | `state`: `empty`, `asked`, `heard`, `confirmed`, `na`, `offscript`. State is a left rule, not a fill, so a filling record reads as evidence rather than a form. Told by **width and style first, hue only third**: `heard` is a 3px double rule and `confirmed` a 2px solid, because as hue alone they were amber against green, 1.16:1 apart in greyscale and the textbook red-green collision. Each state also renders a **provenance word** beside the value ("read back and agreed", "heard once, not confirmed"), visible to everyone rather than visually hidden, because provenance is the argument this component exists to make and it previously reached a screen reader not at all. |

`FieldRow`'s states carry an argument, not just a look. **`asked` is deliberately
distinct from `heard`**: a record that fills in when a question is merely *asked* is
dishonest instrumentation. And `offscript` is dashed because it is something a
listener caught that the form has no column for, which is the point.

| `<Verdict tone label headline because unsure>` | an agent's recommendation, put to the human who owns the decision | `because` and `unsure` are both required shapes, not decoration. Children slot in the override control. |

`<Verdict>` encodes the governing rule that **the human owns the verdict**: the
recommendation never appears without its reasoning, what the agent could *not*
establish gets equal billing, and the override is expected to sit at the same visual
weight as the agreement. An agent recommendation with no visible way to disagree with
it is not a recommendation, it is a decision wearing a softer word.

`<Tabs>` is **presentational only**. It used to grow a `<button>` form under an
`onSelect` prop, which produced `role="tablist"` and `role="tab"` and nothing else: no
`aria-controls`, no `role="tabpanel"` anywhere, and no arrow-key handling, so every tab
was its own tab stop instead of the roving tabindex the pattern requires. No caller ever
passed it. **A promoted interactive primitive ships its complete keyboard model or it
ships presentational only.**

```jsx
<Bubble side="start" tone="trust" speaking speaker={<>Stella <Waveform /></>}>
  <span>…the line…</span>
  <Pill tone="repair" soft>dead air after the introduction</Pill>
</Bubble>
```

## The button

`<Button variant size tone block>` is the chassis for every real control. Use it unless
the control makes a point this base cannot.

| Prop | Values | Notes |
|---|---|---|
| `variant` | `quiet`, `outline`, `filled`, `tone`, `icon` | the only prop that touches colour |
| `size` | `sm` 28, `md` 30, `lg` 34, `auto` | four heights is the whole set, deliberately |
| `tone` | a `--ds-tone-*` name | `variant="tone"` only; read via `[data-tone]`, never a hue |
| `block` | boolean | full width, left aligned: list rows |

Also handled here so nobody re-invents them: `data-on="true"` for a selected control,
`:disabled` (which keeps a border, so the control still reads as a control), and the
press state.

**Why this exists.** `.ds-btn` above it is a non-interactive `<span>` for StepCard, so
every figure that needed a real control wrote its own. Stella alone carried **fourteen**:
four heights, three different border tokens, and two byte-identical rule groups
(`.cand__back` was a copy of `.ats__back`). That is a correctness cost, not an
untidiness, and it had already been paid: the press-state rule in `components.css` was a
hand-typed allowlist of figure-private class names, and four real `<button>`s were
missing from it, so they had no press feedback at all. A second copy of that list lived
in `qaStella.mjs`. Both are gone; the check now derives the list from the JSX.

**What stays local.** The chassis is shared, the argument is not. A figure keeps its own
class where the control makes a surface-specific point: Stella's `.stl__choice` reveals a
failure tag on hover, `.stl__mode` carries a dashed `aria-disabled` state that names its
own reason, `.stl__navitem` is a stacked icon-over-label nav target. Those compose a thin
local layer **over** this base instead of restating it. `className` is passed through, so
a retained class can also be a pure layout hook (`.stl__headctl .stl__restart` sets one
margin and nothing else).

Safe to promote under the rule stated above `Tabs`: a single `<button>` ships the
complete native keyboard model, so there is no half-built interaction here to get wrong.

## `<StepRail>`, and promotion running outward

`<StepRail prefix cap steps active done defaultTone>` is the states-rail beside a phone.

It existed **twice**, as `scheduled/Rail.jsx` and `awayAgent/Rail.jsx`. Normalise the
class prefix and the two files differed in exactly one substantive line: the default
tone. Ten figures import one or the other, so a change to the rail's *structure* had to
land in two places and would reliably land in one.

`prefix` is not a prop a design system should normally take. It is right here because of
what is and is not shared: the **structure** is common, the **skin** deliberately is not.
These are two case studies with their own visual languages (Scheduled runs light on
purple at 16px radius, Away runs dark on indigo at 12px, with different resting opacities
and tone sets). Pulling them onto one appearance would have been a worse answer than the
duplication. Both `Rail.jsx` files are now one-line adapters.

This is the contribution rule running **outward** for the first time. Everything else here
was promoted out of one figure; this was promoted out of two that had already diverged.
`IconCheck` came with it: every rail needs a check glyph, the DS owned none, so both
families shipped a byte-identical copy. Both now re-export the DS one, which collapses the
duplicates without touching the call sites that import `ICheck`.

## The agent-loop set

An agent that ACTS needs surfaces a chat agent does not: a plan it can revise, evidence
of what it heard, an outcome it can be wrong about, and a standing note about what is
real. Promoted out of the Stella call kernel.

| Primitive | What it is | Notes |
|---|---|---|
| `<PlanQueue plan>` | the work an agent still intends to do | `status`: `todo`, `done`, `struck`, `added`. **`struck` is the load-bearing one**: a step removed because the agent learned it does not apply. An open-loop script has no interesting plan state. |
| `<Caught which>` | what a background listener heard | Attached to the line it heard it in. A rail of lamps says a system is watching; this says what it caught, here. |
| `<Disposition truthful>` | how something closed | **`truthful={false}`** lets an interface show the label a system actually wrote beside the evidence it was wrong, which argues harder than quietly fixing the label. |
| `<ScopeNote>` | what is real in a demonstration | `collapsible` folds it to its label, which is disclosure, not dismissal: the label stays on screen as a promise that something is under it. Deliberately has no dismiss control: a scope note you can close will be absent exactly when someone forms the wrong impression. |
| `<Disclosure label meta open onToggle>` | evidence that supports a pane, one level down | A real `<details>`, so find-in-page and no-JS both work. Without `onToggle`, `open` is an INITIAL state only and React will not re-apply it, so an outside event can never reopen the pane: it goes silent for the rest of the session while the thing driving it keeps changing. Pass `onToggle` for controlled mode and `open` becomes authoritative every render. Use `meta` to report what is inside while it is folded. |
| `<GhostInput value onChange onSubmit suggestions hint>` | a composer that completes the caller's own vocabulary inline | The completion is rendered by a MIRROR element behind a transparent-background input, so the two must share their type metrics in one CSS rule or the ghost stops sitting flush against the typed text. `ArrowRight` and `Tab` accept, but **only when the caret is at the end**: intercepting them mid-text would break the one thing every other input on the platform does. `Escape` dismisses for the rest of that entry. `hint` names the accept key, because an invisible affordance is not one. |

`GhostInput`'s `suggestions` carry an obligation the component cannot enforce: **every
suggestion must be something the receiving surface will actually accept.** Completing
someone into a request that then gets refused is worse than offering no completion at
all, so the consumer is expected to assert that (Stella does, in `qaStella.mjs`: every
suggestion must route to a real intent rather than the fallback).
| `<Bubble actions>` | a turn plus its own controls | `actions` renders as a SIBLING of the bubble inside a wrapping row, never inside it. With `as="button"` the whole turn is a button, and a button may not contain a button, so a per-turn control has nowhere legal to live inside. |
| `<SoundToggle state>` | mute, plus the browser's autoplay policy | `state="blocked"` is a real state the product is in and had no way to report: the control read "Sound on" while nothing was audible, because the first `play()` was rejected before any user gesture existed. `aria-pressed` means AUDIBLE, so a blocked surface is never reported as on. |
| `.ds-panetitle` | level one of a three-level pane hierarchy | Pane title, then uppercase subsection head, then disclosure summary. A pane that gives all three the same treatment ranks nothing. Sentence case at section size on full-strength ink, so it outranks a micro-label by weight rather than by being louder in the same register. |
| `useDsTheme()` | resolve the theme, never assert it | Reads the `dark`/`light` class the site already sets on `documentElement`, falls back to `prefers-color-scheme`, and stays reactive to both. Before this, every `ds-root` asserted its own theme and the authored light tokens were unreachable: a visitor reading in light got a dark console, and the PDF export path printed a dark island in a light document. There is deliberately **no in-app appearance toggle** anywhere in this system. |
| `useMediaQuery(q)` | a live media query in JS | Needed because a control whose panel a media query has hidden must be able to say so, and CSS cannot set `aria-disabled`. |
| `<Waveform state>` | speaking, and buffering | `state="buffering"` renders a STATIC three-dot mark, so a wait never has the same shape as speech. `role="img"` is required, not decoration: ARIA does not permit naming a generic span, so the old `aria-label` on a bare `<span>` was being dropped. Under `prefers-reduced-motion` the bars are replaced by the word, not frozen: three still bars where a live state was is a decorative shape, not an equivalent. |
| `<FieldRow justChanged>` | what the last turn moved | Cleared on the next turn, never on a timer: a mark that expires while the reader is still looking at the transcript they changed has told them nothing. |
| `.ds-sr` | visually hidden, still announced | Not `display:none`, which removes it from the accessible tree, and not `opacity:0`, which keeps it in the layout. |
| `--ds-focus-ring` + `.ds-root--live :focus-visible` | one keyboard indicator for the system | There was no focus style anywhere and `outline: none` appeared twice as the only focus declarations. `--ds-tone-trust` is 3.93:1 on white and 7.96:1 on the dark surface, so one token clears the 3:1 non-text floor in both. |
| `--ds-border-control` | a boundary a person clicks | 3.06:1 on `--ds-field` light, 3.03:1 dark. `--ds-border` was 1.39:1 and `--ds-line` measurably got WORSE in dark, which falsified this file's own claim that dark borders sit a step brighter. Control boundaries hold 3:1; dividers stay below it deliberately. |
| `--ds-tone-*-ink` | the text value of a tone | A tone has a FILL value and an INK value. The fills are brand hues and are unchanged; as TEXT they landed at 3.2 to 3.9:1 on white and on their own tints, so 7 of 14 light pairs failed. The dark theme was already tuned, which is why nobody noticed: the tones were mapped onto the product palette and light was never re-measured. |
| `--ds-tone-provisional` | captured once, not read back | The fifth concern. It had been borrowing `--ds-focal-amber` from the concept-animation family, so one hue carried two unrelated meanings across the system. |
| `--ds-font-gu` | **Anek Gujarati** by Ek Type, self-hosted | OFL-1.1, via `@fontsource-variable/anek-gujarati`, imported at the top of `tokens.css` so the DS declares its own faces. Two reasons it is not a fallback stack. **One:** the render is now identical on any reviewer's machine, where before it fell through to whatever per-script face the browser had (Gujarati Sangam MN on a Mac, Nirmala UI on Windows, Noto on Linux), each with different stroke weight and vertical metrics, inside a box authored for Inter. **Two:** the package ships a Latin companion under the *same family* with a `unicode-range` per subset, so a code-mixed line keeps one skeleton across both scripts instead of switching to Inter mid-sentence. `Zydus ના Sanand plant માં interview છે.` is the case that makes this visible. Variable `wght` 100 to 800 covers the 400 and 600 this system uses. |

### Disclosure over tabs, when two things must argue with each other

An earlier note here said one `Disclosure` per pane, and that two side by side were
the stacked-rail problem wearing chevrons. That was wrong in a specific and useful
way, so it is corrected rather than deleted.

Tabs and disclosures both reduce weight, but they are not interchangeable, because
they differ in what they do to *simultaneity*. **Tabs make things mutually exclusive.
Disclosures only make them unequal.** So the choice is not about density:

- If the panes are alternatives, tab them. Nobody needs two of them at once.
- If one pane is the **evidence for a claim made in another**, tabs destroy the
  argument. A reader who must click to check is being asked to take the first pane on
  faith, and the two can never be wrong together in view.

The Stella rail is the second case. The log line reads `COMPLETE. All required fields
captured. No flags raised.` and the record beside it is empty. Tabbed, that is a
claim. Co-present, it is evidence. Hierarchy still matters, so the record leads at
full weight and the plan and annotation sit under it as disclosures, which is one
level down rather than one click away.

The rule, then: **rank by weight, not by visibility, whenever two panes are meant to
be checked against each other.** `qaStella.mjs` asserts this for the Stella rail,
because the tabbed version was reintroduced once and nothing failed.

### Where it is used
- `figures/stella/StellaSim.jsx`, the interactive screening call, in both its
  full-viewport (`variant="page"`, route `/stella`) and contained
  (`variant="figure"`) forms.

## Two invariants this system now asserts

**A tone background is always rgba of that tone's own hue at one alpha.** The five light
tints used to be five different weights (1.075 to 1.237 against the parent surface, so
trust read about three times deeper than register) across two colour models, and
`--ds-tone-numbers-bg` aliased `--ds-green-pill-bg`, an rgba of `#027a48`, a hue that is
not `--ds-tone-numbers` at all. Two of the five were opaque and punched a whiteish hole
in their bubble.

**A promoted interactive primitive ships its complete keyboard model, or it ships
presentational only.** `Tabs` used to grow a `<button>` form under an `onSelect` prop that
produced `role="tablist"` and `role="tab"` and nothing else: no `aria-controls`, no
`role="tabpanel"` anywhere, no arrow keys. No caller ever passed it. A partial ARIA
pattern promises a keyboard model it does not implement, which is worse than a span.

## A note on the checks that guard this

`scripts/qaStella.mjs` asserts most of the above. Three of its checks have been caught
**passing vacuously**, all the same way: they asserted a shape rather than a fact, and
scanned raw source that contained their own explanatory prose. The scope-note check
matched a bare tag, so a dropped `collapsible` prop went unnoticed for a full cycle. The
nav check reported "3 nav items, all honest" for a four-item array, because it split on a
literal that misses multi-line entries, and the one multi-line entry was the only one
carrying the `reason` it existed to verify. A token check read the FIRST declaration of a
name where CSS takes the last, which hid a duplicated block that made the dark theme's
file disagree with the dark theme's render.

So: **every check asserts that its own extractor found something before it asserts the
something is correct**, and any check that scans CSS or source strips comments first.

## The Gujarati is set in Anek, and so is its transliteration

`.stl__guj` and `.cand__guj` take `--ds-font-gu`. So do `.stl__translit` and
`.cand__translit`, deliberately: a transliteration is a pronunciation aid **for** the line
above it, so it belongs to that unit, and Anek's Latin was drawn to sit with its Gujarati.
The English gloss stays on `--ds-font` (Inter), because the gloss is the **meaning**, in
the product's own voice. The interlinear stack therefore reads as three things and not two:
the script, then its sound, then what it means.

Leading is `1.7` on the Gujarati, checked on a three-line wrap rather than assumed: Anek's
above-base matras and below-base conjuncts need the room, and at `--ds-fs-guj: 17px` the
three-line case clears without clipping.

`qaStella.mjs` asserts the dependency, the `@import` and the token together, because any
one of the three alone puts the surface back on a silent fallback.
