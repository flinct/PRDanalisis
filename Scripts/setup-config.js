'use strict';
// ─── Setup config + Rules/Memory management ─────────────────────────────────
// Phase 3.0: workflow schema v2 (graph) + hybrid runtime summary.
// Storage layout (Opsi C):
//   Setup/
//     ├── manifest.yaml
//     ├── rules-config.yaml
//     ├── agents.yaml
//     ├── workflows.yaml        (workflow-v2 graph)
//     ├── pointers.yaml
//     ├── runtime.md            (compiled setup summary)
//     └── .backups/

const fs   = require('fs');
const path = require('path');
const crypto = require('crypto');
const yaml = require('js-yaml');

const TEMPLATE_DIR_REL = path.join('Assessments', 'templates', 'Setup');
const LEGACY_MARKERS = new Set(['change_intake','prd_v0','quick_assessment','qa_pre','qa_post']);
const GRAPH_NODE_TYPES = new Set(['trigger','agent','marker','gate']);
const ATTACHMENT_KINDS = new Set(['rule','memory','reference','tool']);

function setupDir(BASE)   { return path.join(BASE, 'Setup'); }
function backupsDir(BASE) { return path.join(setupDir(BASE), '.backups'); }
function rulesDir(BASE)   { return path.join(BASE, 'Rules'); }
function memoryDir(BASE)  { return path.join(BASE, 'Memory'); }
function refsDir(BASE)    { return path.join(BASE, 'Assessments', 'reference'); }

function setupPaths(BASE) {
  const d = setupDir(BASE);
  return {
    dir:       d,
    manifest:  path.join(d, 'manifest.yaml'),
    rules:     path.join(d, 'rules-config.yaml'),
    agents:    path.join(d, 'agents.yaml'),
    workflows: path.join(d, 'workflows.yaml'),
    pointers:  path.join(d, 'pointers.yaml'),
    runtime:   path.join(d, 'runtime.md'),
    backups:   backupsDir(BASE),
  };
}

function templatePaths(BASE) {
  const d = path.join(BASE, TEMPLATE_DIR_REL);
  return {
    dir:       d,
    manifest:  path.join(d, 'setup-manifest.example.yaml'),
    rules:     path.join(d, 'rules-config.example.yaml'),
    agents:    path.join(d, 'agents.example.yaml'),
    workflows: path.join(d, 'workflows.example.yaml'),
    runtime:   path.join(d, 'runtime.example.md'),
  };
}

function sha(s) { return crypto.createHash('sha256').update(String(s)).digest('hex').slice(0, 16); }
function readFileSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }
function writeFileAtomic(p, content) {
  const dir = path.dirname(p);
  fs.mkdirSync(dir, { recursive: true });
  const tmp = p + '.tmp-' + Date.now();
  fs.writeFileSync(tmp, content, 'utf8');
  fs.renameSync(tmp, p);
}
function parseYaml(text, fallback) {
  if (text == null) return fallback;
  try { return yaml.load(text) ?? fallback; }
  catch { return fallback; }
}
function dumpYaml(obj) { return yaml.dump(obj || {}, { lineWidth: 120, noRefs: true, sortKeys: false }); }

function listMd(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  (function walk(d, base) {
    let ents; try { ents = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }
    for (const e of ents) {
      if (e.name.startsWith('.')) continue;
      const full = path.join(d, e.name);
      const rel  = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) walk(full, rel);
      else if (/\.md$/i.test(e.name)) {
        const st = fs.statSync(full);
        out.push({ relPath: rel, name: e.name, size: st.size, mtime: st.mtimeMs });
      }
    }
  })(dir, '');
  return out.sort((a,b) => a.relPath.localeCompare(b.relPath));
}

function setupExists(BASE) {
  const P = setupPaths(BASE);
  return fs.existsSync(P.manifest) || fs.existsSync(P.agents) || fs.existsSync(P.workflows);
}

function readSetup(BASE) {
  const P = setupPaths(BASE);
  const raw = {
    manifest:  readFileSafe(P.manifest),
    rules:     readFileSafe(P.rules),
    agents:    readFileSafe(P.agents),
    workflows: readFileSafe(P.workflows),
    pointers:  readFileSafe(P.pointers),
    runtime:   readFileSafe(P.runtime) || '',
  };
  const exists = setupExists(BASE);
  return {
    exists,
    parsed: {
      manifest:  parseYaml(raw.manifest,  null),
      rules:     parseYaml(raw.rules,     null),
      agents:    parseYaml(raw.agents,    null),
      workflows: parseYaml(raw.workflows, null),
      pointers:  parseYaml(raw.pointers,  null),
    },
    raw,
    runtime: raw.runtime,
    hash: sha([raw.manifest, raw.rules, raw.agents, raw.workflows, raw.pointers].join('|')),
  };
}

