/* ui-planner.js — Capacity + Calendar + People/Absen Planner for QA Browser Roadmap.
 * Self-contained module: reads OP work packages from IDB (op_cache_v1) + local edit overlay
 * (roadmap_op_edits_v1), fetches OP users for the people roster, runs a greedy day-based
 * scheduler that is absen-aware (each person = one lane), and renders Capacity + People +
 * Calendar. Apply writes start/due back into roadmap_op_edits_v1 (same overlay RoadmapPage
 * pushes to OP). Exposes window.PlannerModule.PlannerPage.
 *
 * Day model (prototype parity): DEV_DAYS {L:10,M:20,H:40}, QA_DAYS {L:5,M:10,H:15},
 * effort/impact/testing come from the local edit overlay (OP has no native field) — missing → 'M'/'L'.
 * People role (dev/qa) + absen are LOCAL-only (roadmap_people_v1); OP has no such field.
 */
(function () {
  "use strict";
  const React = window.React;
  const h = React.createElement;

  // ── constants ──────────────────────────────────────────────────────────
  const CAL = { DEV_DAYS: { L: 10, M: 20, H: 40 }, QA_DAYS: { L: 5, M: 10, H: 15 }, DEFAULT_CAP: 0.8 };
  const DAY_MS = 86400000;
  const PRIO_COL = { P0: "#EF4444", P1: "#F59E0B", P2: "#A78BFA", P3: "#475569", Backlog: "#64748B" };
  const PRIO_TINT = { P0: "#3B1618", P1: "#3A2A10", P2: "#2C2246", P3: "#222B36", Backlog: "#1E293B" };
  const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  // anchor = first Monday the planner starts scheduling from. Today or next workday.
  function computeAnchor() {
    let d = new Date(); d.setUTCHours(0, 0, 0, 0);
    while (d.getUTCDay() === 0 || d.getUTCDay() === 6) d = new Date(d.getTime() + DAY_MS);
    return d.toISOString().slice(0, 10);
  }

  // ── date helpers ───────────────────────────────────────────────────────
  const iso = (d) => d.toISOString().slice(0, 10);
  const parseISO = (s) => new Date(s + "T00:00:00Z");
  const isWorkday = (d) => { const w = d.getUTCDay(); return w >= 1 && w <= 5; };
  const addDays = (d, n) => new Date(d.getTime() + n * DAY_MS);
  const daysInMonth = (y, m) => new Date(y, m + 1, 0).getUTCDate();
  const maxISO = (arr) => arr.slice().sort().pop();
  const startOfWeek = (d) => { d = new Date(d); const w = (d.getUTCDay() + 6) % 7; d.setUTCDate(d.getUTCDate() - w); return iso(d); };
  function nthWorkday(startISO, n) { let d = parseISO(startISO), c = 0; while (c < n) { if (isWorkday(d)) c++; if (c < n) d = addDays(d, 1); } return iso(d); }
  function workdaysBetween(fromISO, toISO) { const out = []; let d = parseISO(fromISO); const end = parseISO(toISO); while (d <= end) { if (isWorkday(d)) out.push(iso(d)); d = addDays(d, 1); } return out; }
  // person-aware (skip weekend + that person's off-days)
  const isOff = (p, di) => (p.off || []).indexOf(di) >= 0;
  function nthWorkdayFor(p, startISO, n) { let d = parseISO(startISO), c = 0; while (c < n) { const di = iso(d); if (isWorkday(d) && !isOff(p, di)) c++; if (c < n) d = addDays(d, 1); } return iso(d); }
  function nextWorkdayFor(p, dateISO) { let d = addDays(parseISO(dateISO), 1); while (!isWorkday(d) || isOff(p, iso(d))) d = addDays(d, 1); return iso(d); }
  function workdaysForPerson(p, fromISO, toISO) { const out = []; let d = parseISO(fromISO); const end = parseISO(toISO); while (d <= end) { const di = iso(d); if (isWorkday(d) && !isOff(p, di)) out.push(di); d = addDays(d, 1); } return out; }
  // phaseDays: L/M/H level → working-days. Cap is applied ONCE in effectiveCapacity, NOT here.
  // empty/invalid level → 0 (unestimated, not forced to a default).
  const phaseDays = (level, kind, risk) => {
    const map = kind === "dev" ? CAL.DEV_DAYS : CAL.QA_DAYS;
    const base = map[level];
    if (!base) return 0; // unestimated
    return Math.max(1, Math.round(base * (risk || 1)));
  };

  // Parse OpenProject ISO-8601 duration (PT6H, P1DT8H, P2D) → working-days (OP workday = 8h).
  function parseOpDuration(s) {
    if (!s || typeof s !== "string") return 0;
    const m = /^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?$/.exec(s.trim());
    if (!m) return 0;
    const w = +m[1] || 0, d = +m[2] || 0, h = +m[3] || 0, mi = +m[4] || 0;
    const hours = w * 40 + d * 8 + h + mi / 60;
    return hours / 8; // working-days
  }

  // Dev-days precedence (user decision 2026-10-14): OP estimatedTime → override effort L/M/H → unestimated(0).
  function devDaysOf(t) {
    if (t.opEstDays > 0) return Math.max(1, Math.round(t.opEstDays));
    return phaseDays(t.effort, "dev", t.risk); // 0 if effort empty
  }
  // QA-days: from testing level only (override). No OP native field. 0 if testing empty.
  function qaDaysOf(t) { return phaseDays(t.testing, "qa", 1); }

  // ordering score: status bucket > prio > metric (impact H / effort L / testing L first). Mirror ui-roadmap opSortRows.
  const ORD_STATUS = { now: 0, next: 1, backlog: 2, done: 3 };
  const ORD_PR = { P0: 0, P1: 1, P2: 2, P3: 3 };
  const ORD_LV = { H: 3, M: 2, L: 1, "": 0 };
  function metricScore(t) { const i = ORD_LV[t.impact] || 0, e = ORD_LV[t.effort] || 2, tt = ORD_LV[t.testing] || 2; return i * 100 + (4 - e) * 10 + (4 - tt) * 1; }
  function bucketRankOf(t) { return ORD_STATUS[t.bucket] != null ? ORD_STATUS[t.bucket] : 2; }
  // compare two tasks: status↑, prio↑, metric↓ (quick-win high first)
  function orderCmp(a, b) {
    return bucketRankOf(a) - bucketRankOf(b)
      || (ORD_PR[a.priority] ?? 3) - (ORD_PR[b.priority] ?? 3)
      || metricScore(b) - metricScore(a);
  }

  // ── OP → task mapping (mirror ui-roadmap opPrioToRm/opStatusBucket) ──────
  const opPrioToRm = (name) => ({ urgent: "P0", high: "P1", medium: "P2", normal: "P2", low: "P3" })[String(name || "").trim().toLowerCase()] || "P2";
  const OP_STATUS_BUCKET = {
    "in progress": "now", "in testing": "now", "developed": "now", "waiting merge request": "now",
    "tested": "now", "test failed": "now",
    "new": "next", "specified": "next", "in specification": "next", "confirmed": "next",
    "on hold": "backlog", "closed": "done", "rejected": "done",
  };
  const opStatusBucket = (name) => OP_STATUS_BUCKET[String(name || "").trim().toLowerCase()] || "backlog";

  // Build a scheduler task from an OP WP + its local edit overlay.
  // OP has NO native effort/impact/testing field → come from the local edit overlay only.
  // Dev estimate precedence: OP estimatedTime → overlay effort L/M/H → unestimated.
  function wpToTask(wp, edit) {
    const e = edit || {};
    const prio = e.prio != null ? e.prio : opPrioToRm(wp.priorityName);
    const bucket = e.status != null ? e.status : opStatusBucket(wp.statusName);
    const opEstDays = parseOpDuration(wp.estimatedTime);
    const effort = e.effort || "";   // empty = unestimated (NOT defaulted to M)
    const testing = e.testing || ""; // empty = QA unestimated
    const t = {
      id: "op-" + wp.id, opId: wp.id,
      title: wp.subject || wp.typeName || ("WP " + wp.id),
      fullTitle: wp.subject || wp.typeName || ("WP " + wp.id),
      typeName: wp.typeName || "",
      effort: effort, impact: e.impact || "", testing: testing,
      opEstDays: opEstDays,
      priority: prio,
      current: bucket === "now",
      schedule: bucket === "next" ? { } : null,
      status: (bucket === "done") ? "done" : "active",
      bucket: bucket,
      dependency: [], risk: 1, rank: 0,
      opStatus: wp.statusName || "",
      versionId: wp.versionId != null ? String(wp.versionId) : null,
      assigneeId: wp.assigneeId || null, assigneeName: wp.assigneeName || "",
    };
    t.devDays = devDaysOf(t);
    t.qaDays = qaDaysOf(t);
    t.unestimated = t.devDays === 0; // no OP estimate and no manual effort
    return t;
  }

  // ── greedy day scheduler, absen-aware, one lane per person ──────────────
  function computeSchedule(tasks, people, cap, anchor) {
    cap = cap > 0 ? cap : CAL.DEFAULT_CAP;
    let devPeople = people.filter((p) => p.role === "dev");
    let qaPeople = people.filter((p) => p.role === "qa");
    if (!devPeople.length) devPeople = [{ id: "dev-anon", name: "Dev", role: "dev", off: [] }];
    if (!qaPeople.length) qaPeople = [{ id: "qa-anon", name: "QA", role: "qa", off: [] }];
    const byId = {}; tasks.forEach((t) => { byId[t.id] = t; });
    const sectionOf = (t) => t.current ? "current" : t.schedule ? "next" : "backlog";
    const SECT = { current: 2, next: 1, backlog: 0 }, IMPW = { H: 3, M: 2, L: 1 }, EFFINV = { L: 3, M: 2, H: 1 };
    const prioScore = (t) => { const P = { P0: 4, P1: 3, P2: 2, P3: 1, Backlog: 0 }[t.priority] || 0; return P * 1000 + (IMPW[t.impact] || 0) * 100 + (EFFINV[t.effort] || 0) * 10 + ({ L: 3, M: 2, H: 1 }[t.testing] || 0); };
    // schedule active non-done WITH a dev estimate; unestimated (0d) can't be placed on a date.
    const active = tasks.filter((t) => t.status !== "done" && (devDaysOf(t) > 0 || qaDaysOf(t) > 0));
    const depsOf = (t) => Array.isArray(t.dependency) ? t.dependency : t.dependency ? [t.dependency] : [];
    const remaining = new Set(active.map((t) => t.id));
    const done = {}, result = {};
    const devFree = devPeople.map(() => anchor);
    const qaFree = qaPeople.map(() => anchor);
    const depOk = (t) => { const ds = depsOf(t); for (let i = 0; i < ds.length; i++) { if (remaining.has(ds[i])) return false; } return true; };
    const earliest = (arr) => { let bi = 0; for (let i = 1; i < arr.length; i++) if (arr[i] < arr[bi]) bi = i; return bi; };
    let guard = 0;
    while (remaining.size && guard++ < 5000) {
      const ready = active.filter((t) => remaining.has(t.id) && depOk(t));
      if (!ready.length) break;
      ready.sort((a, b) => orderCmp(a, b) || (a.rank || 0) - (b.rank || 0));
      const t = ready[0];
      const depEnds = depsOf(t).map((d) => done[d] || anchor);
      const dl = earliest(devFree), devP = devPeople[dl];
      const devN = devDaysOf(t);
      let devStart = maxISO([devFree[dl]].concat(depEnds, [anchor]));
      while (!isWorkday(parseISO(devStart)) || isOff(devP, devStart)) devStart = nextWorkdayFor(devP, devStart);
      const devEnd = devN > 0 ? nthWorkdayFor(devP, devStart, devN) : devStart;
      devFree[dl] = nextWorkdayFor(devP, devEnd);
      const ql = earliest(qaFree), qaP = qaPeople[ql];
      const qaN = qaDaysOf(t);
      let qaStart = maxISO([qaFree[ql], nextWorkdayFor(qaP, devEnd)]);
      while (!isWorkday(parseISO(qaStart)) || isOff(qaP, qaStart)) qaStart = nextWorkdayFor(qaP, qaStart);
      const qaEnd = qaN > 0 ? nthWorkdayFor(qaP, qaStart, qaN) : qaStart;
      qaFree[ql] = nextWorkdayFor(qaP, qaEnd);
      done[t.id] = qaEnd;
      result[t.id] = { devStart, devEnd, qaStart, qaEnd, start: devStart, end: qaEnd,
        devPersonId: devP.id, devPersonName: devP.name, qaPersonId: qaP.id, qaPersonName: qaP.name };
      remaining.delete(t.id);
    }
    return { result, deferred: Array.from(remaining) };
  }

  // effective capacity (person-days after absen) over window × cap
  function effectiveCapacity(people, role, fromISO, toISO, capMult) {
    let total = 0;
    people.filter((p) => p.role === role).forEach((p) => { total += workdaysForPerson(p, fromISO, toISO).length; });
    return Math.round(total * (capMult || CAL.DEFAULT_CAP));
  }

  // day map: date → [{task phase person ...}] (person-aware, skips assignee off-days)
  function buildDayMap(tasksById, people, result, rangeStart, rangeEnd) {
    const map = {}; const pById = {}; people.forEach((p) => { pById[p.id] = p; });
    for (const id in result) {
      const r = result[id], t = tasksById[id]; if (!t) continue;
      const devP = pById[r.devPersonId], qaP = pById[r.qaPersonId];
      const devDays = devP ? workdaysForPerson(devP, r.devStart, r.devEnd) : workdaysBetween(r.devStart, r.devEnd);
      const qaDays = qaP ? workdaysForPerson(qaP, r.qaStart, r.qaEnd) : workdaysBetween(r.qaStart, r.qaEnd);
      devDays.forEach((d, i) => { if (d >= rangeStart && d <= rangeEnd) { (map[d] = map[d] || []).push({ id, title: t.title, phase: "Dev", prio: t.priority, d: i + 1, total: devDays.length, person: r.devPersonName }); } });
      qaDays.forEach((d, i) => { if (d >= rangeStart && d <= rangeEnd) { (map[d] = map[d] || []).push({ id, title: t.title, phase: "QA", prio: t.priority, d: i + 1, total: qaDays.length, person: r.qaPersonName }); } });
    }
    return map;
  }

  // expose engine for the Roadmap header summary (shared, no duplication)
  window.PlannerEngine = { CAL, computeAnchor, iso, parseISO, isWorkday, addDays, daysInMonth, startOfWeek,
    workdaysBetween, workdaysForPerson, phaseDays, parseOpDuration, devDaysOf, qaDaysOf, orderCmp, metricScore, wpToTask, computeSchedule, effectiveCapacity, buildDayMap, MONTHS, PRIO_COL, PRIO_TINT };

  // PlannerPage component is defined in the UI section appended below.
  window.PlannerModule = window.PlannerModule || {};
})();

