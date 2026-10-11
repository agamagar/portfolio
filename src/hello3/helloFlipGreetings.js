// Greetings for the stretchy "Hello" (Agam, 2026-10-11): drag the "!" to add
// O's, let go, and the word flips into a greeting with exactly that many
// characters. Keyed by length in grapheme clusters (Intl.Segmenter), spaces
// included, because every character, a space too, is one flap on the board.
//
// Sources, cross-checked on 2026-10-11 (CLDR has no greetings):
//   [O] Omniglot, "Hello in many languages"
//       https://www.omniglot.com/language/phrases/hello.htm
//   [W] Wiktionary, "hello", Translations
//       https://en.wiktionary.org/wiki/hello#Translations
// An entry is kept when both list it, or when one lists it and the other
// gives a different everyday greeting for the same language (marked `o`/`w`
// in the comment for the one that does).
//
// The face is Stack Sans Headline (latin + latin-ext subsets only). It has no
// Devanagari, Cyrillic, Hebrew, Greek, Hangul or kana, and no ṇ, ǐ or ǎ, so those
// greetings are romanised and say so (`script`). Pinyin loses its tone marks
// for the same reason: "Ni hao", not "Nǐ hǎo".
//
// Length 5 is "Hello" itself: dragging back to five letters is the way home.

export const GREETINGS = {
  6: [
    { text: "Shalom", lang: "Hebrew", script: "romanised" }, // O W
    { text: "Privet", lang: "Russian", script: "romanised" }, // O W
    { text: "Talofa", lang: "Samoan" }, // O W
    { text: "Sveiki", lang: "Latvian" }, // O W
    { text: "Zdravo", lang: "Serbian" }, // O W
    { text: "Bonjou", lang: "Haitian Creole" }, // O W
    { text: "Ni hao", lang: "Mandarin", script: "pinyin" }, // O W
  ],
  7: [
    { text: "Bonjour", lang: "French" }, // O W
    { text: "Namaste", lang: "Hindi", script: "romanised" }, // O W
    { text: "Merhaba", lang: "Turkish" }, // O W
    { text: "Kia ora", lang: "Māori" }, // O W
    { text: "Saluton", lang: "Esperanto" }, // O W
    { text: "Kumusta", lang: "Tagalog" }, // O W
    { text: "Hujambo", lang: "Swahili" }, // O (W: jambo)
  ],
  8: [
    { text: "Sawubona", lang: "Zulu" }, // O W
    { text: "Xin chào", lang: "Vietnamese" }, // W (O: chào anh)
    { text: "Vanakkam", lang: "Tamil", script: "romanised" }, // O W
    { text: "Szervusz", lang: "Hungarian" }, // O (W: szia)
    { text: "Annyeong", lang: "Korean", script: "romanised" }, // O (W: annyeonghaseyo)
  ],
  9: [
    { text: "Guten Tag", lang: "German" }, // O (W: hallo)
    { text: "Dia dhuit", lang: "Irish" }, // O W
    { text: "Dobrý den", lang: "Czech" }, // O (W: ahoj)
    { text: "Bună ziua", lang: "Romanian" }, // O (W: salut)
    { text: "Mingalaba", lang: "Burmese", script: "romanised" }, // O W
    { text: "Góðan dag", lang: "Icelandic" }, // O (W: halló)
  ],
  10: [
    { text: "Buongiorno", lang: "Italian" }, // W (O: ciao)
    { text: "Konnichiwa", lang: "Japanese", script: "romanised" }, // O (W: ohayō)
    { text: "Namaskaram", lang: "Malayalam", script: "romanised" }, // O
    { text: "İyi günler", lang: "Turkish" }, // O (W: merhaba)
    { text: "Sanibonani", lang: "Zulu" }, // O (W: sawubona)
  ],
  11: [
    { text: "Dia dhaoibh", lang: "Irish" }, // O (W: Dia dhuit)
    { text: "Dzień dobry", lang: "Polish" }, // well known; O and W give cześć
    { text: "Buenos días", lang: "Spanish" }, // well known; O and W give hola
  ],
  12: [
    { text: "Sat srī akāl", lang: "Punjabi", script: "romanised" }, // O W
    { text: "Selamat pagi", lang: "Malay" }, // O (W: helo)
    { text: "Zdravstvujte", lang: "Russian", script: "romanised" }, // O (W: privet)
  ],
};

export const MIN_LEN = 5;
export const MAX_LEN = 12;

const seg = typeof Intl !== "undefined" && Intl.Segmenter ? new Intl.Segmenter(undefined, { granularity: "grapheme" }) : null;
/** Grapheme clusters, not code units: "ă" is one flap whatever its encoding. */
export function graphemes(s) {
  return seg ? Array.from(seg.segment(s), (x) => x.segment) : Array.from(s);
}

// a dev-time guard so a typo in the table cannot put a 9 in the 10 row
if (import.meta.env?.DEV) {
  for (const [n, list] of Object.entries(GREETINGS)) {
    for (const g of list) if (graphemes(g.text).length !== +n) console.warn(`[helloFlip] "${g.text}" is not ${n} characters`);
  }
}

let last = null;
/** A greeting of exactly `n` characters, never the one shown last. */
export function pickGreeting(n) {
  const list = GREETINGS[n];
  if (!list?.length) return null;
  const pool = list.length > 1 ? list.filter((g) => g !== last) : list;
  last = pool[Math.floor(Math.random() * pool.length)];
  return last;
}

/** "in French", "in Hindi, romanised": the quiet caption above the word. */
export function captionFor(g) {
  if (!g) return "";
  return g.script ? `${g.lang}, ${g.script}` : g.lang;
}
