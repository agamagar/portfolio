# Scheduled Delivery: screen coverage

Agam's question, 26 Oct: "have we shown all screens?" A read-only audit of the case study (`/work/scheduled-delivery` on branch `claude/sd-smart-toggle-a80586`) against both prototypes. Figma was read through the Figma MCP only (get_metadata, small screenshots); nothing in Figma changed.

**Short answer: no.** The current design file has 326 case screens. The page shows 130 of them, 38 of those only inside the four live phones (the main path from Figma, and three built flows). Whole areas don't appear at all: tracking, the in-app return, pickup and refunds, and the cart's offer and limit cases. The earlier prototype's cross-midnight screens appear nowhere, though "One scroll across midnight" is the detail the case calls its proudest.

Counted as the page stands on this branch, with two caveats:
- **The master map.** The "All 326 cases" map (`sd:map`) is about to come off the page (annotations mvorf9wm and mvorf9wn), so it isn't counted as showing anything.
- **The live paths (updated 26 Oct, after the swap).** Agam asked for the built flows instead of the Figma prototype. Slots full, exchange and return now run the playground's flows, so every case those flows hold counts as shown. The main path is still the Figma prototype, because no single built flow walks it.

How a screen can be shown:
- **live Figma embed:** a reader can tap through it. Only screens reachable from a path's start are counted.
- **built flow:** the design playground's flow, running in the same phone. Every case it holds counts.
- **playground embed:** a playground view outside the phones (the states row, the returns family).
- **still, plate, crossfade, marquee, scroll scene, FigmaShot, explored row:** pictures on the page.

The confidence marks are the audit's own:
- **exact:** the node ids match.
- **likely:** the name, the alt text or the picture matches.
- **guess:** the nearest case.

## 1. The earlier prototype: Zepto handoff file `71cZSn6pTNf4zFzO07O2uv`

- **What the start node is:** `40000084:123917` is "Section 3" on the page "*WIP* M4: Slot Management" (`8559:217020`).
- **How the list was built:** get_metadata doesn't expose prototype links, so these are the section's frames, read top to bottom, then left to right.
- **Names don't match content:** every frame is named "Today: all slots", even the ones on the Tomorrow tab.

| order | node | what it shows | in the current file? | shown in the case study? |
|---|---|---|---|---|
| 1 | `40000084:182683` | Today tab: Evening, Night, then a plain "Late night · Oct 25" group | no | no |
| 2 | `40000084:124154` | Today tab: the "Late night · Oct 25" group in a box | no | no |
| 3 | `40000084:180821` | Tomorrow tab: boxed "Late night · Oct 25" first, then Morning with past slots greyed, then Afternoon | no | no |
| 4 | `40000084:182973` | Tomorrow tab: a plain "Early morning" group first | no | no |
| 5 | `40000084:183304` | Today tab: Evening, Night, then a boxed "Early morning" group | no | no |
| 6 | `40000084:183420` | Tomorrow tab: a boxed "Early morning" group first | no | no |
| 7 | `40000084:123918` | "Tomorrow: more slots available" (by name) | likely S-008 or S-013 | as S-013, in the crossfade (likely) |

Below Section 3, a board of eight frames (`40000966:360643` to `40000966:362236`, "Flow · 1" to "Flow · 8") matches the current file's S-001 to S-008 one to one. It looks like a later copy of the current work, so it isn't counted here.

**In the earlier prototype, not in the current one:** frames 1 to 6. They show the after-midnight windows as a named group: "Late night" at the end of Today, "Early morning" at the head of Tomorrow, boxed or plain. The current file only has "Earliest". Its Tomorrow screens (S-008, S-014) start at Afternoon, and nothing in it labels "Late night" or "Early morning". This is the relabel that "One scroll across midnight" describes ("Late Night becoming Early Morning"). Its crossfade uses S-015, S-013 and S-014, which don't show it.

## 2. The current prototype: "Claude: Schedule" `R04cmbzFPQk2Q4IockGwqZ`, Flow page `141:2`

Five wired Figma paths, all of whose frames still exist:
- main from `9:154`;
- slots full from `11:3`;
- support chat exchange from `7:3`;
- support chat return from `10:3`;
- return in the app from `10:837`.

The page embedded the first four; since 26 Oct only the main path is still Figma, and the other three are the playground's built flows (`flow-schedule-slots-unavailable-feedback`, `flow-returns-cs-chat-exchange`, `flow-returns-cs-chat-return`). C-001 (first-time introduction) can't be reached from the main path's start. S-005 (past slots greyed) is in the playground's states embed.

Current file: 326 case frames, 130 shown on the page, 196 not shown.

| Figma section | frames | shown | not shown |
|---|---|---|---|
| 🛒 Cart entry | 12 | 5 | 7 |
| 📅 Schedule picker | 17 | 4 | 13 |
| 📅 Pick a slot | 16 | 13 | 3 |
| 📦 Many shipments | 4 | 2 | 2 |
| ✅ Cart cases | 15 | 4 | 11 |
| 🧾 Pay and track | 8 | 2 | 6 |
| 🏠 Orders and home | 10 | 3 | 7 |
| 🚫 Slots full | 8 | 8 | 0 |
| 💬 Exchange by chat | 26 | 26 | 0 |
| 💬 Return by chat | 7 | 7 | 0 |
| 📲 Return in the app | 17 | 0 | 17 |
| 🏪 Store availability | 17 | 1 | 16 |
| 🏷️ Buy X get Y | 14 | 0 | 14 |
| 🔄 Swap and save | 12 | 0 | 12 |
| 🚫 Cannot deliver | 7 | 0 | 7 |
| 🚫 Out of stock | 8 | 2 | 6 |
| ⚠️ Limits and errors | 9 | 0 | 9 |
| 🔢 Pickup OTP | 5 | 2 | 3 |
| 🛵 Pickup time | 12 | 0 | 12 |
| 💸 Your refund | 4 | 0 | 4 |
| 🧮 Card states | 4 | 2 | 2 |
| ⚡ Instant unavailable | 8 | 5 | 3 |
| 🕙 Slots by time of day | 3 | 0 | 3 |
| 🗂️ Slot on the card | 6 | 5 | 1 |
| 📣 Meet Schedule | 6 | 3 | 3 |
| 💡 Cart nudge | 5 | 3 | 2 |
| 🛒 Cart headers | 11 | 8 | 3 |
| 🗂️ Options sheet | 11 | 2 | 9 |
| 🧪 Three toggles | 8 | 3 | 5 |
| 🧪 Oct 29 research | 6 | 5 | 1 |
| 🔁 Exchange and return | 15 | 15 | 0 |
| 📦 Track it | 15 | 0 | 15 |

