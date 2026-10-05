// The assembler the library's synthesis section has always described, restored as
// code. Every copy-paste voice prompt on the page is composed by these two
// functions from a framework plus a moment, so a voice principle is edited once
// and all 22 of that framework's prompts change with it.
//
// Two dialects exist in the source, written in different eras of the Check Designs
// plugin: the older frameworks use curly apostrophes and no "Rules:" header inside
// a moment prompt, Zepto Premium uses straight apostrophes and a header. Both are
// carried on the framework as `dialect` and reproduced exactly, so this stays a
// faithful port rather than a rewrite. Worth collapsing to one dialect one day;
// that is a copy decision, not a structural one.

// The persona header both prompts open with.
const head = (fw) => [fw.intro, `Persona: ${fw.persona}.`];

// The voice body both prompts share: principles, word lists, hard rules.
function body(fw, rulesHeader) {
  const p = ["Voice principles:"];
  fw.principles.forEach((x) => p.push(`- ${x}`));
  p.push("");
  p.push(`Reach for words like: ${fw.reachFor.join(", ")}.`);
  p.push(`Avoid: ${fw.avoid.join(", ")}.`);
  p.push("");
  if (rulesHeader) p.push("Rules:");
  fw.rules.forEach((x) => p.push(`- ${x}`));
  return p;
}

// The framework on its own: paste once at the top of a session, then ask for copy.
export function buildSystemPrompt(fw) {
  return [
    ...head(fw),
    "",
    ...body(fw, true),
    "",
    `The test: ${fw.test}`,
  ].join("\n");
}

// Framework + moment + topic -> the exact prompt to run.
export function buildPrompt(fw, name, moment, opts = {}) {
  const n = opts.n || moment.n || 3;
  const topic = opts.topic || "[your topic]";
  const dl = fw.dialect;
  const p = [
    ...head(fw),
    "",
    `Task: write ${n} options of "${name}" copy for this topic:`,
    `  ${topic}`,
    "",
    `This moment${dl.apos}s job: ${moment.job}`,
  ];
  if (moment.context) p.push("", moment.context);
  p.push("", ...body(fw, dl.rulesHeader));
  if (moment.references && moment.references.length) {
    p.push("");
    p.push(
      `How this moment sounds in our voice (reference only${dl.dash} write fresh, don${dl.apos}t copy):`
    );
    moment.references.forEach((r) => p.push(`  • ${r}`));
  }
  p.push("", `The test: ${fw.test}`);
  p.push(
    "",
    `Now write ${n} fresh options for: ${topic}. One per line, ship-ready, no preamble, no numbering, no explanation.`
  );
  return p.join("\n");
}