function initSetup(BASE, { force = false } = {}) {
  const P = setupPaths(BASE);
  const T = templatePaths(BASE);
  if (setupExists(BASE) && !force) return { created: false, reason: 'Setup already exists' };
  fs.mkdirSync(P.dir, { recursive: true });
  const pairs = [[T.manifest,P.manifest],[T.rules,P.rules],[T.agents,P.agents],[T.workflows,P.workflows],[T.runtime,P.runtime]];
  for (const [src, dst] of pairs) {
    const t = readFileSafe(src);
    if (t != null) writeFileAtomic(dst, t);
  }
  if (!fs.existsSync(P.pointers)) {
    const def = {
      version: 1,
      description: 'Daftar Rules/*, Memory/*, dan Assessments/reference/* yang aktif untuk setup ini. Dibaca oleh runtime.md.',
      active_rules: listMd(rulesDir(BASE)).map(f => 'Rules/' + f.relPath),
      active_memory: listMd(memoryDir(BASE)).map(f => 'Memory/' + f.relPath),
      active_references: listMd(refsDir(BASE)).map(f => 'Assessments/reference/' + f.relPath),
    };
    writeFileAtomic(P.pointers, dumpYaml(def));
  }
  return { created: true };
}

function agentMap(agents) {
  return new Map((agents?.agents || []).filter(a => a && a.id).map(a => [a.id, a]));
}

function workflowModeUsesPhaseZero(mode) {
  if (!mode) return false;
  if (Array.isArray(mode.steps)) return mode.steps.includes('change_intake');
  return (mode.nodes || []).some(n => n?.type === 'marker' && n?.ref === 'change_intake');
}

function isWorkflowGraph(workflows, modeName) {
  const mode = workflows?.modes?.[modeName];
  return !!(mode && Array.isArray(mode.nodes) && Array.isArray(mode.edges));
}

function getAllowedGateLabels(rules, gateRef) {
  return rules?.gates?.[gateRef]?.allowed_statuses || [];
}

function validateAttachment(att, push, nodeId) {
  if (!att || typeof att !== 'object') return push('error', `attachment di node ${nodeId} harus object`);
  if (!ATTACHMENT_KINDS.has(att.kind)) push('error', `attachment kind invalid di node ${nodeId}: ${att.kind}`);
  if (att.kind === 'tool') {
    if (!att.id) push('error', `attachment tool di node ${nodeId} wajib punya id`);
  } else {
    if (!att.path) push('error', `attachment ${att.kind} di node ${nodeId} wajib punya path`);
  }
}

