// The Stella screening-call conversation graph.
//
// Produced by the stella-conversation-graph workflow: five call segments drafted in
// parallel from the verified research, then EVERY Stella line put through an
// adversarial native-register and design-rule review. 69 lines were rejected and
// rewritten on that pass, which is why the wording here is not a first draft.
//
// Sources, all in Claude/: dassh-gujarati-research.md (register, code-mixing, the
// numerals problem), dassh-failure-taxonomy.md (every branch marked with a real
// failure case, several OBSERVED in the pilot), dassh-call-craft-research.md
// (latency, comfort noise, permission-asking), dassh-disclosure-research.md.
//
// Register invariants held throughout, verified programmatically:
//   tame and its family, never the informal tu (35 lines carry the honorific)
//   kem chho, never a religious greeting
//   {name} + bhai/ben, never a bare -ji, never a guessed kinship term
//   future-tense question form for requests, never a bare imperative
//   a contrastive read-back on every consequential number
//
// {name} is substituted at render time. Candidate details are anonymized; the source
// call log is confidential.
//
// Shape: { start, nodes: { [id]: { speaker, guj, translit, gloss, annotation:
//   {category, rule, why, source}, subAgent, branches: [{label, candidateSays, gloss,
//   failureCase, next}], next, ending } } }

export const stellaGraph = {
  "start": "open-greet",
  "nodes": {
    "open-greet": {
      "speaker": "stella",
      "guj": "કેમ છો? ઝાયડસ તરફથી ફોન છે. {name}ભાઈ સાથે વાત થાય છે?",
      "translit": "Kem chho? Zydus taraf-thi phone chhe. {name}bhai saathe vaat thaay chhe?",
      "gloss": "How are you? This is a call from Zydus. Am I speaking with {name}bhai?",
      "annotation": {
        "category": "register",
        "rule": "Open with કેમ છો, name the company inside the first breath, then confirm identity before saying anything else about the candidate.",
        "why": "Namaste is Hindu-coded and Jai Shri Krishna is specifically Vaishnava, while roughly one applicant in seven in Ahmedabad district is Muslim. Kem chho is religiously neutral and its છો carries the honorific register for free. Company name first is the anti-scam move in a market where two in three unknown-number calls are flagged as spam. Nothing about the application is spoken until the right person is on the line, because nearly half of women in Gujarat do not have a phone they personally use.",
        "source": "dassh-gujarati-research.md sections 2 and 6; Truecaller India 2025; NFHS-5 Gujarat"
      },
      "subAgent": "escalation: a dead-air timer starts at connect, so a collapse before the first question is logged as a system failure and never as candidate disinterest",
      "branches": [
        {
          "label": "Yes, that's me",
          "candidateSays": "હા, બોલું છું",
          "candidateSaysLatin": "Ha, bolu chhu",
          "gloss": "Yes, speaking",
          "next": "open-disclose"
        },
        {
          "label": "Who is this?",
          "candidateSays": "કોણ બોલો છો? શેના માટે ફોન છે?",
          "candidateSaysLatin": "Kon bolo chho? Shena maate phone chhe?",
          "gloss": "Who is speaking? What is this call about?",
          "failureCase": { "what": "Unknown number triggers scam suspicion before anything else lands", "source": "Failure taxonomy, stage 2 item 1" },
          "next": "open-whois"
        },
        {
          "label": "Are you a person or a machine?",
          "candidateSays": "તમે માણસ છો કે મશીન?",
          "candidateSaysLatin": "Tame maanas chho ke machine?",
          "gloss": "Are you a person or a machine?",
          "failureCase": { "what": "Disclosure arriving after the candidate has already engaged", "source": "Failure taxonomy, stage 2 item 4" },
          "next": "open-robot"
        },
        {
          "label": "You said my name wrong",
          "candidateSays": "એ મારું નામ નથી, તમે ખોટું બોલ્યાં",
          "candidateSaysLatin": "E maaru naam nathi, tame khotu bolyaa",
          "gloss": "That is not my name, you said it wrong",
          "failureCase": { "what": "Name mispronounced with no fallback. observed in pilot, Candidate C", "source": "Failure taxonomy, stage 2 item 3" },
          "next": "repair-name-1"
        },
        {
          "label": "(say nothing)",
          "candidateSays": "",
          "gloss": "(you say nothing)",
          "failureCase": { "what": "Dead air after the introduction. observed in pilot", "source": "Failure taxonomy, stage 3 item 1" },
          "next": "open-silence"
        },
        {
          "label": "He isn't here, I'm his wife",
          "candidateSays": "એ અત્યારે નથી, હું એમની પત્ની બોલું છું",
          "candidateSaysLatin": "E atyare nathi, hu emni patni bolu chhu",
          "gloss": "He is not here right now, I am his wife",
          "failureCase": { "what": "A household gatekeeper answers a shared phone", "source": "Failure taxonomy, stage 2 item 6" },
          "next": "open-gatekeeper"
        }
      ]
    },
    "open-whois": {
      "speaker": "stella",
      "guj": "હું સ્ટેલા બોલું છું, ઝાયડસ તરફથી. ઝાયડસ દવાની કંપની છે, અમદાવાદમાં. હું માણસ નથી, કમ્પ્યુટર છું. પ્લાન્ટની નોકરી વિશે ફોન છે. તમે ઝાયડસની વેબસાઇટ પરથી નંબર ચેક કરી શકો છો.",
      "translit": "Hu Stella bolu chhu, Zydus taraf-thi. Zydus dava-ni company chhe, Ahmedabad-ma. Hu maanas nathi, computer chhu. Plant-ni nokri vishe phone chhe. Tame Zydus-ni website par-thi number check kari shako chho.",
      "gloss": "I am Stella, from Zydus. Zydus is a medicine company, in Ahmedabad. I am not a person, I am a computer. This call is about the plant job. You can check the number on Zydus's own website.",
      "annotation": {
        "category": "trust",
        "rule": "Answer who-is-this flatly and dully: name, company, what the company does, machine status in plain words, why the call, and a check the candidate can run without us. No upside claim, no you have been selected, and crucially no reciting the candidate's own application back as proof.",
        "why": "The documented job-fraud script opens with an upside framing and then reads the applicant's own CV details back as its credibility move, so an employer must use neither. Dullness is the trust signal in a channel where two in three unknown-number calls are spam, and legitimacy is proved by pointing at the company's own public website, never by anything the caller already knows about the candidate and never by a number the caller supplies.",
        "source": "Delhi Police Cyber Cell job-fraud advisory, cited in dassh-gujarati-research.md section 6 point 3; Truecaller India 2025"
      },
      "subAgent": "intent: flags a who-is-this as a trust query, not a screening answer, so the script does not treat the turn as a refusal",
      "branches": [
        {
          "label": "Alright, go on",
          "candidateSays": "હા, બોલો",
          "candidateSaysLatin": "Ha, bolo",
          "gloss": "Alright, speak",
          "next": "open-why"
        },
        {
          "label": "How do I know this is real?",
          "candidateSays": "મને કેવી રીતે ખબર પડે કે આ સાચું છે?",
          "candidateSaysLatin": "Mane kevi rite khabar pade ke aa saachu chhe?",
          "gloss": "How am I to know this is genuine?",
          "next": "open-verify"
        }
      ]
    },
    "open-robot": {
      "speaker": "stella",
      "guj": "હા, સાચું. હું માણસ નથી, ઝાયડસનું કમ્પ્યુટર છું. તમારે માણસ સાથે વાત કરવી હોય તો અત્યારે જ જોડી આપીશ.",
      "translit": "Ha, saachu. Hu maanas nathi, Zydus-nu computer chhu. Tamare maanas saathe vaat karvi hoy to atyare j jodi apish.",
      "gloss": "Yes, that's right. I am not a person, I am Zydus's computer. If you want to speak to a person I will connect you right now.",
      "annotation": {
        "category": "trust",
        "rule": "When asked whether it is a machine, affirm at once, in ordinary words, with no joke, no hedge, no deflection, and attach the human option to the same breath. Confirm with હા, સાચું rather than a bare હા glued to a negation, and keep માણસ નથી, કમ્પ્યુટર છું as one clause pair.",
        "why": "This reactive commitment is the non-negotiable floor: never deny being an AI to someone who sincerely asks. Plain words are also the anti-scam choice, because a formal-sounding legal disclaimer is itself a fraud tell. Pairing the human option with the disclosure makes machine-ness read as an offer rather than as being fobbed off. A bare yes attached to a negative clause is also the construction that misparses over a bad connection.",
        "source": "dassh-disclosure-research.md section 5; dassh-gujarati-research.md lines 37 to 52"
      },
      "branches": [
        {
          "label": "Fine, carry on",
          "candidateSays": "વાંધો નહીં, બોલો",
          "candidateSaysLatin": "Vaandho nahi, bolo",
          "gloss": "No problem, go on",
          "next": "open-why"
        },
        {
          "label": "Put me on to a person",
          "candidateSays": "મારે માણસ સાથે જ વાત કરવી છે",
          "candidateSaysLatin": "Maare maanas saathe ja vaat karvi chhe",
          "gloss": "I want to speak to a person",
          "failureCase": { "what": "A handoff path that exists on paper but is theatre in practice", "source": "Failure taxonomy, stage 3 item 10" },
          "next": "open-human-now"
        }
      ]
    },
    "open-disclose": {
      "speaker": "stella",
      "guj": "હું સ્ટેલા બોલું છું. પહેલાં એક વાત કહી દઉં, હું માણસ નથી, કમ્પ્યુટર છું. તમારે માણસ સાથે વાત કરવી હોય તો હું જોડી આપીશ.",
      "translit": "Hu Stella bolu chhu. Pehla ek vaat kahi dau, hu maanas nathi, computer chhu. Tamare maanas saathe vaat karvi hoy to hu jodi apish.",
      "gloss": "I am Stella. Let me say one thing first: I am not a person, I am a computer. If you want to talk to a person I will connect you.",
      "annotation": {
        "category": "trust",
        "rule": "Disclose unprompted, in the second Stella turn, before a single question is asked, in ordinary spoken Gujarati and never in legal register. The human escape hatch is welded to the disclosure, not offered later.",
        "why": "No Indian law compels this today, which is precisely why it is a design invariant rather than a compliance box. Every serious framework converges on disclosure at the latest at first interaction, and the measured cost for an information-gathering call is around eleven percent, not the roughly eighty percent collapse seen in sales calls, while being caught having concealed it costs more than disclosing ever would.",
        "source": "dassh-disclosure-research.md sections 1, 4 and 5; Xu, Dai and Yan 2024; Schilke and Reimann 2025"
      },
      "branches": [
        {
          "label": "Okay",
          "candidateSays": "સારું",
          "candidateSaysLatin": "Saaru",
          "gloss": "Okay",
          "next": "open-why"
        },
        {
          "label": "A computer? Then why are you calling me?",
          "candidateSays": "કમ્પ્યુટર? તો પછી મને શેના માટે ફોન કરો છો?",
          "candidateSaysLatin": "Computer? To pachhi mane shena maate phone karo chho?",
          "gloss": "A computer? Then what are you calling me for?",
          "next": "open-why"
        },
        {
          "label": "Put me on to a person",
          "candidateSays": "મારે માણસ સાથે વાત કરવી છે",
          "candidateSaysLatin": "Maare maanas saathe vaat karvi chhe",
          "gloss": "I want to speak to a person",
          "next": "open-human-now"
        }
      ]
    },
    "open-why": {
      "speaker": "stella",
      "guj": "તમે ઝાયડસના અમદાવાદ plant માં operator ની જગ્યા માટે અરજી કરી હતી ને? એ અરજી વિશે થોડું પૂછવાનું છે.",
      "translit": "Tame Zydus-na Ahmedabad plant-ma operator ni jagya maate arji kari hati ne? E arji vishe thodu puchhvanu chhe.",
      "gloss": "You applied for the operator position at Zydus's Ahmedabad plant, didn't you? There are a few things to ask about that application.",
      "annotation": {
        "category": "register",
        "rule": "State the specific role and the specific plant, and keep the workplace nouns in the English they already are on a Gujarati shop floor. Never reach for formal Sanskritised Gujarati.",
        "why": "A model asked for Gujarati defaults to the tatsama register of news and government, which is exactly the authoritative voice a job scam performs. Everyday Gujarati holding English workplace nouns like operator and plant is how this candidate actually speaks, and naming a checkable specific gives the call something a fraud call cannot cheaply fake.",
        "source": "dassh-gujarati-research.md section 3, code-mixing rule and worked before and after"
      },
      "subAgent": "comprehension: the tag question ને invites a full-phrase reply rather than a bare yes, which is the worst possible acoustic condition for Gujarati ASR",
      "branches": [
        {
          "label": "Yes, I applied",
          "candidateSays": "હા, કરી હતી",
          "candidateSaysLatin": "Ha, kari hati",
          "gloss": "Yes, I did",
          "next": "open-permission"
        },
        {
          "label": "I don't remember applying",
          "candidateSays": "મને યાદ નથી કે મેં અરજી કરી હોય",
          "candidateSaysLatin": "Mane yaad nathi ke me arji kari hoy",
          "gloss": "I do not remember applying",
          "failureCase": { "what": "A stale or wrong record reaching someone who never applied", "source": "Failure taxonomy, stage 1 item 1" },
          "next": "open-verify"
        },
        {
          "label": "This isn't a fraud call, is it?",
          "candidateSays": "આ fraud call તો નથી ને?",
          "candidateSaysLatin": "Aa fraud call to nathi ne?",
          "gloss": "This isn't a fraud call, is it?",
          "failureCase": { "what": "Scam suspicion carried past the introduction", "source": "Failure taxonomy, stage 2 item 1" },
          "next": "open-verify"
        }
      ]
    },
    "open-verify": {
      "speaker": "stella",
      "guj": "તમે ઝાયડસની વેબસાઇટ પરથી ખાતરી કરી શકો છો, અથવા ત્યાં આપેલા નંબર પર ફોન કરી શકો છો. હું નંબર આપું એના પર ફોન કરવાની જરૂર નથી. અત્યારે ફોન મૂકી દેવો હોય તો પણ ચાલશે, ખાતરી કરીને પછી વાત કરીશું.",
      "translit": "Tame Zydus-ni website par-thi khatri kari shako chho, athva tya aapela number par phone kari shako chho. Hu number aapu ena par phone karvani jarur nathi. Atyare phone muki devo hoy to pan chalshe, khatri karine pachhi vaat karishu.",
      "gloss": "You can check on Zydus's website, or call the number listed there. There is no need to call a number I give you. If you want to put the phone down right now that is fine too, we can talk after you have checked.",
      "annotation": {
        "category": "trust",
        "rule": "Point verification at a channel the candidate reaches on their own, say plainly that they should not verify through any number the caller supplies, and name hanging up as an allowed, blameless option.",
        "why": "The police advisory's own prevention guidance is never to verify through the caller's contact details, and the scam script's trust move is reciting details it already holds. Making the verification path independent, and making walking away a named, blameless option, is the only version of this a genuinely suspicious candidate can act on.",
        "source": "Delhi Police Cyber Cell advisory via dassh-gujarati-research.md section 6"
      },
      "branches": [
        {
          "label": "Okay, ask your questions",
          "candidateSays": "ઠીક છે, પૂછો",
          "candidateSaysLatin": "Thik chhe, puchho",
          "gloss": "Alright, ask",
          "next": "open-permission"
        },
        {
          "label": "I'll check first and call back",
          "candidateSays": "હું પહેલાં જોઈ લઉં, પછી વાત કરીશું",
          "candidateSaysLatin": "Hu pahela joi lau, pachhi vaat karishu",
          "gloss": "Let me check first, we will talk after",
          "next": "open-callback-ask"
        }
      ]
    },
    "open-permission": {
      "speaker": "stella",
      "guj": "બે-ત્રણ મિનિટ લાગશે, વધારે નહીં. અત્યારે ફાવશે?",
      "translit": "Be-tran minute lagshe, vadhare nahi. Atyare favshe?",
      "gloss": "It will take two or three minutes, no more. Does now suit you?",
      "annotation": {
        "category": "register",
        "rule": "Ask permission in the future-tense question form, ફાવશે, never as an imperative, and put a bounded time estimate in front of it using લાગશે, not થશે.",
        "why": "Gujarati grammar ranks the future tense phrased as a question as the politest request form, above the honorific plural imperative and the future imperative. The permission ask is reactance reduction, not sales technique: this candidate already applied, so restoring their control over when the conversation happens is the point. In the pilot most candidates did not dismiss the call, they proposed their own time. The bound must be spoken in shop-floor register, and dropping એથી also costs fewer syllables on a noisy line.",
        "source": "dassh-gujarati-research.md verb-mood rule and the disclosure opener exemplar; dassh-call-craft-research.md Move 2, Brehm 1966; dassh-rewrite-brief.md section 5.3"
      },
      "subAgent": "distress: a clipped or hesitant yes here is scored as pressured consent, not agreement, and re-offers the callback rather than proceeding",
      "branches": [
        {
          "label": "Yes, go ahead",
          "candidateSays": "હા, ફાવશે",
          "candidateSaysLatin": "Ha, faavshe",
          "gloss": "Yes, that suits me",
          "next": "screen-frame-low-stakes"
        },
        {
          "label": "Not right now, I'm on the floor",
          "candidateSays": "અત્યારે નહીં, હું કામ પર છું",
          "candidateSaysLatin": "Atyare nahi, hu kaam par chhu",
          "gloss": "Not now, I am at work",
          "failureCase": { "what": "A stated timing preference captured as a note and never honoured", "source": "Failure taxonomy, stage 5 item 5" },
          "next": "open-callback-ask"
        },
        {
          "label": "I can't hear you, it's very noisy here",
          "candidateSays": "સંભળાતું નથી, અહીં બહુ અવાજ છે",
          "candidateSaysLatin": "Sambhlaatu nathi, ahi bahu avaaj chhe",
          "gloss": "I cannot hear, there is a lot of noise here",
          "failureCase": { "what": "Background noise as the default physical context, not an edge case", "source": "Failure taxonomy, stage 3 item 5" },
          "next": "repair-noise-1"
        },
        {
          "label": "How long did you say?",
          "candidateSays": "કેટલી વાર થશે કીધું?",
          "candidateSaysLatin": "Ketli vaar thashe kidhu?",
          "gloss": "How long did you say it would take?",
          "next": "open-permission"
        }
      ]
    },
    "open-callback-ask": {
      "speaker": "stella",
      "guj": "કંઈ વાંધો નહીં. તમે જ ટાઈમ કહો, સવારે કે સાંજે, અને કેટલા વાગ્યે? હું એ ટાઈમ ફરી બોલીશ, પછી એ જ ટાઈમે ફોન કરીશ.",
      "translit": "Kai vaandho nahi. Tame j time kaho, savare ke saanje, ane ketla vaagye? Hu e time fari bolish, pachhi e j time-e phone karish.",
      "gloss": "That is no problem at all. You tell me the time. Morning or evening, and at what hour? I will say the time back to you, and then I will call at exactly that time.",
      "annotation": {
        "category": "trust",
        "rule": "The candidate names the callback time, but the ask is bounded to a half of the day plus an hour, and the agent reads the time back before it is treated as a commitment. Never treat a not-now as a soft no to be talked past.",
        "why": "A self-proposed callback is an effortful, self-generated commitment, which reactance and commitment-consistency reasoning favour over an agent-picked slot. But a wide-open when suits you invites exactly the utterances Gujarati makes unrecoverable: clock words name the wrong integer, so poṇā sāt is 6:45 while containing the word for seven and doḍh is one and a half with no morpheme for one. The promise to say the time back is what converts a free-text preference into a scheduling constraint, which is the exact gap behind the after-the-call failure where stated timing preferences were logged but never evidently honoured.",
        "source": "dassh-gujarati-research.md section 4, numeral and clock opacity; dassh-failure-taxonomy.md Stage 5 item 5"
      },
      "branches": [
        {
          "label": "Call me at seven in the evening",
          "candidateSays": "સાંજે સાત વાગ્યે ફોન કરો",
          "candidateSaysLatin": "Saanje saat vaagye phone karo",
          "gloss": "Call at seven in the evening",
          "next": "open-callback-set"
        },
        {
          "label": "Don't call me again",
          "candidateSays": "હવે ફોન ના કરશો",
          "candidateSaysLatin": "Have phone na karsho",
          "gloss": "Do not call again",
          "failureCase": { "what": "Repeat dials to a candidate who has declined contact", "source": "Failure taxonomy, stage 1 item 2" },
          "next": "open-badtime-hardno"
        }
      ]
    },
    "open-callback-set": {
      "speaker": "stella",
      "guj": "નોંધી લીધું, {name}ભાઈ. સાંજે સાત વાગ્યે, પોણા સાત નહીં, આ જ નંબર પરથી ફોન આવશે. તમારા રેકોર્ડમાં લખાઈ ગયું છે કે તમે સમય આપ્યો છે. આભાર.",
      "translit": "Nondhi lidhu, {name}bhai. Saanje saat vaagye, poṇā saat nahi, aa j number par-thi phone aavshe. Tamaara record-ma lakhaai gayu chhe ke tame samay aapyo chhe. Aabhaar.",
      "gloss": "Noted it down, {name}bhai. At seven in the evening, not quarter to seven, the call will come from this same number. It is written in your record that you gave a time. Thank you.",
      "annotation": {
        "category": "trust",
        "rule": "Close a rescheduled call with a commitment the system can actually keep, and state the callback time contrastively: name the time, rule out its nearest Gujarati neighbour, name the number it will come from, and say the record reads scheduled by candidate rather than not interested.",
        "why": "The pilot's worst pattern was a vague promise of follow-up with nothing behind it, and the single most valuable complaint in the field study was a candidate saying the brand always calls and never follows up. A callback that is only a free-text note becomes that complaint. The contrastive form is not politeness: Gujarati clock words name the wrong integer, so poṇā sāt means 6:45 while containing the word for seven, and a single-pass time on a noisy line can miss by 45 minutes and manufacture the exact broken promise the close exists to prevent. Naming the number also pre-empts the next unknown-number screening.",
        "source": "dassh-failure-taxonomy.md Stage 4 items 1 and 2 and Stage 5 items 3 and 5; dassh-gujarati-research.md section 4"
      },
      "ending": "Success. The callback is written as a hard scheduling constraint on the next dial, held against the dedup lock so it cannot become a second unplanned call, and the record reads scheduled by candidate rather than declined. This is a completed opening, not an abandoned one."
    },
    "open-badtime-hardno": {
      "speaker": "stella",
      "guj": "સમજી ગઈ. હું ફરીથી ફોન નહીં કરું, અને તમારો નંબર લિસ્ટમાંથી કાઢી નાખું છું. તકલીફ આપી એ બદલ માફ કરશો.",
      "translit": "Samji gai. Hu farithi phone nahi karu, ane tamaro number list-ma-thi kaadhi naakhu chhu. Takleef aapi e badal maaf karsho.",
      "gloss": "Understood. I will not call again, and I am taking your number off the list. Sorry for the trouble.",
      "annotation": {
        "category": "trust",
        "rule": "Take a no in one turn. No second ask, no reason requested, and the removal is stated as already done rather than promised. Never route a do-not-call back into the permission ask.",
        "why": "Four of forty-three dials in the pilot were repeats and one candidate was dialled three times in a week, which is the fastest route to a spam label and the pattern that erodes brand trust into this company just calls and nothing follows. An opt-out that has to be repeated is not an opt-out, and re-asking after an explicit refusal is the imposed interaction the permission move exists to prevent.",
        "source": "dassh-failure-taxonomy.md Stage 1 items 2 and 6 and Stage 5 items 2 and 3; dassh-call-craft-research.md Move 2, Brehm 1966"
      },
      "ending": "Opt-out honoured. The number is suppressed for the campaign and the record is marked declined-contact, distinct from screen-failed."
    },
    "open-silence": {
      "speaker": "stella",
      "guj": "હેલો? તમને મારો અવાજ સંભળાય છે?",
      "translit": "Hello? Tamne maaro avaaj sambhaḷaay chhe?",
      "gloss": "Hello? Can you hear my voice?",
      "annotation": {
        "category": "repair",
        "rule": "Break silence with a short liveness check inside about one second, in the તમે register, never with a repeat of the whole introduction.",
        "why": "Human question-answer gaps cluster around 0 to 300 milliseconds across ten languages, while production voice stacks sit at 1.4 to 1.7 seconds, and a controlled 1.2 second delay already makes listeners rate the other party as less attentive and less friendly. This was the pilot's most severe finding: candidates who had done the hard part of answering heard nothing back and hung up.",
        "source": "Stivers et al. PNAS 2009; Schoenenberg et al. 2014; dassh-failure-taxonomy.md Stage 3 item 1, OBSERVED"
      },
      "subAgent": "escalation: two unanswered liveness prompts route the call to a human callback instead of a retry dial, and the disposition is written as system-side, not candidate-side",
      "branches": [
        {
          "label": "Yes, I'm here",
          "candidateSays": "હા, સાંભળું છું",
          "candidateSaysLatin": "Ha, saambhlu chhu",
          "gloss": "Yes, I am listening",
          "next": "open-disclose"
        },
        {
          "label": "Still nothing",
          "candidateSays": "",
          "gloss": "Silence again",
          "failureCase": { "what": "An interested candidate silently lost to a system failure and recorded as uninterested. observed, Candidate A", "source": "Failure taxonomy, stage 5 item 1" },
          "next": "repair-deadair-1"
        }
      ]
    },
    "open-gatekeeper": {
      "speaker": "stella",
      "guj": "ઠીક છે, વાંધો નહીં. હું ઝાયડસ તરફથી નોકરી બાબતે ફોન કરું છું, બીજું કંઈ હું ફોન પર નહીં કહું. બપોરે ફોન કરું કે સાંજે?",
      "translit": "Thik chhe, vaandho nahi. Hu Zydus taraf-thi nokri baabate phone karu chhu, biju kai hu phone par nahi kahu. Bapore phone karu ke saanje?",
      "gloss": "That is fine, no problem. I am calling from Zydus about a job, I will not say anything more on the phone. Should I call in the afternoon, or in the evening?",
      "annotation": {
        "category": "trust",
        "rule": "To a gatekeeper, give company and topic only, say plainly that nothing further will be said on the phone, and close by offering the callback as a choice between two named windows rather than an open when-is-he-free question.",
        "why": "Shared and borrowed phones are the default in this population, not an edge case, and nearly half of women in Gujarat do not have a phone they personally use, so whoever answered may not be the candidate. Refusing to disclose the application protects them, and stating the refusal out loud keeps it from reading as evasiveness on a call already fighting a scam prior. The two-window form exists for a second reason: an open time question invites a bare fraction-word answer that names the wrong integer and lands in the shortest, worst-recognised utterance class in Gujarati.",
        "source": "dassh-failure-taxonomy.md Stage 2 item 6; dassh-gujarati-research.md sections 4 and 6; NFHS-5 Gujarat"
      },
      "branches": [
        {
          "label": "Call in the evening",
          "candidateSays": "સાંજે ફોન કરજો",
          "candidateSaysLatin": "Saanje phone karjo",
          "gloss": "Call in the evening",
          "next": "open-callback-ask"
        },
        {
          "label": "Tell me, I will pass it on",
          "candidateSays": "મને કહો, હું કહી દઈશ",
          "candidateSaysLatin": "Mane kaho, hu kahi daish",
          "gloss": "Tell me, I will pass it on",
          "next": "open-gatekeeper"
        }
      ]
    },
    "open-human-now": {
      "speaker": "stella",
      "guj": "હા, ચોક્કસ. હું અત્યારે જ Zydus ની HR ટીમમાં માણસ સાથે જોડી આપું છું. એકાદ બે મિનિટ લાગશે, ત્યાં સુધી હું લાઈન પર જ છું.",
      "translit": "Ha, chokkas. Hu atyare j Zydus ni HR team-maa maanas saathe jodi aapu chhu. Ekaad be minute laagshe, tyaa sudhi hu line par j chhu.",
      "gloss": "Yes, of course. I am connecting you right now to a person in the Zydus HR team. It will take a minute or two, and until then I am still on the line.",
      "annotation": {
        "category": "repair",
        "rule": "A request for a human is honoured on the same turn, naming who the candidate is being handed to and how long the wait actually is, and the agent stays audible until the handoff completes. Never a hedge about the wait, never an unnamed party, never a callback promised in place of a transfer.",
        "why": "The human option is offered in the same breath as the disclosure, which makes it a commitment rather than a courtesy. The framework's own named risk is that this path is theatre, promised but never reachable, so the honest version names the destination and states the wait rather than papering over it. Naming the destination also does independent work against a scam base rate where every unnamed party deepens the candidate's fraud prior.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 10; dassh-disclosure-research.md section 5; dassh-gujarati-research.md finding 6"
      },
      "ending": "Hands off to the human escalation path with the candidate's context attached. Whether this seam actually picks up is the design's own open question, and the demo says so rather than performing a transfer."
    },
    "screen-frame-low-stakes": {
      "speaker": "stella",
      "guj": "હવે ચાર-પાંચ સવાલ પૂછીશ, બસ એ જોવા કે તમને આ કામ ફાવશે કે નહીં. આ કોઈ પરીક્ષા નથી, પાસ-નાપાસ જેવું કંઈ નથી. વચ્ચે તમારે કંઈ પૂછવું હોય તો પૂછી શકો છો.",
      "translit": "Have chaar-paanch savaal puchhish, bas e jova ke tamne aa kaam faavshe ke nahi. Aa koi pariksha nathi, paas-naapaas jevu kai nathi. Vachche tamare kai puchhvu hoy to puchhi shako chho.",
      "gloss": "I will ask four or five questions now, just to see whether this work will suit you or not. This is not an exam, there is no pass or fail. If you want to ask me something in between, you can.",
      "annotation": {
        "category": "trust",
        "rule": "Open the screening block by naming the stakes as low and the length as finite, in shop-floor words only: recruiter-side abstractions like fitment never survive into the spoken Gujarati.",
        "why": "The taxonomy lists candidate distress as an expected mid-call condition driven by power asymmetry: an unexplained automated call reads as an interrogation, and the documented response is freezing, guarded one-word answers, or hanging up. One-word answers are also the worst acoustic case for Gujarati ASR, so fear and recognition failure compound each other. Saying this is not an interview would also be a small untruth a candidate could later resent, where this is not an exam is true and carries the same reassurance.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 9; dassh-gujarati-research.md finding 4 and section 3 code-mix rule"
      },
      "next": "screen-q-experience"
    },
    "screen-q-experience": {
      "speaker": "stella",
      "guj": "તમે આ કામ કેટલા વરસથી કરો છો, અને છેલ્લે કઈ કંપનીમાં હતા?",
      "translit": "Tame aa kaam ketla varas-thi karo chho, ane chhelle kai kampani-maa hata?",
      "gloss": "How many years have you been doing this work, and which company were you at last?",
      "annotation": {
        "category": "register",
        "rule": "Ask two-part questions whose natural answer is a full phrase, never a question whose ideal answer is one word.",
        "why": "Word error rate roughly doubles between utterances over five seconds and under two seconds, and a bare number is the shortest possible answer. Pairing years with company forces redundant context into the same breath, so the number has neighbours the recogniser can lean on. Both facts here are load-bearing, so the tenure number gets a contrastive read-back next and the employer name is treated as the entity class Indic ASR drops hardest.",
        "source": "dassh-gujarati-research.md finding 4, Voice of India benchmark; dassh-failure-taxonomy.md Stage 3 item 3"
      },
      "branches": [
        {
          "label": "Nine years, at a plant near Vatva",
          "candidateSays": "નવ વરસથી કરું છું, છેલ્લે વટવા બાજુના પ્લાન્ટમાં હતો",
          "candidateSaysLatin": "Nav varas-thi karu chhu, chhelle Vatva baajuna plant-maa hato",
          "gloss": "I have been doing it for nine years, last I was at a plant near Vatva",
          "next": "screen-readback-experience"
        },
        {
          "label": "Nine years, pharma plant in Vatva (in English)",
          "candidateSays": "Nine years experience, last company was a pharma plant in Vatva",
          "gloss": "Nine years experience, last company was a pharma plant in Vatva",
          "next": "screen-mirror-english"
        },
        {
          "label": "Years",
          "candidateSays": "...વરસ",
          "candidateSaysLatin": "...varas",
          "gloss": "Years",
          "failureCase": { "what": "Comes through clipped. Candidate answer misrecognised; Gujarati numerals share a base across decades", "source": "Failure taxonomy, stage 3 item 3" },
          "next": "repair-misrec-1"
        },
        {
          "label": "What did you say? There is noise here",
          "candidateSays": "શું કીધું? અહીં બહુ અવાજ છે",
          "candidateSaysLatin": "Shu kidhu? Ahi bahu avaaj chhe",
          "gloss": "What did you say? There is a lot of noise here",
          "failureCase": { "what": "Background noise overwhelms the microphone", "source": "Failure taxonomy, stage 3 item 5" },
          "next": "repair-noise-1"
        },
        {
          "label": "I am working, but I need a job right now",
          "candidateSays": "કામ તો ચાલુ છે, પણ મારે અત્યારે નવી નોકરી બહુ જરૂરી છે. ત્રણ મહિનાથી કામ નથી.",
          "candidateSaysLatin": "Kaam to chaalu chhe, pan maare atyare navi nokri bahu jaruri chhe. Tran mahina-thi kaam nathi.",
          "gloss": "I am working, but I really need a new job right now. I have had no work for three months.",
          "failureCase": { "what": "The hero case: volunteered intent steamrolled by a script whose mandate was to confirm fields", "source": "" },
          "next": "listen-volunteer"
        }
      ]
    },
    "screen-readback-experience": {
      "speaker": "stella",
      "guj": "નવ વરસનો અનુભવ, nine years. ઓગણીસ નહીં, નવ. બરાબર?",
      "translit": "Nav varasno anubhav, nine years. Ogaṇis nahi, nav. Barabar?",
      "gloss": "Nine years of experience, nine years. Not nineteen, nine. Correct?",
      "annotation": {
        "category": "numbers",
        "rule": "Confirm one consequential number per turn: state it in Gujarati, restate it in the alternate form as an English figure, then rule out the neighbouring value the recogniser could have substituted. Never bundle a number and a place name under one confirmation.",
        "why": "Short utterances are the worst acoustic case, with word error roughly doubling under two seconds, and a bare experience figure is the shortest possible answer, so nine and nineteen are a live substitution pair on a noisy line. Restating in English carries redundant context that survives a clipped syllable. Nineteen is separately fragile because ઓગણીસ is built as ogan plus વીસ, so a clipped word-initial syllable collapses it toward twenty. Splitting the plant location into its own turn keeps a no diagnosable: bundled slots make a correction land on nothing.",
        "source": "dassh-gujarati-research.md sections 1.4, 1.5 and 4; UPenn Gujarati numerals table"
      },
      "subAgent": "comprehension: logs that the candidate answered in Gujarati with a full phrase, so the call stays Gujarati-framed for the remaining turns",
      "next": "screen-q-work"
    },
    "screen-mirror-english": {
      "speaker": "stella",
      "guj": "Nine years, બરાબર? એટલે નવ, ઓગણીસ નહીં. અને છેલ્લી કંપની ક્યાં હતી, એ ફરી કહેશો?",
      "translit": "Nine years, barabar? Etle nav, ogaṇees nahi. Ane chhelli company kyaan hati, e phari kahesho?",
      "gloss": "Nine years, right? That is nine, not nineteen. And where was the last company, will you say it once more?",
      "annotation": {
        "category": "register",
        "rule": "Confirm the number contrastively by naming the neighbour being ruled out, and never let a consequential entity be confirmed by a bare yes. Ask the candidate to restate the place name instead of offering it back for a tag-question nod. Keep the Gujarati frame with the candidate's own English nouns: nudge, then mirror, never correct.",
        "why": "Code-mix preference is predicted by the candidate's own proficiency, which is unknowable before the call, and a controlled bilingual study found nudge-then-mirror acceptable to all users where always-mix and never-mix were not. Correcting a candidate's own wording is the humiliation risk in miniature. Separately, proper nouns are where Indic ASR fails hardest and where code-mix systems confuse language choice, so a yes-or-no tag on a plant locality confirms only that the candidate heard Stella, not that Stella heard the candidate.",
        "source": "dassh-gujarati-research.md sections 1.3, 1.5, 3 and 4; LAHAJA arXiv 2408.11440; code-mix ASR arXiv 2403.08011; Bawa and Khadpe et al. CSCW 2020"
      },
      "subAgent": "comprehension: the candidate's first substantive reply was English-dominant, so the mix for the rest of the call shifts English-forward while the polite frame stays Gujarati",
      "next": "screen-q-work"
    },
    "screen-q-work": {
      "speaker": "stella",
      "guj": "તમે ત્યાં રોજ કયું કામ કરતા હતા, જરા કહેશો?",
      "translit": "Tame tyaa roj kayu kaam karta hata, jara kahesho?",
      "gloss": "What work did you do there every day, would you tell me?",
      "annotation": {
        "category": "register",
        "rule": "Ask what they did, not whether they qualify, and ask one thing per turn. Keep shop-floor nouns in the English they already are, keep the request in future-tense question form, and ask about the machine as a separate follow-up once the task answer lands.",
        "why": "A yes or no fitment question invites a bare yes, the weakest acoustic case, and it is also the answer a candidate who needs the job will give regardless of truth. Asking for the daily task produces a describable phrase instead. Stacking a second interrogative into the same breath gets half answered on a noisy shared handset and forces a re-ask that reads as not listening. Upgrading packing or granulation into tatsama Gujarati would push the line into the government register that job scams borrow.",
        "source": "dassh-gujarati-research.md section 1 point 4 and section 3"
      },
      "branches": [
        {
          "label": "Describe packing and granulation work",
          "candidateSays": "packing section માં હતો, અને granulation માં પણ મદદ કરતો",
          "candidateSaysLatin": "Packing section-maa hato, ane granulation-maa pan madad karto",
          "gloss": "I was in the packing section, and I also helped in granulation",
          "next": "screen-q-location"
        },
        {
          "label": "First tell me what the work is",
          "candidateSays": "તમારે ત્યાં કયું કામ છે એ પહેલાં કહેશો?",
          "candidateSaysLatin": "Tamaare tyaa kayu kaam chhe e pahela kahesho?",
          "gloss": "Will you first tell me what the work is at your end?",
          "failureCase": { "what": "Candidate asks a question the script has no slot for", "source": "Failure taxonomy, stage 3 item 8" },
          "next": "screen-answer-role-question"
        }
      ]
    },
    "screen-answer-role-question": {
      "speaker": "stella",
      "guj": "હા, કહું છું. સાણંદ પ્લાન્ટમાં packing operator ની જગ્યા છે. Shift બાર કલાકની છે, બે નહીં, બાર. પગારની વાત અમારા recruiter રાકેશભાઈ તમારી સાથે કરશે. હવે હું તમને એક વાત પૂછું?",
      "translit": "Ha, kahu chhu. Sanand plant-maa packing operator ni jagya chhe. Shift baar kalaak ni chhe, be nahi, baar. Pagaar ni vaat amaara recruiter Rakeshbhai tamaari saathe karshe. Have hu tamne ek vaat puchhu?",
      "gloss": "Yes, I will tell you. There is a packing operator opening at the Sanand plant. The shift is twelve hours, not two, twelve. our recruiter Rakeshbhai will talk with you about the pay. May I ask you one thing now?",
      "annotation": {
        "category": "trust",
        "rule": "Answer the candidate's own question with a true, bounded answer, read the one consequential number back contrastively against its confusable neighbour, and hand what the agent does not hold to a human named out loud, never to an anonymous someone.",
        "why": "The pilot's single most valuable qualitative finding was a candidate complaining that the brand always calls and asks if you want a change but never follows with real opportunities. An agent built only for one-directional slot filling reproduces exactly that complaint. Twelve against two and four is precisely the clipped-first-syllable confusion the numerals research describes, and shift length is load-bearing for whether the candidate takes the job.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 8 and Stage 5 item 3; dassh-gujarati-research.md section 4"
      },
      "next": "screen-q-location"
    },
    "screen-q-location": {
      "speaker": "stella",
      "guj": "તમે અત્યારે કયા વિસ્તારમાં રહો છો?",
      "translit": "Tame atyare kayaa vistaar-maa raho chho?",
      "gloss": "Which area do you live in at present?",
      "annotation": {
        "category": "register",
        "rule": "One load-bearing fact per turn, and phrase it so the natural answer is a full phrase rather than a single word. Location is asked alone; the transport question follows in its own turn, mirroring back the area the candidate named.",
        "why": "Bundling two asks into one turn on a noisy shared handset makes the second one get dropped, and transport is the real blocker, so losing it costs both sides. Asking for the vistaar rather than a bare place name also lengthens the reply, which matters because Gujarati word error rate roughly doubles on utterances under two seconds. The follow-up is where the future-question form does real work, because asking someone to travel is a request.",
        "source": "dassh-gujarati-research.md section 1 insight 4 and section 2; dassh-failure-taxonomy.md Stage 3 item 3"
      },
      "branches": [
        {
          "label": "Naroda, and the distance worries you",
          "candidateSays": "નરોડામાં રહું છું. બહુ દૂર પડે, કંપનીની બસ છે કે નહીં?",
          "candidateSaysLatin": "Naroda-maa rahu chhu. Bahu dur pade, kampani-ni bus chhe ke nahi?",
          "gloss": "I live in Naroda. That is quite far, is there a company bus or not?",
          "failureCase": { "what": "Candidate asks something the agent does not hold the answer to", "source": "Failure taxonomy, stage 3 item 8" },
          "next": "screen-travel-honest"
        },
        {
          "label": "Naroda, but you would shift closer",
          "candidateSays": "અત્યારે નરોડામાં છું, પણ કામ મળે તો સાણંદ બાજુ રહેવા આવી જાઉં",
          "candidateSaysLatin": "Atyare Naroda-maa chhu, pan kaam male to Sanand baaju raheva aavi jaau",
          "gloss": "Right now I am in Naroda, but if I get the work I will come and stay near Sanand",
          "next": "screen-q-shift"
        }
      ]
    },
    "screen-travel-honest": {
      "speaker": "stella",
      "guj": "કંપનીની બસ છે કે નહીં, એની ચોક્કસ માહિતી મારી પાસે નથી, એટલે હું ખોટું નહીં કહું. તમારો આ સવાલ હું લખી લઉં છું. HR માંથી માણસ આ જ નંબર પર ફોન કરીને જવાબ આપશે.",
      "translit": "Kampani ni bus chhe ke nahi, eni chokkas maahiti maari paase nathi, etle hu khotu nahi kahu. Tamaro aa saval hu lakhi lau chhu. HR maa-thi maanas aa ja number par phone karine javaab aapshe.",
      "gloss": "I do not have exact information on whether there is a company bus, so I will not say anything false. I am writing your question down. A person from HR will call you on this same number and answer it.",
      "annotation": {
        "category": "trust",
        "rule": "Say plainly that the information is not held, log the question, and attach the follow-up to a named owner and a named channel, never a generic promise that someone will be in touch.",
        "why": "A vague promise of follow-up with no mechanism behind it is the documented close failure that erodes brand trust into this company never follows through. An honest I do not have that, attached to a real captured item with an owner, is the only version of this line that is not theatre.",
        "source": "dassh-failure-taxonomy.md Stage 4 item 1 and Stage 3 item 8"
      },
      "subAgent": "escalation: an unanswerable candidate question is captured as an open item on the record, not dropped, so the callback has something specific to answer",
      "next": "screen-q-shift"
    },
    "screen-q-shift": {
      "speaker": "stella",
      "guj": "Shift સવારે આઠ વાગ્યા થી સાંજે આઠ વાગ્યા સુધી, બાર કલાક. અઠવાડિયામાં છ દિવસ. તમને દિવસની shift ફાવશે કે રાતની shift ફાવશે?",
      "translit": "Shift savare aath vagya thi saanje aath vagya sudhi, baar kalaak. Athvaadiyaa maan chha divas. Tamne divas ni shift favshe ke raat ni shift favshe?",
      "gloss": "The shift runs from eight in the morning to eight in the evening, twelve hours. Six days in the week. Would a day shift suit you, or would a night shift suit you?",
      "annotation": {
        "category": "numbers",
        "rule": "State both endpoints of a time span as whole clock hours with વાગ્યા, never elicit a spoken clock time from the candidate, and offer the alternatives as two fully named options so the natural answer is a phrase rather than a bare yes.",
        "why": "Gujarati clock and duration words name the wrong integer outright. પોણા સાત means six forty five while containing the word for seven, and દોઢ means one and a half with no morpheme for one in it, so any naive integer extraction over a spoken time is wrong by fifteen minutes to a full hour. The agent supplies the numbers and the candidate only chooses. Naming both alternatives stops the reply collapsing into a bare હા, which is the weakest acoustic case on the line.",
        "source": "dassh-gujarati-research.md section 4, clock and duration forms, and section 1 point 4"
      },
      "branches": [
        {
          "label": "The day shift works, not nights",
          "candidateSays": "દિવસની ફાવશે, રાતની નહીં ફાવે",
          "candidateSaysLatin": "Divas-ni faavshe, raat-ni nahi faave",
          "gloss": "The day one will suit me, the night one will not",
          "next": "screen-q-notice"
        },
        {
          "label": "Nights are fine, the pay is better",
          "candidateSays": "રાતની પણ ફાવશે, પગાર સારો મળે તો",
          "candidateSaysLatin": "Raat-ni pan faavshe, pagaar saaro male to",
          "gloss": "The night one will suit me too, if the pay is good",
          "next": "screen-q-notice"
        }
      ]
    },
    "screen-q-notice": {
      "speaker": "stella",
      "guj": "જો બધું બરાબર બેસે, તો તમે નવું કામ ક્યારથી ચાલુ કરી શકો? અને અત્યારે જ્યાં કામ કરો છો ત્યાં કેટલા દિવસ પહેલાં કહેવું પડે?",
      "translit": "Jo badhu barabar bese, to tame navu kaam kyaar-thi chaalu kari shako? Ane atyaare jyaan kaam karo chho tyaan ketla divas pahelaa kahevu pade?",
      "gloss": "If everything works out, from when could you start the new work? And where you work now, how many days in advance do you have to tell them?",
      "annotation": {
        "category": "register",
        "rule": "Ask availability in plain shop-floor words and never the English HR term notice period. Use everyday verbs like કામ ચાલુ કરવું, not the letterhead verb જોડાવું, and name the current employer as where you work now rather than an abstract place.",
        "why": "Notice period is a salaried office concept and may not compute at all for a contractor-hired shop-floor worker. Asking in a term the candidate does not use produces either a guess or a confession of ignorance, and both are worse data than the date the plain question returns. Because the second answer comes back as a bare day count that sits in the ogan- family, the next turn must read it back contrastively.",
        "source": "dassh-gujarati-research.md section 3 closing note on role tier, and section 4"
      },
      "branches": [
        {
          "label": "Twenty nine days, you have to finish the month",
          "candidateSays": "ઓગણત્રીસ દિવસ જેવું થાય, મહિનો પૂરો કરવો પડે",
          "candidateSaysLatin": "Oganatris divas jevu thaay, mahino puro karvo pade",
          "gloss": "It comes to about twenty nine days, I have to finish the month",
          "failureCase": { "what": "The ogan family: twenty nine is built on the word for thirty", "source": "" },
          "next": "screen-readback-notice"
        },
        {
          "label": "Nothing like that, you work under a contractor",
          "candidateSays": "એવું કંઈ નથી, ઠેકેદાર પાસે કામ કરું છું, કાલથી પણ આવી જાઉં",
          "candidateSaysLatin": "Evu kai nathi, thekedaar paase kaam karu chhu, kaal-thi pan aavi jaau",
          "gloss": "There is nothing like that, I work under a contractor, I can come from tomorrow",
          "failureCase": { "what": "An HR concept that does not apply at this role tier", "source": "" },
          "next": "screen-notice-not-applicable"
        }
      ]
    },
    "screen-readback-notice": {
      "speaker": "stella",
      "guj": "ઓગણત્રીસ દિવસ, એટલે ઓગણત્રીસ, ત્રીસ નહીં. Twenty nine days. બરાબર?",
      "translit": "Oganatris divas, etle oganatris, tris nahi. Twenty nine days. Barabar?",
      "gloss": "Twenty nine days, that is twenty nine, not thirty. Twenty nine days. Is that correct?",
      "annotation": {
        "category": "numbers",
        "rule": "On the ogan- numerals, nineteen, twenty nine, thirty nine and up, speak the ruled-out neighbouring decade out loud, then restate the same value in the alternate form as English digits, never a rounded or approximate form.",
        "why": "Twenty nine is ઓગણત્રીસ, built as one less than thirty on the word for thirty, so a clipped first syllable, exactly what aggressive endpointing clips, turns a twenty nine day notice into thirty. Naming the rejected neighbour forces the error into the open. The English restatement gives a second, structurally unrelated encoding of the identical value, so a mishearing has to survive both. An approximation like about one month would do the opposite: it re-admits thirty, the very value just excluded.",
        "source": "dassh-gujarati-research.md section 1 finding 5 and section 4"
      },
      "subAgent": "comprehension: the read-back result is stored with a verified flag, and any span the read-back did not cover stays marked unverified on the record",
      "next": "screen-q-pay"
    },
    "screen-notice-not-applicable": {
      "speaker": "stella",
      "guj": "સારું. તો હું એવું લખું છું કે તમે તરત જોડાઈ શકો છો, કોઈ notice period નથી. બરાબર?",
      "translit": "Saaru. To hu evu lakhu chhu ke tame tarat jodaai shako chho, koi notice period nathi. Barabar?",
      "gloss": "Alright. So I am writing this down: that you can join immediately, there is no notice period. Is that right?",
      "annotation": {
        "category": "trust",
        "rule": "Read back the interpretation, not just the words, whenever the candidate's answer sets a consequential field. State the value being written in the borrowed English term the shop floor already uses, and close with બરાબર?",
        "why": "Grounding has to cover what the system decided, not only what it heard. Immediately available with no notice period is an inference the agent drew from the candidate's phrasing, and a wrong value reaching a recruiter's screen costs the candidate the role while confirming costs ten seconds. Saying notice period in full rather than a clipped notice keeps the term unambiguous on a noisy line and lets a contract worker for whom the concept does not apply say so.",
        "source": "dassh-gujarati-research.md confirmation architecture and code-mix rule; dassh-failure-taxonomy.md Stage 4 item 3"
      },
      "next": "screen-q-pay"
    },
    "screen-q-pay": {
      "speaker": "stella",
      "guj": "અત્યારે તમને મહિને હાથમાં કેટલો પગાર આવે છે? હજારમાં કહી શકશો?",
      "translit": "Atyare tamne mahine haath-maa ketlo pagaar aave chhe? Hajaar-maa kahi shakasho?",
      "gloss": "How much salary comes into your hand per month at present? Could you say it in thousands?",
      "annotation": {
        "category": "numbers",
        "rule": "One number per question, and the agent supplies the unit twice: the period, per month and in hand, and the magnitude, in thousands. Ask as a future-tense polite question, never a bare imperative. Expected salary is a separate turn with its own unit.",
        "why": "A bare fifteen is genuinely ambiguous between fifteen thousand a month and fifteen lakh a year, an eight times error that no confidence score flags because both readings are equally plausible audio at different role tiers. Indian blue-collar pay is denominated per day or per month while lakhs per annum is an office convention, so the agent must carry the unit rather than make the candidate supply it. Two salary figures in one turn defeats all of this, since the reply cannot be attributed to either slot.",
        "source": "dassh-gujarati-research.md section 4, salary unit ambiguity and the state-restate-confirm fix"
      },
      "branches": [
        {
          "label": "Nineteen thousand",
          "candidateSays": "ઓગણીસ હજાર જેવું આવે છે",
          "candidateSaysLatin": "Oganis hajaar jevu aave chhe",
          "gloss": "It comes to about nineteen thousand",
          "failureCase": { "what": "Salary is ambiguous by unit as well as by decade base", "source": "" },
          "next": "screen-readback-pay"
        },
        {
          "label": "Just say fifteen, with no unit",
          "candidateSays": "પંદર",
          "candidateSaysLatin": "Pandar",
          "gloss": "Fifteen",
          "failureCase": { "what": "A bare pandar is genuinely ambiguous between fifteen thousand a month and fifteen lakh a year", "source": "" },
          "next": "screen-pay-unit"
        }
      ]
    },
    "screen-pay-unit": {
      "speaker": "stella",
      "guj": "પંદર હજાર, મહિને, હાથમાં. Fifteen thousand. પંદર, સોળ નહીં. બરાબર?",
      "translit": "Pandar hajaar, mahine, haath-maa. Fifteen thousand. Pandar, sol nahi. Barabar?",
      "gloss": "Fifteen thousand, per month, in hand. Fifteen thousand. Fifteen, not sixteen. Correct?",
      "annotation": {
        "category": "numbers",
        "rule": "When a candidate gives a bare number, do not ask them to repeat it. Restate it with the unit attached, repeat it once in the alternate English form, then confirm contrastively by naming the neighbouring value being ruled out.",
        "why": "A bare number is the shortest and worst acoustic case, and Gujarati numerals share bases across neighbouring values, so a single clipped syllable can change the figure without lowering any confidence score. Restating with the unit resolves the fifteen thousand per month versus fifteen lakh per annum ambiguity that no confidence score will ever flag. Naming the ruled-out neighbour turns the candidate's next turn into a correction opportunity rather than a bare yes, and it spares a candidate who does not know the convention from feeling caught out.",
        "source": "dassh-gujarati-research.md section 4, findings 4 and 5, and the confirmation-architecture paragraph"
      },
      "next": "close-promise"
    },
    "screen-readback-pay": {
      "speaker": "stella",
      "guj": "એક વાર પાકું કરી લઉં. ઓગણીસ હજાર, એટલે ઓગણીસ, વીસ નહીં. મહિને, હાથમાં મળે એ. બરાબર ને?",
      "translit": "Ek vaar paakku kari lau. Ognees hajaar, etle ognees, vees nahi. Mahine, haath-maa male e. Barabar ne?",
      "gloss": "Let me just make this firm. Nineteen thousand, that is nineteen, not twenty. Per month, what you get in hand. Right?",
      "annotation": {
        "category": "numbers",
        "rule": "Salary gets an explicit contrastive read-back that names the ruled-out neighbour, even when nothing has gone wrong in the call.",
        "why": "The default is one compact summary at the end, which users prefer when no error has occurred. Salary is the exception, because nineteen thousand and twenty thousand share a base, the audio is short, and the harm of a wrong figure reaching a recruiter's screen is asymmetric to the ten seconds confirming it costs. Notice period and date of joining sit in the same explicitly-confirmed class.",
        "source": "dassh-gujarati-research.md section 4, confirmation architecture; Sagawa, Mitamura and Nyberg, Interspeech 2004"
      },
      "branches": [
        {
          "label": "Yes, nineteen only",
          "candidateSays": "હા, ઓગણીસ જ, મહિને",
          "candidateSaysLatin": "Ha, oganis ja, mahine",
          "gloss": "Yes, nineteen only, per month",
          "next": "close-promise"
        },
        {
          "label": "No, twenty thousand, not nineteen",
          "candidateSays": "ના ના, વીસ હજાર, ઓગણીસ નહીં",
          "candidateSaysLatin": "Na na, vis hajaar, oganis nahi",
          "gloss": "No no, twenty thousand, not nineteen",
          "failureCase": { "what": "Misrecognition caught only because the read-back happened", "source": "Failure taxonomy, stage 3 item 3" },
          "next": "screen-correction-accepted"
        }
      ]
    },
    "screen-correction-accepted": {
      "speaker": "stella",
      "guj": "માફ કરશો, મારી ભૂલ. વીસ હજાર મહિને. એટલે વીસ, ઓગણીસ નહીં. બરાબર છે ને? હવે બાકીની દરેક વિગત હું એક-એક કરીને તમને વાંચી સંભળાવીશ.",
      "translit": "Maaf karsho, maari bhool. Vees hajaar mahine. Etle vees, ogannees nahi. Barabar chhe ne? Have baaki ni dar ek vigat hu ek-ek karine tamne vaanchi sambhlaavish.",
      "gloss": "Sorry, my mistake. Twenty thousand a month. That is twenty, not nineteen. Is that right? Now I will read out each remaining detail to you one by one.",
      "annotation": {
        "category": "repair",
        "rule": "Take the error as the system's own, read the corrected number back contrastively against the neighbour it could be confused with, and only then announce the switch to confirming every remaining field.",
        "why": "Gujarati's ogan- numerals build nineteen on the same base as twenty, so a clipped syllable flips the value with no partial-comprehension fallback, which is why the correction turn is the highest-risk number in the call and cannot be the one number accepted on a single pass. Separately, explicit per-slot confirmation is rated worse than a single final summary while nothing has gone wrong and better once an error has occurred, and the research sets an aggressive threshold: one correction flips the whole remaining call into confirm-every-slot mode. Saying so out loud makes the extra confirmations read as care rather than as doubt about the candidate.",
        "source": "dassh-gujarati-research.md section 4, lines 19, 93 and 113; Sagawa, Mitamura and Nyberg, Interspeech 2004"
      },
      "subAgent": "comprehension: one correction flips the whole remaining call into confirm-every-slot mode, and every earlier field is re-flagged for the closing read-back",
      "next": "close-promise"
    },
    "repair-deadair-1": {
      "speaker": "stella",
      "guj": "માફ કરશો, મારી સિસ્ટમ થોડી ધીમી છે. હું અહીં જ છું, લાઇન ચાલુ છે.",
      "translit": "Maaf karsho, maari system thodi dhimi chhe. Hu ahiya ja chhu, line chaalu chhe.",
      "gloss": "Sorry, my system is a little slow. I am right here, the line is live.",
      "annotation": {
        "category": "repair",
        "rule": "Rung one of dead air: recover out loud, inside one second of the gap opening. Name the delay as the system's, in one plain clause, then say the line is live.",
        "why": "Production voice-AI latency runs 1.4 to 1.7 seconds against a human turn-taking gap of roughly 0 to 300 milliseconds, and a controlled 1.2 second delay already makes listeners rate the other party as less attentive and less friendly. Silence on a phone line is read as a dropped call, which is why comfort noise exists as a telephony standard at all. Saying it out loud does what an ambient bed cannot: it tells the candidate whose fault the pause is.",
        "source": "dassh-call-craft-research.md Move 1, Stivers et al. 2009, Schoenenberg et al. 2014, RFC 3389; dassh-failure-taxonomy.md Stage 3 item 1, OBSERVED"
      },
      "branches": [
        {
          "label": "(say nothing, wait)",
          "candidateSays": "",
          "gloss": "(you say nothing and wait)",
          "next": "repair-deadair-2"
        },
        {
          "label": "Hello? Can you hear me?",
          "candidateSays": "હેલો? સંભળાય છે?",
          "candidateSaysLatin": "Hello? Sambhlaay chhe?",
          "gloss": "Hello? Can you hear me?",
          "next": "repair-deadair-2"
        },
        {
          "label": "Fine, go on",
          "candidateSays": "હા હા, બોલો",
          "candidateSaysLatin": "Ha ha, bolo",
          "gloss": "Yes yes, go ahead",
          "next": "screen-q-experience"
        }
      ]
    },
    "repair-deadair-2": {
      "speaker": "stella",
      "guj": "માફ કરજો, લાઈન પાછી અટકી ગઈ. તમે જે કીધું એ બધું મારી પાસે આવી ગયું છે, કંઈ ગયું નથી. આગળ વધીએ?",
      "translit": "Maaf karjo, line paachhi atki gai. Tame je kidhu e badhu mari paase aavi gayu chhe, kai gayu nathi. Aagal vadhie?",
      "gloss": "Sorry, the line stopped again. Everything you said has reached me, nothing is gone. Shall we carry on?",
      "annotation": {
        "category": "repair",
        "rule": "Rung two escalates from liveness to reassurance: name the fault plainly, state that the candidate's answers survived it, then ask permission before continuing. Apologise with the ordinary spoken formula, never with self-blame language, and never repeat rung one.",
        "why": "The pilot's worst outcome was an interested candidate lost to dead air with no screening data captured and nothing downstream marking it as a system failure rather than disinterest. The fear the candidate is actually managing at the second fault is not the pause, it is that their effort was wasted. Asking permission to continue rather than announcing it restores the autonomy an unscheduled automated call takes away.",
        "source": "dassh-failure-taxonomy.md Stage 5 item 1, OBSERVED, Candidate A; dassh-call-craft-research.md Move 2, Brehm 1966"
      },
      "subAgent": "distress: flagged a second consecutive silence on a call where the candidate has already had to prompt the agent once",
      "branches": [
        {
          "label": "Yes, carry on",
          "candidateSays": "હા, બોલો",
          "candidateSaysLatin": "Ha, bolo",
          "gloss": "Yes, go ahead",
          "next": "screen-q-experience"
        },
        {
          "label": "It is cutting out again",
          "candidateSays": "ફરી કપાઈ ગયું, કંઈ સંભળાતું નથી",
          "candidateSaysLatin": "Fari kapaai gayu, kai sambhlaatu nathi",
          "gloss": "It cut out again, I cannot hear anything",
          "next": "repair-deadair-3"
        },
        {
          "label": "Is this even a real call? Are you a person?",
          "candidateSays": "આ સાચો ફોન છે કે નહીં? તમે માણસ છો?",
          "candidateSaysLatin": "Aa saacho phone chhe ke nahi? Tame maanas chho?",
          "gloss": "Is this a real call? Are you a person?",
          "next": "repair-deadair-3"
        }
      ]
    },
    "repair-deadair-3": {
      "speaker": "stella",
      "guj": "ત્રણ વાર થયું, એ મારી ભૂલ છે. હવે બે રસ્તા છે. હું અત્યારે જ ઝાયડસના માણસ સાથે વાત કરાવી દઉં, અથવા તમે કહો એ ટાઈમે માણસ તમને સામેથી ફોન કરશે. અત્યારે વાત કરાવું કે ટાઈમ કહેશો?",
      "translit": "Tran vaar thayu, e maari bhool chhe. Have be rasta chhe. Hu atyare ja Zydus-na maanas saathe vaat karaavi dau, athvaa tame kaho e time-e maanas tamne saame-thi phone karshe. Atyare vaat karaavu ke time kahesho?",
      "gloss": "That is three times now, and that is my mistake. There are two ways from here. I can get you talking to a person at Zydus right now, or a person will call you back at a time you name. Shall I put you through now, or will you tell me a time?",
      "annotation": {
        "category": "repair",
        "rule": "Rung three stops repairing and hands over. Name the count of failures once, own it in one plain clause, and offer exactly two real routes to a human: one immediate, one at a time the candidate names. No third apology on the same line.",
        "why": "Three faults is where a system either escalates or abandons. The framework names the risk that a human handoff exists on paper but is theatre, so escalation has to name a destination and let the candidate pick the timing. Offering the candidate their own callback slot is the same self-generated commitment that made rescheduled calls the pilot's most engaged ones. The closing question forces a choice between the two named routes rather than a bare yes, because short answers are the worst acoustic case.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 10; dassh-rewrite-brief.md section 5.3; dassh-gujarati-research.md section 1 point 4"
      },
      "subAgent": "escalation: fired on the third consecutive fault and pinned the record as system failure rather than candidate disinterest, so the call is requeued, not scored",
      "branches": [
        {
          "label": "Put me through now",
          "candidateSays": "અત્યારે જ માણસ સાથે વાત કરાવો",
          "candidateSaysLatin": "Atyare ja maanas saathe vaat karaavo",
          "gloss": "Connect me to a person right now",
          "next": "repair-human-now"
        },
        {
          "label": "Have someone call me after seven",
          "candidateSays": "સાત પછી ફોન કરાવજો",
          "candidateSaysLatin": "Saat pachhi phone karaavjo",
          "gloss": "Have them call after seven",
          "next": "repair-exit-grace"
        }
      ]
    },
    "repair-misrec-1": {
      "speaker": "stella",
      "guj": "મારાથી થોડું ચૂકાઈ ગયું, વાંક મારો. મને એટલું જ સંભળાયું, 'વરસ'. આખું ફરી કહેશો?",
      "translit": "Maara-thi thodu chukaai gayu, vaank maaro. Mane etlu ja sambhalaayu, 'varas'. Aakhu fari kahesho?",
      "gloss": "I missed a bit, my fault. I only heard this much, 'years'. Will you say the whole thing again?",
      "annotation": {
        "category": "repair",
        "rule": "Rung one of misrecognition: name the miss as the machine's, play back the exact fragment that was heard, then ask only for the missing remainder, in three short beats so it survives a noisy line. Ask with the future-tense question form, never a bare imperative.",
        "why": "Repeating the whole question tells the candidate nothing about where the failure was and invites the same failure again. Gujarati grammar documents a four-step politeness gradient on requests with the future-tense question at the top, so the repair ask is phrased as will you say it again rather than say it again. The mistake is named as the machine's before anything is asked of the candidate.",
        "source": "dassh-gujarati-research.md section 2, verb mood; dassh-failure-taxonomy.md Stage 3 item 3"
      },
      "branches": [
        {
          "label": "Nine years",
          "candidateSays": "નવ વરસથી કરું છું",
          "candidateSaysLatin": "Nav varas-thi karu chhu",
          "gloss": "I have been doing it for nine years",
          "next": "repair-misrec-2"
        },
        {
          "label": "Nine years! Nine!",
          "candidateSays": "નવ વરસ! નવ!",
          "candidateSaysLatin": "Nav varas! Nav!",
          "gloss": "Nine years! Nine!",
          "next": "repair-misrec-2"
        }
      ]
    },
    "repair-misrec-2": {
      "speaker": "stella",
      "guj": "માફ કરશો, મને બરાબર સંભળાયું નહીં. સવાલ સહેલો કરી દઉં. અનુભવ દસ વરસથી ઓછો કે દસ વરસથી વધારે, એટલું કહેશો?",
      "translit": "Maaf karsho, mane barabar sambhlaayu nahi. Savaal sahelo kari dau. Anubhav das varas-thi ochho ke das varas-thi vadhare, etlu kahesho?",
      "gloss": "Sorry, I did not hear that properly. Let me make the question easier. Will you tell me just this much: is the experience less than ten years, or more than ten years?",
      "annotation": {
        "category": "numbers",
        "rule": "On the second repair attempt, change the question rather than the volume: convert an open number question into a two-way contrast that names the thing being counted, and ask for it with a future-tense request form so the natural answer is a full phrase.",
        "why": "Word error rate roughly doubles between utterances over five seconds and under two seconds, so a bare numeral is the worst acoustic case the system can ask for. Gujarati numerals make partial hearing useless because the ogan- family is built on the following decade's base, so a clipped syllable flips the value. A contrast question is recoverable from a fragment. The apology takes the fault onto the caller: shrinking the question is help, repeating it louder is blame.",
        "source": "dassh-gujarati-research.md section 1 items 4 and 5, Voice of India benchmark, and section 4"
      },
      "subAgent": "comprehension: logged two consecutive recognition failures on one slot and flipped the rest of the call into confirm-every-slot mode",
      "branches": [
        {
          "label": "Less than ten",
          "candidateSays": "દસ વરસથી ઓછો, નવ વરસ",
          "candidateSaysLatin": "Das varas-thi ochho, nav varas",
          "gloss": "Less than ten, nine years",
          "next": "screen-q-work"
        },
        {
          "label": "It still is not understanding me",
          "candidateSays": "તમને હજી નથી સમજાતું",
          "candidateSaysLatin": "Tamne haji nathi samjaatu",
          "gloss": "You still are not getting it",
          "next": "repair-misrec-3"
        }
      ]
    },
    "repair-misrec-3": {
      "speaker": "stella",
      "guj": "ભૂલ મારી બાજુની છે, લાઈન બરાબર નથી. ફોનના બટન વાપરીશું? દસ વરસથી ઓછો અનુભવ હોય તો એક દબાવશો, દસ વરસથી વધારે હોય તો બે દબાવશો. અને માણસ સાથે વાત કરવી હોય તો નવ દબાવશો, હું તરત જોડી આપીશ.",
      "translit": "Bhool maari baaju-ni chhe, line barabar nathi. Phone-naa button vaaparishu? Das varas-thi ochho anubhav hoy to ek dabaavsho, das varas-thi vadhare hoy to be dabaavsho. Ane maanas saathe vaat karvi hoy to nav dabaavsho, hu tarat jodi aapish.",
      "gloss": "The mistake is on my side, the line is not good. Shall we use the phone's buttons? If you have less than ten years of experience press one, if more than ten years press two. And if you want to talk to a person press nine, I will connect you right away.",
      "annotation": {
        "category": "repair",
        "rule": "Rung three keeps the question and adds a channel rather than replacing one. Locate the defect on the system side without naming the candidate's speech, offer the keypad as a future-tense question, restate the head noun in every digit branch, and put the human on a key of its own so it is reachable without speaking.",
        "why": "By the third failure the candidate has almost certainly concluded the problem is how they speak, which is exactly the harm the framework calls a system defect rather than a candidate defect. On the keypad the literature genuinely disagrees: a long-running Gujarat field deployment found users preferring keys and calling voice error-prone, while an Urdu health-worker study found the opposite. The honest design offers both and lets the candidate self-select rather than assuming an answer the research does not have.",
        "source": "dassh-gujarati-research.md section 7, Avaaj Otalo CHI 2010 versus Sherwani ICTD 2009, and sections 1 point 4 and 2; dassh-failure-taxonomy.md Stage 3 item 4"
      },
      "branches": [
        {
          "label": "Press 1 on the keypad",
          "candidateSays": "[presses 1]",
          "gloss": "The candidate presses the key",
          "next": "screen-q-work"
        },
        {
          "label": "Press 9, let me talk to a person",
          "candidateSays": "[presses 9]",
          "gloss": "The candidate asks for a person",
          "next": "repair-human-now"
        }
      ]
    },
    "repair-noise-1": {
      "speaker": "stella",
      "guj": "થોડો અવાજ આવે છે, મને બરાબર સંભળાતું નથી. ફોન થોડો નજીક રાખશો? હું પણ ધીરે ધીરે અને થોડું મોટેથી બોલીશ.",
      "translit": "Thodo avaaj aave chhe, mane barabar sambhlaatu nathi. Phone thodo najik raakhsho? Hu pan dhire dhire ane thodu mote-thi bolish.",
      "gloss": "There is some noise, I cannot hear you properly. Will you hold the phone a little closer? I will also speak slowly and a little louder.",
      "annotation": {
        "category": "repair",
        "rule": "Name the noise as a condition of the line rather than something the candidate has failed to avoid, ask for the smallest physical change available to them, and pair it with a change the agent makes to itself, stated unambiguously as slower and a little louder, never as ધીમે alone, which a listener can hear as softer.",
        "why": "A factory floor, a street, a shared room is the default physical context for this population, not an edge case, so the repair prompt assumes noise is likely rather than treating it as the candidate's failure to find somewhere quiet. Offering to slow down alongside the ask makes the repair mutual, which is the difference between troubleshooting together and being told off.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 5, framework A1"
      },
      "branches": [
        {
          "label": "Hold on, let me get somewhere quieter",
          "candidateSays": "હવે? હવે સંભળાય છે?",
          "candidateSaysLatin": "Have? Have sambhlaay chhe?",
          "gloss": "Now? Can you hear now?",
          "next": "screen-q-experience"
        },
        {
          "label": "I am on the floor, I cannot move",
          "candidateSays": "હું કામ પર છું, અહીંથી ખસાય એવું નથી",
          "candidateSaysLatin": "Hu kaam par chhu, ahi-thi khasaay evu nathi",
          "gloss": "I am at work, I cannot move from here",
          "failureCase": { "what": "The cheapest fix is unavailable and repeating it turns a physical constraint into an apparent refusal", "source": "Failure taxonomy, stage 3 item 5" },
          "next": "repair-exit-grace"
        }
      ]
    },
    "repair-name-1": {
      "speaker": "stella",
      "guj": "માફ કરશો, મારાથી તમારું નામ ખોટું બોલાઈ ગયું. તમે તમારું નામ ધીમેથી બે વાર બોલશો? પછી હું તમારી પાસેથી શીખીને એ જ રીતે બોલીશ.",
      "translit": "Maaf karsho, maara-thi tamaaru naam khotu bolaai gayu. Tame tamaaru naam dheeme-thi be vaar bolsho? Pachhi hu tamaari paase-thi shikhine e ja rite bolish.",
      "gloss": "Sorry, your name came out wrong from me. Will you say your name slowly, twice? Then I will learn it from you and say it that way.",
      "annotation": {
        "category": "register",
        "rule": "Rung one of the name failure: apologise with the agentless બોલાઈ ગયું form so the slip sits on the machine, ask in future-question form for the name said slowly and twice, then promise to mirror what was heard. Never re-attempt the original guess.",
        "why": "This is a documented pilot failure with no fallback defined at the time. A name said wrong in the opening seconds reads as this is not a real person who cares, which primes an early hang-up before a single question is asked. Asking for it slowly and twice makes the reply a redundant two-pass utterance instead of a sub-two-second single token, the worst case for Indic ASR and the exact entity class where it fails hardest. The owner of the name is also the only reliable source, since the string in the source record is often malformed.",
        "source": "dassh-failure-taxonomy.md Stage 2 item 3, OBSERVED, Candidate C; dassh-gujarati-research.md findings 3 and 4"
      },
      "branches": [
        {
          "label": "(say the name slowly, twice)",
          "candidateSays": "[the candidate says their own name, twice]",
          "gloss": "(you say your name again, slowly)",
          "next": "screen-frame-low-stakes"
        },
        {
          "label": "You still cannot say it",
          "candidateSays": "ના, હજી બરાબર નથી",
          "candidateSaysLatin": "Na, haji baraabar nathi",
          "gloss": "No, still not right",
          "next": "repair-name-3"
        }
      ]
    },
    "repair-name-3": {
      "speaker": "stella",
      "guj": "તો હું નામ નહીં બોલું, એટલે ખોટું બોલાય નહીં. તમારું નામ કેમ બોલવું એ હું અમારા માણસ માટે લખી રાખું છું. આપણે નામ વગર આગળ વધીએ, ફાવશે?",
      "translit": "To hu naam nahi bolu, etle khotu bolaay nahi. Tamaru naam kem bolvu e hu amaaraa maanas maate lakhi raakhu chhu. Aapne naam vagar aagal vadhiye, faavshe?",
      "gloss": "Then I will not say the name, so it does not come out wrong. I am writing down how to say your name for our person. Let us go ahead without the name, is that alright?",
      "annotation": {
        "category": "register",
        "rule": "Rung three retires the name entirely rather than attempting a third guess, and says so plainly before asking permission for the switch. The phonetic note is handed forward to the named human, not filed against the candidate.",
        "why": "This is the fallback the pilot did not have. A name-free greeting is the taxonomy's prescribed default when name confidence is low, and it costs nothing in Gujarati because તમારું and the future-question ફાવશે carry the honorific load in the grammar itself. Admitting the limit is cheaper than a third wrong attempt, which is the version that reads as contempt.",
        "source": "dassh-failure-taxonomy.md Stage 2 item 3, name-free greeting fallback; dassh-gujarati-research.md section 2, તમે as honorific"
      },
      "branches": [
        {
          "label": "Yes, fine",
          "candidateSays": "હા, ચાલશે",
          "candidateSaysLatin": "Ha, chaalshe",
          "gloss": "Yes, that is fine",
          "next": "screen-frame-low-stakes"
        },
        {
          "label": "Just let a person call me",
          "candidateSays": "માણસ પાસે ફોન કરાવો ને",
          "candidateSaysLatin": "Maanas paase phone karaavo ne",
          "gloss": "Just have a person call me",
          "next": "repair-exit-grace"
        }
      ]
    },
    "repair-human-now": {
      "speaker": "stella",
      "guj": "જોડું છું. લાઇન પર જ રહેશો, થોડી વાર લાગશે. કોઈ ન ઉપાડે તો હું પાછી આવીશ. અને તમારી બધી વાત માણસને હું જ કહી દઈશ, તમારે ફરીથી કહેવું નહીં પડે.",
      "translit": "Jodu chhu. Line par ja rahesho, thodi vaar laagshe. Koi na upaade to hu paachhi aavish. Ane tamaari badhi vaat maanas-ne hu ja kahi daish, tamaare fari-thi kahevu nahi pade.",
      "gloss": "Connecting you now. Please stay right on the line, it will take a moment. If nobody picks up, I will come back on. And I will tell the person everything you said myself, so you will not have to say it again.",
      "annotation": {
        "category": "trust",
        "rule": "A real handoff names three things out loud: how long the wait is, what happens if the handoff itself fails, and who carries the candidate's context across the seam. Never promise a person without a destination behind it, and never make the candidate pay for the seam by repeating themselves.",
        "why": "A handoff either has a defined trigger and a destination that actually picks up, or it is theatre, and honesty about the wait is what separates the two. The pilot has no evidence a working path was ever invoked. The context-carry promise exists because the rewrite brief's hero volunteered his intent and was steamrolled by a script built to confirm fields, so being asked to say it all again is the specific injury this seam must not repeat.",
        "source": "dassh-failure-taxonomy.md Stage 3 item 10 and Stage 4 item 2, framework A4 and B4; dassh-rewrite-brief.md section 2"
      },
      "ending": "The call is handed to a human recruiter with the transcript, the repair history and any candidate-raised questions attached. The record is marked system-assisted, not screened."
    },
    "repair-exit-grace": {
      "speaker": "stella",
      "guj": "તો આટલું નક્કી. કાલે સવારે ઝાયડસમાંથી અમારું કોઈ તમને આ જ નંબર પર ફોન કરશે. તમારી અરજી ચાલુ જ છે. આજે વાત અધૂરી રહી એમાં વાંક મારો છે, તમારો નહીં, અને મેં તમારી ફાઇલમાં એવું જ લખ્યું છે. તમારો સમય લીધો, આભાર. આવજો.",
      "translit": "To aatlu nakki. Kaale savaare Zydus-maa-thi amaaru koi tamne aa ja number par phone karshe. Tamaari arji chaalu ja chhe. Aaje vaat adhuri rahi emaa vaank maaro chhe, tamaaro nahi, ane me tamaari file-maa evu ja lakhyu chhe. Tamaaro samay lidho, aabhaar. Aavjo.",
      "gloss": "So this much is settled. Tomorrow morning someone of ours from Zydus will call you on this same number. Your application is still active. The call staying unfinished today is my fault, not yours, and I have written exactly that in your file. Thank you for your time. Goodbye.",
      "annotation": {
        "category": "trust",
        "rule": "When repair genuinely fails, close with four things and nothing vaguer: a next step with a real mechanism behind it, the candidate's standing stated as unharmed, the failure attributed to the system in the record the candidate is told about, and thanks. Never we will be in touch.",
        "why": "The pilot's most valuable qualitative finding was a candidate saying the brand always calls and never follows up, which is what a close with no mechanism behind it produces at scale. The worst individual outcome was an interested candidate silently lost because nothing downstream distinguished the system failing from the candidate declining. So the spoken line and the database write are one design decision: the candidate hears the attribution and the record carries it.",
        "source": "dassh-failure-taxonomy.md Stage 4 item 1, OBSERVED, and Stage 5 item 1, OBSERVED; Stage 4 items 2 and 4, ANTICIPATED"
      },
      "subAgent": "escalation: wrote the disposition as system-failure-requeue rather than incomplete, and turned the stated callback time into a hard scheduling constraint instead of a free-text note",
      "ending": "The call ends without a completed screen and the candidate's position in the pipeline is unchanged. A human callback is scheduled at the time the candidate named, with the repair history attached so they never have to explain it again."
    },
    "listen-volunteer": {
      "speaker": "candidate",
      "guj": "કામ તો ચાલુ છે, પણ મારે અત્યારે નવી નોકરી બહુ જરૂરી છે. ત્રણ મહિનાથી કામ નથી.",
      "translit": "Kaam to chaalu chhe, pan maare atyare navi nokri bahu jaruri chhe. Tran mahina-thi kaam nathi.",
      "gloss": "I am working, but I really need a new job right now. I have had no work for three months.",
      "branches": [
        {
          "label": "Play it as the old system did",
          "next": "listen-old-carryon"
        },
        {
          "label": "Play it as the rebuilt system does",
          "next": "listen-fix-acknowledge"
        }
      ]
    },
    "listen-old-carryon": {
      "speaker": "stella",
      "guj": "બરાબર. તમારો notice period કેટલો છે?",
      "translit": "Barabar. Tamaro notice period ketlo chhe?",
      "gloss": "Alright. How long is your notice period?",
      "annotation": {
        "category": "trust",
        "rule": "This is the failure, not a design. The script had a field for notice period and no field for a man saying he has been out of work for three months, so the only sentence in the call that mattered was the one the system had nowhere to put.",
        "why": "The mandate was to confirm details, not to capture intent, so the agent heard a well-formed answer and moved to the next slot. Worse, it then asked notice period, a salaried office concept that does not compute for a man with no current employer, which reads back to him as proof that nobody was listening. Every downstream consequence follows from an absent field, not from a model mistake.",
        "source": "dassh-rewrite-brief.md section 2, the hero; dassh-gujarati-research.md section 3, notice period does not apply at this tier"
      },
      "next": "listen-old-logged"
    },
    "listen-old-logged": {
      "speaker": "system",
      "gloss": "Call disposition: COMPLETE. All required fields captured. Shift availability: yes. Notice period: recorded. No flags raised.",
      "annotation": {
        "category": "trust",
        "rule": "Name what the log would have said. This call was recorded as a success, which is why nobody would ever have found it.",
        "why": "The instrumentation measured field completion, so a call that collected every field it came for scored perfectly while losing the candidate in the batch who was most available and most in need. The pilot had no disposition that distinguishes captured from understood, the same gap that let a lost interested candidate be filed as an ordinary non-completion elsewhere in the log. Finding this man took a person reading transcripts by hand and then phoning him back.",
        "source": "dassh-failure-taxonomy.md Stage 5 items 1 and 8; dassh-rewrite-brief.md section 2"
      },
      "ending": "The script finished, so the system recorded a success. Replay the fork to hear what the rebuilt call does with the same sentence."
    },
    "listen-fix-acknowledge": {
      "speaker": "stella",
      "guj": "એક મિનિટ, {name}ભાઈ. તમે કહ્યું કે ત્રણ મહિનાથી કામ નથી અને નોકરી શોધો છો. મેં એ લખી લીધું છે, અને તમારી બાકીની વિગતો સાથે recruiter ને મોકલી દઈશ.",
      "translit": "Ek minute, {name}bhai. Tame kahyu ke tran mahina-thi kaam nathi ane nokri shodho chho. Me e lakhi lidhu chhe, ane tamari baaki-ni vigato saathe recruiter ne mokli daish.",
      "gloss": "One moment, {name}bhai. You said you have had no work for three months and are looking for a job. I have written that down, and I will send it to the recruiter along with the rest of your details.",
      "annotation": {
        "category": "trust",
        "rule": "When the intent listener fires, the script yields. Acknowledge in the candidate's own words, say plainly that it was recorded in ordinary spoken Gujarati rather than officialese, and say who will see it.",
        "why": "The whole architecture exists because of this sentence going unheard once. Repeating his own words back is the cheapest proof that a machine was listening rather than filling slots, and naming where the note travels replaces the hollow generic follow-up promise that the field log shows candidates already distrust.",
        "source": "dassh-rewrite-brief.md section 2; dassh-failure-taxonomy.md Stage 4 item 1, the vague promise never kept"
      },
      "subAgent": "intent: caught an unprompted statement of availability and need that no form field maps to, and interrupted the script to acknowledge and capture it",
      "next": "listen-fix-readback"
    },
    "listen-fix-readback": {
      "speaker": "stella",
      "guj": "ત્રણ મહિના, એટલે ત્રણ, તેર નહીં. બરાબર?",
      "translit": "Tran mahina, etle tran, ter nahi. Barabar?",
      "gloss": "Three months, that is three, not thirteen. Correct?",
      "annotation": {
        "category": "numbers",
        "rule": "Any number that will reach a recruiter's screen gets a contrastive read-back that names the neighbour being ruled out, including numbers the candidate volunteered rather than ones the script asked for.",
        "why": "Gujarati numerals share onsets and bases across neighbouring values and a clipped first syllable can flip a figure entirely, and short answers are exactly the acoustic condition where Gujarati recognition is weakest. A number the candidate volunteered is as consequential as one the script asked for, so it earns the same confirmation, and free text captured by a listener must never enter the record less verified than a scripted field.",
        "source": "dassh-gujarati-research.md sections 1 and 4"
      },
      "next": "listen-fix-adapt"
    },
    "listen-fix-adapt": {
      "speaker": "stella",
      "guj": "તો notice period વાળો સવાલ હું રહેવા દઉં છું, અત્યારે તમારે એની જરૂર નથી. તમે કામ ક્યારથી ચાલુ કરી શકો, આ અઠવાડિયે કે આવતા મહિનાથી?",
      "translit": "To notice period vaalo savaal hu rahevaa dau chhu, atyaare tamaare eni jarur nathi. Tame kaam kyaar-thi chaalu kari shako, aa athvaadiye ke aavtaa mahinaa-thi?",
      "gloss": "So I am leaving the notice period question aside, you do not need it right now. From when could you start work, this week or from next month?",
      "annotation": {
        "category": "repair",
        "rule": "Acknowledgement is not enough. What was heard has to change the remaining questions, and the replacement question must not itself invite a one-word answer, so it is offered as two named options.",
        "why": "Notice period is a salaried office concept that does not compute for shop floor and contract workers, and asking it of a man with no current employer is the exact moment the old call proved it was not listening. The listener that captures intent also has permission to prune and reorder the script, which is what separates an architecture from a logging feature. The substitute question carries two named options so the natural reply is a full phrase rather than a bare date, because short utterances roughly double word error rate and date of joining is a slot that must be explicitly confirmed.",
        "source": "dassh-gujarati-research.md sections 3 and 4; dassh-rewrite-brief.md section 2"
      },
      "subAgent": "intent: rewrote the remaining question set from the captured intent, dropping a field that no longer applies and promoting availability",
      "branches": [
        {
          "label": "This week, from Monday",
          "candidateSays": "આ અઠવાડિયે, સોમવારથી પણ આવી જાઉં",
          "candidateSaysLatin": "Aa athvaadiye, somvaar-thi pan aavi jaau",
          "gloss": "This week, I could even come from Monday",
          "next": "screen-q-pay"
        },
        {
          "label": "From next month",
          "candidateSays": "આવતા મહિનાથી ફાવશે",
          "candidateSaysLatin": "Aavta mahina-thi faavshe",
          "gloss": "From next month would suit me",
          "next": "screen-q-pay"
        }
      ]
    },
    "close-promise": {
      "speaker": "stella",
      "guj": "હવે પછી શું થશે એ કહી દઉં. બે working day માં Zydus નો recruiter તમને આ જ નંબર પર ફોન કરશે. ખરો માણસ, હું નહીં. હા હોય કે ના, જવાબ તો તમને મળશે જ. અને વચ્ચે કંઈ પૂછવું હોય તો HR નો નંબર હું અત્યારે SMS કરી દઉં છું.",
      "translit": "Have pachhi shu thashe e kahi dau. Be working day maa Zydus no recruiter tamne aa j number par phone karshe. Kharo maanas, hu nahi. Ha hoy ke na, javaab to tamne malshe j. Ane vachche kai puchhvu hoy to HR no number hu atyaare SMS kari dau chhu.",
      "gloss": "Let me tell you what happens next. Within two working days a Zydus recruiter will call you on this same number. A real person, not me. Yes or no, either way you will get an answer. And if you want to ask anything in between, I am sending you the HR number by SMS right now.",
      "annotation": {
        "category": "trust",
        "rule": "Every call closes with the same three facts regardless of fitment: what happens, by when, and how to reach a human. Never a generic promise of follow-up.",
        "why": "The single most damaging pattern in the pilot was a brand that calls and never follows through, which reads as hollow and eventually as spam. So the close only ever states a next step the system can actually guarantee, tied to a real timeframe and a real channel, and it is identical for a candidate who advances and one who does not. Saying a person and not the machine will make that call keeps the promise honest.",
        "source": "dassh-failure-taxonomy.md Stage 4 items 1, 2 and 4; Stage 5 item 3, Candidate D verbatim"
      },
      "branches": [
        {
          "label": "Is this being recorded? What happens to it?",
          "candidateSays": "આ વાત record થાય છે? એનું શું થશે?",
          "candidateSaysLatin": "Aa vaat record thaay chhe? Enu shu thashe?",
          "gloss": "Is this being recorded? What happens to it?",
          "failureCase": { "what": "No disclosure at the close of what data was recorded or how it will be used", "source": "Failure taxonomy, stage 4 item 5" },
          "next": "close-data"
        },
        {
          "label": "Will a person see this, or only the computer?",
          "candidateSays": "આ કોઈ માણસ જોશે કે બસ કમ્પ્યુટર જ નક્કી કરશે?",
          "candidateSaysLatin": "Aa koi maanas joshe ke bas computer ja nakki karshe?",
          "gloss": "Will any person see this, or will only the computer decide?",
          "failureCase": { "what": "The candidate has no way to see or contest how they were scored or filtered", "source": "Failure taxonomy, stage 5 item 4" },
          "next": "close-human-check"
        },
        {
          "label": "When should I come in?",
          "candidateSays": "સારું. મારે ક્યારે આવવાનું?",
          "candidateSaysLatin": "Saaru. Maare kyaare aavvaanu?",
          "gloss": "Good. When should I come in?",
          "next": "close-advance"
        },
        {
          "label": "So am I in for this or not?",
          "candidateSays": "તો આ જગ્યા માટે મારું નામ છે કે નહીં?",
          "candidateSaysLatin": "To aa jagya maate maaru naam chhe ke nahi?",
          "gloss": "So am I in for this position or not?",
          "next": "close-nofit"
        }
      ]
    },
    "close-data": {
      "speaker": "stella",
      "guj": "હા, આ call record થાય છે. એ ફક્ત Zydus ની hiring team પાસે રહે છે, બહાર કોઈને આપતા નથી. તમારે એ delete કરાવવું હોય તો HR ને કહી શકો છો. HR નો નંબર હું અત્યારે SMS કરી દઉં છું.",
      "translit": "Ha, aa call record thaay chhe. E fakt Zydus ni hiring team paase rahe chhe, baahar koi-ne aapta nathi. Tamare e delete karaavvu hoy to HR ne kahi shako chho. HR no number hu atyaare SMS kari dau chhu.",
      "gloss": "Yes, this call is recorded. It stays only with Zydus's hiring team, we do not give it to anyone outside. If you want it deleted, you can tell HR. I am sending you HR's number by SMS right now.",
      "annotation": {
        "category": "trust",
        "rule": "At the close, say plainly what was recorded, who holds it, who does not get it, and give a named human route for removal, in ordinary spoken words and short breath units.",
        "why": "Consent for a recorded automated call is rarely meaningful for someone who feels they cannot say no, so the design owes a plain restatement at the point the recording is filed rather than an opening-only disclaimer. Naming who does not receive it matters more than the fact of recording, because the candidate's real fear is the current employer hearing it. The removal route goes out as an SMS with HR named explicitly, so it survives on a shared or borrowed phone.",
        "source": "dassh-failure-taxonomy.md Stage 4 item 5 and Stage 1 item 3, both ANTICIPATED; deletion-request precedent is the Illinois AI Video Interview Act, dassh-disclosure-research.md section 2"
      },
      "next": "close-final-promise"
    },
    "close-human-check": {
      "speaker": "stella",
      "guj": "હા, માણસ જ જોશે. હું ખાલી લખું છું, નક્કી ઝાયડસનો માણસ કરે છે. અને મને બરાબર ના સમજાય તો એમાં તમારો વાંક નથી, હું જાતે માણસ સાથે જોડી આપીશ.",
      "translit": "Ha, maanas j joshe. Hu khaali lakhu chhu, nakki Zydus-no maanas kare chhe. Ane mane barabar na samjaay to ema tamaro vaank nathi, hu jaate maanas saathe jodi apish.",
      "gloss": "Yes, a person will see it. I only write things down, a Zydus person decides. And if I do not follow you properly, that is not your fault, I will connect you to a person myself.",
      "annotation": {
        "category": "trust",
        "rule": "Say three things plainly and in that order: a human decides, the agent only records, and if the agent fails to understand the candidate that is the system's fault and the call goes to a human rather than being scored against them.",
        "why": "Gujarati speech recognition runs roughly two to two and a half times worse than Hindi on matched benchmarks, and fails hardest exactly on short, entity-dense, code-mixed, noisy speech. A candidate must never be silently filtered by an accent the model handled poorly, so the escalation rule is stated to them, not just implemented. Reusing the same escape-hatch wording as the opening disclosure makes it read as the same promise, not a new one.",
        "source": "dassh-gujarati-research.md section 5; dassh-failure-taxonomy.md Stage 5 item 4"
      },
      "subAgent": "comprehension: flags any span the read-back did not cover as unverified, so the recruiter sees what the machine did not actually hear",
      "next": "close-final-promise"
    },
    "close-advance": {
      "speaker": "stella",
      "guj": "તમારી અરજી આગળ વધી છે. મંગળવારે સવારે અગિયાર વાગ્યે plant માં interview છે, અગિયાર, બાર નહીં. સરનામું અને સમય હું SMS કરી દઈશ. મંગળવારે અગિયાર વાગ્યે તમને ફાવશે?",
      "translit": "Tamari arji aagal vadhi chhe. Mangalvaare savaare agiyaar vaagye plant maa interview chhe, agiyaar, baar nahi. Sarnaamu ane samay hu SMS kari daish. Mangalvaare agiyaar vaagye tamne favshe?",
      "gloss": "Your application has moved ahead. On Tuesday at eleven in the morning there is an interview at the plant, eleven, not twelve. I will send the address and the time by SMS. Does Tuesday at eleven suit you?",
      "annotation": {
        "category": "numbers",
        "rule": "Whole-hour appointment times only, stated contrastively with the ruled-out neighbour, and repeated inside the closing question so the day and hour ride together. The ask is a future-tense question, never an instruction to attend.",
        "why": "Gujarati clock words name the wrong integer, so પોણા સાત is 6:45 while containing the word for seven, and short answers are the worst acoustic case, so the agent supplies the time rather than eliciting it and never lets a single unrepeated pass carry a number the candidate must act on. Asking whether it suits them keeps a scheduled slot from landing as a summons on someone who cannot refuse it.",
        "source": "dassh-gujarati-research.md sections 2 and 4"
      },
      "branches": [
        {
          "label": "Tuesday works",
          "candidateSays": "હા, મંગળવારે અગિયાર વાગ્યે ફાવશે",
          "candidateSaysLatin": "Ha, mangalvaare agiyaar vaagye faavshe",
          "gloss": "Yes, Tuesday at eleven works",
          "next": "close-final-promise"
        },
        {
          "label": "I have a shift Tuesday, after noon works",
          "candidateSays": "મંગળવારે મારી shift છે. બપોર પછી ફાવે.",
          "candidateSaysLatin": "Mangalvaare maari shift chhe. Bapor pachhi faave.",
          "gloss": "I have a shift on Tuesday. After noon would work.",
          "failureCase": { "what": "Stated timing preferences are captured but not evidently honoured", "source": "Failure taxonomy, stage 5 item 5" },
          "next": "close-advance-reschedule"
        }
      ]
    },
    "close-advance-reschedule": {
      "speaker": "stella",
      "guj": "તમે કહ્યો એ સમય જ લખી લઉં છું. મંગળવારે બપોરે ત્રણ વાગ્યે, ત્રણ, ચાર નહીં. તમારી shift ની વાત પણ recruiter ને લખી આપું છું, જેથી તમને ફરી એ જ પૂછે નહીં.",
      "translit": "Tame kahyo e samay j lakhi laun chhu. Mangalvaare bapore tran vaagye, tran, chaar nahi. Tamaari shift ni vaat pan recruiter ne lakhi aapu chhu, jethi tamne fari e j puchhe nahi.",
      "gloss": "I am writing down exactly the time you said. Tuesday at three in the afternoon, three, not four. I am writing your shift down for the recruiter too, so that they do not ask you the same thing again.",
      "annotation": {
        "category": "repair",
        "rule": "The candidate's own stated time is read back contrastively against its neighbouring hour and written to the record in front of them, and the constraint they volunteered is carried forward so they are not made to repeat it at the next contact.",
        "why": "In the pilot, candidates gave concrete timing preferences and nothing in the record confirms the system ever honoured them. Letting the candidate propose the time is also the move that turned near-lost calls into the most engaged ones, because a self-proposed commitment is one the person actually keeps. Carrying the shift constraint forward is the intent listener doing work no form field asked for.",
        "source": "dassh-failure-taxonomy.md Stage 5 item 5; dassh-call-craft-research.md Move 2, reactance and commitment"
      },
      "subAgent": "intent: catches the shift constraint the script had no field for and attaches it to the record",
      "next": "close-final-promise"
    },
    "close-nofit": {
      "speaker": "stella",
      "guj": "{name}ભાઈ, ચોખ્ખું કહી દઉં. આ જગ્યા માટે packaging line નો ત્રણ વર્ષનો અનુભવ જોઈએ છે, અને એટલો હજી તમારી પાસે નથી. તમારામાં કંઈ ખોટું છે એવું નથી, આ તો આ એક જગ્યાની શરત છે. તમારું નામ Zydus ના list માં રહેશે, અને આવી બીજી જગ્યા ખૂલે એટલે recruiter સામેથી તમને ફોન કરશે.",
      "translit": "{name}bhai, chokkhu kahi dau. Aa jagya maate packaging line no tran varsh no anubhav joiye chhe, ane etlo haji tamari paase nathi. Tamaara-maa kai khotu chhe evu nathi, aa to aa ek jagya-ni sharat chhe. Tamaru naam Zydus na list maa raheshe, ane aavi biji jagya khule etle recruiter saame-thi tamne phone karshe.",
      "gloss": "{name}bhai, let me say it plainly. This position needs three years of packaging line experience, and you do not have that yet. It is not that anything is wrong with you, this is just this one position's requirement. Your name stays on Zydus's list, and when another position like this opens a recruiter will call you directly.",
      "annotation": {
        "category": "trust",
        "rule": "A no is said plainly, attributed to one named requirement of one named role, never to the person, never left for the candidate to infer from silence, and always followed by an explicit next step with a named owner.",
        "why": "This is where dignity is preserved or destroyed. A vague close leaves a high-need candidate guessing whether they were judged, and the pilot's worst outcome was people who never learned whether they were rejected or lost to a bug. Naming the single missing requirement makes the decision checkable and keeps it about a job, not a verdict on a person.",
        "source": "dassh-failure-taxonomy.md Stage 4 item 4 and Stage 5 item 1; dassh-rewrite-brief.md section 2"
      },
      "branches": [
        {
          "label": "Did I say something wrong?",
          "candidateSays": "મેં કંઈ ખોટું બોલ્યું? મારી ભાષાને લીધે થયું?",
          "candidateSaysLatin": "Me kai khotu bolyu? Maari bhaasha-ne lidhe thayu?",
          "gloss": "Did I say something wrong? Did this happen because of my language?",
          "failureCase": { "what": "Regional accent or dialect is not recognised and the candidate reads it as the system not understanding people like them", "source": "Failure taxonomy, stage 3 item 4" },
          "next": "close-nofit-why"
        },
        {
          "label": "I really need this job",
          "candidateSays": "મારે આ નોકરી બહુ જરૂરી છે. કંઈ થાય એવું છે?",
          "candidateSaysLatin": "Maare aa nokri bahu jaruri chhe. Kai thaay evu chhe?",
          "gloss": "I really need this job. Is there anything that can be done?",
          "failureCase": { "what": "Candidate becomes emotionally distressed and the power asymmetry turns the call into an interrogation", "source": "Failure taxonomy, stage 3 item 9" },
          "next": "close-nofit-distress"
        },
        {
          "label": "Accept it and ask what comes next",
          "candidateSays": "ઠીક છે. તો હવે?",
          "candidateSaysLatin": "Thik chhe. To have?",
          "gloss": "Alright. So what now?",
          "next": "close-final-promise"
        }
      ]
    },
    "close-nofit-why": {
      "speaker": "stella",
      "guj": "ના. તમારી બોલી કે ભાષા સાથે એને કંઈ લેવાદેવા નથી. કારણ એક જ છે, અનુભવનાં વર્ષ ઓછાં પડ્યાં. અને આ છેલ્લો નિર્ણય નથી. તમે કહો તો હું આખી વાત અમારા માણસને મોકલી દઈશ, એ ફરી જોશે.",
      "translit": "Na. Tamari boli ke bhaashaa saathe ene kai levaa-devaa nathi. Kaaran ek j chhe, anubhav-naa varsh ochhaa padyaa. Ane aa chhello nirnay nathi. Tame kaho to hu aakhi vaat amaaraa maanas-ne mokli daish, e fari joshe.",
      "gloss": "No. This has nothing to do with your accent or your language. There is one reason only, the years of experience fell short. And this is not the final decision. If you want, I will send the whole thing to a person on our side, and they will look at it again.",
      "annotation": {
        "category": "trust",
        "rule": "Name the fear the candidate actually voiced and rule it out in plain words, give the one real reason instead of defending the decision, then commit in the future tense to a human re-review that actually exists.",
        "why": "Gujarati recognition fails roughly two to two and a half times worse than Hindi on exactly this kind of short, entity-dense, code-mixed, noisy speech, so a candidate suspecting their speech cost them the job is making a reasonable inference, not an unreasonable one. The harm is a machine decision the person cannot contest, and the fix is a one-sentence route to human re-review offered by the agent. The promise must use the committing future form and may only be spoken if the handoff destination really picks up, otherwise it becomes the documented empty-follow-up failure.",
        "source": "dassh-gujarati-research.md section 5; dassh-failure-taxonomy.md Stage 5 item 4, Stage 4 items 1 and 2"
      },
      "branches": [
        {
          "label": "Yes, send it",
          "candidateSays": "હા, મોકલી દો",
          "candidateSaysLatin": "Ha, mokli do",
          "gloss": "Yes, send it",
          "next": "close-nofit-distress"
        },
        {
          "label": "No, leave it. I understand.",
          "candidateSays": "ના, રહેવા દો. સમજી ગયો.",
          "candidateSaysLatin": "Na, raheva do. Samji gayo.",
          "gloss": "No, leave it. I understand.",
          "next": "close-final-promise"
        }
      ]
    },
    "close-nofit-distress": {
      "speaker": "stella",
      "guj": "હું સમજું છું, {name}ભાઈ. હું તમને અત્યારે જ માણસ સાથે જોડી આપું છું. અત્યારે ના ફાવે તો આજે સાંજે છ વાગ્યે એ તમને ફોન કરશે. તમને શું ફાવશે, અત્યારે કે સાંજે છ વાગ્યે?",
      "translit": "Hu samju chhu, {name}bhai. Hu tamne atyaare j maanas saathe jodi aapu chhu. Atyaare na faave to aaje saanje chha vaagye e tamne phone karshe. Tamne shu favshe, atyaare ke saanje chha vaagye?",
      "gloss": "I understand, {name}bhai. I am connecting you to a person right now. If now does not suit you, they will call you today at six in the evening. What suits you, now or six in the evening?",
      "annotation": {
        "category": "trust",
        "rule": "Distress at a no escalates to a human immediately, and the escalation names exactly one destination and one clock time, never a vague today and never two competing promises. The turn ends on a choice the candidate makes.",
        "why": "The candidate needs the job far more than the system needs them, and a machine that argues its decision at that moment is the worst version of the power asymmetry. The escalation seam has to be genuine, because a handoff that is theatre is worse than none. This listener acts on what he said and how urgently he said it; it does not score his emotion, because inferring worth from vocal affect is exactly what the strictest regulator bans outright in a workplace.",
        "source": "dassh-failure-taxonomy.md Stage 3 items 9 and 10; dassh-rewrite-brief.md section 2, the parallel distress listener; dassh-disclosure-research.md on the EU AI Act Article 5 workplace emotion-recognition ban"
      },
      "subAgent": "distress and escalation: both fire here and hand the call to a named recruiter queue rather than closing the record",
      "next": "close-final-promise"
    },
    "close-final-promise": {
      "speaker": "stella",
      "guj": "છેલ્લે એક વાત, {name}ભાઈ. હા હોય કે ના, જવાબ તો તમને મળશે જ. થોડા દિવસમાં ફોન કે મેસેજ આવશે. તમે સમય આપ્યો, આભાર. આવજો.",
      "translit": "Chhelle ek vaat, {name}bhai. Ha hoy ke na, javaab to tamne malshe j. Thoda divas-ma phone ke message aavshe. Tame samay aapyo, aabhaar. Aavjo.",
      "gloss": "One last thing, {name}bhai. Yes or no, you will definitely get an answer. A call or a message will come within a few days. You gave me your time, thank you. Goodbye.",
      "annotation": {
        "category": "trust",
        "rule": "Every path ends on the same promise, in the candidate's own language and in positive form: an answer comes either way, naming the channel and a rough window rather than negating silence.",
        "why": "The worst single outcome in the pilot was an interested candidate lost to a system failure with no way to tell a bug from a rejection, so hearing back has to be the promise the design is held to, spoken identically to the candidate who advances, the one who is rejected, and the one still deciding. Saying it positively and concretely keeps the closing to one idea on a noisy shared handset. The separate brand-trust complaint, that the company calls without ever following with a real opportunity, is why the promise must attach to an actual opening. Address stays {name}bhai and the farewell stays the neutral aavjo, so the last words carry no religious coding and no drop in register.",
        "source": "dassh-failure-taxonomy.md Stage 5 items 1 and 3; dassh-gujarati-research.md sections 2, 3 and 6"
      },
      "ending": "The call ends the same way on every path: a stated next step, a stated timeframe, a human number already sent by SMS, and an explicit promise of an answer either way. Advance, reject and undecided differ only in the middle, never in the close."
    }
  }
};

