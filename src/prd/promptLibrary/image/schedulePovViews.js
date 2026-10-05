// Recipe for the "Schedule POV" prompt system, rebuilt 2026-09-15 (v2).
//
// Six moments for the scheduled-delivery campaign, each written in the person's
// own words, each shot the way ONE of Agam's reference images is shot:
//
//   Heading to sleep   -> Ref D  lying back on a bed, low angle from beside the
//                                head, looking up past the hair at the phone held
//                                up in both hands, lamp-lit wall behind, warm and
//                                cinematic, shallow focus.
//   On the way home    -> Ref E  first-person walking shot: own arm reaching
//                                forward from the bottom left gripping a bag
//                                handle, the floor streaking with motion blur,
//                                other people's legs ahead.
//   Store down         -> Ref B  first-person, seated, looking down across a
//                                table with a wide lens: both forearms from the
//                                bottom corners, a mug in one hand, a phone on
//                                the table, window daylight.
//   Between meetings   -> Ref C  looking steeply down at the phone held low in
//                                the lap below the meeting table's edge, the
//                                carpet below, ordinary office light.
//   At peak            -> Ref C  high angle looking steeply down past a phone held
//                                out in one hand, the scene far below soft and out
//                                of focus, warm cinematic grade.
//   A birthday gift    -> Ref B  first-person, cross-legged on the bed, looking
//                                down at their own hands wrapping a small gift,
//                                the phone lying beside it. Nobody else in frame.
//
// v2.1, same day. Agam: "a birthday gift has person in it and the between meeting
// seems like a set." The gift had used the field still, whose point is the second
// person; the meeting had used the overhead grid with a solid red desk and squared
// objects, which read as art-directed. Both now follow the realistic stills, and
// no moment adds a person the brief did not ask for. The overhead grid and the
// field still stay on the board as inspiration but no moment copies them; a moment
// is not forced onto a reference just so every reference gets used.
//
// v1 (archived in Claude/Prompt Library/superseded/2026-09-15_schedule-pov-v1/)
// failed on Agam's first look: "my reference images are not followed at all and
// too much context has been carried over." It inherited Schedule images' whole
// system (the no-face rule, the black-screen phone, the brand-colour case, the
// Indian colour documentary light and grain, the recognisability rule, rides, jam
// frames, time of day, ten dials) and its compositions drifted off the references.
// v2 takes its rules from the references instead:
//   - the composition, lens, light and grade of each moment are read off its
//     reference image, not from a shared look;
//   - no rule bans the body or the head when a reference shows it (the hair at the
//     edge of the bedroom still), but no moment adds a second person;
//   - phone screens are lit, as in Refs C and D, but blank, because the library's
//     global rule bars text and the app UI is composited later in Figma;
//   - India is one or two real details per moment and nothing more (Agam: "you
//     don't want to overdo it too much"), taken from research/schedule-pov-india-props.md;
//   - a reference-attached mode names the attached image's role, because a
//     reference is what fixes an angle that words drift on
//     (research/schedule-pov-model-levers.md, and models.md rule 4).
// The camera wording follows research/schedule-pov-model-levers.md: the body part
// in frame carries a first-person shot, not the word "POV"; "directly above" rather
// than "bird's-eye"; effect words (motion blur, shallow depth of field) rather than
// camera numbers.
//
// Clause order (models.md rule 2): use, reference, camera, action, setting, look,
// then the library rules via compose(). One clause, one job.
import { defineRecipe } from "./recipe.js";

export { COMPACT_LIMIT } from "./zeptoCampaignViews.js";

// Names the use (models.md rule 3). Deliberately short: the moment carries the rest.
export const USE =
  "Candid photo for a grocery delivery app's scheduled-delivery campaign, set in an Indian city.";

// ---------- the reference image ----------
export const REFERENCES = [
  { key: "none", label: "Words only", text: "" },
  {
    key: "attached",
    label: "Reference image attached",
    text:
      "Image 1 is a reference photo: match its camera angle, framing, hand placement, lens and light exactly; take none of its people, clothes, objects or setting.",
  },
];
const referenceFor = (key) => REFERENCES.find((r) => r.key === key) || REFERENCES[0];