function validateGraphMode(modeName, mode, rules, agentsById, push) {
  const nodes = Array.isArray(mode.nodes) ? mode.nodes : [];
  const edges = Array.isArray(mode.edges) ? mode.edges : [];
  if (!nodes.length) push('error', `${modeName}.nodes kosong`);
  if (!edges.length) push('warning', `${modeName}.edges kosong`);

  const nodeMap = new Map();
  const edgeLabelsByGate = new Map();
  for (const n of nodes) {
    if (!n.id) { push('error', `${modeName}.node tanpa id`); continue; }
    if (nodeMap.has(n.id)) push('error', `${modeName}.node id duplikat: ${n.id}`);
    nodeMap.set(n.id, n);
    if (!GRAPH_NODE_TYPES.has(n.type)) push('error', `${modeName}.node ${n.id} type invalid: ${n.type}`);
    if (n.type === 'agent') {
      if (!n.ref || !agentsById.has(n.ref)) push('error', `${modeName}.node ${n.id} ref agent tidak ada: ${n.ref}`);
      for (const att of (n.attachments || [])) validateAttachment(att, push, n.id);
    } else if ((n.attachments || []).length) {
      push('error', `${modeName}.node ${n.id} hanya agent yang boleh punya attachments`);
    }
    if (n.type === 'marker' && !n.ref) push('error', `${modeName}.node marker ${n.id} wajib punya ref`);
    if (n.type === 'gate') {
      if (!n.ref || !rules?.gates?.[n.ref]) push('error', `${modeName}.node gate ${n.id} ref gate tidak ada: ${n.ref}`);
    }
    if (n.position && (typeof n.position.x !== 'number' || typeof n.position.y !== 'number')) {
      push('error', `${modeName}.node ${n.id} position harus number x/y`);
    }
  }

  const triggers = nodes.filter(n => n.type === 'trigger');
  if (triggers.length !== 1) push('error', `${modeName} wajib punya tepat 1 trigger node`);

  const inDeg = new Map(nodes.map(n => [n.id, 0]));
  const outDeg = new Map(nodes.map(n => [n.id, 0]));
  for (const e of edges) {
    if (!e?.from || !e?.to) { push('error', `${modeName}.edge wajib punya from/to`); continue; }
    if (!nodeMap.has(e.from)) push('error', `${modeName}.edge from tidak ada: ${e.from}`);
    if (!nodeMap.has(e.to))   push('error', `${modeName}.edge to tidak ada: ${e.to}`);
    if (!nodeMap.has(e.from) || !nodeMap.has(e.to)) continue;
    inDeg.set(e.to, (inDeg.get(e.to) || 0) + 1);
    outDeg.set(e.from, (outDeg.get(e.from) || 0) + 1);
    const src = nodeMap.get(e.from);
    if (src.type === 'gate') {
      const labels = edgeLabelsByGate.get(src.id) || new Set();
      if (!e.label) push('error', `${modeName}.edge dari gate ${src.id} wajib punya label`);
      else labels.add(e.label);
      edgeLabelsByGate.set(src.id, labels);
    } else if (e.label) {
      push('warning', `${modeName}.edge ${e.from}→${e.to} punya label padahal source bukan gate`);
    }
  }

  for (const n of nodes) {
    if (n.type !== 'trigger' && (inDeg.get(n.id) || 0) === 0) push('warning', `${modeName}.node orphan tanpa incoming: ${n.id}`);
    if (n.type !== 'gate' && (outDeg.get(n.id) || 0) === 0) push('warning', `${modeName}.node terminal tanpa outgoing: ${n.id}`);
  }

  for (const n of nodes.filter(n => n.type === 'gate')) {
    const allowed = new Set(getAllowedGateLabels(rules, n.ref));
    const seen = edgeLabelsByGate.get(n.id) || new Set();
    for (const label of seen) if (!allowed.has(label)) push('error', `${modeName}.gate ${n.id} edge label invalid: ${label}`);
  }

  const adjacency = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    if (!nodeMap.has(e.from) || !nodeMap.has(e.to)) continue;
    adjacency.get(e.from).push({ to: e.to, loop_back: !!e.loop_back });
  }
  const seen = new Set(), stack = new Set();
  function dfs(id) {
    seen.add(id); stack.add(id);
    for (const edge of adjacency.get(id) || []) {
      if (edge.loop_back) continue;
      if (!seen.has(edge.to)) dfs(edge.to);
      else if (stack.has(edge.to)) push('error', `${modeName} cycle terdeteksi tanpa loop_back flag: ${id} → ${edge.to}`);
    }
    stack.delete(id);
  }
  if (triggers[0]?.id) dfs(triggers[0].id);
}

function validateLegacyMode(modeName, mode, ids, push) {
  const gates = mode.gates || {};
  if (modeName === 'full_lane') {
    for (const g of ['gate_a','gate_b','gate_c']) if (!gates[g]) push('error', `full_lane wajib punya ${g}`);
  }
  for (const step of (mode.steps || [])) {
    if (step.startsWith('reviewer_gate_')) continue;
    if (LEGACY_MARKERS.has(step)) continue;
    if (!ids.has(step)) push('error', `step "${step}" di ${modeName}.steps tidak ada di agents.yaml`);
  }
  if (mode.freeze && mode.freeze.enabled && !mode.freeze.starts_after) push('error', `${modeName}.freeze.enabled=true tapi starts_after kosong`);
}

