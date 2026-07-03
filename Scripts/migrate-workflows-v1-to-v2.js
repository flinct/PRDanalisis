'use strict';
const fs = require('fs');
const path = require('path');
const setupCfg = require('./setup-config.js');

const BASE = process.cwd();
const P = setupCfg.setupPaths(BASE);

function slug(s) {
  return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'node';
}
function makeId(step, counts) {
  const base = slug(step.replace(/^reviewer_/, ''));
  counts[base] = (counts[base] || 0) + 1;
  return `${base}_${counts[base]}`;
}
function typeOfStep(step) {
  if (step === 'orchestrator') return 'agent';
  if (step.startsWith('reviewer_gate_')) return 'gate';
  if (['change_intake','prd_v0','quick_assessment','qa_pre','qa_post'].includes(step)) return 'marker';
  return 'agent';
}
function refOfStep(step) {
  return step.startsWith('reviewer_gate_') ? step.replace('reviewer_', '') : step;
}
function labelOfStep(step, agentsById) {
  if (step.startsWith('reviewer_gate_')) return step.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return agentsById.get(step)?.label || step.replace(/_/g, ' ');
}
function firstLoopTarget(modeName, label, nodeIds) {
  if (label === 'REVISE_ASSESSMENT') return nodeIds.find(n => n.ref === 'analyst')?.id || null;
  if (label === 'REVISE_PRD_DRAFT') return nodeIds.find(n => n.ref === 'change_intake')?.id || nodeIds.find(n => n.ref === 'prd_v0')?.id || null;
  if (label === 'REVISE_PRD') return nodeIds.find(n => n.ref === 'prd_writer')?.id || null;
  if (label === 'REVISE_QA') return nodeIds.find(n => n.ref === 'qa_post')?.id || nodeIds.find(n => n.ref === 'qa_pre')?.id || null;
  if (label === 'REVISE_CODER') return nodeIds.find(n => n.ref === 'coder_automation')?.id || null;
  if (label === 'REOPEN_REQUIREMENT') return nodeIds.find(n => n.ref === 'change_intake')?.id || null;
  return null;
}

function migrateMode(modeName, mode, rules, agentsById) {
  const steps = mode.steps || [];
  const counts = {};
  const nodes = [{ id: 'trigger_1', type: 'trigger', label: 'Task received', position: { x: 60, y: modeName === 'fast_lane' ? 420 : 220 } }];
  const stepNodes = [];
  steps.forEach((step, idx) => {
    const id = makeId(step, counts);
    const type = typeOfStep(step);
    const ref = refOfStep(step);
    const node = {
      id,
      type,
      ref,
      label: labelOfStep(step, agentsById),
      position: { x: 220 + (idx * 180), y: modeName === 'fast_lane' ? 420 : 220 },
    };
    if (type === 'agent') node.attachments = [];
    nodes.push(node);
    stepNodes.push(node);
  });
  const edges = [];
  if (stepNodes[0]) edges.push({ from: 'trigger_1', to: stepNodes[0].id });
  for (let i = 0; i < stepNodes.length - 1; i++) {
    const cur = stepNodes[i], next = stepNodes[i + 1];
    if (cur.type === 'gate') continue;
    const gateRef = next.type === 'gate' ? next.ref : null;
    edges.push({ from: cur.id, to: next.id });
    if (gateRef) continue;
  }
  for (let i = 0; i < stepNodes.length; i++) {
    const cur = stepNodes[i];
    if (cur.type !== 'gate') continue;
    const next = stepNodes[i + 1];
    const labels = rules.gates?.[cur.ref]?.allowed_statuses || [];
    for (const label of labels) {
      if (/HOLD|FINAL_APPROVE/.test(label)) continue;
      const loopTarget = firstLoopTarget(modeName, label, stepNodes);
      if (/^REVISE_|^REOPEN_/.test(label) && loopTarget) {
        edges.push({ from: cur.id, to: loopTarget, label, loop_back: true });
        continue;
      }
      if (next) edges.push({ from: cur.id, to: next.id, label });
    }
  }
  return {
    id: mode.id,
    description: mode.description,
    nodes,
    edges,
    gates: mode.gates || {},
    freeze: mode.freeze || { enabled: false },
  };
}

function main() {
  const setup = setupCfg.readSetup(BASE);
  if (!setup.exists) throw new Error('Setup belum ada');
  const workflows = setup.parsed.workflows;
  if (!workflows || !workflows.modes) throw new Error('workflows.yaml kosong');
  if (Object.values(workflows.modes).some(m => Array.isArray(m.nodes) && Array.isArray(m.edges))) {
    console.log(JSON.stringify({ ok: true, skipped: true, reason: 'already v2 graph' }, null, 2));
    return;
  }
  const agentsById = new Map((setup.parsed.agents?.agents || []).map(a => [a.id, a]));
  const next = JSON.parse(JSON.stringify(workflows));
  next.version = 3;
  next.schema = 'workflow-v2';
  const migrated = {};
  for (const [modeName, mode] of Object.entries(workflows.modes || {})) {
    migrated[modeName] = migrateMode(modeName, mode, setup.parsed.rules, agentsById);
  }
  next.modes = migrated;

  const backupDir = path.join(P.backups, 'setup');
  fs.mkdirSync(backupDir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(backupDir, `workflows-v1-${stamp}.yaml`);
  fs.writeFileSync(backupPath, setup.raw.workflows || '', 'utf8');

  const bundle = {
    manifest: Object.assign({}, setup.parsed.manifest || {}, {
      version: 3,
      schema: 'setup-dashboard-v3',
      updated_at: new Date().toISOString(),
      active: Object.assign({}, setup.parsed.manifest?.active || {}, {
        workflow_id: migrated[setup.parsed.manifest?.active?.workflow_mode || 'full_lane']?.id || setup.parsed.manifest?.active?.workflow_id || 'graph-v2',
      }),
    }),
    rules: setup.parsed.rules,
    agents: setup.parsed.agents,
    workflows: next,
    pointers: setup.parsed.pointers,
  };
  const result = setupCfg.saveSetupAtomic(BASE, bundle, setup.hash);
  console.log(JSON.stringify({ ok: true, backup: path.relative(BASE, backupPath).replace(/\\/g, '/'), hash: result.hash, validation: result.validation }, null, 2));
}

main();