import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 820 } });
const errs=[]; p.on('pageerror',e=>errs.push('PE:'+e.message)); p.on('console',m=>{if(m.type()==='error')errs.push('CE:'+m.text());});
await p.goto('http://localhost:3001/', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(4000);
const s = await p.evaluate(()=>({
  rootChildren: document.getElementById('root')?.children.length,
  bodyText: (document.body.innerText||'').slice(0,400),
  navLabels: [...document.querySelectorAll('nav *,aside *,[class*=nav] *,[class*=side] *')].map(e=>e.textContent.trim()).filter(t=>t&&t.length<24).slice(0,40),
}));
console.log('errors:',JSON.stringify(errs.slice(0,10)));
console.log(JSON.stringify(s,null,2));
await b.close();