function validateSetup(bundle) {
  const errors = [], warnings = [];
  const { rules, agents, workflows } = bundle || {};
  const push = (sev, msg) => (sev === 'error' ? errors : warnings).push(msg);
  if (!rules) push('error', 'rules-config kosong / parse error');
  if (!agents) push('error', 'agents kosong / parse error');
  if (!workflows) push('error', 'workflows kosong / parse error');
  if (errors.length) return { ok: false, errors, warnings };

  const ids = new Set();
  for (const a of (agents.agents || [])) {
    if (!a.id) push('error', 'agent tanpa id');
    else if (ids.has(a.id)) push('error', `agent_id duplikat: ${a.id}`);
    else ids.add(a.id);
  }
  for (const a of (agents.agents || [])) {
    if (a.can_approve_gate && a.role_type !== 'gatekeeper') push('warning', `agent ${a.id} can_approve_gate=true tapi role_type ≠ gatekeeper`);
  }

  const modes = workflows.modes || {};
  const agentsById = agentMap(agents);
  for (const [modeName, mode] of Object.entries(modes)) {
    if (Array.isArray(mode.nodes) && Array.isArray(mode.edges)) validateGraphMode(modeName, mode, rules, agentsById, push);
    else validateLegacyMode(modeName, mode, ids, push);
  }

  for (const [task, target] of Object.entries(workflows.routing?.task_type_to_mode || {})) {
    if (!modes[target]) push('error', `routing task ${task} → mode "${target}" tidak ada`);
  }
  const ruleGates = rules.gates || {};
  if (rules.freeze_policy?.enabled && !ruleGates[rules.freeze_policy.trigger_gate]) push('error', `freeze_policy.trigger_gate "${rules.freeze_policy.trigger_gate}" tidak ada di rules.gates`);
  const hasOrch = (agents.agents || []).some(a => a.role_type === 'controller');
  const hasRev  = (agents.agents || []).some(a => a.can_approve_gate);
  if (!hasOrch) push('warning', 'tidak ada agent role_type=controller (orchestrator)');
  if (!hasRev)  push('warning', 'tidak ada agent dengan can_approve_gate=true (reviewer)');
  return { ok: errors.length === 0, errors, warnings };
}

function formatNodeLabel(node, agentsById) {
  if (node.type === 'agent') return node.label || agentsById.get(node.ref)?.label || node.ref || node.id;
  return node.label || node.ref || node.id;
}

function graphBundle(mode, rules, agentsById) {
  const nodes = Array.isArray(mode?.nodes) ? mode.nodes : [];
  const edges = Array.isArray(mode?.edges) ? mode.edges : [];
  const nodeMap = new Map(nodes.map(n => [n.id, n]));
  const trigger = nodes.find(n => n.type === 'trigger');
  const attachmentsByAgent = [];
  for (const node of nodes.filter(n => n.type === 'agent' && Array.isArray(n.attachments) && n.attachments.length)) {
    attachmentsByAgent.push({
      id: node.id,
      ref: node.ref,
      label: formatNodeLabel(node, agentsById),
      attachments: node.attachments,
    });
  }
  const nodeTable = nodes.map(n => `| ${n.id} | ${n.type} | ${n.ref || '—'} | ${formatNodeLabel(n, agentsById)} |`).join('\n') || '| (none) | | | |';

  const groupedGateEdges = new Map();
  const plainRoutes = [];
  const terminals = [];
  for (const e of edges) {
    const src = nodeMap.get(e.from);
    const dst = nodeMap.get(e.to);
    if (!src || !dst) continue;
    if (src.type === 'gate') {
      const list = groupedGateEdges.get(src.id) || [];
      list.push({ ...e, dstLabel: formatNodeLabel(dst, agentsById) });
      groupedGateEdges.set(src.id, list);
    } else {
      plainRoutes.push(`- ${e.from} → ${e.to}`);
    }
  }
  for (const n of nodes.filter(n => n.type === 'gate')) {
    const allowed = getAllowedGateLabels(rules, n.ref);
    const routes = groupedGateEdges.get(n.id) || [];
    const used = new Set(routes.map(r => r.label));
    const lines = routes.map(r => `  - ${r.label} → ${r.to}${r.loop_back ? ' (loop_back)' : ''}`);
    for (const label of allowed) if (!used.has(label)) { lines.push(`  - ${label} → terminal`); terminals.push(`- ${n.id} / ${label}`); }
    if (lines.length) plainRoutes.push(`- ${n.id}:\n${lines.join('\n')}`);
  }
  return {
    hasPhaseZero: workflowModeUsesPhaseZero(mode),
    entry: trigger ? `- ${trigger.id} → ${(edges.find(e => e.from === trigger.id)?.to) || '(none)'}` : '- (none)',
    nodeTable,
    routes: plainRoutes.join('\n') || '- (none)',
    terminals: terminals.join('\n') || '- (none)',
    attachmentsByAgent,
  };
}

