// Recipe for the "Schedule images" prompt system: faceless candid lifestyle
// stills of a person with their phone in the moment they would schedule a
// grocery delivery. Grew out of the phone-in-hand tile of Zepto campaign tiles
// (2026-08-16): its seven lifestyle scenarios moved here once Agam asked for them
// to be one system of their own, with no face in any composition, one cohesive
// light system that still varies by scene, and curious camera angles.
//
// Written to a six-frame phone-in-hand moodboard (fintech / streaming campaign
// stills, cited in the prose Sources): POV down the body on a leopard throw; a
// hoodie torso laughing at a pink-cased phone, face cut by the top edge; over the
// shoulder onto a phone in both hands over khakis and a canvas bag; lying on the
// back in a blue hoodie shot from above, face at the frame edge; two friends from
// below against the sky, faces cut; a bomber jacket torso in a metro concourse
// holding a blue phone sideways, head cut at the chin. What recurs: no face
// carries the frame; a person is present through hands, clothes and posture; the
// phone is small in frame and wears a coloured case; everyday rooms with their
// clutter; a soft muted 35mm film grade; the camera somewhere a snapshot would
// not be.
//
// 2026-09-04: the scenes were rewritten as INDIAN frames with a beat (see the
// SCENES comment) and the light, lens, grade and palette moved out of the
// constants into a Look dial (see LOOKS), default "Indian colour documentary".
//
// Dials, on the shared recipe contract (./recipe.js):
//   Look     - Indian colour documentary (default) or the campaign hard sun. Owns
//              use, light system, lens, finish, and which of the scene's two light
//              clauses (documentary `source` or hard `sun`) is read.
//   Scene    - the moment (bed at night, the local home, the rooftop, Sunday on the
//              mosaic floor, office at blue hour, morning counter, guests tomorrow).
//              Each carries its own camera position, frame, and light SOURCE.
//   Angle    - "Scene's own" or one of six curious camera positions from the
//              board, which override the scene's camera clause.
//   Colorway - the phone case; the screen is the contrasting blank brand field.
//   Reference - words only / anchor render / a real moodboard photograph.
//   Length   - compact (under COMPACT_LIMIT) or full.
//
// Clause order (research/models.md rule 2): use, reference, camera, frame, phone,
// light, palette-and-realism, then the rules via compose(). The light SYSTEM is
// one constant; each scene only names its source.
import { defineRecipe } from "./recipe.js";
import {
  COLORWAYS,
  REFERENCES,
  COMPACT_LIMIT,
  EXTRA_RULE,
  EXTRA_RULE_COMPACT,
  RENDER as CAMPAIGN_RENDER,
  RENDER_SHORT as CAMPAIGN_RENDER_SHORT,
} from "./zeptoCampaignViews.js";

export { COLORWAYS, REFERENCES, COMPACT_LIMIT, EXTRA_RULE, EXTRA_RULE_COMPACT };

// ---------- the constant ----------
export const USE =
  "A campaign still for a quick-commerce grocery delivery app's scheduled-delivery feature, shot as candid documentary lifestyle photography for an in-app and social campaign: the moment someone would order ahead.";
export const USE_SHORT = "Scheduled-delivery still, candid lifestyle photo.";

// No face carries the frame. Stated once, positively, as what the frame does.
export const FACELESS =
  "No face in the frame: the person is present through hands, posture and clothes, the head kept out of frame, cut by the frame edge above the chin or turned away.";
export const FACELESS_SHORT = "No face in frame.";

// The light SYSTEM, one constant across every scene: the campaign's hard sun
// (Agam, 2026-08-16: "I like the 100mm hard sun look for all"). One hard direct
// source, small and far, crisp-edged shadows with a defined core, tinted violet
// never grey, tight contact shadows. The scene only names where that hard light
// enters (a window, a doorway, open sky, a bare bulb at night).
export const LIGHT_SYSTEM =
  "Lit by one hard direct source, small and undiffused and far from the subject, the way direct sun lights a set: crisp-edged cast shadows with a defined core, every shadow tinted toward the scene's violet ambient rather than neutral grey, and a tight dark contact shadow wherever a thing meets a surface. No fill, no second source.";
export const LIGHT_SYSTEM_SHORT = "One hard source, crisp shadows tinted violet, tight contact shadows.";

// One lens for every still: the campaign's 100mm packshot look.
export const LENS = CAMPAIGN_RENDER;
export const LENS_SHORT = "100mm look, parallel verticals, crisp, no grain.";

// Palette and realism, one clause: the scene keeps its own tones, only the phone
// wears the brand, and the surface is an unretouched 35mm film look.
export const FINISH =
  "Style: the scene, room and clothes keep their own real muted tones; only the brand surface (the phone case and screen, or the crate, sweep, field or delivery bag) sits in the campaign colours, electric violet, deep aubergine, soft off-white. Clean crisp packshot finish, real skin on the hands with visible pores and a slight natural shine, no smoothing, no glow, no HDR; creased fabric, fingerprints and dust on the phone glass, a little everyday clutter left in frame.";
export const FINISH_SHORT =
  "Style: real skin, no glow; muted scene, brand colour on the brand surface only.";
// The style is stated in EVERY prompt, photo attached or not; with a photo
// attached only the skin words drop.
export const FINISH_SHORT_WITH_PHOTO =
  "Style: no glow; muted scene, brand colour only on the brand surface.";

// ---------- the LOOK: light system, lens, grade and palette, as one dial ----------
// Agam (2026-09-04): "the prompts are dead, you're not able to dial in how the
// scenes should look; they should be driven by India and colours and detail that
// evokes emotion." The cause was three clauses above: the campaign's packshot
// constants (100mm, no grain, one hard sun, no fill) and a FINISH that told the
// model to keep the room MUTED. Those were the studio crate's rules. They now live
// in one look, "Campaign hard sun", and a second look is the default:
//
// Indian colour documentary. Every clause in it is sourced:
//   research/schedule-images-light.md: Sobocinski's rule of lighting only from the
//     sources visible in frame [6]; Mehta's "two tube lights and a bulb" [1];
//     Chandran's two rules, day interiors semi-dark against the street, at night one
//     tube becomes the brightest thing [3]; the tube's green cast, CRI about 60 [15-17].
//   research/schedule-images-colour-photography.md: Raghubir Singh's colour that puts
//     foreground and background on one plane, everything in focus [8]; colour rhymes
//     across the frame [12]; one accent in a muted field [4]; the cliches named by
//     Gill, Yogananthan, Zamindar, Dadlani, Sikka [24, 27, 28, 39, 26].
//   research/schedule-images-emotion-and-levers.md: OpenAI's grounded register,
//     "natural lighting, realistic colours, no cinematic grading, honest and
//     unposed, real skin texture" [21, 22]; 35mm film photograph, subtle grain, the
//     only film language either vendor documents [21, 24]; colour steered by naming
//     the coloured object, never "vibrant" alone [24, 25]; Leiter and Eggleston's
//     single accent [7, 9]. Film-stock names and Kelvin values are NOT in any vendor
//     page and are kept out.
//   research/schedule-images-material-culture.md: the surfaces the room brings
//     (distemper, mosaic, steel, printed cotton) [5, 9, 13].
export const USE_INDIA =
  "A campaign still for a quick-commerce grocery delivery app's scheduled-delivery feature, shot as an honest unposed photograph of an Indian home or street in the moment someone orders ahead: natural available light, realistic colours, no cinematic grading.";
export const USE_INDIA_SHORT = "Scheduled-delivery still, unposed, India.";

// The light system: the sources in frame, named as objects, each its own colour.
export const LIGHT_INDIA =
  "Lit only by the sources visible in the frame, each left its own colour and none corrected to the other, the way a bare tube light, a warm bulb and a street lamp through a grill actually mix; at night one source is the brightest thing in the room and the rest falls away, by day the room stays a stop or two darker than the street outside.";
export const LIGHT_INDIA_SHORT = "Each source its own colour.";

// The lens: 35mm film look, a little wide and close, deep focus so colour carries
// the eye across one plane (Singh), subtle grain, natural colour balance (OpenAI).
export const LENS_INDIA =
  "Shot like a 35mm film photograph on a 35mm lens, close and a little wide, everything in focus from the near edge to the far wall so colour carries the eye across one plane, subtle film grain, natural colour balance.";
export const LENS_INDIA_SHORT = "35mm film look, all in focus, light grain.";

// The finish: colour placed, not poured. The room brings it as its own surfaces;
// the brand sits on the phone alone. Skin words drop when a real photo is attached.
// The one exclusion list is targeted (models.md rule 6): it names the two looks the
// model defaults to for "India", the tourist postcard and the tasteful marigold
// campaign, both named by Indian practitioners as the thing to avoid.
export const FINISH_INDIA =
  "Style: colour placed, not poured. The room brings it as its own surfaces, a chalky distemper wall, a steel tumbler, printed cotton, painted metal, with one or two colour rhymes across the frame and one saturated accent on an ordinary object, every other tone true to its material; local complexions kept true, real skin on the hands with visible pores, no smoothing, no glow, no HDR; the phone case is the only thing in a brand colour. Nothing added to signal India: no marigold market, no bazaar washed in golden light, no grain-heavy high-contrast film look.";
export const FINISH_INDIA_SHORT =
  "Style: colour placed not poured, one accent on an ordinary object; real skin, no glow; brand on the phone only; no golden-bazaar cliche.";
export const FINISH_INDIA_SHORT_WITH_PHOTO =
  "Style: one accent on an ordinary object; brand on the phone only; no golden-bazaar cliche.";

// A look owns everything that is not the scene, the people or the phone. Object
// stills (People = Objects only) always compose in the campaign look, because those
// stagings are the campaign group's and the goods on a brand sweep are not a
// documentary subject.
export const LOOKS = [
  {
    key: "india",
    label: "Indian colour documentary",
    blurb:
      "The default. Lit only by what is in the room, each source its own colour; 35mm, everything in focus, subtle grain; the room brings the colour, one accent, the brand on the phone alone.",
    use: USE_INDIA,
    useShort: USE_INDIA_SHORT,
    light: LIGHT_INDIA,
    lightShort: LIGHT_INDIA_SHORT,
    lens: LENS_INDIA,
    lensShort: LENS_INDIA_SHORT,
    finish: FINISH_INDIA,
    finishShort: FINISH_INDIA_SHORT,
    finishShortWithPhoto: FINISH_INDIA_SHORT_WITH_PHOTO,
    sourceOf: (sc) => sc.source,
    sourceShortOf: (sc) => sc.sourceShort,
  },
  {
    key: "hard-sun",
    label: "Campaign hard sun",
    blurb:
      "The campaign tiles' look on the same scenes: one hard undiffused source, crisp violet-tinted shadows, the 100mm packshot lens, no grain, the room kept muted so only the phone carries colour.",
    use: USE,
    useShort: USE_SHORT,
    light: LIGHT_SYSTEM,
    lightShort: LIGHT_SYSTEM_SHORT,
    lens: LENS,
    lensShort: LENS_SHORT,
    finish: FINISH,
    finishShort: FINISH_SHORT,
    finishShortWithPhoto: FINISH_SHORT_WITH_PHOTO,
    sourceOf: (sc) => sc.sun,
    sourceShortOf: (sc) => sc.sunShort,
  },
];
export const DEFAULT_LOOK = LOOKS[0];
const lookFor = (key) => LOOKS.find((l) => l.key === key) || LOOKS[0];

