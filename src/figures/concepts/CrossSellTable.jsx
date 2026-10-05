import "./crossSellTable.css";

// The twenty occasion banner combinations, straight from the cross-sell data sheet (Top Pairs).
// Columns: #, Occasion, Anchor -> cross-sell, Heading (the charm), Copy (the plain reason).
// Guardrails held: baby and comfort stay neutral; alcohol is age-gated. Source:
// Active - Zepto/Ads & Strategy/Cross-Sell/Zepto Cross-Sell Model v1.xlsx.

const HEAD = ["#", "Occasion", "Anchor → cross-sell", "Heading", "Copy"];

const ROWS = [
  [1, "Breakfast", "Bread → butter, eggs, jam", "Breakfast, buttered up", "The butter, eggs and jam that go on the bread."],
  [2, "Everyday staples", "Milk → bread, curd, eggs", "The everyday basics", "What usually rides along with the milk run."],
  [3, "Breakfast", "Eggs → bread, butter", "A proper fry-up", "Bread and butter to finish the plate."],
  [4, "Dinner tonight", "Pasta → sauce, cheese, oil", "Pasta night, plated", "The sauce, cheese and oil the recipe needs."],
  [5, "Quick bite", "Maggi → egg, veg, cheese", "Level up the Maggi", "Egg, veggies and cheese to make it a meal."],
  [6, "Coffee break", "Coffee → milk, sugar, biscuits", "Coffee, the works", "Milk, sugar and something to dunk."],
  [7, "Everyday", "Curd → sugar, bread, honey", "Curd, sweetened", "Sugar, honey or bread to go with it."],
  [8, "Monthly stock-up", "Atta → rice, dal, oil", "The monthly kitchen", "Rice, dal and oil for the big shop."],
  [9, "Baby care", "Diapers → wipes, baby food, rash cream", "Baby care, restocked", "Wipes, food and rash cream for the week."],
  [10, "Hair routine", "Shampoo → conditioner, oil, mask", "The full hair routine", "Conditioner, oil and a mask to match."],
  [11, "Grooming", "Razor → shaving cream, aftershave", "A cleaner shave", "Cream and aftershave for the routine."],
  [12, "Movie night", "Chips → soft drinks, dips", "Movie night, sorted", "Something cold and a dip for the chips."],
  [13, "Evening in", "Beer → ice, snacks", "Chilled and ready", "Ice and snacks for the evening."],
  [14, "Comfort", "Sanitary pads → pain relief, hot water bottle", "Comfort essentials", "Pain relief and a hot water bottle, if you need them."],
  [15, "Oral care", "Toothpaste → toothbrush, mouthwash", "The oral-care refill", "A fresh brush and mouthwash with the paste."],
  [16, "Pet parent", "Dog food → treats, toys, shampoo", "For the good boy", "Treats, toys and a wash for the pup."],
  [17, "Laundry day", "Detergent → softener, stain remover", "Laundry day, handled", "Softener and stain remover to finish the load."],
  [18, "Chai break", "Tea → sugar, milk, biscuits", "Chai time", "Sugar, milk and biscuits for the cup."],
  [19, "Celebration", "Cake → soft drinks, candles", "Someone's celebrating", "Candles and cold drinks to round it off."],
  [20, "House party", "Vodka/whisky → mixers, lime, snacks", "House party, stocked", "Mixers, lime and snacks for the table."],
];

export default function CrossSellTable() {
  return (
    <div className="cst-wrap">
      <table className="cst">
        <thead>
          <tr>{HEAD.map((h, i) => <th key={i} className={"cst-c" + i}>{h}</th>)}</tr>
        </thead>
        <tbody>
          {ROWS.map((r) => (
            <tr key={r[0]}>{r.map((c, i) => <td key={i} className={"cst-c" + i}>{c}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
