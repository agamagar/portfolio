import { useEffect, useState } from "react";
import { loadSynced } from "./playgroundBase";

// A sentence that depends on whether the synced playground bundle is deployed (critique 37.3 / Q21 interim, 25 Oct).
// With the bundle the embeds are live and the copy can invite a click; without it (a build with no design-playground
// checkout, the deployed private site for now) they are offline, so the copy promises nothing to click.
//   <PlaygroundCopy live="… Click one to use it." offline="…" />
export default function PlaygroundCopy({ live, offline }) {
  const [bundle, setBundle] = useState(undefined);
  useEffect(() => { let on = true; loadSynced().then((j) => on && setBundle(j)); return () => { on = false; }; }, []);
  return bundle ? live : offline;
}
