import{$}from"./state.js";

/* ---- synth: one parameterised function, four voices ---- */
export const VOICES={
  Whisper:{base:520,noise:.9,tone:.1,q:.7,dec:1.2},
  Wood:{base:340,noise:.45,tone:.55,q:4,dec:.6},
  Tuned:{base:660,noise:.15,tone:.85,q:2,dec:.9},
  Glass:{base:1320,noise:.1,tone:.9,q:8,dec:1.4},
  Bubble:{base:440,noise:.05,tone:.95,q:3,dec:.7,wave:'sine',bend:1.9},
  Paper:{base:2200,noise:.95,tone:0,q:1.2,dec:.5},
  Marimba:{base:520,noise:.08,tone:.95,q:2,dec:1.1,wave:'triangle'},
  Metal:{base:880,noise:.2,tone:.7,q:12,dec:1.6,wave:'square'},
  Arcade:{base:780,noise:0,tone:.6,q:2,dec:.7,wave:'square',bend:1.5},
  Sub:{base:110,noise:.2,tone:1,q:1,dec:1.3,wave:'sine'},
  Chime:{base:1760,noise:0,tone:.8,q:6,dec:2.2,wave:'sine'},
  Soft:{base:300,noise:.35,tone:.5,q:.8,dec:1,wave:'sine',lp:true},
  Breath:{base:260,noise:.85,tone:.15,q:.6,dec:1.8,lp:true,soft:1},
  Pad:{base:220,noise:.12,tone:.9,q:1.4,dec:2.2,wave:'sine',soft:1},
  Veil:{base:660,noise:.5,tone:.45,q:2.5,dec:2,wave:'triangle',soft:1},
  Cloth:{base:900,noise:1,tone:0,q:1.2,dec:.8,atonal:1},
  Grit:{base:1400,noise:1,tone:0,q:6,dec:.6,atonal:1},
  Static:{base:3000,noise:1,tone:0,q:.5,dec:.5,atonal:1},
  Air:{base:5000,noise:1,tone:0,q:.8,dec:1.6,soft:1,atonal:1},
  // Skeuomorphic: "used when an interaction has a strong real world association".
  // Material's own three examples: a camera shutter, a card swipe, a tap.
  Shutter:{base:2600,noise:1,tone:0,q:3,dec:.5,atonal:1,skeu:'shutter'},
  Switch:{base:3200,noise:1,tone:0,q:5,dec:.35,atonal:1,skeu:'switch'},
  Card:{base:1100,noise:1,tone:0,q:.9,dec:1,atonal:1,skeu:'card'},
  Key:{base:2400,noise:1,tone:0,q:4,dec:.3,atonal:1,skeu:'key'},
  Zip:{base:1800,noise:1,tone:0,q:3,dec:.6,atonal:1,skeu:'zip'},
  Page:{base:1600,noise:1,tone:0,q:1,dec:.9,atonal:1,skeu:'page'},
  Latch:{base:3000,noise:1,tone:0,q:7,dec:.8,atonal:1,skeu:'latch'},
  Coin:{base:2200,noise:1,tone:0,q:9,dec:1.6,atonal:1,skeu:'coin'},
  Knock:{base:420,noise:1,tone:0,q:2,dec:.5,atonal:1,skeu:'knock'}
};

// Material Design: "Tonal sounds work best to communicate personality, emotion,
// and state changes, whereas atonal sounds better support motion transitions."
// These are the motion types, so by default they lose their pitched content.
// Material splits sound by whether it references the real world: skeuomorphic
// "when an interaction has a strong real world association", abstract otherwise.
// The `skeu` property already marks them, so the panel derives the two groups
// rather than keeping a second list that can drift out of step.
export const VOICE_GROUPS=[
  {name:'Abstract',   note:'invented for the interaction',
   voices:Object.keys(VOICES).filter(v=>!VOICES[v].skeu)},
  {name:'Skeuomorphic',note:'borrowed from a real object',
   voices:Object.keys(VOICES).filter(v=>!!VOICES[v].skeu)},
];

export const MOTION_TYPES=new Set(['whoosh','rise','decay','cut','morph']);