// ---------- journeys: the same moment, different people ----------
// Agam (2026-09-04): "for every primary prompt have variations that show journeys
// of different people, use our personas, for example different commute methods."
// The case's personas (src/prd/scheduledPrdData.js personaMatrix): Priya the
// commuter (plans for the evening on the train home), the coverage-edge regular
// (orders after 9pm for the morning slot; the Store closed scene) and the
// weekly-shop planner (the Sunday basket; the Sunday planning scene). The commuter
// is the one whose JOURNEY varies, so the dial is six recognisable commuters, each
// with a commute (the Commute home hero cue), a ride home with luggage (Timing it
// for arrival), a home type (the place prop in every home scene), what they wear
// and what they carry, and what waits at the kerb (Store closed). Every scene
// takes its slot from the chosen journey, so one pick changes all fifteen. The
// commute methods are the sourced ones (research/schedule-images-material-culture.md:
// the purple-and-white local, the Delhi metro's pink Ladies-only seats, the
// black-and-yellow auto with its canvas hood, the cab's yellow plate, the Activa,
// the red city bus); the home types are that dossier's floors and rooms.
export const PERSONAS = [
  {
    key: "priya",
    label: "Priya, local train",
    blurb: "The case's commuter: builds the cart on the local home, in by 7:30. A family flat with a mosaic floor.",
    commute:
      "Hero cue: standing in a crowded Mumbai local at night, one hand up on the grab pole, the phone in the other hand at chest height, cropped at the hips. Props: a cloth bag against the stomach, the wired window grill behind.",
    commuteShort: "In a crowded local at night, hand on the pole, phone in the other, cropped at the hips; cloth bag on the arm.",
    ride:
      "Hero cue: the back seat of a cab at night, a suitcase against the knee, the phone in one hand near the lap, the city's lights sliding past the window. Props: the driver's phone glowing on its dashboard mount.",
    rideShort: "Back seat of a cab at night, suitcase against the knee, phone in one hand, city lights sliding past the window.",
    home: "a family flat with a mosaic floor",
    homeShort: "a family flat",
    wear: "a cotton kurta",
    wearShort: "a kurta",
    carry: "a cloth bag",
    carryShort: "a cloth bag",
    wait: "an empty cloth bag on the shoulder",
    waitShort: "empty cloth bag on the shoulder",
    commuteLight: "Lit by the coach's LED tubes, cool and flat, with the orange and white of passing platform lamps sweeping through the open door across the bag and the hand.",
    commuteLightShort: "Light: the coach's cool LED tubes, platform lamps sweeping past.",
    rideLight: "Night, the cab's dome light off, passing white LED street lamps and shop signs sweeping colour across the seat, the hand and the window.",
    rideLightShort: "Light: dome light off, passing white lamps sweeping the seat.",
    jam: "Hero cue: on the platform at evening peak, the crowd three deep, the indicator showing the train late, the phone in one hand at chest height, cropped above the chin. Props: a cloth bag against the stomach, the overhead fans turning.",
    jamShort: "On the platform at evening peak, crowd three deep, train late, phone in one hand; cloth bag against the stomach.",
    jamLight: "Lit by the platform's tube lights, cool and flat, the blue-hour sky over the tracks.",
    jamLightShort: "Light: platform tube lights, blue-hour sky over the tracks.",
  },
  {
    key: "metro",
    label: "Metro, PG room",
    blurb: "Rides the metro to a PG room with a cot and a steel cupboard; a backpack, a hoodie.",
    commute:
      "Hero cue: seated in a metro coach at night on the pink bench, the phone in both hands over a backpack on the lap, cropped above the chin. Props: the grab poles, the dark window behind.",
    commuteShort: "Seated in a metro coach at night on the pink bench, phone in both hands over a backpack, cropped above the chin.",
    ride:
      "Hero cue: an airport metro coach at night, a suitcase between the knees, the phone in one hand, the tunnel lights strobing past the window. Props: the pink and grey seats, a backpack on the lap.",
    rideShort: "Airport metro coach at night, suitcase between the knees, phone in one hand, tunnel lights strobing past.",
    home: "a PG room with a cot and a steel cupboard",
    homeShort: "a PG room",
    wear: "a college hoodie",
    wearShort: "a hoodie",
    carry: "a backpack",
    carryShort: "a backpack",
    wait: "a backpack on both shoulders",
    waitShort: "backpack on",
    commuteLight: "Lit by the metro coach's white LED strip, even and cool, the tunnel black in the window and station lights flaring past at each stop.",
    commuteLightShort: "Light: the coach's cool white LED strip, station lights flaring past.",
    rideLight: "Lit by the airport metro's white LED strip, even and cool, the tunnel lights strobing past the window.",
    rideLightShort: "Light: the coach's cool white LED strip, tunnel lights strobing past.",
    jam: "Hero cue: on the metro platform at evening peak behind the yellow line, the crowd packed, the phone in both hands over the backpack strap, cropped above the chin. Props: the platform screen doors, a train pulling in.",
    jamShort: "On the metro platform at peak behind the yellow line, crowd packed, phone in both hands over the backpack strap.",
    jamLight: "Lit by the station's white LED panels, even and cool, the train's headlights flaring in.",
    jamLightShort: "Light: the station's cool white panels, train headlights flaring in.",
  },
  {
    key: "auto",
    label: "Auto rickshaw, old flat",
    blurb: "Takes an auto home to an older flat with a red-oxide floor; a rolled-sleeve shirt, a cloth bag.",
    commute:
      "Hero cue: in the back of a black-and-yellow auto rickshaw at night, the canvas hood above, the phone in one hand, the other hand on the side bar, cropped above the chin. Props: the meter and the driver's back beyond, street lights streaking past the open side.",
    commuteShort: "In the back of a black-and-yellow auto at night, canvas hood above, phone in one hand, other hand on the side bar.",
    ride:
      "Hero cue: the back of a black-and-yellow auto at night, a suitcase wedged by the feet, the phone in one hand, the street lights streaking past the open side. Props: the canvas hood above, the driver's back beyond.",
    rideShort: "Back of a black-and-yellow auto at night, suitcase wedged by the feet, phone in one hand, lights streaking past the open side.",
    home: "an older flat with a red-oxide floor",
    homeShort: "an old flat",
    wear: "a shirt with the sleeves rolled",
    wearShort: "a rolled-sleeve shirt",
    carry: "a cloth bag",
    carryShort: "a cloth bag",
    wait: "the auto waiting at the kerb, its meter glowing",
    waitShort: "the auto waiting at the kerb",
    commuteLight: "No light inside the auto: passing white LED street lamps and shop signs sweep through the open sides across the hand and the seat, the canvas hood dark above.",
    commuteLightShort: "Light: none inside, street lamps and shop signs sweeping through the open sides.",
    rideLight: "No light inside the auto: passing white street lamps and shop signs sweep through the open sides across the suitcase and the hand.",
    rideLightShort: "Light: none inside, street lamps sweeping through the open sides.",
    jam: "Hero cue: the auto stopped in the evening jam, the tail lights solid red ahead, the phone in one hand, the other hand on the side bar, cropped above the chin. Props: the meter ticking, a bus's side filling the open side.",
    jamShort: "The auto stopped in the evening jam, tail lights solid ahead, phone in one hand, other hand on the side bar.",
    jamLight: "Blue hour, the deep sky above the jam, red tail lights and white headlamps sweeping through the open sides.",
    jamLightShort: "Light: blue hour, red tail lights and headlamps through the open sides.",
  },
  {
    key: "cab",
    label: "Office cab, new flat",
    blurb: "The office cab to a new-build flat with big pale tiles; a formal shirt, the lanyard still on, a laptop bag.",
    commute:
      "Hero cue: the back seat of an office cab at night, the phone in one hand over a laptop bag on the lap, the seat belt across, cropped above the chin. Props: the driver's phone glowing on its mount, the window a smear of lights.",
    commuteShort: "Back seat of an office cab at night, phone in one hand over a laptop bag, seat belt across, cropped above the chin.",
    ride:
      "Hero cue: the back seat of a cab at night, a suitcase against the knee, the phone in one hand near the lap, the city's lights sliding past the window. Props: the driver's phone glowing on its dashboard mount.",
    rideShort: "Back seat of a cab at night, suitcase against the knee, phone in one hand, city lights sliding past the window.",
    home: "a new-build flat with big pale tiles",
    homeShort: "a new-build flat",
    wear: "a formal shirt with the lanyard still on",
    wearShort: "a formal shirt",
    carry: "a laptop bag",
    carryShort: "a laptop bag",
    wait: "the cab waiting at the kerb, its yellow plate under the lamp",
    waitShort: "the cab waiting at the kerb",
    commuteLight: "Night, the cab's dome light off, passing white LED street lamps and shop signs sweeping colour across the laptop bag, the hand and the window.",
    commuteLightShort: "Light: dome light off, passing white lamps sweeping across the lap.",
    rideLight: "Night, the cab's dome light off, passing white LED street lamps and shop signs sweeping colour across the seat, the hand and the window.",
    rideLightShort: "Light: dome light off, passing white lamps sweeping the seat.",
    jam: "Hero cue: the cab stopped in the evening jam, the meter running, the phone in one hand over the laptop bag, the windscreen full of tail lights, cropped above the chin. Props: the driver's phone on its mount showing the red road.",
    jamShort: "The cab stopped in the evening jam, phone in one hand over the laptop bag, windscreen full of tail lights.",
    jamLight: "Blue hour, red tail lights through the windscreen on the hands and the bag, the dome light off.",
    jamLightShort: "Light: blue hour, red tail lights through the windscreen, dome light off.",
  },
  {
    key: "pillion",
    label: "Scooter pillion, two-room flat",
    blurb: "Rides pillion on a scooter to a small two-room flat; a light jacket, a helmet.",
    commute:
      "Hero cue: riding pillion on a scooter at a red light at dusk, a helmet on, the phone in one hand held low beside the rider's back, cropped above the visor. Props: the rider's back, the tail lights of traffic ahead.",
    commuteShort: "Pillion on a scooter at a red light at dusk, helmet on, phone in one hand low beside the rider's back.",
    ride:
      "Hero cue: riding pillion on a scooter home at night with a backpack on, the phone in one hand held low, the tail lights of traffic ahead. Props: the rider's back, the helmet visor up.",
    rideShort: "Pillion on a scooter at night, backpack on, phone in one hand low, tail lights ahead.",
    home: "a small two-room flat",
    homeShort: "a two-room flat",
    wear: "a light jacket",
    wearShort: "a light jacket",
    carry: "a helmet",
    carryShort: "a helmet",
    wait: "the scooter parked at the kerb, the helmet in one hand",
    waitShort: "the scooter parked at the kerb, helmet in hand",
    commuteLight: "Dusk, the deep blue sky as the fill, the red of the tail lights ahead and the white of oncoming headlamps on the helmet and the hand.",
    commuteLightShort: "Light: dusk sky, red tail lights ahead, white headlamps on the helmet.",
    rideLight: "Night, white LED street lamps passing overhead one after another, the red of the tail lights ahead on the helmet and the hand.",
    rideLightShort: "Light: street lamps passing overhead, red tail lights ahead.",
    jam: "Hero cue: the scooter stopped at the signal in the evening jam, helmet on, the phone in one hand held low, two-wheelers packed on every side, cropped above the visor. Props: the rider's back, the signal red overhead.",
    jamShort: "Scooter stopped at the signal in the evening jam, helmet on, phone in one hand low, two-wheelers packed all round.",
    jamLight: "Blue hour, the red signal overhead on the helmet, headlamps from every side.",
    jamLightShort: "Light: blue hour, red signal on the helmet, headlamps all round.",
  },
  {
    key: "bus",
    label: "City bus, shared flat",
    blurb: "A window seat on the red city bus to a shared flat with plastic chairs; a salwar kameez, a cloth bag.",
    commute:
      "Hero cue: a window seat on a red city bus at night, the phone in one hand against the knee, the other hand on the seat bar, cropped above the chin. Props: the window's reflection of the aisle, a cloth bag on the lap.",
    commuteShort: "Window seat on a red city bus at night, phone in one hand against the knee, cropped above the chin; cloth bag on the lap.",
    ride:
      "Hero cue: a window seat on a red city bus at night, a suitcase in the aisle against the knee, the phone in one hand, the street lights sliding across the glass. Props: the seat bar, a cloth bag on the lap.",
    rideShort: "Window seat on a red city bus at night, suitcase against the knee, phone in one hand, lights sliding across the glass.",
    home: "a shared flat with plastic chairs",
    homeShort: "a shared flat",
    wear: "a salwar kameez",
    wearShort: "a salwar kameez",
    carry: "a cloth bag",
    carryShort: "a cloth bag",
    wait: "the bus stop behind, its shelter lit",
    waitShort: "the bus stop behind",
    commuteLight: "Lit by the bus's tube lights, cool and flat, with white street lamps sliding across the window glass and the hand.",
    commuteLightShort: "Light: the bus's cool tube lights, street lamps sliding across the glass.",
    rideLight: "Lit by the bus's tube lights, cool and flat, white street lamps sliding across the glass and the suitcase.",
    rideLightShort: "Light: the bus's cool tube lights, street lamps sliding across the glass.",
    jam: "Hero cue: the bus stopped in the evening jam, a window seat, the phone in one hand against the knee, the window full of tail lights, cropped above the chin. Props: the seat bar, a cloth bag on the lap.",
    jamShort: "The bus stopped in the evening jam, window seat, phone in one hand against the knee, window full of tail lights.",
    jamLight: "Lit by the bus's tube lights, cool and flat, red tail lights through the window on the hand.",
    jamLightShort: "Light: the bus's cool tube lights, red tail lights through the window.",
  },
  {
    key: "parent",
    label: "Parent, school run",
    blurb: "Drops the kids at school in the morning auto, a family flat with toys on the floor; a house kurta, a small school bag.",
    commute:
      "Hero cue: the school-run auto at half past seven in the morning, a small school bag on the lap, the phone in one hand, the other hand on the side bar, cropped above the chin. Props: a steel sipper bottle hooked on the bag, the morning traffic beyond the open side.",
    commuteShort: "In the school-run auto in the morning, a small school bag on the lap, phone in one hand, other hand on the side bar.",
    ride:
      "Hero cue: the back seat of a cab at night, a suitcase against the knee and a small school bag on the seat, the phone in one hand near the lap, the city's lights sliding past the window. Props: a steel sipper bottle rolling on the seat.",
    rideShort: "Back seat of a cab at night, suitcase against the knee, a small school bag on the seat, phone in one hand, lights sliding past.",
    home: "a family flat with toys on the floor",
    homeShort: "a family flat with toys",
    wear: "a house kurta",
    wearShort: "a house kurta",
    carry: "a small school bag",
    carryShort: "a small school bag",
    wait: "a small school bag over the shoulder",
    waitShort: "a small school bag on the shoulder",
    commuteLight: "Bright morning sun through the auto's open side in one warm patch across the bag and the hand, the street bright beyond.",
    commuteLightShort: "Light: bright morning sun through the open side, street bright beyond.",
    rideLight: "Night, the cab's dome light off, passing white LED street lamps and shop signs sweeping colour across the seat, the bag and the window.",
    rideLightShort: "Light: dome light off, passing white lamps sweeping the seat.",
    jam: "Hero cue: the school-run auto stopped in the morning jam, a small school bag on the lap, the phone in one hand, the other hand on the side bar, cropped above the chin. Props: a steel sipper bottle on the bag, the traffic packed beyond the open side.",
    jamShort: "School-run auto stopped in the morning jam, small school bag on the lap, phone in one hand, hand on the side bar.",
    jamLight: "Bright morning sun through the auto's open side across the bag and the hand, the packed road bright beyond.",
    jamLightShort: "Light: bright morning sun through the open side, packed road bright beyond.",
  },
];
const personaFor = (key) => PERSONAS.find((x) => x.key === key) || PERSONAS[0];
// A scene's frame may be a string or a function of the journey.
const frameOf = (sc, p) => (typeof sc.frame === "function" ? sc.frame(p) : sc.frame);
const frameShortOf = (sc, p) => (typeof sc.frameShort === "function" ? sc.frameShort(p) : sc.frameShort);
const fieldOf = (v, p) => (typeof v === "function" ? v(p) : v);

