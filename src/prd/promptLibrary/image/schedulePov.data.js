// Image-generation prompts: Schedule POV. The PROSE half of the group. Every
// copy-paste block is composed from the recipe in ./schedulePovViews.js by
// ./schedulePov.js, so nothing here is a frozen prompt.

export const SPECS = [
  {
    id: "pl-schedule-pov-system",
    group: "Schedule POV",
    eyebrow: "Zepto",
    title: "Schedule POV · the system",
    summary:
      "Six candid stills for the scheduled-delivery campaign, one per moment in the person's own words, each shot the way one of Agam's realistic reference stills is shot: lying back with the phone held up, walking with a bag, looking down at the table or at their own hands, and looking down at a phone in hand with the floor or the street below. Candid, never staged, and nobody in frame the moment does not need. India is one or two real details per moment and nothing more.",
    "What this is": [
      "A photographic set for the scheduled-delivery campaign built from a six-image reference board: an overhead grid of hands working on desks and tables, and five realistic stills (a breakfast table seen from above the plate, a phone held out over a living-room floor, lying back with a phone above, walking with a bag, and being pulled round by a friend in a field).",
      "Each moment follows one reference. Heading to sleep follows the lying-back still; on the way home, the walking still; store down and a birthday gift, the breakfast table (looking down at their own hands); between meetings and at peak, the phone held out over a drop (the phone in the lap under the meeting table, and over the balcony railing). The overhead grid and the field still stay on the board as inspiration; the first read as a set and the second puts a second person in frame, so no moment copies them.",
      "Each prompt is four clauses after the use line: the camera, what the hands do, the setting with its one or two Indian details, and the look. Nothing else is carried from the other schedule groups.",
    ],
    "How to use it": [
      "Pick a moment and copy the block into a fresh Figma chat.",
      "For a keeper, attach that moment's reference image in the same chat and switch Reference image on. The block then tells the model to take the reference's camera angle, framing, hand placement, lens and light, and none of its people or setting.",
      "Phone screens are lit but blank, because the library bars text in images; the app interface is set over the screen in Figma.",
    ],
    Sources: [
      "2026-09-15 v2: Agam's six-image reference board is the primary source for every camera, lens, light and grade clause.",
      "research/schedule-pov-india-props.md for the Indian details: the block-printed sheet and ceiling fan, the metro floor's yellow tactile strip, steel tableware, office chai in a paper cup and the ID lanyard, autos and scooters in the evening jam, the rooftop's black water tanks, and no Western party stock at the gift.",
      "research/schedule-pov-model-levers.md for the wording: the body part in frame carries a first-person shot rather than the word POV; directly above rather than bird's-eye; effect words rather than camera numbers; name the reference image's role.",
      "research/schedule-pov-overhead-and-motion.md for the overhead (straight down, symmetrical, bold flat colour, soft light with short shadows) and the motion blur (the co-moving hand sharp, the surroundings streaking).",
      "v1 of this group, archived in Claude/Prompt Library/superseded/2026-09-15_schedule-pov-v1/, carried Schedule images' rules and dials over and did not follow the references; this version replaced it the same day.",
    ],
  },
];
