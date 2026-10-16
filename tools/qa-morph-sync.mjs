// Morph/reveal sync: stage->reveal, first heromorph:t, t>=0.12, first data-in. Usage: node tools/qa-morph-sync.mjs URL [runs]  (env CPU=6, DELAY=600 ms on morph modules)
import { chromium } from "playwright";
const URL = process.argv[2], RUNS = +(process.argv[3]||3);
const browser = await chromium.launch({ channel: "chromium", args: ["--use-angle=metal","--enable-gpu","--ignore-gpu-blocklist"] });
for (let r=0;r<RUNS;r++){
  const ctx = await browser.newContext({ viewport:{width:1440,height:900} });
  const p = await ctx.newPage();
  await p.addInitScript(()=>{
    const L = window.__tl = {};
    const mk=(k)=>{ if(!(k in L)) L[k]=Math.round(performance.now()); };
    window.addEventListener("heromorph:t",(e)=>{ mk("t_first"); if(e.detail>0.001) mk("t_gt0"); if(e.detail>=0.12) mk("t_0.12"); if(e.detail>=1) mk("t_1"); });
    const mo = new MutationObserver((ms)=>{ for(const m of ms){ const el=m.target;
      if(m.attributeName==="data-stage" && el.dataset.stage==="reveal") mk("stage_reveal");
      if(m.attributeName==="data-in") mk("first_data_in"); } });
    const go=()=>{ mo.observe(document,{subtree:true,attributes:true,attributeFilter:["data-stage","data-in"]}); };
    go();
  });
  const c=await ctx.newCDPSession(p); await c.send("Emulation.setCPUThrottlingRate",{rate:+(process.env.CPU||1)}); if(process.env.NET) await c.send("Network.emulateNetworkConditions",{offline:false,latency:200,downloadThroughput:1.5e6/8,uploadThroughput:1e6/8});
  if(process.env.DELAY) await p.route(/faces\/morph\/|three/, async(r)=>{await new Promise(k=>setTimeout(k,+process.env.DELAY)); r.continue();});
  await p.goto(URL,{waitUntil:"domcontentloaded"});
  await p.waitForTimeout(+(process.env.WAIT||14000));
  console.log(r, JSON.stringify(await p.evaluate(()=>window.__tl)));
  await ctx.close();
}
await browser.close();