// ---------- time and weather: a scalable light layer ----------
// Agam (2026-09-04): "the overall theme can be bright like the other assets for
// scheduled delivery, a feeling-alive, nice-weather, outdoorsy kind of lighting;
// for scenarios where night is required accommodate that; build a scalable
// lighting system like that." The system: each scene names its PORTAL (where
// daylight enters: the balcony door, the kitchen window grill, the open doorway,
// the open sky) and which conditions fit it; the Time of day dial supplies the sky
// condition, and the clause composes as condition through portal. "Night" (and any
// scene that only works at night) falls through to the scene's own source clause,
// which names the fixtures. The two travel scenes carry their journey's light and
// skip the dial. Conditions are the light dossier's (research/schedule-images-light.md):
// the sun overhead after 8 a.m. with the ground bouncing it back [3, 11]; a golden
// hour of about thirty minutes at these latitudes [20, 21]; monsoon overcast at
// 6500 K with no shadows [8, 19]; blue hour against the first lamps [15, 21].
export const DAYLIGHTS = [
  {
    key: "bright",
    label: "Bright day",
    blurb: "The default: mid-morning sun in one crisp warm patch, pale walls bouncing it back, the room lit and airy.",
    full: (portal) =>
      `Bright, clear day: mid-morning sun through ${portal} in one crisp warm patch, the sky white-blue outside, the pale walls bouncing it back so the whole room reads lit and airy, the windows open.`,
    short: (portal) => `Light: bright mid-morning sun through ${portal}, room lit and airy.`,
  },
  {
    key: "golden",
    label: "Golden hour",
    blurb: "The sun a few degrees up, warm and low, long soft shadows, about thirty minutes of it.",
    full: (portal) =>
      `Late golden hour, the sun a few degrees above the horizon, warm and low through ${portal}, long soft shadows across the room, the light already going.`,
    short: (portal) => `Light: golden hour, low sun through ${portal}, long soft shadows.`,
  },
  {
    key: "overcast",
    label: "Monsoon overcast",
    blurb: "Full cloud and no sun, flat soft skylight, no shadows, everything wet outside.",
    full: (portal) =>
      `Monsoon overcast, full cloud and no sun, flat soft skylight through ${portal}, no shadows, everything wet outside mirroring the sky.`,
    short: (portal) => `Light: monsoon overcast, flat skylight through ${portal}, no shadows.`,
  },
  {
    key: "blue",
    label: "Blue hour",
    blurb: "Twenty minutes after sunset, deep blue sky against the first lamps coming on.",
    full: (portal) =>
      `Blue hour, twenty minutes after sunset, a deep blue sky through ${portal} against the first lamps coming on inside.`,
    short: (portal) => `Light: blue hour through ${portal}, deep blue sky, first lamps on.`,
  },
  {
    key: "night",
    label: "Night",
    blurb: "The scene's own night: the fixtures that are actually there, each its own colour.",
    full: null,
    short: null,
  },
];
const daylightFor = (key) => DAYLIGHTS.find((d) => d.key === key);
// The conditions a scene can take; empty means the scene carries its own light
// (the journey's, for the travel scenes) and the dial does not apply.
export const allowedDaylights = ({ scene }) => {
  const sc = SCENES.find((x) => x.key === scene) || SCENES[0];
  return sc.daylights || [];
};
const resolveDaylight = (pick, sc) => {
  const ok = sc.daylights || [];
  if (!ok.length) return null;
  const key = ok.includes(pick.daylight) ? pick.daylight : ok[0];
  const d = daylightFor(key);
  return d && d.full ? d : null;
};

// ---------- the recognisability rule: Agam's "Airbnb framework" ----------
// Agam (2026-09-04, from outputs): "scenes don't have a semblance to real life,
// use our Airbnb framework to build recognisable scenes." The framework is the
// Away icon system's rule (image/icons.data.js, built after the Airbnb service-icon
// set): design working backward from the viewer, build on the single most
// universally recognised, instantly understood cue for the concept; lead with one
// hero that carries the meaning by itself; at most one or two supporting props,
// only when they make the meaning clearer; a bold simple silhouette with generous
// negative space so it reads at a glance; no clutter, no busy staging, no fiddly
// elements competing with the hero. Every scene frame is now written as HERO CUE
// (the universal read of the moment: in bed at night, holding the pole in a
// crowded train, a rooftop at dusk, a shop shutter down) then at most two PROPS,
// which is where India lives (a steel tumbler, a cloth bag, the grill). The
// research density rule (one subject, one action, one place, three to five named
// things) is the same rule from the model's side.
export const FRAME_RULE =
  "Composition, working backward from the viewer: the moment reads at a glance from its one hero cue, a bold simple silhouette with generous space around it, the supporting props kept to two, no clutter, no busy staging, no small fiddly elements competing with the hero.";
export const FRAME_RULE_SHORT = "One hero cue, bold silhouette, no clutter.";

// ---------- the phone: a dial, screen OFF by default ----------
// Agam (2026-09-04, from real outputs): "the phone always renders wrong". Sourced in
// research/schedule-images-phone-and-density.md: no vendor documents phones or
// screens at all [1-7]; OpenAI concedes the model "may have difficulty placing
// elements precisely in structured or layout-sensitive compositions" and struggles
// with text on surfaces [1], which is what a lit UI plate asks for. What has
// evidence: (a) the screen-replacement compositor's plate is a DARK switched-off
// screen, composited later with Screen blend so the glass keeps its speculars [13];
// (b) name the slab by a known shape with concrete features rather than "a phone"
// [20, 21]; (c) write the hand-device contact as a physical relation in the
// vendor's own idiom, "hands naturally gripping the handlebars", "looking down at
// the open book, not at the camera" [2, 14]; (d) put the phone early, the first
// elements carry more weight [19]; (e) hex codes are documented by neither vendor
// and a text hex measured Delta E 11.25 against 0.90 for a swatch [12, 16], so the
// case is named by colour word only. The old lit brand field is kept as the
// second option for the campaign tiles' compositing habit.
const GROUND_PAIR = { violet: "offwhite", aubergine: "offwhite", offwhite: "violet" };
const colorwayFor = (key) => COLORWAYS.find((c) => c.key === key) || COLORWAYS[0];
const screenFor = (c) => colorwayFor(GROUND_PAIR[c.key] || "offwhite");
export const PHONES = [
  {
    key: "off",
    label: "Black screen, facing camera",
    blurb:
      "The default. A slab the shape of an iPhone Pro Max in the case colour, its screen facing the camera, switched off and plain black, held in one hand. The UI is composited over the black screen in Figma, which is how real screen-replacement plates are shot.",
    // Agam (2026-09-04, from outputs): "phones are appearing reversed". The earlier
    // clause said "dark glass reflecting the room" and "hand wrapped round its back",
    // which reads as the BACK glass, so the model showed the back. Now the screen is
    // named as the face toward the camera, plain black, and the hand hold is stated
    // without naming the back.
    full: (c) =>
      `The phone: a current flagship slab the shape of an iPhone Pro Max, flat edges, edge-to-edge display, in a plain matte case in ${c.desc}; its screen faces the camera, switched off, plain black, no glow, no reflection. Held in one hand with the thumb along the edge, the person looking down at the screen, not at the camera. The app interface will be set over the black screen later in Figma.`,
    short: (c) =>
      `Phone: iPhone Pro Max shape, ${c.desc} case, black screen to camera, off; one hand, thumb on the edge.`,
  },
  {
    key: "field",
    label: "Lit brand field",
    blurb:
      "The earlier clause: a generic slab in the case colour with its screen one flat lit field of the contrasting brand colour. Kept for the campaign tiles' habit; flat colour fields render unevenly and pull the model toward painting a UI.",
    full: (c) => {
      const g = screenFor(c);
      return `The phone: a generic slab smartphone in a plain matte case in ${c.desc} with no logo. Its screen faces the camera, one flat unbroken field of ${g.desc}, a switched-on splash colour with no icons, no text and no status bar, the glass carrying a single soft highlight so it still reads as glass. Held in one hand with the thumb along the edge, the person looking down at the screen, not at the camera; the app interface will be set over that field later in Figma.`;
    },
    short: (c) => {
      const g = screenFor(c);
      return `Phone: slab, ${c.desc} case, screen to camera flat ${g.desc}, no UI; thumb on the edge.`;
    },
  },
];
const phoneFor = (key) => PHONES.find((x) => x.key === key) || PHONES[0];
const phoneFull = (c, ph) => phoneFor(ph).full(c);
const phoneShort = (c, ph) => phoneFor(ph).short(c);