function legacyBundle(mode, rules, agentsById) {
  const steps = mode?.steps || [];
  const rows = [];
  const routes = [];
  const attachmentsByAgent = [];
  steps.forEach((step, i) => {
    const next = steps[i + 1];
    let type = 'marker', ref = step, label = step;
    if (step.startsWith('reviewer_gate_')) { type = 'gate'; ref = step.replace('reviewer_', ''); label = step; }
    else if (!LEGACY_MARKERS.has(step)) { type = 'agent'; label = agentsById.get(step)?.label || step; }
    rows.push(`| ${step}_${i+1} | ${type} | ${ref} | ${label} |`);
    if (next) routes.push(`- ${step}_${i+1} → ${next}_${i+2}`);
  });
  for (const a of (agentsById.values())) {
    if (Array.isArray(a.attachments) && a.attachments.length) attachmentsByAgent.push({ id: a.id, ref: a.id, label: a.label || a.id, attachments: a.attachments });
  }
  return {
    hasPhaseZero: workflowModeUsesPhaseZero(mode),
    entry: steps[0] ? `- ${steps[0]}_1 → ${(steps[1] ? `${steps[1]}_2` : '(none)')}` : '- (none)',
    nodeTable: rows.join('\n') || '| (none) | | | |',
    routes: routes.join('\n') || '- (none)',
    terminals: '- legacy linear workflow — terminal outputs not explicit',
    attachmentsByAgent,
  };
}

