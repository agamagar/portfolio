// Recipe for the "Pepo menu" prompt system: one 45-degree, social-media-ready hero shot per
// menu item for Pepo House (Jaipur), generated with FLUX 3 as a still-life clip and captured
// as a still (Palmier exposes FLUX 3 only as a video model). The stills go to the online
// order page (square crop) and Instagram (4:5 crop from a 3:4 render).
//
// Research: research/pepo-menu-45.md (angle, lens and framing vocabulary; Agam chose one
// 45-degree angle for every item for brand consistency, overriding the craft norm of shooting
// burgers straight-on and pizza overhead), research/flux3-video.md
// (locked camera, prompt the motion not the scene, no seed, no negative field) and
// research/models.md (clause order, targeted negation, no-text rule).
//
// What the test rounds on 2 Oct 2026 taught, before this recipe existed:
//   - Draft FLUX 3 treats "45-degree angle" loosely and drifts toward eye level on tall
//     glasses; the camera clause must say what the viewer SEES (into the top of the glass or
//     bowl, the base still in frame), not only the number.
//   - Subjects drift off-centre and get cropped (a straw cut off, fries off the right edge);
//     centring needs equal space left and right and the whole vessel named.
//   - Branded foods come back with embossed marks (a Biscoff biscuit); every cue for a
//     branded item describes the generic food as plain and unmarked.
//   - Seasoning asked for softly comes back faint; colour cues must be strong and visible.
//
// Clause order never varies (research/models.md rule 2): use, camera, framing, scene,
// subject, light, hold, then the library rules via compose().
import { defineRecipe } from "./recipe.js";

export const COMPACT_LIMIT = 1000;

export const EXTRA_RULE =
  "No hands, no people, no cutlery moving. Every biscuit, wafer, cookie, glass, cup, can, bottle and package surface is plain and unmarked.";
export const EXTRA_RULE_COMPACT = "No hands or people; food and packaging surfaces plain and unmarked.";

export const USE =
  "A social-media-ready hero food photograph for a cafe's Instagram feed and online menu, generated as a still-life clip in which almost nothing moves, so any frame works as the photograph.";
export const USE_SHORT = "Social-ready hero food photo, a near-still clip so any frame is the photo.";

// pepo-menu-45.md: BFL's own framing terms ("center framing", "negative space") [1][2], one
// framing idea per sentence [2], positives only since FLUX has no negative field [3]; the
// level-horizon sentence is inference, no source covered it.
export const FRAMING =
  "Center framing: the dish sits alone in the middle of the frame as the hero. The whole dish is visible, its rim, board edge or glass base fully inside the frame, with generous negative space above and below it. The camera is level: the back edge of the table runs straight and parallel to the top of the frame, and glasses stand perfectly upright.";
export const FRAMING_SHORT = "Center framing, dish alone mid-frame. Whole dish visible with negative space above and below. Level camera, table edge straight.";

export const SCENE =
  "It sits on a warm walnut wood cafe table; behind it the background falls away into a soft, warm, out-of-focus cafe interior with round bokeh.";
export const SCENE_SHORT = "Warm walnut table, soft warm out-of-focus cafe behind.";

export const LIGHT =
  "Bright, crisp commercial food photography: a soft key light from the front left, a clean rim light tracing the edges, true appetising colour, glistening texture and a soft contact shadow under the dish. Shallow depth of field, the front of the dish tack sharp. A real photograph, not a render or an illustration.";
export const LIGHT_SHORT = "Bright crisp food photography, soft front-left key, rim light, true colour, shallow depth of field. A real photo, not a render.";

export const HOLD =
  "Locked-off camera: the frame never moves, zooms or refocuses. The only motion is a faint wisp of steam or a bead of condensation settling.";
export const HOLD_SHORT = "Locked-off camera; only faint steam or condensation moves.";