// ---------- angles: the curious camera positions from the board ----------
export const ANGLES = [
  { key: "own", label: "Scene's own", blurb: "Each scene's default camera position, chosen for its mood." },
  {
    key: "pov",
    label: "POV down the body",
    risk: "High-risk from words alone: first-person POV rarely lands without a visual anchor (sourced for video, inferred for stills). Attach a reference frame in moodboard mode.",
    full: "Camera is the person's own eyes looking down their body: their forearms and hands enter from the bottom corners, the phone held up in both hands at lower centre, the room beyond.",
    short: "POV down the body.",
  },
  {
    key: "over-shoulder",
    label: "Over the shoulder",
    full: "Camera just behind and above one shoulder, looking down past it: the shoulder and hair fill one edge soft, the hands and phone sit in the lower half, the head never turns to camera.",
    short: "Over the shoulder, looking down.",
  },
  {
    key: "from-below",
    label: "From below",
    full: "Camera low, looking up from below the hands: the phone and hands loom in the lower half against sky or ceiling, chins and jaws cut by the top edge.",
    short: "From below, chins cut at the top.",
  },
  {
    key: "overhead",
    label: "Overhead",
    risk: "High-risk from words alone: true overhead drifts on extreme verticals (sourced for video, inferred for stills). Attach a reference frame in moodboard mode.",
    full: "Camera straight down from above: the body reads as shape, one hand holding the phone up toward the lens, the other loose, the head at the very frame edge cropped at the brow.",
    short: "Straight down from above.",
  },
  {
    key: "torso",
    label: "Torso, eye level",
    full: "Camera at chest height, straight on: the torso and both hands with the phone fill the middle of the frame, cropped at the hips and cut just above the chin, the room soft behind.",
    short: "Torso at eye level, cut above the chin.",
  },
  {
    key: "dutch",
    label: "Tilted",
    full: "Camera tilted about fifteen degrees off level, at chest height and close: the horizon and every straight edge run on a diagonal, the hands and phone near the centre, head cut by the top corner.",
    short: "Tilted fifteen degrees, close.",
  },
  {
    key: "through",
    label: "Through the foreground",
    full: "Camera shooting past something close and out of focus, a door frame, a shelf edge, a plant, that fills one side of the frame soft, the hands and phone sharp beyond it, head out of frame.",
    short: "Shot past a soft foreground.",
  },
  {
    key: "reflection",
    label: "In a reflection",
    full: "Camera framing the hands and phone in a reflective surface, a dark window at night, a mirror edge, a glass tabletop, so the scene reads twice, the real hands cropped and the reflection carrying the phone, head out of frame.",
    short: "Framed in a dark window's reflection.",
  },
  {
    key: "knee",
    label: "Knee level, from the side",
    full: "Camera at knee height and off to the side, looking across: the legs and lap fill the foreground, the hands and phone sit at the far edge of the lap, the torso rising out of frame.",
    short: "Knee height from the side, lap in front.",
  },
  {
    key: "behind",
    label: "From behind",
    full: "Camera directly behind the person at shoulder height: the back of the head and shoulders fill the near frame soft, the phone visible past one shoulder in the hands, the room beyond sharp.",
    short: "From behind, phone past one shoulder.",
  },
  {
    key: "wide",
    label: "Wide, small in the room",
    full: "Camera pulled back so the room is the frame and the person is small in it, off to one side, the phone a tiny bright rectangle in the hands, the head turned away or cut by an edge.",
    short: "Wide, person small in the room.",
  },
  {
    key: "low-beside",
    label: "Low beside",
    full: "Camera low and close beside the person, at the level of the surface they lie or sit on: the near hand and phone large in the foreground, the body receding, head out of frame.",
    short: "Low beside, at surface level.",
  },
];
const angleFor = (key) => ANGLES.find((a) => a.key === key) || ANGLES[0];

// ---------- scenes ----------
// Each: label, blurb, camera (default position), frame (what fills what),
// source (the light's source, physical), plus Short twins. No scene carries a
// grocery subject: the goods are not there yet.
// ---------- people: who is in the frame ----------
// The scene describes ONE body's posture and clothes; this dial adds or reduces
// the people. Counts are stated out loud (neither vendor documents hand-count
// control). Faces stay out regardless.
export const PEOPLE = [
  { key: "one", label: "One person", blurb: "The scene's own person, alone.", full: "", short: "" },
  {
    key: "two",
    label: "Two people",
    blurb: "A second person beside them, present as one more hand at the phone.",
    full: "Exactly two people: a second person close beside the first, present only as one more hand entering the frame to point at the phone or rest near it, and the edge of a second jacket; both heads out of frame.",
    short: "Exactly two people, a second hand at the phone. No face in frame.",
  },
  {
    key: "child",
    label: "With a child",
    blurb: "A small child's hand reaching in; the adult holds the phone.",
    full: "Two people: the adult holds the phone and a small child's hand reaches in from the frame edge toward it, a sleeve of a tiny tee, the child's head out of frame.",
    short: "A child's hand reaching in at the phone. No face in frame.",
  },
  {
    key: "none",
    label: "Objects only",
    blurb: "Nobody and no phone: the picked objects staged on their own. The People scenes do not apply; the Scene row switches to object scenes (crate on the sweep, colour-field packshot, edge-to-edge wall, corner peek, doorstep bag, fridge shelf, table flat lay, tote on the floor).",
    full: "",
    short: "",
  },
  {
    key: "hands",
    label: "Hands only",
    blurb: "The person reduced to hands and forearms.",
    full: "Only the hands and forearms are in the frame, the body cropped out entirely by the frame edges.",
    short: "Only hands and forearms in frame. No face in frame.",
  },
];
const peopleFor = (key) => PEOPLE.find((x) => x.key === key) || PEOPLE[0];

// ---------- objects: the scheduled-delivery assortment, up to three per still ----------
// Cues describe SHAPE only (like the campaign subjects) so an object survives any
// scene; `short` is the compact word. The objects sit in the scene as the goods
// that came, or came last time: they are props, never the subject, and never
// carry type (pack faces stay blank per the group rule).
export const OBJECTS = [
  { key: "milk", label: "Milk", short: "a milk pouch", cue: "a litre pouch of milk, soft-cornered, beaded with cold" },
  { key: "bread", label: "Bread", short: "a loaf of bread", cue: "a sliced loaf of bread in a plain sleeve, twist-tied" },
  { key: "eggs", label: "Eggs", short: "a tray of eggs", cue: "a moulded-fibre tray of brown eggs" },
  { key: "curd", label: "Curd", short: "a tub of curd", cue: "a round tub of curd with a plain foil lid" },
  { key: "bananas", label: "Bananas", short: "a hand of bananas", cue: "a hand of bananas, curved fingers joined at one crown" },
  { key: "mangoes", label: "Mangoes", short: "two mangoes", cue: "two ripe mangoes, plump ovals blushing red at the shoulder" },
  { key: "tomatoes", label: "Tomatoes", short: "vine tomatoes", cue: "a cluster of vine tomatoes with green star calyxes" },
  { key: "coriander", label: "Coriander", short: "a coriander bunch", cue: "a bunch of fresh coriander tied at the stems" },
  { key: "batter", label: "Idli batter", short: "a batter pouch", cue: "a fat pouch of idli-dosa batter, cool and pale" },
  { key: "paneer", label: "Paneer", short: "a paneer block", cue: "a block of paneer in a plain sealed pack" },
  { key: "coffee", label: "Coffee", short: "a coffee bag", cue: "a soft-block bag of ground coffee with a one-way valve" },
  { key: "cereal", label: "Cereal", short: "a cereal box", cue: "a tall cereal box, plain face" },
  { key: "water", label: "Water", short: "a water bottle", cue: "a one-litre water bottle, ribbed, clear" },
  { key: "icecream", label: "Ice cream", short: "an ice-cream tub", cue: "a round ice-cream tub sweating cold" },
  { key: "flowers", label: "Flowers", short: "a flower bunch", cue: "a bunch of loose flowers wrapped in kraft paper" },
  { key: "diapers", label: "Diapers", short: "a diaper pack", cue: "a soft plastic pack of diapers, plain face" },
  { key: "petfood", label: "Pet food", short: "a pet-food bag", cue: "a stand-up bag of pet food, plain face" },
  { key: "chips", label: "Snacks", short: "two chip bags", cue: "two pillow bags of chips, plain faces" },
  { key: "cans", label: "Cold drinks", short: "cold-drink cans", cue: "a four-pack of cold-drink cans, plain, beaded with cold" },
  { key: "atta", label: "Atta", short: "an atta bag", cue: "a five-kilo bag of atta, block-bottomed, plain face" },
  { key: "chai", label: "Cutting chai", short: "a glass of chai", cue: "a small ribbed glass of milky chai, steam rising" },
  { key: "tiffin", label: "Tiffin box", short: "a steel tiffin", cue: "a stacked steel tiffin box, lid open" },
  { key: "butter", label: "Butter", short: "a butter block", cue: "a block of butter in plain foil, one corner folded back" },
  { key: "cheese", label: "Cheese", short: "cheese slices", cue: "a flat pack of cheese slices, plain face" },
  { key: "ghee", label: "Ghee", short: "a ghee jar", cue: "a squat glass jar of ghee, plain lid" },
  { key: "rice", label: "Rice", short: "a rice bag", cue: "a five-kilo bag of rice, block-bottomed, plain face" },
  { key: "dal", label: "Dal", short: "a dal packet", cue: "a clear packet of yellow dal, folded top" },
  { key: "onions", label: "Onions", short: "onions in a net", cue: "a red net of onions, papery skins" },
  { key: "potatoes", label: "Potatoes", short: "loose potatoes", cue: "loose potatoes, dusty ovals" },
  { key: "apples", label: "Apples", short: "three apples", cue: "three red apples with short stems" },
  { key: "grapes", label: "Grapes", short: "a grape bunch", cue: "a bunch of green grapes on the stem" },
  { key: "lemons", label: "Lemons", short: "a few lemons", cue: "a few small yellow-green lemons" },
  { key: "chillies", label: "Green chillies", short: "green chillies", cue: "a small heap of slim green chillies" },
  { key: "juice", label: "Juice", short: "a juice carton", cue: "a litre juice carton, plain face, cap on top" },
  { key: "chocolate", label: "Chocolate", short: "a chocolate bar", cue: "a flat chocolate bar in plain foil and paper" },
  { key: "biscuits", label: "Biscuits", short: "a biscuit roll", cue: "a roll of round biscuits in a plain sleeve" },
  { key: "pads", label: "Sanitary pads", short: "a pack of pads", cue: "a soft plastic pack of sanitary pads, plain face" },
  { key: "tissue", label: "Toilet paper", short: "toilet rolls", cue: "a pack of four toilet rolls in clear wrap" },
  { key: "dishsoap", label: "Dish soap", short: "dish soap", cue: "a squeeze bottle of dish soap, plain, green" },
  { key: "detergent", label: "Detergent", short: "a detergent pouch", cue: "a stand-up detergent pouch, plain face" },
  { key: "babyfood", label: "Baby food", short: "a baby-food tin", cue: "a round baby-food tin, plain face" },
  { key: "frozen", label: "Frozen momos", short: "frozen momos", cue: "a frosted flat pack of frozen momos, plain face" },
  { key: "ice", label: "Ice", short: "an ice bag", cue: "a bag of ice cubes, sweating" },
  { key: "candles", label: "Candles", short: "birthday candles", cue: "a small box of birthday candles, lid open" },
  { key: "balloons", label: "Balloons", short: "a balloon pack", cue: "a flat pack of uninflated balloons in mixed colours" },
  { key: "cake", label: "Cake", short: "a cake box", cue: "a square white cake box, tied with string" },
  { key: "samosa", label: "Samosas", short: "samosas in paper", cue: "four samosas in a paper bag, one corner grease-dark" },
  { key: "coconut", label: "Coconut water", short: "a tender coconut", cue: "a tender green coconut, top hacked flat, straw in" },
  { key: "incense", label: "Incense", short: "an incense box", cue: "a slim box of incense sticks, plain face" },
  { key: "marigold", label: "Marigolds", short: "a marigold string", cue: "a string of orange marigolds, coiled" },
  { key: "medicine", label: "Medicine strip", short: "a tablet strip", cue: "a foil strip of tablets, plain" },
];
// Object GROUPS: named trios from the assortment, the moments people actually
// schedule for. Picking one sets the three objects at once; every key must exist
// in OBJECTS (the gate checks).
export const OBJECT_GROUPS = [
  { key: "breakfast", label: "Breakfast", objects: ["milk", "bread", "eggs"] },
  { key: "chai-time", label: "Chai time", objects: ["chai", "biscuits", "samosa"] },
  { key: "snacks", label: "Snacks", objects: ["chips", "cans", "chocolate"] },
  { key: "dinner", label: "Dinner", objects: ["rice", "dal", "paneer"] },
  { key: "produce", label: "Fresh produce", objects: ["tomatoes", "coriander", "onions"] },
  { key: "fruit", label: "Fruit", objects: ["bananas", "apples", "grapes"] },
  { key: "staples", label: "Weekly staples", objects: ["atta", "rice", "dal"] },
  { key: "fridge", label: "Fridge restock", objects: ["milk", "curd", "butter"] },
  { key: "south-breakfast", label: "South Indian breakfast", objects: ["batter", "coconut", "coffee"] },
  { key: "tiffin", label: "Kids' tiffin", objects: ["bread", "cheese", "tiffin"] },
  { key: "party", label: "Party planning", objects: ["cans", "chips", "cake"] },
  { key: "birthday", label: "Birthday", objects: ["cake", "candles", "balloons"] },
  { key: "festival", label: "Festival", objects: ["marigold", "incense", "flowers"] },
  { key: "puja", label: "Puja", objects: ["flowers", "incense", "coconut"] },
  { key: "baking", label: "Baking", objects: ["eggs", "butter", "chocolate"] },
  { key: "late-night", label: "Late night", objects: ["icecream", "chips", "cans"] },
  { key: "sick-day", label: "Sick day", objects: ["medicine", "juice", "water"] },
  { key: "baby", label: "Baby", objects: ["diapers", "babyfood", "milk"] },
  { key: "pet", label: "Pet", objects: ["petfood", "water", "tissue"] },
  { key: "cleaning", label: "Cleaning day", objects: ["detergent", "dishsoap", "tissue"] },
  { key: "monsoon", label: "Rainy evening", objects: ["chai", "samosa", "frozen"] },
  { key: "guests", label: "Guests tomorrow", objects: ["flowers", "juice", "biscuits"] },
];

