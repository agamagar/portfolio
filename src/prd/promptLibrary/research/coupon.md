# Coupon and voucher: research dossier
_Researched 2026-08-21. Sources listed at the bottom, numbered; cite by number inline._

## What the medium actually is
A coupon is a piece of commercial security printing whose defining physical event is
**separation**: it is torn from a sheet or from its own stub along a perforation, and the
stub is kept as the counterfoil. Everything else on it (the print, the panels, the seal) is
secondary to that.

Separation is measured in **TPI, teeth per inch**, the count of cuts or holes along an inch
of the line, with the paper left between the cuts called the **ties** [3][4]. **Macro or
standard perforation runs 3 to 18 TPI**, fewer and larger teeth with wider ties;
**micro-perforation runs 20 to 300 TPI**, very fine cuts with very small ties [4][6]. The
choice is a **tear strength** decision, described in the trade as light, medium or stiff
release: 3 to 6 TPI tears easily, 10 to 18 TPI resists repeated handling [4][7]. Commercial
ticket rules also place a perforation at least 1/8 inch from the edge [2].

The other separation on a coupon is the **die cut**, which is a different operation
producing a different edge: a die cuts cleanly through, so a die-cut notch is a smooth
curve, while a torn perforation snaps the ties and leaves a ragged edge with raised paper
fibre. A generated coupon that draws both edges the same way is the giveaway.

Security features that are real on coupons and vouchers: **guilloche**, the tight interlaced
engine-turned line work found on currency, generated mathematically and hard to redraw [5][8];
**hot foil stamping**, where foil is transferred under heat and pressure so the mark carries
a genuine relief impression you can feel, and which is often used to carry a guilloche [5][9];
**scratch-off latex or scratch-off foil panels**, an opaque overlay that conceals a code and
is destroyed when removed [10][11]; and the **void pantograph**, a background pattern that is
invisible in the original and reads as a word when photocopied [12].

## Vocabulary worth putting in prompts
| TERM | meaning | why a model responds | source # |
| --- | --- | --- | --- |
| macro perforation at roughly eight teeth per inch | eight cuts per inch, wide ties | a countable pitch instead of "dotted line", so the edge gets a rhythm | 3, 4 |
| ties snapped, ragged edge with raised paper fibre | the paper between the cuts, torn | forces a torn edge rather than a printed dashed rule | 3, 4 |
| die-cut notch, clean smooth curve | cut, not torn | sets up the contrast against the perf edge, the strongest authenticity tell | 4, 6 |
| counterfoil or stub | the retained portion beyond the perforation | names the two-part layout so the model does not draw one plain card | 1, 2 |
| guilloche, interlaced engine-turned line work | currency-style geometric line pattern | dense in training data attached to real security print | 5, 8 |
| hot foil stamped, relief impression | foil transferred under heat and pressure | gets metal that sits in a debossed impression, not a flat silver fill | 5, 9 |
| scratch-off latex panel, partly removed | opaque overlay concealing a code | a mechanism, and mechanisms render; "coupon-like" does not | 10, 11 |
| 14pt uncoated card stock, visible paper tooth | the actual weight and finish sold for tickets | fixes thickness and surface rather than leaving generic paper | 2 |

## What separates a convincing result from a generic one
1. **Two different edges on the same object.** Torn perf (ragged, fibrous) against die-cut
   notch (smooth). Models default to one treatment for both.
2. **The stub is present.** A coupon is a two-part document; showing only the retained half
   loses the entire logic of the object.
3. **Countable pitch.** Eight teeth per inch beats "perforated edge" the same way perf gauge
   13 beat "dotted edge" for the stamp specimen.
4. **Relief, not print.** Foil and embossing are depth effects. Asked for as colour, they
   come back as flat silver ink.

## Model-side levers
Nothing new beyond research/models.md and research/icons.md: pure white ground rather than
"transparent", alpha recovered by the white and black double render, and chaining assets off
the master through the edit path.

## Proposed clause upgrades
Applied to the "Discount coupon" asset in image/isoObjects.data.js on 2026-08-21: pitch named
in TPI with snapped ties, the die-cut versus torn contrast made explicit, the stub added at
about one third of the card, guilloche kept and given its gloss, hot foil given its relief
impression, and a half-removed scratch-off panel added as the one mechanism in the frame.
All panels stay empty, since the global rules bar text, letters, numbers and labels.

## Sources
1. Ticket Printing, PrintPlace. https://www.printplace.com/products/tickets: stub and sequential-numbering conventions for commercial tickets.
2. Event Tickets with Perforated Stub, PrintPapa. https://www.printpapa.com/eshop/pc/Event-Tickets-with-Perforated-Stub-233p2013.htm: 10pt and 14pt stock options, perforation at least 1/8 inch from the edge and 1/8 inch apart.
3. What is TPI, Presto Labels. https://prestolabels.com/what-is-tpi/: TPI defined as teeth per inch; ties; tear strength as light, medium or stiff release.
4. Perforating Paper, Are You Choosing the Right Perf, Technifold USA. https://www.technifoldusa.com/bindery-success-blog/bid/77930/perforating-paper-are-you-choosing-the-right-perf: easy release at 3 to 6 TPI, stiffer release at 10 to 18 TPI.
5. Security Voucher Printing, Gift Coupon, Holo Solution. https://www.holoteam.com/post/security-gift-coupon: guilloche and other anti-counterfeit shading patterns, embossing and stamp relief on gift coupons.
6. What Is a Micro Perforation, Technifold USA. https://www.technifoldusa.com/bindery-success-blog/what-is-a-micro-perforation: micro-perforation as many fine cuts with small ties.
7. What Is Label Perforation, MR Label Co. https://mrlabelco.com/what-is-label-perforation-and-why-does-it-matter/: release strength as a design decision.
8. Security printing overview. https://grokipedia.com/page/Security_printing: guilloche as a currency-grade geometric pattern.
9. Hot stamping, Wikipedia. https://en.wikipedia.org/wiki/Hot_stamping: foil transferred at high temperature in a relief printing process.
10. Scratch Off Foils and Labels, Holographic Innovations. https://www.holographic-innovations.com/scratch-off-foils-and-labels: scratch-off overlay concealing data, destroyed on removal.
11. Scratch-off foil grade, Infinity Foils. https://www.infinityfoils.com/foil/foil-grade/scratch-off.html: scratch-off as a hot stamping foil grade.
12. Void pantograph, Wikipedia. https://en.wikipedia.org/wiki/Void_pantograph: copy-evident background pattern; noted here and deliberately NOT used, since it resolves as a word and the library bars text.
