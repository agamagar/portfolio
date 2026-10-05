// Presentation deck for the ZepIris (Zepto face authentication) case study.
// Composed from the slide-archetype library in App.jsx (see buildSlides / Slide).
// Recipe follows scheduledDelivery.deck.js: title -> central-question statement ->
// set the table -> numbered context -> four phases (Two problems wearing one face,
// Designing the capture, How strict is strict enough, Built for Zepto open for
// builders) each opened by a phaseDivider -> impact -> next -> close.
// Media are the four static plates the article uses (public/zepiris-*.png).

export const zepirisDeck = [
  {
    "type": "title"
  },
  {
    "type": "statement",
    "kicker": "The whole brief",
    "text": "Ten seconds at shift start to prove one thing: I am me, and I am here. And in this product, a failure must cost a retry, never a wage."
  },
  {
    "type": "splitLabeled",
    "h": "Set the table",
    "items": [
      {
        "label": "Overview",
        "body": "ZepIris is Zepto's in-house face authentication, built to replace an expensive third-party vendor across every kind of Zepto site. It clocks in riders, pickers, and packers and onboards new hires."
      },
      {
        "label": "Role",
        "body": "I led design end to end across the phone, the shared tablet, and the review portal, and then the launch: the name, the brand, the story. Data science owned the face-matching and liveness models."
      }
    ]
  },
  {
    "type": "numbered",
    "kicker": "The terrain",
    "h": "One identity system, three very different rooms",
    "items": [
      {
        "title": "A personal phone in a dark store",
        "body": "A rider or packer proves they are themselves: a 1:1 match against their own registered photo, in whatever light the street or the aisle offers."
      },
      {
        "title": "A shared tablet at a Mother Hub",
        "body": "One kiosk identifies anyone in the workforce, a 1:N search, with no phone, no ID, and a queue forming behind them at shift change."
      },
      {
        "title": "A web review portal",
        "body": "The humans who decide what the models cannot. Every dead end in the system lands on a person who can say yes."
      }
    ]
  },
  {
    "type": "figure",
    "h": "The three contexts, drawn",
    "p": [
      "Same system, different physics. The phone optimises for one confident match; the tablet optimises for speed and a clean reset between people so the line keeps moving."
    ],
    "image": "/zepiris-contexts.png",
    "figure": "Riders and delivery-hub staff verify 1:1 on their own phones; a Mother Hub identifies 1:N from a single shared tablet.",
    "layout": "media"
  },
  {
    "type": "numbered",
    "kicker": "Why now",
    "h": "The system everyone could game",
    "items": [
      {
        "title": "Proxy punches",
        "body": "A teammate runs your shift and you split the pay. Paper registers and app check-ins made it easy, and incentive programs turned small mistakes into real fraud."
      },
      {
        "title": "OTP drag",
        "body": "One-time passwords slowed every check-in as headcount grew, and at shift change that friction multiplies across a whole queue."
      },
      {
        "title": "A vendor tax on every order",
        "body": "The third-party face-auth vendor was neither cheap nor scalable. At Zepto's volume, every single order quietly carried a slice of that cost."
      }
    ]
  },
  {
    "type": "statement",
    "kicker": "The cautionary tale",
    "text": "India had already tried face-authenticated attendance at national scale, and the field record was grim: one worker verified in 45 minutes of retries, and wages lost to patchy networks. We refused to repeat it."
  },
  {
    "type": "phaseDivider",
    "n": "01",
    "name": "Two problems wearing one face",
    "sub": "A personal phone is a match; a shared tablet is a search"
  },
  {
    "type": "compare",
    "h": "Verifying a face is not one problem",
    "a": {
      "label": "The phone, 1:1",
      "body": "One known person matching a live selfie against their own registered photo. The flow optimises for a single confident match, and coaches until it gets one.",
      "verdict": "Designed for confidence"
    },
    "b": {
      "label": "The tablet, 1:N",
      "body": "A shared kiosk picking one face out of the entire workforce, no phone, no ID, a queue behind. The flow optimises for speed and resetting between people.",
      "verdict": "Designed for the queue"
    },
    "note": "This realisation shaped everything. I designed each flow for its own context instead of forcing one compromise onto both, and kept the web portal for reviewers, not capture."
  },
  {
    "type": "phaseDivider",
    "n": "02",
    "name": "Designing the capture",
    "sub": "Coach a good frame before a single byte is sent"
  },
  {
    "type": "figure",
    "h": "One camera, every condition",
    "p": [
      "Two pieces had to scale hard: the intro screen that primes you before the camera opens, and the camera itself. The same screen serves a rider's anti-impersonation check and a packer's onboarding capture."
    ],
    "ul": [
      "Riders work in the open: bright, variable, unpredictable light",
      "Packers work in relatively low-lit delivery hubs",
      "Post-capture validation states stay common everywhere, for consistency"
    ],
    "image": "/zepiris-capture.png",
    "figure": "The capture viewport: a face-placement ring coaches framing before a frame is ever sent.",
    "layout": "split"
  },
  {
    "type": "methodFinding",
    "h": "A ring that coaches instead of judging",
    "finding": "Early on, people held the phone too close or shot off-angle, and capture quietly failed.",
    "p": [
      "So I added real-time, on-device framing guidance built on ML Kit face detection: face centred, both eyes open, not too close. The screen coaches a good capture and rejects a bad one before a single byte is sent, which is also the cost model: the backend only ever pays for one validated frame per attempt.",
      "Retry stays instant and judgment-free. A blurry frame just asks for another, so every rejection doubles as instruction."
    ]
  },
  {
    "type": "phaseDivider",
    "n": "03",
    "name": "How strict is strict enough",
    "sub": "Every face-match rides a threshold, and one global setting fails someone"
  },
  {
    "type": "compare",
    "h": "One threshold could not serve both",
    "a": {
      "label": "Onboarding and audits",
      "body": "A face is bound to an identity once and for keeps, and a false accept is a security breach. These workflows sit strict.",
      "verdict": "Strict"
    },
    "b": {
      "label": "Daily attendance",
      "body": "Run thousands of times a shift in the worst light. Here an over-strict threshold leaves a worker re-trying in the cold to get paid.",
      "verdict": "Deliberately forgiving"
    },
    "note": "So verification became configurable per workflow, each context tuned to its own balance of friction and risk. The call that settled every close one: fail toward a retry, never toward a wrong accept."
  },
  {
    "type": "methodFinding",
    "h": "Protecting the people behind the portal",
    "finding": "Real-world capture is messy in ways a studio never is, and a human has to look at what it produces.",
    "p": [
      "During onboarding, people occasionally submitted photos while not fully dressed, and those images would land in front of a reviewer. So the system screens every submission for nudity, alongside blur and spoof checks, and stops the bad ones before they ever reach the portal.",
      "The same protective instinct runs at enrolment: every new registration is searched 1:N against the whole workforce first, so a face that already exists is flagged before it can become a duplicate identity. Designing for who sees the failure, not just who causes it, became the theme of this phase."
    ]
  },
  {
    "type": "figure",
    "h": "The gate before the human",
    "p": [
      "Three classifiers stand between the field and the review desk, and everything they pass stays auditable."
    ],
    "image": "/zepiris-classifiers.png",
    "figure": "Spoof, blur, and nudity classifiers screen every submission before it reaches a human reviewer, feeding an auditable matching portal.",
    "layout": "media"
  },
  {
    "type": "phaseDivider",
    "n": "04",
    "name": "Built for Zepto, open for builders",
    "sub": "Zepto's first open-source release, and a first needs a face"
  },
  {
    "type": "figure",
    "h": "The engine, shipped to GitHub",
    "p": [
      "What went public is the backend: the API, the ML inference service, and the vector-search stack. The entire capture experience, the ring, the coaching, the kiosk choreography, and the review portal stayed internal."
    ],
    "image": "/zepiris-stack.png",
    "figure": "Every validated capture becomes a 512-d embedding, matched by ANN search and wrapped in an auditable portal.",
    "layout": "split"
  },
  {
    "type": "statement",
    "kicker": "The open-source boundary",
    "text": "The repo is the engine. The experience layer is the product."
  },
  {
    "type": "figure",
    "h": "A first needs a face",
    "p": [
      "I did not expect to own the release itself. I named the launch story, built the zep.IRIS lockup, and designed the launch carousel and post with the data-science team: the problem, the two-contexts framing, the pipeline in three beats, and the closing invitation.",
      "Clone ZepIris. Built for Zepto. Open for builders."
    ],
    "need": "Launch carousel frames from the ZepIris post",
    "needHint": "3 frames: the problem, the pipeline in three beats, the closing invitation",
    "needDim": "1080 × 1080",
    "layout": "split"
  },
  {
    "type": "impact",
    "mark": "Impact",
    "h": "The quietest system in the company, finally solved",
    "metrics": [
      {
        "value": "100%",
        "label": "Coverage across Mother Hubs and Delivery Hubs, up from partial"
      },
      {
        "value": "Up to ₹50L",
        "label": "Monthly cost-saving potential as the system scales and optimises"
      },
      {
        "value": "₹10-20L",
        "label": "Realised monthly savings (internal estimate)"
      },
      {
        "value": "v1.0.0",
        "label": "Open-sourced May 2026; hundreds of GitHub stars in the first weeks"
      }
    ]
  },
  {
    "type": "statement",
    "kicker": "Next: capture that adapts to you",
    "text": "Faces, light, and phones genuinely differ, so v2 reads the person and the conditions and adapts, never the other way round. NIST traces demographic accuracy gaps to capture quality, not faces, which makes adaptive capture a fairness intervention."
  },
  {
    "type": "closing",
    "h": "The hard part was never the camera screen",
    "p": [
      "It was making one identity layer feel native to a rider on their own phone, a hub worker on a shared tablet, and a reviewer at a desk, in low light, on weak networks, cheaply enough to beat a vendor at Zepto's scale.",
      "And the deepest lesson sits in what the system must never do: in a product where the failure currency is someone's wage, every dead end has to land on a human who can say yes."
    ],
    "kind": "outcome"
  },
  {
    "type": "closing",
    "h": "Thank you",
    "p": [
      "A camera can coach and a model can match, but the last word belongs to a person. That is the principle I would carry into whatever I design next."
    ],
    "kind": "thanks"
  }
];