const objectFor = (key) => OBJECTS.find((o) => o.key === key);
// Up to MAX_OBJECTS; unknown keys ignored. Raised from three to six on
// 2026-08-16 (Agam: three was not enough for interesting compositions); the
// compact budget is measured with the six longest words.
export const MAX_OBJECTS = 3; // the Airbnb framework: at most two props; three is the hard cap (was 6, 2026-09-04)
const objectsFor = (keys) =>
  (Array.isArray(keys) ? keys : keys ? [keys] : []).map(objectFor).filter(Boolean).slice(0, MAX_OBJECTS);
const list = (items) =>
  items.length <= 1 ? items.join("") : items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
// Past three objects the compact list drops its articles ("milk pouch, bread
// loaf") to stay under the cap.
const bare = (w) => w.replace(/^(a|an|two|three|four) /, "");
const objectsShort = (sc, objs) =>
  objs.length ? `${sc.objectsAtShort} ${list(objs.map((o) => (objs.length > 3 ? bare(o.short) : o.short)))}.` : "";
// ---------- object scenes: stagings for the objects-only mode ----------
// In objects-only mode there is no person, so the People scenes do not apply;
// these stagings do. Four come from the campaign group's tiles (crate macro,
// colour-field packshot, edge-to-edge wall, corner peek) and run in the campaign's
// group's stagings; four are domestic. ALL run in this system's ONE register
// (soft light system with the scene naming its source, 35mm lens family, film
// finish, same opener), so object stills and people stills read as one shoot.
// Each takes the picked objects (up to three) as `goods` and the colorway `c`
// for the scene's manufactured brand surface
// (crate, sweep, bag). `g` is the contrasting brand colour.
const goodsOf = (objs, fallback) => (objs.length ? list(objs.map((o) => o.cue)) : fallback);
const goodsShortOf = (objs, fallback) =>
  objs.length ? list(objs.map((o) => (objs.length > 3 ? bare(o.short) : o.short))) : fallback;
const NOBODY = "Nobody in the frame and no phone: the goods are the whole subject.";
const NOBODY_SHORT = "Nobody in frame, no phone: the goods are the subject.";

export const OBJECT_SCENES = [
  {
    key: "crate-sweep",
    label: "Crate on the sweep",
    blurb: "The crate preset: a perforated brand-colour crate packed with the goods on the contrasting sweep, hard sun.",
    camera: "Camera in close and slightly above the crate, a tight framing where the crate and its goods fill most of the frame.",
    cameraShort: "Camera close and slightly above, crate filling most of the frame.",
    source:
      "The hard light is direct sun from the upper left, crisp shadows dropping through the crate's perforations onto the goods.",
    sourceShort: "Light: direct sun from upper left, crisp shadows through the crate's perforations.",
    staging: (c, g, objs) => `One seamless sweep of ${g.desc}, a flat brand-colour studio ground with no horizon and no props. On it, a stackable plastic delivery crate in ${c.desc}, moulded with perforated walls and a thick rounded rim, packed above the brim with ${goodsOf(objs, "the delivered goods")}, casually real rather than styled, its rim cutting the frame on a slight diagonal. ${NOBODY}`,
    stagingShort: (c, g, objs) => `On a seamless ${g.desc} sweep, a perforated ${c.desc} delivery crate packed above the brim with ${goodsShortOf(objs, "the delivered goods")}, rim on a slight diagonal. ${NOBODY_SHORT}`,
  },
  {
    key: "field-packshot",
    label: "Colour-field packshot",
    blurb: "The campaign hero: the goods alone, low on the brand sweep, the upper third left clear for a headline.",
    camera: "Camera straight on at the goods' height, verticals parallel.",
    cameraShort: "Camera straight on, verticals parallel.",
    source:
      "The hard light is direct sun from the upper left, one crisp shadow falling long to the right on the sweep.",
    sourceShort: "Light: direct sun from upper left, one crisp shadow long to the right on the sweep.",
    staging: (c, g, objs) => `One seamless sweep of ${c.desc}, a flat brand-colour studio ground curving up with no visible corner and no horizon, about a stop of gentle falloff. On it, alone with no props, ${goodsOf(objs, "the delivered goods")}, sitting low in the frame at about 0.55 of frame height, centred, so the upper third stays one clean empty field where a headline will be set later in Figma. ${NOBODY}`,
    stagingShort: (c, g, objs) => `On a seamless ${c.desc} sweep, alone, low at 0.55 of frame height, centred, ${goodsShortOf(objs, "the delivered goods")}; upper third left clean for a headline. ${NOBODY_SHORT}`,
  },
  {
    key: "wall",
    label: "Edge-to-edge wall",
    blurb: "The goods repeated as a dense market wall filling the frame, built to sit behind a UI chip.",
    camera: "Camera square to the wall.",
    cameraShort: "Camera square to the wall.",
    source:
      "The hard light is direct sun from straight above, small crisp shadows pooling between the pieces.",
    sourceShort: "Light: direct sun from above, small crisp shadows between the pieces.",
    staging: (c, g, objs) => `${goodsOf(objs, "the delivered goods")}, repeated many times over as one dense market wall filling the frame edge to edge: no ground, no horizon, no container, the pieces packed tight at naturally varied angles, every piece crisply in focus, even density with no hero piece so a small interface chip can sit over any part of it in Figma. ${NOBODY}`,
    stagingShort: (c, g, objs) => `${goodsShortOf(objs, "the delivered goods")}, repeated as one dense wall filling the frame edge to edge, no ground, no container, even density, no hero piece. ${NOBODY_SHORT}`,
  },
  {
    key: "corner-peek",
    label: "Corner peek",
    blurb: "A flat brand field with the goods pushing in from the corners, the centre left empty for a big price.",
    camera: "Camera straight on to the flat field.",
    cameraShort: "Camera straight on.",
    source:
      "The hard light is direct sun from the upper left, crisp shadows of the goods onto the flat field.",
    sourceShort: "Light: direct sun from upper left, crisp shadows onto the field.",
    staging: (c, g, objs) => `One flat unbroken field of ${c.desc}, a pure graphic colour with no gradient and no horizon. ${goodsOf(objs, "the delivered goods")} push into the frame from its corners and edges, each cropped mid-object by the frame, sharply lit and fully in focus; the centre 60 percent stays one clean empty field for a large price or word set later in Figma. ${NOBODY}`,
    stagingShort: (c, g, objs) => `One flat ${c.desc} field. ${goodsShortOf(objs, "the delivered goods")} push in from the corners, cropped mid-object; centre 60 percent left clean for a price. ${NOBODY_SHORT}`,
  },
  {
    key: "doorstep",
    label: "Doorstep bag",
    blurb: "A kraft delivery bag on the doormat outside a flat door, the goods showing at the top, morning light down the corridor.",
    camera: "Camera low at doormat level, looking along the corridor.",
    cameraShort: "Camera low at doormat level.",
    staging: (c, g, objs) => `A flat-bottomed kraft delivery bag with its top edge rolled, a paper band in ${c.desc} around it, standing on a coir doormat outside a plain flat door, ${goodsOf(objs, "the delivered goods")} showing at the top of the bag, the corridor receding soft. ${NOBODY}`,
    stagingShort: (c, g, objs) => `A kraft delivery bag banded in ${c.desc} on a coir doormat outside a plain flat door, ${goodsShortOf(objs, "the delivered goods")} showing at the top, corridor soft. ${NOBODY_SHORT}`,
    source:
      "The hard light is low sun through the window at the corridor's end, one crisp shaft along the floor to the bag.",
    sourceShort: "Light: low sun through the corridor window, one crisp shaft along the floor to the bag.",
  },
  {
    key: "fridge",
    label: "Fridge shelf",
    blurb: "The goods just put away on a fridge shelf, door open, the fridge's own light.",
    camera: "Camera straight into the open fridge at shelf height.",
    cameraShort: "Camera straight into the open fridge at shelf height.",
    staging: (c, g, objs) => `An open fridge, one glass shelf at eye level holding ${goodsOf(objs, "the delivered goods")} just put away, the ${c.desc} delivery bag folded flat beside them, other shelves soft above and below, condensation on the glass. ${NOBODY}`,
    stagingShort: (c, g, objs) => `An open fridge, one glass shelf holding ${goodsShortOf(objs, "the delivered goods")} just put away, the ${c.desc} bag folded beside, other shelves soft. ${NOBODY_SHORT}`,
    source:
      "The hard light is a sun patch from the kitchen window falling into the open fridge, crisp on the shelf.",
    sourceShort: "Light: a sun patch from the kitchen window into the open fridge, crisp on the shelf.",
  },
  {
    key: "flatlay",
    label: "Table flat lay",
    blurb: "The goods laid out on a kitchen table from straight above, the delivery bag half folded beside.",
    camera: "Camera straight down from above the table.",
    cameraShort: "Camera straight down from above.",
    staging: (c, g, objs) => `Seen from above, a wooden kitchen table with ${goodsOf(objs, "the delivered goods")} laid out loosely, not arranged, the ${c.desc} delivery bag half folded at one edge, a crumpled receipt-sized blank slip beside it. ${NOBODY}`,
    stagingShort: (c, g, objs) => `A wooden kitchen table from above, ${goodsShortOf(objs, "the delivered goods")} laid out loosely, the ${c.desc} delivery bag half folded at one edge. ${NOBODY_SHORT}`,
    source:
      "The hard light is direct sun through the side window across the table, crisp shadows of every item.",
    sourceShort: "Light: direct sun through the side window across the table, crisp shadows.",
  },
  {
    key: "tote-floor",
    label: "Tote on the floor",
    blurb: "A tote dropped by the door, goods spilling from its mouth onto the floor, evening lamp light.",
    camera: "Camera low at floor level, off to one side.",
    cameraShort: "Camera low at floor level.",
    staging: (c, g, objs) => `A canvas tote dropped on the floor just inside a front door, tipped, ${goodsOf(objs, "the delivered goods")} spilling from its mouth onto the floorboards, a pair of shoes kicked off beside it, the ${c.desc} delivery bag flattened underneath. ${NOBODY}`,
    stagingShort: (c, g, objs) => `A canvas tote tipped on the floor inside the front door, ${goodsShortOf(objs, "the delivered goods")} spilling from its mouth, shoes kicked off beside, the ${c.desc} bag flattened underneath. ${NOBODY_SHORT}`,
    source:
      "The hard light is a low sun shaft through the door's glass across the floorboards and the tote.",
    sourceShort: "Light: a low sun shaft through the door glass across the floor and the tote.",
  },
];
const objectSceneFor = (key) => OBJECT_SCENES.find((o) => o.key === key) || OBJECT_SCENES[0];