function compileRuntime(bundle) {
  const { manifest, rules, agents, workflows, pointers } = bundle || {};
  const modeName = manifest?.active?.workflow_mode || 'full_lane';
  const mode = workflows?.modes?.[modeName] || {};
  const wfId = manifest?.active?.workflow_id || mode.id || '(unknown)';
  const ruleProf = manifest?.active?.rule_profile || rules?.rule_profile || 'default';
  const rosterProf = manifest?.active?.roster_profile || agents?.roster_profile || 'default';
  const schema = Array.isArray(mode?.nodes) && Array.isArray(mode?.edges) ? 'workflow-v2 (graph)' : 'workflow-v1 (linear)';
  const roster = (agents?.agents || []).map(a => `- ${a.label || a.id}`).join('\n') || '- (kosong)';
  const gateLines = Object.entries(rules?.gates || {}).map(([gid, g]) => `### ${gid.replace('_',' ').toUpperCase()}\n\`${(g.allowed_statuses || []).join(' | ')}\``).join('\n\n');
  const changeIntakeArtifact = rules?.artifacts?.change_intake_brief;
  const canonical = [
    `- Logical analysis artifact name = **${rules?.artifacts?.analysis?.logical_name || 'Assessment Report'}**`,
    `- Persisted filename suffix may remain \`${rules?.artifacts?.analysis?.persisted_filename_suffix || '-qa-assessment.md'}\``,
    `- ${(rules?.artifacts?.analysis?.owner_default || 'analyst')} owns Assessment Report`,
    changeIntakeArtifact ? `- Phase 0 artifact: **${changeIntakeArtifact.logical_name || 'Change Intake Brief'}** (owner: ${changeIntakeArtifact.owner_default || 'analyst'}, suffix: \`${changeIntakeArtifact.persisted_filename_suffix || '-change-intake-brief.md'}\`)` : null,
    `- Reviewer gates active: ${Object.keys(rules?.gates || {}).map(g=>g.split('_')[1]?.toUpperCase()).filter(Boolean).join(' / ') || 'A / B / C'}`,
    rules?.freeze_policy?.enabled ? `- Requirement Package Freeze active after ${rules.freeze_policy.trigger_gate}` : '- Requirement Package Freeze: disabled',
    '- QA is split into pre-implementation and post-implementation phases',
  ].filter(Boolean).join('\n');
  const phaseZeroBlock = workflowModeUsesPhaseZero(mode)
    ? `\n## Phase 0 — Change Intake & Classification\n- Untuk request yang **menambah / mengubah / membuang / merevive** behavior produk, jalankan Phase 0 sebelum PRD ditulis.\n- Persist artifact **Change Intake Brief** di \`Assessments/<domain>/<feature-slug>/<feature-slug>-change-intake-brief.md\`.\n- Rule sumber: \`Rules/requirements-lifecycle-rule.md\`.\n- Routing decision dari Phase 0 menentukan rule downstream apa yang dimuat.\n`
    : '';
  const actRules = (pointers?.active_rules || []).map(p => `- ${p}`).join('\n') || '- (kosong)';
  const actMemory = (pointers?.active_memory || []).map(p => `- ${p}`).join('\n') || '- (kosong)';
  const actRefs = (pointers?.active_references || []).map(p => `- ${p}`).join('\n');
  const refBlock = actRefs ? `\n## Active Reference Analysis (load when relevant)\n${actRefs}\n` : '';
  const agentsById = agentMap(agents);
  const graph = isWorkflowGraph(workflows, modeName) ? graphBundle(mode, rules, agentsById) : legacyBundle(mode, rules, agentsById);
  const attachmentBlock = graph.attachmentsByAgent.length
    ? `## Agent Attachments\n${graph.attachmentsByAgent.map(a => `### ${a.ref}\n${a.attachments.map(att => att.kind === 'tool' ? `- tool: \`${att.id}\`${att.label ? ` (${att.label})` : ''}` : `- ${att.kind}: \`${att.path}\``).join('\n')}`).join('\n\n')}\n\n`
    : '';

  return `# Runtime Setup Summary

> Generated from dashboard-managed setup files at ${new Date().toISOString()}.
> Schema: ${manifest?.schema || 'setup-dashboard-v2'}
> Workflow schema: ${schema}
> This file is intended to be read by Hermes / Claude Code at task start.

---

## Active Mode
- **Workflow mode:** \`${modeName}\`
- **Workflow id:** \`${wfId}\`
- **Rule profile:** \`${ruleProf}\`
- **Roster profile:** \`${rosterProf}\`

## Active Roster
${roster}

${attachmentBlock}## Canonical Policies
${canonical}
${phaseZeroBlock}## Gate Schema
${gateLines || '(none)'}

## Workflow Topology
### Entry
${graph.entry}

### Nodes
| id | type | ref | label |
|---|---|---|---|
${graph.nodeTable}

## Routing Table
${graph.routes}

## Terminal Outputs
${graph.terminals}

## Active Rules (must be read by agent)
${actRules}

## Active Memory (must be loaded by agent)
${actMemory}
${refBlock}## Execution Notes
- Follow Workflow Topology + Routing Table for gate decisions.
- For requests touching product behavior, run Phase 0 (Change Intake) before drafting PRD.
- Do not continue coding if requirement changes after Gate B.
- Route post-freeze requirement change back to requirement lane.
- Use QA Pre-Implementation Review before coding in full lane.
- Use QA Post-Implementation Validation after implementation.
`;
}

function listRules(BASE)  { return listMd(rulesDir(BASE)); }
function listMemory(BASE) { return listMd(memoryDir(BASE)); }

