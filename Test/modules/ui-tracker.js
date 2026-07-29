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

  // ── Dark dashboard theme (spec v1.0) ────────────────────────────────
  // Applied inline; does NOT override global CSS vars, so rest of the app
  // (editor sidebar, QA browser) keeps its existing look.
  const THEME = {
    bgMain:'#0B0F14', bgSecondary:'#11161C', cardBg:'#121820',
    tableHeaderBg:'#151B23', hoverBg:'#171F28',
    border:'#263244', divider:'#232A36',
    textPrimary:'#E6EAF1', textSecondary:'#A7B1C2', textMuted:'#6B7280',
    info:'#3B82F6', success:'#22C55E', warning:'#F59E0B', danger:'#EF4444',
    waiting:'#8B5CF6', purple:'#8B5CF6', overall:'#06B6D4',
  };
  const KPI_ACCENT = {
    total: THEME.info,
    'core / milestone': THEME.purple,
    complete: THEME.success,
    'in progress': THEME.info,
    'on hold': THEME.warning,
    waiting: THEME.waiting,
    overall: THEME.overall,
  };
  const STATUS_COLOR = {
    complete: THEME.success,
    'in progress': THEME.info,
    'on hold': THEME.warning,
    waiting: THEME.waiting,
    // ponytail: unknown status → muted dot. Add more when new statuses appear in data.
  };
  const PRIORITY_COLOR = {
    high: THEME.danger,
    moderate: THEME.warning,
    medium: THEME.warning,   // alias
    low: THEME.success,
  };
  // Status → bar color (extends STATUS_COLOR w/ new/developed). Spec §chart colors.
  const STATUS_BAR_COLOR = {
    complete:      THEME.success,   // #22C55E
    'in progress': THEME.info,      // #3B82F6
    'on hold':     THEME.warning,   // #F59E0B
    waiting:       THEME.waiting,   // #8B5CF6
    new:           '#60A5FA',       // light blue
    developed:     '#93C5FD',       // lighter blue
    tested:        THEME.success,
  };
  // Fixed render order for Task Status chart per spec.
  const STATUS_ORDER = ['complete', 'in progress', 'on hold', 'waiting', 'new', 'developed'];
  // Activity semantic color map. ponytail: hard-coded 5 keys per spec; unknowns
  // fall back to PALETTE index so new activities still render.
  const ACTIVITY_COLOR = {
    analysis:     THEME.success,   // green
    testing:      THEME.warning,   // orange
    meeting:      THEME.danger,    // red
    development:  THEME.waiting,   // purple
    'code review':'#60A5FA',       // blue
  };
  // Priority: low=green, moderate=orange, high=red (+ medium alias).
  const PRIORITY_BAR_COLOR = {
    low:      THEME.success,
    moderate: THEME.warning,
    medium:   THEME.warning,
    high:     THEME.danger,
  };
  // Difficulty: ease=green, medium=orange, hard=red (+ easy alias).
  const DIFFICULTY_BAR_COLOR = {
    ease:   THEME.success,
    easy:   THEME.success,
    medium: THEME.warning,
    hard:   THEME.danger,
  };
  // Chart render order (spec). Keys not in list append after in original order.
  const PRIORITY_ORDER   = ['low', 'moderate', 'medium', 'high'];
  const DIFFICULTY_ORDER = ['ease', 'easy', 'medium', 'hard'];
  function orderKeys(keys, order) {
    const rank = new Map(order.map((k, i) => [k, i]));
    return [...keys].sort((a, b) => {
      const ra = rank.has(String(a).toLowerCase()) ? rank.get(String(a).toLowerCase()) : 999;
      const rb = rank.has(String(b).toLowerCase()) ? rank.get(String(b).toLowerCase()) : 999;
      return ra - rb;
    });
  }

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
    // ponytail: only `now` override forces bucket; `last` follows date rule.
    if (override === 'now') { now = true; }
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

  // Range label for one bucket, e.g. "27 Jul 2026 – 02 Aug 2026".
  function bucketRangeLabel(bucket, mode, ref = new Date()) {
    const offset = bucket === 'last' ? -1 : 0;
    const [s, endEx] = periodRange(offset, mode, ref);
    return `${formatDate(s)} – ${formatDate(endEx - 86400000)}`;
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
    // week='last' is NOT an override — follows date rule. Out-of-range date → hidden.
    const bLastOverride = periodBuckets({ startDate: iso(2026,6,15), endDate: iso(2026,6,26), status:'complete', week:'last' }, 'week', ref);
    console.assert(!bLastOverride.last && !bLastOverride.now, 'periodBuckets week: last override no longer forces bucket');
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

  // ── Render helpers for spec-compliant status/priority/progress ──────
  function StatusDot({ status }) {
    const key = String(status || '').toLowerCase();
    const color = STATUS_COLOR[key] || THEME.textMuted;
    return e('span', { style:{ display:'inline-flex', alignItems:'center', gap:6, textTransform:'capitalize', color:THEME.textPrimary, fontSize:13 } },
      e('span', { 'aria-hidden':true, style:{ width:8, height:8, borderRadius:'50%', background:color, display:'inline-block' } }),
      e('span', null, status || '—')
    );
  }
  function PriorityText({ priority }) {
    const key = String(priority || '').toLowerCase();
    const color = PRIORITY_COLOR[key] || THEME.textSecondary;
    return e('span', { style:{ color, textTransform:'capitalize', fontWeight:600, fontSize:13 } }, priority || '—');
  }
  function ProgressCell({ value, barColor }) {
    const pct = Math.max(0, Math.min(100, Number(value || 0)));
    return e('div', { style:{ minWidth:90 } },
      e('div', { style:{ color:THEME.textPrimary, fontSize:13, marginBottom:6 } }, `${pct.toFixed(0)}%`),
      e('div', { 'aria-hidden':true, style:{ height:3, background:'rgba(255,255,255,0.08)', borderRadius:2, overflow:'hidden' } },
        e('div', { style:{ width:`${pct}%`, height:'100%', background:barColor || THEME.info, transition:'width .2s' } })
      )
    );
  }
  function KpiCard({ label, value }) {
    const accent = KPI_ACCENT[String(label).toLowerCase()] || THEME.info;
    return e('div', {
      className:'tracker-kpi',
      style:{ position:'relative', background:THEME.cardBg, border:`1px solid ${THEME.border}`, borderRadius:12, padding:'20px', minWidth:180, height:144, display:'flex', flexDirection:'column', justifyContent:'flex-end', transition:'background .15s, border-color .15s, box-shadow .15s' }
    },
      e('div', { 'aria-hidden':true, style:{ position:'absolute', top:0, left:0, right:0, height:4, background:accent, borderRadius:'12px 12px 0 0' } }),
      e('div', { style:{ fontSize:32, fontWeight:700, color:THEME.textPrimary, lineHeight:1.05 } }, value),
      e('div', { style:{ fontSize:14, fontWeight:400, color:THEME.textSecondary, marginTop:8 } }, label)
    );
  }

  function DoughnutChart({ percent }) {
    const pct = Math.max(0, Math.min(100, Number(percent || 0)));
    const endDeg = (pct / 100) * 360;
    // Spec: diameter 160, stroke 16, center value 32px bold, label 13px.
    // r=72 + stroke 16 → outer diameter 160.
    return e('div', { style:{ display:'grid', placeItems:'center', minHeight:220 } },
      e('svg', { width:180, height:180, viewBox:'0 0 180 180', role:'img', 'aria-label':`Overall progress ${formatPercent(pct)}` },
        e('circle', { cx:90, cy:90, r:72, fill:'none', stroke:'var(--border-2)', strokeWidth:16 }),
        pct > 0 ? e('path', { d:arcPath(90, 90, 72, 0, endDeg), fill:'none', stroke:THEME.info, strokeWidth:16, strokeLinecap:'round' }) : null,
        e('text', { x:90, y:92, textAnchor:'middle', fontSize:32, fontWeight:700, fill:THEME.textPrimary }, formatPercent(pct)),
        e('text', { x:90, y:116, textAnchor:'middle', fontSize:13, fill:THEME.textSecondary }, 'Overall')
      )
    );
  }

  function titleCase(s) {
    return String(s || '').replace(/\b\w/g, c => c.toUpperCase());
  }

  const PALETTE = ['#22c55e', '#f59e0b', '#ef4444', '#7c3aed', '#8fd0f8', '#ec4899', '#14b8a6', '#eab308', '#3b82f6', '#a855f7'];

  // Reusable dashed horizontal grid lines behind chart bars. 4 lines at 25/50/75/100.
  function GridLines() {
    return e('div', { 'aria-hidden':true, style:{ position:'absolute', inset:0, pointerEvents:'none' } },
      ...[0.25, 0.5, 0.75, 1].map((r, i) => e('div', { key:i, style:{ position:'absolute', left:0, right:0, bottom:`${r * 100}%`, borderTop:`1px dashed ${THEME.divider}` } }))
    );
  }

  function StatusBarChart({ summary }) {
    const s = summary.statuses || {};
    // Fixed spec order; drop zero-value slots so chart doesn't render dead columns
    // when a status has no rows. ponytail: keeps chart honest, order preserved.
    const rows = STATUS_ORDER
      .map(key => ({ key, label:titleCase(key), value:s[key] || 0, color:STATUS_BAR_COLOR[key] || THEME.info }))
      .filter(r => r.value > 0);
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ position:'relative', height:220, padding:'16px 10px 8px', borderBottom:`1px solid ${THEME.border}` } },
      e(GridLines, null),
      e('div', { style:{ position:'relative', height:'100%', display:'flex', alignItems:'flex-end', gap:16 } },
        ...rows.map(row => e('div', { key:row.key, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 } },
          e('div', { style:{ fontSize:13, fontWeight:600, color:THEME.textSecondary } }, row.value),
          e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${(row.value / max) * 135}px`, minHeight:8, background:row.color, borderRadius:'6px 6px 0 0' } }),
          e('div', { style:{ fontSize:12, fontWeight:400, color:THEME.textSecondary, textAlign:'center' } }, row.label)
        ))
      )
    );
  }

  function DynamicBarChart({ keys, counts, unsetKey, colorFor }) {
    const rows = keys.map((label, i) => ({
      label:titleCase(label),
      value:counts[label] || 0,
      color:(colorFor && colorFor(label)) || PALETTE[i % PALETTE.length],
    }));
    if (unsetKey && counts[unsetKey]) rows.push({ label:'Unset', value:counts[unsetKey], color:'#64748b' });
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ position:'relative', height:220, padding:'16px 10px 8px', borderBottom:`1px solid ${THEME.border}` } },
      e(GridLines, null),
      e('div', { style:{ position:'relative', height:'100%', display:'flex', alignItems:'flex-end', gap:16 } },
        ...rows.map(row => e('div', { key:row.label, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:6 } },
          e('div', { style:{ fontSize:13, fontWeight:600, color:THEME.textSecondary } }, row.value),
          e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${(row.value / max) * 135}px`, minHeight:row.value ? 8 : 0, background:row.color, borderRadius:'6px 6px 0 0' } }),
          e('div', { style:{ fontSize:12, fontWeight:400, color:THEME.textSecondary, textAlign:'center' } }, row.label)
        ))
      )
    );
  }

  function DifficultyBarChart({ summary }) {
    return e(DynamicBarChart, {
      keys:orderKeys(summary.difficultyKeys, DIFFICULTY_ORDER),
      counts:summary.difficulties,
      unsetKey:'unset',
      colorFor:label => DIFFICULTY_BAR_COLOR[String(label).toLowerCase()],
    });
  }

  function PriorityBarChart({ summary }) {
    return e(DynamicBarChart, {
      keys:orderKeys(summary.priorityKeys, PRIORITY_ORDER),
      counts:summary.priorities,
      unsetKey:'unset',
      colorFor:label => PRIORITY_BAR_COLOR[String(label).toLowerCase()],
    });
  }

  function ActivityBarChart({ summary }) {
    return e(DynamicBarChart, {
      keys:summary.activityKeys,
      counts:summary.activities,
      colorFor:label => ACTIVITY_COLOR[String(label).toLowerCase()],
    });
  }

  // Spec: 7 KPI in fixed order. Missing statuses show 0 so layout stays stable.
  function buildProgressCards(summary) {
    const s = summary.statuses || {};
    const pick = key => {
      const found = Object.keys(s).find(k => String(k).toLowerCase() === key);
      return found ? (s[found] || 0) : 0;
    };
    return [
      ['Total', summary.total],
      ['Core / Milestone', `${summary.cores} / ${summary.milestones}`],
      ['Complete', pick('complete')],
      ['In Progress', pick('in progress')],
      ['On Hold', pick('on hold')],
      ['Waiting', pick('waiting')],
      ['Overall', formatPercent(summary.overall)],
    ];
  }

  // ponytail: `card` prop kept for backward compat with StatSection callers but ignored;
  // KpiCard owns its styling now. `pick` optional array filters/orders the KPI list.
  function ProgressCardGrid(_props) {
    const summary = _props.summary;
    const pick = Array.isArray(_props.pick) ? _props.pick : null;
    const cols = Number(_props.cols) > 0 ? Number(_props.cols) : 0;
    let cards = buildProgressCards(summary);
    if (pick) {
      const map = new Map(cards.map(c => [c[0].toLowerCase(), c]));
      cards = pick.map(k => map.get(String(k).toLowerCase())).filter(Boolean);
    }
    const gridCols = cols ? `repeat(${cols}, minmax(0, 1fr))` : 'repeat(auto-fit, minmax(180px, 1fr))';
    return e('div', { style:{ display:'grid', gridTemplateColumns:gridCols, gap:16 } },
      ...cards.map(([label, value]) => e(KpiCard, { key:label, label, value }))
    );
  }

  function PeriodSplitTable({ allRows, sectioned, mode }) {
    const coreById = React.useMemo(() => new Map(allRows.filter(row => row.type === 'core').map(row => [row.id, row])), [allRows]);
    const labels = mode === 'month'
      ? { last:'Last Month', now:'This Month', unitPrev:'vs Previous Month' }
      : { last:'Last Week',  now:'This Week',  unitPrev:'vs Previous Week' };
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
    const thStyle = { textAlign:'left', fontSize:12, fontWeight:500, color:THEME.textSecondary, letterSpacing:0.4, padding:'0 12px', height:48, background:THEME.tableHeaderBg, borderBottom:`1px solid ${THEME.divider}`, textTransform:'uppercase', position:'sticky', top:0, zIndex:1 };
    const tdStyle = { padding:'0 12px', borderBottom:`1px solid ${THEME.divider}`, color:THEME.textPrimary, fontSize:13 };
    return e('div', { style:{ display:'grid', gridTemplateColumns:'minmax(0, 1fr)', gap:16, marginTop:16 } },
      ...['last', 'now'].map(bucket => {
        const items = orderTreeRows(filterRowsByPeriod(allRows, mode, bucket));
        const weekSummary = summarizeRows(items);
        const title = labels[bucket];
        const thisRange = bucketRangeLabel(bucket, mode);
        // ponytail: "vs previous" only shown for the current-week header per spec.
        const weekProps = { key:bucket, style:{ border:`1px solid ${THEME.border}`, borderRadius:12, overflow:'hidden', background:THEME.bgSecondary } };
        if (sectioned) weekProps['data-stat-section'] = bucket;
        weekProps['data-slide-part'] = bucket === 'last' ? 'last-period' : 'this-period';
        return e('div', weekProps,
          // Header per spec: title + current range + "vs previous range"
          e('div', { style:{ display:'flex', flexDirection:'column', gap:2, padding:'14px 16px', background:THEME.cardBg, borderBottom:`1px solid ${THEME.divider}` } },
            e('div', { style:{ fontSize:16, fontWeight:600, color:'#fff' } }, title),
            e('div', { style:{ fontSize:12, fontWeight:400, color:THEME.textSecondary } },
              thisRange,
              bucket === 'now' ? e('span', { style:{ color:THEME.textMuted } }, ` ${labels.unitPrev} · ${bucketRangeLabel('last', mode)}`) : null
            )
          ),
          e('div', { style:{ padding:16, borderBottom:`1px solid ${THEME.divider}`, background:THEME.bgSecondary, overflowX:'auto' } },
            e(ProgressCardGrid, { summary:weekSummary })
          ),
          e('div', { style:{ maxHeight:'70vh', overflow:'auto', background:THEME.bgSecondary } },
            e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
              e('thead', null,
                e('tr', null,
                  ...['Task', 'Core Task', 'Status', 'Priority', 'Progress'].map(label => e('th', { key:label, style:thStyle }, label))
                )
              ),
              e('tbody', null,
                ...(items.length ? items : [{ id:`empty-${bucket}`, task:'—', status:'', priority:'' }]).map((row, i) => {
                  const isChild = row.type === 'milestone' && coreById.has(row.parentTaskId);
                  const parent = isChild ? coreById.get(row.parentTaskId) : null;
                  const alt = i % 2 === 1 ? THEME.bgSecondary : 'transparent';
                  const bg = isChild ? alt : 'rgba(59,130,246,0.06)'; // parent subtle tint
                  const barColor = STATUS_COLOR[String(row.status || '').toLowerCase()] || THEME.info;
                  return e('tr', {
                    key:row.id,
                    className:'tracker-row',
                    style:{ height:56, background:bg }
                  },
                    e('td', { style:{ ...tdStyle, paddingLeft: isChild ? 36 : 12, fontWeight:isChild ? 400 : 700, fontSize:isChild ? 13 : 14, color: isChild ? THEME.textSecondary : '#fff' } },
                      isChild ? e('span', { 'aria-hidden':true, style:{ color:THEME.textMuted, marginRight:6 } }, '↳') : null,
                      row.task || '—'
                    ),
                    e('td', { style:{ ...tdStyle, color:THEME.textSecondary, fontSize:12 } }, isChild ? (parent ? parent.task : '—') : '—'),
                    e('td', { style:tdStyle }, row.task === '—' ? '—' : e(StatusDot, { status:row.status })),
                    e('td', { style:tdStyle }, row.task === '—' ? '—' : e(PriorityText, { priority:row.priority })),
                    e('td', { style:tdStyle }, row.task === '—' ? '—' : e(ProgressCell, { value:getEffectiveProgress(row, allRows), barColor }))
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
    const th = { textAlign:'left', fontSize:12, fontWeight:500, color:THEME.textSecondary, letterSpacing:0.4, padding:'0 12px', height:48, background:THEME.tableHeaderBg, borderBottom:`1px solid ${THEME.divider}`, textTransform:'uppercase' };
    const tdBase = { padding:'0 12px', borderBottom:`1px solid ${THEME.divider}`, verticalAlign:'middle', color:THEME.textPrimary, fontSize:13 };
    const renderRow = (row, isChild, i) => {
      const children = isChild ? [] : getChildMilestones(rows, row.id);
      const isOpen = !collapsed.has(row.id);
      const alt = i % 2 === 1 ? THEME.bgSecondary : 'transparent';
      const bg = isChild ? alt : 'rgba(59,130,246,0.06)';
      const clickable = !isChild && children.length;
      const marker = isChild ? '↳ ' : (children.length ? (isOpen ? '▼ ' : '▶ ') : '');
      const barColor = STATUS_COLOR[String(row.status || '').toLowerCase()] || THEME.info;
      return e(React.Fragment, { key:row.id },
        e('tr', {
          className:'tracker-row',
          style:{ height:56, background:bg, cursor:clickable ? 'pointer' : 'default' },
          onClick:clickable ? () => toggle(row.id) : undefined
        },
          e('td', { style:{ ...tdBase, minWidth:180, fontWeight:isChild ? 400 : 700, fontSize:isChild ? 13 : 14, color:isChild ? THEME.textSecondary : '#fff', paddingLeft: isChild ? 36 : 12 } },
            e('span', { style:{ color:THEME.textMuted, marginRight:6, userSelect:'none' }, 'aria-hidden':true }, marker),
            row.task || '—'
          ),
          e('td', { style:{ ...tdBase, minWidth:200, color:THEME.textSecondary, fontSize:12 } }, row.description || '—'),
          e('td', { style:{ ...tdBase, width:140 } }, e(StatusDot, { status:row.status })),
          e('td', { style:{ ...tdBase, width:110, color:THEME.textSecondary, textTransform:'capitalize' } }, row.difficulty || '—'),
          e('td', { style:{ ...tdBase, width:110 } }, e(PriorityText, { priority:row.priority })),
          e('td', { style:{ ...tdBase, width:130 } }, e(ProgressCell, { value:getEffectiveProgress(row, rows), barColor }))
        ),
        ...(isOpen ? children.map((child, ci) => renderRow(child, true, ci)) : [])
      );
    };
    return e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
      e('thead', null,
        e('tr', null, ...['Task', 'Description', 'Status', 'Difficulty', 'Priority', 'Progress'].map(label => e('th', { key:label, style:th }, label)))
      ),
      e('tbody', null,
        ...cores.map((row, i) => renderRow(row, false, i)),
        ...orphans.map((row, i) => renderRow(row, true, i))
      )
    );
  }

  function StatSection({ shell, card, title, summary, countLabel, rows, allRows, sectioned, periodMode }) {
    const sectionShell = { ...shell, background:THEME.bgSecondary, padding:16, border:`1px solid ${THEME.border}` };
    const overviewProps = { 'data-slide-part':'overview', style:{ display:'grid', gridTemplateColumns:'minmax(260px, 1fr) minmax(0, 2fr)', gap:16, alignItems:'stretch' } };
    const activityProps = { 'data-slide-part':'activity-chart', style:{ ...shell, padding:16, marginTop:16 } };
    const chartsProps = { 'data-slide-part':'diff-priority', style:{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:16, marginTop:16, alignItems:'stretch' } };
    const taskListProps = { 'data-slide-part':'task-list', style:{ ...shell, padding:16, marginTop:16, background:THEME.bgSecondary, border:`1px solid ${THEME.border}` } };
    if (sectioned) {
      // ponytail: 5-view scroll spec — view 1 starts at scrollTop=0 (doughnut+KPI+task
      // status+activity bottom), boundaries at activity/tasks/last/now. overview and
      // charts intentionally NOT markers to keep view 1 & view 2 as single stops.
      activityProps['data-stat-section'] = 'activity';
      taskListProps['data-stat-section'] = 'tasks';
    }
    return e('div', { style:sectionShell, 'data-deck':title },
      e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', marginBottom:12, flexWrap:'wrap' } },
        e('div', { style:{ fontSize:16, fontWeight:600, color:'#fff' } }, title),
        e('div', { style:{ display:'flex', gap:12, alignItems:'center' } },
          e('div', { style:{ fontSize:12, fontWeight:400, color:THEME.textSecondary, whiteSpace:'nowrap' } }, formatPeriodLabel(periodMode)),
          e('div', { style:{ fontSize:12, color:THEME.textMuted } }, countLabel)
        )
      ),
      e('div', overviewProps,
        e('div', { style:{ ...shell, padding:16, background:THEME.cardBg, border:`1px solid ${THEME.border}`, display:'grid', alignContent:'center', minHeight:300 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:THEME.textSecondary, marginBottom:12 } }, 'Overall Project'),
          e(DoughnutChart, { percent:summary.overall })
        ),
        e('div', null,
          e(ProgressCardGrid, { summary, pick:['Total', 'Core / Milestone', 'Complete', 'In Progress'], cols:2 })
        )
      ),
      e('div', { className:'tracker-chart-card', 'data-slide-part':'task-status', style:{ ...shell, padding:16, marginTop:16, background:THEME.cardBg, border:`1px solid ${THEME.border}`, transition:'border-color .15s, box-shadow .15s' } },
        e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 } },
          e('div', { style:{ fontSize:14, fontWeight:600, color:THEME.textPrimary } }, 'Task Status'),
          e('div', { style:{ fontSize:12, fontWeight:600, color:THEME.textSecondary } }, `${summary.total} Tasks`)
        ),
        e(StatusBarChart, { summary })
      ),
      (summary.activityKeys && summary.activityKeys.length) ? e('div', { ...activityProps, className:'tracker-chart-card', style:{ ...activityProps.style, background:THEME.cardBg, border:`1px solid ${THEME.border}`, transition:'border-color .15s, box-shadow .15s' } },
        e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 } },
          e('div', { style:{ fontSize:14, fontWeight:600, color:THEME.textPrimary } }, 'Activity'),
          e('div', { style:{ fontSize:12, fontWeight:600, color:THEME.textSecondary } }, `${summary.total} Tasks`)
        ),
        e(ActivityBarChart, { summary })
      ) : null,
      e('div', chartsProps,
        e('div', { className:'tracker-chart-card', style:{ ...shell, padding:16, background:THEME.cardBg, border:`1px solid ${THEME.border}`, transition:'border-color .15s, box-shadow .15s' } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:THEME.textSecondary, marginBottom:12 } }, 'Difficulty'),
          e(DifficultyBarChart, { summary })
        ),
        e('div', { className:'tracker-chart-card', style:{ ...shell, padding:16, background:THEME.cardBg, border:`1px solid ${THEME.border}`, transition:'border-color .15s, box-shadow .15s' } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:THEME.textSecondary, marginBottom:12 } }, 'Priority'),
          e(PriorityBarChart, { summary })
        )
      ),
      e('div', taskListProps,
        e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 } },
          e('div', { style:{ fontSize:14, fontWeight:600, color:'#fff' } }, 'Task List'),
          e('div', { style:{ fontSize:12, fontWeight:400, color:THEME.textSecondary, whiteSpace:'nowrap' } }, formatPeriodLabel(periodMode))
        ),
        e('div', { style:{ marginBottom:16 } },
          e(ProgressCardGrid, { summary })
        ),
        e('div', { style:{ maxHeight:'80vh', overflow:'auto' } },
          e(TaskListTree, { rows })
        )
      ),
      e(PeriodSplitTable, { allRows:allRows || rows, sectioned, mode:periodMode })
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
      if (!distance && target !== 0) return;
      // ponytail: allow scroll-to-0 even when scrollTop already 0
      const duration = Math.min(700, 300 + Math.abs(distance) * 0.4);
      const t0 = performance.now();
      const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      const step = (now) => {
        const p = Math.min(1, (now - t0) / duration);
        container.scrollTop = start + distance * ease(p);
        if (p < 1) animRef.current = requestAnimationFrame(step);
      };
      animRef.current = requestAnimationFrame(step);
    }, []);
    // Period-filtered rows for export — independent of sheet picker (spec: cover uses
    // all sheets combined, per-sheet decks derived from same period-filtered universe).
    const exportRows = React.useMemo(() => filterRowsByPeriod(rows, periodMode, 'now'), [rows, periodMode]);
    const exportSummary = React.useMemo(() => summarizeRows(exportRows), [exportRows]);
    // Group by sheet (Dany, Naftal, Agung, ...) — ordered by sheetTabs when available so
    // export order matches the sidebar selector; falls back to first-seen order.
    const exportSheetDecks = React.useMemo(() => {
      const byName = new Map();
      exportRows.forEach(r => {
        const key = String(r.sourceSheet || '').trim() || 'Unassigned';
        if (!byName.has(key)) byName.set(key, []);
        byName.get(key).push(r);
      });
      const ordered = [];
      const seen = new Set();
      (sheetTabs || []).forEach(name => {
        if (byName.has(name)) { ordered.push(name); seen.add(name); }
      });
      byName.forEach((_, name) => { if (!seen.has(name)) ordered.push(name); });
      return ordered.map(name => ({
        name,
        rows: byName.get(name),
        summary: summarizeRows(byName.get(name)),
        allRows: rows.filter(r => (String(r.sourceSheet || '').trim() || 'Unassigned') === name),
      }));
    }, [exportRows, rows, sheetTabsKey]);

    // ponytail: builds standalone slideshow doc from hidden export decks. Data flow:
    //   Cover: doughnut + 4 KPI from all-sheet aggregate (period-filtered).
    //   Then per sheet (Dany/Naftal/Agung/...): divider slide + 5 content slides.
    const buildSlideshowHtml = React.useCallback(() => {
      const root = document.querySelector('[data-export-decks]');
      if (!root) return '';
      const cs = getComputedStyle(document.documentElement);
      const vars = ['--app-bg','--sidebar-bg','--border-1','--border-2','--text-1','--text-2','--text-3','--text-4']
        .map(k => `${k}: ${cs.getPropertyValue(k).trim() || 'initial'};`).join(' ');
      const stamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
      const bm = batchMeta || {};
      const metaLine = `${periodMode.charAt(0).toUpperCase() + periodMode.slice(1)}` +
        (bm.version ? ` · v${bm.version}` : '') +
        (bm.startDate || bm.endDate ? ` · ${bm.startDate || '?'} → ${bm.endDate || '?'}` : '');
      const pick = (deck, parts) => parts.map(p => deck.querySelector(`[data-slide-part="${p}"]`)).filter(Boolean);
      const slides = [];
      // Cover deck: only overview part (doughnut + 4 KPI cards).
      const coverDeck = root.querySelector('[data-deck-role="cover"]');
      if (coverDeck) {
        const overview = coverDeck.querySelector('[data-slide-part="overview"]');
        if (overview) {
          slides.push({ kind:'cover', title:'All Sheets · Overall', name:'Doughnut + KPI', html:overview.outerHTML });
        }
      }
      // Per-sheet decks: divider + 5 content slides.
      const sheetDecks = Array.from(root.querySelectorAll('[data-deck-role="sheet"]'));
      sheetDecks.forEach(deck => {
        const name = deck.getAttribute('data-deck') || '—';
        slides.push({ kind:'divider', title:name, name:'Sheet' });
        const groups = [
          { name:'Overview · Task Status', parts:['overview', 'task-status'] },
          { name:'Activity · Difficulty · Priority', parts:['activity-chart', 'diff-priority'] },
          { name:'Task List', parts:['task-list'] },
          { name:'Last Period', parts:['last-period'] },
          { name:'This Period', parts:['this-period'] },
        ];
        groups.forEach(g => {
          const nodes = pick(deck, g.parts);
          if (!nodes.length) return;
          slides.push({ kind:'content', title:name, name:g.name, html:nodes.map(n => n.outerHTML).join('') });
        });
      });
      if (!slides.length) return '';
      const total = slides.length;
      const slideHtml = slides.map((s, i) => {
        if (s.kind === 'divider') {
          return `<section class="slide slide-divider" data-idx="${i}">
            <div class="divider-inner">
              <div class="divider-eyebrow">Sheet</div>
              <div class="divider-title">${escapeHtml(s.title)}</div>
              <div class="divider-meta">${escapeHtml(metaLine)}</div>
            </div>
          </section>`;
        }
        const badge = s.kind === 'cover' ? 'Cover' : escapeHtml(s.name);
        return `<section class="slide" data-idx="${i}">
          <div class="slide-head">
            <div class="slide-title"><strong>${escapeHtml(s.title)}</strong> · ${badge}</div>
            <div class="slide-meta">${escapeHtml(metaLine)} · ${i + 1}/${total}</div>
          </div>
          <div class="slide-body">${s.html}</div>
        </section>`;
      }).join('');
      return `<!doctype html>
<html><head><meta charset="utf-8"><title>Tracker Slideshow · ${escapeHtml(stamp)}</title>
<style>
  :root { ${vars} }
  * { box-sizing: border-box; }
  html, body { margin: 0; height: 100%; overflow: hidden; background: var(--app-bg); color: var(--text-1); font-family: -apple-system, Segoe UI, Roboto, sans-serif; }
  .deck { position: relative; height: 100vh; overflow: hidden; }
  .slide { position: absolute; inset: 0; padding: 40px 56px 72px; display: flex; flex-direction: column; gap: 16px; opacity: 0; pointer-events: none; transform: translateX(30px); transition: opacity .25s ease, transform .25s ease; }
  .slide.active { opacity: 1; pointer-events: auto; transform: none; }
  .slide-head { display: flex; justify-content: space-between; align-items: baseline; gap: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-1); flex: 0 0 auto; }
  .slide-title { font-size: 20px; color: var(--text-1); }
  .slide-meta { font-size: 12px; color: var(--text-3); }
  .slide-body { flex: 1 1 auto; min-height: 0; overflow: auto; padding-right: 6px; }
  .slide-body [data-noexport], .slide-body button { display: none !important; }
  .slide-body input, .slide-body select, .slide-body textarea { pointer-events: none; background: transparent !important; border: 0 !important; color: inherit !important; padding: 0 !important; -webkit-appearance: none; appearance: none; }
  .slide-divider { align-items: center; justify-content: center; padding: 0; }
  .divider-inner { text-align: center; padding: 40px; }
  .divider-eyebrow { font-size: 14px; letter-spacing: 4px; text-transform: uppercase; color: var(--text-3); margin-bottom: 20px; }
  .divider-title { font-size: 72px; font-weight: 800; color: var(--text-1); margin-bottom: 24px; line-height: 1.05; }
  .divider-meta { font-size: 14px; color: var(--text-3); }
  .nav { position: fixed; bottom: 16px; left: 0; right: 0; display: flex; justify-content: center; gap: 8px; align-items: center; z-index: 10; }
  .nav button { background: var(--sidebar-bg); color: var(--text-1); border: 1px solid var(--border-1); padding: 6px 12px; border-radius: 999px; font-size: 12px; cursor: pointer; }
  .nav button:disabled { opacity: .4; cursor: not-allowed; }
  .nav .counter { font-size: 12px; color: var(--text-3); min-width: 60px; text-align: center; }
  .dots { display: flex; gap: 4px; }
  .dots i { width: 6px; height: 6px; border-radius: 50%; background: var(--border-1); display: inline-block; }
  .dots i.on { background: #2563eb; width: 14px; border-radius: 3px; }
  svg { max-width: 100%; height: auto; }
  @media print {
    html, body { overflow: visible; height: auto; }
    .deck { height: auto; }
    .nav { display: none !important; }
    .slide { position: relative; inset: auto; opacity: 1 !important; transform: none !important; pointer-events: auto; page-break-after: always; break-after: page; height: 100vh; }
    .slide:last-child { page-break-after: auto; break-after: auto; }
    .slide-body { overflow: visible; }
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; color-adjust: exact !important; }
    @page { size: A4 landscape; margin: 8mm; }
  }
</style></head>
<body>
<div class="deck" id="deck">${slideHtml}</div>
<div class="nav">
  <button id="prev" title="Previous (←)">◀</button>
  <span class="counter" id="counter">1/${total}</span>
  <button id="next" title="Next (→ / Space)">▶</button>
  <button id="fs" title="Fullscreen (F)">⛶</button>
  <button id="printBtn" title="Print / Save as PDF">🖨</button>
  <span class="dots" id="dots">${slides.map((_, i) => `<i class="${i === 0 ? 'on' : ''}"></i>`).join('')}</span>
</div>
<script>
(function(){
  var slides = document.querySelectorAll('.slide');
  var dots = document.querySelectorAll('#dots i');
  var counter = document.getElementById('counter');
  var idx = 0;
  function go(n){
    idx = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach(function(s, i){ s.classList.toggle('active', i === idx); });
    dots.forEach(function(d, i){ d.classList.toggle('on', i === idx); });
    counter.textContent = (idx + 1) + '/' + slides.length;
    document.getElementById('prev').disabled = idx === 0;
    document.getElementById('next').disabled = idx === slides.length - 1;
  }
  document.getElementById('prev').onclick = function(){ go(idx - 1); };
  document.getElementById('next').onclick = function(){ go(idx + 1); };
  document.getElementById('fs').onclick = function(){
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen();
  };
  document.getElementById('printBtn').onclick = function(){ window.print(); };
  document.addEventListener('keydown', function(ev){
    if (ev.key === 'ArrowRight' || ev.key === ' ' || ev.key === 'PageDown') { ev.preventDefault(); go(idx + 1); }
    else if (ev.key === 'ArrowLeft' || ev.key === 'PageUp') { ev.preventDefault(); go(idx - 1); }
    else if (ev.key === 'Home') go(0);
    else if (ev.key === 'End') go(slides.length - 1);
    else if (ev.key === 'f' || ev.key === 'F') document.getElementById('fs').click();
    else if (ev.key === 'Escape' && document.fullscreenElement) document.exitFullscreen();
  });
  slides[0].classList.add('active');
})();
</script>
</body></html>`;
    }, [batchMeta, periodMode]);
    const escapeHtml = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const handleExportPdf = React.useCallback(() => {
      const html = buildSlideshowHtml();
      if (!html) return;
      const w = window.open('', '_blank');
      if (!w) { alert('Popup blocked. Izinkan popup untuk export PDF.'); return; }
      w.document.open();
      w.document.write(html);
      w.document.close();
      // ponytail: give layout+fonts a beat before print dialog; 400ms empirically enough.
      setTimeout(() => { try { w.focus(); w.print(); } catch (err) { console.error(err); } }, 400);
    }, [buildSlideshowHtml]);
    const handleExportHtml = React.useCallback(() => {
      const html = buildSlideshowHtml();
      if (!html) return;
      const stamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tracker-slideshow-${stamp}.html`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }, [buildSlideshowHtml]);
    const handleSlideshow = React.useCallback(() => {
      const html = buildSlideshowHtml();
      if (!html) return;
      const w = window.open('', '_blank');
      if (!w) { alert('Popup blocked. Izinkan popup untuk slideshow.'); return; }
      w.document.open();
      w.document.write(html);
      w.document.close();
    }, [buildSlideshowHtml]);
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
      // Hidden export decks — always rendered when Statistics tab is active so charts,
      // tables, and SVGs are ready when user clicks Slideshow/PDF/HTML. Data is period-
      // filtered but ignores the sheet picker (cover = all sheets combined).
      tab === 'statistics' ? e('div', {
        'data-export-decks':'1',
        'aria-hidden':'true',
        style:{ position:'fixed', left:-99999, top:0, width:1400, pointerEvents:'none', opacity:0 }
      },
        e('div', { 'data-deck-role':'cover', 'data-deck':'All Sheets · Overall' },
          e(StatSection, { shell, card, title:'All Sheets', summary:exportSummary, countLabel:`${exportRows.length} rows`, rows:exportRows, allRows:rows, periodMode })
        ),
        ...exportSheetDecks.map(deck => e('div', {
          key:`export-${deck.name}`,
          'data-deck-role':'sheet',
          'data-deck':deck.name
        },
          e(StatSection, { shell, card, title:deck.name, summary:deck.summary, countLabel:`${deck.rows.length} rows`, rows:deck.rows, allRows:deck.allRows, periodMode })
        ))
      ) : null,
      // Spec: hover / focus states for tracker rows and KPI cards
      e('style', null, `
        .tracker-row:hover { background: ${THEME.hoverBg} !important; }
        .tracker-kpi:hover { background: ${THEME.hoverBg}; border-color: ${THEME.info}; box-shadow: 0 8px 20px rgba(59,130,246,0.15); }
        .tracker-chart-card:hover { border-color: ${THEME.info}; box-shadow: 0 8px 20px rgba(59,130,246,0.15); }
        .tracker-row:focus-within { outline: 2px solid ${THEME.info}; outline-offset: -2px; }
      `),
      // Right panel — all main content
      e('div', { ref:scrollRef, style:{ flex:1, minWidth:0, display:'flex', flexDirection:'column', gap:16, minHeight:0, overflowY:'auto', padding:'16px 24px', position:'relative', background:THEME.bgMain } },
        e('div', { style:{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', flexWrap:'wrap' } },
          e('div', { style:{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center' } },
            e('div', { style:{ fontSize:13, fontWeight:700, color:'var(--text-1)' } }, tab === 'input' ? 'Input Table' : (selectedSheet === 'all' ? 'Statistic · All Sheets' : `Statistic · ${selectedSheet}`)),
            e('button', { type:'button', 'data-noexport':'1', onClick:addRow, style:{ border:'1px solid var(--border-1)', background:'var(--sidebar-bg)', color:'var(--text-2)', borderRadius:999, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer' } }, '+ Row'),
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
              e('div', { style:{ minWidth:150 } }, e(DateCell, { value:batchMeta.endDate, onChange:value => setBatchMeta(prev => ({ ...prev, endDate:value })), inputStyle:{ ...inputStyle, padding:'8px 10px' } })),
              e('div', { 'data-noexport':'1', style:{ display:'inline-flex', border:'1px solid var(--border-1)', borderRadius:999, overflow:'hidden', marginLeft:4 } },
                e('button', { type:'button', onClick:handleSlideshow, title:'Open slideshow in new tab', style:{ border:'none', background:'#2563eb', color:'#fff', padding:'8px 12px', fontSize:12, fontWeight:600, cursor:'pointer' } }, 'Slideshow'),
                e('button', { type:'button', onClick:handleExportPdf, title:'Open slideshow then Print / Save as PDF', style:{ border:'none', borderLeft:'1px solid rgba(255,255,255,0.2)', background:'#0f766e', color:'#fff', padding:'8px 12px', fontSize:12, fontWeight:600, cursor:'pointer' } }, 'PDF'),
                e('button', { type:'button', onClick:handleExportHtml, title:'Download standalone HTML slideshow', style:{ border:'none', borderLeft:'1px solid rgba(255,255,255,0.2)', background:'#0f766e', color:'#fff', padding:'8px 12px', fontSize:12, fontWeight:600, cursor:'pointer' } }, 'HTML')
              )
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
          : e('div', { style:{ ...shell, overflow:'visible', minHeight:0, background:THEME.bgSecondary, border:`1px solid ${THEME.border}` } },
              e('div', { style:{ overflowX:'auto', overflowY:'visible' } },
                e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
                  e('thead', null,
                    e('tr', { style:{ background:THEME.tableHeaderBg } },
                      ...['Owner', 'Sheet', 'Type', 'Parent Task', 'Task', 'Description', 'Activity', 'Status', 'Difficulty', 'Priority', 'Week', 'Progress', 'Version', 'Date', 'Start', 'End', 'Ver Start', 'Ver End', 'Action'].map(label => {
                        const isWide = label === 'Parent Task' || label === 'Task' || label === 'Description';
                        return e('th', { key:label, style:{ textAlign:'left', padding:'0 12px', height:48, fontSize:12, fontWeight:500, color:THEME.textSecondary, letterSpacing:0.4, borderBottom:`1px solid ${THEME.divider}`, textTransform:'uppercase', position:'sticky', top:0, background:THEME.tableHeaderBg, zIndex:1, ...(isWide ? { maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' } : {}) } }, label);
                      })
                    )
                  ),
                  e('tbody', null,
                    ...rows.map(row => e('tr', {
                      key:row.id,
                      className:'tracker-row',
                      style:{ minHeight:56 },
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
        'data-noexport':'1',
        onClick:scrollToNextSection,
        title:'Scroll to next section (wraps to top)',
        'aria-label':'Scroll to next section',
        style:{ position:'fixed', right:24, bottom:24, zIndex:50, width:52, height:52, borderRadius:'50%', border:'1px solid #1d4ed8', background:'#2563eb', color:'#fff', fontSize:22, fontWeight:700, cursor:'pointer', boxShadow:'0 8px 20px rgba(0,0,0,0.35)', display:'flex', alignItems:'center', justifyContent:'center' }
      }, '↓') : null
    );
  }
  return { TrackerView };
})();