const objectsFull = (sc, objs) =>
  objs.length ? `${sc.objectsAt} ${list(objs.map((o) => o.cue))}, from the last order, casually real rather than styled.` : "";

export const SCENES = [
  // Every scene is written as a FRAME with a PLACE and a BEAT. The place is named
  // by its real surfaces (research/schedule-images-material-culture.md: mosaic
  // floor with brass strips, distemper wall, steel almirah, MS grill, tube light,
  // Mumbai local, kirana shutter). The beat is never a feeling word: it is one
  // unplanted detail stated as inventory (a rinsed empty milk pouch, a second chai
  // glass, one diya lit to test), because a labelled feeling is the studium and a
  // plain small object is the punctum (research/schedule-images-emotion-and-levers.md,
  // Barthes A1, blind field A3, Berger's tethered gesture A5). `source` is the
  // documentary light, the visible sources named as objects with their own colour
  // (research/schedule-images-light.md); `sun` is the same scene under the campaign's
  // one hard source, read by the hard-sun look.
  {
    key: "bed-night",
    label: "Late night in bed",
    blurb: "\"When I'm heading to sleep.\" On the back under a printed blanket, the phone above the chest, the other side of the bed empty, ordering for the morning.",
    camera: "Camera low beside the pillow, at mattress level.",
    cameraShort: "Camera low beside the pillow.",
    frame:
      (p) => `Hero cue: a person in bed at night in ${p.home}, under a printed cotton blanket, the phone held up above the chest, the head out of frame past the top edge. Props: a steel tumbler of water on the bedside stool, the other side of the bed empty.`,
    frameShort:
      (p) => `In bed at night in ${p.homeShort}, phone held above the chest, head out of frame; the other side empty.`,
    source:
      "Lit by the zero-watt night bulb low on the wall, deep orange and very dim, the razai and the hands just picked out, the rest of the room falling away.",
    sourceShort: "Light: a deep-orange zero-watt bulb low on the wall, room falling away.",
    sun: "The hard light is one bare bulb close beside the bed, small and undiffused, throwing crisp shadows across the razai, the rest of the room dark.",
    sunShort: "Light: one bare bulb beside the bed, crisp shadows.",
    objectsAt: "On the bedside stool beside a steel tumbler of water,",
    objectsAtShort: "On the bedside stool,",
    daylights: ["night"],
  },
  {
    key: "commute",
    label: "Commute home",
    blurb: "\"When I haven't reached home yet.\" The commute home, by whatever the journey rides, scheduling the delivery for when they get in.",
    camera: "Camera at chest height, straight on, cut just above the chin.",
    cameraShort: "Camera at chest height, cut above the chin.",
    frame:
      (p) => p.commute,
    frameShort:
      (p) => p.commuteShort,
    source:
      (p) => p.commuteLight,
    sourceShort: (p) => p.commuteLightShort,
    sun: "The hard light is low sun in one bright slab through the opening beside them, the interior dark beyond.",
    sunShort: "Light: low sun in one slab through the opening beside them.",
    objectsAt: "In the cloth bag held against the stomach,",
    objectsAtShort: "In the cloth bag,",
    daylights: [],
  },
  {
    key: "party",
    label: "Planning a party",
    blurb: "On the rooftop parapet at blue hour with the party half planned, a second chai glass waiting. Set People to two for the friend.",
    camera: "Camera low below the chin, looking up, the jaw cut by the top edge.",
    cameraShort: "Camera low below the chin, jaw cut by the top edge.",
    frame:
      (p) => `Hero cue: a rooftop at dusk, sitting on the parapet in ${p.wear} with the phone held up in one hand, the city's lights coming on behind. Props: two moulded plastic chairs pulled together, a second glass of chai on the parapet.`,
    frameShort:
      (p) => `Rooftop at dusk, on the parapet in ${p.wearShort}, phone up in one hand, city lights behind; a second chai glass beside.`,
    source:
      "Blue hour, twenty minutes after sunset, the deep blue sky against the first white LED street lamps below and the tube lights coming on in the windows across.",
    sourceShort: "Light: blue hour, deep blue sky against white lamps and lit windows.",
    sun: "The hard light is the last low sun from behind the water tank, one crisp shadow along the parapet and the kurta.",
    sunShort: "Light: last low sun from behind the tank, one crisp shadow.",
    objectsAt: "On the parapet beside the chai glass,",
    objectsAtShort: "On the parapet,",
    daylights: ["blue", "golden", "night"],
    portal: "the open sky over the terrace",
    portalShort: "the open sky",
  },
  {
    key: "sunday-plan",
    label: "Sunday grocery planning",
    blurb: "Cross-legged on the mosaic floor against the almirah, the week's list on the back of a flyer, scheduling the staples.",
    camera: "Camera just behind and above one shoulder, looking down, the shoulder and hair filling one edge soft.",
    cameraShort: "Camera over one shoulder, looking down.",
    frame:
      (p) => `Hero cue: sitting cross-legged on the kitchen floor of ${p.home} with the phone in both hands over the lap and a handwritten list on the floor by the knee. Props: a steel dabba, the balcony door open to daylight.`,
    frameShort:
      (p) => `Cross-legged on the kitchen floor of ${p.homeShort}, phone in both hands, a handwritten list by the knee.`,
    source:
      "Day interior, semi-dark, lit only by ambient light bouncing in through the open balcony door, no fixtures on, the balcony a couple of stops brighter than the room.",
    sourceShort: "Light: day interior, semi-dark, only bounce from the balcony door.",
    sun: "The hard light is a sun patch through the balcony grill throwing its bar pattern across the mosaic floor and the lap, crisp-edged.",
    sunShort: "Light: sun through the grill, bars across the floor.",
    objectsAt: "On the floor beside the list,",
    objectsAtShort: "On the floor beside the list,",
    daylights: ["bright", "golden", "overcast"],
    portal: "the open balcony door",
    portalShort: "the balcony door",
  },
  {
    key: "office-dusk",
    label: "Office, end of day",
    blurb: "Slumped in the steel office chair with the lanyard dropped and the window gone blue, scheduling the delivery for arriving home.",
    camera: "Camera at desk height, off to one side, cut just above the chin.",
    cameraShort: "Camera at desk height, off to one side, cut above the chin.",
    frame:
      (p) => `Hero cue: slumped in an office chair at the end of the day in ${p.wear}, the phone held up in one hand, the window behind gone blue, the desk cleared. Props: ${p.carry} packed on the desk, the ID lanyard dropped beside it.`,
    frameShort:
      (p) => `In an office chair in ${p.wearShort}, phone up in one hand, window gone blue; ${p.carryShort} on the desk.`,
    source:
      "Blue hour through the window against the monitor's cool glow on one side of the hands and one warm desk lamp on the other, the ceiling tubes switched off.",
    sourceShort: "Light: blue-hour window, cool monitor glow, one warm desk lamp.",
    sun: "The hard light is low sun through the window blinds in long crisp bars across the shirt and the desk.",
    sunShort: "Light: low sun through the blinds in crisp bars.",
    objectsAt: "On the desk beside the tiffin,",
    objectsAtShort: "On the desk beside the tiffin,",
    daylights: ["blue", "golden", "night"],
    portal: "the office window",
    portalShort: "the window",
  },
  {
    key: "morning-counter",
    label: "Morning kitchen counter",
    blurb: "Forearms on the counter before the day starts, the last milk pouch rinsed and upside down on the rack, ordering for later.",
    camera: "Camera three-quarter overhead, from in front.",
    cameraShort: "Camera three-quarter overhead, from in front.",
    frame:
      (p) => `Hero cue: forearms on the kitchen counter of ${p.home} first thing in the morning, the phone flat in one hand, a steel tumbler of chai beside it, sunlight through the window. Props: a rinsed empty milk pouch upside down on the rack.`,
    frameShort:
      (p) => `Forearms on the counter of ${p.homeShort} at morning, phone flat in one hand, chai beside; empty milk pouch on the rack.`,
    source:
      "Early sun, low and already going, through the grill of the kitchen window in a bar pattern across the counter and the forearms, the tube light above still off, the room otherwise dim.",
    sourceShort: "Light: early low sun through the window grill in bars on the counter.",
    sun: "The hard light is early sun through the window grill, one crisp barred patch on the counter and the forearms.",
    sunShort: "Light: early sun through the grill, crisp on the counter.",
    objectsAt: "On the counter beside the hands,",
    objectsAtShort: "On the counter beside the hands,",
    daylights: ["bright", "golden", "overcast"],
    portal: "the kitchen window grill",
    portalShort: "the window grill",
  },
  {
    key: "hosting",
    label: "Guests tomorrow",
    blurb: "On the sofa the evening before guests arrive, the steel plates counted out on the table, ordering for the morning.",
    camera: "Camera low beside the sofa arm, looking along the body.",
    cameraShort: "Camera low beside the sofa arm.",
    frame:
      (p) => `Hero cue: lying on the sofa of ${p.home} the evening before guests, socked feet up on the armrest, the phone held up in both hands. Props: a stack of steel plates counted out on the coffee table, cushions piled at the end.`,
    frameShort:
      (p) => `On the sofa of ${p.homeShort} the evening before guests, feet up, phone in both hands; steel plates counted out on the table.`,
    source:
      "Night, one warm bulb in a wall bracket the brightest thing in the room, the tube light off, the television's blue flicker from the side across the plates.",
    sourceShort: "Light: one warm wall bulb brightest, the TV's blue flicker beside.",
    sun: "The hard light is one bare bulb in the wall bracket, small and to the side, throwing crisp shadows across the throw and the plates.",
    sunShort: "Light: one bare wall bulb, crisp shadows across the throw.",
    objectsAt: "On the coffee table beside the plates,",
    objectsAtShort: "On the coffee table,",
    daylights: ["night", "blue", "golden"],
    portal: "the living-room window",
    portalShort: "the window",
  },
  {
    key: "tiffin-night",
    label: "Packing for tomorrow",
    blurb: "At the counter late under the tube light, the steel tiffin open in three tiers, ordering what ran out. Add the tiffin from Objects.",
    camera: "Camera three-quarter overhead, from across the counter.",
    cameraShort: "Camera three-quarter overhead, from across the counter.",
    frame:
      (p) => `Hero cue: hands at the kitchen counter of ${p.home} at night packing a steel tiffin, its tiers open and half filled, the phone flat on the counter under one hand. Props: chapatis folded in a cloth, the tube light on above.`,
    frameShort:
      (p) => `At the counter of ${p.homeShort} at night packing a steel tiffin, tiers open, phone flat under one hand.`,
    source:
      "Night, lit by one bare fluorescent tube high on the kitchen wall, cool white with its faint green cast left in, the brightest thing in the room, the rest falling away.",
    sourceShort: "Light: one bare tube light high on the wall, its green cast left in.",
    sun: "The hard light is one bare bulb close above the counter, small and undiffused, crisp shadows under the hands and the tiffin.",
    sunShort: "Light: one bare bulb above the counter, crisp shadows.",
    objectsAt: "On the counter beside the tiffin,",
    objectsAtShort: "On the counter beside the tiffin,",
    daylights: ["night"],
  },
  {
    key: "post-workout",
    label: "After the workout",
    blurb: "On the floor of a small neighbourhood gym against the mirror wall, bag open, ordering breakfast for tomorrow.",
    camera: "Camera low at floor level, off to one side, cut at the shoulders.",
    cameraShort: "Camera low at floor level, off to one side, cut at the shoulders.",
    frame:
      (p) => `Hero cue: sitting on the gym floor after a workout, back against the mirror wall, knees up, the phone in one hand between the knees, cut at the shoulders. Props: ${p.carry} and a steel water bottle beside, a red bench behind.`,
    frameShort:
      (p) => `On the gym floor after a workout, back to the mirror, knees up, phone in one hand; ${p.carryShort} and a water bottle beside.`,
    source:
      "Lit by the gym's ceiling tubes reflected twice in the mirror wall, cool and flat, and the white LED street light through the doorway beyond.",
    sourceShort: "Light: ceiling tubes doubled in the mirror, street light in the door.",
    sun: "The hard light is sun through the doorway raking along the floor and the tee, the mirror throwing it back once, crisp-edged.",
    sunShort: "Light: sun through the doorway raking along the floor.",
    objectsAt: "By the open gym bag,",
    objectsAtShort: "By the gym bag,",
    daylights: ["bright", "golden", "overcast", "night"],
    portal: "the gym doorway",
    portalShort: "the doorway",
  },
  {
    key: "festival-prep",
    label: "Festival prep",
    blurb: "On the floor the day before, diyas in a row and the rangoli half drawn, one diya lit to test, ordering what the puja and the sweets need.",
    camera: "Camera slightly elevated, three-quarter from across the floor.",
    cameraShort: "Camera slightly elevated, from across the floor.",
    frame:
      (p) => `Hero cue: hands in a bright kurta sleeve on the floor of ${p.home} before a row of clay diyas, the first ones already lit, the phone flat in the other hand. Props: a string of fairy lights not yet hung, a half-drawn rangoli.`,
    frameShort:
      (p) => `Hands on the floor of ${p.homeShort} before a row of clay diyas, the first lit, phone flat in the other hand; fairy lights unhung.`,
    source:
      "Late afternoon, sun through the open doorway in one long slab across the floor, the single lit diya a small deep-orange flame inside it, the room beyond the slab dim.",
    sourceShort: "Light: late sun in one slab through the doorway, the lit diya's flame.",
    sun: "The hard light is direct sun through the open doorway across the marigold floor, crisp-edged, the lit diya lost in it.",
    sunShort: "Light: direct sun through the open doorway, crisp-edged.",
    objectsAt: "Beside the row of diyas,",
    objectsAtShort: "Beside the diyas,",
    daylights: ["golden", "bright", "night"],
    portal: "the open doorway",
    portalShort: "the doorway",
  },
  {
    key: "rainy-window",
    label: "Rainy evening",
    blurb: "Knees up on the diwan against the window while the monsoon comes through the grill, ordering the things nobody wants to go out for.",
    camera: "Camera low beside the diwan, looking along it.",
    cameraShort: "Camera low beside the diwan, looking along it.",
    frame:
      (p) => `Hero cue: curled up on a diwan against the window of ${p.home} while rain streams down the glass and the grill, the phone held in both hands against the knees under a cotton blanket. Props: a steel tumbler of chai on the sill, the room dim.`,
    frameShort:
      (p) => `Curled up by the window of ${p.homeShort}, rain down the glass and grill, phone in both hands under a blanket; chai on the sill.`,
    source:
      "Monsoon overcast, full cloud and no sun, flat blue-grey skylight through the wet grill with no shadows, the wet lane below mirroring the first lamps.",
    sourceShort: "Light: monsoon overcast, flat blue-grey skylight through the grill.",
    sun: "The hard light is one break of sun through the rain-streaked grill, one crisp barred shaft across the blanket.",
    sunShort: "Light: one shaft of sun through the wet grill, crisp-edged.",
    objectsAt: "On the sill inside the grill,",
    objectsAtShort: "On the sill,",
    daylights: ["overcast"],
    portal: "the rain-streaked window grill",
    portalShort: "the wet grill",
  },
  {
    key: "balcony-chai",
    label: "Balcony at first light",
    blurb: "Forearms on the balcony grill in the half hour before sunrise, chai on the ledge, ordering the day's staples. Add the chai from Objects.",
    camera: "Camera from behind and beside, at rail height.",
    cameraShort: "Camera from behind and beside, at rail height.",
    frame:
      (p) => `Hero cue: forearms on the balcony grill of ${p.home} in the half-light before sunrise, the phone in one hand, a steel tumbler of chai on the ledge, the lane below still quiet. Props: clothes on the drying rack behind.`,
    frameShort:
      (p) => `Forearms on the balcony grill of ${p.homeShort} before sunrise, phone in one hand, chai tumbler on the ledge; clothes drying behind.`,
    source:
      "The half hour before sunrise, light present but not yet bright, a little haze in the far buildings, the street lamps still on and going pale.",
    sourceShort: "Light: the half hour before sunrise, not yet bright, lamps still on.",
    sun: "The hard light is the first direct sun from low behind the buildings, crisp shadows of the grill bars along the ledge and the forearms.",
    sunShort: "Light: first sun behind the buildings, crisp grill shadows.",
    objectsAt: "On the ledge beside the tumbler,",
    objectsAtShort: "On the ledge,",
    daylights: ["golden", "bright", "overcast"],
    portal: "the open sky over the lane",
    portalShort: "the open sky",
  },
  {
    key: "next-morning",
    label: "Planning ahead for morning",
    blurb: "The dining table at night with tomorrow laid out, school bag zipped and the tiffin open and empty, ordering the morning's things now.",
    camera: "Camera slightly elevated, three-quarter from across the table.",
    cameraShort: "Camera slightly elevated, from across the table.",
    frame:
      (p) => `Hero cue: the dining table at night with a zipped school bag and a folded uniform ready for morning, the phone held flat in one hand at the table's edge, the sleeve of ${p.wear} entering the frame. Props: an empty steel tiffin open beside the bag.`,
    frameShort:
      (p) => `Table at night, school bag zipped, uniform folded, phone flat in one hand, sleeve of ${p.wearShort} in frame; empty tiffin beside.`,
    source:
      "Night, one warm bulb in a pendant low over the table the brightest thing, the tube light on the far wall switched off, the corners of the room falling away.",
    sourceShort: "Light: one warm pendant bulb low over the table, tube off.",
    sun: "The hard light is one bare pendant bulb low over the table, small and close, crisp shadows of the bag and the tiffin.",
    sunShort: "Light: one bare pendant bulb over the table, crisp shadows.",
    objectsAt: "At the table's edge beside the tiffin,",
    objectsAtShort: "At the table's edge,",
    daylights: ["night"],
  },
  {
    key: "reaching-back",
    label: "Timing it for arrival",
    blurb: "Coming home late with luggage, by whatever the journey rides, ordering so it lands when they do.",
    camera: "Camera over one shoulder from the far seat, looking down at the phone.",
    cameraShort: "Camera over one shoulder from the far seat, looking down.",
    frame:
      (p) => p.ride,
    frameShort:
      (p) => p.rideShort,
    source:
      (p) => p.rideLight,
    sourceShort: (p) => p.rideLightShort,
    sun: "The hard light is a passing streetlamp through the cab window, one small hard source sweeping crisp shadows across the seat and the knee.",
    sunShort: "Light: a passing streetlamp, crisp shadows across the seat.",
    objectsAt: "On the seat beside the suitcase,",
    objectsAtShort: "On the seat,",
    daylights: [],
  },
  {
    key: "store-closed",
    label: "Store closed, order for later",
    blurb: "Outside the kirana's pulled-down shutter late at night, bag empty, ordering now for the morning slot instead.",
    camera: "Camera at chest height, straight on, cut just above the chin.",
    cameraShort: "Camera at chest height, cut above the chin.",
    frame:
      (p) => `Hero cue: standing before a shop's pulled-down metal shutter at night under the street lamp, the phone in both hands at chest height, cropped above the chin. Props: ${p.wait}, a street dog asleep by the step.`,
    frameShort:
      (p) => `At a shop's pulled-down shutter at night under a street lamp, phone in both hands; ${p.waitShort}.`,
    source:
      "Night, one cool white LED street lamp on the pole overhead, a sharp pool of light on the shutter and dark between the poles, a little blue in the shadows, no orange sodium.",
    sourceShort: "Light: one cool white LED street lamp overhead, no orange sodium.",
    sun: "The hard light is one streetlamp above and to the side, small and hard, crisp shadows down the shutter's corrugations.",
    sunShort: "Light: one streetlamp above, crisp shadows down the shutter.",
    objectsAt: "In the cloth bag's open mouth,",
    objectsAtShort: "In the bag's open mouth,",
    daylights: ["night"],
  },
  {
    key: "family-lunch",
    label: "Family lunch",
    blurb: "Sunday lunch with the kids at the table, steel thalis laid, ordering what ran out before the next one. Set People to with a child for a small hand in frame.",
    camera: "Camera at table height from the end of the table, looking along it.",
    cameraShort: "Camera at table height, along the table.",
    frame: (p) => `Hero cue: the family lunch table of ${p.home} on a Sunday afternoon, steel thalis and katoris laid, two small hands reaching in from the sides for the rice, the phone held in one hand just under the table's edge, the adult's head out of frame past the top. Props: a pressure cooker on a trivet, a steel jug of water.`,
    frameShort: (p) => `Lunch table of ${p.homeShort}, steel thalis laid, two small hands reaching in, phone in one hand under the table edge.`,
    source: "Day interior, the dining room semi-dark against the bright window, the thalis catching the light from it.",
    sourceShort: "Light: day interior, semi-dark, the thalis catching the window.",
    sun: "The hard light is midday sun through the dining-room window in one crisp slab across the thalis and the small hands.",
    sunShort: "Light: midday sun in one slab across the thalis.",
    objectsAt: "At the table's edge beside the jug,",
    objectsAtShort: "At the table's edge,",
    daylights: ["bright", "golden", "overcast"],
    portal: "the dining-room window",
    portalShort: "the dining window",
  },
  {
    key: "store-down",
    label: "Store down, back in fifteen",
    blurb: "\"When the store's down and it's back in fifteen minutes.\" Cooking paused halfway, the onions chopped and the cooker open, waiting it out on the phone.",
    camera: "Camera at counter height, off to one side, cut at the shoulders.",
    cameraShort: "Camera at counter height, cut at the shoulders.",
    frame: (p) => `Hero cue: leaning back against the kitchen counter of ${p.home} with the cooking paused halfway, onions chopped on the board and the pressure cooker open on the hob, the phone in one hand held up, the other arm folded, cut at the shoulders. Props: a steel tumbler, the tea towel over the shoulder.`,
    frameShort: (p) => `Leaning on the counter of ${p.homeShort}, cooking paused, cooker open, phone up in one hand, cut at the shoulders.`,
    source: "Night, lit by one bare fluorescent tube high on the kitchen wall, cool white with its green cast left in, the hob's blue ring the only other light.",
    sourceShort: "Light: one bare tube light high on the wall, green cast left in, hob's blue ring.",
    sun: "The hard light is sun through the kitchen window grill in one crisp barred patch across the counter and the board.",
    sunShort: "Light: sun through the grill, one crisp patch on the counter.",
    objectsAt: "On the counter beside the board,",
    objectsAtShort: "On the counter,",
    daylights: ["bright", "golden", "overcast", "night"],
    portal: "the kitchen window grill",
    portalShort: "the window grill",
  },
  {
    key: "meetings",
    label: "Back-to-back meetings",
    blurb: "\"Back-to-back meetings. I didn't want to forget to order later.\" In the glass meeting room between two calls, the next one already on the screen, scheduling it now so it is done.",
    camera: "Camera at table height across the meeting-room table, cut just above the chin.",
    cameraShort: "Camera across the meeting table, cut above the chin.",
    frame: (p) => `Hero cue: at the glass meeting-room table between two calls, in ${p.wear}, the laptop open with the next call's waiting screen, the phone held low in one hand just below the table's edge, cropped above the chin. Props: a paper cup of coffee, ${p.carry} on the next chair.`,
    frameShort: (p) => `In the glass meeting room between calls in ${p.wearShort}, laptop open, phone low in one hand below the table.`,
    source: "Night in the office, lit by the ceiling panels, cool and even, the laptop screen's blue on the hands, the glass wall reflecting the room.",
    sourceShort: "Light: office ceiling panels, cool and even, the laptop's blue on the hands.",
    sun: "The hard light is sun through the meeting room's glass wall in long crisp bars across the table and the hands.",
    sunShort: "Light: sun through the glass wall in crisp bars across the table.",
    objectsAt: "On the table beside the cup,",
    objectsAtShort: "On the table beside the cup,",
    daylights: ["bright", "golden", "blue", "night"],
    portal: "the meeting room's glass wall",
    portalShort: "the glass wall",
  },
  {
    key: "peak-traffic",
    label: "Peak hour, stuck in traffic",
    blurb: "\"It was peak. Orders get delayed in traffic anyway.\" Stopped in the evening jam by whatever the journey rides, scheduling it for a slot after the rush.",
    camera: "Camera at chest height, straight on, cut just above the chin.",
    cameraShort: "Camera at chest height, cut above the chin.",
    frame: (p) => p.jam,
    frameShort: (p) => p.jamShort,
    source: (p) => p.jamLight,
    sourceShort: (p) => p.jamLightShort,
    sun: "The hard light is the last low sun down the length of the jammed road, one crisp slab across the hands and the phone.",
    sunShort: "Light: last low sun down the jammed road, one crisp slab on the hands.",
    objectsAt: "In the bag on the lap,",
    objectsAtShort: "In the bag on the lap,",
    daylights: [],
  },
  {
    key: "gifting",
    label: "A gift for someone",
    blurb: "\"For a birthday or anniversary. To gift someone.\" Wrapping a small box at the table with a card half written, the phone in one hand ordering the cake for the morning.",
    camera: "Camera three-quarter overhead, from across the table.",
    cameraShort: "Camera three-quarter overhead, from across the table.",
    frame: (p) => `Hero cue: the table of ${p.home} with a small gift box half wrapped in bright paper, a folded card beside it with a pen across, the phone held flat in one hand at the table's edge, the sleeve of ${p.wear} entering the frame. Props: a curl of ribbon, a pair of scissors.`,
    frameShort: (p) => `Table of ${p.homeShort}, a small gift box half wrapped, card and pen beside, phone flat in one hand at the edge.`,
    source: "Night, one warm bulb in a pendant low over the table the brightest thing, the tube light on the far wall off, the wrapping paper glowing under it.",
    sourceShort: "Light: one warm pendant bulb low over the table, the paper glowing under it.",
    sun: "The hard light is sun through the window in one crisp patch across the wrapping paper and the hands.",
    sunShort: "Light: sun through the window, one crisp patch across the paper.",
    objectsAt: "At the table's edge beside the ribbon,",
    objectsAtShort: "At the table's edge,",
    daylights: ["bright", "golden", "overcast", "night"],
    portal: "the window",
    portalShort: "the window",
  },
];