function resolveManaged(BASE, kind, relPath) {
  if (!relPath || typeof relPath !== 'string') throw Object.assign(new Error('relPath required'), { status: 400 });
  if (!/\.md$/i.test(relPath)) throw Object.assign(new Error('only .md files'), { status: 400 });
  const root = kind === 'rules' ? rulesDir(BASE) : kind === 'memory' ? memoryDir(BASE) : null;
  if (!root) throw Object.assign(new Error('unknown kind'), { status: 400 });
  const full = path.resolve(root, relPath.replace(/\\/g, '/'));
  if (!full.startsWith(root + path.sep) && full !== root) throw Object.assign(new Error('path outside ' + kind), { status: 400 });
  return full;
}
function readManaged(BASE, kind, relPath) {
  const full = resolveManaged(BASE, kind, relPath);
  if (!fs.existsSync(full)) throw Object.assign(new Error('not found'), { status: 404 });
  const content = fs.readFileSync(full, 'utf8');
  const st = fs.statSync(full);
  return { relPath, content, size: st.size, mtime: st.mtimeMs, hash: sha(content) };
}
function backupSlot(BASE, kind, relPath) { return path.join(backupsDir(BASE), kind, relPath.replace(/[\\/]/g, '__')); }
function backupBefore(BASE, kind, relPath, previousContent) {
  const slot = backupSlot(BASE, kind, relPath);
  fs.mkdirSync(slot, { recursive: true });
  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const file = path.join(slot, ts + '.md');
  fs.writeFileSync(file, previousContent, 'utf8');
  try {
    const all = fs.readdirSync(slot).filter(f => f.endsWith('.md')).sort();
    while (all.length > 10) {
      const drop = all.shift();
      try { fs.unlinkSync(path.join(slot, drop)); } catch {}
    }
  } catch {}
  return path.relative(BASE, file).replace(/\\/g, '/');
}
function listBackups(BASE, kind, relPath) {
  const slot = backupSlot(BASE, kind, relPath);
  if (!fs.existsSync(slot)) return [];
  return fs.readdirSync(slot).filter(f => f.endsWith('.md')).sort().reverse().map(f => {
    const full = path.join(slot, f), st = fs.statSync(full);
    return { ts: f.replace(/\.md$/, ''), size: st.size, mtime: st.mtimeMs };
  });
}
function readBackup(BASE, kind, relPath, ts) {
  const slot = backupSlot(BASE, kind, relPath);
  const file = path.join(slot, ts + '.md');
  const resolved = path.resolve(file);
  if (!resolved.startsWith(path.resolve(slot) + path.sep)) throw Object.assign(new Error('invalid backup path'), { status: 400 });
  if (!fs.existsSync(resolved)) throw Object.assign(new Error('backup not found'), { status: 404 });
  return fs.readFileSync(resolved, 'utf8');
}
function writeManaged(BASE, kind, relPath, content, expectedHash) {
  const full = resolveManaged(BASE, kind, relPath);
  let previous = '';
  if (fs.existsSync(full)) {
    previous = fs.readFileSync(full, 'utf8');
    if (expectedHash && sha(previous) !== expectedHash) {
      const err = new Error('hash mismatch — file changed on disk');
      err.status = 409; err.serverHash = sha(previous); throw err;
    }
  } else if (expectedHash) {
    const err = new Error('file does not exist; expectedHash should be empty for create');
    err.status = 409; throw err;
  }
  const backupRel = previous ? backupBefore(BASE, kind, relPath, previous) : null;
  writeFileAtomic(full, String(content == null ? '' : content));
  const next = fs.readFileSync(full, 'utf8');
  return { ok: true, relPath, hash: sha(next), bytes: next.length, backup: backupRel };
}
function saveSetupAtomic(BASE, bundle, expectedHash) {
  const cur = readSetup(BASE);
  if (expectedHash && cur.exists && sha([cur.raw.manifest, cur.raw.rules, cur.raw.agents, cur.raw.workflows, cur.raw.pointers].join('|')) !== expectedHash) {
    const err = new Error('setup hash mismatch — files changed on disk');
    err.status = 409; err.serverHash = cur.hash; throw err;
  }
  const validation = validateSetup(bundle);
  if (!validation.ok) {
    const err = new Error('validation failed');
    err.status = 400; err.validation = validation; throw err;
  }
  const runtime = compileRuntime(bundle);
  const P = setupPaths(BASE);
  fs.mkdirSync(P.dir, { recursive: true });
  const backups = {};
  for (const [k, p] of [['manifest',P.manifest],['rules',P.rules],['agents',P.agents],['workflows',P.workflows],['pointers',P.pointers],['runtime',P.runtime]]) {
    const old = readFileSafe(p);
    if (old != null) backups[k] = backupBefore(BASE, 'setup', k + '.yaml', old);
  }
  const serialize = obj => dumpYaml(obj || {});
  writeFileAtomic(P.manifest, serialize(bundle.manifest));
  writeFileAtomic(P.rules, serialize(bundle.rules));
  writeFileAtomic(P.agents, serialize(bundle.agents));
  writeFileAtomic(P.workflows, serialize(bundle.workflows));
  writeFileAtomic(P.pointers, serialize(bundle.pointers));
  writeFileAtomic(P.runtime, runtime);
  const after = readSetup(BASE);
  return { ok: true, hash: after.hash, runtime, backups, validation };
}

module.exports = {
  setupPaths, templatePaths, setupExists, rulesDir, memoryDir,
  readSetup, initSetup, validateSetup, compileRuntime, saveSetupAtomic,
  listRules, listMemory, resolveManaged, readManaged, writeManaged,
  listBackups, readBackup,
  sha, parseYaml, dumpYaml, writeFileAtomic,
};