// Vessel styles: each carries the camera clause that makes 45 degrees read for that shape.
export const STYLES = [
  {
    key: "tall-glass",
    label: "Tall glass",
    blurb: "Shakes, frappes, coolers and mocktails in a tall clear glass.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down at the glass, square-on to its front, so the viewer looks down into the top of the glass and sees its topping, while the base of the glass still rests in frame.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down, square-on; we see into the top of the glass and its base.",
  },
  {
    key: "cup",
    label: "Cup and saucer",
    blurb: "Hot coffees and hot chocolate in a ceramic cup.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down at the cup, square-on, so the viewer sees the surface of the drink inside the cup and the saucer beneath it.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down, square-on; we see the drink's surface and the saucer.",
  },
  {
    key: "bowl",
    label: "Bowl",
    blurb: "Pasta, fries, Maggi, salads and momos in a bowl.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down into the bowl, square-on, so the viewer sees the food heaped inside it and the full round rim of the bowl.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down into the bowl; we see the food and the full rim.",
  },
  {
    key: "plate",
    label: "Plate",
    blurb: "Burgers, sandwiches, wraps, appetizers and desserts on a plate.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down at the plate, square-on, so the viewer sees the top and the front face of the food and the full edge of the plate.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down, square-on; we see top and front of the food and the plate edge.",
  },
  {
    key: "board",
    label: "Pizza board",
    blurb: "A whole stone-baked pizza on a round wooden board.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down at the pizza, square-on, so the whole round pizza reads as a wide oval with its far crust and its near crust both in frame.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down; the whole pizza is a wide oval, near and far crust in frame.",
  },
  {
    key: "can",
    label: "Chilled can or bottle",
    blurb: "Packaged drinks, shown unbranded beside a glass of ice.",
    camera: "Shot on a 100mm lens from a few feet back, camera raised 45 degrees above the table and tilted down, square-on, so the viewer sees the top of the can or bottle and the glass of ice beside it, both bases in frame.",
    cameraShort: "100mm lens, camera 45 degrees above, tilted down; can top and the iced glass beside it, both bases in frame.",
  },
].map((s) => ({
  ...s,
  parts: (pick) => {
    const compact = pick.length === "compact";
    const subject = `The subject is ${pick.cue || "[SUBJECT]"}.`;
    return compact
      ? [USE_SHORT, s.cameraShort, FRAMING_SHORT, SCENE_SHORT, subject, LIGHT_SHORT, HOLD_SHORT]
      : [USE, s.camera, FRAMING, SCENE, subject, LIGHT, HOLD];
  },
}));

