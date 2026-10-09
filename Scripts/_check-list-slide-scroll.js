'use strict';
// Probe: List Task slide must not double-scroll. slide-body fits the viewport (no
// right scrollbar) and only the list wrapper scrolls. Extracts the real <style> block
// from buildSlideshowHtml's template and renders the real card DOM shape (3 children,
// long list with inline max-height:80vh;overflow:auto).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const src = fs.readFileSync(path.join(__dirname, '..', 'Test', 'modules', 'ui-tracker.js'), 'utf8');
const m = src.match(/return `<!doctype html>[\s\S]*?<style>\r?\n([\s\S]*?)<\/style>/);
if (!m) throw new Error('style block not found in buildSlideshowHtml template');
const css = m[1].replace(/\$\{[^}]*\}/g, '0'); // ponytail: only :root ${vars} interpolates here
if (!css.includes('.slide-solo')) throw new Error('.slide-solo rules missing from generated CSS');
if (!src.includes("slide${s.solo ? ' slide-solo' : ''}")) throw new Error('slide-solo class wiring missing from builder');

const rows = Array.from({ length: 40 }, (_, i) => `<tr><td style="height:56px">Task ${i}</td></tr>`).join('');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head>
<body><div class="deck">
<section class="slide active slide-solo" data-idx="0">
  <div class="slide-head"><div class="slide-title"><strong>Keseluruhan</strong> · List Task</div></div>
  <div class="slide-body">
    <div data-slide-part="task-list" style="padding:16px;margin-top:16px;border:1px solid">
      <div style="height:28px">Task List</div>
      <div style="height:100px;margin-bottom:16px">KPI</div>
      <div style="max-height:80vh;overflow:auto"><table style="width:100%">${rows}</table></div>
    </div>
  </div>
</section></div></body></html>`;

(async () => {
  let browser;
  try {
    browser = await chromium.launch();
  } catch (err) {
    console.warn('PROBE SKIP: chromium not available —', err.message.split('\n')[0]);
    process.exit(0);
  }
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.setContent(html);
  const r = await page.evaluate(() => {
    const body = document.querySelector('.slide-body');
    const card = document.querySelector('[data-slide-part="task-list"]');
    const list = card.querySelector(':scope > :last-child');
    const header = card.querySelector(':scope > :first-child');
    const headerBefore = header.getBoundingClientRect().top;
    list.scrollTop = 400; // scroll the list — header must not move
    const headerMoved = header.getBoundingClientRect().top - headerBefore;
    return {
      bodyOverflow: body.scrollHeight - body.clientHeight,
      bodyOverflowCss: getComputedStyle(body).overflow,
      listScrollable: list.scrollHeight - list.clientHeight,
      headerMoved,
    };
  });
  await browser.close();
  if (r.bodyOverflowCss !== 'hidden') throw new Error(`slide-body overflow=${r.bodyOverflowCss} (expected hidden)`);
  if (r.bodyOverflow > 0) throw new Error(`slide-body overflows by ${r.bodyOverflow}px (outer scrollbar returns)`);
  if (r.listScrollable <= 0) throw new Error('list wrapper is not scrollable');
  if (r.headerMoved !== 0) throw new Error(`card header moved ${r.headerMoved}px while list scrolled (header must stay fixed)`);
  console.log('LIST-SLIDE SCROLL PROBE PASS', r);
})().catch(err => { console.error('PROBE FAIL:', err.message); process.exit(1); });