// ---------- the six moments ----------
// Each: the quote, which reference it follows, and four clauses (camera, action,
// setting, look). India lives only in `setting`, one or two details.
export const MOMENTS = [
  {
    key: "sleep",
    label: "Heading to sleep",
    quote: "Last night, heading to sleep.",
    ref: "D",
    refLabel: "Lying back, phone held up (the bedroom still)",
    camera:
      "Low angle from beside the pillow, looking up past the back of their head, hair soft at the bottom edge, face unseen, at a phone held up in both hands above them, its screen facing the camera.",
    action: "Their thumb taps the screen, which glows with a plain bright app screen.",
    // india-props, moment 1: the block-printed cotton sheet, and the fan that is
    // actually overhead in an Indian bedroom.
    setting:
      "Night in a bedroom: a raised knee under a block-printed cotton sheet at the left edge, framed family photos on the wall behind, a ceiling fan at the top edge.",
    look: "Warm dim lamplight, cosy and cinematic, shallow depth of field, the phone sharp and the wall soft.",
  },
  {
    key: "way-home",
    label: "On the way home",
    quote: "On the way home. I hadn't reached yet.",
    ref: "E",
    refLabel: "Walking with a bag (the suitcase still)",
    camera:
      "First-person walking shot, wide-angle, tilted down: their own arm in a jacket sleeve reaches forward from the bottom left, the hand gripping the handle of their work laptop bag.",
    action: "Their other hand holds a phone low at the bottom right, its screen lit.",
    // v2.2 (Agam: "on the way home already has a grocery bag, does not make sense"):
    // the reference still grips a bag handle, but a cloth bag reads as shopping
    // already done, which contradicts ordering groceries. It is the work laptop bag:
    // they are coming home from work with nothing for the house yet.
    // india-props, moment 2, and the metro canon in schedule-images-material-culture:
    // the station floor with its yellow tactile guide strip.
    setting:
      "Walking out of a metro station in the evening: a grey stone floor with a yellow tactile guide strip, other commuters' legs walking ahead.",
    look: "Motion blur streaking the floor while the hand and laptop bag stay sharp, cool station light, a candid handheld snapshot.",
  },
  {
    key: "store-down",
    label: "Store down, back in fifteen",
    quote: "The store was down and coming back in fifteen. I could wait that long.",
    ref: "B",
    refLabel: "Looking down at the table (the breakfast still)",
    camera:
      "First-person, seated, looking down across a table with a wide-angle lens: both of their forearms enter from the bottom corners.",
    action: "One hand holds a glass of hot chai; the other thumb rests on a phone lying on the table, its screen lit.",
    // india-props, moment 3: steel, which is what an Indian table actually carries.
    setting:
      "A home dining table: a steel plate of biscuits and a small steel bowl, chairs and a bright window beyond.",
    look: "Soft window daylight, natural colour, everything in focus, a relaxed candid lifestyle photo.",
  },
  {
    key: "meetings",
    label: "Between meetings",
    quote: "Between back-to-back meetings. I didn't want to forget to order later.",
    ref: "C",
    refLabel: "Looking down at the phone in hand (the living-room still)",
    // v2.1 (Agam: "the between meeting seems like a set"). The overhead with a solid
    // red desk, squared objects and bold flat colour read as art-directed. What a
    // person actually does between meetings is check the phone low in the lap,
    // below the table's edge, which is the living-room still's composition: looking
    // steeply down at a phone in hand with the floor below. Ordinary office, no
    // styling words.
    camera:
      "First-person, seated at a meeting-room table, looking steeply down past the table's edge at a phone held low in their lap, its screen lit and facing up toward the camera.",
    action: "Their thumb is on the screen; their other hand rests on the edge of the table.",
    // india-props, moment 4: the paper cup of office chai and the ID lanyard.
    setting:
      "An ordinary office meeting room: the corner of an open laptop and a paper cup of chai on the grey table at the top of the frame, an ID lanyard hanging against their shirt, the office chair and carpet below.",
    look: "Flat office ceiling light, natural colour, the carpet slightly soft, an unposed snapshot taken on the sly.",
  },
  {
    key: "peak",
    label: "At peak",
    quote: "At peak. It was going to be late in traffic anyway.",
    ref: "C",
    refLabel: "Phone held out over a drop (the living-room still)",
    camera:
      "High angle looking steeply down past a phone held out in one hand over a balcony railing, a sleeve and wrist in frame, the screen lit and facing up toward the camera.",
    action: "Their thumb rests on the screen.",
    // india-props, moment 5: autos and scooters filling every gap is what the
    // evening peak actually looks like.
    setting:
      "Far below, out of focus, the evening rush on the road: autos, scooters and cars jammed together, tail lights glowing red.",
    look: "Warm dusk light, a cinematic colour grade, shallow depth of field, the phone sharp and the street a blur of lights.",
  },
  {
    key: "gift",
    label: "A birthday gift",
    quote: "A birthday gift. It only had to land on the day.",
    ref: "B",
    refLabel: "Looking down at their own hands (the breakfast still)",
    // v2.1 (Agam: "a birthday gift has person in it"). The friend in the field still
    // put a second person in the frame. The gift is now the person alone, wrapping it,
    // seen through their own eyes the way the breakfast still sees the table: both
    // forearms from the bottom corners, hands at a task, the phone beside them.
    camera:
      "First-person, sitting cross-legged on a bed, looking down at their own hands with a wide-angle lens: both forearms enter from the bottom corners, knees at the bottom edge.",
    action: "Their hands fold wrapping paper over a small gift box, a strip of tape stuck to one finger; their phone lies beside the box, its screen lit.",
    // india-props, moment 6: glossy per-sheet printed wrap and cello tape are what
    // an Indian stationery shop sells; no balloons or confetti, which is Western
    // party stock. Nobody else in the room.
    setting:
      "Alone in their room: glossy printed gift wrap on a plain cotton bedsheet, scissors, a roll of cello tape and paper offcuts scattered around.",
    look: "Warm evening room light, natural colour, everything in focus, a relaxed candid snapshot.",
  },
];
const momentFor = (key) => MOMENTS.find((m) => m.key === key) || MOMENTS[0];

export const STYLES = [
  {
    key: "pov",
    label: "Schedule POV",
    blurb: "A candid first-person still of the moment someone orders ahead, shot like its reference.",
    parts: (pick) => {
      const m = momentFor(pick.moment);
      return [USE, referenceFor(pick.reference).text, m.camera, m.action, m.setting, m.look];
    },
  },
];

export const schedulePovRecipe = defineRecipe({
  key: "schedule-pov",
  label: "Schedule POV",
  dials: { moment: MOMENTS, reference: REFERENCES, length: ["compact"] },
  styles: STYLES,
});

export const { compose } = schedulePovRecipe;
