// The ZepIris (codename OdinEye) PRD, synthesized from the v0.2 deep-research
// source of truth (Active - Zepto/Odin eye/PRD/2026-07-05_zepiris-prd-WIP.md)
// into the same shape the Away / Dassh / Jarvis PRDs use, rendered via the shared
// PrdRenderer. Retroactive v1 record + researched v2 adaptive-capture layer.
// [S#] keys cite the source appendix (last section). [VENDOR] marks vendor-
// reported figures, [HYPOTHESIS] marks invented-but-testable constants,
// [GAP]/[UNVERIFIED] mark open items. No em-dashes (portfolio rule).

export const zepirisPrdData = {
  synthesis: {
    oneLiner:
      "ZepIris is Zepto's in-house face-authentication platform, and its first open-source project: clocking in every rider, picker, and packer across dark stores and Mother Hubs, on ten seconds, the worst phones, and the worst light.",
    whatThisIs:
      "A two-part document. Part one is the retroactive record of shipped v1 (the on-device gate, the classifiers, the 1:1 and 1:N flows, the open-source release), corrected against the actual repo at github.com/zepto-labs/zepiris. Part two is a researched v2 design layer, Adaptive Capture: 16 patterns and a motion spec built on 70+ adversarially verified citations (NIST, ISO, ICAO, field deployments, design theory). Shipped facts and proposed concepts are kept strictly separate; see the ledger.",
    theWedge:
      "Attendance at Zepto's scale is an identity problem wearing an operations costume. Tens of thousands of shift-starts a day ran on OTPs (slow), registers (gameable, buddy punching), or a third-party vendor, Hyperverge, whose per-verification cost quietly rode on every order. The wedge: an in-house face-auth layer that is accurate, compliant, and cheaper at scale, and that holds up in the worst conditions, on the worst hardware, for users who have ten seconds to spare. The repo says it best: No OTPs. No registers. No buddy punching. Just a selfie. [S1]",
    whyFaceAndNotSomethingElse: [
      "Badges and RFID are transferable, which is the buddy-punching attack restated as hardware.",
      "Fingerprint requires contact: a shared sensor touched by every worker at shift change, by hands often gloved, dusty, or wet.",
      "OTP and app check-ins are the slow, gameable status quo the system replaces.",
      "Face is the only factor that is simultaneously non-transferable, contactless, and already carried by every worker. Its documented weaknesses (capture quality, demographics, spoofing) are what the rest of this PRD is about.",
    ],
    governingRules: [
      "Verification is not one problem. A personal phone in a dark store is a 1:1 match; a shared Mother Hub tablet is a 1:N search with a queue behind it. NIST quantifies why these cannot share a dial: false-positive identification rate scales with gallery size [S9]. Each context gets its own flow and threshold.",
      "The right capture is the path of least resistance. No OTPs, no typing, just a selfie. Retry is instant and judgment-free.",
      "Reject bad input before it costs anything. On-device framing guidance is the core accuracy feature, not UX polish: exposure, blur, and pose are the dominant false-negative causes [S7].",
      "Design for who sees the failure, not just who causes it. Spoof, blur, and nudity classifiers protect human reviewers and the dataset.",
      "The floors hold; the path flexes. Adaptation changes which help a person gets, never the quality floors or match thresholds they must clear.",
      "The ending is engineered. A daily ten-second episode is remembered by its worst moment and its final beat [S58]. Success is the one crafted moment; a reject is never terminal punctuation.",
      "No worker goes unpaid because a model cannot see them. India's own biometric-attendance deployments document the failure mode; a guaranteed human path is load-bearing.",
      "Cheap enough to beat the vendor at Zepto's volume, or the whole exercise fails its reason to exist.",
    ],
    whyNow:
      "OTP check-ins were slowing every shift-start as scale grew. Buddy punching showed up more at scale, and incentives turned mistakes into fraud (published anchor: 16% of surveyed employees admit clocking in for a colleague, extrapolated to over $373M in annual US losses [S54], directional). Vendor dependency was neither cheap nor scalable. And the data-science team could now match vendor-grade accuracy in-house, making this the moment to internalise the capability, then open-source it.",
    theCautionaryTale:
      "India has already run face-authenticated attendance for a low-income workforce at national scale, and the field record is this brief's dark mirror. At one MGNREGA worksite, only one worker's attendance was captured in nearly 45 minutes; many left unrecorded [S36]. The same system converts patchy networks into wage risk [S37], and Aadhaar's PDS record shows biometric mismatch causing 92% of authentication failures in one state [S38]. Every v2 pattern exists so a ZepIris failure costs a retry, never a wage.",
    howThisWasBuilt:
      "v0.1 was reconstructed from launch collateral. v0.2 ran a multi-agent research workflow: 8 research domains (repo, mobile 1:1, kiosk 1:N, liveness, fairness, capture-quality standards, biometric UX, design theory), each domain's citations adversarially verified (URLs fetched, quotes matched, refuted claims dropped), then design synthesis and a completeness critic. 70+ findings survived. Contradictions between drafts were resolved in-document.",
  },

  specs: [
    {
      group: "Field research",
      eyebrow: "Research · verified",
      id: "zi-field",
      title: "What breaks face recognition in the wild",
      summary:
        "Every claim cited to a primary source and adversarially verified. The one-line version: matchers are near-perfect on clean frontal portraits and fail on exactly what a workforce presents.",
      callout: {
        label: "The keystone",
        body:
          "Capture quality is the whole game, and it is also the equity lever. NIST traces demographic false-negative gaps to the images, not the people: mugshots captured with standardized photography showed no such gaps; sub-standard border-crossing images did [S65]. The study behind the mechanism recommends per-person illumination adjustment [S66]. That is, almost verbatim, the adaptive-capture thesis: adapting capture to the person is a fairness intervention, not a nicety.",
      },
      captureQuality:
        "NIST: given extreme degradations all algorithms fail; over- or under-exposure, blur, and high pitch/yaw pose are the canonical false-negative causes [S7]. On a native unconstrained benchmark, deep face recognition loses roughly half its clean-benchmark accuracy [S40]. Masks multiply the best algorithms' false non-match rate about 17x (0.3% to 5%) [S8]; riders arrive helmeted and masked every shift.",
      theHardwareFloor:
        "72% of fielded mobile CPU cores were designed over six years ago, across 2,000+ SoC variants, with thermal throttling degrading production vision models [S41]. Image sensing itself is a primary battery cost [S42]. ML Kit's floors: 480x360 input, faces at least 100x100 px, frame dropping [S20].",
      oneToNIsDifferentMath:
        "False-positive identification rate scales with gallery size (FPIR is approximately N times FMR) [S9]; raising the threshold makes misses climb sharply [S10]. Identical twins defeat every tested algorithm [S11]. Enrolment quality is the identification ceiling, and multiple enrolment images cut miss rates up to 2x [S10].",
      throughputHasABar:
        "DigiYatra clears an enrolled passenger in about 5 seconds across 16 airports and 60M+ journeys [S33]; stadium face gates clear fans in under 2 [S35]; the DHS rally benchmark is under 10 seconds while explicitly not processing bystanders [S18]. Border-control guidance requires a 140 to 200 cm height range, glare control, one person at a time [S17].",
      livenessIsBoundedAndFragile:
        "The realistic buddy-punch arsenal is a printed photo or a phone-screen replay: iBeta Level 1, under $30 of artefact [S16]. NIST found passive PAD collapses when the spoof is zoomed in so bezels and hands are hidden [S12], exactly the replay a colleague would attempt. Passive liveness cues wash out in low light on noisy sensors [S53, VENDOR], and its false rejects skew by demographic group [S44]. Active challenges cost completion (one migration to passive: 60% to 95%+ [S49, VENDOR]) and WCAG 2.2 requires an auth path free of cognitive tests [S19].",
      theCaptureMomentHasStandards:
        "ISO/IEC 29794-5 and its open-source reference OFIQ define about 21 scoreable per-frame quality components, explicitly intended to power actionable recapture feedback [S13][S14]. ICAO pins portrait geometry: face midpoint 45 to 55% of frame width, 30 to 50% of height, head width 50 to 75%, inter-eye distance at least 90 px [S15]. Android formalises screen-flash [S21], face-priority metering [S22], and EV compensation [S23]. Physics caps the screen trick: a clean low-light selfie needs about 100 lux on the face [S46]. Guided capture with best-frame selection carries the industry's strongest lift numbers: 20% likelier first-attempt capture, 90% first-time pass [S47, VENDOR].",
      theHumanFactors:
        "49% of mobile users operate one-handed with the thumb [S63]. Text beyond three points goes unread [S51, VENDOR]; this workforce has documented low digital literacy [S37]. Monitoring is judged fair when job-relevant and paired with voice [S61]; acceptance is strictly purpose-bounded to attendance [S62]. A daily episode is remembered by its worst moment and ending [S58]; showing effort helps only on genuine waits [S59]. 250M people use live face-tracking AR lenses daily, so a conforming face overlay is a mass-market mental model [S31].",
      fairnessAndDemographics:
        "NIST's landmark demographics study (18.27M images, 189 algorithms): false-positive rates vary by factors of 10 to beyond 100 across groups, false negatives by factors below 3 and traceable to image quality [S65]. Face-region brightness differs systematically by skin tone under identical light; both under- and over-exposure raise errors; the remedy is per-person illumination adjustment [S66]. Gender Shades set the cautionary baseline: darker-skinned women misclassified at up to 34.7% vs 0.8% for lighter-skinned men, on 80%+ lighter-skinned benchmarks [S67]. Adult inter-pupillary distance spans roughly 50 to 75mm around a 63mm mean [S68]: a 1.5x range a single canonical oval silently penalises. Governing law: the DPDP Act 2023, Section 7(i) legitimate-use ground with purpose limitation and data-principal rights [S69][S70].",
    },

    {
      group: "Field research",
      eyebrow: "Research · matrix",
      id: "zi-matrix",
      title: "The challenge matrix",
      summary:
        "Every distinct evidenced challenge, mapped to what shipped v1 already answers and what v2 proposes. Highlights below; the full 39-row matrix lives in the source doc.",
      everySurface: [
        { challenge: "Exposure, blur, off-axis pose are the dominant false-negative causes [S7]", v1: "Partial: ML Kit gate covers framing, eyes, distance; server blur classifier. Exposure and pose not gated", v2: "Fitted Ring + One Fix at a Time: pose and exposure become coached, gated signals" },
        { challenge: "Zoomed-in bezel-free replays degrade every passive PAD algorithm tested [S12]", v1: "Partial: spoof classifier exists, no documented red-teaming of this case", v2: "Canonical red-team case: close-up replay on the real kiosk tablet and lowest-tier Androids, dark and glare" },
        { challenge: "False rejects skew by demographic group; workforce face checks have produced litigation [S44]", v1: "Open", v2: "Owned fairness dashboard (Reviewer's Bench) + hard rule: no automated lockout, ever" },
        { challenge: "Face-region brightness differs by skin tone; the remedy is per-person illumination [S65][S66]", v1: "Open", v2: "The Ladders, triggered on face-region SNR, not scene luminance: adaptive capture as fairness" },
        { challenge: "Face geometry spans a 1.5x range; canonical templates assume a normed face [S68]", v1: "Open", v2: "Fitted Ring: geometry adapts to the person; floors stay fleet-constant" },
        { challenge: "Threshold values are folklore: neutral 0.5 dials, no published rationale [S4]", v1: "Partial: per-workflow dial shipped [S5]", v2: "Auditable dial: APCER/BPCER targets per workflow [S16]; config changes logged in IMI" },
      ],
      mobileOneToOne: [
        { challenge: "Occlusion multiplies false non-matches about 17x; riders arrive helmeted [S8]", v1: "Open", v2: "Uncover, Don't Loosen: occlusion becomes a pre-ring flow step; enrol-as-worn for religious coverings" },
        { challenge: "Field-scale biometric attendance failure: hours-long queues, lost wages [S36][S38]", v1: "Partial: instant retry, no guaranteed fallback", v2: "One escalation budget ending in a human path, always; Second Chance Ledger protects wages" },
        { challenge: "Live-connectivity requirements convert patchy networks into wage risk [S37]", v1: "Partial", v2: "Best Frame Wins store-and-forward + Second Chance Ledger for deferred failures" },
        { challenge: "Warehouse-dark: a clean exposure needs about 100 lux on the face; dim screens cannot deliver it at arm's length [S46]", v1: "Open", v2: "Light Ladder: metering, EV, glow border, guide-to-light, human handoff" },
        { challenge: "Outdoor-bright: backlit sun causes over-exposure failures and unreadable screens [S7][S28]", v1: "Open", v2: "Bright Ladder: the outdoor mirror, plus a maximum-contrast sunlight rendering" },
        { challenge: "One-handed thumb operation rules out precise taps [S63]", v1: "Open", v2: "Best Frame Wins: auto-capture on lock, no shutter at all" },
      ],
      kioskOneToN: [
        { challenge: "FPIR scales with gallery size; the kiosk cannot reuse the 1:1 dial [S9][S10]", v1: "Partial: per-workflow dial, not tied to gallery size", v2: "FPIR-derived per-site calibration; tenant-scoped galleries shrink N [S2]" },
        { challenge: "Twins and lookalikes false-match at any usable threshold [S11]", v1: "Open", v2: "Near-tie handoff: quiet supervisor path via IMI, never a pick-your-identity list" },
        { challenge: "Fixed counter-height tablets fail the 140-200 cm human range [S17]", v1: "Open", v2: "Kiosk That Bends: digital pan + tilt cue; mount and hood as an explicit v2 hardware decision" },
        { challenge: "Bystanders in frame must never be processed [S18]", v1: "Open", v2: "One Face, Front of Queue: dominance-margin gating, fail-closed ambiguity" },
        { challenge: "Session bleed: the next worker inherits the previous session", v1: "Partial: instant reset mandated, no SLO", v2: "Hard-sequenced reset: next acquisition gated until the wipe completes; 2-5s cycle SLO" },
      ],
      enrolmentAndPortal: [
        { challenge: "Enrolment quality is the identification ceiling; multiple images cut misses up to 2x [S10]", v1: "Partial: same gate, single frame", v2: "Golden First Photo: enrolment-grade floors, attended path, multi-frame arc" },
        { challenge: "ZepIris already dedups at enrolment and can flag or block a face [S5]", v1: "Answered on the backend; no designed UX for the collision", v2: "The duplicate-conflict state: named queue, stated SLA, interim work path" },
        { challenge: "Monitoring feels fair only with voice and recourse [S61]", v1: "Partial: IMI exists; rejects not reason-coded to the worker", v2: "Reason-coded rejects (per-check verdicts exist in /v1/iqa [S3]); Bench SLAs make promises real" },
        { challenge: "Workforce biometrics has a governing law (DPDP Act 2023) [S69]", v1: "Open", v2: "Rights & Retention: notice, purpose limitation, retention, worker data rights as product states" },
      ],
    },

    {
      group: "The system",
      eyebrow: "Open source · verified",
      id: "zi-repo",
      title: "The open-source release, read closely",
      summary:
        "What github.com/zepto-labs/zepiris actually contains (v1.0.0 tagged May 25 2026; 342 stars, 87 forks at six weeks), and what that means for this document. All facts verified against the repo and launch blog.",
      callout: {
        label: "The boundary, and why it matters",
        body:
          "The OSS release is backend-only: two FastAPI services, a Milvus + MinIO + Etcd Docker Compose stack, and pretrained PyTorch classifiers. No mobile SDK, no capture or coaching UI, no IMI portal [S1][S3]. The entire experience layer is Zepto-internal design work, fully claimable, and every v2 pattern here is designable on top of the public backend.",
      },
      theStackCorrected: [
        { component: "On-device gate", oss: "Not in repo", production: "Google ML Kit face detection: face present and centred, both eyes open, not an extreme close-up [S5]" },
        { component: "Detection + embedding", oss: "InsightFace via ONNX Runtime (CPU); AuraFace-v1 default or buffalo_l; 512-d L2-normalised (ArcFace family) [S2][S3]", production: "Same family" },
        { component: "Quality classifiers", oss: "Spoof: MobileNetV3-Large. NSFW: MobileNetV2. Blur: ResNet18. Parallel, per-check results via /v1/iqa/assess [S3]", production: "Same" },
        { component: "Vector search", oss: "Milvus, FLAT index + COSINE similarity [S2]", production: "HNSW with tunable M / ef_construction / ef_search, values unpublished [S5]" },
        { component: "Default thresholds", oss: "0.5 for NSFW, spoof, blur, and search; min face area 0.01 of frame; 640x640 detection input [S4]", production: "Per-workflow configurable [S5]" },
      ],
      whatV01Missed: [
        "Enrolment dedup: a shipped 1:N search at enrolment that flags or blocks an already-registered face [S5], with no designed user experience for the collision. Golden First Photo designs it.",
        "Per-workflow thresholds, blog-verbatim: ZepIris now allows configurable thresholds per workflow type [S5].",
        "Tenant-scoped galleries: the Milvus tenant field isolates per-site galleries, directly shrinking N and therefore FPIR [S2][S9].",
        "A public rejected-alternatives narrative: DeepFace dropped for embedding instability; FAISS dropped because updating embeddings forced full index rebuilds [S5]. Deliberate selection, not default tooling.",
      ],
      whatTheRepoEnablesForDesign: [
        "/v1/iqa/assess returns per-check results with independent thresholds [S3]: the retry UI can name the exact failing gate and coach the specific fix.",
        "ML Kit emits per-frame geometry (bounding box, landmarks, pose, eye-open probability) [S20]: an adaptive ring that reacts frame-by-frame is technically grounded, not decorative.",
        "Match strictness is one runtime dial plus per-workflow config [S4][S5]: threshold is legitimately a product-level control.",
      ],
      honestyChecks: [
        "License: README and release notes say MIT; GitHub's detector reports the LICENSE file as Other/NOASSERTION [S1]. Unresolved.",
        "The Zepto Tech LinkedIn launch post shows about 155 reactions on a 3,156-follower account [S6]; the viral claim most plausibly rests on co-founder/CTO personal posts. [GAP: locate and link before the case study uses the word viral]",
        "No latency or accuracy numbers are published anywhere in the repo or blog.",
      ],
    },

    {
      group: "The system",
      eyebrow: "Shipped · v1 record",
      id: "zi-shipped",
      title: "Shipped v1, the corrected record",
      summary:
        "The eight pillars of what actually shipped, retroactively documented and corrected against the repo.",
      pillars: [
        { name: "P1 · Mobile capture flow", detail: "Intro screen primes; one camera screen serves many jobs (rider anti-impersonation, packer onboarding); the face-placement ring coaches framing before a frame is sent; post-capture validation states are common across uses." },
        { name: "P2 · Shared-tablet flow (MH)", detail: "A single kiosk tab identifies 1:N out of the whole workforce, no phone, no ID, and resets instantly so the shift-change queue keeps moving." },
        { name: "P3 · On-device validation gate", detail: "Google ML Kit [S5]: face present and centred, both eyes open, not an extreme close-up, checked in real time before any upload. Lifted capture success significantly [UNVERIFIED: exact lift; industry anchor is 90% first-time pass with guided capture, S47, VENDOR]." },
        { name: "P4 · Content-safety classifiers", detail: "Spoof (MobileNetV3-Large), blur (ResNet18), NSFW (MobileNetV2), run in parallel with per-check thresholds before anything reaches a human reviewer [S3]." },
        { name: "P5 · Review portal (IMI)", detail: "Every match decision wrapped in an auditable trail; reviewers see only pre-screened submissions. v2 designs the reviewer experience itself." },
        { name: "P6 · Per-workflow thresholds", detail: "Verified shipped [S5]: attendance, onboarding, and audit each tune their own friction-risk balance. OSS defaults are neutral 0.5 dials [S4]." },
        { name: "P7 · Recognition pipeline", detail: "ML Kit gate, one validated frame, parallel server IQA, 512-d ArcFace-family embedding (AuraFace-v1 or buffalo_l), Milvus ANN search (FLAT+COSINE in OSS, HNSW claimed in production), auditable IMI record. Enrolment adds the 1:N dedup search [S2][S3][S5]." },
        { name: "P8 · Open-source release + GTM", detail: "Repo April 29 2026, v1.0.0 May 25 2026 [S1][S2]. Naming and brand (the zep.IRIS lockup), launch carousel, and launch post designed in-house, with the data-science team. Recognised publicly by Zepto's co-founder, CTO, and data-science team." },
      ],
    },

    {
      group: "Adaptive layer",
      eyebrow: "v2 · thesis",
      id: "zi-adaptive",
      title: "Adaptive Capture: geometry meets the person",
      summary:
        "The v2 thesis: every face is a different size and shape, captured by a different hand, on a different phone, in different light. v1 asked every person to satisfy one canonical capture; v2 inverts it. The system reads the person and the conditions, then adapts its geometry, optics, and coaching, while quality floors and match thresholds stay fleet-constant. Adaptation is help, never a different standard.",
      patterns: [
        {
          name: "Fitted Ring",
          context: "Mobile 1:1, reused at enrolment and kiosk",
          problem: "A single canonical oval forces every face to perform a normed geometry the matcher does not require. Adult inter-eye distance alone spans a 1.5x range [S68]; 49% shoot one-handed at arm's length [S63].",
          mechanism: "ML Kit per-frame bounding box, landmarks, pose, and inter-eye distance drive a ring that initialises to the ICAO-valid band (face midpoint 45-55% of width, 30-50% of height, head width 50-75% [S15]), fits itself to the detected face's aspect and position, and asks only for the delta to the nearest valid geometry, never to a canonical centre. Hard floors stay fixed: IED 90 px minimum, pose within about 15 degrees [S28], face area 0.01 of frame [S4]. Auto-capture on lock; no shutter.",
          states: "searching · fitting · converging (geometry tightens, colour stays neutral until lock) · locked (auto-capture) · coached (single shortest-correction cue)",
          risks: "Adaptation relaxes position and shape, never quality floors; flexed floors would hand some faces quietly worse captures, a per-face quality tier that can map onto demographics. Never personalise geometry from the enrolment photo alone.",
        },
        {
          name: "One Fix at a Time",
          context: "Mobile, enrolment, kiosk retry",
          problem: "Generic try-again wastes diagnostic signal the system already has; multi-point text coaching goes unread [S51, VENDOR][S37].",
          mechanism: "An OFIQ-style per-component quality vector [S14]: cheap on-device proxies at preview rate (face-region luminance histogram, Laplacian sharpness, eye-open probability, pose, IED), plus per-check server verdicts from /v1/iqa [S3]. A priority arbiter (no face > occlusion > exposure > distance > pose > eyes > sharpness) picks exactly one failing component and renders one icon-plus-motion cue phrased as the fix (Move back), never the fault (Too close). Icon-first; one short localized line max; no cue requires reading.",
          states: "live-coach · cue-swap · server-reject (named gate, targeted retry) · clean",
          risks: "Exposure proxies calibrated on lighter skin will flag darker-skinned faces as under-exposed in identical light [S66]; calibrate on face-region SNR across skin tones and log per-component failures by site and device tier.",
        },
      ],
    },

    {
      group: "Adaptive layer",
      eyebrow: "v2 · light",
      id: "zi-light",
      title: "The two Ladders and the Glow Frame",
      summary:
        "Low light on old budget phones cannot be fixed by brightening a dim screen: physics needs about 100 lux on the face [S46]. So light becomes a ladder of escalating interventions, cheapest and least visible first, and outdoor sun gets its own mirror.",
      patterns: [
        {
          name: "Light Ladder",
          context: "Warehouse-dark mobile; rungs 1-2 on kiosk",
          problem: "Dark breaks matching and passive liveness together [S53, VENDOR][S12], and dim budget LCDs cannot deliver a clean exposure at arm's length [S46].",
          mechanism: "Rungs run cheapest-first, re-scoring after each; rungs 1-2 are invisible and complete within about 600ms [HYPOTHESIS]. (1) FACE_PRIORITY auto-exposure: the face, not a doorway, sets exposure [S22]. (2) EV nudge, best-effort [S23]. (3) Glow Frame plus come-closer (illuminance rises with the inverse square of distance [S46]). (4) Guide-to-light: the luminance gradient across the face drives a turn-toward-the-light arrow, confirmed live. (5) Handoff: kiosk or supervisor as a first-class path.",
          states: "auto (invisible) · illuminate · guide-to-light · handoff (no penalty framing)",
          risks: "Face-region brightness differs by skin tone under identical light [S66], so rungs trigger on face-region SNR, not scene luminance; per-person illumination adjustment is the study-recommended remedy, making this ladder a fairness intervention. Never auto-lock on repeated low-light failures.",
        },
        {
          name: "Glow Frame",
          context: "Rung 3 of the Light Ladder",
          problem: "A naive full-screen white flash destroys the live preview and the coaching ring at exactly the moment guidance matters; Google warns screen flash is hard to do consistently across devices [S21].",
          mechanism: "An illuminated border (the Snapchat Ring Light precedent, built for inclusive low-light capture [S29]) maximises emissive area while preserving a shrunken preview and the ring inside it. Max brightness; warm temperature default (kinder on darker undertones, less glare on glasses). API 28+: CONTROL_AE_MODE_ON_EXTERNAL_FLASH, wait for AE/AWB convergence before scoring [S21]. The too-close ceiling relaxes slightly in glow mode (within IED floors). Time-boxed 2-3s per attempt: sensing is a primary battery cost [S42] on the worker's personal phone.",
          states: "glow-in (ramp, never strobe) · settling · capturing · glow-out",
          risks: "Cross-device inconsistency is the documented failure mode, which is why glow is a rung, not the answer.",
        },
        {
          name: "Bright Ladder",
          context: "Outdoor riders",
          problem: "Over-exposure and backlit sun cause false negatives just as under-exposure does [S7], and direct sun makes the screen itself, the ring and cues, hard to read [S17].",
          mechanism: "High-lux branch: (1) FACE_PRIORITY metering so the sky does not set exposure [S22]; (2) negative EV pull-back [S23]; (3) turn-from-the-sun cue when the face-vs-scene luminance ratio says backlit, confirmed live; (4) shade-seeking cue, then the escalation budget. Sunlight legibility rule: in this branch the ring and cues switch to maximum-contrast rendering (thicker stroke, no translucency, no colour-only signals). A cue that cannot be seen in sunlight does not exist.",
          states: "auto (invisible) · turn-cue · shade-cue · handoff",
          risks: "EV pull-down in mixed light can under-expose the face to save the sky; the face-region histogram arbitrates. Never make shade cues blocking for a rider standing in traffic.",
        },
      ],
    },

    {
      group: "Adaptive layer",
      eyebrow: "v2 · governance + enrolment",
      id: "zi-governance",
      title: "Floors, enrolment, and the frames that win",
      summary:
        "The governance rule that keeps adaptation honest, the enrolment flow that sets every future match's ceiling, and the capture mechanics that beat the tapped frame.",
      patterns: [
        {
          name: "Floor Holds, Path Flexes",
          context: "Governs all adaptive patterns",
          problem: "The tempting version of adaptation is loosening thresholds where conditions are bad, and that dial has no free settings [S10]; silent per-site drift would be unauditable folklore.",
          mechanism: "Adaptation changes the path (which rungs run, how much coaching, which fallback, when the primer collapses), never the floors (IED, pose, exposure band, face area) or match/liveness thresholds. Thresholds live only in per-workflow config [S5], expressed in FMR/FNMR and APCER/BPCER vocabulary [S16]; every change is a logged, attributed config event in IMI. High-stakes workflows get an explicit confirm; attendance auto-completes [S24].",
          states: "fast path (veteran, ring only) · coached path · high-stakes path (explicit confirm) · config-change event (logged, reviewable)",
          risks: "Path-flexing must not become a slow lane that stigmatises sites or tenure groups; the coached path is additive help, never added friction.",
        },
        {
          name: "Golden First Photo",
          context: "Enrolment: the identification ceiling",
          problem: "Enrolment quality caps every future match [S10], and the shipped dedup search can flag or block a face [S5] with no designed collision state.",
          mechanism: "Enrolment-grade floors (IED 120+ px target); a Face ID-style fill-the-arc multi-frame capture across slight pose variation [S25], storing several embeddings (up to 2x fewer misses [S10]), with a one-tap accessibility escape [S25][S19]. Capture happens on the phone or an attended lit corner, never in the queue (the Amazon One split [S32]). The duplicate-conflict state, designed: plain-language explanation, a named review queue with a stated SLA, and an interim work path, so day one is never a dead-end. Presume data hygiene, not fraud [S11].",
          states: "prime · guided multi-frame (arc) · quality review (worker sees and accepts the reference) · duplicate-conflict · confirmed",
          risks: "Strict floors without the assisted path exclude exactly the workers with the worst phones on day one; the attended corner is mandatory.",
        },
        {
          name: "Best Frame Wins",
          context: "Mobile, enrolment, kiosk",
          problem: "The frame a user deliberately taps is rarely the best one the camera saw; guided capture with best-frame selection has the industry's strongest lift numbers [S47][S48, VENDOR]. A shutter tap also fights one-handed arm-length operation [S63].",
          mechanism: "A rolling buffer of the last about 15 gate-passing frames, each scored cheaply (sharpness, eye-open, pose delta, exposure distance); an optional distilled quality CNN re-ranks per device tier [S45]. No shutter exists. On ring lock, the single best frame (which may predate the lock) uploads as one compressed JPEG. On patchy networks, store-and-forward: the worker walks away at capture, not at upload [S37].",
          states: "buffering (silent) · locked (best frame selected) · queued-offline (worker released) · submitted",
          risks: "Selecting a frame the user never saw creates a consent-perception gap: the success beat shows the chosen frame. Buffer only gate-passing frames, flush on exit. Verify any CNN scorer's distribution across skin tones before it picks frames.",
        },
        {
          name: "Second Chance Ledger",
          context: "Deferred failures under store-and-forward",
          problem: "What happens when a deferred server-side match or spoof check later fails on a worker who already started the shift? Unanswered, the offline path silently recreates the wage-risk pattern it exists to prevent [S37].",
          mechanism: "A deferred reject never becomes an automatic absence or wage event. It lands as a deferred exception in the Reviewer's Bench with the frame, the failing check, and site context; the shift stands by default while open; resolution is supervisor-mediated; wage clawback is never automatic. Repeated deferred failures clustered at a site surface as a network investment signal, not a worker-fraud signal.",
          states: "queued-offline · deferred-exception (shift stands) · supervisor-resolved · site-signal",
          risks: "A too-generous default invites gaming; mitigations are the spoof check still running on the deferred frame, per-worker exception clustering, and audit thresholds for repeat offenders.",
        },
      ],
    },

    {
      group: "Adaptive layer",
      eyebrow: "v2 · kiosk",
      id: "zi-kiosk",
      title: "The kiosk that bends, and one face at a time",
      summary:
        "The Mother Hub tablet gets the same adaptive thinking: meet the person at their height, refuse to guess between faces, and protect both the queue's pace and the worker's privacy.",
      patterns: [
        {
          name: "Kiosk That Bends",
          context: "MH kiosk ergonomics",
          problem: "A fixed counter-height tablet cannot serve the 140-200 cm human range [S17]; crouching and tiptoeing produce exactly the high-pitch pose angles NIST lists as canonical failure causes [S7]. Overhead warehouse lighting adds glare.",
          mechanism: "Digital pan: run detection on the full sensor frame and dynamically crop so the on-screen ring meets the face at the person's own height; the mirrored preview shows their face already inside the ring. A tilt cue plus the hardware half (tilt-adjustable mount, matte anti-glare hood) as an explicit v2 hardware decision. FACE_PRIORITY metering so ceiling fixtures do not set exposure [S22].",
          states: "attract · acquired (crop pans to the person) · tilt-cue · matched (confirm, then hard reset)",
          risks: "Fixed-height capture is a demographic-correlated pose penalty (shorter workers, disproportionately women); digital pan removes it, which is the fairness argument for the pattern. Aggressive crop-follow can lock onto a leaning bystander; pair with One Face, Front of Queue.",
        },
        {
          name: "One Face, Front of Queue",
          context: "MH kiosk integrity",
          problem: "A shift-change queue puts multiple faces in frame; processing the wrong one is an accuracy failure and a consent failure at once [S18], and every extra searched face multiplies false-positive exposure [S9].",
          mechanism: "Select the largest face only when it exceeds the second-largest by a clear dominance margin (about 1.6x bbox area [HYPOTHESIS]) and meets the IED floor; frames failing the margin are never uploaded or searched (fail closed). Ambiguity: the ring greys, a step-back cue plus a floor decal marks the spot. Act-then-open reset: a minimal worker-angled confirm (first name, colour tint, one chime; no photo, no full-name broadcast at queue scale, a quiet Not-me touch target as mis-attribution defence), then hard reset. Cycle budget 2-5s [HYPOTHESIS, anchored: Wicket under 2s, DigiYatra about 5s [S35][S33]]. Near-tie results (twins defeat every algorithm [S11]) route to a quiet see-your-supervisor handoff, never a pick-your-own-identity list.",
          states: "attract · single-face · ambiguous (fail closed, nothing searched) · matched-confirm (minimal) · hard reset",
          risks: "The largest-face heuristic mis-fires on a tall person leaning over a shorter worker; margin rule plus decal mitigates, ambiguity always fails closed. Never retain bystander data, even transiently.",
        },
      ],
    },

    {
      group: "Adaptive layer",
      eyebrow: "v2 · person + policy",
      id: "zi-person",
      title: "Occlusion, memory, and what not to build",
      summary:
        "The patterns that adapt to the person over time, the compliance pattern the law requires, the reviewer portal that makes every promise real, and the one anti-pattern the evidence forbids.",
      patterns: [
        {
          name: "Uncover, Don't Loosen",
          context: "Rider helmets and masks; appearance drift",
          problem: "Occlusion is a 17x false-non-match multiplier [S8], and the lazy adaptations (loosening thresholds, grinding retries) respectively weaken security for everyone and tax the occluded.",
          mechanism: "Occlusion becomes a flow step before the ring engages: a visor-up/mask-down icon cue, ring dormant until the occlusion proxy clears (landmark visibility, never head-covering presence), so workers never burn retries on a doomed capture. Appearance drift: repeated near-threshold true matches trigger a cadence-capped re-enrolment nudge (update your photo, 30 seconds), never threshold drift [S10]. Religious head coverings are enrolled as worn: daily checks compare like with like, and no worker is ever asked to remove one.",
          states: "pre-ring occlusion cue · cleared (ring engages) · drift-nudge (non-blocking) · re-enrol (as worn)",
          risks: "An occlusion gate tuned on bare faces will flag turbans, hijabs, and beards as failures; measure landmark visibility only, disable any no-head-coverings component [S14]. PAD is weaker for occluded and female faces [S44]: log spoof false-rejects by occlusion state, never auto-lock on them.",
        },
        {
          name: "Quiet Profile",
          context: "The system that remembers how to help you",
          problem: "Per-frame adaptation resets every session; it fits the face in view but learns nothing about the person.",
          mechanism: "A minimal, worker-visible help profile: site lighting class, device tier, historically first-failing quality component, run count. Its only outputs: pre-arm the right ladder rung, pre-load the likely correction icon, pace the primer collapse [S64]. Floors and thresholds never read it. No images, no embeddings; decays after 30 days of disuse; explained in plain language (we start your camera brighter because your site is dark).",
          states: "cold (fleet defaults) · pre-armed · decayed",
          risks: "Any profile is a correlate of protected attributes; the guardrails are output-limitation (help only), transparency, and decay. If it ever feeds thresholds, the pattern has failed its own governance.",
        },
        {
          name: "No Simon Says (anti-pattern)",
          context: "All surfaces: what NOT to build",
          problem: "Active liveness challenges (blink, turn, smile) look like an easy anti-spoof upgrade, and the evidence says do not: a documented migration to passive took completion from 60% to 95%+ [S49, VENDOR]; challenges are awkward in public and exclude users who cannot comply [S50, VENDOR]; WCAG 2.2 requires a cognitive-test-free path [S19].",
          mechanism: "Liveness stays passive and single-frame in the daily path, categorically. Repeated-inconclusive captures escalate to the human path, never a gesture challenge. Active challenges exist only in the opt-in audit workflow. The anti-spoof budget goes where passive PAD actually breaks: red-teaming zoomed bezel-free replays on the real kiosk tablet and lowest-tier Androids, in dark and glare [S12]. Threat model: iBeta Level 1, a colleague with a phone photo, under $30 [S16].",
          states: "allowed: passive capture identical to normal flow · allowed: audit-only escalation with human review · forbidden: challenge-prompt, gesture-timeout, challenge-failed",
          risks: "Zoomed replay is passive PAD's weakest case, so the standing red-team regime and IMI fleet monitoring are load-bearing, not optional.",
        },
        {
          name: "Reviewer's Bench",
          context: "The IMI portal, finally designed",
          problem: "Duplicate conflicts, near-ties, deferred exceptions, and config events all terminate in a portal v1 never designed. Recourse is only procedurally just if the reviewer side works [S61].",
          mechanism: "Typed queues with SLAs (duplicate-conflict: within one shift; near-tie: minutes, supervisor-assisted; deferred exception: before payroll cutoff; config review) [HYPOTHESIS: values with ops]; worker-facing copy may only promise what a queue delivers. Case anatomy: the frame, per-check verdicts [S3], match scores in context, exception history, one-click outcomes. A concrete, owned fairness dashboard: per-component failures and liveness false-rejects by site lighting, device tier, occlusion state, with divergence alerts. The hard rule enforced here: no fully automated lockout, every terminal reject is a human decision.",
          states: "typed queues · case view · fairness dashboard · config audit trail",
          risks: "A fairness dashboard no one owns is decoration; the owner is named or the pattern is unshipped.",
        },
        {
          name: "Rights & Retention",
          context: "The compliance pattern (DPDP Act 2023)",
          problem: "Workforce biometric processing in India has a governing law, and acceptance is strictly purpose-bounded [S62].",
          mechanism: "Grounded in the DPDP Act 2023 [S69], Section 7(i) legitimate-use ground for employment, with purpose limitation and data-principal rights [S70]. Product states: plain-language icon-first notice at enrolment (what is captured, what for, who sees it, how long); purpose limitation stated in-product (attendance only, no emotion or attention analysis anywhere); retention windows and deletion on exit [GAP: values with legal]; worker data rights through the Bench (view your photo and record, correction, grievance); model changeover as a communicated event. Embeddings from different models are not comparable, so an embedding-model swap is fleet-wide re-embedding (invisible if source images are retained in MinIO [HYPOTHESIS: unconfirmed]) or a staged re-enrolment campaign, never an overnight switch.",
          states: "notice · purpose card · retention clock · my-record view · changeover notice",
          risks: "Compliance rendered as a policy PDF instead of product states fails both the law's spirit and the worker's trust.",
        },
      ],
    },

    {
      group: "Motion",
      eyebrow: "v2 · motion spec",
      id: "zi-motion",
      title: "Motion: calm, honest, and engineered to end well",
      summary:
        "Written inside the house motion system (the animation base layer; physicality: interruptibility, momentum, spatial origin, springs, and when NOT to animate). Restraint and no-motion are first-class outcomes; every state ships a parked still.",
      principles: [
        "Two clocks, routed by who is driving. Worker steering (framing, retry): immediate, interruptible, no lead-in. System working (match, upload): honest status, never manufactured effort; the labour illusion applies only to genuine waits [S59], so a sub-2s match gets zero processing theatre.",
        "Motion budget decays with frequency. The 500th check-in animates less than the 1st [S64]. The only motion that never decays: the one-frame acknowledgement of input and the success stamp.",
        "The ring is the single continuous voice. One geometric status channel closes the gulf of evaluation frame by frame [S55]; every cue is the fix, not the fault; red, shake, and error sounds do not exist in the capture loop. Restraint is procedural justice rendered as motion [S61].",
        "Engineer the ending, never the failure. Peak-end [S58]: success is the one crafted signature motion (under 800ms, multi-sensory); a reject is never terminal punctuation.",
        "Sound and haptics are a scarce per-surface vocabulary. Mobile owns exactly three tactile events: lock tick, commit tick, success double-pulse [S26]. Corrections and failures are silent. The kiosk owns exactly one audible event: a single success chime per person.",
        "No-motion is a spec, not an omission. Kiosk reset, repeated micro-events, and reduced-motion renderings are instant by design.",
      ],
      keyMoments: [
        { moment: "Ring: search, track, lock", spec: "Searching: a neutral hairline ring breathing slowly, explicitly not a spinner (a spinner says busy; breathing says waiting for you). Tracking: continuous spring catch-up, retargeting every frame; geometry tightens as deltas shrink but colour stays neutral until lock. Lock: hairline to 2px, neutral to accent in a 150ms fade, one light haptic tick. Geometry derives from ICAO ratios [S15]. Restraint: lock is a state change, not a celebration; it happens hundreds of times a week." },
        { moment: "Live coaching", spec: "One correction at a time, cross-fading 200ms, never stacking. The ring gestures the fix: too close, it eases outward inviting the face to settle back in; off-centre, a nudge toward the target. Too dark runs the ladder in order: invisible rungs first (about 600ms), and only then the border warms into the Glow Frame, so the visible cue appears exactly when it IS the fix. Restraint: no red, no shake, no haptic, no sound on corrections; a correction feels like navigation, not a verdict." },
        { moment: "Capture commit (no shutter)", spec: "Auto-capture when the gate holds; Best Frame Wins submits the top buffer frame. The ring closes to a solid stroke in 150ms, the preview freezes on the chosen frame so the worker sees exactly what was submitted, one light tick. Restraint: no shutter sound on either surface; kiosk sound is reserved for the result, one signal per person." },
        { moment: "Match wait, under 2s", spec: "The frozen frame holds; the closed ring takes at most one slow breath, cancelled the instant the result lands. Nothing else moves. At 2s, honest escalation: a hairline arc plus Slow network, still trying. At timeout: Saved, your check-in will complete when the network returns [S37], with the Second Chance Ledger behind it. Restraint: no spinner under 2s, no fake progress, no staged encrypting/matching copy, ever." },
        { moment: "Success, the peak-end moment", spec: "Mobile: under 800ms total, auto-dismiss. Stroke draws into a check over about 300ms (single gentle settle, no bounce), a success tint washes in, name plus Shift started 9:02 stamps in, one distinct double-pulse. Identical every time: the reward is reliability plus speed [S58]. Kiosk: a minimal worker-angled confirm (first name, tint, one chime; no photo, no full-name broadcast; quiet Not-me target), held about 1s, then auto-reset. Restraint: no confetti, no streaks, no count-ups." },
        { moment: "Soft fail, zero shame", spec: "A quality failure never renders a failure screen: the UI cross-fades straight back to the live ring with the specific correction pre-loaded, named from the per-check verdict (Too blurry, hold still a moment [S3]). Retry starts automatically. Kiosk rejection is additionally private: never announced at queue scale. Restraint: no X, no red flash, no buzz, no visible attempt counter. The strongest zero-shame choreography is that failure has no choreography." },
        { moment: "Escalation handoff", spec: "When the budget trips, a bottom sheet enters on a spring from its home edge, drag-dismissable with release-velocity momentum. Tone shifts from coaching to recourse, never alarm: We could not match you this time. Your check-in is recorded for review. You will not lose this shift. Restraint: no countdown, no lockout animation; the copy presumes the system failed the worker, and the motion register does not escalate even though the situation did [S60]." },
        { moment: "Kiosk auto-reset", spec: "After the 1s confirm, the identity card exits with a 200ms downward fade; total reset under 400ms, the fastest transition in the system, because the queue's cadence is the master clock [S33][S35]. Hard sequencing: the next face cannot bind until the wipe completes, so the previous identity is provably off-screen (no session bleed). Restraint: no reset indicator; the reset must read as already-ready." },
        { moment: "Enrolment arc", spec: "A segmented arc around the Fitted Ring fills per validated pose frame (the Face ID grammar [S25]); one commit tick when the arc completes; a persistent quiet accessibility escape. Quality review: the reference photo full-bleed, This is the photo your check-ins will match against, accept in the thumb zone. Duplicate-conflict: the same bottom-sheet grammar, plain language, a promised SLA, an interim path; no red, no fraud language. Restraint: enrolment is the one flow allowed a slightly warmer completion, because it happens once; even so, under 1.5s." },
      ],
      oneEscalationMachine:
        "The pattern drafts carried three separate counters (low-light attempts, failed matches, inconclusive liveness) that could stack into six-plus attempts before help. Resolved: a check-in episode owns a single budget, 3 scored attempts or 45 seconds, whichever trips first [HYPOTHESIS], because the documented field disaster is workers retrying for 45 minutes [S36]. Only server-scored failures increment the counter; coaching and ladder rungs consume only the clock. First reject pre-loads its named correction; second reroutes (next rung or kiosk early); third, or the clock, opens the handoff sheet. Every terminal path is human; none is a locked account. Inconclusive liveness is a scored attempt, never a gesture challenge.",
    },

    {
      group: "Proof",
      eyebrow: "Requirements",
      id: "zi-requirements",
      title: "Requirements: shipped and proposed",
      summary:
        "ZI-01 to ZI-11 are the corrected record of shipped v1. ZI-12 to ZI-27 are the proposed v2 adaptive layer, all unshipped.",
      shippedV1: [
        "ZI-01 · A rider or DH worker completes a 1:1 verification on their own phone in about ten seconds, no OTP, no typing",
        "ZI-02 · An MH worker is identified 1:N from a shared tablet with no phone or ID; the kiosk resets between people",
        "ZI-03 · One camera screen serves attendance, anti-impersonation, and onboarding consistently",
        "ZI-04 · On-device ML Kit checks (face centred, both eyes open, not a close-up) block bad frames before upload and coach in real time [S5]",
        "ZI-05 · A failed capture offers an instant, judgment-free retry with no penalty state",
        "ZI-06 · Every submission passes spoof, blur, and NSFW classifiers before any human sees it [S3]",
        "ZI-07 · Validated frames become 512-d ArcFace-family vectors (AuraFace-v1 or buffalo_l), matched via Milvus ANN search (FLAT+COSINE in OSS; HNSW claimed in production) [S2][S3][S5]",
        "ZI-08 · Every match decision is wrapped in an auditable IMI record",
        "ZI-09 · Match thresholds are configurable per workflow; verified shipped [S5]",
        "ZI-10 · Enrolment produces a registered identity of sufficient quality and runs a 1:N dedup search that can flag or block an already-registered face [S5]",
        "ZI-11 · The open-source distribution is cloneable and runnable outside Zepto [S1]",
      ],
      proposedV2: [
        "ZI-12 · The ring fits itself to the detected face and coaches only the shortest correction to an ICAO-valid band; floors stay fleet-constant",
        "ZI-13 · Coaching surfaces exactly one failing component at a time, icon-first, phrased as the fix; per-component failures instrumented",
        "ZI-14 · Low-light capture escalates through the ordered ladder, triggered on face-region SNR, not scene luminance",
        "ZI-15 · Outdoor-bright mirrors the ladder with a maximum-contrast sunlight rendering",
        "ZI-16 · Adaptation changes the assistance path only; floors and thresholds change exclusively via logged config events reviewable in IMI",
        "ZI-17 · Enrolment: enrolment-grade floors, guided multi-frame with an accessibility escape, an attended path, and a designed duplicate-conflict state with an SLA and interim work path",
        "ZI-18 · Capture is shutterless: buffer-scored best frame auto-submits; on network failure, capture completes locally and uploads in the background",
        "ZI-19 · A deferred server-side failure becomes a supervisor-mediated exception; the shift stands by default; wage clawback is never automatic",
        "ZI-20 · The kiosk digitally pans to the worker's height, meters on the face, and gains a tilt-adjustable anti-glare mount",
        "ZI-21 · The kiosk searches only a dominance-clear single face, fails closed on ambiguity, confirms minimally, hard-resets before next acquisition, routes near-ties to a supervisor",
        "ZI-22 · Occlusion is a pre-ring flow step; references enrolled as-worn; drift triggers a cadence-capped re-enrolment nudge; no threshold ever loosens for occlusion",
        "ZI-23 · A worker-visible, decaying help profile pre-arms assistance only; it never touches floors, thresholds, or standards",
        "ZI-24 · Daily-path liveness is passive-only; active challenges exist solely in the opt-in audit workflow; quarterly red-team against zoomed bezel-free replays",
        "ZI-25 · The portal ships typed queues with SLAs, full case anatomy, an owned fairness dashboard, and enforces no-automated-lockout",
        "ZI-26 · Notice, purpose limitation, retention, worker data rights, and model-changeover notice per the DPDP Act 2023 [S69][S70]",
        "ZI-27 · One escalation budget per episode (3 scored attempts or 45s); every terminal path is human",
      ],
    },

    {
      group: "Proof",
      eyebrow: "Measurement",
      id: "zi-measurement",
      title: "Measurement plan and labelled hypotheses",
      summary:
        "Governing metrics per surface, per site-lighting class, per device tier. Invented constants are labelled hypotheses with a pilot to validate them, because explicit uncertainty beats false precision.",
      governingMetrics: [
        "First-time pass rate (FTPR): episodes resolved on the first scored attempt. Baseline [GAP]; industry anchor 90% [S47, VENDOR]",
        "Attempts-to-pass: scored attempts per successful episode, trending to 1.0",
        "p95 time-to-lock (camera-open to ring-lock) budgeted per device tier",
        "p95 episode time under 10s (the DHS bar [S18])",
        "Kiosk cycle time 2 to 5s [HYPOTHESIS]; escalation rate under 1% [HYPOTHESIS]",
        "Fairness deltas: every metric above, sliced by site lighting, device tier, occlusion state; alert on divergence; owned in the Reviewer's Bench",
      ],
      labelledHypotheses:
        "The 1.6x kiosk dominance margin; the 3-attempt/45s escalation budget; the 600ms invisible-rung window; the 800ms success budget; the 2-5s kiosk cycle; Bench SLA values; the drift-nudge trigger window. All to be set or validated in the pilot, none presented as field facts.",
      pilotShape:
        "Two dark stores (one low-light-heavy) plus one Mother Hub, four weeks, the v2 capture layer against the v1 gate as control. Per-frame rejection reason codes on from day one (they also finally quantify the v1 capture-success lift this PRD has carried as UNVERIFIED). Fairness slices reviewed weekly; any slice divergence pauses the rollout, not the worker.",
    },

    {
      group: "Proof",
      eyebrow: "Outcomes · ledger",
      id: "zi-outcomes",
      title: "Outcomes, and the shipped-vs-proposed ledger",
      summary:
        "v1 actuals (internal figures), and the honesty ledger a sceptical reviewer should check: column A is verified shipped, column B is proposed by this author and unshipped.",
      v1Outcomes: [
        "Coverage across Mother Hubs + Delivery Hubs: partial to 100%",
        "Monthly cost-saving potential: 0 to up to Rs 50L as the system scales",
        "Realised monthly savings: Rs 10-20L [UNVERIFIED: internal]",
        "Cost-per-order: down, by reducing Hyperverge dependency",
        "Adoption: 100%, treated as a fundamental need finally solved",
        "Open source: v1.0.0 May 25 2026; 342 stars, 87 forks at six weeks [S1]",
      ],
      verifiedShipped: [
        "ML Kit on-device gate: centred, eyes open, not close-up [S5]",
        "Spoof/blur/NSFW classifiers, parallel, per-check thresholds [S3]",
        "Per-workflow thresholds [S5]",
        "Enrolment 1:N dedup, flag or block [S5]",
        "Milvus search: FLAT+COSINE OSS, HNSW production claim [S2][S5]",
        "IMI auditable portal exists; backend OSS release, Docker-composable [S1]",
      ],
      proposedByThisAuthor: [
        "Fitted Ring, One Fix at a Time, both Ladders, Glow Frame",
        "Best Frame Wins, Second Chance Ledger",
        "Floor Holds Path Flexes governance, the auditable dial",
        "Golden First Photo UX, the duplicate-conflict state",
        "FPIR-derived per-site calibration; kiosk digital pan; One Face gating",
        "Quiet Profile, Reviewer's Bench, Rights & Retention, the motion spec, the escalation machine",
      ],
      risks: [
        "Threshold tension is permanent: friction vs security has no free setting [S10]; the per-workflow dial is the mitigation, the ledger keeps it auditable.",
        "Adaptation-as-bias is the central v2 risk, handled structurally: floors fleet-constant, occlusion measured as landmark visibility, skin-tone-calibrated exposure proxies, profile output-limited, an owned fairness dashboard.",
        "Passive-only liveness leaves zoomed replay as the weakest case [S12]; the standing red-team regime is load-bearing.",
        "Store-and-forward invites gaming at the margin; clustering telemetry and audit thresholds are the counterweight.",
        "Open-source hygiene: the license ambiguity (MIT text vs NOASSERTION [S1]) undermines the headline claim until fixed.",
        "The viral claim is under-evidenced (155 reactions on the brand post [S6]); resolve before the case study leads with it.",
      ],
      openGaps: [
        "No published evaluation of AuraFace-v1 / buffalo_l on Indian faces; NIST shows training-data geography drives differentials [S65]. Commission or locate one before v2 ships.",
        "Retention-window values and consent copy, with legal (framework in Rights & Retention).",
        "Resolve the LICENSE file with the data-science team.",
        "Production HNSW parameters, per-workflow threshold values, whether source images are retained for re-embedding.",
        "v1 capture-success lift % (the pilot's reason codes will finally measure it).",
        "Co-founder/CTO launch post links and numbers.",
        "Agam's formal title; exact team composition.",
      ],
    },

    {
      group: "Proof",
      eyebrow: "Appendix",
      id: "zi-sources",
      title: "Sources",
      summary:
        "70 sources, all URLs fetched and claims adversarially verified July 5 2026; corrections applied where the checker found drift. Vendor sources are used for vendor-observable facts only. Grouped highlights; the full keyed list lives in the source doc.",
      zepirisPrimary: [
        "S1-S4 · The zepiris repo: readme and metadata, v1.0.0 release notes, ML inference docs, .env.example (github.com/zepto-labs/zepiris)",
        "S5 · The launch blog: ZepIris, Reimagining Scalable Face Authentication for Attendance at Zepto (Zepto TechXPress / Medium)",
        "S6 · The Zepto Tech LinkedIn launch post",
      ],
      standardsAndNist: [
        "S7-S12 · NIST: FATE Quality Assessment; masks study (NISTIR 8311); 1:1 to 1:N FPIR relation; FRVT Part 2 Identification (NISTIR 8271); Twins (IR 8439); passive PAD (IR 8491)",
        "S13-S19 · ISO/IEC 29794-5:2025; OFIQ v1.1 (BSI); ICAO Portrait Quality TR; iBeta ISO 30107-3 levels; Frontex ABC guidelines; DHS MdTF Rally; WCAG 2.2 SC 3.3.8",
        "S65-S68 · NISTIR 8280 Demographic Effects; Wu et al. skin-tone brightness (arXiv 2206.01881); Gender Shades (PMLR 81); Dodgson interpupillary distance (SPIE 5291)",
      ],
      platformsAndDeployments: [
        "S20-S32 · ML Kit face detection; Camera2 screen flash; FACE_PRIORITY (AOSP); CameraX; BiometricPrompt; Apple Face ID setup, settings, HIG; Windows Hello; Snapchat Ring Light; Pixel selfie illumination; Snap AR; Amazon One",
        "S33-S39 · DigiYatra (Intl Airport Review + DY-BBS policy); Wicket stadium gates; The Wire on NMMS (two pieces); ISB Aadhaar PDS study; RBI KYC Master Direction (V-CIP)",
      ],
      researchAndTheory: [
        "S40-S54 · QMUL SurvFace; Facebook edge inference (HPCA); MobiSys sensing energy; PAD survey (ACM); PAD fairness (Pattern Recognition); best-frame CNN (PeerJ); Lumileds flash physics; Onfido/Entrust lift numbers [VENDOR]; ID R&D passive migration [VENDOR]; Innovatrics; iProov (two) [VENDOR]; Facia [VENDOR]; buddy-punching survey (HR Daily Advisor)",
        "S55-S64 · NN/g gulfs, heuristics, progressive disclosure; calm technology (Weiser & Brown); peak-end (Kahneman et al.); labour illusion (Buell & Norton); trust calibration (Lee & See); procedural justice (Alge); Pew workplace-biometrics survey; Hoober one-handed use",
        "S69-S70 · The Digital Personal Data Protection Act 2023 (official MeitY text); Section 7(i) employment-exemption analysis (Bar and Bench)",
      ],
    },
  ],
};