/* ── PlannerPage UI (JSX, loaded via text/babel) ──────────────────────────── */
(function () {
  "use strict";
  const React = window.React;
  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const E = window.PlannerEngine;
  const esc = (s) => String(s == null ? "" : s);

  function PlannerPage() {
    const [opRows, setOpRows] = useState([]);
    const [opEdits, setOpEdits] = useState({});
    const [people, setPeople] = useState([]);
    const [cap, setCap] = useState(0.8);
    const [peopleLoaded, setPeopleLoaded] = useState(false);
    const [opUsers, setOpUsers] = useState([]);
    const [cursorDate, setCursorDate] = useState(() => E.parseISO(E.computeAnchor().slice(0, 8) + "01"));
    const [view, setView] = useState("month");
    const [weekSpan, setWeekSpan] = useState(1);
    const [sched, setSched] = useState(null);
    const [applied, setApplied] = useState(false);
    const [selId, setSelId] = useState(null);
    const [addPickerRole, setAddPickerRole] = useState(null);
    const anchor = useMemo(() => E.computeAnchor(), []);
    const peopleSaveRef = useRef(false);

    useEffect(() => {
      (async () => {
        try { const c = await window.loadRoadmapIDB("op_cache_v1"); if (c && Array.isArray(c.rows) && c.rows.length) setOpRows(c.rows); } catch (_) {}
        try { const e = await window.loadRoadmapIDB("roadmap_op_edits_v1"); if (e && typeof e === "object") setOpEdits(e); } catch (_) {}
        try { const pm = await window.loadRoadmapIDB("roadmap_op_meta_v1"); if (pm && Array.isArray(pm.people)) setOpUsers(pm.people); } catch (_) {}
        // people & absen now persist to DB (server). Load from server; one-time migrate old local IDB if server empty.
        try {
          const pr = await fetch("/api/dashboard/planner-people");
          const pd = await pr.json();
          if (pd && pd.ok && Array.isArray(pd.people) && pd.people.length) {
            setPeople(pd.people); if (typeof pd.cap === "number") setCap(pd.cap);
          } else {
            // server empty → migrate legacy IDB roster once, then push up
            const legacy = await window.loadRoadmapIDB("roadmap_people_v1");
            if (legacy && Array.isArray(legacy.people) && legacy.people.length) {
              setPeople(legacy.people); if (legacy.cap) setCap(legacy.cap);
              try { await fetch("/api/dashboard/planner-people", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ people: legacy.people, cap: legacy.cap || 0.8, updatedBy: "migrate" }) }); } catch (_) {}
            }
          }
        } catch (_) {}
        setPeopleLoaded(true);
        try { const r = await fetch("/api/dashboard/openproject/available-assignees?projectId=7"); const d = await r.json(); if (d.ok && Array.isArray(d.assignees)) setOpUsers(d.assignees); } catch (_) {}
        // fallback: if IDB cache empty (Roadmap tab never opened), fetch WP from server directly.
        try {
          const cur = await window.loadRoadmapIDB("op_cache_v1");
          if (!cur || !Array.isArray(cur.rows) || !cur.rows.length) {
            const r2 = await fetch("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
            const d2 = await r2.json();
            if (d2.ok) { const rows = d2.allWorkPackages || d2.workPackages || []; setOpRows(rows); try { await window.saveRoadmapIDB({ rows, ts: Date.now() }, "op_cache_v1"); } catch (_) {} }
          }
        } catch (_) {}
      })();
    }, []);
    // persist people+absen to DB (server), debounced; skip the initial mount write.
    useEffect(() => {
      if (!peopleLoaded) return;
      if (!peopleSaveRef.current) { peopleSaveRef.current = true; return; }
      const payload = JSON.stringify({ people, cap, updatedBy: "planner" });
      const t = setTimeout(() => {
        fetch("/api/dashboard/planner-people", { method: "PUT", headers: { "Content-Type": "application/json" }, body: payload }).catch(() => {});
        try { window.saveRoadmapIDB({ people, cap }, "roadmap_people_v1"); } catch (_) {} // local mirror (offline fallback)
      }, 600);
      return () => clearTimeout(t);
    }, [people, cap, peopleLoaded]);
    // mirror roster to window so the Roadmap header estimate summary can read it without coupling.
    useEffect(() => { window._plannerPeople = people; }, [people]);

    const tasks = useMemo(() => (opRows || []).map((wp) => E.wpToTask(wp, opEdits[wp.id])), [opRows, opEdits]);
    const tasksById = useMemo(() => { const m = {}; tasks.forEach((t) => { m[t.id] = t; }); return m; }, [tasks]);

    const doCompute = useCallback(() => { setSched(E.computeSchedule(tasks, people, cap, anchor)); setApplied(false); }, [tasks, people, cap, anchor]);
    const doDiscard = () => { setSched(null); setApplied(false); };
    const doApply = () => {
      if (!sched) return;
      setOpEdits((prev) => {
        const next = { ...prev };
        for (const id in sched.result) { const r = sched.result[id]; const wpId = id.replace(/^op-/, ""); next[wpId] = { ...(next[wpId] || {}), startDate: r.devStart, dueDate: r.qaEnd }; }
        window.saveRoadmapIDB(next, "roadmap_op_edits_v1");
        return next;
      });
      setApplied(true);
    };
    useEffect(() => { if (peopleLoaded && tasks.length && !sched) doCompute(); }, [peopleLoaded, tasks.length]); // eslint-disable-line

    const addPerson = (role, user) => { const id = role + "-" + (user ? user.id : Date.now().toString(36)); if (user && people.some((p) => p.id === id)) { setAddPickerRole(null); return; } setPeople((p) => [...p, { id, name: user ? user.name : (role === "dev" ? "Dev" : "QA"), role, off: [], opUserId: user ? user.id : null }]); setSched(null); setAddPickerRole(null); };
    const removePerson = (id) => { setPeople((p) => p.filter((x) => x.id !== id)); setSched(null); };
    const setRole = (id, role) => { setPeople((p) => p.map((x) => x.id === id ? { ...x, role } : x)); setSched(null); };
    const addOff = (id, date) => { date = (date || "").trim(); if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { alert("Format tanggal: YYYY-MM-DD"); return; } setPeople((p) => p.map((x) => x.id === id && x.off.indexOf(date) < 0 ? { ...x, off: [...x.off, date] } : x)); setSched(null); };
    const removeOff = (id, date) => { setPeople((p) => p.map((x) => x.id === id ? { ...x, off: x.off.filter((d) => d !== date) } : x)); setSched(null); };

    const capStats = useMemo(() => {
      // scope = EXACTLY the Roadmap Month View set: WP whose versionId ∈ linked versions of the active quarter.
      // Mirrors ui-roadmap mvOp (version filter). Deterministic — does NOT depend on Compute.
      const mv = (typeof window !== "undefined" && window._mvScope) || null;
      const hasScope = mv && mv.active && Array.isArray(mv.versionIds) && mv.versionIds.length;
      const verSet = hasScope ? new Set(mv.versionIds.map(String)) : null;
      // window = selected month (from Roadmap) OR current calendar month fallback.
      const monthStart = hasScope ? mv.monthStart : E.iso(new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), 1)));
      const monthEnd = hasScope ? mv.monthEnd : E.iso(new Date(Date.UTC(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth(), E.daysInMonth(cursorDate.getUTCFullYear(), cursorDate.getUTCMonth()))));
      let rows = tasks.filter((t) => t.status !== "done");
      if (verSet) rows = rows.filter((t) => verSet.has(t.versionId));
      rows = rows.slice().sort(E.orderCmp); // status > prio > metric
      const estRows = rows.filter((t) => E.devDaysOf(t) > 0 || E.qaDaysOf(t) > 0);
      const unestimated = rows.length - estRows.length;
      let dev = 0, qa = 0;
      estRows.forEach((t) => { dev += E.devDaysOf(t); qa += E.qaDaysOf(t); });
      // capacity window = SAME as workload window (the selected month) → % is apples-to-apples.
      const from = monthStart, to = monthEnd;
      const devCap = Math.max(1, E.effectiveCapacity(people, "dev", from, to, cap));
      const qaCap = Math.max(1, E.effectiveCapacity(people, "qa", from, to, cap));
      const nDev = people.filter((p) => p.role === "dev").length, nQa = people.filter((p) => p.role === "qa").length;
      const offDays = people.reduce((a, p) => a + p.off.filter((d) => d >= from && d <= to).length, 0);
      return { rows, estRows, unestimated, dev, qa, devCap, qaCap, pctD: Math.round(dev / devCap * 100), pctQ: Math.round(qa / qaCap * 100), nDev, nQa, offDays, from, to, scoped: !!verSet, monthStart, monthEnd };
    }, [tasks, people, cap, cursorDate]);

    const monthTasksById = tasksById;
    const todayISO = E.iso(new Date());
    const selTask = selId ? tasksById[selId] : null;
    const selSched = selId && sched && sched.result[selId];

    // ── render ──
    const S = STYLES;
    return (
      <div style={{ maxWidth: 1440, width: "100%", margin: "0 auto", overflow: "auto", background: "#0B0F14", color: "#E6EAF1", fontFamily: "inherit" }}>
        {/* toolbar */}
        <div style={S.toolbar}>
          <div style={{ display: "flex", background: "#0F172A", borderRadius: 8, padding: 3, gap: 2 }}>
            {[["month", "Month"], ["week", "Week"]].map(([v, l]) => (
              <button key={v} onClick={() => setView(v)} style={{ ...S.vbtn, background: view === v ? "#1D4ED8" : "transparent", color: view === v ? "#fff" : "#A7B1C2" }}>{l}</button>
            ))}
          </div>
          {view === "week" && (
            <div style={{ display: "flex", background: "#0F172A", borderRadius: 8, padding: 3, gap: 2 }}>
              {[1, 2, 3].map((n) => (<button key={n} onClick={() => setWeekSpan(n)} style={{ ...S.vbtn, background: weekSpan === n ? "#1D4ED8" : "transparent", color: weekSpan === n ? "#fff" : "#A7B1C2" }}>{n}W</button>))}
            </div>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button style={S.nav} onClick={() => setCursorDate((c) => view === "month" ? new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() - 1, 1)) : E.addDays(c, -weekSpan * 7))}>‹</button>
            <span style={{ fontSize: 12, fontWeight: 700, minWidth: 150, textAlign: "center" }}>{navLabel(view, cursorDate, weekSpan)}</span>
            <button style={S.nav} onClick={() => setCursorDate((c) => view === "month" ? new Date(Date.UTC(c.getUTCFullYear(), c.getUTCMonth() + 1, 1)) : E.addDays(c, weekSpan * 7))}>›</button>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
            {applied && <span style={{ fontSize: 10, color: "#22C55E", fontWeight: 700 }}>✓ applied ke roadmap</span>}
            <button style={{ ...S.btn, background: "#F59E0B", color: "#0B0F14" }} onClick={doCompute}>⚡ Compute</button>
            {sched && <button style={{ ...S.btn, background: "#22C55E", color: "#0B0F14" }} onClick={doApply}>✓ Apply</button>}
            {sched && <button style={{ ...S.btn, background: "#EF4444", color: "#fff" }} onClick={doDiscard}>✕ Discard</button>}
          </div>
        </div>

        {/* analysis row: People + Capacity (horizontal, 60vh) */}
        <div style={S.analysisRow}>
          <PeoplePanel {...{ people, cap, setCap, opUsers, addPickerRole, setAddPickerRole, addPerson, removePerson, setRole, addOff, removeOff, anchor }} />
          <CapacityPanel {...{ capStats, tasks, sched, cap }} />
        </div>

        {/* calendar */}
        <div style={{ padding: "0 12px 18px" }}>
          <div style={S.calHead}><h2 style={{ fontSize: 13, fontWeight: 700 }}>Calendar</h2><span style={{ fontSize: 10, color: "#6B7280" }}>jadwal hasil scheduler (absen-aware)</span></div>
          {!sched ? <div style={{ padding: 40, textAlign: "center", color: "#6B7280" }}>Klik ⚡ Compute untuk generate jadwal.</div>
            : view === "month" ? <MonthGrid {...{ cursorDate, people, tasksById, result: sched.result, todayISO, onSel: setSelId }} />
              : <WeekGrid {...{ cursorDate, weekSpan, people, tasksById, result: sched.result, todayISO, onSel: setSelId }} />}
        </div>

        {selTask && <DetailPanel {...{ task: selTask, sched: selSched, cap, onClose: () => setSelId(null) }} />}
      </div>
    );
  }

  function navLabel(view, c, span) {
    if (view === "month") return E.MONTHS[c.getUTCMonth()] + " " + c.getUTCFullYear();
    const ws = E.parseISO(E.startOfWeek(c)); const we = E.addDays(ws, span * 7 - 1);
    return E.iso(ws) + " — " + E.iso(we) + (span > 1 ? " (" + span + "W)" : "");
  }

  // ── shared inline styles ──
  const STYLES = {
    toolbar: { display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "10px 14px", background: "#151B23", borderBottom: "1px solid #263244" },
    vbtn: { padding: "4px 12px", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
    nav: { background: "none", border: "none", color: "#A7B1C2", fontSize: 18, fontWeight: 700, cursor: "pointer", padding: "3px 6px", borderRadius: 4 },
    btn: { padding: "4px 12px", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" },
    analysisRow: { display: "flex", gap: 10, alignItems: "stretch", margin: "12px", height: "52vh", minHeight: 340, maxHeight: 560 },
    panel: { border: "1px solid #263244", borderRadius: 8, background: "#0F172A", overflow: "hidden", display: "flex", flexDirection: "column", minWidth: 0 },
    phead: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderBottom: "1px solid #263244", flexWrap: "wrap" },
    ptitle: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700 },
    sub: { fontSize: 10, color: "#6B7280", fontWeight: 400 },
    foot: { display: "flex", justifyContent: "space-between", gap: 8, padding: "7px 12px", fontSize: 9, color: "#6B7280", borderTop: "1px solid #263244" },
    calHead: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, margin: "14px 0 8px", padding: "12px 14px", background: "#151B23", border: "1px solid #263244", borderRadius: "8px 8px 0 0" },
  };

  // ── People & Absen panel ──
  function PeoplePanel({ people, cap, setCap, opUsers, addPickerRole, setAddPickerRole, addPerson, removePerson, setRole, addOff, removeOff, anchor }) {
    const a = E.parseISO(anchor); const y = a.getUTCFullYear(), m = a.getUTCMonth();
    const win = { from: E.iso(new Date(Date.UTC(y, m, 1))), to: E.iso(new Date(Date.UTC(y, m, E.daysInMonth(y, m)))) };
    const used = new Set(people.map((p) => p.opUserId).filter(Boolean));
    return (
      <div style={{ ...STYLES.panel, flex: "1 1 44%" }}>
        <div style={STYLES.phead}>
          <div style={STYLES.ptitle}><span style={{ color: "#8B5CF6" }}>👥</span> People &amp; Absen <span style={STYLES.sub}>tiap orang = 1 lane · absen kurangi kapasitas</span></div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
            <label style={{ fontSize: 10, color: "#6B7280" }}>Cap
              <input type="number" min="0.1" max="1" step="0.05" value={cap} onChange={(e) => setCap(Math.max(0.1, Math.min(1, +e.target.value || 0.8)))} style={{ width: 48, marginLeft: 4, background: "#0f172a", border: "1px solid #263244", borderRadius: 4, padding: "2px 4px", fontSize: 11, color: "#E6EAF1", textAlign: "center" }} />
            </label>
            <button style={{ ...STYLES.btn, background: "#121820", color: "#E6EAF1", border: "1px solid #263244" }} onClick={() => setAddPickerRole(addPickerRole === "dev" ? null : "dev")}>+ Dev</button>
            <button style={{ ...STYLES.btn, background: "#121820", color: "#E6EAF1", border: "1px solid #263244" }} onClick={() => setAddPickerRole(addPickerRole === "qa" ? null : "qa")}>+ QA</button>
          </div>
        </div>
        {addPickerRole && (
          <div style={{ padding: "8px 12px", borderBottom: "1px solid #263244", background: "#0B0F14" }}>
            <div style={{ fontSize: 10, color: "#6B7280", marginBottom: 5 }}>Pilih user OP untuk ditambah sbg {addPickerRole.toUpperCase()}:</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5, maxHeight: 120, overflow: "auto" }}>
              {opUsers.length === 0 && <span style={{ fontSize: 10, color: "#b45309" }}>⚠ Daftar user OP kosong.</span>}
              {opUsers.filter((u) => !used.has(u.id)).map((u) => (
                <button key={u.id} onClick={() => addPerson(addPickerRole, u)} style={{ ...STYLES.btn, background: "#1e293b", color: "#E6EAF1", fontWeight: 600 }}>{u.name}</button>
              ))}
            </div>
          </div>
        )}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", display: "grid", gridTemplateColumns: "1fr", gap: 10, padding: "10px 12px" }}>
          {people.length === 0 && <div style={{ fontSize: 11, color: "#6B7280", textAlign: "center", padding: 20 }}>Belum ada orang. Klik + Dev / + QA untuk ambil dari OP.</div>}
          {people.map((p) => {
            const col = p.role === "dev" ? "#3B82F6" : "#22C55E";
            const avail = E.workdaysForPerson(p, win.from, win.to).length;
            const gross = E.workdaysBetween(win.from, win.to).length;
            return (
              <div key={p.id} style={{ border: "1px solid #263244", borderRadius: 7, background: "#121820", padding: "8px 10px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: col, flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#E6EAF1" }}>{esc(p.name)}</span>
                  <span style={{ display: "flex", gap: 2, marginLeft: 4 }}>
                    {["dev", "qa"].map((r) => (
                      <button key={r} onClick={() => setRole(p.id, r)} title={"set " + r.toUpperCase()} style={{ fontSize: 8, fontWeight: 700, padding: "1px 6px", borderRadius: 4, border: "none", cursor: "pointer", background: p.role === r ? (r === "dev" ? "#3B82F6" : "#22C55E") : "#263244", color: p.role === r ? "#0B0F14" : "#A7B1C2" }}>{r.toUpperCase()}</button>
                    ))}
                  </span>
                  <span style={{ fontSize: 9, color: "#6B7280", marginLeft: "auto" }}>{avail}/{gross}d bln ini</span>
                  <button onClick={() => removePerson(p.id)} title="hapus" style={{ background: "none", border: "none", color: "#6B7280", cursor: "pointer", fontSize: 13, padding: "0 2px" }}>✕</button>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, alignItems: "center" }}>
                  {p.off.length === 0 && <span style={{ fontSize: 9, color: "#6B7280" }}>belum ada absen</span>}
                  {p.off.slice().sort().map((d) => (
                    <span key={d} onClick={() => removeOff(p.id, d)} title="klik hapus" style={{ fontSize: 9, fontWeight: 600, padding: "2px 6px", borderRadius: 999, background: "#3A2A10", color: "#F59E0B", border: "1px solid #F59E0B40", cursor: "pointer", whiteSpace: "nowrap" }}>{d.slice(5)} ✕</span>
                  ))}
                  <input placeholder="+ YYYY-MM-DD" onKeyDown={(e) => { if (e.key === "Enter") { addOff(p.id, e.target.value); e.target.value = ""; } }} style={{ fontSize: 9, width: 96, background: "#0f172a", border: "1px dashed #263244", borderRadius: 999, padding: "2px 6px", color: "#A7B1C2", outline: "none" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div style={STYLES.foot}><span>Role & absen tersimpan lokal (tidak ke OP)</span><span>{people.filter((p) => p.role === "dev").length} dev · {people.filter((p) => p.role === "qa").length} qa</span></div>
      </div>
    );
  }

  // ── Capacity Analysis panel ──
  function CapacityPanel({ capStats, tasks, sched, cap }) {
    const cs = capStats;
    const lev = (v) => v ? <span style={{ display: "inline-flex", justifyContent: "center", minWidth: 22, padding: "2px 5px", borderRadius: 4, fontSize: 9, fontWeight: 700, background: v === "H" ? "#3b1e27" : v === "M" ? "#3b2e16" : "#123329", color: v === "H" ? "#fb7185" : v === "M" ? "#fbbf24" : "#4ade80" }}>{v}</span> : <span style={{ color: "#6B7280" }}>—</span>;
    const lane = (label, load, capv, pct) => (
      <div style={{ minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontSize: 10, marginBottom: 5, color: "#A7B1C2" }}><span>{label}</span><span><strong style={{ color: "#E6EAF1" }}>{load}d</strong> / {capv}d · <strong style={{ color: pct > 100 ? "#EF4444" : "#22C55E" }}>{pct}%</strong></span></div>
        <div style={{ height: 5, background: "#263244", borderRadius: 99, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 99, width: Math.min(100, pct) + "%", background: pct > 100 ? "#EF4444" : (label[0] === "D" ? "#3B82F6" : "#22C55E") }} /></div>
      </div>
    );
    return (
      <div style={{ ...STYLES.panel, flex: "1 1 56%" }}>
        <div style={STYLES.phead}>
          <div style={STYLES.ptitle}><span style={{ color: "#3B82F6" }}>▤</span> Capacity Analysis <span style={STYLES.sub}>dev=OP estimatedTime→effort L/M/H · qa=testing L/M/H · cap ×kapasitas (sekali)</span></div>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap", fontSize: 10, color: "#A7B1C2" }}>
            <span>Scope <strong style={{ color: "#E6EAF1" }}>{cs.rows.length}</strong> task (bln ini)</span>
            <span>Estimasi <strong style={{ color: "#E6EAF1" }}>{cs.estRows.length}</strong></span>
            {cs.unestimated > 0 && <span style={{ color: "#F59E0B" }} title="task tanpa OP estimatedTime & tanpa effort manual — tidak dihitung ke workload">⚠ {cs.unestimated} belum diestimasi</span>}
            <span>Dev <strong style={{ color: "#E6EAF1" }}>{cs.dev}d</strong></span>
            <span>QA <strong style={{ color: "#E6EAF1" }}>{cs.qa}d</strong></span>
            <span>👥 <strong style={{ color: "#E6EAF1" }}>{cs.nDev}</strong> dev · <strong style={{ color: "#E6EAF1" }}>{cs.nQa}</strong> qa</span>
            {cs.offDays > 0 && <span style={{ color: "#F59E0B" }}>🏖 {cs.offDays} off</span>}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: "10px 12px", borderBottom: "1px solid #263244" }}>
          {lane("Dev workload", cs.dev, cs.devCap, cs.pctD)}
          {lane("QA workload", cs.qa, cs.qaCap, cs.pctQ)}
        </div>
        <div style={{ flex: 1, minHeight: 0, overflow: "auto" }}>
          <table style={{ borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: 10, fontVariantNumeric: "tabular-nums" }}>
            <thead><tr>{["Task title", "Src", "Eff", "Test", "Dev", "QA", "Total", "Assigned"].map((hh, i) => (
              <th key={hh} style={{ position: "sticky", top: 0, background: "#151B23", color: "#8293AD", textAlign: i === 0 ? "left" : "center", fontSize: 9, fontWeight: 700, padding: "7px 8px", borderBottom: "1px solid #263244", whiteSpace: "nowrap" }}>{hh}</th>
            ))}</tr></thead>
            <tbody>
              {cs.rows.map((t) => {
                const d = E.devDaysOf(t), q = E.qaDaysOf(t);
                const src = t.opEstDays > 0 ? "OP" : (t.effort ? "man" : "—");
                const r = sched && sched.result[t.id];
                const dim = (d + q) === 0;
                return (
                  <tr key={t.id} style={{ borderBottom: "1px solid #26324480", opacity: dim ? 0.5 : 1 }}>
                    <td style={{ padding: "6px 8px", color: "#E6EAF1", maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={esc(t.fullTitle)}>{esc(t.title)}</td>
                    <td style={{ textAlign: "center", padding: "6px 4px", fontSize: 8, color: src === "OP" ? "#60a5fa" : src === "man" ? "#fbbf24" : "#6B7280" }} title={src === "OP" ? "dari OP estimatedTime" : src === "man" ? "effort L/M/H manual" : "belum diestimasi"}>{src}</td>
                    <td style={{ textAlign: "center", padding: "6px 4px" }}>{lev(t.effort)}</td>
                    <td style={{ textAlign: "center", padding: "6px 4px" }}>{lev(t.testing)}</td>
                    <td style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: d ? "#E6EAF1" : "#6B7280" }}>{d ? d + "d" : "—"}</td>
                    <td style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: q ? "#E6EAF1" : "#6B7280" }}>{q ? q + "d" : "—"}</td>
                    <td style={{ textAlign: "center", padding: "6px 8px", fontWeight: 700, color: (d + q) ? "#E6EAF1" : "#6B7280" }}>{(d + q) ? (d + q) + "d" : "—"}</td>
                    <td style={{ textAlign: "center", padding: "6px 8px", fontSize: 9 }}>{r ? <span><span style={{ color: "#3B82F6" }}>{esc(r.devPersonName)}</span> · <span style={{ color: "#22C55E" }}>{esc(r.qaPersonName)}</span></span> : <span style={{ color: "#6B7280" }}>—</span>}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={STYLES.foot}><span>Estimasi hari kerja · Assigned muncul setelah Compute</span><span>{cs.rows.length} task</span></div>
      </div>
    );
  }

  // ── Month calendar grid ──
  function MonthGrid({ cursorDate, people, tasksById, result, todayISO, onSel }) {
    const y = cursorDate.getUTCFullYear(), m = cursorDate.getUTCMonth();
    const first = new Date(Date.UTC(y, m, 1));
    const startDow = (first.getUTCDay() + 6) % 7;
    const startDate = E.addDays(first, -startDow);
    const rangeStart = E.iso(startDate), rangeEnd = E.iso(E.addDays(startDate, 41));
    const dayMap = E.buildDayMap(tasksById, people, result, rangeStart, rangeEnd);
    const rows = [];
    for (let w = 0; w < 6; w++) {
      const rowDate = E.addDays(startDate, w * 7);
      if (w > 0 && rowDate.getUTCMonth() !== m && rowDate.getUTCDate() > 7) break;
      const cells = [];
      for (let dd = 0; dd < 7; dd++) {
        const cd = E.addDays(rowDate, dd), ci = E.iso(cd);
        const isWe = dd >= 5, isOut = cd.getUTCMonth() !== m, isToday = ci === todayISO;
        const chips = dayMap[ci] || [];
        cells.push(
          <div key={dd} style={{ flex: "1 1 0", minWidth: 0, minHeight: 110, padding: "7px 6px", background: isWe ? "#0E141B" : "#121820", opacity: isOut ? 0.4 : 1, boxShadow: isToday ? "inset 0 0 0 2px #3B82F6" : "none", borderRight: "1px solid #263244" }}>
            <div style={{ fontSize: 11, fontWeight: 700, marginBottom: 6, color: isToday ? "#3B82F6" : (isOut ? "#6B7280" : "#E6EAF1") }}>{cd.getUTCDate()}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, minWidth: 0 }}>
              {chips.slice(0, 4).map((c, i) => (
                <div key={i} onClick={() => onSel(c.id)} title={c.title + " · " + c.phase + " · " + c.person} style={{ display: "flex", alignItems: "center", gap: 5, padding: "3px 6px", borderRadius: 5, fontSize: 9, height: 22, cursor: "pointer", overflow: "hidden", whiteSpace: "nowrap", minWidth: 0, background: E.PRIO_TINT[c.prio] || "#1E293B", borderLeft: "3px solid " + (c.phase === "Dev" ? "#3B82F6" : "#22C55E") }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", minWidth: 0 }}>{c.title} · {c.phase} d{c.d}/{c.total}</span>
                </div>
              ))}
              {chips.length > 4 && <div style={{ fontSize: 9, color: "#6B7280", padding: "0 4px" }}>+{chips.length - 4} more</div>}
            </div>
          </div>
        );
      }
      rows.push(<div key={w} style={{ display: "flex", gap: 1, background: "#263244", width: "100%" }}>{cells}</div>);
    }
    return (
      <div style={{ background: "#263244", borderRadius: "0 0 8px 8px", overflow: "hidden", width: "100%" }}>
        <div style={{ display: "flex", gap: 1, width: "100%" }}>{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d, i) => (
          <div key={d} style={{ flex: "1 1 0", minWidth: 0, textAlign: "center", padding: "10px 0", fontSize: 10, fontWeight: 600, color: i >= 5 ? "#6B7280" : "#A7B1C2", background: i >= 5 ? "#0E141B" : "#151B23" }}>{d}</div>
        ))}</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>{rows}</div>
      </div>
    );
  }

  // ── Week calendar grid (day columns with cap meter) ──
  function WeekGrid({ cursorDate, weekSpan, people, tasksById, result, todayISO, onSel }) {
    const ws = E.parseISO(E.startOfWeek(cursorDate));
    const numDays = weekSpan * 7;
    const nDev = people.filter((p) => p.role === "dev").length || 1, nQa = people.filter((p) => p.role === "qa").length || 1;
    const cols = [];
    const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    for (let d = 0; d < numDays; d++) {
      const cd = E.addDays(ws, d), ci = E.iso(cd), isToday = ci === todayISO, isWe = cd.getUTCDay() === 0 || cd.getUTCDay() === 6;
      const chips = E.buildDayMap(tasksById, people, result, ci, ci)[ci] || [];
      const devA = chips.filter((c) => c.phase === "Dev").length, qaA = chips.filter((c) => c.phase === "QA").length;
      const dn = dayNames[cd.getUTCDay() === 0 ? 6 : cd.getUTCDay() - 1];
      cols.push(
        <div key={d} style={{ flex: "1 0 135px", minWidth: 135, minHeight: 320, borderRight: "1px solid #263244", background: isToday ? "#0E1A2D" : (isWe ? "#0E141B" : "#121820"), display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "9px 5px", textAlign: "center", fontSize: 10, fontWeight: 700, borderBottom: "1px solid #263244", color: isToday ? "#3B82F6" : "#A7B1C2" }}>
            <span style={{ fontSize: 8, color: "#6B7280", display: "block" }}>{dn}</span>
            <span style={{ fontSize: 18, display: "block", color: isToday ? "#3B82F6" : "#E6EAF1" }}>{cd.getUTCDate()}</span>
          </div>
          <div style={{ padding: "7px 8px", borderBottom: "1px solid #263244", background: "#151B23" }}>
            {[["D", devA, nDev, "#3B82F6"], ["Q", qaA, nQa, "#22C55E"]].map(([lb, a, cp, co]) => (
              <div key={lb} style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 8, color: "#6B7280", marginBottom: 1 }}>
                <span style={{ color: co }}>{lb}</span>
                <div style={{ height: 3, borderRadius: 2, background: "#222B36", flex: 1, overflow: "hidden" }}><div style={{ height: "100%", borderRadius: 2, width: Math.min(100, a / cp * 100) + "%", background: a > cp ? "#EF4444" : co }} /></div>
                <span>{a}/{cp}</span>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: 6, display: "flex", flexDirection: "column", gap: 5, overflow: "auto" }}>
            {isWe && chips.length === 0 && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 9, padding: "20px 8px" }}>Weekend</div>}
            {!isWe && chips.length === 0 && <div style={{ textAlign: "center", color: "#6B7280", fontSize: 8, padding: 8 }}>—</div>}
            {chips.map((c, i) => (
              <div key={i} onClick={() => onSel(c.id)} style={{ background: "#0F172A", border: "1px solid #263244", borderRadius: 6, padding: 7, cursor: "pointer" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 2, flexWrap: "wrap" }}>
                  <span style={{ padding: "1px 5px", borderRadius: 3, fontSize: 8, fontWeight: 700, color: "#fff", background: E.PRIO_COL[c.prio] || "#6B7280" }}>{c.prio === "Backlog" ? "BL" : c.prio}</span>
                  <span style={{ fontSize: 8, fontWeight: 600, color: c.phase === "Dev" ? "#3B82F6" : "#22C55E" }}>{c.phase} d{c.d}/{c.total}</span>
                  <span style={{ fontSize: 8, color: "#6B7280" }}>{c.person}</span>
                </div>
                <div style={{ fontSize: 10, color: "#E6EAF1", lineHeight: 1.35 }}>{esc(c.title)}</div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return <div style={{ display: "flex", overflowX: "auto", border: "1px solid #263244", borderRadius: 8 }}>{cols}</div>;
  }

  // ── Detail side panel ──
  function DetailPanel({ task, sched, cap, onClose }) {
    const t = task;
    const dd = E.devDaysOf(t), qd = E.qaDaysOf(t);
    const row = (l, v, col) => <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "2px 0" }}><span style={{ color: "#6B7280" }}>{l}</span><span style={{ fontWeight: 600, color: col || "#E6EAF1" }}>{v}</span></div>;
    return (
      <div style={{ position: "fixed", right: 0, top: 0, bottom: 0, width: 300, background: "#151B23", borderLeft: "1px solid #263244", overflowY: "auto", zIndex: 40, boxShadow: "-12px 0 36px #0008" }}>
        <div style={{ padding: 12, borderBottom: "1px solid #263244", display: "flex", alignItems: "flex-start", gap: 8 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, flex: 1, lineHeight: 1.3 }}>{esc(t.fullTitle)}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#6B7280", fontSize: 16, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10 }}>
          <div>
            {row("Priority", t.priority, E.PRIO_COL[t.priority])}
            {row("Bucket", t.bucket.toUpperCase())}
            {row("Type", t.typeName || "—")}
            {t.opId ? row("OP #", t.opId + (t.opStatus ? " · " + t.opStatus : ""), "#3B82F6") : null}
          </div>
          <div style={{ background: "#3B82F60A", border: "1px solid #3B82F620", borderRadius: 6, padding: "7px 8px", fontSize: 11 }}>
            <div style={{ fontWeight: 700, marginBottom: 2 }}>Dev {dd}d + QA {qd}d = {dd + qd} hari kerja</div>
            {sched ? <div style={{ fontSize: 9, color: "#6B7280", lineHeight: 1.4 }}>📅 Dev: {sched.devStart} → {sched.devEnd} <span style={{ color: "#3B82F6" }}>· {esc(sched.devPersonName)}</span><br />📅 QA: {sched.qaStart} → {sched.qaEnd} <span style={{ color: "#22C55E" }}>· {esc(sched.qaPersonName)}</span></div>
              : <div style={{ fontSize: 9, color: "#6B7280" }}>×risk÷cap (cap={cap})</div>}
          </div>
          <div style={{ fontSize: 9, color: "#6B7280" }}>Impact {t.impact} · Effort {t.effort} · Testing {t.testing} (dari overlay roadmap; kosong → default)</div>
        </div>
      </div>
    );
  }

  window.PlannerModule = window.PlannerModule || {};
  window.PlannerModule.PlannerPage = PlannerPage;
})();
