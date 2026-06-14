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
        const bucket = it.automation_bucket
          ? 'playwright/tests/e2e/' + String(it.automation_bucket).replace(/^\/+/, '')
          : '';
        out[it.test_id] = {
          spec_file: bucket,
          grep: it.scenario || it.feature_group || '',
          developed: it.developed !== false && !it.undeveloped_label,
        };
      }
    } catch {}
  }
  return out;
}

module.exports = { cfgPath, getConfig, setConfig, buildManifestMap };
