import { chromium } from "playwright-core";
const [url]=process.argv.slice(2);
const b=await chromium.launch({channel:"chrome"});const p=await (await b.newContext({viewport:{width:1440,height:900}})).newPage();
await p.goto(url,{waitUntil:"load"});await p.waitForTimeout(3000);
const r=await p.evaluate(()=>[...document.querySelectorAll("video,img")].map(e=>{const r=e.getBoundingClientRect();return [e.tagName,(e.currentSrc||e.src||"").split("/").slice(-2).join("/"),e.getAttribute("loading")||e.getAttribute("preload")||"-",e.decoding||"-",Math.round(r.top+scrollY),Math.round(r.width)+"x"+Math.round(r.height),e.naturalWidth||e.videoWidth||0]}));
console.log(r.filter(x=>x[1]).map(x=>x.join("\t")).join("\n"));await b.close();
