import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 820 } });
await p.goto('http://localhost:3001/', { waitUntil: 'domcontentloaded' });
await p.waitForTimeout(3500);
const ins = await p.$$('input');
await ins[0].fill('admin'); await ins[1].fill('admin123');
await p.getByRole('button', { name: /sign in/i }).click();
await p.waitForTimeout(2500);
await p.getByText('Roadmap', { exact: true }).first().click();
await p.waitForTimeout(2000);
try { await p.waitForSelector('.rm-trigger', { timeout: 5000 }); } catch {}

// click FIRST visible trigger (should be in the top portion → opens below)
await p.evaluate(() => {
  const el = document.querySelector('.rm-trigger');
  el.scrollIntoView({ block: 'center' });
  el.click();
});
await p.waitForTimeout(800);

const info = await p.evaluate(() => {
  const m = document.querySelector('.rm-menu');
  if (!m) return { menu: null };
  const cs = getComputedStyle(m);
  const r = m.getBoundingClientRect();
  return {
    cssText: m.style.cssText,
    rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
    visible: r.top >= 0 && r.bottom <= window.innerHeight,
    optCount: m.querySelectorAll('.rm-opt').length,
  };
});
console.log('below-case:', JSON.stringify(info, null, 2));
await b.close();
