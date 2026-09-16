import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport:{width:1440,height:820} });
await p.goto('http://localhost:3001/', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(3500);
const inputs = await p.evaluate(()=>[...document.querySelectorAll('input')].map(i=>({type:i.type,ph:i.placeholder,name:i.name})));
console.log('inputs:',JSON.stringify(inputs));
// fill by placeholder
await p.getByPlaceholder(/user/i).fill('admin').catch(e=>console.log('u:',e.message));
await p.getByPlaceholder(/pass/i).fill('admin123').catch(e=>console.log('p:',e.message));
await p.getByRole('button',{name:/sign in/i}).click().catch(e=>console.log('btn:',e.message));
await p.waitForTimeout(3000);
const after = await p.evaluate(()=>({txt:(document.body.innerText||'').slice(0,200), rootKids:document.getElementById('root')?.children.length}));
console.log('after:',JSON.stringify(after));
await b.close();