// One cue per menu item: what the dish IS, in the vessel its style names. Generic food words
// only, never a brand's look (see the Biscoff lesson above).
export const ITEMS = {
  "Garden Supreme Pizza": ["board", "a whole stone-baked pizza with blistered crust, topped with red and yellow bell peppers, onion, sweet corn, black olives and melted mozzarella, on a round wooden board"],
  "Cheesy Margherita Pizza": ["board", "a whole stone-baked margherita pizza with bright tomato sauce, pools of melted mozzarella and fresh basil leaves, blistered crust, on a round wooden board"],
  "Pepo-fire Paneer Pizza": ["board", "a whole stone-baked pizza topped with spicy red-orange tikka paneer cubes, red chilli flakes, onion and capsicum on melted mozzarella, charred crust, on a round wooden board"],
  "Creamy Broccoli Pizza": ["board", "a whole stone-baked pizza with a creamy white sauce, bright green broccoli florets and melted mozzarella, golden crust, on a round wooden board"],
  "OTC Pizza": ["board", "a whole stone-baked pizza topped with onion, tomato and capsicum over melted mozzarella and tomato sauce, golden crust, on a round wooden board"],
  "Jalapeño Melt Pizza": ["board", "a whole stone-baked pizza scattered with bright green jalapeño slices over bubbling melted mozzarella, golden crust, on a round wooden board"],
  "Indie Makhani Paneer Pizza": ["board", "a whole stone-baked pizza with a rich orange makhani sauce, soft paneer cubes, onion and coriander over melted mozzarella, on a round wooden board"],
  "Wild Mushroom & Basil Pesto Pizza": ["board", "a whole stone-baked pizza with a green basil pesto base, sliced sauteed mushrooms and melted mozzarella, golden crust, on a round wooden board"],
  "Pesto Paneer Pizza": ["board", "a whole stone-baked pizza with a green basil pesto base, paneer cubes and melted mozzarella, golden blistered crust, on a round wooden board"],
  "Cheese N Corn Pizza": ["board", "a whole stone-baked pizza heaped with sweet yellow corn kernels and plenty of melted mozzarella, golden crust, on a round wooden board"],
  "Pepo Pink Sauce Pasta": ["bowl", "penne pasta coated in a creamy pink tomato-cream sauce, topped with grated parmesan and a basil leaf, in a wide white ceramic bowl"],
  "Creamy Alfredo Pasta": ["bowl", "penne pasta in a glossy creamy white alfredo sauce with cracked black pepper and parsley, in a wide white ceramic bowl"],
  "Mac n Cheese": ["bowl", "elbow macaroni in a thick golden cheese sauce with a lightly browned top, in a wide white ceramic bowl"],
  "Pesto Pasta": ["bowl", "penne pasta tossed in bright green basil pesto with grated parmesan, in a wide white ceramic bowl"],
  "Classic Arrabbiata Pasta": ["bowl", "penne pasta in a spicy red arrabbiata tomato sauce with chilli flakes and basil, in a wide white ceramic bowl"],
  "Baked Pink Flamingo Pasta": ["bowl", "penne in pink tomato-cream sauce baked under a bubbling golden layer of melted cheese, in an oval ceramic baking dish"],
  "Creamy Mushroom Mac": ["bowl", "elbow macaroni in a creamy cheese sauce with sliced sauteed mushrooms, in a wide white ceramic bowl"],
  "Baked Pink Sauce Pasta": ["bowl", "pasta in pink tomato-cream sauce baked under a thick golden blistered cheese crust, in an oval ceramic baking dish"],
  "Classic Cold Coffee": ["tall-glass", "a tall clear glass of creamy iced cold coffee, pale caramel-brown, a thin layer of foam on top, ice cubes visible, beads of condensation, a paper straw standing upright"],
  "Hazelnut Frappe": ["tall-glass", "a tall clear glass of blended hazelnut coffee frappe, topped with whipped cream and a sprinkle of chopped hazelnuts"],
  "Cold Roast": ["tall-glass", "a tall clear glass of dark iced black coffee over large ice cubes, condensation on the glass"],
  "Iced Latte": ["tall-glass", "a tall clear glass of iced latte showing distinct layers of white milk and dark espresso over ice"],
  "Mocha Bliss": ["tall-glass", "a tall clear glass of chocolate mocha frappe, topped with whipped cream and a thin chocolate drizzle"],
  "Caramel Frappe": ["tall-glass", "a tall clear glass of blended caramel coffee frappe, topped with whipped cream and a golden caramel drizzle"],
  "Beaten Coffee": ["cup", "a white ceramic cup of hot frothy hand-beaten Indian coffee with a thick pale-brown foam on top, on a white saucer"],
  "Hazelnut Hot Coffee": ["cup", "a white ceramic cup of hot milky hazelnut coffee with a smooth latte-art foam top, on a white saucer"],
  "Caramel Hot": ["cup", "a white ceramic cup of hot caramel latte with a creamy foam top and a thin caramel drizzle, on a white saucer"],
  "Black Roast": ["cup", "a white ceramic cup of hot black coffee with a thin golden crema, on a white saucer"],
  "Nutella Magic": ["cup", "a white ceramic mug of thick hot hazelnut-chocolate drink with a swirl of chocolate on the foam, on a saucer"],
  "Hot Chocolate": ["cup", "a white ceramic mug of rich hot chocolate with a smooth dark top dusted with cocoa, on a saucer"],
  "Biscoff Shake": ["tall-glass", "a tall glass of thick caramel-biscuit milkshake, topped with a swirl of whipped cream, crushed spiced-biscuit crumbs and a caramel drizzle, one smooth rectangular biscuit, plain and unmarked, perched on the cream"],
  "Strawberry Milkshake": ["tall-glass", "a tall glass of thick pink strawberry milkshake topped with whipped cream and a fresh strawberry"],
  "Butterscotch Milkshake": ["tall-glass", "a tall glass of thick golden butterscotch milkshake topped with whipped cream and crunchy butterscotch bits"],
  "Mango Cheesecake Shake": ["tall-glass", "a tall glass of thick mango cheesecake milkshake, bright yellow, topped with whipped cream and crushed biscuit crumbs"],
  "Kit Kat Shake": ["tall-glass", "a tall glass of thick chocolate wafer milkshake topped with whipped cream and two chocolate-coated wafer fingers, plain and unmarked"],
  "Nutella Madness Shake": ["tall-glass", "a tall glass of thick hazelnut-chocolate milkshake with chocolate sauce streaked down the inside of the glass, topped with whipped cream"],
  "Choco Oreo Milkshake": ["tall-glass", "a tall glass of thick cookies-and-cream milkshake speckled with dark cookie crumbs, topped with whipped cream and crushed dark chocolate cookies, plain and unmarked"],
  "Blueberry Cheesecake Shake": ["tall-glass", "a tall glass of thick purple blueberry cheesecake milkshake topped with whipped cream and a few blueberries"],
  "Nutella Shake": ["tall-glass", "a tall glass of thick smooth hazelnut-chocolate milkshake topped with whipped cream and a chocolate drizzle"],
  "Brownie Shake": ["tall-glass", "a tall glass of thick chocolate brownie milkshake topped with whipped cream and a small square of fudgy brownie"],
  "Water Bottle": ["can", "a plain unlabelled clear plastic bottle of chilled water beside a clear glass of ice"],
  "Peach Iced Tea": ["tall-glass", "a tall clear glass of amber peach iced tea over ice with a slice of fresh peach on the rim"],
  "Diet Coke Can": ["can", "a plain unbranded silver aluminium soda can beaded with condensation beside a clear glass of ice and cola"],
  "Lemon Iced Tea": ["tall-glass", "a tall clear glass of amber lemon iced tea over ice with a lemon wheel on the rim"],
  "Virgin Mojito": ["tall-glass", "a tall clear glass of sparkling virgin mojito packed with crushed ice, fresh mint leaves and lime wedges"],
  "Blueberry Lemonade": ["tall-glass", "a tall clear glass of violet blueberry lemonade over ice with blueberries and a lemon wheel"],
  "Masala Mango Fizz": ["tall-glass", "a tall clear glass of sparkling orange mango drink over ice with a chaat-masala rim and a mint sprig"],
  "Sunshine Mojito": ["tall-glass", "a tall clear glass of sparkling bright-orange citrus mojito over crushed ice with mint and an orange slice"],
  "Thums Up Can": ["can", "a plain unbranded dark-red aluminium soda can beaded with condensation beside a clear glass of ice and cola"],
  "Three Musketeers": ["tall-glass", "a tall clear glass of a layered red, orange and green fruit cooler over ice with a mint sprig"],
  "Coke Can": ["can", "a plain unbranded red aluminium soda can beaded with condensation beside a clear glass of ice and cola"],
  "Masala Lemonade": ["tall-glass", "a tall clear glass of sparkling masala lemonade over ice with a lemon wheel and a spiced salt rim"],
  "Sprite Can": ["can", "a plain unbranded green aluminium soda can beaded with condensation beside a clear glass of ice and clear soda"],
  "Watermelon Mojito Injector": ["tall-glass", "a tall clear glass of pink watermelon mojito over crushed ice with mint, a small plastic syrup injector filled with red syrup standing upright in the glass"],
  "Green Apple": ["tall-glass", "a tall clear glass of bright green apple mocktail over ice with an apple slice, a small plastic syrup injector filled with green syrup standing upright in the glass"],
  "Electric Blue": ["tall-glass", "a tall clear glass of vivid electric-blue mocktail over ice with a lemon wheel, a small plastic syrup injector filled with blue syrup standing upright in the glass"],
  "Cheese Garlic Bread (4pcs)": ["plate", "four slices of golden cheese garlic bread with bubbling melted mozzarella and herbs, on a white plate"],
  "Pizza Pocket (3pcs)": ["plate", "three golden baked pizza pockets, crisp half-moon pastries with a little melted cheese at the seams, on a white plate"],
  "Cheese Coins (5 Pcs)": ["plate", "five small round golden-fried cheese coins, crisp outside, on a white plate with a dip"],
  "Peri-peri Cheese Coins": ["plate", "five small round golden-fried cheese coins dusted with bright red peri peri spice, on a white plate with a dip"],
  "Mushroom Toast": ["plate", "two slices of toasted bread topped with creamy sauteed mushrooms and melted cheese, on a white plate"],
  "Exotic Garlic Toast": ["plate", "slices of crisp garlic toast topped with colourful diced peppers, corn and melted cheese, on a white plate"],
  "House Special Cheese Garlic Bread": ["plate", "a long loaf of cheese garlic bread split open and loaded with melted mozzarella, herbs and chilli flakes, on a wooden board"],
  "Veg Cigar Roll": ["plate", "crisp golden fried cigar-shaped vegetable spring rolls stacked on a white plate with a small bowl of red dip"],
  "Avocado Toast": ["plate", "thick toasted sourdough topped with smashed green avocado, cherry tomato halves and chilli flakes, on a white plate"],
  "Peri Peri Fries": ["bowl", "a generous heap of crisp golden French fries heavily coated in bright red-orange peri peri spice powder with red specks clearly visible, in a matte black bowl, a small ramekin of creamy white dip beside it"],
  "Salted Fries": ["bowl", "a generous heap of crisp golden salted French fries in a matte black bowl, a small ramekin of tomato ketchup beside it"],
  "Cheese Loaded Fries": ["bowl", "golden French fries smothered in thick molten yellow cheese sauce with chopped jalapeños, in a matte black bowl"],
  "Truffle Parmesan Fries": ["bowl", "golden French fries tossed with finely grated parmesan and chopped parsley, in a matte black bowl with a small dip"],
  "Veg Grilled Sandwich": ["plate", "a triangle-cut grilled vegetable sandwich with golden grill marks showing layers of tomato, cucumber, onion and potato, on a white plate"],
  "Paneer Tikka Sandwich": ["plate", "a triangle-cut grilled sandwich filled with spicy orange paneer tikka and onion, golden grill marks, on a white plate"],
  "Spinach & Corn Sandwich": ["plate", "a triangle-cut grilled sandwich oozing a creamy spinach and sweet-corn filling, golden grill marks, on a white plate"],
  "Creamy Mushroom Sandwich": ["plate", "a triangle-cut grilled sandwich with a creamy mushroom and cheese filling, golden grill marks, on a white plate"],
  "Greek Garden Sandwich": ["plate", "a triangle-cut sandwich with lettuce, cucumber, tomato, olives and feta-style cheese, on a white plate"],
  "Cheesy Green Sandwich": ["plate", "a triangle-cut grilled sandwich with bright green chutney and melted cheese, golden grill marks, on a white plate"],
  "Classic Aloo Tikki Burger": ["plate", "a vegetable burger with a crisp golden potato patty, lettuce, tomato and creamy sauce in a soft sesame bun, on a white plate"],
  "Punjabi Masala Burger": ["plate", "a vegetable burger with a spiced potato patty, onion rings and a tangy red masala sauce in a soft bun, on a white plate"],
  "Indi-Masala Burger": ["plate", "a vegetable burger with a crisp spiced patty, green chutney, onion and tomato in a soft bun, on a white plate"],
  "The Mighty Melt Burger": ["plate", "a tall vegetable burger with a crisp patty and thick molten cheese dripping down the sides, in a glossy bun, on a white plate"],
  "Punjabi Gabru Burger": ["plate", "a tall vegetable burger with a spiced paneer patty, onion, lettuce and a creamy makhani sauce in a soft bun, on a white plate"],
  "Veg The Ghost Rider": ["plate", "a tall spicy vegetable burger with a crisp patty, jalapeños, melted cheese and a fiery red sauce in a dark toasted bun, on a white plate"],
  "Mexican Fiesta Burger": ["plate", "a vegetable burger with a crisp bean patty, salsa, jalapeños, lettuce and cheese in a soft bun, on a white plate"],
  "Couch Potato Burger": ["plate", "a simple vegetable burger with a golden potato patty, lettuce and mayonnaise in a soft bun, on a white plate"],
  "Chilli House Burger": ["plate", "a vegetable burger with a crisp patty, green chillies, onion and a spicy red sauce in a soft bun, on a white plate"],
  "Veg Mighty Cheese": ["plate", "a tall vegetable burger with two cheese slices melting over a crisp patty, lettuce and tomato in a glossy bun, on a white plate"],
  "Cheese Lava Burger": ["plate", "a vegetable burger with a crisp patty and molten cheese flowing out like lava, in a glossy bun, on a white plate"],
  "Paneer Supreme Burger": ["plate", "a tall burger with a thick golden crumbed paneer patty, lettuce, onion and creamy sauce in a soft bun, on a white plate"],
  "Veg Mexican Marvel": ["plate", "a tall vegetable burger with a crisp patty, salsa, sweet corn, jalapeños and cheese in a soft bun, on a white plate"],
  "Makhani Stack Burger": ["plate", "a stacked vegetable burger with a crisp patty, rich orange makhani sauce and onion in a soft bun, on a white plate"],
  "Veg Mighty Cheese Meal": ["plate", "a cheese-topped vegetable burger with a side of golden fries and a glass of cola, together on a white plate"],
  "Spicy Paneer Wrap": ["plate", "a toasted tortilla wrap cut in half on the diagonal, showing a spicy red paneer, onion and lettuce filling, on a white plate"],
  "Cheese Masala Wrap": ["plate", "a toasted tortilla wrap cut in half on the diagonal, showing a spiced potato and melted cheese filling, on a white plate"],
  "Aloo Tikki Wrap": ["plate", "a toasted tortilla wrap cut in half on the diagonal, showing a crisp potato patty, onion and green chutney, on a white plate"],
  "Mexican Wrap": ["plate", "a toasted tortilla wrap cut in half on the diagonal, showing beans, corn, salsa and cheese, on a white plate"],
  "Makhani Delight Wrap": ["plate", "a toasted tortilla wrap cut in half on the diagonal, showing paneer in a rich orange makhani sauce with onion, on a white plate"],
  "Veg Steamed Momos": ["plate", "eight soft white steamed vegetable dumplings with pleated tops on a white plate, a small bowl of red chilli dip beside them"],
  "Veg Baked Pizza Momos": ["plate", "steamed vegetable dumplings baked with pizza sauce and bubbling melted cheese, on a white plate"],
  "Veg Fried Momos": ["plate", "golden crisp fried vegetable dumplings on a white plate with a small bowl of red chilli dip"],
  "Tadka Maggie": ["bowl", "a bowl of instant noodles tossed with a spiced tempering of onion, tomato, green chilli and coriander, in a white ceramic bowl"],
  "Plain Maggie": ["bowl", "a bowl of steaming curly instant noodles in a light masala, in a white ceramic bowl"],
  "Three Cheese Maggie": ["bowl", "a bowl of curly instant noodles covered in three kinds of melted, stretchy cheese, in a white ceramic bowl"],
  "Garden Salad": ["bowl", "a fresh salad of lettuce, cucumber, cherry tomatoes, carrot and bell pepper with a light dressing, in a wide white bowl"],
  "Avocado Salad": ["bowl", "a fresh salad of greens with sliced avocado, cherry tomatoes and seeds, in a wide white bowl"],
  "Choco Brownie": ["plate", "a thick square of fudgy chocolate brownie with a crackly top and a chocolate drizzle, on a white plate"],
  "Brownie With Ice Cream": ["plate", "a warm square of fudgy chocolate brownie topped with a scoop of vanilla ice cream and chocolate sauce, on a white plate"],
};

export const pepoMenuRecipe = defineRecipe({
  key: "pepo-menu",
  label: "Pepo menu",
  dials: { cue: Object.values(ITEMS).map(([, c]) => c), length: ["compact", "full"] },
  extraRule: EXTRA_RULE,
  extraRuleCompact: EXTRA_RULE_COMPACT,
  styles: STYLES,
  tokens: [
    "Angle: 45 degrees above, square-on, described by what the viewer sees",
    "Framing: whole vessel, centred, equal side space, about two thirds of frame height",
    "Set: warm walnut table and soft warm cafe bokeh on every item",
  ],
});

export const { compose, styleMeta: STYLE_META } = pepoMenuRecipe;

export const composeItem = (name, length = "full") => {
  const [style, cue] = ITEMS[name];
  return compose({ style, cue, length });
};
