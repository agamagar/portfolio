// The image half of the library: seventeen prompt systems, ordered product work first,
// studio work second. Each group opens with its system spec (the constant style, the
// dials, the master template) and is followed by its catalogs, so the rail reads the
// same way everywhere.
//
// The old single "Icon prompts" group mixed two brands' icon systems under one
// heading; it is split here into Zepto icons and Away icons, each system-first.
import { applyRules } from "../rules.js";
import { SPECS as ICONS } from "./icons.data.js";
import { SPECS as SPECIMEN } from "./specimen.data.js";
import { SPECS as HANDS } from "./hands.data.js";
import { SPECS as COMPOSITION } from "./composition.data.js";
import { SPECS as PORTFOLIO_ICONS } from "./portfolioIcons.data.js";
import { SPECS as ISO_OBJECTS } from "./isoObjects.data.js";
import { airplaneSpecs as AIRPLANES } from "./airplanes.js";
import { faces3dSpecs as FACES_3D } from "./faces3d.js";
import { zeptoCampaignSpecs as ZEPTO_CAMPAIGN } from "./zeptoCampaign.js";
import { zeptoCatalogueSpecs as ZEPTO_CATALOGUE } from "./zeptoCatalogue.js";
import { scheduleImagesSpecs as SCHEDULE_IMAGES } from "./scheduleImages.js";
import { schedulePovSpecs as SCHEDULE_POV } from "./schedulePov.js";
import { ekamSpecs as EKAM } from "./ekam.js";
import { cameraSpecs as CAMERA } from "./camera.js";
import { teamIllustrationSpecs as TEAM_ILLUSTRATIONS } from "./teamIllustrations.js";
import { icons3dSpecs as ICONS_3D } from "./icons3d.js";
import { EXTRA_RULE as FACES_RULE } from "./faces3dViews.js";
import { EXTRA_RULE as AIRPLANE_RULE } from "./airplaneViews.js";
import { EXTRA_RULE as CAMPAIGN_RULE } from "./zeptoCampaignViews.js";
import { EXTRA_RULE as EKAM_RULE } from "./ekamViews.js";

const pick = (specs, ids) =>
  ids.map((id) => {
    const s = specs.find((x) => x.id === id);
    if (!s) throw new Error(`prompt library: missing spec "${id}"`);
    return s;
  });

// [group heading, specs in reading order, extra rule for that group]
const GROUPS = [
  ["Zepto icons", pick(ICONS, ["pl-zepto-premium-glass-icons", "pl-away-nut-icon-prompts"])],
  ["Away icons", pick(ICONS, ["pl-away-icons-system", "pl-away-product-icons"])],
  ["3D icons", ICONS_3D],
  ["Team illustrations", TEAM_ILLUSTRATIONS],
  ["Composition", COMPOSITION],
  ["Camera views", CAMERA],
  ["Zepto catalogue", ZEPTO_CATALOGUE],
  ["Zepto campaign tiles", ZEPTO_CAMPAIGN, CAMPAIGN_RULE],
  ["Schedule images", SCHEDULE_IMAGES, CAMPAIGN_RULE],
  ["Schedule POV", SCHEDULE_POV, CAMPAIGN_RULE],
  ["Specimen", SPECIMEN],
  ["Doodle hands", HANDS],
  ["Portfolio line icons", PORTFOLIO_ICONS],
  ["Isometric objects", ISO_OBJECTS],
  ["Ekam", EKAM, EKAM_RULE],
  ["Airplane views", AIRPLANES, AIRPLANE_RULE],
  ["3D faces", FACES_3D, FACES_RULE],
];

export const imageSpecs = GROUPS.flatMap(([group, specs, extraRule]) =>
  specs.map((s) => ({ ...applyRules(s, extraRule), family: "Image", group }))
);