export const CATEGORIES = {
  register: { label: "Language and register", short: "Language" },
  numbers: { label: "Numbers and names", short: "Numbers" },
  repair: { label: "Repair and dead air", short: "Repair" },
  trust: { label: "Trust and escalation", short: "Trust" },
};

export const SUB_AGENTS = ["intent", "distress", "comprehension", "escalation"];

// The demo substitutes one anonymized given name; the real system resolves it from
// the ATS record and strips any trailing bhai/ben before appending, so a stored
// "Rameshbhai" never becomes "Rameshbhaibhai".
// One place for the role and the site, beside the name, because every surface that
// names them was retyping them. "Packing operator" is what Stella actually says in the
// dialogue, so the UI now agrees with the call instead of contradicting it.
export const ROLE_EN = "Packing operator";
export const SITE_EN = "Sanand";

export const DEMO_NAME = "મહેશ";
export const DEMO_NAME_LATIN = "Mahesh";

// The human recruiter a candidate is handed to. Deliberately NOT the candidate's
// name: the graph once had Stella tell Maheshbhai that recruiter Maheshbhai would
// call him. qaStella asserts these never collide again.
export const HUMAN_RECRUITER_NAME = "રાકેશ";
export const HUMAN_RECRUITER_NAME_LATIN = "Rakesh";
