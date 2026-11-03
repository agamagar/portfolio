// The Dassh opening, frame by frame from Figma Portfolio 2026 (dUwMRorsFMXh9G6wlHOh5B,
// node 1772:55682, sections 121 to 118). Positions are Figma px inside each
// 1512 frame; photos are Figma exports (the shader sparkle and the progressive
// edge blur are baked in), text is live.
import { FrameStage, Box, useFrameFonts } from "../../ui/FrameStage";
import { DasshRadiate } from "./DasshRadiate";
import "./dasshOpening.css";

const FONTS = ["Atkinson+Hyperlegible+Next:wght@400;500", "Open+Sans:wght@400"];
const IMG = "/figures/dassh/";

// 121: the Dassh lockup, centred
export function DasshLogoHero() {
  return (
    <FrameStage className="dsh dsh--logo" role="img" aria-label="Dassh">
      <Box className="dsh__logo" x={484} y={431} w={543} h={120} />
    </FrameStage>
  );
}

// 122: the noise headline over the meeting room
export function DasshNoise() {
  useFrameFonts(FONTS);
  return (
    <FrameStage className="dsh dsh--noise" stack>
      <Box as="p" className="dsh__head" x={406} y={129} w={700} h={124}>Hiring is mostly noise,<br />Dassh digs right info for you</Box>
      <Box className="dsh__photo" x={336} y={313} w={840} h={400}>
        <img src={IMG + "noise-photo.webp"} alt="A recruiting team around a meeting table, reviewing papers" loading="lazy" />
      </Box>
      <Box as="p" className="dsh__sub" x={450} y={773} w={612} h={80}>A recruiter’s day fills with CVs, calls, messages, scheduling and status chasing</Box>
    </FrameStage>
  );
}

// the four photo tiles behind the glass in 127 and 126 (b and c are cut by the frame edge)
function Tiles() {
  return (
    <>
      <Box className="dsh__tile" x={1097} y={56} w={372} h={177}><img src={IMG + "tile-a.webp"} alt="" loading="lazy" /></Box>
      <Box className="dsh__tile" x={1097} y={644} w={415} h={314}><img src={IMG + "tile-b.webp"} alt="" loading="lazy" /></Box>
      <Box className="dsh__tile" x={0} y={644} w={326} h={221}><img src={IMG + "tile-c.webp"} alt="" loading="lazy" /></Box>
      <Box className="dsh__tile" x={20} y={90} w={269} h={128}><img src={IMG + "tile-d.webp"} alt="" loading="lazy" /></Box>
    </>
  );
}

// 127: cognitive load to clarity, on one glass card over the tiles
export function DasshClarity() {
  useFrameFonts(FONTS);
  return (
    <FrameStage className="dsh dsh--clarity">
      <Tiles />
      <Box glass className="dsh__card" x={60} y={60} w={1392} h={862} r={100}>
        <p className="dsh__line dsh__line--then">At first what seemed like a cognitive load problem</p>
        <p className="dsh__line">As we looked deeper it became a clarity problem</p>
      </Box>
    </FrameStage>
  );
}

// 126: the tiles again, the card shrunk to the Dassh mark
export function DasshMark() {
  return (
    <FrameStage className="dsh dsh--mark" role="img" aria-label="The Dassh mark">
      <Tiles />
      <Box glass className="dsh__markbox" x={706} y={441} w={100} h={100} r={8}>
        <span className="dsh__mark" />
      </Box>
    </FrameStage>
  );
}

// 128: the mark opens into the outline of a board
export function DasshWire() {
  return (
    <FrameStage className="dsh dsh--wire" role="img" aria-label="The outline of the Dassh-Board: a header bar, one large panel and three cards">
      <Box className="dsh__wirepanel" x={40} y={40} w={1432} h={902} r={8} />
      <Box glass className="dsh__markbox" x={100} y={100} w={100} h={100} r={8}><span className="dsh__mark" /></Box>
      <Box className="dsh__wire" x={224} y={100} w={1188} h={100} r={8} />
      <Box className="dsh__wire" x={100} y={224} w={823} h={658} r={8} />
      <Box className="dsh__wire" x={947} y={224} w={465} h={203} r={8} />
      <Box className="dsh__wire" x={947} y={451} w={465} h={203} r={8} />
      <Box className="dsh__wire" x={947} y={679} w={465} h={203} r={8} />
    </FrameStage>
  );
}

// 107: the problem statement, photo left, statement right
export function DasshProblem() {
  return (
    <FrameStage className="dsh dsh--problem" stack>
      <Box className="dsh__photo" x={0} y={0} w={756} h={982}>
        <img src={IMG + "problem-photo.webp"} alt="A recruiter working through notes on a park bench" loading="lazy" />
        <DasshRadiate mask={IMG + "problem-mask.png"} />
      </Box>
      <Box className="dsh__copy" x={816} y={394} w={600}>
        <p className="dsh__label">Problem Statement</p>
        <p className="dsh__statement">A digital surface<br />that streamlines noise</p>
      </Box>
    </FrameStage>
  );
}

// 118: the journey, label left, four moments down the middle, the question right
export function DasshJourney() {
  return (
    <FrameStage className="dsh dsh--journey" w={1512} h={1964} stack>
      <Box className="dsh__copy" x={72} y={396} w={299}>
        <p className="dsh__label">The journey from a dashboard to a Dassh-Board</p>
      </Box>
      <Box className="dsh__copy dsh__copy--q" x={978} y={380} w={475}>
        <p className="dsh__statement">How many scenarios can you think of, when you didn’t need quick delivery?<span className="qa-confirm"> [CONFIRM: Schedule copy in the Figma frame, Dassh line needed]</span></p>
      </Box>
      <Box className="dsh__moments" x={443} y={360} w={480} h={1460}>
        {[0, 1, 2, 3].map((k) => (
          <img key={k} src={IMG + "journey-photo.webp"} alt="" loading="lazy" />
        ))}
      </Box>
    </FrameStage>
  );
}