// ---------- compatibility: what fits with what, from a visual point of view ----------
// Angles that imply a person's body: never on an object-only staging.
export const PERSON_ANGLES = ["pov", "over-shoulder", "torso", "knee", "behind"];
// Angles that need a standing or seated torso: never with "Hands only".
const TORSO_ANGLES = ["torso", "behind", "from-below"];
// Per scene, the angles that make visual sense (a walking commuter cannot be shot
// from mattress level; a table flat lay cannot be shot from below).
export const SCENE_ANGLES = {
  "bed-night": ["own", "pov", "overhead", "dutch", "through", "low-beside", "wide", "over-shoulder"],
  commute: ["own", "torso", "behind", "through", "dutch", "wide", "reflection", "from-below", "pov", "over-shoulder"],
  party: ["own", "from-below", "torso", "over-shoulder", "pov", "dutch", "through", "wide", "behind", "overhead"],
  "sunday-plan": ["own", "over-shoulder", "overhead", "pov", "knee", "low-beside", "dutch", "through", "wide", "behind", "torso"],
  "office-dusk": ["own", "torso", "knee", "over-shoulder", "pov", "through", "dutch", "wide", "behind", "low-beside", "reflection"],
  "morning-counter": ["own", "overhead", "torso", "over-shoulder", "pov", "through", "dutch", "wide", "behind", "low-beside"],
  hosting: ["own", "pov", "overhead", "low-beside", "dutch", "through", "wide", "knee", "over-shoulder"],
  "tiffin-night": ["own", "overhead", "torso", "over-shoulder", "pov", "through", "dutch", "wide", "behind", "low-beside"],
  "post-workout": ["own", "low-beside", "knee", "over-shoulder", "pov", "overhead", "dutch", "through", "wide", "torso", "behind"],
  "festival-prep": ["own", "overhead", "over-shoulder", "pov", "low-beside", "knee", "dutch", "through", "wide", "behind"],
  "rainy-window": ["own", "low-beside", "knee", "pov", "over-shoulder", "through", "dutch", "wide", "reflection", "behind", "overhead"],
  "balcony-chai": ["own", "behind", "over-shoulder", "pov", "torso", "low-beside", "through", "dutch", "wide", "from-below"],
  "next-morning": ["own", "overhead", "over-shoulder", "pov", "torso", "knee", "through", "dutch", "wide", "behind", "low-beside"],
  "reaching-back": ["own", "over-shoulder", "pov", "knee", "through", "dutch", "reflection", "low-beside", "torso"],
  "store-closed": ["own", "torso", "behind", "from-below", "through", "dutch", "wide", "over-shoulder", "pov"],
  "family-lunch": ["own", "overhead", "over-shoulder", "low-beside", "through", "dutch", "wide", "knee"],
  "store-down": ["own", "torso", "over-shoulder", "pov", "through", "dutch", "wide", "low-beside", "knee"],
  meetings: ["own", "torso", "over-shoulder", "through", "reflection", "dutch", "wide", "knee", "pov"],
  "peak-traffic": ["own", "torso", "through", "dutch", "reflection", "over-shoulder", "pov", "from-below"],
  gifting: ["own", "overhead", "over-shoulder", "pov", "through", "dutch", "wide", "low-beside"],
};
export const OBJECT_SCENE_ANGLES = {
  "crate-sweep": ["own", "overhead", "dutch", "low-beside"],
  "field-packshot": ["own", "low-beside"],
  wall: ["own", "dutch"],
  "corner-peek": ["own"],
  doorstep: ["own", "overhead", "dutch", "through", "wide", "low-beside"],
  fridge: ["own", "dutch", "through", "low-beside"],
  flatlay: ["own", "dutch"],
  "tote-floor": ["own", "overhead", "dutch", "through", "low-beside", "wide"],
};
// Per scene, which People options fit: "Hands only" needs a hands-forward frame,
// "With a child" needs a home, "Two people" needs room for a second body.
export const SCENE_PEOPLE = {
  "bed-night": ["one", "two", "hands", "none"],
  commute: ["one", "two", "none"],
  party: ["one", "two", "none"],
  "sunday-plan": ["one", "two", "child", "hands", "none"],
  "office-dusk": ["one", "two", "none"],
  "morning-counter": ["one", "child", "hands", "none"],
  hosting: ["one", "two", "child", "hands", "none"],
  "tiffin-night": ["one", "child", "hands", "none"],
  "post-workout": ["one", "hands", "none"],
  "festival-prep": ["one", "two", "child", "hands", "none"],
  "rainy-window": ["one", "two", "child", "hands", "none"],
  "balcony-chai": ["one", "two", "hands", "none"],
  "next-morning": ["one", "child", "hands", "none"],
  "reaching-back": ["one", "two", "hands", "none"],
  "store-closed": ["one", "two", "none"],
  "family-lunch": ["one", "child", "hands", "none"],
  "store-down": ["one", "two", "child", "hands", "none"],
  meetings: ["one", "hands", "none"],
  "peak-traffic": ["one", "two", "none"],
  gifting: ["one", "two", "child", "hands", "none"],
};
// The one function both the picker and compose() use. Returns the allowed angle
// keys for a pick; anything else falls back to the scene's own camera.
export const allowedAngles = ({ scene, objectScene, people }) => {
  if (people === "none") return OBJECT_SCENE_ANGLES[objectScene] || ["own"];
  let list = SCENE_ANGLES[scene] || ANGLES.map((a) => a.key);
  if (people === "hands") list = list.filter((k) => !TORSO_ANGLES.includes(k));
  return list;
};
export const allowedPeople = ({ scene }) => SCENE_PEOPLE[scene] || PEOPLE.map((x) => x.key);