// Five-level hierarchy, collapsed to the three that apply to us. Each sound
// should "reflect its level of importance in the UI's hierarchy".
// One line per type, the same idea as VOICE_NOTES under the voice pills.
export const TYPE_NOTES={tick:'small and brief',whoosh:'travel across the frame',
  morph:'a large change in place',hit:'a hard impact',land:'settling at the end',
  cut:'an edit between shots',swell:'a gradual fade',rise:'builds, then lands',
  decay:'arrives, then falls away',pulse:'a quick flicker',enter:'grows out of nothing',
  depart:'shrinks away',wait:'repeats, going nowhere'};

export const HIERARCHY={cut:'hero',hit:'hero',
  whoosh:'primary',rise:'primary',decay:'primary',morph:'primary',swell:'primary',
  enter:'primary',depart:'primary',
  tick:'secondary',pulse:'secondary',land:'secondary',wait:'secondary'};
export const LEVEL={hero:1,primary:.72,secondary:.5};
/* ---- Phase 3: pitch, space, and a mix bus ----
   A run of identical ticks reads as a stutter. Pitch each event by where it
   happened (high on screen sounds high, a large motion drops an octave) and lock
   those pitches to a scale, and the same run reads as a phrase. */
export const SCALES={'Minor pentatonic':[0,3,5,7,10],'Major pentatonic':[0,2,4,7,9],'Whole tone':[0,2,4,6,8,10],'Chromatic':[0,1,2,3,4,5,6,7,8,9,10,11],'Off':null};
export const rnd=(x,seed)=>{const v=Math.sin(x*12.9898+seed*78.233)*43758.5453;return v-Math.floor(v)};
export function pitchOf(ev){
  const sc=SCALES[$('scale').value],spread=+$('spread').value;
  if(!sc||!spread)return 0;
  const steps=sc.length*2,up=1-(ev.cy!=null?ev.cy:.5);          // top of frame = top of range
  const i=Math.round(up*(steps-1));
  let semi=sc[i%sc.length]+12*((i/sc.length)|0);
  if(ev.area>.4)semi-=12;                                        // big motions sit lower
  return semi*spread;
}
// Identical repeats are the giveaway that a sound is synthetic. Detune and level
// wobble very slightly, seeded by the event time so a re-render is identical.
export const humanise=ev=>{const k=ev.t+(ev.pan||0)*.017+(ev.cy||0)*.031;   // split events share a t
  return{cents:rnd(k,1)*30-15,gain:.93+rnd(k,2)*.14}};
export const TYPE_LABEL={tick:'Tick',whoosh:'Whoosh',morph:'Morph',hit:'Hit',land:'Settle',cut:'Cut',swell:'Swell',rise:'Rise',decay:'Decay',pulse:'Pulse',enter:'Enter',depart:'Depart',wait:'Wait'};
export const VOICE_NOTES={Whisper:'airy, barely there',Wood:'dry knock',Tuned:'clean pitched',Glass:'bright, ringing',Bubble:'playful pop',Paper:'crisp rustle',Marimba:'warm mallet',Metal:'hard, techy',Arcade:'8-bit',Sub:'deep thump',Chime:'long sparkle',Soft:'muffled, gentle',Breath:'soft air, no attack',Pad:'warm sustain',Veil:'hazy shimmer',Cloth:'soft fabric, no pitch',Grit:'rough, abrasive',Static:'broadband hiss',Air:'high, weightless',Shutter:'camera, two clicks',Switch:'mechanical toggle',Card:'swipe, dismissed',Key:'keyboard, bottomed out',Zip:'zipper, fast travel',Page:'paper turning',Latch:'lid catching shut',Coin:'coin landing',Knock:'knuckle on wood'};
export const prng=seed=>()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
const NOISE=new WeakMap();
export function noiseBuf(c){
  if(NOISE.has(c))return NOISE.get(c);
  const b=c.createBuffer(1,c.sampleRate,c.sampleRate),d=b.getChannelData(0),r=prng(1337);
  for(let i=0;i<d.length;i++)d[i]=r()*2-1;
  NOISE.set(c,b);return b;
}
// How much of this clip is the same type? "The more often an interaction
// happens, the less intrusive that sound should be."
// Material: "Bright sound has more high-frequency content, giving it a louder
// presence. Muted sound has less high-frequency content, making its sound subtle
// and quieter." One dial, applied two ways: it moves every noise filter, and it
// tilts the whole bus. 0.5 is neutral and must render exactly as before.
export const brightness=()=>{const el=$('bright');return el?+el.value:.5};
export const briScale=b=>Math.pow(2,(b-.5)*1.3);     // filter movement, neutral at 0.5
// Brightness should change character, not level. Without this the dial was a
// 2.9x loudness swing, i.e. half a volume knob. Constant fitted to measurement.
export const briComp=b=>Math.pow(2,-(b-.5)*1.15);

