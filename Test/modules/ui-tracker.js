window.TrackerModule = (function(){
  const e = React.createElement;
  const DEFAULT_ROWS = [
    { id:'t1', owner:'Dany', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Breakdown error message', description:'Analisa existing flow', status:'in progress', progress:0, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
    { id:'t2', owner:'Dany', sourceSheet:'Sheet1', type:'milestone', parentTaskId:'t1', task:'Mapping error code', description:'Backend', status:'in progress', progress:20, version:'', difficulty:'', priority:'', week:'now', startDate:'', endDate:'' },
    { id:'t3', owner:'Dany', sourceSheet:'Sheet1', type:'milestone', parentTaskId:'t1', task:'Implement API', description:'', status:'new', progress:0, version:'', difficulty:'', priority:'', week:'last', startDate:'', endDate:'' },
    { id:'t4', owner:'Naftal', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Create new draft PRD referral system', description:'Draft PRD', status:'in progress', progress:70, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
    { id:'t5', owner:'Agung', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Conversation performance improve', description:'', status:'new', progress:0, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
  ];
  // ponytail: status/difficulty/priority option lists dibiarin driven-by-sheet.
  // Kalau butuh baseline keys (mis. selector pas gsheet kosong), tambahin di sini.
  const STATUS_DEFAULTS = [];
  const TYPE_OPTIONS = ['core', 'milestone'];
  const DIFFICULTY_DEFAULTS = [];
  const PRIORITY_DEFAULTS = [];
  const WEEK_OPTIONS = ['now', 'last'];

  // Bucket rule: date → which weeks (last / now) a task appears in.
  // Base: `date` (tanggal mulai) locates the task in its start week.
  //   date ∈ minggu ini → this week
  //   date ∈ minggu lalu → last week (+ carry to this week if still ongoing)
  //   date ∈ minggu2 lalu (atau lebih) → hidden by date alone
  // Overrides via `week` select:
  //   week='last' → force include in last week (e.g. task lama masih on-going)
  //   week='now'  → force include in this week (e.g. carry-over yang date-nya jauh)
  // Ongoing = status yang belum selesai/hold. Complete/on-hold gak auto-carry.
  const ONGOING_STATUSES = new Set(['in progress', 'developed', 'tested', 'waiting']);

  // Returns [startMs, endMs) for the given offset.
  // mode='week' = current calendar week (Monday..next Monday) at offset*7 days.
  //   offset 0 = this week (Mon..Sun inclusive), -1 = last week.
  // mode='month' = past 4-week rolling window ending at THIS Monday, shifted by
  //   offset*4 weeks. offset 0 = past 4 weeks (this Mon - 4w .. this Mon),
  //   -1 = 8..4 weeks ago. This is backward-only — matches user spec "picker
  //   month = 8 minggu ke belakang" (this + last = weeks -1..-8 from now).
  function periodRange(offset = 0, mode = 'week', now = new Date()) {
    const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dow = base.getDay(); // 0=Sun..6=Sat
    const daysSinceMonday = (dow + 6) % 7;
    const thisMonday = new Date(base);
    thisMonday.setDate(base.getDate() - daysSinceMonday);
    if (mode === 'month') {
      // 4-week span ending at NEXT Monday (so this week is included in "now" bucket).
      // offset 0: [thisMon - 21d, thisMon + 7d) = past 3 weeks + this week
      // offset -1: 4 weeks before that
      const end = new Date(thisMonday);
      end.setDate(thisMonday.getDate() + 7 + offset * 28);
      const start = new Date(end);
      start.setDate(end.getDate() - 28);
      return [start.getTime(), end.getTime()];
    }
    // week: current Monday..next Monday, shifted by offset*7
    const start = new Date(thisMonday);
    start.setDate(thisMonday.getDate() + offset * 7);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return [start.getTime(), end.getTime()];
  }

  function parseDateMs(raw) {
    const text = normalizeDate(raw);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return NaN;
    const [y, m, d] = text.split('-').map(Number);
    return new Date(y, m - 1, d).getTime();
  }

  // Returns { last:boolean, now:boolean } — which tables the row belongs to.
  // mode: 'week' | 'month'. Uses date start & date end to determine interval
  // overlap: task appears in a period if [startDate, endDate] intersects
  // the period's range. Ongoing tasks with no endDate span indefinitely.
  // Complete/tested tasks with no endDate fall back to single-date rule.
  // Override column `week` ('last'/'now') works as before.
  function periodBuckets(row, mode = 'week', ref = new Date()) {
    const [lastStart, lastEnd] = periodRange(-1, mode, ref);
    const [nowStart, nowEnd]   = periodRange(0, mode, ref);
    const startMs = parseDateMs(row?.startDate || row?.date);
    const endMs   = row?.endDate ? parseDateMs(row?.endDate) : NaN;
    const status = String(row?.status || '').toLowerCase();
    const ongoing = ONGOING_STATUSES.has(status);
    const override = normalizeWeek(row?.week);
    let last = false;
    let now  = false;
    if (override === 'last') { last = true; } else if (override === 'now') { now = true; }
    if (Number.isFinite(startMs)) {
      if (periodOverlaps(startMs, endMs, ongoing, lastStart, lastEnd)) last = true;
      if (periodOverlaps(startMs, endMs, ongoing, nowStart, nowEnd))   now  = true;
    }
    return { last, now };
  }

  // Does interval [startMs, endMs) overlap [pStart, pEnd)?
  // endMs = NaN + ongoing → unbounded (overlaps any future period).
  // endMs = NaN + complete/tested → use single-date check (backward compat
  // for old data that has no endDate column).
  function periodOverlaps(startMs, endMs, ongoing, pStart, pEnd) {
    if (startMs >= pEnd) return false;               // starts after period
    if (Number.isFinite(endMs)) return endMs + 86400000 > pStart; // endDate inclusive
    if (ongoing) return true;                         // no end = still active
    return startMs >= pStart;                         // single-date fallback
  }

  // Filter rows to those in the selected period bucket.
  // pick='now'  → rows in current period only (this-week / this-month).
  // pick='last' → rows in previous period only.
  // pick='both' → union (rows in either bucket).
  // Parent-core kept if any child milestone passes, so tree context stays.
  function filterRowsByPeriod(rows, mode, pick, ref = new Date()) {
    const match = b => pick === 'both' ? (b.now || b.last) : b[pick];
    const milestoneOk = new Map();
    rows.forEach(row => {
      if (row.type !== 'milestone') return;
      milestoneOk.set(row.id, match(periodBuckets(row, mode, ref)));
    });
    return rows.filter(row => {
      if (row.type === 'milestone') return milestoneOk.get(row.id);
      if (match(periodBuckets(row, mode, ref))) return true;
      return rows.some(r => r.type === 'milestone' && r.parentTaskId === row.id && milestoneOk.get(r.id));
    });
  }

  function formatDate(ms) { return new Date(ms).toLocaleDateString('id-ID', { day:'numeric', month:'short', year:'numeric' }); }

  function formatPeriodLabel(mode) {
    const now = new Date();
    const [lastS, lastE] = periodRange(-1, mode, now);
    const [nowS, nowE]   = periodRange(0, mode, now);
    const fmt = ms => formatDate(ms - 86400000);
    if (mode === 'month') return `${formatDate(lastS)} — ${fmt(nowE)} (8 weeks)`;
    return `This ${formatDate(nowS)} — ${fmt(nowE)} · Last ${formatDate(lastS)} — ${fmt(lastE)}`;
  }

  function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
  }

  function polarToCartesian(cx, cy, r, deg) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function arcPath(cx, cy, r, startDeg, endDeg) {
    const start = polarToCartesian(cx, cy, r, endDeg);
    const end = polarToCartesian(cx, cy, r, startDeg);
    const largeArcFlag = endDeg - startDeg <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }

  function normalizeProgress(value) {
    const num = Number(value);
    if (!Number.isFinite(num)) return 0;
    return Math.max(0, Math.min(100, num));
  }

  function normalizeDate(value) {
    const text = String(value || '').trim();
    if (!text) return '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
    if (/^\d{2}-\d{2}-\d{4}$/.test(text)) {
      const [day, month, year] = text.split('-');
      return `${year}-${month}-${day}`;
    }
    return text;
  }

  function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
  }

  function normalizePriority(value) {
    return normalizeText(value);
  }

  function normalizeWeek(value) {
    const normalized = normalizeText(value);
    return WEEK_OPTIONS.includes(normalized) ? normalized : '';
  }

  function normalizeRow(row, index) {
    const type = TYPE_OPTIONS.includes(row?.type) ? row.type : 'core';
    const statusRaw = normalizeText(row?.status);
    return {
      id: row?.id || `row-${index + 1}`,
      owner: String(row?.owner || row?.name || ''),
      sourceSheet: String(row?.sourceSheet || row?.sheet_name || 'Sheet1'),
      sourceRowNumber: Number(row?.sourceRowNumber || 0),
      type,
      parentTaskId: type === 'milestone' ? String(row?.parentTaskId || row?.parentTask || row?.['Parent Task'] || '') : '',
      task: String(row?.task || row?.taskTitle || row?.['Task Title'] || ''),
      description: String(row?.description || row?.Description || ''),
      activity: String(row?.activity || row?.Activity || ''),
      status: statusRaw || 'new',
      progress: normalizeProgress(row?.progress),
      version: String(row?.version || row?.ver || ''),
      difficulty: normalizeText(row?.difficulty),
      priority: normalizePriority(row?.priority),
      week: normalizeWeek(row?.week),
      date: normalizeDate(row?.date),
      startDate: normalizeDate(row?.startDate || row?.start || row?.date),
      endDate: normalizeDate(row?.endDate || row?.end),
      verStartDate: normalizeDate(row?.verStartDate),
      verEndDate: normalizeDate(row?.verEndDate),
    };
  }

  function normalizeRows(rows) {
    const list = Array.isArray(rows) && rows.length ? rows.map(normalizeRow) : DEFAULT_ROWS.map(normalizeRow);
    const ids = new Set(list.map(row => row.id));
    // Parent lookup scoped per sourceSheet: milestone di gsheet mereference
    // parent yang ada di TAB YANG SAMA. Global map bikin cross-tab title
    // collision (mis. "Onboarding" di Dany & di Naftal 1) meng-attach child
    // ke parent tab yang duluan dibaca. Rule ini otomatis konsisten untuk
    // berapapun tab baru di masa depan.
    const coreIdToSheet = new Map();
    const coreByTitlePerSheet = new Map();
    list.forEach(row => {
      if (row.type !== 'core') return;
      coreIdToSheet.set(row.id, row.sourceSheet);
      const key = row.task.trim().toLowerCase();
      if (!key) return;
      if (!coreByTitlePerSheet.has(row.sourceSheet)) coreByTitlePerSheet.set(row.sourceSheet, new Map());
      const sheetMap = coreByTitlePerSheet.get(row.sourceSheet);
      if (!sheetMap.has(key)) sheetMap.set(key, row.id);
    });
    return list.map(row => {
      if (row.type !== 'milestone') return row;
      const raw = row.parentTaskId;
      // Existing raw id valid only if it points to a core in the SAME sheet.
      if (raw && ids.has(raw) && raw !== row.id && coreIdToSheet.get(raw) === row.sourceSheet) return row;
      const sheetMap = coreByTitlePerSheet.get(row.sourceSheet);
      const resolved = raw && sheetMap ? sheetMap.get(String(raw).trim().toLowerCase()) : '';
      if (resolved && resolved !== row.id) return { ...row, parentTaskId:resolved };
      return { ...row, parentTaskId:'' };
    });
  }

  function getChildMilestones(rows, coreId) {
    return rows.filter(row => row.type === 'milestone' && row.parentTaskId === coreId);
  }

  function getEffectiveProgress(row, rows) {
    if (row.type === 'core') {
      const children = getChildMilestones(rows, row.id);
      if (children.length) {
        const total = children.reduce((sum, child) => sum + normalizeProgress(child.progress), 0);
        return total / children.length;
      }
    }
    return normalizeProgress(row.progress);
  }

  function collectDistinct(rows, key, defaults) {
    const seen = new Map();
    defaults.forEach(v => seen.set(v, true));
    rows.forEach(row => { const v = row[key]; if (v) seen.set(v, true); });
    return Array.from(seen.keys());
  }

  function summarizeRows(rows) {
    const statuses = collectDistinct(rows, 'status', STATUS_DEFAULTS);
    const difficulties = collectDistinct(rows, 'difficulty', DIFFICULTY_DEFAULTS);
    const priorities = collectDistinct(rows, 'priority', PRIORITY_DEFAULTS);
    const activities = collectDistinct(rows, 'activity', []);
    const next = {
      total:rows.length,
      cores:rows.filter(r => r.type === 'core').length,
      milestones:rows.filter(r => r.type === 'milestone').length,
      overall:0,
      statuses:Object.fromEntries(statuses.map(s => [s, 0])),
      difficulties:Object.fromEntries([...difficulties, 'unset'].map(d => [d, 0])),
      priorities:Object.fromEntries([...priorities, 'unset'].map(p => [p, 0])),
      activities:Object.fromEntries(activities.map(a => [a, 0])),
      weeks:{ now:0, last:0, unset:0 },
      version:0,
      difficulty:0,
      statusKeys:statuses,
      difficultyKeys:difficulties,
      priorityKeys:priorities,
      activityKeys:activities,
    };
    if (!rows.length) return next;
    let sum = 0;
    const versions = new Set();
    const usedDifficulties = new Set();
    rows.forEach(row => {
      sum += getEffectiveProgress(row, rows);
      if (row.status) next.statuses[row.status] = (next.statuses[row.status] || 0) + 1;
      if (row.version) versions.add(row.version);
      if (row.difficulty) { usedDifficulties.add(row.difficulty); next.difficulties[row.difficulty] = (next.difficulties[row.difficulty] || 0) + 1; }
      else next.difficulties.unset += 1;
      if (row.priority) next.priorities[row.priority] = (next.priorities[row.priority] || 0) + 1;
      else next.priorities.unset += 1;
      if (row.activity && next.activities[row.activity] !== undefined) next.activities[row.activity] += 1;
      if (row.week && next.weeks[row.week] !== undefined) next.weeks[row.week] += 1;
      else next.weeks.unset += 1;
    });
    next.overall = sum / rows.length;
    next.version = versions.size;
    next.difficulty = usedDifficulties.size;
    return next;
  }

  function groupByOwner(rows) {
    const map = new Map();
    rows.forEach(row => {
      const key = row.owner || 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    });
    return Array.from(map.entries()).map(([owner, items]) => ({ owner, rows:items, summary:summarizeRows(items) }));
  }

  function moveRow(rows, fromId, toId) {
    const fromIndex = rows.findIndex(row => row.id === fromId);
    const toIndex = rows.findIndex(row => row.id === toId);
    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return rows;
    const next = rows.slice();
    const [item] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, item);
    return next;
  }

  function selfCheck() {
    const rows = normalizeRows([
      { id:'a', owner:'A', sourceSheet:'Alpha', type:'core', task:'X', description:'', status:'in progress', progress:0 },
      { id:'b', owner:'A', sourceSheet:'Alpha', type:'milestone', parentTask:'X', task:'Y', description:'', status:'complete', progress:100, priority:'high', week:'now' },
      { id:'c', owner:'A', sourceSheet:'Beta', type:'milestone', parentTaskId:'a', task:'Z', description:'', status:'new', progress:0, difficulty:'hard', week:'last' },
    ]);
    const moved = moveRow(rows, 'c', 'a');
    console.assert(rows[1].parentTaskId === 'a', 'tracker parent normalize failed');
    // Cross-sheet: milestone di Beta reference core 'a' di Alpha → parent harus DIBERSIHKAN (orphan) bukan diikutkan.
    console.assert(rows[2].parentTaskId === '', 'tracker cross-sheet parent leak');
    console.assert(moved[0].id === 'c', 'tracker moveRow failed');
    // Same title across sheets must resolve within its own sheet.
    const dual = normalizeRows([
      { id:'p1', owner:'A', sourceSheet:'S1', type:'core', task:'Onboarding' },
      { id:'p2', owner:'B', sourceSheet:'S2', type:'core', task:'Onboarding' },
      { id:'m1', owner:'A', sourceSheet:'S1', type:'milestone', parentTask:'Onboarding', task:'M1' },
      { id:'m2', owner:'B', sourceSheet:'S2', type:'milestone', parentTask:'Onboarding', task:'M2' },
    ]);
    console.assert(dual[2].parentTaskId === 'p1', 'tracker sheet-scoped parent S1');
    console.assert(dual[3].parentTaskId === 'p2', 'tracker sheet-scoped parent S2');
    // After cross-sheet orphan, core 'a' only has child 'b' (100%).
    console.assert(getEffectiveProgress(rows[0], rows) === 100, 'tracker core milestone progress failed');
    console.assert(groupByOwner(rows)[0].summary.overall === (100 + 100 + 0) / 3, 'tracker summary overall failed');
    console.assert(groupByOwner(rows)[0].summary.priorities.high === 1, 'tracker priority summary failed');
    console.assert(groupByOwner(rows)[0].summary.weeks.now === 1, 'tracker week summary failed');

    // periodBuckets — pick a fixed reference so tests are deterministic.
    // ref = Wed 2026-07-29 → this week = Mon 2026-07-27..Sun 2026-08-02, last = 2026-07-20..2026-07-26.
    const ref = new Date(2026, 6, 29);
    const iso = (y, m, d) => `${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    // New rule: interval overlap of [startDate, endDate] with period.
    // start+end both in this week → this only.
    const b1 = periodBuckets({ startDate: iso(2026,7,28), endDate: iso(2026,7,30), status:'in progress' }, 'week', ref);
    console.assert(b1.now && !b1.last, 'periodBuckets week: span this-week only');
    // start last week, end this week → both (interval spans weeks). This is the core change from old rule.
    const b2 = periodBuckets({ startDate: iso(2026,7,22), endDate: iso(2026,7,27), status:'complete' }, 'week', ref);
    console.assert(b2.last && b2.now, 'periodBuckets week: span last→this shows both');
    // start 3 weeks ago, end this week → shows in this (endDate overlap).
    const b2b = periodBuckets({ startDate: iso(2026,7,8), endDate: iso(2026,7,29), status:'complete' }, 'week', ref);
    console.assert(b2b.now, 'periodBuckets week: long span end in this week');
    // start last week, complete without endDate → single-date fallback: last only.
    const b3a = periodBuckets({ date: iso(2026,7,22), status:'complete' }, 'week', ref);
    console.assert(b3a.last && !b3a.now, 'periodBuckets week: no endDate complete last-week');
    // start this week, ongoing, no endDate → this only.
    const b3b = periodBuckets({ startDate: iso(2026,7,28), status:'in progress' }, 'week', ref);
    console.assert(b3b.now && !b3b.last, 'periodBuckets week: ongoing no end this-week');
    // start last week, ongoing, no endDate → both (no end = unbounded, overlaps now too).
    const b3c = periodBuckets({ startDate: iso(2026,7,22), status:'in progress' }, 'week', ref);
    console.assert(b3c.last && b3c.now, 'periodBuckets week: ongoing no end = unbounded future');
    // start+end both in last week → last only.
    const b3 = periodBuckets({ startDate: iso(2026,7,21), endDate: iso(2026,7,25), status:'complete' }, 'week', ref);
    console.assert(b3.last && !b3.now, 'periodBuckets week: span last-week only');
    // No dates at all → hidden.
    const b7 = periodBuckets({ status:'in progress' }, 'week', ref);
    console.assert(!b7.last && !b7.now, 'periodBuckets week: no dates hidden');
    // Start after this week → hidden.
    const bFuture = periodBuckets({ startDate: iso(2026,8,3), status:'in progress' }, 'week', ref);
    console.assert(!bFuture.last && !bFuture.now, 'periodBuckets week: future start hidden');
    // Override works regardless of status: week='now' → always now.
    const b5 = periodBuckets({ startDate: iso(2026,7,1), status:'in progress', week:'now' }, 'week', ref);
    console.assert(b5.now, 'periodBuckets week: override now');
    // Override on complete + out-of-range start → override wins (complete + week=now → now).
    const bStale = periodBuckets({ startDate: iso(2026,5,18), status:'complete', week:'now' }, 'week', ref);
    console.assert(bStale.now, 'periodBuckets week: stale override complete still shows in now');
    // Complete, dates in range, stale override → date AND override both work.
    const b9 = periodBuckets({ startDate: iso(2026,7,22), endDate: iso(2026,7,25), status:'complete', week:'now' }, 'week', ref);
    console.assert(b9.last && b9.now, 'periodBuckets week: complete in-range date rule + override = both');

    // Month mode. ref 2026-07-29, this-month = 2026-07-06..2026-08-03, last-month = 2026-06-08..2026-07-06.
    // v2.8.0 dates in 13..27 Jul → this-month.
    const mV28a = periodBuckets({ startDate: iso(2026,7,13), status:'complete' }, 'month', ref);
    console.assert(mV28a.now && !mV28a.last, 'periodBuckets month: v2.8.0 13-07 in this-month');
    // Ongoing no endDate → unbounded = in both if start in last-month.
    const mCF = periodBuckets({ startDate: iso(2026,6,15), status:'in progress' }, 'month', ref);
    console.assert(mCF.last && mCF.now, 'periodBuckets month: carry-forward no end ongoing');
    // v2.7.0 15-06 = in last-month
    const mV27 = periodBuckets({ startDate: iso(2026,6,15), endDate: iso(2026,6,29), status:'complete' }, 'month', ref);
    console.assert(mV27.last && !mV27.now, 'periodBuckets month: v2.7.0 15-06 in last-month');
    // v2.6.0 18-05 = out of 8-week window
    const mV26 = periodBuckets({ startDate: iso(2026,5,18), endDate: iso(2026,5,25), status:'complete' }, 'month', ref);
    console.assert(!mV26.last && !mV26.now, 'periodBuckets month: v2.6.0 out of 8-week window');
    // Old data: date column only (backward compat) — single-date fallback
    const oldCompat = periodBuckets({ date: iso(2026,7,27), status:'complete' }, 'week', ref);
    console.assert(oldCompat.now && !oldCompat.last, 'periodBuckets week: old date-only compat');

    // filterRowsByPeriod: chart section rule must be 'now' bucket only, so week vs month differ.
    // Row spanning last-month..this-week: month.now overlaps [Jul 6..Aug 3), week.now overlaps [Jul 27..Aug 3).
    // Row Jun 15..Jun 29 complete → month.now=false, month.last=true; week.now=false, week.last=false.
    const spanRows = normalizeRows([
      { id:'r1', owner:'A', sourceSheet:'S', type:'core', task:'A', status:'complete', startDate:iso(2026,6,15), endDate:iso(2026,6,29) },
      { id:'r2', owner:'A', sourceSheet:'S', type:'core', task:'B', status:'in progress', startDate:iso(2026,7,28) },
    ]);
    const wkNow = filterRowsByPeriod(spanRows, 'week', 'now', ref);
    const mnNow = filterRowsByPeriod(spanRows, 'month', 'now', ref);
    const wkNowIds = wkNow.map(r => r.id).sort().join(',');
    const mnNowIds = mnNow.map(r => r.id).sort().join(',');
    console.assert(wkNowIds === 'r2', 'filterRowsByPeriod week/now = only in-week row, got: ' + wkNowIds);
    console.assert(mnNowIds === 'r2', 'filterRowsByPeriod month/now = only in-month row (r1 in last-month bucket), got: ' + mnNowIds);
    // The critical bug-report check: use a row that spans across the boundary — in-month but out-of-week.
    const boundaryRows = normalizeRows([
      { id:'x1', owner:'A', sourceSheet:'S', type:'core', task:'X', status:'complete', startDate:iso(2026,7,13), endDate:iso(2026,7,18) },
    ]);
    const wkX = filterRowsByPeriod(boundaryRows, 'week', 'now', ref).length;
    const mnX = filterRowsByPeriod(boundaryRows, 'month', 'now', ref).length;
    console.assert(wkX !== mnX, `week and month must differ for Jul13-Jul18 row: wk=${wkX} mn=${mnX}`);
  }
  selfCheck();

  function readTrackerLocal() {
    try {
      const raw = localStorage.getItem('qa_tracker_rows');
      const rows = raw ? JSON.parse(raw) : DEFAULT_ROWS;
      const updatedAt = localStorage.getItem('qa_tracker_rows_updated_at');
      const updatedBy = localStorage.getItem('qa_tracker_rows_updated_by');
      return { rows, updatedAt, updatedBy };
    } catch {
      return { rows:DEFAULT_ROWS, updatedAt:null, updatedBy:null };
    }
  }

  function saveTrackerLocal(rows, updatedBy) {
    const updatedAt = new Date().toISOString();
    localStorage.setItem('qa_tracker_rows', JSON.stringify(rows));
    localStorage.setItem('qa_tracker_rows_updated_at', updatedAt);
    localStorage.setItem('qa_tracker_rows_updated_by', updatedBy || 'user');
    return { updatedAt, updatedBy: updatedBy || 'user' };
  }

  async function loadTrackerRows() {
    try {
      const response = await fetch('/api/tracker');
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('api unavailable');
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'api unavailable');
      return data;
    } catch {
      const local = readTrackerLocal();
      return { ok:true, rows:local.rows, updatedAt:local.updatedAt, updatedBy:local.updatedBy, storage:'local' };
    }
  }

  async function saveTrackerRows(rows, updatedBy) {
    try {
      const response = await fetch('/api/tracker', {
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ rows, updatedBy })
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('save failed');
      const data = await response.json();
      if (!data.ok) throw new Error(data.error || 'save failed');
      return data;
    } catch {
      const local = saveTrackerLocal(rows, updatedBy);
      return { ok:true, updatedAt:local.updatedAt, updatedBy:local.updatedBy, storage:'local' };
    }
  }

  async function fetchJson(url, options) {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
    return data;
  }

  function sourceLabel(source) {
    if (source === 'env') return 'env';
    if (source === 'user') return 'saved';
    return 'not set';
  }

  async function loadTrackerSource() {
    return fetchJson('/api/tracker/source');
  }

  async function loadTrackerFolders() {
    return fetchJson('/api/tracker/source/folders');
  }

  async function saveTrackerFolder(payload) {
    return fetchJson('/api/tracker/source/folder', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload || {}),
    });
  }

  async function loadTrackerFiles(folderId) {
    const suffix = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
    return fetchJson(`/api/tracker/source/files${suffix}`);
  }

  async function loadTrackerTabs(spreadsheetId) {
    return fetchJson(`/api/tracker/source/tabs?spreadsheetId=${encodeURIComponent(spreadsheetId)}`);
  }

  async function saveTrackerSource(payload) {
    return fetchJson('/api/tracker/source', {
      method:'PUT',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify(payload || {}),
    });
  }

  function DoughnutChart({ percent }) {
    const pct = Math.max(0, Math.min(100, Number(percent || 0)));
    const endDeg = (pct / 100) * 360;
    return e('div', { style:{ display:'grid', placeItems:'center', minHeight:220 } },
      e('svg', { width:180, height:180, viewBox:'0 0 180 180', role:'img', 'aria-label':`Overall progress ${formatPercent(pct)}` },
        e('circle', { cx:90, cy:90, r:64, fill:'none', stroke:'var(--border-2)', strokeWidth:18 }),
        pct > 0 ? e('path', { d:arcPath(90, 90, 64, 0, endDeg), fill:'none', stroke:'#2563eb', strokeWidth:18, strokeLinecap:'round' }) : null,
        e('text', { x:90, y:86, textAnchor:'middle', fontSize:16, fontWeight:700, fill:'var(--text-1)' }, formatPercent(pct)),
        e('text', { x:90, y:108, textAnchor:'middle', fontSize:12, fill:'var(--text-4)' }, 'Overall')
      )
    );
  }

  function titleCase(s) {
    return String(s || '').replace(/\b\w/g, c => c.toUpperCase());
  }

  const PALETTE = ['#22c55e', '#f59e0b', '#ef4444', '#7c3aed', '#8fd0f8', '#ec4899', '#14b8a6', '#eab308', '#3b82f6', '#a855f7'];

  function StatusBarChart({ summary }) {
    const rows = summary.statusKeys.map(label => ({ label, value:summary.statuses[label] || 0 }));
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ display:'grid', gap:8 } },
      e('div', { style:{ display:'grid', gridTemplateColumns:'36px 1fr', gap:10 } },
        e('div', { style:{ display:'grid', alignItems:'end', height:180, fontSize:13, fontWeight:800, color:'var(--text-4)' } }, 'task'),
        e('div', { style:{ height:180, display:'grid', gridTemplateColumns:`repeat(${rows.length}, minmax(0, 1fr))`, alignItems:'end', gap:10, borderBottom:'1px solid var(--border-1)', padding:'0 0 8px' } },
          ...rows.map(row => e('div', { key:row.label, style:{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', gap:6 } },
            e('div', { style:{ fontSize:14, fontWeight:800, color:'var(--text-2)' } }, row.value),
            e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${max ? (row.value / max) * 135 : 0}px`, minHeight:row.value ? 8 : 0, background:'#8fd0f8', borderRadius:'8px 8px 0 0' } }),
            e('div', { style:{ fontSize:15, fontWeight:800, color:'var(--text-2)', textAlign:'center', textTransform:'capitalize' } }, row.label)
          ))
        )
      )
    );
  }

  function DynamicBarChart({ keys, counts, unsetKey }) {
    const rows = keys.map((label, i) => ({ label:titleCase(label), value:counts[label] || 0, color:PALETTE[i % PALETTE.length] }));
    if (unsetKey && counts[unsetKey]) rows.push({ label:'Unset', value:counts[unsetKey], color:'#64748b' });
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ height:220, display:'flex', alignItems:'flex-end', gap:16, padding:'16px 10px 8px', borderBottom:'1px solid var(--border-1)' } },
      ...rows.map(row => e('div', { key:row.label, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 } },
        e('div', { style:{ fontSize:14, fontWeight:800, color:'var(--text-2)' } }, row.value),
        e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${max ? (row.value / max) * 135 : 0}px`, minHeight:row.value ? 8 : 0, background:row.color, borderRadius:'8px 8px 0 0' } }),
        e('div', { style:{ fontSize:15, fontWeight:800, color:'var(--text-2)', textAlign:'center' } }, row.label)
      ))
    );
  }

  function DifficultyBarChart({ summary }) {
    return e(DynamicBarChart, { keys:summary.difficultyKeys, counts:summary.difficulties, unsetKey:'unset' });
  }

  function PriorityBarChart({ summary }) {
    return e(DynamicBarChart, { keys:summary.priorityKeys, counts:summary.priorities, unsetKey:'unset' });
  }

  function ActivityBarChart({ summary }) {
    return e(DynamicBarChart, { keys:summary.activityKeys, counts:summary.activities });
  }

  function buildProgressCards(summary) {
    return [
      ['Total', summary.total],
      ['Core | Miles', `${summary.cores} | ${summary.milestones}`],
      ...summary.statusKeys.map(key => [titleCase(key), summary.statuses[key] || 0]),
      ['Overall', formatPercent(summary.overall)],
    ];
  }

  function ProgressCardGrid({ card, summary }) {
    const cards = buildProgressCards(summary);
    return e('div', { style:{ display:'grid', gridTemplateColumns:`repeat(${cards.length}, minmax(0, 1fr))`, gap:10 } },
      ...cards.map(([label, value]) => e('div', { key:label, style:card },
        e('div', { style:{ fontSize:24, fontWeight:700, color:'var(--text-1)', lineHeight:1.2 } }, value),
        e('div', { style:{ fontSize:11, color:'var(--text-4)', marginTop:4 } }, label)
      ))
    );
  }

  function PeriodSplitTable({ allRows, card, sectioned, mode }) {
    const coreById = React.useMemo(() => new Map(allRows.filter(row => row.type === 'core').map(row => [row.id, row])), [allRows]);
    const labels = mode === 'month'
      ? { last:'Prev Month (4W)', now:'This Month (4W)' }
      : { last:'Last Week',        now:'This Week' };
    // Order cores/orphans/children into a flat tree for rendering.
    function orderTreeRows(bucketRows) {
      const cores = bucketRows.filter(r => r.type === 'core');
      const orphans = bucketRows.filter(r => r.type === 'milestone' && !cores.some(c => c.id === r.parentTaskId));
      const children = bucketRows.filter(r => r.type === 'milestone' && cores.some(c => c.id === r.parentTaskId));
      const childrenByParent = new Map();
      children.forEach(c => {
        if (!childrenByParent.has(c.parentTaskId)) childrenByParent.set(c.parentTaskId, []);
        childrenByParent.get(c.parentTaskId).push(c);
      });
      const flat = [];
      cores.forEach(c => {
        flat.push(c);
        const kids = childrenByParent.get(c.id);
        if (kids) kids.forEach(k => flat.push(k));
      });
      orphans.forEach(o => flat.push(o));
      return flat;
    }
    return e('div', { style:{ display:'grid', gridTemplateColumns:'minmax(0, 1fr)', gap:16, marginTop:16 } },
      ...['last', 'now'].map(bucket => {
        const items = orderTreeRows(filterRowsByPeriod(allRows, mode, bucket));
        const weekSummary = summarizeRows(items);
        const title = labels[bucket];
        const weekProps = { key:bucket, style:{ border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden', background:'var(--sidebar-bg)' } };
        if (sectioned) weekProps['data-stat-section'] = bucket;
        return e('div', weekProps,
          e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderBottom:'1px solid var(--border-1)' } },
            e('div', { style:{ fontSize:14, fontWeight:700, color:'var(--text-1)' } }, title),
            e('div', { style:{ fontSize:12, fontWeight:600, color:'#fff', whiteSpace:'nowrap' } }, formatPeriodLabel(mode))
          ),
          e('div', { style:{ padding:12, borderBottom:'1px solid var(--border-1)', overflowX:'auto' } },
            e('div', { style:{ minWidth:860 } },
              e(ProgressCardGrid, { card, summary:weekSummary })
            )
          ),
          e('div', { style:{ maxHeight:'70vh', overflow:'auto' } },
            e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
              e('thead', null,
                e('tr', null,
                  ...['Task', 'Core Task', 'Status', 'Priority', 'Progress'].map(label => e('th', { key:label, style:{ textAlign:'left', fontSize:11, color:'var(--text-4)', padding:'10px 8px', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase' } }, label))
                )
              ),
              e('tbody', null,
                ...(items.length ? items : [{ id:`empty-${bucket}`, task:'—', status:'—', priority:'—' }]).map(row => {
                  const isChild = row.type === 'milestone' && coreById.has(row.parentTaskId);
                  const parentId = isChild ? row.parentTaskId : '';
                  const parent = parentId && coreById.get(parentId);
                  const indent = isChild ? '  ' : '';
                  return e('tr', { key:row.id, style:{ background:isChild ? 'transparent' : 'rgba(255,255,255,0.04)' } },
                    e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', fontWeight:isChild ? 500 : 700 } }, indent + (row.task || '—')),
                    e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-3)', fontSize:12 } }, isChild ? (parent ? parent.task : '—') : '—'),
                    e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', textTransform:'capitalize' } }, row.status || '—'),
                    e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', textTransform:'capitalize' } }, row.priority || '—'),
                    e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)' } }, row.task === '—' ? '—' : formatPercent(getEffectiveProgress(row, allRows)))
                  );
                })
              )
            )
          )
        );
      })
    );
  }

  function TaskListTree({ rows }) {
    const [collapsed, setCollapsed] = React.useState(() => new Set());
    const toggle = id => setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
    const cores = rows.filter(row => row.type === 'core');
    const orphans = rows.filter(row => row.type === 'milestone' && !cores.some(c => c.id === row.parentTaskId));
    const th = { textAlign:'left', fontSize:11, color:'var(--text-4)', padding:'12px 8px', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase' };
    const tdBase = { padding:'10px 8px', borderBottom:'1px solid var(--border-1)', verticalAlign:'top' };
    const renderRow = (row, isChild) => {
      const children = isChild ? [] : getChildMilestones(rows, row.id);
      const isOpen = !collapsed.has(row.id);
      const bg = isChild ? 'transparent' : 'rgba(255,255,255,0.04)';
      const fs = isChild ? 13 : 15;
      const fw = isChild ? 500 : 700;
      const indent = isChild ? 28 : 0;
      const marker = isChild ? '↳ ' : (children.length ? (isOpen ? '▼ ' : '▶ ') : '');
      const clickable = !isChild && children.length;
      return e(React.Fragment, { key:row.id },
        e('tr', { style:{ background:bg, cursor:clickable ? 'pointer' : 'default' }, onClick:clickable ? () => toggle(row.id) : undefined },
          e('td', { style:{ ...tdBase, minWidth:180, color:'var(--text-2)', fontSize:fs, fontWeight:fw, paddingLeft:8 + indent } },
            e('span', { style:{ color:'var(--text-4)', marginRight:4, userSelect:'none' } }, marker),
            row.task || '—'
          ),
          e('td', { style:{ ...tdBase, minWidth:200, color:'var(--text-3)', fontSize:fs } }, row.description || '—'),
          e('td', { style:{ ...tdBase, width:120, color:'var(--text-2)', textTransform:'capitalize', fontSize:fs } }, row.status),
          e('td', { style:{ ...tdBase, width:100, color:'var(--text-2)', textTransform:'capitalize', fontSize:fs } }, row.difficulty || '—'),
          e('td', { style:{ ...tdBase, width:100, color:'var(--text-2)', textTransform:'capitalize', fontSize:fs } }, row.priority || '—'),
          e('td', { style:{ ...tdBase, width:120, color:'var(--text-2)', fontSize:fs, fontWeight:isChild ? 500 : 700 } }, formatPercent(getEffectiveProgress(row, rows)))
        ),
        ...(isOpen ? children.map(child => renderRow(child, true)) : [])
      );
    };
    return e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
      e('thead', null,
        e('tr', null, ...['Task', 'Description', 'Status', 'Difficulty', 'Priority', 'Progress'].map(label => e('th', { key:label, style:th }, label)))
      ),
      e('tbody', null,
        ...cores.map(row => renderRow(row, false)),
        ...orphans.map(row => renderRow(row, true))
      )
    );
  }

  function StatSection({ shell, card, title, summary, countLabel, rows, allRows, sectioned, periodMode }) {
    const sectionShell = { ...shell, background:'#2e4976', padding:16 };
    const overviewProps = { style:{ display:'grid', gridTemplateColumns:'minmax(260px, 1fr) minmax(0, 1.4fr)', gap:16, alignItems:'stretch' } };
    const activityProps = { style:{ ...shell, padding:16, marginTop:16 } };
    const chartsProps = { style:{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:16, marginTop:16, alignItems:'stretch' } };
    const taskListProps = { style:{ ...shell, padding:16, marginTop:16 } };
    if (sectioned) {
      overviewProps['data-stat-section'] = 'overview';
      activityProps['data-stat-section'] = 'activity';
      chartsProps['data-stat-section'] = 'charts';
      taskListProps['data-stat-section'] = 'tasks';
    }
    const pickStatus = label => {
      const key = (summary.statusKeys || []).find(k => String(k).toLowerCase() === label);
      return key ? (summary.statuses[key] || 0) : 0;
    };
    const overviewCards = [
      ['Total', summary.total],
      ['Core / Miles', `${summary.cores} / ${summary.milestones}`],
      ['Complete', pickStatus('complete')],
      ['In Progress', pickStatus('in progress')],
    ];
    const overviewCell = { ...card, padding:14 };
    return e('div', { style:sectionShell },
      e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', marginBottom:12, flexWrap:'wrap' } },
        e('div', { style:{ fontSize:18, fontWeight:700, color:'var(--text-1)' } }, title),
        e('div', { style:{ display:'flex', gap:12, alignItems:'center' } },
          e('div', { style:{ fontSize:13, fontWeight:700, color:'#fff', whiteSpace:'nowrap' } }, formatPeriodLabel(periodMode)),
          e('div', { style:{ fontSize:12, color:'var(--text-4)' } }, countLabel)
        )
      ),
      e('div', overviewProps,
        e('div', { style:{ ...shell, padding:16, display:'grid', alignContent:'center' } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Overall Project'),
          e(DoughnutChart, { percent:summary.overall })
        ),
        e('div', { style:{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12 } },
          ...overviewCards.map(([label, value]) => e('div', { key:label, style:overviewCell },
            e('div', { style:{ fontSize:26, fontWeight:700, color:'var(--text-1)', lineHeight:1.2 } }, value),
            e('div', { style:{ fontSize:12, color:'var(--text-4)', marginTop:6 } }, label)
          ))
        )
      ),
      e('div', { style:{ ...shell, padding:16, marginTop:16 } },
        e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Task Status'),
        e(StatusBarChart, { summary })
      ),
      (summary.activityKeys && summary.activityKeys.length) ? e('div', activityProps,
        e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Activity'),
        e(ActivityBarChart, { summary })
      ) : null,
      e('div', chartsProps,
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Difficulty'),
          e(DifficultyBarChart, { summary })
        ),
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Priority'),
          e(PriorityBarChart, { summary })
        )
      ),
      e('div', taskListProps,
        e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 } },
          e('div', { style:{ fontSize:14, fontWeight:600, color:'var(--text-2)' } }, 'Task List'),
          e('div', { style:{ fontSize:12, fontWeight:600, color:'#fff', whiteSpace:'nowrap' } }, formatPeriodLabel(periodMode))
        ),
        e('div', { style:{ minWidth:860, marginBottom:16, overflowX:'auto' } },
          e(ProgressCardGrid, { card, summary })
        ),
        e('div', { style:{ maxHeight:'80vh', overflow:'auto' } },
          e(TaskListTree, { rows })
        )
      ),
      e(PeriodSplitTable, { allRows:allRows || rows, card, sectioned, mode:periodMode })
    );
  }

  function collectSheetTabs(metaTabs, rows) {
    const seen = new Set();
    const out = [];
    (Array.isArray(metaTabs) ? metaTabs : []).forEach(title => {
      const text = String(title || '').trim();
      if (!text || seen.has(text)) return;
      seen.add(text);
      out.push(text);
    });
    (Array.isArray(rows) ? rows : []).forEach(row => {
      const text = String(row?.sourceSheet || '').trim();
      if (!text || seen.has(text)) return;
      seen.add(text);
      out.push(text);
    });
    return out;
  }

  function DateCell({ value, onChange, inputStyle }) {
    const pickerRef = React.useRef(null);
    return e('div', { style:{ position:'relative' } },
      e('input', {
        value,
        placeholder:'YYYY-MM-DD',
        onChange:ev => onChange(ev.target.value),
        onPaste:ev => {
          const text = ev.clipboardData.getData('text').trim();
          if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            ev.preventDefault();
            onChange(text);
          }
        },
        style:{ ...inputStyle, paddingRight:34 }
      }),
      e('button', {
        type:'button',
        onClick:() => {
          const picker = pickerRef.current;
          if (!picker) return;
          if (picker.showPicker) picker.showPicker();
          else picker.click();
        },
        style:{ position:'absolute', right:4, top:4, width:26, height:26, border:'none', background:'transparent', color:'var(--text-3)', cursor:'pointer', padding:0 }
      }, '📅'),
      e('input', {
        ref:pickerRef,
        type:'date',
        value,
        onChange:ev => onChange(ev.target.value),
        style:{ position:'absolute', opacity:0, pointerEvents:'none', width:1, height:1 }
      })
    );
  }

  function TrackerView({ user, onDirtyChange, tab: tabProp, onTabChange, selectedSheet: selectedSheetProp, onSelectedSheetChange, onSheetTabsChange }) {
    const shell = { border:'1px solid var(--border-1)', borderRadius:16, background:'var(--sidebar-bg)', boxShadow:'0 18px 36px rgba(15,23,42,0.16)' };
    const card = { border:'1px solid var(--border-1)', borderRadius:12, background:'#06090F', padding:'14px 16px' };
    const inputStyle = { width:'100%', border:'1px solid var(--border-1)', borderRadius:10, background:'var(--app-bg)', color:'var(--text-1)', padding:'10px 12px', fontSize:12, outline:'none', fontFamily:'inherit' };
    const [rows, setRows] = React.useState(() => normalizeRows(DEFAULT_ROWS));
    const [savedJson, setSavedJson] = React.useState(JSON.stringify(normalizeRows(DEFAULT_ROWS)));
    const [meta, setMeta] = React.useState({ loading:true, saving:false, error:'', updatedAt:null, updatedBy:null, storage:'server', sheetTabs:[] });
    const [dragId, setDragId] = React.useState('');
    // Controlled from parent when props provided; fall back to local for standalone use.
    const [localTab, setLocalTab] = React.useState('statistics');
    const [localSheet, setLocalSheet] = React.useState('all');
    // Statistics view period: 'week' | 'month'. Persisted to localStorage.
    const [periodMode, setPeriodMode] = React.useState(() => {
      try { return localStorage.getItem('tracker.periodMode') === 'month' ? 'month' : 'week'; }
      catch { return 'week'; }
    });
    React.useEffect(() => {
      try { localStorage.setItem('tracker.periodMode', periodMode); } catch {}
    }, [periodMode]);
    const tab = tabProp !== undefined ? tabProp : localTab;
    const setTab = onTabChange || setLocalTab;
    const selectedSheet = selectedSheetProp !== undefined ? selectedSheetProp : localSheet;
    const setSelectedSheet = onSelectedSheetChange || setLocalSheet;
    const [selectedOwner, setSelectedOwner] = React.useState('');
    const [source, setSource] = React.useState({ loading:true, saving:false, error:'', source:'none', spreadsheetId:'', spreadsheetName:'', tabs:[], lockedByEnv:false, rootFolder:null, files:[], folders:[], selectedFolderId:'', availableTabs:[], selectedSpreadsheetId:'', selectedTabs:[] });
    const [batchMeta, setBatchMeta] = React.useState(() => {
      try { return { version:'', startDate:'', endDate:'', ...(JSON.parse(localStorage.getItem('tracker.batchMeta') || '{}')) }; }
      catch { return { version:'', startDate:'', endDate:'' }; }
    });
    React.useEffect(() => {
      try { localStorage.setItem('tracker.batchMeta', JSON.stringify(batchMeta)); } catch {}
    }, [batchMeta]);
    const dirty = JSON.stringify(rows) !== savedJson;
    const scrollRef = React.useRef(null);
    const animRef = React.useRef(0);
    const animateScrollTo = React.useCallback((target) => {
      const container = scrollRef.current;
      if (!container) return;
      cancelAnimationFrame(animRef.current);
      const start = container.scrollTop;
      const distance = target - start;
      if (!distance) return;
      const duration = Math.min(700, 300 + Math.abs(distance) * 0.4);
      const t0 = performance.now();
      // easeInOutCubic
      const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        container.scrollTop = start + distance * ease(p);
        if (p < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    }, []);
    const scrollToNextSection = React.useCallback(() => {
      const container = scrollRef.current;
      if (!container) return;
      const nodes = Array.from(container.querySelectorAll('[data-stat-section]'));
      if (!nodes.length) { animateScrollTo(0); return; }
      const cRect = container.getBoundingClientRect();
      const current = container.scrollTop;
      const tops = nodes.map(n => current + (n.getBoundingClientRect().top - cRect.top));
      const threshold = container.clientHeight * 0.3;
      const nextIdx = tops.findIndex(top => top > current + threshold);
      animateScrollTo(nextIdx === -1 ? 0 : tops[nextIdx]);
    }, [animateScrollTo]);

    React.useEffect(() => {
      let active = true;
      loadTrackerRows().then(data => {
        if (!active) return;
        const nextRows = normalizeRows(data.rows);
        setRows(nextRows);
        setSavedJson(JSON.stringify(nextRows));
        setMeta({ loading:false, saving:false, error:'', updatedAt:data.updatedAt || null, updatedBy:data.updatedBy || null, storage:data.storage || 'server', sheetTabs:Array.isArray(data.sheetTabs) ? data.sheetTabs : [] });
      }).catch(err => {
        if (!active) return;
        setMeta({ loading:false, saving:false, error:'Load failed: ' + err.message, updatedAt:null, updatedBy:null, storage:'server', sheetTabs:[] });
      });
      return () => { active = false; };
    }, []);

    React.useEffect(() => {
      let active = true;
      Promise.all([loadTrackerSource(), loadTrackerFolders()]).then(([statusData, foldersData]) => {
        if (!active) return;
        const folders = Array.isArray(foldersData) ? foldersData : [];
        const selectedSpreadsheetId = statusData.spreadsheetId || '';
        const selectedTabs = Array.isArray(statusData.tabs) ? statusData.tabs : [];
        setSource(prev => ({
          ...prev,
          loading:false,
          error:'',
          source:statusData.source || 'none',
          spreadsheetId:selectedSpreadsheetId,
          spreadsheetName:statusData.spreadsheetName || '',
          tabs:selectedTabs,
          lockedByEnv:!!statusData.lockedByEnv,
          rootFolder:statusData.folderId ? { id:statusData.folderId, name:statusData.folderName || '', path:statusData.folderPath || statusData.folderName || '' } : null,
          files:[],
          folders,
          selectedFolderId:statusData.folderId || '',
          selectedSpreadsheetId,
          selectedTabs,
        }));
        if (!statusData.folderId) {
          setSource(prev => ({ ...prev, availableTabs:[] }));
          return null;
        }
        return loadTrackerFiles(statusData.folderId).then(filesData => {
          if (!active) return null;
          const files = Array.isArray(filesData.files) ? filesData.files : [];
          setSource(prev => ({ ...prev, rootFolder:filesData.rootFolder || prev.rootFolder, files }));
          if (!selectedSpreadsheetId) {
            setSource(prev => ({ ...prev, availableTabs:[] }));
            return null;
          }
          return loadTrackerTabs(selectedSpreadsheetId).then(tabData => {

            setSource(prev => ({ ...prev, availableTabs:Array.isArray(tabData.tabs) ? tabData.tabs : [], spreadsheetName:prev.spreadsheetName || tabData.title || '' }));
            return null;
          });
        });
      }).catch(err => {
        if (!active) return;
        setSource(prev => ({ ...prev, loading:false, error:'Source load failed: ' + err.message }));
      });
      return () => { active = false; };
    }, []);

    React.useEffect(() => {
      if (!onDirtyChange) return undefined;
      onDirtyChange(dirty);
      return () => onDirtyChange(false);
    }, [dirty, onDirtyChange]);

    React.useEffect(() => {
      const handler = ev => {
        if (!dirty) return;
        ev.preventDefault();
        ev.returnValue = '';
      };
      window.addEventListener('beforeunload', handler);
      return () => window.removeEventListener('beforeunload', handler);
    }, [dirty]);
    const dirtyRef = React.useRef(dirty);
    dirtyRef.current = dirty;

    // Periodic refresh from GSheet (every 30s, skip if dirty)
    React.useEffect(() => {
      const id = setInterval(() => {
        if (!dirtyRef.current) {
          loadTrackerRows().then(data => {
            const nextRows = normalizeRows(data.rows);
            setRows(nextRows);
            setSavedJson(JSON.stringify(nextRows));
          }).catch(() => {});
        }
      }, 30000);
      return () => clearInterval(id);
    }, []);

    const ownerGroups = React.useMemo(() => groupByOwner(rows), [rows]);
    const taskLabelForSelect = React.useCallback((options, id) => {
      const found = options.find(o => o.id === id);
      return found ? found.task : '';
    }, []);
    const coreOptions = React.useMemo(() => rows.filter(row => row.type === 'core' && row.task.trim()), [rows]);
    const coreById = React.useMemo(() => new Map(rows.filter(row => row.type === 'core').map(row => [row.id, row])), [rows]);
    const sheetTabs = React.useMemo(() => collectSheetTabs(meta.sheetTabs, rows), [meta.sheetTabs, rows]);
    const sheetTabsKey = sheetTabs.join('|');
    React.useEffect(() => {
      if (onSheetTabsChange) onSheetTabsChange(sheetTabs);
      // ponytail: join-key dep prevents re-fire when memo returns new array with same values
    }, [sheetTabsKey]);
    const statRows = React.useMemo(() => selectedSheet === 'all' ? rows : rows.filter(row => row.sourceSheet === selectedSheet), [rows, selectedSheet]);
    // Period filter: keep rows relevant to current period (this + last = "berjalan hingga 1 sebelum").
    // Milestone: passes periodBuckets. Core: itself passes OR any child milestone passes (keep parent context).
    // ponytail: O(n) per row on core lookup via .some — fine at tracker scale (<1k rows).
    const periodStatRows = React.useMemo(() => filterRowsByPeriod(statRows, periodMode, 'now'), [statRows, periodMode]);
    const visibleOwnerGroups = React.useMemo(() => groupByOwner(periodStatRows), [periodStatRows]);
    const visibleGroup = React.useMemo(() => visibleOwnerGroups.find(group => group.owner === selectedOwner) || null, [visibleOwnerGroups, selectedOwner]);
    const overallSummary = React.useMemo(() => summarizeRows(periodStatRows), [periodStatRows]);

    React.useEffect(() => {
      if (selectedSheet === 'all') return;
      if (sheetTabs.includes(selectedSheet)) return;
      setSelectedSheet('all');
    }, [sheetTabs, selectedSheet]);

    React.useEffect(() => {
      if (!selectedOwner) return;
      if (visibleOwnerGroups.some(group => group.owner === selectedOwner)) return;
      setSelectedOwner('');
    }, [visibleOwnerGroups, selectedOwner]);

    function patchRow(id, key, value) {
      setRows(prev => normalizeRows(prev.map(row => {
        if (row.id !== id) return row;
        const next = { ...row, [key]: key === 'progress' ? normalizeProgress(value) : value };
        if (key === 'type' && value !== 'milestone') next.parentTaskId = '';
        if (key === 'status') {
          if (value === 'new' || value === 'waiting') next.progress = 0;
          else if (value === 'complete') next.progress = 100;
        }
        return next;
      })));
    }

    function addRow() {
      setRows(prev => prev.concat(normalizeRow({ id:`row-${Date.now()}`, owner:'', sourceSheet:(prev[prev.length - 1]?.sourceSheet || 'Sheet1'), type:'core', parentTaskId:'', task:'', description:'', status:'new', progress:0, priority:'', week:'' }, prev.length)));
    }

    function removeRow(id) {
      setRows(prev => normalizeRows(prev.filter(row => row.id !== id)));
    }

    function handleSave() {
      const invalidMilestone = rows.find(row => row.type === 'milestone' && !row.parentTaskId);
      if (invalidMilestone) {
        setMeta(prev => ({ ...prev, error:'Milestone harus pilih parent task.' }));
        setTab('input');
        return;
      }
      const invalidProgress = rows.find(row => {
        const hasChildren = row.type === 'core' && getChildMilestones(rows, row.id).length > 0;
        if (hasChildren) return false;
        return (row.status === 'in progress' || row.status === 'hold') && (!row.progress || row.progress <= 0);
      });
      if (invalidProgress) {
        setMeta(prev => ({ ...prev, error:`Task "${invalidProgress.task || invalidProgress.id}" status ${invalidProgress.status} wajib isi progress.` }));
        setTab('input');
        return;
      }
      if (!dirty || meta.saving) return;
      setMeta(prev => ({ ...prev, saving:true, error:'' }));
      // Convert synthetic parentTaskId (row-N) back to parent task TITLE so
      // the gsheet "Parent Task" cell stores the human string, not FE ids.
      // Server (Scripts/tracker-sheets.js) writes whatever field it receives.
      const payload = rows.map(row => {
        if (row.type !== 'milestone' || !row.parentTaskId) return row;
        const parent = coreById.get(row.parentTaskId);
        return parent ? { ...row, parentTask: parent.task, parentTaskId: '' } : row;
      });
      saveTrackerRows(payload, user?.name || user?.username || 'user').then(data => {
        const snapshot = JSON.stringify(rows);
        setSavedJson(snapshot);
        setMeta(prev => ({ ...prev, loading:false, saving:false, error:'', updatedAt:data.updatedAt || null, updatedBy:data.updatedBy || null, storage:data.storage || 'server', sheetTabs:Array.isArray(data.sheetTabs) ? data.sheetTabs : prev.sheetTabs }));
      }).catch(err => {
        setMeta(prev => ({ ...prev, saving:false, error:'Save failed: ' + err.message }));
      });
    }

    function patchSelectedTabs(title, checked) {
      setSource(prev => {
        const cur = new Set(prev.selectedTabs || []);
        if (checked) cur.add(title);
        else cur.delete(title);
        return { ...prev, selectedTabs:Array.from(cur) };
      });
    }

    function handleSpreadsheetChange(nextId) {
      setSource(prev => ({ ...prev, selectedSpreadsheetId:nextId, selectedTabs:[], availableTabs:[], error:'' }));
      if (!nextId) return;
      loadTrackerTabs(nextId).then(tabData => {
        setSource(prev => {
          const availableTabs = Array.isArray(tabData.tabs) ? tabData.tabs : [];
          const selectedTabs = Array.isArray(prev.tabs) ? prev.tabs.filter(title => availableTabs.some(tab => tab.title === title)) : [];
          return { ...prev, availableTabs, selectedTabs, spreadsheetName:(prev.files.find(file => file.id === nextId)?.name || tabData.title || prev.spreadsheetName || '') };
        });
      }).catch(err => {
        setSource(prev => ({ ...prev, error:'Tabs load failed: ' + err.message }));
      });
    }

    function handleFolderChange(nextId) {
      setSource(prev => ({ ...prev, selectedFolderId:nextId, selectedSpreadsheetId:'', selectedTabs:[], availableTabs:[], files:[], error:'' }));
    }

    function handleSaveFolder() {
      if (source.saving || source.lockedByEnv) return;
      if (!source.selectedFolderId) {
        setSource(prev => ({ ...prev, error:'Pilih folder Google Drive dulu.' }));
        return;
      }
      const pickedFolder = source.folders.find(folder => folder.id === source.selectedFolderId);
      if (!pickedFolder) {
        setSource(prev => ({ ...prev, error:'Folder Google Drive tidak ditemukan.' }));
        return;
      }
      setSource(prev => ({ ...prev, saving:true, error:'' }));
      saveTrackerFolder({ folderId:pickedFolder.id, folderName:pickedFolder.name, folderPath:pickedFolder.path }).then(() => Promise.all([loadTrackerSource(), loadTrackerFiles(pickedFolder.id)])).then(([statusData, filesData]) => {
        setSource(prev => ({
          ...prev,
          saving:false,
          rootFolder:filesData.rootFolder || (statusData.folderId ? { id:statusData.folderId, name:statusData.folderName || '', path:statusData.folderPath || statusData.folderName || '' } : null),
          files:Array.isArray(filesData.files) ? filesData.files : [],
          selectedFolderId:statusData.folderId || '',
          selectedSpreadsheetId:'',
          selectedTabs:[],
          availableTabs:[],
          spreadsheetId:'',
          spreadsheetName:'',
          tabs:[],
        }));
      }).catch(err => {
        setSource(prev => ({ ...prev, saving:false, error:'Folder save failed: ' + err.message }));
      });
    }

    function handleSaveSource() {
      if (source.saving || source.lockedByEnv) return;
      if (!source.selectedSpreadsheetId) {
        setSource(prev => ({ ...prev, error:'Pilih file Google Sheets dulu.' }));
        return;
      }
      if (!source.selectedTabs.length) {
        setSource(prev => ({ ...prev, error:'Pilih minimal 1 sheet/tab statistic.' }));
        return;
      }
      setSource(prev => ({ ...prev, saving:true, error:'' }));
      const pickedFile = source.files.find(file => file.id === source.selectedSpreadsheetId);
      saveTrackerSource({ spreadsheetId:source.selectedSpreadsheetId, spreadsheetName:pickedFile?.name || source.spreadsheetName || '', tabs:source.selectedTabs }).then(() => Promise.all([loadTrackerSource(), loadTrackerRows()])).then(([statusData, trackerData]) => {
        const nextRows = normalizeRows(trackerData.rows);
        const nextTabs = Array.isArray(statusData.tabs) ? statusData.tabs : [];
        setRows(nextRows);
        setSavedJson(JSON.stringify(nextRows));
        setMeta(prev => ({ ...prev, loading:false, saving:false, error:'', updatedAt:trackerData.updatedAt || null, updatedBy:trackerData.updatedBy || null, storage:trackerData.storage || 'server', sheetTabs:Array.isArray(trackerData.sheetTabs) ? trackerData.sheetTabs : [] }));
        setSource(prev => ({
          ...prev,
          saving:false,
          error:'',
          source:statusData.source || 'user',
          spreadsheetId:statusData.spreadsheetId || '',
          spreadsheetName:statusData.spreadsheetName || '',
          tabs:nextTabs,
          selectedSpreadsheetId:statusData.spreadsheetId || '',
          selectedTabs:nextTabs,
          availableTabs:(prev.availableTabs || []).filter(tab => nextTabs.includes(tab.title)),
        }));
      }).catch(err => {
        setMeta(prev => ({ ...prev, saving:false, error:'Tracker source save failed: ' + err.message }));
        setSource(prev => ({ ...prev, saving:false, error:'Tracker source save failed: ' + err.message }));
      });
    }

    const statsSavedLabel = meta.saving
      ? 'Saving...'
      : meta.loading
        ? 'Loading...'
        : !rows.length
          ? 'Belum ada data'
          : dirty
            ? 'Belum disimpan'
            : meta.updatedAt
              ? `Saved ${meta.updatedAt}${meta.updatedBy ? ` by ${meta.updatedBy}` : ''}${meta.storage === 'local' ? ' (local)' : ''}${meta.storage === 'google-sheets' && meta.sheetTabs.length ? ` · ${meta.sheetTabs.join(', ')}` : ''}`
              : meta.storage === 'local' ? 'Sudah disimpan (local)' : 'Sudah disimpan';
    const sourceBox = e('div', { style:{ ...shell, padding:'12px 14px', width:'100%' } },
      e('div', { style:{ fontSize:12, fontWeight:700, color:'var(--text-1)', marginBottom:8 } }, 'Google Sheets Source'),
      e('div', { style:{ fontSize:11, color:'var(--text-4)', marginBottom:10 } }, source.rootFolder?.path ? `Folder: ${source.rootFolder.path}` : 'Folder Google Drive tracker belum dipilih.'),
      e('div', { style:{ display:'grid', gap:10 } },
        e('div', { style:{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' } },
          e('select', { value:source.selectedFolderId, disabled:source.loading || source.lockedByEnv || source.saving, onChange:ev => handleFolderChange(ev.target.value), style:{ ...inputStyle, minWidth:220, flex:'1 1 240px' } },
            e('option', { value:'' }, source.loading ? 'Loading folders...' : 'Pilih folder Google Drive'),
            ...(source.folders || []).map(folder => e('option', { key:folder.id, value:folder.id }, folder.path))
          ),
          e('button', { type:'button', disabled:source.loading || source.lockedByEnv || source.saving || !source.selectedFolderId, onClick:handleSaveFolder, style:{ border:'1px solid var(--border-1)', background:(source.loading || source.lockedByEnv || source.saving || !source.selectedFolderId) ? 'var(--border-2)' : '#1d4ed8', color:(source.loading || source.lockedByEnv || source.saving || !source.selectedFolderId) ? 'var(--text-4)' : '#fff', borderRadius:10, padding:'10px 16px', fontSize:12, fontWeight:600, cursor:(source.loading || source.lockedByEnv || source.saving || !source.selectedFolderId) ? 'not-allowed' : 'pointer' } }, 'Save folder')
        ),
        e('select', { value:source.selectedSpreadsheetId, disabled:source.loading || source.lockedByEnv || source.saving, onChange:ev => handleSpreadsheetChange(ev.target.value), style:inputStyle },
          e('option', { value:'' }, !source.rootFolder ? 'Pilih folder dulu' : (source.loading ? 'Loading files...' : 'Pilih file Google Sheets')),
          ...(source.files || []).map(file => e('option', { key:file.id, value:file.id }, file.name))
        ),
        e('div', { style:{ display:'flex', flexWrap:'wrap', gap:8 } },
          ...(source.availableTabs || []).length
            ? source.availableTabs.map(tabInfo => e('label', { key:tabInfo.sheetId || tabInfo.title, style:{ display:'inline-flex', alignItems:'center', gap:6, border:'1px solid var(--border-1)', borderRadius:999, padding:'6px 10px', fontSize:11, color:'var(--text-2)', background:'var(--app-bg)' } },
                e('input', { type:'checkbox', checked:(source.selectedTabs || []).includes(tabInfo.title), onChange:ev => patchSelectedTabs(tabInfo.title, ev.target.checked) }),
                tabInfo.title
              ))
            : [e('div', { key:'empty-tabs', style:{ fontSize:11, color:'var(--text-4)' } }, source.selectedSpreadsheetId ? 'File belum punya sheet/tab atau tabs belum termuat.' : 'Pilih file dulu.')]
        ),
        e('div', { style:{ display:'flex', justifyContent:'space-between', gap:10, alignItems:'center' } },
          e('div', { style:{ fontSize:11, color:source.error ? '#dc2626' : 'var(--text-4)' } }, source.error || `Current: ${source.spreadsheetName || '-'} · ${source.tabs.length ? source.tabs.join(', ') : '-'} · ${sourceLabel(source.source)}`),
          e('button', { type:'button', disabled:source.loading || source.lockedByEnv || source.saving, onClick:handleSaveSource, style:{ border:'1px solid var(--border-1)', background:(source.loading || source.lockedByEnv || source.saving) ? 'var(--border-2)' : '#0f766e', color:(source.loading || source.lockedByEnv || source.saving) ? 'var(--text-4)' : '#fff', borderRadius:10, padding:'10px 16px', fontSize:12, fontWeight:600, cursor:(source.loading || source.lockedByEnv || source.saving) ? 'not-allowed' : 'pointer' } }, 'Use for statistics')
        )
      )
    );

    return e('div', { style:{ display:'flex', minHeight:0, height:'100%' } },
      // Right panel — all main content
      e('div', { ref:scrollRef, style:{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:16, minHeight:0, overflowY:'auto', padding:'16px 24px', position:'relative' } },
        e('div', { style:{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', flexWrap:'wrap' } },
          e('div', { style:{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' } },
            e('div', { style:{ fontSize:13, fontWeight:700, color:'var(--text-1)' } }, tab === 'input' ? 'Input Table' : (selectedSheet === 'all' ? 'Statistic · All Sheets' : `Statistic · ${selectedSheet}`)),
            e('button', { type:'button', onClick:addRow, style:{ border:'1px solid var(--border-1)', background:'var(--sidebar-bg)', color:'var(--text-2)', borderRadius:999, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer' } }, '+ Row'),
            tab === 'statistics' ? e('div', { style:{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap', marginLeft:8 } },
              e('div', { style:{ display:'inline-flex', border:'1px solid var(--border-1)', borderRadius:999, overflow:'hidden' } },
                ...['week', 'month'].map(mode => e('button', {
                  key:mode,
                  type:'button',
                  onClick:() => setPeriodMode(mode),
                  style:{ border:'none', background:periodMode === mode ? '#2563eb' : 'transparent', color:periodMode === mode ? '#fff' : 'var(--text-2)', padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }
                }, mode))
              ),
              e('input', { type:'text', value:batchMeta.version, onChange:ev => setBatchMeta(prev => ({ ...prev, version:ev.target.value })), placeholder:'Version', style:{ ...inputStyle, width:140, padding:'8px 10px' } }),
              e('div', { style:{ minWidth:150 } }, e(DateCell, { value:batchMeta.startDate, onChange:value => setBatchMeta(prev => ({ ...prev, startDate:value })), inputStyle:{ ...inputStyle, padding:'8px 10px' } })),
              e('div', { style:{ minWidth:150 } }, e(DateCell, { value:batchMeta.endDate, onChange:value => setBatchMeta(prev => ({ ...prev, endDate:value })), inputStyle:{ ...inputStyle, padding:'8px 10px' } }))
            ) : null
          ),
          tab === 'input' ? e('button', { type:'button', disabled:meta.saving || !dirty, onClick:handleSave, style:{ border:'1px solid ' + ((!dirty || meta.saving) ? 'var(--border-1)' : '#0f766e'), background:(!dirty || meta.saving) ? 'var(--border-2)' : '#0f766e', color:(!dirty || meta.saving) ? 'var(--text-4)' : '#fff', borderRadius:999, padding:'9px 16px', fontSize:12, fontWeight:700, cursor:(!dirty || meta.saving) ? 'not-allowed' : 'pointer' } }, meta.saving ? 'Saving...' : 'Save') : null
        ),
        tab === 'input' ? sourceBox : null,
        meta.error ? e('div', { style:{ ...shell, padding:'10px 12px', color:'#fecaca', background:'#3b0d0d', borderColor:'#7f1d1d', fontSize:12 } }, meta.error) : null,
        e('div', { style:{ fontSize:11, color:'var(--text-4)' } }, statsSavedLabel),
        tab === 'statistics'
          ? e('div', { style:{ display:'grid', gridTemplateColumns:'minmax(0,1fr)', gap:18, alignItems:'start' } },
              e('div', { style:{ display:'grid', gap:18, minWidth:0 } },
                e(StatSection, { shell, card, title:selectedSheet === 'all' ? 'All Sheets' : selectedSheet, summary:overallSummary, countLabel:`${periodStatRows.length} rows · ${periodMode === 'month' ? 'past 4 weeks' : 'this week'}`, rows:periodStatRows, allRows:statRows, sectioned:true, periodMode }),
                e('div', { style:{ display:'grid', gap:10 } },
                  e('div', { style:{ fontSize:14, fontWeight:700, color:'var(--text-1)' } }, 'Owner Breakdown'),
                  e('div', { style:{ display:'flex', gap:8, flexWrap:'wrap' } },
                    ...visibleOwnerGroups.map(group => e('button', {
                      key:group.owner,
                      type:'button',
                      onClick:() => setSelectedOwner(group.owner),
                      style:{ border:'1px solid ' + (selectedOwner === group.owner ? '#2563eb' : 'var(--border-1)'), background:selectedOwner === group.owner ? '#1d4ed8' : 'var(--sidebar-bg)', color:selectedOwner === group.owner ? '#fff' : 'var(--text-2)', borderRadius:999, padding:'7px 12px', fontSize:11, fontWeight:600, cursor:'pointer' }
                    }, `${group.owner} · ${group.rows.length}`))
                  ),
                  e('div', { style:{ display:'grid', gap:16 } },
                    visibleGroup ? e(StatSection, { shell, card, title:visibleGroup.owner, summary:visibleGroup.summary, countLabel:`${visibleGroup.rows.length} rows`, rows:visibleGroup.rows, allRows:statRows.filter(r => r.owner === visibleGroup.owner), periodMode }) : null
                  )
                )
              )
            )
          : e('div', { style:{ ...shell, overflow:'visible', minHeight:0 } },
              e('div', { style:{ overflowX:'auto', overflowY:'visible' } },
                e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
                  e('thead', null,
                    e('tr', { style:{ background:'var(--app-bg)' } },
                      ...['Owner', 'Sheet', 'Type', 'Parent Task', 'Task', 'Description', 'Activity', 'Status', 'Difficulty', 'Priority', 'Week', 'Progress', 'Version', 'Date', 'Start', 'End', 'Ver Start', 'Ver End', 'Action'].map(label => {
                        const isWide = label === 'Parent Task' || label === 'Task' || label === 'Description';
                        return e('th', { key:label, style:{ textAlign:'left', padding:'12px 10px', fontSize:11, color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase', position:'sticky', top:0, background:'var(--app-bg)', zIndex:1, ...(isWide ? { maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } : {}) } }, label);
                      })
                    )
                  ),
                  e('tbody', null,
                    ...rows.map(row => e('tr', {
                      key:row.id,
                      draggable:true,
                      onDragStart:() => setDragId(row.id),
                      onDragOver:ev => ev.preventDefault(),
                      onDrop:ev => {
                        ev.preventDefault();
                        if (!dragId || dragId === row.id) return;
                        setRows(prev => moveRow(prev, dragId, row.id));
                        setDragId('');
                      },
                      onDragEnd:() => setDragId('')
                    },
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.owner, onChange:ev => patchRow(row.id, 'owner', ev.target.value), style:inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.sourceSheet, onChange:ev => patchRow(row.id, 'sourceSheet', ev.target.value), style:inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.type, onChange:ev => patchRow(row.id, 'type', ev.target.value), style:inputStyle }, ...TYPE_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, e('select', { value:row.parentTaskId, onChange:ev => patchRow(row.id, 'parentTaskId', ev.target.value), style:inputStyle, disabled:row.type !== 'milestone', title:taskLabelForSelect(coreOptions, row.parentTaskId) }, e('option', { value:'' }, row.type === 'milestone' ? 'Select parent' : 'N/A'), ...coreOptions.filter(option => option.id !== row.id && option.sourceSheet === row.sourceSheet).map(option => e('option', { key:option.id, value:option.id }, option.task || option.id)))) ,
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, e('input', { value:row.task, onChange:ev => patchRow(row.id, 'task', ev.target.value), style:{ ...inputStyle, width:'100%' }, title:row.task })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } }, e('textarea', { value:row.description, onChange:ev => patchRow(row.id, 'description', ev.target.value), rows:2, style:{ ...inputStyle, minHeight:56, resize:'vertical', width:'100%' }, title:row.description })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.activity, onChange:ev => patchRow(row.id, 'activity', ev.target.value), style:inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.status, onChange:ev => patchRow(row.id, 'status', ev.target.value), style:inputStyle }, ...overallSummary.statusKeys.map(opt => e('option', { key:opt, value:opt }, opt)))),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.difficulty, onChange:ev => patchRow(row.id, 'difficulty', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...overallSummary.difficultyKeys.map(opt => e('option', { key:opt, value:opt }, opt)))),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.priority, onChange:ev => patchRow(row.id, 'priority', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...overallSummary.priorityKeys.map(opt => e('option', { key:opt, value:opt }, opt)))),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.week, onChange:ev => patchRow(row.id, 'week', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...WEEK_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:120 } }, e('input', { type:'number', min:0, max:100, step:1, value:row.progress, onChange:ev => patchRow(row.id, 'progress', ev.target.value), style:inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.version, onChange:ev => patchRow(row.id, 'version', ev.target.value), style:inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.date, onChange:value => patchRow(row.id, 'date', value), inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.startDate, onChange:value => patchRow(row.id, 'startDate', value), inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.endDate, onChange:value => patchRow(row.id, 'endDate', value), inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.verStartDate, onChange:value => patchRow(row.id, 'verStartDate', value), inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.verEndDate, onChange:value => patchRow(row.id, 'verEndDate', value), inputStyle })),
                      e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('button', { type:'button', onClick:() => removeRow(row.id), style:{ border:'1px solid #7f1d1d', background:'#3b0d0d', color:'#fecaca', borderRadius:10, padding:'8px 10px', fontSize:11, cursor:'pointer' } }, 'Delete'))
                    ))
                  )
                )
              )
            )
      ),
      tab === 'statistics' ? e('button', {
        type:'button',
        onClick:scrollToNextSection,
        title:'Scroll to next section (wraps to top)',
        'aria-label':'Scroll to next section',
        style:{ position:'fixed', right:24, bottom:24, zIndex:50, width:52, height:52, borderRadius:'50%', border:'1px solid #1d4ed8', background:'#2563eb', color:'#fff', fontSize:22, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 20px rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }
      }, '↓') : null
    );
  }
  return { TrackerView };
})();
