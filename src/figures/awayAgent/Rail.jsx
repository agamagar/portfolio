import { StepRail } from "../ds/StepRail";

// Thin adapter over the promoted StepRail. Only the skin is local: the `aw-` prefix and
// the indigo default tone (the agent / the win). `steps`: [{ t, s, tone }]. `active`:
// index of the live beat. `done`: Set of indices already resolved.
export const Rail = (props) => <StepRail prefix="aw" defaultTone="indigo" {...props} />;
