import { StepRail } from "../ds/StepRail";

// Thin adapter over the promoted StepRail. Only the skin is local: the `sd-` prefix and
// the purple default tone. `steps`: [{ t, s, tone }]. `active`: index of the live beat.
// `done`: Set of indices already resolved.
export const Rail = (props) => <StepRail prefix="sd" defaultTone="purple" {...props} />;
