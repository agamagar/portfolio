// The ZepIris (codename OdinEye) walkthrough, written to be SPOKEN (first person,
// a designer narrating the project to you). Fed to NarrationPlayer, which reads it
// aloud via the browser's speech synthesis and karaoke-highlights it. Authored so
// each paragraph splits cleanly into sentences (no abbreviations, no "e.g."), and
// numbers are spelled for natural speech. No em-dash, no tilde. Keeps the shipped
// v1 record strictly separate from the researched, unshipped v2 design.

export const zepirisNarration = {
  title: "The walkthrough, narrated",
  subtitle: "ZepIris, in the designer's voice",
  audio: "/narration/zepiris",
  paragraphs: [
    "Let me walk you through ZepIris, which inside Zepto we called OdinEye, after Odin's all-seeing eye. Every morning across the company the same small moment repeats tens of thousands of times. A rider on a bike outside a dark store, a packer stepping out of a dim aisle, a queue at a Mother Hub gate at shift change, each of them has to prove one thing before work can start: I am me, and I am here. They have about ten seconds, a cheap Android phone or a shared tablet, and whatever light the warehouse or the street happens to offer. Attendance is the quietest system in a company like this, right up until it breaks. And at Zepto's scale, it was breaking.",

    "The thing to understand is that attendance at this scale is an identity problem wearing an operations costume. It ran on registers you could game with a proxy punch, a teammate runs your shift and you split the pay, and on one-time passcodes that slowed every check-in as headcount grew. Face authentication fixes that, but the outside vendor Zepto leaned on was neither cheap nor scalable, and at this volume every single order quietly carried a slice of that cost. Face is the one factor that is non-transferable, contactless, and already carried by every worker. A badge can be handed over. A selfie cannot.",

    "Before I designed a single screen, one piece of research set the stakes and never left the room. India had already run face-authenticated attendance at national scale, for its lowest-income workforce, and the field record was grim. At one rural public-works site, only one worker's attendance was captured in nearly forty-five minutes of retries. The same kind of system turns a patchy network into a lost day's wage. So the rule I designed everything against was simple and not negotiable: a failure here has to cost a retry, never a wage. That one sentence is the spine of the whole project.",

    "The realisation that shaped the architecture was that verifying a face is not one problem, it is two. On a personal phone in a dark store it is a one to one match, one known person holding their own selfie up against their registered photo. At a Mother Hub it is a one to many search, a shared tablet identifying someone out of the entire workforce, with no phone and no card, while a line forms behind them. The research is blunt about why these cannot share a setting: the odds of a false match climb with the size of the gallery you are searching. So I gave each context its own flow, instead of forcing one compromise onto both.",

    "The part I am proudest of in what shipped is that we treated capture as a design problem, not just a model problem. Early on, people held the phone too close or shot off-angle, and the capture quietly failed. So the camera coaches you before it ever sends a frame. A face-placement ring, running on the device, checks that your face is centred, that both eyes are open, and that you are not too close, and it rejects a bad frame before a single byte leaves the phone. Retry is instant and free of judgment: a blurry frame just asks for another. No passcodes, no typing, just a selfie, so the right capture becomes the path of least resistance. Every rejected frame doubles as instruction. The camera coaches, it does not scold.",

    "Two more decisions in the shipped version carry the same idea. First, a set of quiet classifiers screen every submission for spoofing, blur, and nudity before it ever reaches a human reviewer, because you design for who sees the failure, not only for who causes it. Second, the match strictness is not one global dial. Attendance, onboarding, and audits do not want the same answer, so each workflow tunes its own balance of friction and risk. And the bias I set was the same everywhere: fail toward a retry, never toward a wrong accept or a lost wage. A false accept is a security breach. A false reject just costs another try.",

    "Then came the part I did not expect to own: the release. Open-sourcing this was Zepto's first, and a first needs a face, so I named the launch story, built the wordmark, and designed the launch post with the data-science team. One honest note about that release, because it matters for what I can claim. What went to the public repository is the backend, the matching engine and the search stack. The entire experience layer, the ring, the coaching, the kiosk choreography, the review portal, stayed internal, which means the design work is fully mine to show. In the end it reached full coverage across Zepto's hubs, opened up as much as fifty lakh rupees a month in potential savings by dropping the outside vendor, and the open-source release picked up hundreds of stars in its first weeks, recognised publicly by Zepto's co-founder and chief technology officer.",

    "Everything up to here shipped. What comes next is a design I researched and specified in a written spec, and I want to be honest about it: none of it has shipped. The research reframed the whole idea for me. The standards work traces the demographic accuracy gaps in face recognition back to capture quality, to the image, not to the person's face. Under identical light, a darker-skinned face reflects less to the sensor, and the fix the research recommends is to adjust the capture for the person. Read that again and it stops being a nicety. Capture that adapts to the person is a fairness intervention. That became the thesis of the second layer, which I called Adaptive Capture.",

    "The shipped version asked every face to satisfy one canonical capture. The design inverts that. The ring fits itself to your face's actual geometry and asks only for the shortest correction, because faces genuinely differ, the distance between an adult's eyes alone spans a range of about one and a half times. Light gets its own answer: a ladder of interventions, cheapest and least visible first, ending with the screen itself becoming a soft light source, because on a budget phone you cannot fix the dark by brightening a dim screen. The physics needs roughly one hundred lux on the face, and a dim screen at arm's length simply cannot deliver it. But here is the line that keeps all of this honest. Adaptation changes which help you get, never the quality floor or the match threshold you have to clear. The floor holds. The path flexes. Otherwise adaptation would quietly hand some faces a lower standard, and a lower standard tends to fall on exactly the people the fairness argument is about.",

    "The same thinking runs through the rest of the design. The shared kiosk digitally pans to meet each worker at their own height, instead of making a shorter person crouch or a taller one stoop into the exact pose the matcher fails on. It refuses to guess between two faces in a queue, and fails safely rather than search the wrong one. And when a check has to happen offline and only fails later, that deferred failure never becomes an automatic absence or an automatic pay cut. It lands in front of a supervisor, the shift stands while it is open, and a person decides. No worker is ever locked out by a model alone. Every dead end ends on a human who can say yes. That is what makes monitoring feel fair: not just accuracy, but a voice and a way to be heard.",

    "There is a motion spec underneath all of it, and its whole job is to be calm and honest. Every cue is written as the fix, not the fault. Move back, not too close. There is no red, no shake, no error sound anywhere in the capture loop, because this happens hundreds of times a week, and a small daily moment is remembered by its worst beat and its ending. So success is the one crafted moment, and a rejection is never the final word, the screen simply slides back to the live camera with the correction already loaded. And the retries are held on a single budget, three scored attempts or forty-five seconds, because the disaster in that field research was a worker stuck retrying for forty-five minutes. Restraint, here, is procedural justice rendered as motion.",

    "So if there is one thing to take from ZepIris, it is that framing. A shipped version one that made the honest capture the easy one, and a researched version two that treats adapting to the person as a matter of fairness, not polish. In a product where the currency of failure is somebody's wage, the design cannot only be accurate. It has to give the worker a voice, keep the last word with a human, and make every cue read as the fix and never the fault. A camera can coach and a model can match. The yes belongs to a person. That was the whole job.",
  ],
  asks: {
    2: [
      {
        q: "Failure costs a retry, never a wage. Is that designed in, or narrated?",
        a: "In shipped v1, a failed worker got an instant retry, that is it. The guaranteed human fallback that makes never a wage literally true is something I researched and specified for v2. I will own that: I invoked the MGNREGA failure as the bar, and v1 only partly clears it. That gap is exactly what v2 is designed to close.",
      },
    ],
    4: [
      {
        q: "Significantly lifted capture success rates, by how much, measured how?",
        a: "Honestly, we did not instrument the exact lift in v1, that is a real gap, and the pilot's reason codes will finally quantify it. What I defend is the mechanism: on-device coaching rejects a bad frame before a single byte is sent, so the backend only ever pays for one validated frame per attempt. It is the capture design and the cost model at once.",
      },
    ],
    6: [
      {
        q: "If data science owns the models and the open-sourced backend, what did you actually design?",
        a: "Data science owned the matching and liveness models. I owned every surface a human touches: the one-to-one phone flow, the one-to-many kiosk flow, the on-device capture-coaching ring, the threshold-as-product-control philosophy, and the entire launch and brand. The repo is the engine; the experience layer is the product.",
        note: "Say this boundary early and unprompted; it is the strongest shield in the case.",
      },
      {
        q: "Ten to twenty lakh realised savings, verified how?",
        a: "Internal estimate, and I should label it that. The audited outcome is coverage; the savings model is internal, based on replacing the third-party vendor's per-verification cost with in-house checks.",
      },
    ],
  },
};