export function duckFor(type,events){
  const n=(events||[]).filter(e=>e.type===type).length;
  return n<2?1:Math.max(.42,1/Math.sqrt(n));
}

export function voice(c,out,ev,when,vName,opts={}){
  const v=VOICES[vName],g=c.createGain();
  const pitched=opts.pitchMotion||!MOTION_TYPES.has(ev.type);
  const toneMul=(v.atonal||!pitched)?0:1;          // atonal: the noise carries it alone
  const level=LEVEL[HIERARCHY[ev.type]||'primary'];
  const duck=opts.duck==null?1:opts.duck;
  const sfx=out.sfx||out,send=out.send||null;
  const hum=humanise(ev),peak=ev.gain*.5*hum.gain*level*duck;
  // Phase 2 pays off here: the detected screen position becomes stereo position.
  let bus=sfx;
  if(ev.pan!=null&&c.createStereoPanner){const pn=c.createStereoPanner();pn.pan.value=Math.max(-1,Math.min(1,ev.pan*.7));pn.connect(sfx);bus=pn}
  g.connect(bus);
  // Sustained sounds want more room than clicks do.
  if(send){const sg=c.createGain();sg.gain.value=(ev.type=='tick'||ev.type=='hit')?.45:1;g.connect(sg).connect(send)}
  const env=(a0,len)=>{const a=v.soft?Math.max(a0,len*.35):a0;g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(peak,when+a);g.gain.exponentialRampToValueAtTime(.0001,when+len+(v.soft?len*.5:0))};
  const tone=(f0,f1,len,type='sine',lvl=v.tone)=>{if(lvl*toneMul<=0.001)return;const o=c.createOscillator(),og=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,when);o.frequency.exponentialRampToValueAtTime(f1,when+len);og.gain.value=lvl*toneMul;o.connect(og).connect(g);o.start(when);o.stop(when+len+.05)};
  const bs=briScale(brightness());
  const noise=(f0,f1,len,lvl=v.noise,q=v.q)=>{
    f0=Math.min(18000,Math.max(40,f0*bs));f1=Math.min(18000,Math.max(40,f1*bs));const s=c.createBufferSource();s.buffer=noiseBuf(c);const bp=c.createBiquadFilter();bp.type=v.lp?'lowpass':'bandpass';bp.Q.value=q;bp.frequency.setValueAtTime(f0,when);bp.frequency.exponentialRampToValueAtTime(f1,when+len);const ng=c.createGain();ng.gain.value=lvl;s.connect(bp).connect(ng).connect(g);s.start(when);s.stop(when+len+.05)};
  const B=v.base*Math.pow(2,(pitched?pitchOf(ev):0)/12)*Math.pow(2,hum.cents/1200);

  if(v.skeu){
    const bsk=briScale(brightness());
    // one short filtered noise burst, the building block of all three
    const click=(t,len,f0,f1,q,lvl)=>{
      const src=c.createBufferSource();src.buffer=noiseBuf(c);
      const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=q;
      bp.frequency.setValueAtTime(Math.min(18000,f0*bsk),t);
      bp.frequency.exponentialRampToValueAtTime(Math.min(18000,Math.max(40,f1*bsk)),t+len);
      const eg=c.createGain();eg.connect(bus);
      eg.gain.setValueAtTime(0,t);
      eg.gain.linearRampToValueAtTime(lvl,t+.0015);
      eg.gain.exponentialRampToValueAtTime(.0001,t+len);
      src.connect(bp).connect(eg);src.start(t);src.stop(t+len+.03);
    };
    const body=(t,len,f,lvl)=>{             // the low thunk of a real mechanism
      const o=c.createOscillator(),og=c.createGain();o.type='sine';
      o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f*.6,t+len);
      og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(lvl,t+.004);
      og.gain.exponentialRampToValueAtTime(.0001,t+len);
      og.connect(bus);o.connect(og);o.start(t);o.stop(t+len+.03);
    };
    // a struck-metal ring: two detuned partials, because a real coin is not one pitch
    const ring=(t,len,f,lvl)=>{
      [1,2.41].forEach((mul,k)=>{
        const o=c.createOscillator(),og=c.createGain();o.type='sine';
        o.frequency.setValueAtTime(f*mul,t);
        og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(lvl*(k?.35:1),t+.002);
        og.gain.exponentialRampToValueAtTime(.0001,t+len*(k?.6:1));
        og.connect(bus);o.connect(og);o.start(t);o.stop(t+len+.05);
      });
    };
    const long=ev.dur>.28;
    if(v.skeu==='shutter'){
      // mirror up, mirror down: two clicks, the second softer
      click(when,.035,B,B*.55,3,peak);
      body(when,.05,150,peak*.5);
      click(when+.042,.05,B*.8,B*.4,2.5,peak*.7);
      if(long)click(when+ev.dur*.8,.06,B*.6,B*.3,2,peak*.35);
      return;
    }
    if(v.skeu==='key'){
      // travel then bottom-out: two transients 12ms apart, much tighter than a shutter
      click(when,.008,B*1.2,B,5,peak*.45);
      click(when+.012,.022,B,B*.6,4,peak);
      body(when+.012,.05,120,peak*.5);
      if(long)click(when+ev.dur*.7,.02,B*.9,B*.5,4,peak*.5);   // the release
      return;
    }
    if(v.skeu==='zip'){
      // a zipper is many small teeth, not one sound
      const L=Math.max(.12,ev.dur),n=Math.max(6,Math.round(L*46));
      for(let k=0;k<n;k++){
        const t=when+(k/n)*L, f=B*(.7+1.6*(k/n));               // the pitch climbs as it runs
        click(t,.012,f,f*.8,6,peak*(.28+.25*(k/n)));
      }
      body(when+L,.06,160,peak*.3);
      return;
    }
    if(v.skeu==='page'){
      // the sheet sweeps up, then releases with a flick
      const L=Math.max(.18,ev.dur);
      const src=c.createBufferSource();src.buffer=noiseBuf(c);
      const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=1.1;
      bp.frequency.setValueAtTime(Math.min(18000,B*.5*bsk),when);
      bp.frequency.exponentialRampToValueAtTime(Math.min(18000,B*2.6*bsk),when+L*.8);
      const eg=c.createGain();eg.connect(bus);
      eg.gain.setValueAtTime(0,when);
      eg.gain.linearRampToValueAtTime(peak*.7,when+L*.35);
      eg.gain.exponentialRampToValueAtTime(.0001,when+L*.95);
      src.connect(bp).connect(eg);src.start(when);src.stop(when+L+.05);
      click(when+L*.82,.035,B*3,B*1.4,2.5,peak*.8);              // the flick as it lands
      return;
    }
    if(v.skeu==='latch'){
      // approach, then the catch
      click(when,.015,B*.5,B*.35,3,peak*.4);
      click(when+.085,.03,B,B*.55,8,peak);
      ring(when+.085,.22,880,peak*.35);
      body(when+.085,.07,170,peak*.45);
      return;
    }
    if(v.skeu==='coin'){
      // it lands, rings, and bounces twice, closer each time
      click(when,.02,B,B*.6,9,peak*.8);
      ring(when,.7,1850,peak*.9);
      ring(when+.11,.42,1850,peak*.4);
      ring(when+.175,.3,1850,peak*.18);
      return;
    }
    if(v.skeu==='knock'){
      // knuckle on wood: almost all body, very little edge
      click(when,.012,B*3,B*1.6,2,peak*.5);
      body(when,.09,B*.42,peak);
      body(when+.004,.06,B*.62,peak*.45);
      return;
    }
    if(v.skeu==='switch'){
      click(when,.018,B,B*.7,6,peak);                 // the detent
      body(when+.002,.045,190,peak*.45);
      if(long)click(when+ev.dur*.75,.02,B*.85,B*.6,6,peak*.6);   // the return
      return;
    }
    // card: a swipe, so it sweeps rather than clicks
    const L=Math.max(.16,ev.dur);
    const src=c.createBufferSource();src.buffer=noiseBuf(c);
    const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=.9;
    bp.frequency.setValueAtTime(Math.min(18000,B*2.4*bsk),when);
    bp.frequency.exponentialRampToValueAtTime(Math.max(60,B*.45*bsk),when+L);
    const eg=c.createGain();eg.connect(bus);
    eg.gain.setValueAtTime(0,when);
    eg.gain.linearRampToValueAtTime(peak,when+L*.18);
    eg.gain.exponentialRampToValueAtTime(.0001,when+L*1.05);
    src.connect(bp).connect(eg);src.start(when);src.stop(when+L+.05);
    body(when+L*.85,.08,120,peak*.3);                 // it lands
    return;
  }

  switch(ev.type){
    case 'tick':{const L=.06*v.dec+.03;env(.002,L);tone(B*1.5,B*1.5/(v.bend||1.25),L,v.wave||'sine');noise(B*4,B*3,L*.5);break}
    case 'hit':{const L=.25*v.dec;env(.003,L);tone(B*.5,B*.25,L,'triangle',v.tone+.2);noise(B*2,B*.8,L*.6,v.noise+.2,1);break}
    case 'land':{const L=.12*v.dec;env(.004,L);tone(B*.75,B*.6,L,'sine');noise(B*1.5,B,L*.5,v.noise*.6);break}
    case 'whoosh':{const L=Math.max(.15,ev.dur);g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(peak,when+L*.55);g.gain.exponentialRampToValueAtTime(.0001,when+L);noise(B*.6,B*3.5,L,Math.max(.5,v.noise),Math.max(.8,v.q*.3));tone(B*.5,B,L,'sine',v.tone*.25);break}
    case 'cut':{   // a cut is an edit, not a movement: a short bright edge, no body
      const L=.09*v.dec+.04;env(.0015,L);
      noise(B*6,B*2,L,Math.max(.6,v.noise),Math.max(1,v.q*.5));
      tone(B*2,B*1.2,L*.5,v.wave||'triangle',v.tone*.5);break}
    case 'rise':{   // grows toward its end and lands: pitch and brightness climb together
      const L=Math.max(.25,ev.dur);
      g.gain.setValueAtTime(0,when);
      g.gain.linearRampToValueAtTime(peak*.25,when+L*.5);
      g.gain.linearRampToValueAtTime(peak,when+L*.92);      // the arrival is the point
      g.gain.exponentialRampToValueAtTime(.0001,when+L+.12);
      tone(B*.6,B*1.5,L,v.wave||'triangle',Math.max(.35,v.tone));
      noise(B,B*5,L,Math.max(.35,v.noise*.8),Math.max(.7,v.q*.4));
      break}
    case 'decay':{  // arrives at once and falls away: the opposite envelope
      const L=Math.max(.25,ev.dur);
      g.gain.setValueAtTime(0,when);
      g.gain.linearRampToValueAtTime(peak,when+.012);
      g.gain.exponentialRampToValueAtTime(.0001,when+L*1.1);
      tone(B*1.3,B*.55,L*1.1,v.wave||'sine',Math.max(.4,v.tone));
      noise(B*3,B*.7,L*.8,Math.max(.3,v.noise*.7),Math.max(.8,v.q*.5));
      break}
    case 'pulse':{  // one gesture that happens to repeat, not N identical ticks
      const reps=Math.min(8,Math.max(2,ev.reps||3));
      const gap=Math.max(.04,ev.spacing||(ev.dur/reps));
      for(let k=0;k<reps;k++){
        const t=when+k*gap, L=.05*v.dec+.025, fall=1-k/(reps*1.6);   // it decays as it repeats
        const og=c.createGain();og.connect(bus);
        og.gain.setValueAtTime(0,t);
        og.gain.linearRampToValueAtTime(peak*.8*fall,t+.002);
        og.gain.exponentialRampToValueAtTime(.0001,t+L);
        if(toneMul<=0.001){const ns=c.createBufferSource();ns.buffer=noiseBuf(c);const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=Math.max(1,v.q);bp.frequency.value=B*1.5*(1+k*.03);ns.connect(bp).connect(og);ns.start(t);ns.stop(t+L+.03);continue}
        const o=c.createOscillator();o.type=v.wave||'sine';
        o.frequency.setValueAtTime(B*1.5*(1+k*.03),t);        // each repeat a touch higher
        o.connect(og);o.start(t);o.stop(t+L+.03);
      }
      break}
    case 'enter':{  // upward motif: "starting, openness, positivity"
      const L=Math.max(.2,ev.dur);
      env(.01,L);
      tone(B*.85,B*1.335,L*.9,v.wave||'sine',Math.max(.5,v.tone));   // up a fourth
      tone(B*1.7,B*2.67,L*.6,'sine',v.tone*.3);
      noise(B,B*2.6,L*.5,v.noise*.5,Math.max(.8,v.q));break}
    case 'depart':{ // downward motif: "ending or closedness"
      const L=Math.max(.2,ev.dur);
      env(.008,L);
      tone(B*1.335,B*.85,L*.9,v.wave||'sine',Math.max(.5,v.tone));   // the same interval, reversed
      tone(B*2.67,B*1.7,L*.6,'sine',v.tone*.3);
      noise(B*2.6,B,L*.5,v.noise*.5,Math.max(.8,v.q));break}
    case 'wait':{   // repetition motif: "thinking, waiting, or lack of progress"
      const reps=Math.min(8,Math.max(3,ev.reps||4));
      const gap=Math.max(.09,ev.spacing||(ev.dur/reps));
      for(let k=0;k<reps;k++){
        const t=when+k*gap,L=.12*v.dec;
        const og=c.createGain();og.connect(bus);
        og.gain.setValueAtTime(0,t);og.gain.linearRampToValueAtTime(peak*.55,t+.02);
        og.gain.exponentialRampToValueAtTime(.0001,t+L);
        if(toneMul<=0.001){const ns=c.createBufferSource();ns.buffer=noiseBuf(c);const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=Math.max(2,v.q);bp.frequency.value=B;ns.connect(bp).connect(og);ns.start(t);ns.stop(t+L+.03);continue}
        const o=c.createOscillator();o.type=v.wave||'sine';
        o.frequency.setValueAtTime(B,t);                 // no resolution: the same note, waiting
        o.connect(og);o.start(t);o.stop(t+L+.03);
      }
      break}
    case 'swell':{   // a crossfade has no transient: it arrives and it leaves
      const L=Math.max(.35,ev.dur);
      g.gain.setValueAtTime(0,when);
      g.gain.linearRampToValueAtTime(peak*.85,when+L*.55);      // slow in
      g.gain.linearRampToValueAtTime(peak*.5,when+L*.8);
      g.gain.exponentialRampToValueAtTime(.0001,when+L*1.15);   // slow out
      tone(B,B*1.12,L*1.15,v.wave||'sine',Math.max(.45,v.tone));
      tone(B*1.5,B*1.68,L*1.15,'sine',v.tone*.3);
      noise(B*1.2,B*2.2,L*1.15,Math.max(.2,v.noise*.5),Math.max(.6,v.q*.4));break}
    case 'morph':{const L=Math.max(.2,ev.dur);g.gain.setValueAtTime(0,when);g.gain.linearRampToValueAtTime(peak*.8,when+L*.4);g.gain.linearRampToValueAtTime(peak*.6,when+L*.8);g.gain.exponentialRampToValueAtTime(.0001,when+L);tone(B*.8,B*1.26,L,'sine');tone(B*1.2,B*1.5,L,'triangle',v.tone*.4);noise(B,B*2,L,v.noise*.4,v.q);break}
  }
}