#### 🛒 Cart entry

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-001 | 📣 First-time introduction | `9:3` | no (on a wired path, but no start reaches it) |
| C-002 | 📱 Returning user tray | `9:154` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-012 | 🛒 Delivery scheduled on cart | `9:1540` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-003 | 🚫 Items unserviceable Schedule | `9:302` | no |
| C-004 | 🚫 Items unavailable Schedule | `9:443` | no |
| C-005 | ⚠️ Scheduled limit baseline | `9:584` | The cart is a complex construct (FigmaShot still, guess) |
| C-006 | 🚫 Maximum number of scheduled | `9:719` | no |
| C-007 | ⚠️ Scheduled limit toast | `9:865` | no |
| C-008 | 🚫 New case unserviceable items | `9:1008` | The explorations (Detour) (still, likely) |
| C-009 | 🚫 New case some items | `9:1149` | The explorations (Detour) (still, likely) |
| C-010 | 🚫 New case unserviceable due | `9:1286` | no |
| C-011 | 🚫 New case items cannot | `9:1413` | no |

#### 📅 Schedule picker

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-014 | ⏳ Picker loading shimmer | `9:1820` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-015 | 📅 Picker schedule selected | `9:1904` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-022 | 📅 Confirm schedule | `9:2745` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-027 | 🚫 No slots available | `9:3444` | no (it was on the Figma slots-full path, but no start reached it; the built flow doesn't hold it) |
| C-013 | 🚫 Cart unserviceable store | `9:1671` | no |
| C-016 | 🚫 Picker instant unavailable | `9:2042` | no |
| C-017 | 📅 Picker unable load slots | `9:2176` | no |
| C-018 | ⚡ Don't schedule instant | `33:3` | no |
| C-019 | 🚫 Returning user unavailable | `9:2347` | no |
| C-020 | ✅ Returning user delivered | `9:2463` | no |
| C-021 | 🛒 Schedule reset cart | `9:2596` | no |
| C-023 | 📣 Skip flow popup Proceed | `33:103` | no |
| C-024 | 📣 Skip flow popup | `33:295` | no |
| C-025 | 📅 Skip flow shipments 2 | `33:471` | The explorations (Detour) (FigmaShot still, guess) |
| C-026 | 📅 View items shipment contents | `9:3380` | no |
| C-028 | 🚫 Non-schedulable cart | `9:3535` | no |
| C-029 | 🚫 Non-schedulable shipment | `9:3684` | no |

#### 📅 Pick a slot

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-002 | ⚡ Instant delivery selected | `30:3` | live Figma embed, main path (The prototype, live; also the Context and objective plate); Every state, running (playground embed, exact) |
| S-001 | 📅 Default Schedule selected | `4:3` | live Figma embed, main path (The prototype, live; also the Context and objective plate); The explorations (Detour) (still, likely); Slot-page states (still strip, likely); Every state, running (playground embed, exact) |
| S-008 | 📅 Tomorrow tab more slots | `4:896` | live Figma embed, main path (The prototype, live; also the Context and objective plate); Every state, running (playground embed, exact) |
| S-005 | 🚫 Morning window past slots | `4:496` | Every state, running (playground embed, exact) |
| S-003 | 🚫 Edge Instant unavailable | `4:250` | Instant to Scheduled: the toggle (coded mock, guess); Slot-page states (end) (explored row, exact); Every state, running (playground embed, exact) |
| S-004 | 🚫 Edge Schedule unavailable | `4:403` | Every state, running (playground embed, exact) |
| S-006 | 📅 Evening night all slots | `4:625` | Every state, running (playground embed, exact) |
| S-007 | 🛵 Earliest slots next-day date | `4:761` | Every state, running (playground embed, exact) |
| S-009 | 📅 Screen 2 expanded grid Early | `4:1052` | Slot-page states (still strip, likely) |
| S-010 | 📅 Screen 3 Late night group | `4:1188` | The explorations (Detour) (still, likely); Slot-page states (still strip, likely) |
| S-011 | 📅 Screen 4 full grid starting | `4:1322` | no |
| S-012 | 📅 Delivery Options card | `4:1458` | no |
| S-013 | 📅 Single shipment Tomorrow | `4:1598` | One scroll across midnight (crossfade, likely) |
| S-014 | 📅 Single shipment Tomorrow all | `4:1754` | One scroll across midnight (crossfade, likely) |
| S-015 | 📅 Single shipment Today all | `4:1910` | Different ways… (still, exact); One scroll across midnight (crossfade, exact) |
| S-016 | 📅 Section 3 iterations Late | `4:2046` | no |

#### 📦 Many shipments

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-030 | 📅 Shipment no slot selected | `11:1997` | live Figma embed, main path (The prototype, live; also the Context and objective plate); Slot-page states (still strip, likely) |
| S-029 | 🚫 Three shipments scheduled | `11:1871` | live Figma embed, main path (The prototype, live; also the Context and objective plate); Slot-page states (still strip, likely) |
| S-031 | 📱 Same two cases re-drawn on | `11:2124` | no |
| S-032 | 📅 All vars three shipments | `11:2221` | no |

#### ✅ Cart cases

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-086 | ✅ Order Scheduled Successfully | `18:3989` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| S-072 | 🚫 Items unserviceable | `18:1972` | The explorations (Detour) (still, likely) |
| S-073 | 🚫 Some items unavailable | `18:2128` | The explorations (Detour) (still, likely) |
| S-074 | 🚫 Store unserviceable due rain | `18:2283` | no |
| S-075 | 🚫 Items unavailable | `18:2437` | no |
| S-076 | 🚫 Cart item removal sheet | `30:552` | no |
| S-077 | 🚫 Unavailable items removed | `18:2795` | no |
| S-078 | 📅 Your delivery scheduled | `18:2907` | no |
| S-079 | 🚫 Multi-shipment No Slots | `18:3013` | no |
| S-080 | 🚫 Ideas Store unserviceable | `18:3122` | no |
| S-081 | 📅 Ideas Your delivery | `18:3228` | no |
| S-082 | ⏳ Ideas loading state | `18:3334` | no |
| S-083 | 🚫 Scheduled Delivery | `18:3442` | The stuck cart (still, exact) |
| S-084 | 📣 GTM sheet unserviceable | `30:757` | no |
| S-085 | 🤍 Nudge Move Unavailable Items | `30:972` | no |

#### 🧾 Pay and track

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-031 | ✅ Order confirmed | `9:3811` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-032 | 📦 Tracking scheduled tomorrow | `9:3827` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-030 | ⏳ Payment processing (MAIN-PATH "wire later") | `9:3782` | no |
| C-033 | 📦 Tracking scheduled today (MAIN-PATH "wire later") | `9:3875` | no |
| C-034 | 📦 Tracking regular order (MAIN-PATH "wire later") | `9:3922` | no |
| C-035 | ✅ Tracking final UI (MAIN-PATH "wire later") | `9:3968` | no |
| C-036 | 🔢 Dev Ready 2 OTP Order (MAIN-PATH "wire later") | `9:4015` | no |
| C-037 | 🔢 Dev Ready 2 OTP Scheduled (MAIN-PATH "wire later") | `9:4068` | no |

#### 🏠 Orders and home

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-039 | 📦 Orders scheduled order | `15:58` | live Figma embed, main path (The prototype, live; also the Context and objective plate) |
| C-038 | 🏠 PDP schedule later info (MAIN-PATH "wire later") | `15:3` | The explorations (Detour, after the section) (FigmaShot still, guess) |
| C-040 | 📦 Orders Dev Ready 2 scheduled order (MAIN-PATH "wire later") | `15:213` | no |
| C-041 | 🗂️ Cancel scheduled order (MAIN-PATH "wire later") | `33:586` | no |
| C-042 | 🚫 Order cancelled (MAIN-PATH "wire later") | `15:541` | no |
| C-043 | 🏠 Homepage strip regular order (MAIN-PATH "wire later") | `15:678` | The explorations (Detour) (still, guess,) |
| C-044 | 🏠 Homepage strip scheduled order (MAIN-PATH "wire later") | `15:763` | no |
| C-045 | 🏠 Homepage strip Dev Ready 2 scheduled order (MAIN-PATH "wire later") | `15:845` | no |
| C-046 | ✅ Order scheduled button (MAIN-PATH "wire later") | `15:927` | no |
| C-047 | 🔁 Orders returns replacement (MAIN-PATH "wire later") | `15:979` | no |

#### 🚫 Slots full

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-017 | 🚫 Some slots unavailable | `11:3` | built flow, slots full (The prototype, live); Slot-page states (still strip, likely) |
| S-018 | 🚫 Some slots unavailable SLOT | `11:193` | built flow, slots full (The prototype, live) |
| S-019 | 🚫 No slots available on | `11:384` | built flow, slots full (The prototype, live); Slot-page states (still strip, likely) |
| S-020 | 📣 Schedule Introducing | `30:105` | built flow, slots full (The prototype, live); Scheduled delivery, in motion (still, likely); Context and objective (plate 1) (plate, likely); The go-to-market (plate 1) (plate, likely) |
| S-021 | ↩️ Returns pickup slot picker | `11:678` | built flow, slots full (The prototype, live) |
| S-022 | ↩️ Returns pickup person | `11:909` | built flow, slots full (The prototype, live) |
| S-023 | ↩️ Returns pickup Expanded | `11:1120` | built flow, slots full (The prototype, live) |
| S-024 | ↩️ Returns pickup Next Day tab | `11:1350` | built flow, slots full (The prototype, live) |

#### 💬 Exchange by chat

| case | screen | node | shown in the case study |
|---|---|---|---|
| EX-001 | 💬 Entry Help Support lists | `7:3` | built flow, exchange in support chat (The prototype, live) |
| EX-002 | 💬 Order Help lists issue | `7:98` | built flow, exchange in support chat (The prototype, live) |
| EX-003 | 📱 Item selection eligible | `7:165` | built flow, exchange in support chat (The prototype, live) |
| EX-004 | 📱 Select issue item | `7:291` | built flow, exchange in support chat (The prototype, live) |
| EX-005 | 📱 Quantity photos videos | `7:444` | built flow, exchange in support chat (The prototype, live) |
| EX-006 | 📱 Summary before submitting | `7:636` | built flow, exchange in support chat (The prototype, live) |
| EX-007 | 💬 Chat echoes submitted issue | `7:778` | built flow, exchange in support chat (The prototype, live) |
| EX-008 | 💬 Bot offers exchange | `7:873` | built flow, exchange in support chat (The prototype, live) |
| EX-009 | 🔁 Availability confirmation | `7:982` | built flow, exchange in support chat (The prototype, live) |
| EX-010 | 🔁 Exchange confirmed | `45:3` | built flow, exchange in support chat (The prototype, live) |
| EX-011 | 💬 Escalation human agent | `7:1293` | built flow, exchange in support chat (The prototype, live) |
| EX-012 | 🔁 Item OOS before exchange | `7:1458` | built flow, exchange in support chat (The prototype, live) |
| EX-013 | 🔁 Item OOS after exchange | `7:1567` | built flow, exchange in support chat (The prototype, live) |
| EX-014 | 🔁 Item already exchanged block | `7:1740` | built flow, exchange in support chat (The prototype, live) |
| EX-015 | 🚫 Store unserviceable | `7:1927` | built flow, exchange in support chat (The prototype, live) |
| EX-016 | 📱 Maximum active child orders | `7:2049` | built flow, exchange in support chat (The prototype, live) |
| EX-017 | 🚫 CS window closed | `7:2157` | built flow, exchange in support chat (The prototype, live) |
| EX-018 | 🔁 RTO exchange flow suggest | `7:2209` | built flow, exchange in support chat (The prototype, live) |
| EX-019 | 🔁 Cancelled exchange flow | `7:2315` | built flow, exchange in support chat (The prototype, live) |
| EX-020 | 🔁 Exchange declined need | `7:2421` | built flow, exchange in support chat (The prototype, live) |
| EX-021 | 🛵 Instant pickup unavailable | `7:2556` | built flow, exchange in support chat (The prototype, live) |
| EX-022 | 🚫 Items ineligible | `7:2748` | built flow, exchange in support chat (The prototype, live) |
| EX-023 | 📱 Multi-product issue | `7:2881` | built flow, exchange in support chat (The prototype, live) |
| EX-024 | ↩️ OOS pivot confirmed Return | `7:2995` | built flow, exchange in support chat (The prototype, live) |
| EX-026 | ✅ Clear details confirmation | `27:3` | built flow, exchange in support chat (The prototype, live) |
| EX-025 | ↩️ Pick refund method after OOS | `7:3380` | built flow, exchange in support chat (The prototype, live) |

#### 💬 Return by chat

| case | screen | node | shown in the case study |
|---|---|---|---|
| RT-001 | 💬 Bot eligible Return | `10:3` | built flow, return in support chat (The prototype, live) |
| RT-002 | ↩️ Return availability | `10:115` | built flow, return in support chat (The prototype, live) |
| RT-003 | 🔁 Return flow suggests | `10:261` | built flow, return in support chat (The prototype, live) |
| RT-004 | ↩️ CS window closed | `10:369` | built flow, return in support chat (The prototype, live) |
| RT-005 | ↩️ Store unserviceable | `10:421` | built flow, return in support chat (The prototype, live) |
| RT-006 | 💬 Return declined Need further | `10:543` | built flow, return in support chat (The prototype, live) |
| RT-007 | 💬 Agent handoff | `10:675` | built flow, return in support chat (The prototype, live) |

#### 📲 Return in the app

| case | screen | node | shown in the case study |
|---|---|---|---|
| IA-001 | ↩️ Order Details RnR states | `10:837` | no (wired in Figma, return in the app, not embedded) |
| IA-002 | 📅 Parent Order shipments | `10:967` | no (wired in Figma, return in the app, not embedded) |
| IA-003 | 🔁 RnR creation choose Exchange | `10:1052` | no (wired in Figma, return in the app, not embedded) |
| IA-004 | 📱 Quantity issue list | `10:1145` | no (wired in Figma, return in the app, not embedded) |
| IA-005 | ⚠️ Upload failure file | `27:224` | no (wired in Figma, return in the app, not embedded) |
| IA-006 | ⚠️ Camera gallery file access | `27:383` | no (wired in Figma, return in the app, not embedded) |
| IA-007 | 🛵 Review items address | `10:1572` | no (wired in Figma, return in the app, not embedded) |
| IA-008 | ↩️ Instant unavailable schedule | `10:1656` | no (wired in Figma, return in the app, not embedded) |
| IA-009 | 🔁 Cancel exchange items sheet | `27:535` | no (wired in Figma, return in the app, not embedded) |
| IA-010 | ↩️ Returns unavailable blocker | `27:650` | no (wired in Figma, return in the app, not embedded) |
| IA-011 | 🚫 Blocker flow store | `27:849` | no (wired in Figma, return in the app, not embedded) |
| IA-012 | 🔁 Exchange order placed | `10:2252` | no (wired in Figma, return in the app, not embedded) |
| IA-013 | 🔁 Order status after placing | `10:2293` | no (wired in Figma, return in the app, not embedded) |
| IA-014 | 🔁 Active exchange one exchange | `10:2364` | no (wired in Figma, return in the app, not embedded) |
| IA-015 | 📱 Only 1 product selected | `10:2438` | no (wired in Figma, return in the app, not embedded) |
| IA-017 | 📱 Upload photos or videos | `27:958` | no (wired in Figma, return in the app, not embedded) |
| IA-016 | 🚫 Instant schedule unavailable | `10:2641` | no (wired in Figma, return in the app, not embedded) |

#### 🏪 Store availability

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-048 | 🛒 DH ✅ SS ✅ | `15:1131` | The cart is a complex construct (FigmaShot still, guess) |
| C-049 | 📣 DH ✅ SS ✅ Intro pop-up | `33:761` | no |
| C-050 | 📅 DH ✅ SS ✅ Schedule | `33:952` | no |
| C-051 | 🛒 DH ✅ SS ❌ | `15:1550` | no |
| C-052 | 📅 DH ✅ SS ❌ Scheduled | `15:1720` | no |
| C-053 | 🤍 DH ✅ SS ❌ Wishlisted | `15:1885` | no |
| C-054 | 🛒 DH ❌ SS ✅ | `15:2030` | no |
| C-055 | 📅 DH ❌ SS ✅ Scheduled | `15:2200` | no |
| C-056 | 🤍 DH ❌ SS ✅ Wishlist | `15:2377` | no |
| C-057 | 🛒 DH ❌ SS ❌ Exp 1 cart | `15:2499` | no |
| C-058 | 🚫 DH ❌ SS ❌ Exp 1 | `15:2658` | no |
| C-059 | 📅 DH ❌ SS ❌ Exp 1 scheduled | `15:2817` | no |
| C-060 | 🛒 DH ❌ SS ❌ Exp 2 cart | `15:2983` | no |
| C-061 | ↩️ DH ❌ SS ❌ Exp 2 Return | `15:3137` | no |
| C-062 | 📅 DH ❌ SS ❌ Exp 2 scheduled | `15:3294` | no |
| C-063 | 🛒 SS ❌ only | `15:3460` | no |
| C-064 | 📅 SS ❌ only Scheduled | `15:3619` | no |

#### 🏷️ Buy X get Y

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-065 | 🏷️ Cart before BxGy selection | `15:3773` | no |
| C-066 | 🏷️ Cart after BxGy selection | `15:3902` | no |
| C-067 | 🏷️ Cart add-ons offer applied | `15:4069` | no |
| C-068 | 🏷️ Cart add-ons offer not yet | `15:4322` | no |
| C-069 | 🏷️ Offer sheet savings summary | `33:1008` | no |
| C-070 | 🏷️ Offer sheet collapsed | `33:1213` | no |
| C-071 | 🏷️ Offer sheet expanded details | `33:1368` | no |
| C-072 | 🏷️ Offer sheet offer applied | `33:1558` | no |
| C-073 | 🏷️ MRP SP rule Buy 2 · old (hidden) | `15:5272` | no |
| C-074 | 🏷️ MRP SP rule consumer bought · old (hidden) | `15:5341` | no |
| C-075 | 🏷️ MRP SP rule Buy 2 MRP · old (hidden) | `15:5416` | no |
| C-076 | 🏷️ MRP SP demo quantity 1 · old (hidden) | `15:5489` | no |
| C-077 | 🏷️ MRP SP demo quantity 2 · old (hidden) | `15:5632` | no |
| C-078 | 🏷️ MRP SP demo 1 10% · old (hidden) | `15:5770` | no |

#### 🔄 Swap and save

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-079 | 🏷️ Combined shipments no offer | `19:3` | no |
| C-080 | 🏷️ Swap n Save strip | `19:229` | no |
| C-081 | 🏷️ Swap n Save swap sheet | `33:1751` | no |
| C-082 | 🏷️ Swap n Save items swapped | `19:680` | no |
| C-083 | 🏷️ Swap n Save after swap | `19:862` | no |
| C-084 | 🏷️ Discounted add-ons strip | `19:1042` | no |
| C-085 | 🏷️ Discounted add-ons Add 2 | `33:2009` | no |
| C-086 | 🏷️ Discounted add-ons selected | `19:1479` | no |
| C-087 | 🏷️ Add n Save edit special | `19:1688` | no |
| C-088 | 🏷️ Other constructs on | `19:1923` | no |
| C-089 | 🏷️ Other constructs Discounted | `19:2117` | no |
| C-090 | 🏷️ Other constructs Add n Save | `19:2307` | no |

#### 🚫 Cannot deliver

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-091 | 🏷️ Swap n Save combined shipment Swap | `19:2544` | no |
| C-092 | 🏷️ Swap n Save combined shipment edit | `19:2743` | no |
| C-093 | 🚫 Swap n Save combined | `19:2989` | no |
| C-094 | 🚫 Unserviceable Opt 1 tag | `19:3165` | no |
| C-095 | 🚫 Unserviceable Opt 2 grouped | `19:3387` | no |
| C-096 | 🛒 Slot tag item level | `19:3613` | no |
| C-097 | 📅 Schedule screen images hero | `19:3804` | no |

#### 🚫 Out of stock

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-098 | 🚫 Out of stock | `19:4088` | The whole cart, top to bottom (still, guess) |
| C-099 | 🚫 Unlabelled var 3 items can't | `19:4247` | no |
| C-100 | 🚫 Primary store unserviceable | `19:4406` | The whole cart, top to bottom (still, guess) |
| C-101 | 🚫 Primary store unserviceable schedule | `33:2258` | no |
| C-102 | 🚫 Secondary store unserviceable | `19:4768` | no |
| C-103 | 🚫 Secondary store unserviceable schedule | `33:2457` | no |
| C-104 | 🚫 Both stores unserviceable | `19:5126` | no |
| C-105 | 🚫 Both stores unserviceable schedule | `19:5261` | no |

#### ⚠️ Limits and errors

| case | screen | node | shown in the case study |
|---|---|---|---|
| C-106 | ⚠️ Order limit breached | `19:5402` | no |
| C-107 | ⚠️ Stand still shows | `19:5508` | no |
| C-108 | 🏷️ High demand surcharge | `19:5615` | no |
| C-109 | 🚫 Rain deliveries paused | `19:5719` | no |
| C-110 | ⚠️ Cart throwing error | `19:5823` | no |
| C-111 | 🚫 Rain schedule available | `19:5927` | no |
| C-112 | 🚫 Rain Forgot something? var | `19:6085` | no |
| C-113 | ✅ Multiple orders placed | `19:6261` | no |
| C-114 | 🚫 Store closed | `19:6365` | no |

#### 🔢 Pickup OTP

| case | screen | node | shown in the case study |
|---|---|---|---|
| OT-001 | 🔢 OTP Share OTP easy Exchange | `16:1374` | Slot-page states (still strip, likely) |
| OT-002 | 🔢 OTP generated three OTP vars | `16:1432` | no |
| OT-003 | 🛵 Pickup scheduled | `16:1499` | Slot-page states (still strip, likely) |
| OT-004 | 🛵 Pickup scheduled estimated | `16:1556` | no |
| OT-005 | 📦 Order status Tomorrow Today | `16:1612` | no |

#### 🛵 Pickup time

| case | screen | node | shown in the case study |
|---|---|---|---|
| PK-001 | ⚡ No slot selected | `16:3` | no |
| PK-002 | 📅 Slot selected main CTA | `16:95` | no |
| PK-003 | 🚫 No slots available earliest | `16:239` | no |
| PK-004 | 🚫 No slots available time | `16:373` | no |
| PK-005 | 📱 Alt 01 Less co2 emissions | `16:495` | no |
| PK-006 | 📱 Alt 02 eco saver tag | `16:634` | no |
| PK-007 | ↩️ Return no pickup option | `16:720` | no |
| PK-008 | 🚫 Instant Unavailable | `16:814` | no |
| PK-009 | 🚫 Schedule Unavailable | `16:954` | no |
| PK-010 | ⚡ Comp Instant card | `16:1036` | no |
| PK-011 | 📅 Comp Scheduled card | `16:1118` | no |
| PK-012 | 📅 Schedule Card States comp | `16:1250` | no |

#### 💸 Your refund

| case | screen | node | shown in the case study |
|---|---|---|---|
| RF-001 | ↩️ Refund method Zepto Cash | `16:3330` | no |
| RF-002 | ↩️ In-app refund method | `16:3390` | no |
| RF-003 | 💬 Refund after pickup | `16:3447` | no |
| RF-004 | ↩️ Refund credited line Order | `16:3484` | no |

#### 🧮 Card states

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-025 | ⚡ Instant available Schedule | `11:1532` | Instant to Scheduled: the toggle (coded mock, guess) |
| S-026 | 🚫 Instant available Schedule | `11:1638` | no |
| S-027 | 🚫 Instant unavailable Schedule available | `11:1720` | Instant to Scheduled: the toggle (coded mock, guess) |
| S-028 | 🚫 Instant unavailable Schedule unavailable | `11:1800` | no |

#### ⚡ Instant unavailable

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-033 | ⚡ Instant Back soon schedule | `11:2336` | Slot-page states (end) (explored row, exact) |
| S-034 | 🚫 Temporarily UNAVAILABLE tag | `11:2496` | Slot-page states (end) (explored row, exact) |
| S-035 | 📣 We got you! callout | `11:2657` | Slot-page states (end) (explored row, exact) |
| S-036 | 🚫 Radio vs Toggle Instant Back | `11:2826` | no |
| S-037 | 🚫 Up down toggle Instant | `11:2943` | Slot-page states (end) (explored row, exact) |
| S-038 | 📅 Up down toggle both options | `11:3101` | no |
| S-039 | 📱 Get now Get later wording | `30:296` | Slot-page states (end) (explored row, exact) |
| S-040 | 📱 Get later only 10-min chip | `11:3381` | no |

#### 🕙 Slots by time of day

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-041 | 📅 10 PM only two slots | `11:3471` | no |
| S-042 | 📅 12:00 after midnight | `11:3629` | no |
| S-043 | 📅 6:30 AM earliest = 7 | `11:3806` | no |

#### 🗂️ Slot on the card

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-044 | ✅ Collapsed shipment | `11:4005` | Different ways… (end) (explored row, exact) |
| S-045 | 📅 Alt 2 Delivering Today | `11:4130` | Different ways… (end) (explored row, exact) |
| S-046 | 📅 Alt 3 Delivering Today 5 | `11:4255` | Different ways… (end) (explored row, exact) |
| S-047 | 📅 Alt 4 Delivering Today 5 | `11:4415` | Different ways… (end) (explored row, exact) |
| S-048 | 📅 Slot divide Delivering | `11:4545` | Different ways… (end) (explored row, exact) |
| S-049 | 📅 Expanded vs collapsed cards | `11:4710` | no |

#### 📣 Meet Schedule

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-050 | 📣 Top banner three rotating | `11:4845` | no |
| S-051 | 📣 Top banner Introducing | `11:4973` | no |
| S-052 | 📣 Top banner Schedule Later | `11:5096` | The go-to-market (end) (explored row, exact) |
| S-053 | ⏳ SD 1 10 Lottie frames | `30:432` | Context and objective (plate 1) (plate, likely); The go-to-market (plate 1) (plate, likely) |
| S-054 | 📣 Select slot tag idea | `11:5342` | no |
| S-055 | 📣 Trust marker No extra | `11:5514` | The go-to-market (end) (explored row, exact) |

#### 💡 Cart nudge

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-056 | 📣 GTM cart Instant Temporarily | `18:3` | no |
| S-057 | 📣 Coachmark option 61 Schedule | `18:151` | The go-to-market (end) (explored row, exact) |
| S-058 | 📣 Coachmark option 62 Orders | `18:289` | The go-to-market (end) (explored row, exact) |
| S-059 | 📣 Coachmark option 66 Plan | `18:443` | The go-to-market (plate 2) (plate, unmatched); The go-to-market (end) (explored row, exact) |
| S-060 | 📣 Coachmark options 60 63 64 | `18:579` | no |

#### 🛒 Cart headers

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-061 | 📅 Schedulable Schedule later | `18:711` | Cart-page states (marquee, likely) |
| S-062 | 🚫 Store closed | `18:834` | Instant to Scheduled: the toggle (coded mock, guess); Cart-page states (marquee, likely) |
| S-063 | 🚫 Stand still | `18:951` | Instant to Scheduled: the toggle (coded mock, guess); Cart-page states (marquee, likely) |
| S-064 | 🚫 Store not taking orders | `18:1068` | Cart-page states (marquee, likely) |
| S-065 | ⚠️ Order limit breached | `18:1185` | Cart-page states (marquee, likely) |
| S-066 | ⚠️ Orders per day limit | `18:1302` | no |
| S-067 | ⚠️ Weight limit exceeded | `18:1419` | Cart-page states (marquee, likely) |
| S-068 | 📱 Default | `18:1536` | Cart-page states (marquee, likely) |
| S-069 | 📅 Scheduled shipment header | `18:1653` | The central question (scroll scene, likely); Instant to Scheduled: the toggle (coded mock, guess); Cart-page states (marquee, likely) |
| S-070 | 🚫 Unserviceable shipment | `18:1775` | no |
| S-071 | 📅 Header consistency | `18:1899` | no |

#### 🗂️ Options sheet

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-087 | 🚫 Cart Items unserviceable | `18:4022` | no |
| S-088 | 🚫 Cart Order unserviceable | `18:4149` | no |
| S-089 | 🛒 Cart Scheduled delivery Edit | `18:4272` | no |
| S-090 | 🛒 Cart Delivery scheduled | `18:4395` | no |
| S-091 | 🗂️ Delivery Options sheet shipment | `18:4518` | The explorations (Detour) (still, likely); The explorations (Detour) (FigmaShot still, guess); Different ways we explored how schedule could exist on the app (still, likely); Different ways… (still, guess) |
| S-092 | 🚫 Delivery Options sheet | `18:4645` | no |
| S-093 | 🗂️ Combined Possible Negative | `18:4772` | no |
| S-094 | 🚫 Some items your cart | `18:4899` | no |
| S-095 | 🗂️ Delivery Options sheet Shipment 2 | `18:5026` | The explorations (Detour) (FigmaShot still, guess) |
| S-096 | 🧪 Scenario matrix single | `18:5153` | no |
| S-097 | 🧪 Shreya's Playground text | `18:5213` | no |

#### 🧪 Three toggles

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-098 | 🧪 UT 01 three shipments | `18:5252` | Instant to Scheduled: the toggle (FigmaShot still, likely); Instant to Scheduled: the toggle (end) (explored row, exact) |
| S-099 | 🧪 UT 01 shipment 2 expanded | `18:5387` | no |
| S-100 | 🧪 UT 01 confirm removal sheet | `30:1151` | no |
| S-101 | 🧪 UT 01 inline hints Items | `18:5644` | no |
| S-102 | 🧪 UT 02 toggle 3 options | `18:5757` | Instant to Scheduled: the toggle (FigmaShot still, likely); Instant to Scheduled: the toggle (end) (explored row, exact) |
| S-103 | 🧪 UT 02 Opt 01 04 | `18:5867` | no |
| S-104 | 🧪 UT 03 mini toggle slot | `18:5959` | Instant to Scheduled: the toggle (FigmaShot still, likely); Instant to Scheduled: the toggle (end) (explored row, exact) |
| S-105 | 🧪 UT 03 first state | `18:6053` | no |

#### 🧪 Oct 29 research

| case | screen | node | shown in the case study |
|---|---|---|---|
| S-106 | 🧪 User 01 | `18:6156` | What users told us (FigmaShot still, likely) |
| S-107 | 🧪 User 01 Did not auto | `18:6258` | What users told us (FigmaShot still, likely) |
| S-108 | 🧪 User 02 I might forget | `18:6360` | What users told us (FigmaShot still, likely) |
| S-109 | 🧪 User 03 Will products | `18:6462` | What users told us (FigmaShot still, likely) |
| S-110 | 🧪 User 02 Green tick on | `18:6564` | What users told us (FigmaShot still, likely) |
| S-111 | 🧪 Metrics card 8% VWO 50% | `18:6663` | no |

#### 🔁 Exchange and return

| case | screen | node | shown in the case study |
|---|---|---|---|
| SE-001 | 🏠 Homepage entry | `10:2683` | The returns family (playground embed, exact) |
| SE-002 | 🔁 Order Details history | `10:2724` | The returns family (playground embed, exact) |
| SE-003 | ↩️ RnR creation select issues | `10:2833` | The returns family (playground embed, exact) |
| SE-004 | 🗂️ Select Items sheet eligible | `27:1126` | The returns family (playground embed, exact) |
| SE-005 | 📱 Select Items non-eligible | `27:1256` | The returns family (playground embed, exact) |
| SE-006 | 📱 Summary per-item preference | `10:3154` | The returns family (playground embed, exact) |
| SE-007 | 🔁 Review exchange return | `10:3250` | The returns family (playground embed, exact) |
| SE-008 | 🛵 Pickup date time picker | `27:1373` | The returns family (playground embed, exact) |
| SE-009 | ✅ Order scheduled confirmation | `10:3542` | The returns family (playground embed, exact) |
| SE-010 | 🔢 OTP share OTP exchange | `10:3583` | The returns family (playground embed, exact) |
| SE-011 | 🔢 OTP generated per-item | `27:1557` | The returns family (playground embed, exact) |
| SE-012 | 🛵 Rider on way pickup | `10:3762` | The returns family (playground embed, exact) |
| SE-013 | ✅ Final UI order status | `10:3823` | The returns family (playground embed, exact) |
| SE-014 | ↩️ Review return only refund | `10:3882` | The returns family (playground embed, exact) |
| SE-015 | 🔁 Review exchange only slot | `10:3979` | The returns family (playground embed, exact) |

#### 📦 Track it

| case | screen | node | shown in the case study |
|---|---|---|---|
| TR-001 | 🔁 Replace Order getting packed | `16:1675` | no |
| TR-002 | 🔁 Replace Order on way | `16:1794` | no |
| TR-003 | 🔁 Replace Order arrived | `16:1913` | no |
| TR-004 | 🔁 Replace Order delivered | `16:2032` | no |
| TR-005 | ↩️ Return rider on way pickup | `16:2151` | no |
| TR-006 | ↩️ Return rider arrived pickup | `16:2275` | no |
| TR-007 | ↩️ Return rider picked up item | `16:2399` | no |
| TR-008 | ↩️ Refund Initiated | `16:2523` | no |
| TR-009 | ↩️ Refund Credited | `16:2647` | no |
| TR-010 | ↩️ Return cancelled | `16:2771` | no |
| TR-011 | 🔁 Replacement cancelled | `16:2899` | no |
| TR-012 | ⚠️ Replacement failed | `16:3022` | no |
| TR-013 | 🔁 Replace Return OOS partial | `16:3145` | no |
| TR-014 | 🛵 Orders WIP Pickup Scheduled | `16:3247` | no |
| TR-015 | 📦 Homepage WIP order card | `16:3297` | no |

## 3. Shown on the page, but not a screen in either file
- **The lock-screen push notification** ("What we had to design around", `notify/phone.png` + `card.png`): no notification case exists in the file.
- **The cart with "Tooltip Option 71"** (The go-to-market, plate 2, `gtm-tooltip-plate.webp`): it comes from the Public Prototypes file, not Claude: Schedule.
- **The coded "Delivery options" scenario mock** (Instant to Scheduled: the toggle).
- **The whole cart page with callouts** (`cart-page-full.webp`): a master "Cart States" frame with no case of its own.
- **Nearest guesses only:** `pdp`, `sheet`, `dir-sheet`, `sheet-picker`, `cart-hubs`. The 23 Oct render diff found no 1:1 frame for them in Claude: Schedule; they come from the older working and handoff files.

## 4. Labels that don't match their screen (worth fixing)
- **"Home prompt" Detour chip:** the image is the ongoing-order strip, not a home prompt.
- **"One combined cart" Detour chip:** the image is the Items Unserviceable cart (C-008 / S-072).
- **"Scheduled, pickup OTP" slot-page tile:** the image is an exchange pickup OTP (OT-001), not a scheduled-delivery one.
- **"Introducing Schedule for Later" (gtm-banner-later):** S-052's name adds "Skip the last minute rush", which the still doesn't show.
- **`sched-today-all` in the crossfade:** it reads "1 of 3", but S-015 is a single-shipment frame.
- **The in-motion still:** it says 3 shipments, where S-020 says 5.

## 5. Important screens not shown anywhere
- **Tracking and after-booking:** none of "📦 Track it" (TR-001 to TR-015). Of "🧾 Pay and track" and "🏠 Orders and home", only the three the main path reaches (C-031, C-032, C-039). C-033 to C-037 (tracking states), C-040 to C-047 (My Orders, cancel, home strip) and C-030 (payment) are missing. The "After you book" section that had some of these is parked.
- **The in-app return** (IA-001 to IA-017): it's wired in Figma, but only the chat paths are embedded. The playground has it built as `flow-returns-in-app-exchange-return`.
- **Pickup and refunds:** "🛵 Pickup time" (PK, 12 screens), "💸 Your refund" (RF, 4), and most of "🔢 Pickup OTP" (3 of 5).
- **What the cart does when it can't deliver:** "⚠️ Limits and errors" (C-106 to C-114: order limits, high demand, rain, errors, store closed), "🚫 Cannot deliver" (C-091 to C-097) and most of "🚫 Out of stock". These are the promises the broken-promise drafts are about.
- **Store availability** (C-048 to C-064): the cart composition by dark store and super store. Only one screen appears, as a guess.
- **Offers on a combined cart:** "🏷️ Buy X get Y" and "🔄 Swap and save" (26). Q15 keeps BxGy off the page on purpose, so these can stay out.

## 6. What's worth adding, and where
1. **"One scroll across midnight": the earlier prototype's Late night and Early morning pair.** Use frames 2 (`40000084:124154`, Today with a boxed Late night group) and 6 (`40000084:183420`, Tomorrow opening on a boxed Early morning group) as a before-and-after, or as two more steps in the crossfade. It's the case's proudest detail, and today no picture shows it. They would need exporting from the handoff file at 3x (download_assets, read-only), as in 96.3.
2. **"After you book" (parked), or a three-phone row after the main path:** C-032 tracking for tomorrow, C-039 the order card, and C-044 or C-045 the home strip. Or embed the playground's `flow-cart-order-placing-and-tracking`. The case ends at "order placed" today.
3. **The returns family: the in-app return** (`flow-returns-in-app-exchange-return`, or the IA path), beside the chat paths. It's the version most shoppers would use.
4. **The broken-promise sections, once their [CONFIRM]s close:** the limit and error cases (C-106 to C-114; the playground's `flow-cart-oos-limit-and-edge-cases`), next to the prototype screenshots for recovery and the price lock.
5. **"Slot-page states" or the slots-full path:** C-027 (the cart, no slots for a shipment). Show it as a tile, or add it to the slots-full flow (the built flow holds S-017 to S-024, not the cart side). It's the slots-full story's cart-side end.
6. **Fix the six labels in section 4.** They're small, but each one tells a reviewer the screen is something it isn't.

Leave out: Buy X get Y and Swap and save (off on purpose, Q15), the Oct 29 research board's remaining frame, and the duplicate "· old" frames.

Sources: the two read-only audit notes this was merged from, the Figma enumeration (both files, MCP) and the case-study screen map (the code on this branch), plus `~/design-playground/docs/figma-prototype/MAIN-PATH.md`, `RETURNS-PATHS.md` and `figma-names/NAMES.csv`.