const referenceFor = (key) => REFERENCES.find((r) => r.key === key) || REFERENCES[0];

// One style: the recipe contract wants a styles array; every dial lives on it.
export const STYLES = [
  {
    key: "still",
    label: "Schedule still",
    blurb: "A faceless candid still of the moment someone orders ahead.",
    parts: (pick) => {
      const sc = SCENES.find((s) => s.key === pick.scene) || SCENES[0];
      // Smart build: a people option the scene cannot hold falls back to one
      // person; an angle the scene (or people option) cannot hold falls back to
      // the scene's own camera. The picker never offers those combinations, but
      // compose() is robust to them anyway.
      const peopleKey = allowedPeople({ scene: sc.key }).includes(pick.people) ? pick.people : "one";
      const okAngles = allowedAngles({ scene: sc.key, objectScene: pick.objectScene, people: peopleKey });
      const a = angleFor(okAngles.includes(pick.angle) ? pick.angle : "own");
      const c = colorwayFor(pick.colorway);
      const r = referenceFor(pick.reference);
      const photo = r.key === "moodboard";
      const objs = objectsFor(pick.objects);
      const pp = peopleFor(peopleKey);
      const look = lookFor(pick.look);
      const persona = personaFor(pick.persona);
      const dl = look.key === "india" ? resolveDaylight(pick, sc) : null;
      if (pp.key === "none") {
        // Objects only: the People scenes do not apply; an OBJECT SCENE stages the
        // goods. Same opener, light system, lens family and finish as every other
        // still in this system, so the set reads as one shoot.
        const os = objectSceneFor(pick.objectScene);
        const g = screenFor(c);
        if (pick.length === "compact")
          return [
            USE_SHORT,
            r.short,
            a.key === "own" ? os.cameraShort : a.short,
            os.stagingShort(c, g, objs),
            `${os.sourceShort} ${LIGHT_SYSTEM_SHORT}`,
            LENS_SHORT,
            photo ? FINISH_SHORT_WITH_PHOTO : FINISH_SHORT,
          ];
        return [
          USE,
          r.full,
          a.key === "own" ? os.camera : a.full,
          os.staging(c, g, objs),
          LIGHT_SYSTEM,
          os.source,
          LENS,
          FINISH,
        ];
      }
      if (pick.length === "compact")
        return [
          look.useShort,
          r.short,
          a.key === "own" ? sc.cameraShort : a.short,
          frameShortOf(sc, persona),
          FRAME_RULE_SHORT,
          phoneShort(c, pick.phone),
          pp.short ? pp.short : FACELESS_SHORT,
          objectsShort(sc, objs),
          `${dl ? dl.short(sc.portalShort) : fieldOf(look.sourceShortOf(sc), persona)} ${look.lightShort}`,
          look.lensShort,
          photo ? look.finishShortWithPhoto : look.finishShort,
        ];
      return [
        look.use,
        r.full,
        a.key === "own" ? sc.camera : a.full,
        frameOf(sc, persona),
        FRAME_RULE,
        phoneFull(c, pick.phone),
        pp.full,
        FACELESS,
        objectsFull(sc, objs),
        look.light,
        dl ? dl.full(sc.portal) : fieldOf(look.sourceOf(sc), persona),
        look.lens,
        look.finish,
      ];
    },
  },
];

export const scheduleImagesRecipe = defineRecipe({
  key: "schedule-images",
  label: "Schedule images",
  dials: {
    look: LOOKS,
    persona: PERSONAS,
    daylight: DAYLIGHTS,
    phone: PHONES,
    scene: SCENES,
    angle: ANGLES,
    people: PEOPLE,
    objectScene: OBJECT_SCENES,
    objects: OBJECTS,
    objectGroups: OBJECT_GROUPS,
    colorway: COLORWAYS,
    reference: REFERENCES,
    length: ["compact", "full"],
  },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Source size: how big the key reads relative to the person, from a whole window wall to a shaded lamp",
    "Split: how far the warm-cool split goes, from a hint of amber to a full tungsten room against a cool window",
    "Violet: how much of the cool half leans violet before it reads as a colour effect",
    "Phone size: how small the phone sits in the frame, the board holds it around a fifth of the frame width",
    "Cut: where the frame edge cuts the person, above the chin, at the brow, at the hips",
    "Grade: how muted and grainy the film look runs before it reads as a filter",
    "Clutter: how much everyday mess stays in frame",
    "Lens: 24mm wide and close to 50mm calm, always shallow on the hands",
  ],
});

export const { compose } = scheduleImagesRecipe;
