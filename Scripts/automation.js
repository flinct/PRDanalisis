'use strict';
// ─── Automation config + auto-mapping (Playwright / sixV2Automation) ─────────
const fs   = require('fs');
const path = require('path');

function cfgPath(BASE) { return path.join(BASE, 'automation-config.json'); }

// { automationRoot } — env AUTOMATION_ROOT, overridable via the dashboard config file.
function getConfig(BASE) {
  let automationRoot = process.env.AUTOMATION_ROOT || '';
  try {
    const j = JSON.parse(fs.readFileSync(cfgPath(BASE), 'utf8'));
    if (j && typeof j.automationRoot === 'string' && j.automationRoot) automationRoot = j.automationRoot;
  } catch {}
  // Resolve relative paths (e.g. "..\sixV2Automation") against the PRDanalisis folder.
  const resolved = automationRoot ? path.resolve(BASE, automationRoot) : '';
  const exists   = !!resolved && fs.existsSync(resolved);
  return { automationRoot, resolved, exists };
}

function setConfig(BASE, { automationRoot }) {
  fs.writeFileSync(cfgPath(BASE), JSON.stringify({ automationRoot: automationRoot || '' }, null, 2));
  return getConfig(BASE);
}

// Build test_id → { spec_file, grep } from every *-automation-map.generated.json
// manifest under <root>/playwright/support/config.
function buildManifestMap(automationRoot) {
  const out = {};
  if (!automationRoot) return out;
  const dir = path.join(automationRoot, 'playwright', 'support', 'config');
  let files = [];
  try { files = fs.readdirSync(dir).filter(f => /-automation-map\.generated\.json$/i.test(f)); } catch { return out; }
  for (const f of files) {
    try {
      const j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
      const items = Array.isArray(j) ? j : (j.items || []);
      for (const it of items) {
        if (!it || !it.test_id) continue;
        // Manifest's automation_bucket sometimes points to a file where the scenario's
        // describe doesn't actually live. So map to the DOMAIN DIRECTORY and let --grep
        // (the scenario title) locate the test in whichever spec it resides.
        let spec_file = '';
        if (it.automation_bucket) {
          const b = String(it.automation_bucket).replace(/^\/+/, '');
          const domain = b.split('/')[0]; // e.g. "conversation"
          spec_file = 'playwright/tests/e2e/' + (domain || b);
        }
        out[it.test_id] = {
          spec_file,
          grep: it.scenario || it.feature_group || '',
          developed: it.developed !== false && !it.undeveloped_label,
        };
      }
    } catch {}
  }
  return out;
}

// Scan spec files for [TEST-ID] tags in test titles → { test_id: relativeSpecPath }.
// This is the most reliable mapping: it points to the EXACT spec file that contains
// the test, so we can run just that file + --grep by id (fast, precise).
function buildSpecIndex(root) {
  const idx = {};
  if (!root) return idx;
  const base = path.join(root, 'playwright', 'tests');
  const RE = /\[([A-Za-z0-9]+-[A-Za-z0-9]+-\d+)\]/g;
  (function walk(dir) {
    let ents; try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.spec\.[jt]s$/i.test(e.name)) {
        let txt; try { txt = fs.readFileSync(full, 'utf8'); } catch { continue; }
        let m; RE.lastIndex = 0;
        while ((m = RE.exec(txt))) { const id = m[1]; if (!idx[id]) idx[id] = path.relative(root, full).replace(/\\/g, '/'); }
      }
    }
  })(base);
  return idx;
}

module.exports = { cfgPath, getConfig, setConfig, buildManifestMap, buildSpecIndex };
