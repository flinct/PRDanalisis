// ui-roadmap.js — Dashboard v2 Roadmap page + support cluster. Extracted 2026-10-13.
// Reads roadmap IDB helpers + RM_SEED_PATH from window. Exports RoadmapPage + roadmapAddQ bridge.
window.RoadmapV2Module = (function () {
// ── RoadmapPage: pixel replica of pen export 'Roadmap — All View (4Q)' ──
// ponytail: ported 1:1 from roadmap-export.html. flex+fixed px (not grid). Per-month pill cells
// (active = prio color @50, inactive = #1e293b). Status = pill rounded-12. Avatars overlap -6 + ring.
// Months Indonesian per pen spec. Wire real data later.
// ── Roadmap Dropdown: reusable click-to-edit pill menu (local state only) ──
// ponytail: one component for prio/status/E/I/T. Absolute menu, outside-click close.
function RoadmapDropdown({ value, options, colorMap, w, radius, onChange }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);
  React.useEffect(() => {
    if (!open) return;
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open]);
  const c = colorMap[value] || "#94a3b8";
  return (
    <div ref={ref} style={{ width: w, flexShrink: 0, display: "flex", alignItems: "center", position: "relative" }}>
      <span onClick={(e) => { e.stopPropagation(); setOpen((o) => !o); }}
        style={{ display: "flex", width: "100%", boxSizing: "border-box", alignItems: "center", justifyContent: "center", cursor: "pointer", padding: radius >= 12 ? "5px 8px" : "5px 6px", background: c + "20", borderRadius: radius, fontSize: 9, fontWeight: 700, color: c, whiteSpace: "nowrap" }}>{value}</span>
      {open && (
        <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, zIndex: 50, background: "#111827", border: "1px solid #263244", borderRadius: 6, overflow: "hidden", minWidth: 90 }}>
          {options.map((o) => (
            <div key={o} onClick={(e) => { e.stopPropagation(); onChange(o); setOpen(false); }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#1e293b")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              style={{ padding: "6px 10px", fontSize: 10, fontWeight: 700, color: colorMap[o] || "#cbd5e1", cursor: "pointer", whiteSpace: "nowrap", textAlign: "center" }}>{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ponytail: module-level bridge so the tier-2 nav-row "+ Q" button can
// trigger addQuarter() living inside RoadmapPage without lifting state.
const roadmapAddQ = { fn: null };
const RM_MONTHS_ID = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
const RM_Q_DOTS = ["#f59e0b", "#3b82f6", "#a78bfa", "#22c55e", "#06b6d4", "#ec4899", "#475569"];
// next quarter after a label like "Q4 2026" → "Q1 2027"; months follow calendar
function nextQuarter(prev, usedDots) {
  const m = /Q([1-4])\s+(\d{4})/.exec(prev.label || "");
  let qn = m ? +m[1] : 1, yr = m ? +m[2] : new Date().getFullYear();
  qn = qn % 4 + 1; if (qn === 1) yr += 1; // Q4→Q1 rolls year
  const start = (qn - 1) * 3; // Q1→0(Jan), Q4→9(Okt)
  const dot = RM_Q_DOTS.find((d) => !usedDots.includes(d)) || RM_Q_DOTS[(qn - 1) % RM_Q_DOTS.length];
  return { label: "Q" + qn + " " + yr, dot, months: [0, 1, 2].map((i) => RM_MONTHS_ID[start + i]) };
}

// ── qLink model helpers (multi-version). New shape: { versions:[{id,name,color}], scope } ──
// scope: {type:'all-months'} | {type:'months',months:[0..2]} | {type:'all-weeks'} | {type:'weeks',weeks:[1..4]}
const VER_PALETTE = ["#f59e0b", "#ec4899", "#3b82f6", "#22c55e", "#a78bfa", "#06b6d4", "#ef4444", "#84cc16"];
const verColor = (id) => { let h = 0; const s = String(id); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return VER_PALETTE[h % VER_PALETTE.length]; };
// normalize old single-version shape → {versions:[...], scope}
function qlNorm(lk) {
  if (!lk) return null;
  if (Array.isArray(lk.versions)) return lk;
  // legacy: {versionId, versionName, scope:'all'|{weeks}}
  const versions = lk.versionId != null ? [{ id: lk.versionId, name: lk.versionName || ("v" + lk.versionId), color: verColor(lk.versionId) }] : [];
  const scope = lk.scope === "all" || !lk.scope ? { type: "all-months" } : { type: "weeks", weeks: lk.scope.weeks || [] };
  return { versions, scope };
}
const qlVerIds = (lk) => { const n = qlNorm(lk); return n ? n.versions.map((v) => v.id) : []; };
const qlScopeLabel = (scope, months) => {
  if (!scope || scope.type === "all-months") return "all months";
  if (scope.type === "all-weeks") return "all weeks";
  if (scope.type === "months") return (scope.months || []).map((mi) => months[mi]).join(",");
  if (scope.type === "weeks") return "W" + (scope.weeks || []).join("");
  return "";
};
// seamless header badge: up to 3 colored diamonds + "+N"
function VerDiamonds({ lk, size = 11 }) {
  const n = qlNorm(lk);
  if (!n || !n.versions.length) return null;
  const shown = n.versions.slice(0, 3), extra = n.versions.length - shown.length;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {shown.map((v) => <span key={v.id} title={v.name} style={{ color: v.color, fontSize: size }}>◆</span>)}
      {extra > 0 && <span style={{ fontSize: size - 2, fontWeight: 700, color: "#94a3b8" }}>+{extra}</span>}
    </span>
  );
}

// ── QLinkPopup: multi-version OP linker (search + scope all/specific months|weeks + chips) ──
function QLinkPopup({ x, y, qLabel, months, versions, current, onClose, onLink, onUnlink }) {
  const cur = qlNorm(current);
  const [sel, setSel] = React.useState(cur ? cur.versions : []); // [{id,name,color}]
  const [scope, setScope] = React.useState(cur ? cur.scope : { type: "all-months" });
  const [search, setSearch] = React.useState("");
  const selIds = new Set(sel.map((v) => String(v.id)));
  const toggleVer = (v) => setSel((s) => selIds.has(String(v.id)) ? s.filter((x) => String(x.id) !== String(v.id)) : [...s, { id: v.id, name: v.name, color: verColor(v.id) }]);
  const filtered = (versions || []).filter((v) => !search.trim() || (v.name || "").toLowerCase().includes(search.trim().toLowerCase()));
  const canLink = sel.length > 0 &&
    (scope.type === "all-months" || scope.type === "all-weeks" ||
     (scope.type === "months" && (scope.months || []).length > 0) ||
     (scope.type === "weeks" && (scope.weeks || []).length > 0));
  const toggleIn = (key, val) => setScope((sc) => { const arr = sc[key] || []; return { ...sc, [key]: arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val].sort() }; });
  const scopeCard = (type, title, sub) => (
    <div onClick={() => setScope((sc) => sc.type === type ? sc : { type, ...(type === "months" ? { months: [] } : type === "weeks" ? { weeks: [] } : {}) })}
      style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "7px 10px", cursor: "pointer", borderRadius: 6, border: "1px solid " + (scope.type === type ? "#3b82f6" : "#263244"), background: scope.type === type ? "#3b82f615" : "transparent", marginBottom: 4 }}>
      <div style={{ width: 13, height: 13, flexShrink: 0, marginTop: 1, borderRadius: 7, border: "2px solid " + (scope.type === type ? "#3b82f6" : "#475569"), background: scope.type === type ? "#3b82f6" : "transparent" }} />
      <div><div style={{ fontSize: 11, fontWeight: 600, color: scope.type === type ? "#dbeafe" : "#f1f5f9" }}>{title}</div><div style={{ fontSize: 9, color: "#64748b", marginTop: 1 }}>{sub}</div></div>
    </div>
  );
  return (
    <div onClick={(e) => e.stopPropagation()} style={{ position: "fixed", left: x, top: y, zIndex: 300, width: 440, maxHeight: "80vh", display: "flex", flexDirection: "column", background: "#111827", border: "1px solid #263244", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,.6)", overflow: "hidden" }}>
      <div style={{ background: "#0f172a", padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>Link OP Version → {qLabel}</div>
          <div style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>Pilih satu atau lebih version dari OpenProject</div>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search version..."
          style={{ width: 150, flexShrink: 0, background: "#111827", border: "1px solid #263244", borderRadius: 6, padding: "5px 9px", fontSize: 11, color: "#e5e7eb", outline: "none", fontFamily: "inherit" }} />
      </div>
      <div style={{ display: "flex", minHeight: 0, flex: 1 }}>
        {/* version list */}
        <div style={{ width: 210, flexShrink: 0, borderRight: "1px solid #1e293b", display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#475569" }}>VERSION ({(versions || []).length})</div>
          <div style={{ overflow: "auto", flex: 1 }}>
            {filtered.length === 0 && <div style={{ padding: "8px 12px", fontSize: 11, color: "#64748b" }}>No versions.</div>}
            {filtered.map((v) => {
              const on = selIds.has(String(v.id));
              return (
                <div key={v.id} onClick={() => toggleVer(v)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", cursor: "pointer", background: on ? "#3b82f615" : "transparent" }}>
                  <div style={{ width: 13, height: 13, flexShrink: 0, borderRadius: 3, background: on ? "#3b82f6" : "transparent", border: "1px solid " + (on ? "#3b82f6" : "#475569"), display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#fff" }}>{on ? "✓" : ""}</div>
                  <span style={{ color: verColor(v.id), fontSize: 11, flexShrink: 0 }}>◆</span>
                  <span style={{ flex: 1, minWidth: 0, fontSize: 11, color: "#f1f5f9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.name}</span>
                  <span style={{ fontSize: 9, color: (v.status === "closed" ? "#64748b" : "#22c55e") }}>{v.status || "open"}</span>
                </div>
              );
            })}
          </div>
        </div>
        {/* scope + chips */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <div style={{ padding: "8px 12px", overflow: "auto", flex: 1 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#475569", marginBottom: 6 }}>APPLY TO</div>
            {scopeCard("all-months", "All months in quarter", months.join(", "))}
            {scopeCard("months", "Specific months", "Pilih bulan tertentu")}
            {scope.type === "months" && (
              <div style={{ display: "flex", gap: 4, padding: "0 0 6px 24px" }}>
                {months.map((mn, mi) => (
                  <div key={mn} onClick={() => toggleIn("months", mi)} style={{ padding: "3px 10px", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 700, color: (scope.months || []).includes(mi) ? "#3b82f6" : "#475569", background: (scope.months || []).includes(mi) ? "#3b82f620" : "transparent" }}>{mn}</div>
                ))}
              </div>
            )}
            {scopeCard("all-weeks", "All weeks in quarter", "Semua minggu di " + months.join(", "))}
            {scopeCard("weeks", "Specific weeks", "Pilih minggu tertentu")}
            {scope.type === "weeks" && (
              <div style={{ display: "flex", gap: 4, padding: "0 0 6px 24px" }}>
                {[1, 2, 3, 4].map((w) => (
                  <div key={w} onClick={() => toggleIn("weeks", w)} style={{ width: 30, padding: "3px 0", textAlign: "center", borderRadius: 4, cursor: "pointer", fontSize: 10, fontWeight: 700, color: (scope.weeks || []).includes(w) ? "#3b82f6" : "#475569", background: (scope.weeks || []).includes(w) ? "#3b82f620" : "transparent" }}>W{w}</div>
                ))}
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: "8px 0 4px" }}>
              <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: "#475569" }}>SELECTED VERSIONS ({sel.length})</span>
              {sel.length > 0 && <span onClick={() => setSel([])} style={{ fontSize: 10, color: "#60a5fa", cursor: "pointer" }}>Clear all</span>}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {sel.length === 0 && <span style={{ fontSize: 10, color: "#475569" }}>Belum ada version dipilih.</span>}
              {sel.map((v) => (
                <span key={v.id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#0f172a", border: "1px solid #263244", borderRadius: 6, padding: "3px 8px", fontSize: 10, color: "#e5e7eb" }}>
                  <span style={{ color: v.color }}>◆</span>{v.name}
                  <span onClick={() => setSel((s) => s.filter((x) => String(x.id) !== String(v.id)))} style={{ cursor: "pointer", color: "#64748b" }}>×</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#0f172a", padding: "10px 14px", borderTop: "1px solid #1e293b" }}>
        {current && <button onClick={onUnlink} style={{ marginRight: "auto", cursor: "pointer", border: "none", background: "transparent", color: "#ef4444", fontSize: 11 }}>Unlink</button>}
        <button onClick={onClose} style={{ marginLeft: current ? 0 : "auto", cursor: "pointer", border: "none", background: "transparent", color: "#94a3b8", fontSize: 11, padding: "6px 10px" }}>Cancel</button>
        <button disabled={!canLink} onClick={() => onLink({ versions: sel, scope })}
          style={{ cursor: canLink ? "pointer" : "not-allowed", border: "none", background: canLink ? "#f59e0b" : "#f59e0b40", color: "#0B0F15", fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "6px 12px" }}>Link version</button>
      </div>
    </div>
  );
}

const RM_CAL = { Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Mei: 4, Jun: 5, Jul: 6, Aug: 7, Agu: 7, Sep: 8, Oct: 9, Okt: 9, Nov: 10, Dec: 11, Des: 11 };

function RoadmapPage() {
    const loadRoadmapIDB = window.loadRoadmapIDB, saveRoadmapIDB = window.saveRoadmapIDB, RM_SEED_PATH = window.RM_SEED_PATH;
  const QUARTERS_INIT = [
    { label: "Q4 2026", dot: "#f59e0b", months: ["Okt", "Nov", "Des"] },
    { label: "Q1 2027", dot: "#3b82f6", months: ["Jan", "Feb", "Mar"] },
    { label: "Q2 2027", dot: "#a78bfa", months: ["Apr", "Mei", "Jun"] },
    { label: "Q3 2027", dot: "#475569", months: ["Jul", "Agu", "Sep"] },
  ];
  const [QUARTERS, setQuarters] = React.useState(QUARTERS_INIT);
  const [saveCd, setSaveCd] = React.useState(0); // countdown to server save
  const [savedFlash, setSavedFlash] = React.useState(false); // "✓ saved" flash after save
  React.useEffect(() => { const iv = setInterval(() => { setSaveCd(_rmSaveCountdown); setSavedFlash(_rmSavedFlashUntil > Date.now()); }, 500); return () => clearInterval(iv); }, []);
  const qLoaded = React.useRef(false);
  // persist custom quarter list to IDB (roadmap_quarters_v1) — load on mount, save on change (same pattern as qLink)
  React.useEffect(() => {
    loadRoadmapIDB("roadmap_quarters_v1").then((s) => {
      if (Array.isArray(s) && s.length) setQuarters(s);
      qLoaded.current = true;
    }).catch(() => { qLoaded.current = true; });
  }, []);
  React.useEffect(() => { if (qLoaded.current) saveRoadmapIDB(QUARTERS, "roadmap_quarters_v1"); }, [QUARTERS]);
  // ponytail: addQuarter already defined below (via nextQuarter + roadmapAddQ nav bridge) — don't redeclare here.
  // qLink: { [qLabel]: { versionId, versionName, scope } }  scope='all' | {weeks:[1..4]}
  const [qLink, setQLink] = React.useState({});
  const qLinkLoaded = React.useRef(false);
  // persist qLink to IDB (roadmap_q_link_v1) — load on mount, save on change
  React.useEffect(() => {
    loadRoadmapIDB("roadmap_q_link_v1").then((s) => {
      if (s && typeof s === "object") setQLink(s);
      qLinkLoaded.current = true;
    }).catch(() => { qLinkLoaded.current = true; });
  }, []);
  React.useEffect(() => {
    if (qLinkLoaded.current) saveRoadmapIDB(qLink, "roadmap_q_link_v1"); // skip the initial empty write before load resolves
  }, [qLink]);
  const [bdTarget, setBdTarget] = React.useState(null); // breakdown popup target task
  const BD_ROLES_INIT = [
    { role: 'PM Spec', color: '#8B5CF6', prefix: 'PM', defaultAssignee: 'Dany Christian' },
    { role: 'Dev', color: '#3B82F6', prefix: 'Dev', defaultAssignee: 'Naftal Yunior' },
    { role: 'QA', color: '#22C55E', prefix: 'QA', defaultAssignee: 'Agung D' },
  ];
  const [bdRoles, setBdRoles] = React.useState([]); // reset when bdTarget changes
  // Fase 5: Feature breakdown — milestone → N Feature WP children (parentId). rows of {title}.
  const [bdFeatures, setBdFeatures] = React.useState([{ title: '' }]);
  const [bdState, setBdState] = React.useState({ saving: false, error: '', done: 0 });
  React.useEffect(() => {
    if (bdTarget) { setBdRoles(BD_ROLES_INIT.map(r => ({ ...r, on: true, name: `${r.prefix}: ${bdTarget.task}` }))); setBdFeatures([{ title: '' }]); setBdState({ saving: false, error: '', done: 0 }); }
  }, [bdTarget]);
  const [qPopup, setQPopup] = React.useState(null); // { label, x, y }
  const [monthView, setMonthView] = React.useState(null); // null | { qLabel, mi } (mi 0..2 within quarter)
  const [addModal, setAddModal] = React.useState(null); // null | 'single' | 'multi' | 'import'
  // ── Milestone intake (Fase 4): 1 request → 1 Milestone WP in OP. Supporting docs stay LOCAL (analysis only, never pushed). ──
  const MS_FORM_INIT = { title: '', desc: '', area: '', prio: 'P2', typeName: 'Milestone', docs: [], checkResult: null, checking: false };
  const [msForm, setMsForm] = React.useState(MS_FORM_INIT);
  const [msState, setMsState] = React.useState({ saving: false, error: '' });
  const [msDocDraft, setMsDocDraft] = React.useState({ label: '', ref: '', note: '' }); // one doc-entry being typed
  // supporting docs store (IDB roadmap_ms_docs_v1), keyed by OP id: { [opId]: { area, docs:[{label,ref,note}], createdAt } }. LOCAL only.
  const [msDocs, setMsDocs] = React.useState({});
  React.useEffect(() => { (async () => { try { const s = await loadRoadmapIDB('roadmap_ms_docs_v1'); if (s && typeof s === 'object') setMsDocs(s); } catch (_) {} })(); }, []);
  const qClickTimer = React.useRef(null); // distinguish single (month view) vs double (link popup) click on Q
  // Q timeline area is capped at 38vw and scrolls horizontally. ALL strips (header + every row) are scroll sources,
  // synced to one shared scrollLeft so dragging from any row moves the whole timeline together. header row is sticky-top.
  const qScrollNodes = React.useRef(new Set());
  const qSyncing = React.useRef(false);
  const regQScroll = (el) => { if (!el) return; qScrollNodes.current.add(el); };
  const onQScroll = (e) => {
    if (qSyncing.current) return;
    qSyncing.current = true;
    const sl = e.target.scrollLeft;
    qScrollNodes.current.forEach((n) => { if (n.isConnected && n !== e.target && n.scrollLeft !== sl) n.scrollLeft = sl; });
    requestAnimationFrame(() => { qSyncing.current = false; });
  };
  // Q timeline strip: 38vw cap, horizontal scroll, synced with all siblings. used in header + every row.
  // per-strip scrollbar hidden via .q-nobar; ONE shared scrollbar renders at table bottom (qScrollBar).
  const qStrip = (children) => (
    <div ref={regQScroll} onScroll={onQScroll} className="q-nobar"
      style={{ display: "flex", alignItems: "center", gap: 4, width: "38vw", flexShrink: 0, overflowX: "auto", overflowY: "hidden" }}>
      {children}
    </div>
  );
  // single shared horizontal scrollbar, sticky at the table bottom. inner spacer = total quarters width so the thumb size matches.
  const QTOTAL = () => QUARTERS.length * 152 + (QUARTERS.length - 1) * 4;
  const qScrollBar = (
    <div ref={regQScroll} onScroll={onQScroll}
      style={{ position: "sticky", bottom: 0, left: "auto", alignSelf: "flex-end", width: "38vw", flexShrink: 0, overflowX: "auto", overflowY: "hidden", background: "#0B0F15", zIndex: 4 }}>
      <div style={{ width: QTOTAL(), height: 1 }} />
    </div>
  );
  const [opVersions, setOpVersions] = React.useState([]);
  const [opMeta, setOpMeta] = React.useState({ priorities: [], statuses: [], types: [] }); // for roadmap→OP id mapping on push
  const [opPeople, setOpPeople] = React.useState([]); // available assignees fetched from OP (may be empty if token lacks permission)
  const [opEdits, setOpEdits] = React.useState({}); // local overlay of OP-row edits, keyed by wp.id. persisted; pushed to OP on demand.
  const opEditsLoaded = React.useRef(false);
  // ── Roadmap v2 OP cache: OpenProject = source of truth. Fetch ALL WP of project 7 once, cache in IDB. ──
  // All/Month View (Fase 3) will read from here instead of per-version mvOp or roadmap_v1.
  const [opCache, setOpCache] = React.useState({ rows: [], ts: null, loading: false, error: "" });
  const opCacheLoaded = React.useRef(false);
  // refresh: GET every WP (all versions + backlog, incl. closed) → persist to IDB op_cache_v1 + timestamp.
  const refreshOpCache = React.useCallback(async () => {
    setOpCache((p) => ({ ...p, loading: true, error: "" }));
    try {
      const r = await fetch("/api/dashboard/openproject/work-packages?all=1&includeClosed=1&pageSize=200");
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "fetch gagal");
      const rows = d.allWorkPackages || d.workPackages || [];
      const payload = { rows, ts: Date.now() };
      setOpCache({ rows: payload.rows, ts: payload.ts, loading: false, error: "" });
      try { await saveRoadmapIDB(payload, "op_cache_v1"); } catch (_) {}
      if (typeof window !== "undefined") window._opCache = payload;
      return payload;
    } catch (e) {
      setOpCache((p) => ({ ...p, loading: false, error: String(e.message || e) }));
      return null;
    }
  }, []);
  // boot: load cached rows from IDB first (instant render), then refresh from server in background.
  React.useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const cached = await loadRoadmapIDB("op_cache_v1");
        if (alive && cached && Array.isArray(cached.rows)) {
          setOpCache({ rows: cached.rows, ts: cached.ts || null, loading: false, error: "" });
          if (typeof window !== "undefined") window._opCache = cached;
        }
      } catch (_) {}
      opCacheLoaded.current = true;
      if (alive) refreshOpCache();
    })();
    return () => { alive = false; };
  }, [refreshOpCache]);
  // parent→children tree from the cache. Milestone (typeId 2) nodes carry their Feature/child WPs.
  const opTree = React.useMemo(() => {
    const rows = opCache.rows || [];
    const byId = new Map(rows.map((w) => [w.id, w]));
    const childrenOf = new Map();
    const roots = [];
    rows.forEach((w) => {
      if (w.parentId && byId.has(w.parentId)) {
        if (!childrenOf.has(w.parentId)) childrenOf.set(w.parentId, []);
        childrenOf.get(w.parentId).push(w);
      } else {
        roots.push(w);
      }
    });
    return { rows, byId, childrenOf, roots };
  }, [opCache.rows]);
  // version + priority/status meta + available assignees from OpenProject.
  // Cached to IDB (roadmap_op_meta_v1) so the detail-panel status dropdown works instantly on reload, before the network returns.
  const opMetaLoaded = React.useRef(false);
  React.useEffect(() => {
    let dead = false;
    (async () => {
      // boot: hydrate from IDB cache first
      try {
        const cached = await loadRoadmapIDB("roadmap_op_meta_v1");
        if (!dead && cached && typeof cached === "object") {
          if (Array.isArray(cached.versions)) setOpVersions(cached.versions);
          if (cached.priorities || cached.statuses) setOpMeta({ priorities: cached.priorities || [], statuses: cached.statuses || [], types: cached.types || [] });
          if (Array.isArray(cached.people)) setOpPeople(cached.people);
        }
      } catch (_) {}
      // refresh from server
      let fresh = {};
      try {
        const r = await fetch("/api/dashboard/openproject/meta?projectId=7");
        const d = await r.json();
        if (!dead && d.ok) { setOpVersions(d.versions || []); setOpMeta({ priorities: d.priorities || [], statuses: d.statuses || [], types: d.types || [] }); fresh = { versions: d.versions || [], priorities: d.priorities || [], statuses: d.statuses || [], types: d.types || [] }; }
      } catch (_) {}
      try {
        const r2 = await fetch("/api/dashboard/openproject/available-assignees?projectId=7");
        const d2 = await r2.json();
        if (!dead && d2.ok) { setOpPeople(d2.assignees || []); fresh.people = d2.assignees || []; }
      } catch (_) {}
      if (!dead && (fresh.statuses || fresh.versions)) { try { await saveRoadmapIDB(fresh, "roadmap_op_meta_v1"); } catch (_) {} }
      opMetaLoaded.current = true;
    })();
    return () => { dead = true; };
  }, []);
  // load/persist OP-row edit overlay
  React.useEffect(() => { (async () => { const v = await loadRoadmapIDB("roadmap_op_edits_v1"); if (v && typeof v === "object") setOpEdits(v); opEditsLoaded.current = true; })(); }, []);
  React.useEffect(() => { if (opEditsLoaded.current) saveRoadmapIDB(opEdits, "roadmap_op_edits_v1"); }, [opEdits]);
  const setOpEdit = (wpId, field, val) => setOpEdits((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), [field]: val } }));
  // Month View OP rows = cache filtered by the Q's linked version(s). Source = opCache (OP = source of truth), no per-version fetch.
  const mvLink = monthView ? qLink[monthView.qLabel] : null;
  const mvVerIds = qlVerIds(mvLink);
  const mvOp = React.useMemo(() => {
    if (!mvLink || mvVerIds.length === 0) return { verId: null, loading: opCache.loading, rows: [] };
    const verSet = new Set(mvVerIds.map(String));
    const rows = (opCache.rows || []).filter((wp) => verSet.has(String(wp.versionId)));
    return { verId: mvVerIds.join(","), loading: opCache.loading, rows };
  }, [mvVerIds.join(","), opCache.rows, opCache.loading]);
  const addQuarter = React.useCallback(() => {
    setQuarters((prev) => {
      const used = prev.map((q) => q.dot);
      return [...prev, nextQuarter(prev[prev.length - 1], used)];
    });
  }, []);
  // register addQuarter into the nav-row bridge for the lifetime of this page
  React.useEffect(() => { roadmapAddQ.fn = addQuarter; return () => { roadmapAddQ.fn = null; }; }, [addQuarter]);
  const prio = { P0: "#ef4444", P1: "#f59e0b", P2: "#a78bfa", P3: "#475569" };
  // status vocab mapped to new set: Active→now, In Progress→next, New→backlog (+ hold/blocked selectable)
  const stat = { now: "#f59e0b", next: "#3b82f6", backlog: "#475569", hold: "#a78bfa", blocked: "#ef4444", done: "#22c55e" };
  // ponytail: DEV_WEEKS/QA_WEEKS duplicated from RoadmapView — detail panel needs them in scope
  const DEV_WEEKS = { L: 2, M: 4, H: 8 };
  const QA_WEEKS = { L: 1, M: 2, H: 3 };
  const PRIO_OPTS = ["P0", "P1", "P2", "P3"];
  const STAT_OPTS = ["now", "next", "backlog", "hold", "blocked"];
  const EIM_OPTS = ["H", "M", "L"];
  const eim = { H: "#ef4444", M: "#f59e0b", L: "#22c55e" };
  // OP ↔ roadmap mapping (v2, user-defined). NOTE: differs from v1's RM_PRIO_FROM_OP — keep separate, don't reuse.
  // prio: urgent→P0, high→P1, med/normal→P2, low→P3. status: new→next, closed→done, everything else→now (in progress).
  const opPrioToRm = (name) => ({ urgent: "P0", high: "P1", medium: "P2", normal: "P2", low: "P3" })[String(name || "").trim().toLowerCase()] || "P2";
  // ── OP status → roadmap bucket (NOW / NEXT / BACKLOG / DONE). User rule: "On hold" always → BACKLOG. ──
  // Reusable for Month View + All View OP grouping. Unknown/non-active statuses fall through to BACKLOG.
  const OP_STATUS_BUCKET = {
    "in progress": "now", "in testing": "now", "developed": "now", "waiting merge request": "now",
    "tested": "now", "test failed": "now",
    "new": "next", "specified": "next", "in specification": "next", "confirmed": "next",
    "on hold": "backlog",
    "closed": "done", "rejected": "done",
  };
  const opStatusBucket = (name) => OP_STATUS_BUCKET[String(name || "").trim().toLowerCase()] || "backlog";
  // group a list of WP into ordered buckets [key,label,color,rows]. order = NOW, NEXT, BACKLOG, DONE.
  const OP_BUCKET_META = [["now", "NOW", "#f59e0b"], ["next", "NEXT", "#3b82f6"], ["backlog", "BACKLOG", "#475569"], ["done", "DONE", "#22c55e"]];
  // resolve a WP's section bucket: locally-edited status overlay (opEdits) wins over OP statusName.
  // overlay values: now/next/backlog/done/hold/blocked — hold & blocked collapse into backlog.
  const opBucketOf = (wp) => {
    const ov = opEdits[wp.id] || {};
    if (ov.status != null) return (ov.status === "hold" || ov.status === "blocked") ? "backlog" : (["now","next","backlog","done"].includes(ov.status) ? ov.status : opStatusBucket(wp.statusName));
    return opStatusBucket(wp.statusName);
  };
  const groupOpByStatus = (rows) => {
    const b = { now: [], next: [], backlog: [], done: [] };
    (rows || []).forEach((wp) => { (b[opBucketOf(wp)] || b.backlog).push(wp); });
    return OP_BUCKET_META.map(([k, label, color]) => [k, label, color, b[k]]).filter(([, , , r]) => r.length > 0);
  };
  // OP timeline = WHEN worked (which week), from the work package's start/due dates intersected with the viewed month.
  // roadmap fiscal year starts Oct (monthAbs 0 = Oct of the first quarter's year). returns [w1,w4] 1-based, or null if no date in this month.
  const Q0_YEAR = parseInt(String((QUARTERS[0] && QUARTERS[0].label) || "").match(/\d{4}/) || ["2026"], 10) || 2026;
  // ── Real calendar weeks of a month (US: week starts Sunday). ──
  // Returns segments [{s,e,sISO,eISO}] where s/e are day-of-month ints and *ISO are full dates,
  // each segment = one calendar week clipped to this month. A month yields 4–6 segments (real, not fixed /7).
  const monthWeeks = (monthAbsIdx) => {
    const realMonth = (9 + monthAbsIdx) % 12, realYear = Q0_YEAR + Math.floor((9 + monthAbsIdx) / 12);
    const last = new Date(realYear, realMonth + 1, 0).getDate();
    const iso = (day) => realYear + "-" + String(realMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
    const segs = [];
    let d = 1;
    while (d <= last) {
      const dow = new Date(realYear, realMonth, d).getDay(); // 0=Sun..6=Sat
      const end = Math.min(d + (6 - dow), last); // clip this calendar week (Sun→Sat) to month end
      segs.push({ s: d, e: end, sISO: iso(d), eISO: iso(end) });
      d = end + 1;
    }
    return segs;
  };
  // which real-week index (1-based) a given day-of-month falls into, per monthWeeks segmentation.
  const weekIdxOfDay = (monthAbsIdx, day) => {
    const segs = monthWeeks(monthAbsIdx);
    for (let i = 0; i < segs.length; i++) if (day >= segs[i].s && day <= segs[i].e) return i + 1;
    return null;
  };
  const opWeeksForMonth = (wp, monthAbsIdx) => {
    const realMonth = (9 + monthAbsIdx) % 12, realYear = Q0_YEAR + Math.floor((9 + monthAbsIdx) / 12);
    const wkOf = (iso) => { const d = new Date(iso); if (isNaN(d) || d.getMonth() !== realMonth || d.getFullYear() !== realYear) return null; return weekIdxOfDay(monthAbsIdx, d.getDate()); };
    const s = wp.startDate ? wkOf(wp.startDate) : null, e = wp.dueDate ? wkOf(wp.dueDate) : null;
    if (s == null && e == null) return null;
    return [s || e, e || s].sort((a, b) => a - b);
  };
  // OP row quarter-timeline span (0..11, Okt=0) from startDate/dueDate. null = no dates → empty bar.
  const opSpanFromDates = (wp) => {
    const toIdx = (iso) => { const d = new Date(iso); if (isNaN(d)) return null; const m = d.getMonth(), y = d.getFullYear(); return ((m - 9 + 12) % 12) + (y - Q0_YEAR) * 12; };
    const s = wp.startDate ? toIdx(wp.startDate) : null, e = wp.dueDate ? toIdx(wp.dueDate) : null;
    if (s == null && e == null) return null;
    const a = s != null ? s : e, b = e != null ? e : s;
    return [Math.min(a, b), Math.max(a, b)];
  };
  // read-only quarter bar (OP rows have no drag-to-edit timeline — dates come from OP, not manual fill).
  const barQuarterRO = (qIdx, span) => (
    <div key={qIdx} style={{ width: 152, flexShrink: 0, display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
      {[0, 1, 2].map((mi) => {
        const m = qIdx * 3 + mi;
        const on = span && m >= span[0] && m <= span[1];
        return (
          <div key={mi} title={span ? "Rentang dari tanggal OP" : "Tak ada tanggal OP"} style={{ width: 45, flexShrink: 0, height: 22, padding: "6px 0", display: "flex" }}>
            <div style={{ flex: "1 1 0", height: 10, background: on ? "#f59e0b50" : "#1e293b", borderRadius: 5 }} />
          </div>
        );
      })}
    </div>
  );
  const opRowView = (wp) => {
    const o = opEdits[wp.id] || {};
    return {
      subject: o.subject != null ? o.subject : (wp.subject || ""),
      desc: o.desc != null ? o.desc : String(wp.description || ""), // OP desc (full, no cap)
      prio: o.prio != null ? o.prio : opPrioToRm(wp.priorityName),
      status: o.status != null ? o.status : opStatusBucket(wp.statusName),
      impact: o.impact || "", effort: o.effort || "", testing: o.testing || "",
      dependency: o.dependency || "", // CSV of names/ids, user-entered
      assigneeId: o.assigneeId != null ? o.assigneeId : (wp.assigneeId || null),
      qa: Array.isArray(o.qa) ? o.qa : [], // QA assignee ids (multiple) — no native OP field, lives in desc meta
      responsibleId: o.responsibleId != null ? o.responsibleId : null,
      // real OP status name (editable overlay via opStatus). distinct from `status` (NOW/NEXT bucket).
      opStatus: o.opStatus != null ? o.opStatus : (wp.statusName || ""),
      // timeline dates — editable overlay, drag on the bar writes these; push sends them to OP.
      startDate: o.startDate !== undefined ? o.startDate : (wp.startDate || null),
      dueDate: o.dueDate !== undefined ? o.dueDate : (wp.dueDate || null),
    };
  };
  // ponytail: OP rows sort by prio only — no grouping by status, no metric tiebreak
  const opSortRows = (rows) => {
    const PR = { P0: 0, P1: 1, P2: 2, P3: 3 };
    const key = (wp) => { const v = opRowView(wp); return PR[v.prio] != null ? PR[v.prio] : 3; };
    return [...rows].sort((a, b) => key(a) - key(b));
  };
  // ── Milestone intake: create ONE Milestone WP in OP (typeId=2), stash supporting docs LOCALLY, then refetch cache. ──
  // Flow (OQ3): form submit → POST OP create → save docs to IDB keyed by new opId → refreshOpCache → milestone appears from cache.
  const RM_PRIO_TO_OP_ID = (p) => opIdByName(opMeta.priorities, RM_PRIO_TO_OP_NAME[p]);
  // OP type id resolved dynamically from project meta by name (schema-proof). project 7: Epic=5, Feature=4, etc. Fallbacks match current schema.
  const opTypeId = (name) => {
    const hit = (opMeta.types || []).find((t) => String(t.name || "").trim().toLowerCase() === String(name || "").trim().toLowerCase());
    if (hit) return hit.id;
    return ({ task: 1, milestone: 2, "summary task": 3, feature: 4, epic: 5, "user story": 6, bug: 7 })[String(name || "").trim().toLowerCase()] || null;
  };
  const createMilestone = async () => {
    const title = msForm.title.trim();
    if (!title) return;
    setMsState({ saving: true, error: '' });
    try {
      const body = { subject: title, projectId: 7, typeId: opTypeId(msForm.typeName || "Milestone"), description: msForm.desc || '' };
      const pid = RM_PRIO_TO_OP_ID(msForm.prio); if (pid) body.priorityId = pid;
      const r = await fetch('/api/dashboard/openproject/work-package', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || 'create gagal');
      const newId = d.workPackage && d.workPackage.id;
      // supporting docs → LOCAL only (IDB roadmap_ms_docs_v1), keyed by OP id. Also keep area (OP has no native field for it).
      if (newId && (msForm.docs.length || msForm.area)) {
        try {
          const store = (await loadRoadmapIDB('roadmap_ms_docs_v1')) || {};
          store[newId] = { area: msForm.area || '', docs: msForm.docs, createdAt: Date.now() };
          await saveRoadmapIDB(store, 'roadmap_ms_docs_v1');
          setMsDocs(store);
        } catch (_) {}
      }
      await refreshOpCache(); // OQ3: refetch so the new milestone shows from cache immediately
      setMsState({ saving: false, error: '' });
      setMsForm(MS_FORM_INIT); setMsDocDraft({ label: '', ref: '', note: '' });
      setAddModal(null);
      return newId;
    } catch (e) {
      setMsState({ saving: false, error: String(e.message || e) });
      return null;
    }
  };
  const addMsDoc = () => {
    const ref = msDocDraft.ref.trim(), label = msDocDraft.label.trim();
    if (!ref && !label) return;
    setMsForm((f) => ({ ...f, docs: [...f.docs, { label: label || ref, ref, note: msDocDraft.note.trim() }] }));
    setMsDocDraft({ label: '', ref: '', note: '' });
  };
  const removeMsDoc = (i) => setMsForm((f) => ({ ...f, docs: f.docs.filter((_, j) => j !== i) }));
  // Fase 5: create Feature WP children under a milestone. Each → POST typeId=3 + parentId=milestone opId. Milestone MUST have an opId.
  const createFeatureChildren = async () => {
    if (!bdTarget) return;
    const parentId = Number(bdTarget.opId || bdTarget.id);
    if (!parentId) { setBdState({ saving: false, error: 'Milestone belum punya OP id — push milestone dulu.', done: 0 }); return; }
    const titles = bdFeatures.map((f) => f.title.trim()).filter(Boolean);
    if (!titles.length) { setBdState({ saving: false, error: 'Isi minimal 1 judul feature.', done: 0 }); return; }
    setBdState({ saving: true, error: '', done: 0 });
    let done = 0;
    try {
      for (const title of titles) {
        const r = await fetch('/api/dashboard/openproject/work-package', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject: title, projectId: 7, typeId: opTypeId("Feature"), parentId }),
        });
        const d = await r.json();
        if (!d.ok) throw new Error(d.error || ('gagal di "' + title + '"'));
        done += 1; setBdState({ saving: true, error: '', done });
      }
      await refreshOpCache(); // children appear from cache
      setBdState({ saving: false, error: '', done });
      setBdTarget(null);
    } catch (e) {
      setBdState({ saving: false, error: String(e.message || e) + ' (' + done + '/' + titles.length + ' terbuat)', done });
      await refreshOpCache();
    }
  };
  // detail-panel doc edit (any WP, keyed by opId). persists to IDB roadmap_ms_docs_v1. LOCAL only.
  const saveWpDocs = async (opId, nextDocs) => {
    setMsDocs((prev) => {
      const cur = prev[opId] || { area: '', docs: [], createdAt: Date.now() };
      const next = { ...prev, [opId]: { ...cur, docs: nextDocs } };
      saveRoadmapIDB(next, 'roadmap_ms_docs_v1');
      return next;
    });
  };
  // ── End Add Task helpers ──
  // roadmap→OP id lookups for push
  const RM_PRIO_TO_OP_NAME = { P0: "urgent", P1: "high", P2: "normal", P3: "low" };
  const RM_STATUS_TO_OP_NAME = { next: "new", done: "closed", now: "in progress", backlog: "new", hold: "on hold", blocked: "rejected" };
  const opIdByName = (list, name) => { const hit = (list || []).find((x) => String(x.name || "").trim().toLowerCase() === String(name || "").toLowerCase()); return hit ? hit.id : null; };
  const personName = (pid) => { const p = opPeople.find((x) => String(x.id) === String(pid)); return p ? p.name : (pid || ""); };
  const [opPushState, setOpPushState] = React.useState({}); // {wpId: 'saving'|'ok'|error string}
  // push OP-row local edits back to OpenProject. dependency+metric+QA go into a managed block at the TOP of the description.
  const pushOpToOP = async (wp) => {
    const v = opRowView(wp);
    const metaLines = [];
    if (v.dependency) metaLines.push("Dependency: " + v.dependency);
    if (v.impact || v.effort || v.testing) metaLines.push("Impact/Effort/Testing: " + [v.impact || "-", v.effort || "-", v.testing || "-"].join(" / "));
    // strip any previous managed block, then prepend the fresh one
    const MARK_A = "<!-- ROADMAP-META:START -->", MARK_B = "<!-- ROADMAP-META:END -->";
    let baseDesc = v.desc.replace(new RegExp(MARK_A + "[\\s\\S]*?" + MARK_B + "\\n?", "g"), "").trimStart();
    const newDesc = metaLines.length ? (MARK_A + "\n" + metaLines.join("\n") + "\n" + MARK_B + "\n\n" + baseDesc) : baseDesc;
    const payload = { subject: v.subject, description: newDesc }; // full desc, no cap
    const pid = opIdByName(opMeta.priorities, RM_PRIO_TO_OP_NAME[v.prio]); if (pid) payload.priorityId = pid;
    // status: push the real OP status name (v.opStatus) by exact id match — authoritative, not the NOW/NEXT bucket.
    const sid = opIdByName(opMeta.statuses, v.opStatus); if (sid) payload.statusId = sid;
    if (v.assigneeId) payload.assigneeId = v.assigneeId;
    if (v.responsibleId) payload.responsibleId = v.responsibleId;
    payload.qaAssigneeIds = (v.qa || []).map((x) => Number(x)).filter(Boolean); // native OP customField3 (multi-user)
    // timeline dates: only send when the user actually edited them (overlay present), to avoid needless date writes.
    const oEdit = opEdits[wp.id] || {};
    if (oEdit.startDate !== undefined) payload.startDate = oEdit.startDate || "";
    if (oEdit.dueDate !== undefined) payload.dueDate = oEdit.dueDate || "";
    setOpPushState((p) => ({ ...p, [wp.id]: "saving" }));
    try {
      const r = await fetch("/api/dashboard/openproject/work-package/" + encodeURIComponent(wp.id), {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "push gagal");
      setOpPushState((p) => ({ ...p, [wp.id]: "ok" }));
    } catch (e) { setOpPushState((p) => ({ ...p, [wp.id]: String(e.message || e) })); }
  };
  // ── OP relations (real dependency / manual relation / breakdown linkage) ──
  // opRels[wpId] = { loading, error, list:[{id,type,toId,toName,fromId,fromName}] }
  const [opRels, setOpRels] = React.useState({});
  const [relDraft, setRelDraft] = React.useState({ toId: "", type: "relates", q: "", picked: null });
  // local title/id search over opCache (1537 WP already cached — no extra fetch)
  const relMatches = React.useMemo(() => {
    const q = (relDraft.q || "").trim().toLowerCase();
    if (!q) return [];
    const rows = opCache.rows || [];
    const byId = /^\d+$/.test(q);
    const out = [];
    for (const w of rows) {
      const idStr = String(w.id);
      const hit = byId ? idStr.includes(q) : (w.subject || "").toLowerCase().includes(q);
      if (hit) { out.push(w); if (out.length >= 12) break; }
    }
    return out;
  }, [relDraft.q, opCache.rows]);
  const REL_TYPE_OPTS = [
    ["relates", "relates to"],
    ["follows", "follows (depends on)"],
    ["precedes", "precedes (blocked by this)"],
    ["blocks", "blocks"],
    ["requires", "requires"],
  ];
  const loadRels = async (wpId) => {
    setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), loading: true, error: "" } }));
    try {
      const r = await fetch("/api/dashboard/openproject/work-package/" + encodeURIComponent(wpId) + "/relations");
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "gagal load relasi");
      setOpRels((p) => ({ ...p, [wpId]: { loading: false, error: "", list: d.relations || [] } }));
    } catch (e) { setOpRels((p) => ({ ...p, [wpId]: { loading: false, error: String(e.message || e), list: [] } })); }
  };
  const addRel = async (wpId, toId, type) => {
    const tid = parseInt(String(toId).replace(/[^0-9]/g, ""), 10);
    if (!tid) { setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), error: "Isi OP id tujuan." } })); return; }
    setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), loading: true, error: "" } }));
    try {
      const r = await fetch("/api/dashboard/openproject/work-package/" + encodeURIComponent(wpId) + "/relations", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ toId: tid, type }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "gagal buat relasi");
      setRelDraft({ toId: "", type, q: "", picked: null });
      await loadRels(wpId);
    } catch (e) { setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), loading: false, error: String(e.message || e) } })); }
  };
  const removeRel = async (wpId, relId) => {
    setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), loading: true, error: "" } }));
    try {
      const r = await fetch("/api/dashboard/openproject/relation/" + encodeURIComponent(relId), { method: "DELETE" });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "gagal hapus relasi");
      await loadRels(wpId);
    } catch (e) { setOpRels((p) => ({ ...p, [wpId]: { ...(p[wpId] || {}), loading: false, error: String(e.message || e) } })); }
  };
  const AV = { DC: "#3b82f6", NY: "#a78bfa", AG: "#22c55e", RS: "#06b6d4" };
  const FULL = { DC: "Dany Christian", NY: "Naftal Yunior", AG: "Agung D", RS: "Rizky S" };
  const ROLE = { DC: "Assignee", NY: "QA Assignee", AG: "Accountable", RS: "Reviewer" };
  // roadmap member list for MemberSelect (initials-keyed; fixed color/initials from AV/FULL)
  const ROLE_PEOPLE = Object.keys(FULL).map((k) => ({ id: k, name: FULL[k], color: AV[k], ini: k }));
  const [expanded, setExpanded] = React.useState({});
  const [rmq, setRmq] = React.useState("");
  // assignees keyed by task name (IDB roadmap_assignees_v1) — RoadmapView task model has no assignee field,
  // so RoadmapPage owns them here. ponytail: name-keyed because row # is rebuilt per load (not stable).
  const [assignMap, setAssignMap] = React.useState({});
  React.useEffect(() => {
    loadRoadmapIDB("roadmap_assignees_v1").then((m) => { if (m && typeof m === "object") setAssignMap(m); }).catch(() => {});
  }, []);
  const saveAssignees = (taskName, list) => setAssignMap((m) => {
    const next = { ...m, [taskName]: list };
    saveRoadmapIDB(next, "roadmap_assignees_v1");
    return next;
  });
  const [roleTask, setRoleTask] = React.useState(null); // row # whose Manage Roles popup is open
  const [opAssign, setOpAssign] = React.useState(null); // { wpId } whose OP assignee popup is open (PIC/QA/Accountable)
  const [tip, setTip] = React.useState(null); // { x, y, a }
  const toggle = (rowId) => setExpanded((e) => ({ ...e, [rowId]: !e[rowId] }));
  const bdClick = (rowId, taskObj) => { setExpanded((e) => e[rowId] ? e : { ...e, [rowId]: true }); setBdTarget(taskObj); };
  const DESC = {
    Impact: { H: "High — critical path", M: "Medium — valued, parallelizable", L: "Low — nice to have" },
    Effort: { H: "High — 3+ sprint points", M: "Medium — 1-2 sprints", L: "Low — under a sprint" },
    Testing: { H: "High — E2E + integration", M: "Medium — unit + smoke", L: "Low — spot check" },
  };
  const COLW = { num: 28, task: 260, area: 100, prio: 50, status: 90, eim: 50, assignee: 90 };
  const txt = (w, color, size, bold, extra) => ({ width: w, flexShrink: 0, color, fontSize: size, fontWeight: bold ? 700 : 400, textAlign: "left", ...(extra || {}) });
  // flatten role list → ordered [{ini,color,name}] for the avatar column.
  // roadmap slots: [assigneeIni, [qaIni...], accountableIni] (initials keyed to AV/FULL).
  const flatAssignees = (list) => (Array.isArray(list) ? list : [])
    .flatMap((slot) => Array.isArray(slot) ? slot : (slot ? [slot] : []))
    .filter(Boolean)
    .map((a) => (typeof a === "object" ? a : { ini: a, color: AV[a], name: FULL[a] || a }));
  // avatars: w22 rounded-11 bg color+30 text color; multiple overlap -6 + ring outline; +N overflow chip (img-4)
  // list = role slots (strings or nested arrays) OR flat [{ini,color,name}]. onOpen overrides the Manage-Roles click (OP uses its own popup).
  const avatars = (rowId, taskName, list, onOpen) => {
    const CAP = 3;
    const flat = flatAssignees(list);
    const shown = flat.slice(0, CAP);
    const extra = flat.length - shown.length;
    return (
      <div style={{ width: COLW.assignee, flexShrink: 0, minHeight: 22, display: "flex", alignItems: "center", cursor: "pointer" }}
        onClick={(e) => { e.stopPropagation(); onOpen ? onOpen() : setRoleTask({ id: rowId, task: taskName, list }); }}>
        {shown.length === 0 && (
          <span style={{ fontSize: 10, color: "#475569", border: "1px dashed #334155", borderRadius: 11, padding: "2px 8px" }}>+ assign</span>
        )}
        {shown.map((a, i) => (
          <div key={i}
            onMouseEnter={(e) => { const r = e.currentTarget.getBoundingClientRect(); setTip({ x: r.left, y: r.bottom + 4, a: a.ini, name: a.name }); }}
            onMouseLeave={() => setTip(null)}
            style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: (a.color || "#475569") + "30", borderRadius: 11, marginLeft: i === 0 ? 0 : -6, outline: i === 0 ? "none" : "2px solid #0f172a", outlineOffset: -1, zIndex: 10 - i }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: a.color || "#94a3b8" }}>{a.ini}</span>
          </div>
        ))}
        {extra > 0 && (
          <div style={{ width: 22, height: 22, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "#334155", borderRadius: 11, marginLeft: -6, outline: "2px solid #0f172a", outlineOffset: -1, zIndex: 1 }}>
            <span style={{ fontSize: 9, fontWeight: 700, color: "#cbd5e1" }}>+{extra}</span>
          </div>
        )}
      </div>
    );
  };
  // InlineEdit: display value; double-click → input/textarea; Enter saves, Esc/blur cancels (textarea: Enter saves, Shift+Enter newline).
  const InlineEdit = ({ value, onSave, multiline, placeholder, style, viewMaxHeight }) => {
    const [editing, setEditing] = React.useState(false);
    const [val, setVal] = React.useState(value);
    const taRef = React.useRef(null);
    const resizingRef = React.useRef(false); // true while user drags the resize handle → suppress blur-commit
    React.useEffect(() => { if (!editing) setVal(value); }, [value, editing]);
    // on entering edit: size the textarea to its content so height doesn't jump vs the display span.
    React.useEffect(() => {
      if (editing && multiline && taRef.current) {
        const ta = taRef.current;
        ta.style.height = "auto";
        ta.style.height = Math.max(ta.scrollHeight, 48) + "px";
      }
    }, [editing, multiline]);
    const commit = () => { setEditing(false); if (val !== value) onSave(val); };
    const common = {
      autoFocus: true, value: val, onChange: (e) => setVal(e.target.value),
      onClick: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(),
      style: { width: "100%", boxSizing: "border-box", background: "#0f172a", border: "1px solid #3b82f6", borderRadius: 4, color: "#e5e7eb", fontSize: 12, fontFamily: "inherit", padding: "4px 6px", outline: "none", ...(style || {}) },
    };
    if (editing) return multiline
      ? <textarea {...common} ref={taRef}
          style={{ ...common.style, resize: "vertical", minHeight: 48, overflow: "auto" }}
          onMouseDown={(e) => { e.stopPropagation(); resizingRef.current = true; }}
          onMouseUp={() => { resizingRef.current = false; }}
          onBlur={() => { if (!resizingRef.current) commit(); }}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commit(); } if (e.key === "Escape") setEditing(false); }} />
      : <input {...common} onBlur={() => setEditing(false)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } if (e.key === "Escape") setEditing(false); }} />;
    // Display mode. For multiline (description) render the markdown to HTML (tables, lists, code)
    // using the CDN `marked` global — same renderer the workspace viewer uses. Edit mode stays raw.
    if (multiline) {
      let html = "";
      try { html = (window.marked ? window.marked.parse(String(value || "")) : String(value || "")); } catch (e) { html = String(value || ""); }
      const hasVal = String(value || "").trim().length > 0;
      return (
        <div onDoubleClick={() => setEditing(true)}
          onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} onWheel={(e) => e.stopPropagation()}
          title="Double-click untuk edit, Enter untuk simpan"
          className="rm-md"
          style={{ cursor: "text", ...(viewMaxHeight ? { maxHeight: viewMaxHeight, overflowY: "auto" } : {}), ...(style || {}) }}>
          {hasVal
            ? <div dangerouslySetInnerHTML={{ __html: html }} />
            : <span style={{ color: "#475569" }}>{placeholder || "—"}</span>}
        </div>
      );
    }
    return (
      <span onDoubleClick={() => setEditing(true)} title="Double-click untuk edit, Enter untuk simpan"
        style={{ cursor: "text", borderBottom: "1px dashed #334155", wordBreak: "break-word", ...(style || {}) }}>
        {value || <span style={{ color: "#475569" }}>{placeholder || "—"}</span>}
      </span>
    );
  };
  // avatar color from name (stable hash) + initials. used by MemberSelect for OP people (no preassigned color).
  const AV_COLORS = ["#3b82f6", "#a78bfa", "#22c55e", "#06b6d4", "#f59e0b", "#ef4444", "#ec4899", "#14b8a6"];
  const iniOf = (name) => String(name || "").trim().split(/\s+/).slice(0, 2).map((w) => w[0] || "").join("").toUpperCase() || "?";
  const colorOf = (key) => { const s = String(key || ""); let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return AV_COLORS[h % AV_COLORS.length]; };
  const Avatar = ({ name, size, color, label }) => { const sz = size || 22; const c = color || colorOf(name); return (<span style={{ width: sz, height: sz, flexShrink: 0, display: "inline-flex", alignItems: "center", justifyContent: "center", background: c + "30", borderRadius: sz / 2, fontSize: sz * 0.4, fontWeight: 700, color: c }}>{label || iniOf(name)}</span>); };
  // MemberSelect: searchable avatar dropdown (img-1). mode 'single' → value is id|null; mode 'multi' → value is id[].
  // people = [{id,name}]. derives avatar color/initials from name. single: –none– + highlight+✓; multi: checkboxes + select-all + counter + chips.
  const MemberSelect = ({ mode, value, people, onChange, placeholder }) => {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [open]);
    const byId = Object.fromEntries((people || []).map((p) => [String(p.id), p]));
    const sel = mode === "multi" ? (Array.isArray(value) ? value.map(String) : []) : (value != null && value !== "" ? [String(value)] : []);
    const filtered = (people || []).filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase()));
    const rowStyle = { display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12, color: "#e5e7eb" };
    const chevron = <span style={{ marginLeft: "auto", color: "#64748b", fontSize: 10 }}>▾</span>;
    const pickSingle = (id) => { onChange(id); setOpen(false); };
    // keep ids in their native type (OP=number, roadmap=string initials) — map String keys back through byId.
    const toggleMulti = (id) => { const s = new Set(sel); s.has(String(id)) ? s.delete(String(id)) : s.add(String(id)); onChange(Array.from(s).map((k) => byId[k] ? byId[k].id : k)); };
    return (
      <div ref={ref} style={{ position: "relative", minWidth: 180 }} onClick={(e) => e.stopPropagation()}>
        {/* trigger */}
        <div onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", minHeight: 34, background: "#0f172a", border: "1px solid #263244", borderRadius: 8, padding: "4px 8px", cursor: "pointer" }}>
          {sel.length === 0 && <span style={{ fontSize: 12, color: "#475569" }}>{placeholder || "Pilih member…"}</span>}
          {mode === "single" && sel.length > 0 && byId[sel[0]] && (<><Avatar name={byId[sel[0]].name} color={byId[sel[0]].color} label={byId[sel[0]].ini} size={20} /><span style={{ fontSize: 12, color: "#e5e7eb" }}>{byId[sel[0]].name}</span></>)}
          {mode === "multi" && sel.map((id) => byId[id] && (
            <span key={id} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#1e293b", border: "1px solid #334155", borderRadius: 999, padding: "2px 6px 2px 2px" }}>
              <Avatar name={byId[id].name} color={byId[id].color} label={byId[id].ini} size={18} /><span style={{ fontSize: 11, color: "#cbd5e1" }}>{byId[id].name}</span>
              <span onClick={(e) => { e.stopPropagation(); toggleMulti(id); }} style={{ cursor: "pointer", color: "#64748b", fontSize: 12, padding: "0 2px" }}>✕</span>
            </span>
          ))}
          {chevron}
        </div>
        {/* dropdown */}
        {open && (
          <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, zIndex: 50, width: 260, background: "#111827", border: "1px solid #263244", borderRadius: 10, boxShadow: "0 10px 30px rgba(0,0,0,0.5)", overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 10px", borderBottom: "1px solid #1e293b" }}>
              <span style={{ color: "#64748b", fontSize: 12 }}>⌕</span>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari member…" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#e5e7eb", fontSize: 12 }} />
            </div>
            <div style={{ maxHeight: 220, overflowY: "auto" }}>
              {mode === "single" && (
                <div onClick={() => pickSingle(null)} style={{ ...rowStyle, color: "#94a3b8" }}><span style={{ width: 20, textAlign: "center" }}>–</span> none</div>
              )}
              {mode === "multi" && filtered.length > 0 && (
                <div onClick={() => onChange(sel.length === people.length ? [] : people.map((p) => p.id))} style={{ ...rowStyle, borderBottom: "1px solid #1e293b" }}>
                  <span style={{ width: 16, height: 16, border: "1px solid #475569", borderRadius: 3, background: sel.length === people.length ? "#3b82f6" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{sel.length === people.length ? "✓" : ""}</span>
                  Select all <span style={{ marginLeft: "auto", fontSize: 11, color: "#64748b" }}>{sel.length} / {people.length}</span>
                </div>
              )}
              {filtered.length === 0 && <div style={{ padding: "10px", fontSize: 12, color: "#64748b" }}>Tak ada member.</div>}
              {filtered.map((p) => {
                const on = sel.includes(String(p.id));
                return (
                  <div key={p.id} onClick={() => mode === "multi" ? toggleMulti(p.id) : pickSingle(p.id)} style={{ ...rowStyle, background: (mode === "single" && on) ? "#3b82f622" : "transparent" }}>
                    {mode === "multi" && <span style={{ width: 16, height: 16, flexShrink: 0, border: "1px solid #475569", borderRadius: 3, background: on ? "#3b82f6" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#fff" }}>{on ? "✓" : ""}</span>}
                    <Avatar name={p.name} color={p.color} label={p.ini} size={20} /><span>{p.name}</span>
                    {mode === "single" && on && <span style={{ marginLeft: "auto", color: "#3b82f6" }}>✓</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  const suppressClick = React.useRef(false); // block the row click that fires after a drag/expand toggle
  // ── Timeline bar editing: click cells to set start/due, saved to opEdits (pushed on "Push ke OP"). ──
  // monthAbs (0=Oct of Q0_YEAR) → ISO. start=1st of month, end=last day of month.
  const monthAbsToISO = (idx, atEnd) => {
    const realMonth = (9 + idx) % 12, realYear = Q0_YEAR + Math.floor((9 + idx) / 12);
    const day = atEnd ? new Date(realYear, realMonth + 1, 0).getDate() : 1;
    return realYear + "-" + String(realMonth + 1).padStart(2, "0") + "-" + String(day).padStart(2, "0");
  };
  // week (1..4) within an absolute month → ISO. start = (w-1)*7+1, end = min(w*7, lastDay).
  const weekToISO = (monthAbsIdx, week, atEnd) => {
    const segs = monthWeeks(monthAbsIdx);
    const seg = segs[Math.min(week, segs.length) - 1] || segs[segs.length - 1];
    return atEnd ? seg.eISO : seg.sISO;
  };
  // ── Timeline bar DRAG state. mousedown on a cell = anchor; mouseenter while dragging = hover (live preview);
  // global mouseup = commit [anchor..hover] to start/due. A plain click (down+up same cell) sets a 1-cell range. ──
  const [barDrag, setBarDrag] = React.useState(null); // { wpId, kind:'q'|'w', monthAbs, anchor, hover }
  const barDragRef = React.useRef(null);
  React.useEffect(() => { barDragRef.current = barDrag; }, [barDrag]);
  React.useEffect(() => {
    const onUp = () => {
      const d = barDragRef.current;
      if (!d) return;
      if (d.kind === "q") setQuarterRange(d.wpId, d.anchor, d.hover);
      else setWeekRange(d.wpId, d.monthAbs, d.anchor, d.hover);
      suppressClick.current = true; // block the row onClick (expand/collapse) that fires right after the bar mouseup
      setBarDrag(null);
    };
    window.addEventListener("mouseup", onUp);
    return () => window.removeEventListener("mouseup", onUp);
  }, []);
  // commit a start/due range (indices a<=b) for a wp from the quarter bar.
  const setQuarterRange = (wpId, a, b) => {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    setOpEdit(wpId, "startDate", monthAbsToISO(lo, false));
    setOpEdit(wpId, "dueDate", monthAbsToISO(hi, true));
  };
  const setWeekRange = (wpId, monthAbsIdx, a, b) => {
    const lo = Math.min(a, b), hi = Math.max(a, b);
    setOpEdit(wpId, "startDate", weekToISO(monthAbsIdx, lo, false));
    setOpEdit(wpId, "dueDate", weekToISO(monthAbsIdx, hi, true));
  };
  // editable quarter bar (All View). span = current [lo,hi] month indices from opRowView dates. DRAG across cells to set range.
  const barQuarterEdit = (wp, qIdx) => {
    const v = opRowView(wp);
    const span = opSpanFromDates({ startDate: v.startDate, dueDate: v.dueDate });
    const drag = barDrag && barDrag.wpId === wp.id && barDrag.kind === "q" ? barDrag : null;
    const dragLo = drag ? Math.min(drag.anchor, drag.hover) : null, dragHi = drag ? Math.max(drag.anchor, drag.hover) : null;
    return (
      <div key={qIdx} style={{ width: 152, flexShrink: 0, display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
        {[0, 1, 2].map((mi) => {
          const m = qIdx * 3 + mi;
          const inDrag = drag && m >= dragLo && m <= dragHi;
          const on = !drag && span && m >= span[0] && m <= span[1];
          // concrete calendar range this month-cell covers (full month: day 1 → last day).
          const sISO = monthAbsToISO(m, false), eISO = monthAbsToISO(m, true);
          const realMo = (9 + m) % 12, realYr = Q0_YEAR + Math.floor((9 + m) / 12);
          const moName = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][realMo] + " " + realYr;
          const tip = moName + " (" + sISO.slice(8) + "–" + eISO.slice(8) + ") · drag untuk set rentang";
          return (
            <div key={mi} title={tip}
              onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setBarDrag({ wpId: wp.id, kind: "q", anchor: m, hover: m }); }}
              onMouseEnter={() => { if (barDragRef.current && barDragRef.current.wpId === wp.id && barDragRef.current.kind === "q") setBarDrag((d) => ({ ...d, hover: m })); }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: 45, flexShrink: 0, height: 22, padding: "6px 0", display: "flex", cursor: "ew-resize" }}>
              <div style={{ flex: "1 1 0", height: 10, background: inDrag ? "#3b82f6" : on ? "#f59e0b80" : "#1e293b", borderRadius: 5, transition: "background .1s" }} />
            </div>
          );
        })}
      </div>
    );
  };
  // shared OP-version link popup — rendered in BOTH month-view and all-view returns (fixed-positioned)
  const qPopupEl = qPopup && (() => {
    const cur = qLink[qPopup.label] || null;
    const q = QUARTERS.find((x) => x.label === qPopup.label);
    return (
      <>
        <div onClick={() => setQPopup(null)} style={{ position: "fixed", inset: 0, zIndex: 290 }} />
        <QLinkPopup
          x={qPopup.x} y={qPopup.y} qLabel={qPopup.label} months={q ? q.months : []}
          versions={opVersions} current={cur}
          onClose={() => setQPopup(null)}
          onUnlink={() => { setQLink((m) => { const n = { ...m }; delete n[qPopup.label]; return n; }); setQPopup(null); }}
          onLink={(payload) => { setQLink((m) => ({ ...m, [qPopup.label]: payload })); setQPopup(null); }}
        />
      </>
    );
  })();
  // shared assignee tooltip + Manage Roles popup — rendered in BOTH month-view and all-view returns
  const tipEl = tip && (
    <div style={{ position: "fixed", left: tip.x, top: tip.y, zIndex: 100, background: "#111827", border: "1px solid #263244", borderRadius: 6, padding: 8, fontSize: 11, color: "#e6eaf1", display: "flex", alignItems: "center", gap: 8, pointerEvents: "none" }}>
      <span style={{ width: 20, height: 20, display: "inline-flex", alignItems: "center", justifyContent: "center", background: (AV[tip.a] || "#475569") + "30", borderRadius: 10, fontSize: 9, fontWeight: 700, color: AV[tip.a] || "#94a3b8" }}>{tip.a}</span>
      <span>{tip.name || FULL[tip.a] || tip.a} / {ROLE[tip.a] || "Assignee"}</span>
    </div>
  );
  const roleTaskEl = roleTask && (
    <div onClick={() => setRoleTask(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#111827", border: "1px solid #263244", borderRadius: 8, padding: 16, minWidth: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e6eaf1" }}>Manage Roles</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>{roleTask.task}</div>
        </div>
        {[["Assignee", "PIC utama task ini", "single"], ["QA Assignee", "Tim QA yang mengerjakan", "multi"], ["Accountable", "Penanggung jawab akhir", "single"]].map(([role, hint, mode], slot) => {
          const a = (roleTask.list || [])[slot];
          const val = mode === "multi" ? (Array.isArray(a) ? a : (a ? [a] : [])) : (a || null);
          return (
          <div key={role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <div style={{ width: 120, flexShrink: 0 }}>
              <div style={{ fontSize: 12, color: "#e6eaf1", fontWeight: 600 }}>{role}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{hint}</div>
            </div>
            <div style={{ flex: 1 }}>
              <MemberSelect mode={mode} value={val} people={ROLE_PEOPLE}
                placeholder="Pilih member…"
                onChange={(id) => setRoleTask((rt) => { const list = [...(rt.list || [])]; list[slot] = mode === "multi" ? id : (id || ""); return { ...rt, list }; })} />
            </div>
          </div>
          );
        })}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
          <button onClick={() => setRoleTask(null)} style={{ cursor: "pointer", border: "1px solid #263244", background: "transparent", color: "#94a3b8", borderRadius: 6, padding: "6px 14px", fontSize: 12 }}>Cancel</button>
          <button onClick={() => { saveAssignees(roleTask.task, roleTask.list || []); setRoleTask(null); }} style={{ cursor: "pointer", border: "1px solid #3b82f6", background: "#3b82f622", color: "#3b82f6", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Save</button>
        </div>
      </div>
    </div>
  );
  // shared OP assignee popup — inline edit of PIC / QA / Accountable for an OP row (both views). Writes to opEdits overlay.
  const opAssignEl = opAssign && (() => {
    const wp = (opCache.rows || []).find((w) => w.id === opAssign.wpId);
    if (!wp) return null;
    const v = opRowView(wp);
    return (
      <div onClick={() => setOpAssign(null)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "#00000080", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#111827", border: "1px solid #263244", borderRadius: 8, padding: 16, minWidth: 360, display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#e6eaf1" }}>Assignee <span style={{ fontSize: 11, color: "#64748b", fontWeight: 400 }}>OP #{wp.id}</span></div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2, maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{v.subject || wp.typeName || ""}</div>
          </div>
          {opPeople.length === 0 && <div style={{ fontSize: 11, color: "#b45309" }}>⚠ Daftar assignee OP kosong (token OpenProject tak punya izin baca users).</div>}
          {[["Assignee", "PIC utama task ini", "single"], ["QA Assignee", "Tim QA yang mengerjakan", "multi"], ["Accountable", "Penanggung jawab akhir", "single"]].map(([role, hint, mode]) => {
            const field = role === "Assignee" ? "assigneeId" : role === "QA Assignee" ? "qa" : "responsibleId";
            const val = mode === "multi" ? (v.qa || []) : (field === "assigneeId" ? v.assigneeId : v.responsibleId);
            return (
              <div key={role} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ width: 120, flexShrink: 0 }}>
                  <div style={{ fontSize: 12, color: "#e6eaf1", fontWeight: 600 }}>{role}</div>
                  <div style={{ fontSize: 10, color: "#64748b", marginTop: 1 }}>{hint}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <MemberSelect mode={mode} value={val} people={opPeople} placeholder="Pilih member…"
                    onChange={(id) => { if (mode === "multi") setOpEdit(wp.id, "qa", id); else setOpEdit(wp.id, field, id ? Number(id) : null); }} />
                </div>
              </div>
            );
          })}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginTop: 4 }}>
            <button onClick={() => { pushOpToOP(wp); }} style={{ cursor: "pointer", border: "1px solid #f59e0b", background: "#f59e0b22", color: "#f59e0b", borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: 600 }}>Push ke OP</button>
            <button onClick={() => setOpAssign(null)} style={{ cursor: "pointer", border: "1px solid #263244", background: "transparent", color: "#94a3b8", borderRadius: 6, padding: "6px 14px", fontSize: 12 }}>Tutup</button>
          </div>
        </div>
      </div>
    );
  })();
  let rowCounter = 0;
  // rmPill: KPI pill, used by both all-view and month-view headers (defined here so the month-view early-return can reach it)
  const rmPill = (num, label, dot) => (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#111827", border: "1px solid #1e293b", borderRadius: 999, padding: "3px 10px", fontSize: 11, color: "#94a3b8", whiteSpace: "nowrap" }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      <b style={{ fontSize: 12, fontWeight: 700, color: "#e5e7eb" }}>{num}</b> {label}
    </span>
  );
  // shared Add Task Modal — rendered in BOTH month-view and all-view returns (fixed-positioned)
  const addTaskModalEl = addModal && (() => {
    const modalTitle = 'New Milestone';
    return (
      <div style={{position:'fixed',inset:0,zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={(e) => { if (e.target === e.currentTarget) setAddModal(null); }}>
        <div style={{background:'#121820',border:'1.5px solid #3B82F6',borderRadius:10,padding:'16px 18px',width:520,maxHeight:'80vh',display:'flex',flexDirection:'column',gap:10,boxShadow:'0 10px 40px rgba(0,0,0,.6)',overflow:'auto'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
            <span style={{color:'#E6EAF1',fontSize:15,fontWeight:700}}>{modalTitle}</span>
            <span onClick={() => setAddModal(null)} style={{cursor:'pointer',fontSize:18,color:'#64748b'}}>✕</span>
          </div>
          {addModal === 'milestone' && (
            <>
              <div style={{fontSize:10,color:'#64748b',lineHeight:1.4}}>1 request → 1 Milestone (dibuat sebagai <b style={{color:'#a78bfa'}}>Epic</b> di OpenProject, agar bisa punya breakdown Feature). Submit → create di OP, lalu roadmap di-refresh. Dokumen pendukung disimpan lokal (analisa awal) — tidak dikirim ke OP.</div>
              <input value={msForm.title} onChange={(e) => setMsForm(f => ({...f, title: e.target.value, checkResult:null}))} placeholder="Judul milestone / request…" style={{background:'#111827',color:'#e5e7eb',border:'1px solid #1e293b',borderRadius:5,padding:'6px 9px',fontSize:13,outline:'none',fontFamily:'inherit'}} />
              <textarea value={msForm.desc} onChange={(e) => setMsForm(f => ({...f, desc: e.target.value}))} placeholder="Deskripsi / konteks request…" rows={3} style={{background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:5,padding:'6px 9px',fontSize:11,outline:'none',resize:'vertical',fontFamily:'inherit'}} />
              <div style={{display:'flex',gap:8}}>
                <div style={{flex:1,display:'flex',flexDirection:'column',gap:3}}>
                  <span style={{fontSize:10,color:'#64748b'}}>Area</span>
                  <input value={msForm.area} onChange={(e) => setMsForm(f => ({...f, area: e.target.value}))} placeholder="Ticket / Broadcast / WA…" style={{background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'4px 7px',fontSize:11,outline:'none',fontFamily:'inherit'}} />
                </div>
                <div style={{width:120,display:'flex',flexDirection:'column',gap:3}}>
                  <span style={{fontSize:10,color:'#64748b'}}>Type (OP)</span>
                  <select value={msForm.typeName} onChange={(e) => setMsForm(f => ({...f, typeName: e.target.value}))} style={{background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'4px 7px',fontSize:11,outline:'none'}}>
                    {["Milestone","Epic","Feature","Task","User story","Bug"].map(tn => <option key={tn} value={tn}>{tn}</option>)}
                  </select>
                </div>
                <div style={{width:80,display:'flex',flexDirection:'column',gap:3}}>
                  <span style={{fontSize:10,color:'#64748b'}}>Priority</span>
                  <select value={msForm.prio} onChange={(e) => setMsForm(f => ({...f, prio: e.target.value}))} style={{background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'4px 7px',fontSize:11,outline:'none'}}>
                    {['P0','P1','P2','P3'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              {/* dokumen pendukung — LOCAL only */}
              <div style={{display:'flex',flexDirection:'column',gap:5,background:'#0f172a',border:'1px solid #1e293b',borderRadius:8,padding:10}}>
                <div style={{fontSize:11,fontWeight:700,color:'#f59e0b'}}>Dokumen Pendukung <span style={{fontWeight:400,color:'#64748b',fontSize:9}}>(lokal · analisa awal)</span></div>
                {msForm.docs.map((dc, i) => (
                  <div key={i} style={{display:'flex',alignItems:'center',gap:6,fontSize:10,color:'#cbd5e1',background:'#111827',borderRadius:4,padding:'4px 7px'}}>
                    <span style={{fontWeight:700,flexShrink:0}}>{dc.label}</span>
                    {dc.ref && <span style={{color:'#3b82f6',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{dc.ref}</span>}
                    {dc.note && <span style={{color:'#64748b',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>· {dc.note}</span>}
                    <span onClick={() => removeMsDoc(i)} style={{marginLeft:'auto',cursor:'pointer',color:'#ef4444',flexShrink:0}}>✕</span>
                  </div>
                ))}
                <div style={{display:'flex',gap:5}}>
                  <input value={msDocDraft.label} onChange={(e) => setMsDocDraft(d => ({...d, label: e.target.value}))} placeholder="Label" style={{width:90,background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'3px 6px',fontSize:10,outline:'none',fontFamily:'inherit'}} />
                  <input value={msDocDraft.ref} onChange={(e) => setMsDocDraft(d => ({...d, ref: e.target.value}))} placeholder="Link / path file" style={{flex:1,background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'3px 6px',fontSize:10,outline:'none',fontFamily:'inherit'}} />
                  <button type="button" onClick={addMsDoc} style={{background:'transparent',color:'#f59e0b',border:'1px solid #f59e0b',borderRadius:4,padding:'3px 10px',fontSize:10,fontWeight:700,cursor:'pointer'}}>+ Doc</button>
                </div>
                <input value={msDocDraft.note} onChange={(e) => setMsDocDraft(d => ({...d, note: e.target.value}))} placeholder="Catatan (opsional)" style={{background:'#111827',color:'#cbd5e1',border:'1px solid #1e293b',borderRadius:4,padding:'3px 6px',fontSize:10,outline:'none',fontFamily:'inherit'}} />
              </div>
              {msState.error && <div style={{fontSize:10,color:'#ef4444'}}>⚠ {msState.error}</div>}
              <div style={{display:'flex',gap:8,justifyContent:'flex-end',alignItems:'center'}}>
                <span style={{fontSize:9,color:'#64748b'}}>→ OpenProject (Milestone)</span>
                <button type="button" onClick={createMilestone} disabled={!msForm.title.trim() || msState.saving} style={{background:'#f59e0b',color:'#1c1917',border:'none',borderRadius:6,padding:'6px 18px',fontSize:11,fontWeight:700,cursor:'pointer',opacity:(!msForm.title.trim()||msState.saving)?0.5:1}}>{msState.saving ? 'Membuat…' : 'Create Milestone'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  })();
  // ── Month View: click a Q → table scoped to one month, timeline split W1-W4 (pen 'Month View') ──
  // OP detail panel as a component — reused by Month View (with opWk/monthLabel) and All View (plain).
  // Breakdown → Feature popup, shared across Month View + All View (fixed-position overlay).
  const bdTargetEl = bdTarget && (
    <div style={{position:'fixed',inset:0,zIndex:9000,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={(e) => { if (e.target === e.currentTarget) setBdTarget(null); }}>
      <div style={{background:'var(--elevated-bg,#121820)',border:'1.5px solid var(--accent-primary,#3B82F6)',borderRadius:10,padding:'16px 18px',width:420,display:'flex',flexDirection:'column',gap:10,boxShadow:'0 10px 40px rgba(0,0,0,.6)'}}>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{color:'var(--accent-warning,#F59E0B)',fontSize:18}}>⚡</span>
          <span style={{color:'var(--text-1,#E6EAF1)',fontSize:15,fontWeight:700}}>Breakdown → Feature</span>
        </div>
        <div style={{color:'var(--text-3,#6B7280)',fontSize:11}}>#{bdTarget.id} {bdTarget.task}</div>
        <div style={{display:'flex',flexDirection:'column',gap:6,background:'var(--elevated-2,#0f172a)',border:'1px solid var(--border-1,#1e293b)',borderRadius:8,padding:10}}>
          <div style={{fontSize:11,fontWeight:700,color:'var(--accent-warning,#f59e0b)'}}>Breakdown jadi Feature <span style={{fontWeight:400,color:'var(--text-4,#64748b)',fontSize:9}}>(child WP · parent #{bdTarget.opId || bdTarget.id})</span></div>
          {bdFeatures.map((ft, i) => (
            <div key={i} style={{display:'flex',gap:5,alignItems:'center'}}>
              <span style={{fontSize:9,color:'#64748b',width:14}}>{i+1}</span>
              <input value={ft.title} onChange={(e) => { const n=[...bdFeatures]; n[i]={...n[i],title:e.target.value}; setBdFeatures(n); }} placeholder="Judul feature…" style={{flex:1,background:'var(--elevated-bg,#111827)',color:'#e5e7eb',border:'1px solid var(--border-1,#1e293b)',borderRadius:4,padding:'4px 7px',fontSize:11,outline:'none',fontFamily:'inherit'}} />
              {bdFeatures.length > 1 && <span onClick={() => setBdFeatures(bdFeatures.filter((_,j)=>j!==i))} style={{cursor:'pointer',color:'#ef4444',fontSize:12,flexShrink:0}}>✕</span>}
            </div>
          ))}
          <div style={{display:'flex',gap:6,alignItems:'center'}}>
            <button type="button" onClick={() => setBdFeatures([...bdFeatures, { title: '' }])} style={{background:'transparent',color:'#3b82f6',border:'1px solid #3b82f6',borderRadius:5,padding:'3px 10px',fontSize:10,fontWeight:700,cursor:'pointer'}}>+ Feature</button>
            {bdState.error && <span style={{fontSize:9,color:'#ef4444',flex:1}}>⚠ {bdState.error}</span>}
            {bdState.saving && <span style={{fontSize:9,color:'#f59e0b',flex:1}}>Membuat… {bdState.done}</span>}
            <button type="button" onClick={createFeatureChildren} disabled={bdState.saving || !bdFeatures.some(f=>f.title.trim())} style={{marginLeft:'auto',background:'var(--accent-warning,#f59e0b)',color:'#1c1917',border:'none',borderRadius:6,padding:'4px 14px',fontSize:10,fontWeight:700,cursor:'pointer',opacity:(bdState.saving||!bdFeatures.some(f=>f.title.trim()))?0.5:1}}>⚡ Buat {bdFeatures.filter(f=>f.title.trim()).length} Feature</button>
          </div>
        </div>
        <div style={{display:'flex',gap:6,alignItems:'center',justifyContent:'flex-end'}}>
          <button type="button" onClick={() => setBdTarget(null)} style={{background:'var(--elevated-2)',color:'var(--text-2)',border:'1px solid var(--border-1)',borderRadius:6,padding:'4px 12px',fontSize:10,cursor:'pointer'}}>Tutup</button>
        </div>
      </div>
    </div>
  );
  const OpDetailPanel = ({ wp, opWk = null, monthLabel = "" }) => {
    const v = opRowView(wp);
    const push = opPushState[wp.id];
    // auto-load OP relations when this panel opens (once per wp until refreshed)
    React.useEffect(() => { if (opRels[wp.id] === undefined || opRels[wp.id].list === undefined) loadRels(wp.id); }, [wp.id]);
    return (() => {
                    // OP detail panel renders the 3-card detail layout, wired to opRowView/setOpEdit.
                    const ic = {width:16,height:16,flexShrink:0};
                    const OS = {
                      root:{display:"flex",gap:12,padding:16,borderLeft:"2px solid #f59e0b",background:"#0A0E1F"},
                      card:{background:"#111827",border:"1px solid #2A3555",borderRadius:10,padding:14,display:"flex",flexDirection:"column",gap:10},
                      hdr:{display:"flex",alignItems:"center",gap:6,fontSize:13,fontWeight:700,color:"#fff"},
                      label:{fontSize:11,color:"#8B93A7",fontWeight:600},
                      input:{background:"#0C1022",border:"1px solid #2A3555",borderRadius:6,padding:"6px 10px",fontSize:12,color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",gap:6},
                      id:{marginLeft:"auto",background:"#1E293B",borderRadius:10,padding:"3px 8px",fontSize:10,fontWeight:600,color:"#8B93A7"},
                      assignRow:{display:"flex",gap:8},
                      div:{height:1,background:"#1E293B",width:"100%"},
                      schedRow:{display:"flex",gap:12},
                      sched:{flex:1,display:"flex",flexDirection:"column",gap:6},
                      schedH:{display:"flex",alignItems:"center",gap:4,fontSize:12,fontWeight:700,color:"#fff"},
                      arrow:{color:"#4B5563",fontSize:12},
                      mRow:{display:"flex",alignItems:"center",gap:8,padding:"4px 0"},
                      mInfo:{display:"flex",flexDirection:"column",gap:1},
                      mName:{fontSize:12,fontWeight:600,color:"#fff"},
                      mDesc:{fontSize:10,color:"#8B93A7"},
                      btn:{display:"flex",alignItems:"center",justifyContent:"center",gap:6,width:"100%",padding:"8px 14px",borderRadius:8,background:"#f59e0b",color:"#1C1917",border:"none",fontSize:13,fontWeight:700,cursor:"pointer"},
                      sec:{display:"flex",flexDirection:"column",gap:8},
                      secH:{margin:0,fontSize:12,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",gap:6},
                      textLabel:{fontSize:12,color:"#cbd5e1",padding:"6px 0"},
                    };
                    const obadge = (lv) => { const colors={H:"#E5484D",M:"#E5A83B",L:"#3FB950"}; const c=colors[lv]||"#6B7280"; return <div style={{width:24,height:24,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:700,background:c+"30",color:c,flexShrink:0}}>{lv||"?"}</div>; };
                    const estW = (DEV_WEEKS[v.effort]||4) + (QA_WEEKS[v.testing]||2);
                    return (
                    <div style={OS.root}>
                      {/* ── Task Information ── */}
                      <div style={{...OS.card,flex:"0 0 28%"}}>
                        <div style={OS.hdr}>
                          <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 7h6M9 11h6M9 15h3"/></svg>
                          Task Information<span style={OS.id}>OP #{wp.id}</span>
                        </div>
                        <div style={OS.label}>Title</div>
                        <div style={OS.input}><InlineEdit value={v.subject} onSave={(x) => setOpEdit(wp.id, "subject", x)} placeholder="Judul task" style={{fontSize:12,color:"#fff",background:"none",border:"none",padding:0,width:"100%"}} /></div>
                        <div style={OS.label}>Description</div>
                        <div style={{...OS.input,alignItems:"stretch"}}><InlineEdit value={v.desc} onSave={(x) => setOpEdit(wp.id, "desc", x)} multiline placeholder="Tambah deskripsi…" viewMaxHeight={240} style={{fontSize:11,color:"#fff",background:"none",border:"none",padding:0,width:"100%",lineHeight:1.4,display:"block"}} /></div>
                      </div>

                      {/* ── People & Dependency ── */}
                      <div style={{...OS.card,flex:1}}>
                        <div style={OS.hdr}>
                          <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
                          People & Dependency
                        </div>
                        <div style={OS.assignRow}>
                          <div style={{flex:1,minWidth:0}}><div style={{...OS.label,marginBottom:4}}>Assignee</div><MemberSelect mode="single" value={v.assigneeId} people={opPeople} placeholder="PIC utama…" onChange={(id) => setOpEdit(wp.id, "assigneeId", id ? Number(id) : null)} /></div>
                          <div style={{flex:1,minWidth:0}}><div style={{...OS.label,marginBottom:4}}>QA Assignee</div><MemberSelect mode="multi" value={v.qa} people={opPeople} placeholder="Tim QA…" onChange={(ids) => setOpEdit(wp.id, "qa", ids)} /></div>
                          <div style={{flex:1,minWidth:0}}><div style={{...OS.label,marginBottom:4}}>Accountable</div><MemberSelect mode="single" value={v.responsibleId} people={opPeople} placeholder="Penanggung jawab…" onChange={(id) => setOpEdit(wp.id, "responsibleId", id ? Number(id) : null)} /></div>
                        </div>
                        {opPeople.length === 0 && <div style={{ fontSize: 11, color: "#b45309" }}>⚠ Daftar assignee OP kosong (token OpenProject tak punya izin baca users).</div>}
                        <div style={OS.div}/>
                        {/* ── Relasi OP (real work-package relations: dependency / breakdown / manual) ── */}
                        {(() => {
                          const rel = opRels[wp.id] || {};
                          const list = rel.list || [];
                          return (
                            <div style={OS.sec} onClick={(e) => e.stopPropagation()}>
                              <div style={{display:"flex",alignItems:"center",gap:6}}>
                                <div style={OS.label}>Relasi OP</div>
                                {rel.loading && <span style={{fontSize:9,color:"#64748b"}}>sync…</span>}
                                <button type="button" onClick={() => loadRels(wp.id)} style={{marginLeft:"auto",background:"transparent",color:"#64748b",border:"none",fontSize:10,cursor:"pointer"}}>↻ refresh</button>
                              </div>
                              {rel.list === undefined && !rel.loading && <div style={{fontSize:10,color:"#64748b"}}>Klik refresh untuk memuat relasi.</div>}
                              {list.length === 0 && rel.list !== undefined && !rel.loading && <div style={{fontSize:10,color:"#64748b"}}>Belum ada relasi.</div>}
                              {list.map((rl) => {
                                const other = rl.fromId === wp.id ? { id: rl.toId, name: rl.toName } : { id: rl.fromId, name: rl.fromName };
                                return (
                                  <div key={rl.id} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,background:"#0C1022",borderRadius:4,padding:"4px 7px"}}>
                                    <span style={{fontWeight:700,color:"#f59e0b",flexShrink:0,textTransform:"uppercase",fontSize:9}}>{rl.type}</span>
                                    <span style={{color:"#8B93A7",flexShrink:0}}>#{other.id}</span>
                                    <span style={{color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{other.name || "—"}</span>
                                    <span onClick={() => removeRel(wp.id, rl.id)} title="hapus relasi" style={{marginLeft:"auto",cursor:"pointer",color:"#ef4444",flexShrink:0}}>✕</span>
                                  </div>
                                );
                              })}
                              <div style={{display:"flex",gap:5,position:"relative"}}>
                                <div style={{flex:1,position:"relative",minWidth:0}}>
                                  <input value={relDraft.q} onChange={(e) => setRelDraft((d) => ({...d, q: e.target.value, toId: /^\d+$/.test(e.target.value.trim()) ? e.target.value.trim() : "", picked: null}))} placeholder="Cari OP id / judul…" style={{width:"100%",boxSizing:"border-box",background:"#0C1022",color:"#cbd5e1",border:"1px solid #2A3555",borderRadius:4,padding:"3px 6px",fontSize:10,outline:"none",fontFamily:"inherit"}} />
                                  {relDraft.picked && <div style={{fontSize:9,color:"#22c55e",marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>→ #{relDraft.picked.id} {relDraft.picked.subject}</div>}
                                  {relDraft.q.trim() && !relDraft.picked && relMatches.length > 0 && (
                                    <div style={{position:"absolute",top:"100%",left:0,right:0,zIndex:50,background:"#0C1022",border:"1px solid #2A3555",borderRadius:4,marginTop:2,maxHeight:160,overflowY:"auto",boxShadow:"0 6px 18px rgba(0,0,0,.5)"}}>
                                      {relMatches.map((m) => (
                                        <div key={m.id} onClick={() => setRelDraft((d) => ({...d, toId: String(m.id), q: "#"+m.id+" "+(m.subject||""), picked: m}))} style={{display:"flex",gap:6,alignItems:"center",padding:"4px 7px",fontSize:10,cursor:"pointer",borderBottom:"1px solid #1E293B"}} onMouseDown={(e)=>e.preventDefault()}>
                                          <span style={{color:"#8B93A7",flexShrink:0}}>#{m.id}</span>
                                          <span style={{color:"#cbd5e1",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.subject||"—"}</span>
                                          {m.typeName && <span style={{marginLeft:"auto",color:"#64748b",flexShrink:0,fontSize:9}}>{m.typeName}</span>}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                  {relDraft.q.trim() && !relDraft.picked && !/^\d+$/.test(relDraft.q.trim()) && relMatches.length === 0 && <div style={{fontSize:9,color:"#64748b",marginTop:2}}>Tak ada WP cocok.</div>}
                                </div>
                                <select value={relDraft.type} onChange={(e) => setRelDraft((d) => ({...d, type: e.target.value}))} style={{width:120,flexShrink:0,background:"#0C1022",color:"#cbd5e1",border:"1px solid #2A3555",borderRadius:4,padding:"3px 6px",fontSize:10,outline:"none"}}>
                                  {REL_TYPE_OPTS.map(([v2, lbl]) => <option key={v2} value={v2}>{lbl}</option>)}
                                </select>
                                <button type="button" onClick={() => addRel(wp.id, relDraft.toId, relDraft.type)} disabled={rel.loading || !relDraft.toId} style={{background:"transparent",color: relDraft.toId ? "#f59e0b" : "#475569",border:"1px solid "+(relDraft.toId?"#f59e0b":"#334155"),borderRadius:4,padding:"3px 9px",fontSize:10,fontWeight:700,cursor: relDraft.toId ? "pointer":"not-allowed",flexShrink:0}}>+ Relasi</button>
                              </div>
                              {rel.error && <div style={{fontSize:9,color:"#ef4444"}}>{rel.error}</div>}
                            </div>
                          );
                        })()}
                        <div style={OS.div}/>
                        <div style={OS.schedRow}>
                          <div style={OS.sched}>
                            <div style={OS.schedH}><svg style={{width:12,height:12}} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>Schedule</div>
                            <div style={{display:"flex",gap:8,alignItems:"center"}}>
                              <span style={OS.textLabel}>{wp.startDate || "—"}</span>
                              <span style={OS.arrow}>→</span>
                              <span style={OS.textLabel}>{wp.dueDate || "—"}</span>
                            </div>
                            {opWk && <div style={{fontSize:11,color:"#94a3b8"}}>{"W"+opWk[0]+(opWk[1]!==opWk[0]?"–W"+opWk[1]:"")+" ("+monthLabel+")"}</div>}
                          </div>
                        </div>
                        <div style={OS.div}/>
                        {/* ── Type ── */}
                        <div style={OS.label}>Type</div>
                        <div style={OS.input}><span style={{fontSize:12,color:"#cbd5e1"}}>{wp.typeName || "—"}</span></div>
                        {/* OP Status — real OpenProject status (27 options from OP meta, cached). Edit here → push sets statusId. */}
                        <div style={OS.label}>OP Status</div>
                        <div style={OS.input}>
                          <select value={v.opStatus} onChange={(e) => setOpEdit(wp.id, "opStatus", e.target.value)}
                            style={{fontSize:12,color:"#fff",background:"#0C1022",border:"none",outline:"none",width:"100%",cursor:"pointer"}}>
                            {!(opMeta.statuses || []).some((s) => s.name === v.opStatus) && v.opStatus && <option value={v.opStatus}>{v.opStatus}</option>}
                            {(opMeta.statuses || []).map((s) => <option key={s.id} value={s.name}>{s.name}</option>)}
                          </select>
                          {v.opStatus !== (wp.statusName || "") && <span title="belum di-push ke OP" style={{fontSize:9,color:"#f59e0b",fontWeight:700,marginLeft:6,flexShrink:0}}>●</span>}
                        </div>
                        {/* Dokumen Pendukung (LOCAL) — analisa awal, tidak dikirim ke OP. keyed by wp.id. */}
                        {(() => {
                          const entry = msDocs[wp.id] || {}; const docs = entry.docs || [];
                          return (
                            <>
                              <div style={OS.label}>Dokumen Pendukung <span style={{color:"#64748b",fontSize:9}}>(lokal)</span></div>
                              {docs.length === 0 && <div style={{fontSize:10,color:"#64748b"}}>Belum ada dokumen.</div>}
                              {docs.map((dc, i) => (
                                <div key={i} style={{display:"flex",alignItems:"center",gap:6,fontSize:10,color:"#cbd5e1",background:"#0C1022",borderRadius:4,padding:"4px 7px"}}>
                                  <span style={{fontWeight:700,flexShrink:0}}>{dc.label}</span>
                                  {dc.ref && (/^https?:\/\//.test(dc.ref)
                                    ? <a href={dc.ref} target="_blank" rel="noreferrer" onClick={(e)=>e.stopPropagation()} style={{color:"#3b82f6",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dc.ref}</a>
                                    : <span style={{color:"#8B93A7",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{dc.ref}</span>)}
                                  {dc.note && <span style={{color:"#64748b",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>· {dc.note}</span>}
                                  <span onClick={(e) => { e.stopPropagation(); saveWpDocs(wp.id, docs.filter((_, j) => j !== i)); }} style={{marginLeft:"auto",cursor:"pointer",color:"#ef4444",flexShrink:0}}>✕</span>
                                </div>
                              ))}
                              <div style={{display:"flex",gap:5}} onClick={(e) => e.stopPropagation()}>
                                <input value={msDocDraft.label} onChange={(e) => setMsDocDraft(d => ({...d, label: e.target.value}))} placeholder="Label" style={{width:70,background:"#0C1022",color:"#cbd5e1",border:"1px solid #2A3555",borderRadius:4,padding:"3px 6px",fontSize:10,outline:"none",fontFamily:"inherit"}} />
                                <input value={msDocDraft.ref} onChange={(e) => setMsDocDraft(d => ({...d, ref: e.target.value}))} placeholder="Link / path" style={{flex:1,background:"#0C1022",color:"#cbd5e1",border:"1px solid #2A3555",borderRadius:4,padding:"3px 6px",fontSize:10,outline:"none",fontFamily:"inherit"}} />
                                <button type="button" onClick={() => { const ref = msDocDraft.ref.trim(), label = msDocDraft.label.trim(); if (!ref && !label) return; saveWpDocs(wp.id, [...docs, { label: label || ref, ref, note: msDocDraft.note.trim() }]); setMsDocDraft({ label:"", ref:"", note:"" }); }} style={{background:"transparent",color:"#f59e0b",border:"1px solid #f59e0b",borderRadius:4,padding:"3px 9px",fontSize:10,fontWeight:700,cursor:"pointer",flexShrink:0}}>+ Doc</button>
                              </div>
                            </>
                          );
                        })()}
                      </div>

                      {/* ── Metrics ── */}
                      <div style={{...OS.card,flex:"0 0 24%"}}>
                        <div style={OS.hdr}>
                          <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><path d="M3 3v18h18"/><rect x="7" y="11" width="3" height="6" rx=".5"/><rect x="12" y="7" width="3" height="10" rx=".5"/><rect x="17" y="13" width="3" height="4" rx=".5"/></svg>
                          Metrics
                        </div>
                        {[["Impact","impact",v.impact],["Effort","effort",v.effort],["Testing","testing",v.testing]].map(([label,field,lv]) => (
                          <div key={label} style={OS.mRow}>
                            {obadge(lv)}
                            <div style={{...OS.mInfo,flex:1}}><span style={OS.mName}>{label}</span><span style={OS.mDesc}>{(DESC[label]&&DESC[label][lv])||"Belum di-set"}</span></div>
                            <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={lv||"—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, field, x)} /></div>
                          </div>
                        ))}
                        <div style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",background:"#f59e0b0a",borderRadius:6,border:"1px solid #f59e0b20",marginTop:6}}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                          <div>
                            <div style={{fontSize:13,fontWeight:700,color:"#e5e7eb"}}>Estimate: {(DEV_WEEKS[v.effort]||4)}+{(QA_WEEKS[v.testing]||2)} = {estW} weeks</div>
                            <div style={{fontSize:10,color:"#64748b"}}>Dev {(DEV_WEEKS[v.effort]||4)}w → QA {(QA_WEEKS[v.testing]||2)}w</div>
                          </div>
                        </div>
                        <div style={OS.div}/>
                        <div style={OS.sec}>
                          <h5 style={OS.secH}>
                            <svg style={ic} viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>
                            Status & Actions
                          </h5>
                          <div style={{fontSize:11,color:"#94a3b8"}}><span style={{fontWeight:600}}>Status:</span> {v.status||"—"} · <span style={{fontWeight:600}}>Priority:</span> {v.prio||"-"}</div>
                          <button type="button" onClick={() => pushOpToOP(wp)} disabled={push === "saving"} style={OS.btn}>{push === "saving" ? "Mengirim…" : "Push ke OpenProject"}</button>
                          {push === "ok" && <span style={{ fontSize: 11, color: "#22c55e" }}>✓ Terkirim ke OP</span>}
                          {push && push !== "ok" && push !== "saving" && <span style={{ fontSize: 11, color: "#ef4444" }}>✗ {push}</span>}
                          <a href={"https://pm.infradigital.id/projects/satuinbox-indonesia/work_packages/" + wp.id} target="_blank" rel="noreferrer" style={{ fontSize: 10, color: "#f59e0b", textDecoration: "none" }}>↗ Buka di OP</a>
                        </div>
                      </div>
                    </div>
                    );
    })();
  };
  if (monthView) {
    const q = QUARTERS.find((x) => x.label === monthView.qLabel) || QUARTERS[0];
    const monthAbs = QUARTERS.indexOf(q) * 3 + monthView.mi; // 0..11 absolute month index
    const lk = qLink[q.label];
    // OP rows show in this month only if the link's scope includes it. month-scope limits to specific months (mi 0..2); other scopes span the whole quarter.
    const lkScope = lk ? qlNorm(lk).scope : null;
    const lkInScope = !!lk && (lkScope.type !== "months" || (lkScope.months || []).includes(monthView.mi));
    // a task shows in this month if its span covers monthAbs; week bar = full width when active (no per-week model yet)
    const WK = ["W1", "W2", "W3", "W4"];
    let rc = 0;
    // Month View OP-source (Fase 6): all rows from opCache-by-version, grouped by status. No roadmap-local rows.
    const monthOpRows = opSortRows(mvOp.rows);
    return (
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#0B0F15", padding: "0 0 8px" }}>
        {/* single header row: All toggle · Qn-version · month tabs · KPI pills */}
        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", padding: "8px 24px 6px" }}>
          <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <div onClick={() => setMonthView(null)} style={{ cursor: "pointer", padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#94a3b8", background: "transparent" }}>All</div>
            <div style={{ padding: "5px 14px", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#3b82f6", background: "#111827" }}>Month</div>
          </div>
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          <div onClick={(e) => { const r = e.currentTarget.getBoundingClientRect(); setQPopup({ label: q.label, x: Math.max(8, Math.min(r.left, window.innerWidth - 456)), y: r.bottom + 6 }); }}
            title={lk ? "Ubah linked version" : "Link OP version ke " + q.label}
            style={{ cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6, padding: "4px 10px", borderRadius: 6, border: "1px solid " + (lk ? "#f59e0b" : "#263244"), background: lk ? "#f59e0b12" : "transparent" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: lk ? "#f59e0b" : "#64748b" }}>{q.label}</span>
            {lk ? (
              <>
                <VerDiamonds lk={lk} />
                <span style={{ fontSize: 10, color: "#94a3b8" }}>{qlNorm(lk).versions.length} ver · {qlScopeLabel(qlNorm(lk).scope, q.months)}</span>
              </>
            ) : (
              <span style={{ fontSize: 10, fontWeight: 700, color: "#64748b" }}>◆ Link version</span>
            )}
          </div>
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
            {q.months.map((mn, mi) => (
              <div key={mn} onClick={() => setMonthView({ qLabel: q.label, mi })}
                style={{ cursor: "pointer", padding: "4px 14px", borderRadius: 6, fontSize: 12, fontWeight: 700, color: mi === monthView.mi ? "#3b82f6" : "#475569", background: mi === monthView.mi ? "#111827" : "transparent" }}>{mn}</div>
            ))}
          </div>
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          <button type="button" onClick={() => { setAddModal('milestone'); setMsForm(MS_FORM_INIT); setMsState({saving:false,error:''}); }} style={{background:'#f59e0b',color:'#1c1917',border:'none',borderRadius:6,padding:'5px 14px',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><span style={{fontSize:13}}>◆</span> Milestone</button>
          <div style={{ width: 1, height: 18, background: "#1e293b" }} />
          {(() => {
            // Month View KPI — OP-source. Counts OP rows for this linked version, by status bucket.
            const k = {
              total: monthOpRows.length,
              now: monthOpRows.filter((wp) => opBucketOf(wp) === "now").length,
              next: monthOpRows.filter((wp) => opBucketOf(wp) === "next").length,
              backlog: monthOpRows.filter((wp) => opBucketOf(wp) === "backlog").length,
              done: monthOpRows.filter((wp) => opBucketOf(wp) === "done").length,
            };
            window._capRows.month = monthOpRows.map(wp => { const o = opRowView(wp); return [null, o.subject||wp.subject, null, null, null, o.effort||"", o.impact||"", o.testing||"", null, [0,0], null, null, "op-"+wp.id]; }); window._capRows.monthLabel = q.months[monthView.mi]; window._capDirty = true;
            return (<div style={{ display: "flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
              {rmPill(k.total, "Total")}
              {rmPill(k.now, "Now", stat.now)}{rmPill(k.next, "Next", stat.next)}{rmPill(k.backlog, "Backlog", stat.backlog)}{rmPill(k.done, "Done", stat.done)}
              {mvOp.loading && <span style={{ fontSize: 10, color: "#64748b" }}>sync…</span>}
              <div style={{width:1,height:18,background:"#1e293b"}} />
              <div id="cap-month-pills" style={{display:"inline-flex",alignItems:"center",gap:5}}></div>
            </div>);
          })()}
          <div id="cap-month-panel"></div>
        </div>
        <div style={{ minWidth: 598 + 4 * 152, display: "flex", flexDirection: "column", padding: "0 24px" }}>
          {/* header: frozen cols + W1-W4 */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "#111827", borderRadius: 8 }}>
            <div style={txt(COLW.num, "#e5e7eb", 10, true)}>#</div>
            <div style={txt(COLW.task, "#e5e7eb", 10, true, { flex: 1, width: "auto", flexShrink: 1, minWidth: COLW.task })}>Task</div>
            <div style={txt(COLW.area, "#e5e7eb", 10, true)}>Area</div>
            <div style={{width:40,flexShrink:0,fontSize:10,fontWeight:700,color:"#e5e7eb",textAlign:'center'}}>BD</div>
            <div style={txt(COLW.prio, "#e5e7eb", 10, true, { textAlign: "center" })}>Prio</div>
            <div style={txt(COLW.status, "#e5e7eb", 10, true, { textAlign: "center" })}>Status</div>
            <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Impact</div>
            <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Effort</div>
            <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Test</div>
            <div style={txt(COLW.assignee, "#e5e7eb", 10, true)}>Assignee</div>
            {(() => { const segs = monthWeeks(monthAbs); const totalW = 608; return segs.map((seg, i) => (
              <div key={i} title={seg.s + "–" + seg.e + " " + q.months[monthView.mi]} style={{ width: totalW / segs.length, flexShrink: 0, fontSize: 9, fontWeight: 700, color: "#e5e7eb", textAlign: "center", whiteSpace: "nowrap" }}>{seg.s}–{seg.e}</div>
            )); })()}
          </div>
          {/* local v2 tasks whose timeline bar covers this month — always shown */}
          {lkInScope && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "14px 0 6px" }}>
                <div style={{ width: 4, height: 18, background: "#f59e0b", borderRadius: 2 }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#f59e0b" }}>OpenProject · {qlNorm(lk).versions.map((v) => v.name).join(", ")}</span>
                <div style={{ flex: "1 1 0", height: 1, background: "#f59e0b30" }} />
              </div>
              {mvOp.loading ? (
                <div style={{ padding: "12px", fontSize: 12, color: "#64748b" }}>Loading OP tasks…</div>
              ) : monthOpRows.length === 0 ? (
                <div style={{ padding: "12px", fontSize: 12, color: "#64748b" }}>Tidak ada task OP di version ini.</div>
              ) : groupOpByStatus(monthOpRows).map(([bkey, blabel, bcolor, brows]) => (
                <React.Fragment key={"bucket-" + bkey}>
                  {/* status-group header: NOW / NEXT / BACKLOG / DONE. On hold → BACKLOG. */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px 4px" }}>
                    <div style={{ width: 4, height: 14, background: bcolor, borderRadius: 2 }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: bcolor, letterSpacing: 0.4 }}>{blabel}</span>
                    <span style={{ fontSize: 10, color: "#64748b" }}>{brows.length}</span>
                    <div style={{ flex: "1 1 0", height: 1, background: bcolor + "22" }} />
                  </div>
                  {brows.map((wp, wi) => {
                const zebra = (wi % 2 === 0) ? "#0f172a" : "#00000000";
                const v = opRowView(wp);
                const opWk = opWeeksForMonth(wp, monthAbs); // [w1,w4] when this WP is worked in this month, or null
                const ouid = "op-" + wp.id;
                const oOpen = !!expanded[ouid];
                const push = opPushState[wp.id];
                // OP roles → avatar cluster (img-3: OP column matches roadmap). name→initials+hashed color (no fixed AV map for OP people).
                const opById = Object.fromEntries((opPeople || []).map((p) => [String(p.id), p]));
                const opChip = (pid) => { const p = opById[String(pid)]; return p ? { ini: iniOf(p.name), color: colorOf(p.name), name: p.name } : null; };
                const opFlat = [opChip(v.assigneeId), ...((v.qa || []).map(opChip)), opChip(v.responsibleId)].filter(Boolean);
                return (
                  <React.Fragment key={wp.id}>
                  <div onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } toggle(ouid); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: zebra, cursor: "pointer" }}>
                    <div style={txt(COLW.num, "#475569", 10, false)}>{oOpen ? "▾" : "▸"} {wp.id}</div>
                    <div style={txt(COLW.task, "#f1f5f9", 11, true, { flex: 1, width: "auto", flexShrink: 1, minWidth: COLW.task, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>{v.subject || wp.typeName || "—"}</div>
                    <div style={txt(COLW.area, "#94a3b8", 10, false)}>{wp.typeName || "—"}</div>
                    <div style={{width:40,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                      <button type="button" onClick={(e) => { e.stopPropagation(); bdClick(wp.id, {id:wp.id,task:v.subject||wp.typeName,opId:wp.id,typeName:wp.typeName,assigneeName:wp.assigneeName,priorityName:wp.priorityName}); }} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--accent-warning,#F59E0B)',fontSize:14}} title="Breakdown → Subtask">⚡</button>
                    </div>
                    <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.prio} options={PRIO_OPTS} colorMap={prio} w={COLW.prio} radius={4} onChange={(x) => setOpEdit(wp.id, "prio", x)} /></div>
                    <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.status} options={["now", "next", "backlog", "done", "hold", "blocked"]} colorMap={stat} w={COLW.status} radius={12} onChange={(x) => setOpEdit(wp.id, "status", x)} /></div>
                    <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.impact || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "impact", x)} /></div>
                    <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.effort || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "effort", x)} /></div>
                    <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.testing || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "testing", x)} /></div>
                    <div onClick={(e) => e.stopPropagation()}>{avatars(ouid, v.subject || "", opFlat, () => setOpAssign({ wpId: wp.id }))}</div>
                    {/* OP timeline bar = real calendar weeks (Sun–Sat) of this month. DRAG across weeks to set start→due. Saved to opEdits, pushed on "Push ke OP". */}
                    {(() => {
                      const segs = monthWeeks(monthAbs); // real calendar weeks (4–6 cells)
                      const liveWk = opWeeksForMonth({ startDate: v.startDate, dueDate: v.dueDate }, monthAbs) || opWk;
                      const drag = barDrag && barDrag.wpId === wp.id && barDrag.kind === "w" ? barDrag : null;
                      const dragLo = drag ? Math.min(drag.anchor, drag.hover) : null, dragHi = drag ? Math.max(drag.anchor, drag.hover) : null;
                      const mLbl = q.months[monthView.mi];
                      const totalW = 608; // keep the week-strip overall width stable (was 4×152)
                      return segs.map((seg, i) => {
                        const w = i + 1;
                        const inDrag = drag && w >= dragLo && w <= dragHi;
                        const on = !drag && liveWk && w >= liveWk[0] && w <= liveWk[1];
                        const tip = seg.s + "–" + seg.e + " " + mLbl + " · drag untuk set rentang";
                        return (
                          <div key={w} title={tip}
                            onMouseDown={(e) => { e.stopPropagation(); e.preventDefault(); setBarDrag({ wpId: wp.id, kind: "w", monthAbs, anchor: w, hover: w }); }}
                            onMouseEnter={() => { if (barDragRef.current && barDragRef.current.wpId === wp.id && barDragRef.current.kind === "w") setBarDrag((d) => ({ ...d, hover: w })); }}
                            onClick={(e) => e.stopPropagation()}
                            style={{ width: totalW / segs.length, flexShrink: 0, height: 26, padding: "2px 3px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 2, cursor: "ew-resize" }}>
                            <div style={{ width: "100%", height: 10, background: inDrag ? "#3b82f6" : on ? "#f59e0b55" : "#1e293b", borderRadius: 5, transition: "background .1s" }} />
                            <span style={{ fontSize: 8, lineHeight: 1, color: (inDrag || on) ? "#f59e0b" : "#475569", whiteSpace: "nowrap" }}>{seg.s}–{seg.e}</span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  {oOpen && <OpDetailPanel wp={wp} opWk={opWk} monthLabel={q.months[monthView.mi]} />}
                  </React.Fragment>
                );
              })}
                </React.Fragment>
              ))}
            </>
          )}
        </div>
        {qPopupEl}
        {tipEl}
        {roleTaskEl}
        {opAssignEl}
              {bdTargetEl}
        {addTaskModalEl}
      </div>
    );
  }
  // ── All View: OP-source (Fase 6). All WP from opCache, grouped by status (NOW/NEXT/BACKLOG/DONE). No 4-quarter timeline. ──
  const rmQ = rmq.trim().toLowerCase();
  const allOpRows = (opCache.rows || []).filter((wp) =>
    !rmQ || String(wp.subject || "").toLowerCase().includes(rmQ) || String(wp.typeName || "").toLowerCase().includes(rmQ));
  const allGroups = groupOpByStatus(opSortRows(allOpRows));
  const rmKpi = {
    total: allOpRows.length,
    now: allOpRows.filter((wp) => opBucketOf(wp) === "now").length,
    next: allOpRows.filter((wp) => opBucketOf(wp) === "next").length,
    backlog: allOpRows.filter((wp) => opBucketOf(wp) === "backlog").length,
    done: allOpRows.filter((wp) => opBucketOf(wp) === "done").length,
  };
  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "#0B0F15", padding: "8px 24px" }}>
      {/* KPI mini strip + search — OP source */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", padding: "4px 0 10px" }}>
        {rmPill(rmKpi.total, "Total")}
        {rmPill(rmKpi.now, "Now", stat.now)}
        {rmPill(rmKpi.next, "Next", stat.next)}
        {rmPill(rmKpi.backlog, "Backlog", stat.backlog)}
        {rmPill(rmKpi.done, "Done", stat.done)}
        {opCache.loading && <span style={{ fontSize: 10, color: "#64748b" }}>sync…</span>}
        {opCache.ts && !opCache.loading && <span style={{ fontSize: 9, color: "#475569" }} title={new Date(opCache.ts).toLocaleString()}>synced</span>}
        <button type="button" onClick={() => refreshOpCache()} disabled={opCache.loading} style={{ background: "transparent", color: "#3b82f6", border: "1px solid #3b82f6", borderRadius: 6, padding: "4px 10px", fontSize: 10, fontWeight: 700, cursor: "pointer", opacity: opCache.loading ? 0.5 : 1 }}>↻ Refresh</button>
        <input type="search" value={rmq} onChange={(e) => setRmq(e.target.value)} placeholder="Search WP…"
          style={{ marginLeft: "auto", width: 200, background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6, padding: "5px 10px", fontSize: 11, color: "#e5e7eb", outline: "none", fontFamily: "inherit" }} />
        <button type="button" onClick={() => { setAddModal('milestone'); setMsForm(MS_FORM_INIT); setMsState({saving:false,error:''}); }} style={{background:'#f59e0b',color:'#1c1917',border:'none',borderRadius:6,padding:'5px 14px',fontSize:11,fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}><span style={{fontSize:13}}>◆</span> Milestone</button>
      </div>
      <div style={{ minWidth: 640, display: "flex", flexDirection: "column" }}>
        {/* header + quarter timeline (OP dates) */}
        <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "#111827", borderRadius: 8, position: "sticky", top: 0, zIndex: 3 }}>
          <div style={txt(COLW.num, "#475569", 10, true)}>#</div>
          <div style={txt(COLW.task, "#e5e7eb", 10, true, { flex: 1, width: "auto", minWidth: COLW.task })}>Task</div>
          <div style={txt(COLW.area, "#e5e7eb", 10, true)}>Type</div>
          <div style={{width:40,flexShrink:0,fontSize:10,fontWeight:700,color:"#e5e7eb",textAlign:'center'}}>BD</div>
          <div style={txt(COLW.prio, "#e5e7eb", 10, true, { textAlign: "center" })}>Prio</div>
          <div style={txt(COLW.status, "#e5e7eb", 10, true, { textAlign: "center" })}>Status</div>
          <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Impact</div>
          <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Effort</div>
          <div style={txt(COLW.eim, "#e5e7eb", 10, true, { textAlign: "center" })}>Test</div>
          <div style={txt(COLW.assignee, "#e5e7eb", 10, true)}>Assignee</div>
          {qStrip(QUARTERS.map((q) => (
            <div key={q.label} title={qLink[q.label] ? "Linked " + qlNorm(qLink[q.label]).versions.map((v) => v.name).join(", ") + " — klik: month view" : "Klik: month view · double-click: link version"}
              onClick={(e) => { clearTimeout(qClickTimer.current); qClickTimer.current = setTimeout(() => setMonthView({ qLabel: q.label, mi: 0 }), 220); }}
              onDoubleClick={(e) => { clearTimeout(qClickTimer.current); const r = e.currentTarget.getBoundingClientRect(); setQPopup({ label: q.label, x: Math.max(8, Math.min(r.left, window.innerWidth - 456)), y: r.bottom + 4 }); }}
              style={{ width: 152, flexShrink: 0, display: "flex", flexDirection: "column", gap: 1, justifyContent: "center", alignItems: "center", cursor: "pointer", borderRadius: 6, border: qLink[q.label] ? "1px solid #f59e0b" : "1px solid transparent", background: qLink[q.label] ? "#f59e0b10" : "transparent", padding: "2px 0" }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                <div style={{ width: 6, height: 6, background: q.dot, borderRadius: 3 }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: qLink[q.label] ? "#f59e0b" : "#e5e7eb" }}>{q.label}</span>
              </div>
              <div style={{ width: 152, display: "flex", gap: 2, justifyContent: "center", alignItems: "center" }}>
                {q.months.map((mn) => <div key={mn} style={{ width: 45, flexShrink: 0, fontSize: 10, color: "#94a3b8", textAlign: "center" }}>{mn}</div>)}
              </div>
            </div>
          )))}
        </div>
        {opCache.loading && allOpRows.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, color: "#64748b" }}>Loading OP work packages…</div>
        ) : allOpRows.length === 0 ? (
          <div style={{ padding: 16, fontSize: 12, color: "#64748b" }}>Tidak ada work package.</div>
        ) : allGroups.map(([bkey, blabel, bcolor, brows]) => (
          <React.Fragment key={"allbucket-" + bkey}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0 6px" }}>
              <div style={{ width: 4, height: 18, background: bcolor, borderRadius: 2 }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: bcolor }}>{blabel}</span>
              <span style={{ fontSize: 10, color: "#64748b" }}>{brows.length}</span>
              <div style={{ flex: "1 1 0", height: 1, background: bcolor + "30" }} />
            </div>
            {brows.map((wp, wi) => {
              const zebra = (wi % 2 === 0) ? "#0f172a" : "#00000000";
              const v = opRowView(wp);
              const ouid = "op-" + wp.id;
              const oOpen = !!expanded[ouid];
              const opById = Object.fromEntries((opPeople || []).map((p) => [String(p.id), p]));
              const opChip = (pid) => { const p = opById[String(pid)]; return p ? { ini: iniOf(p.name), color: colorOf(p.name), name: p.name } : null; };
              const opFlat = [opChip(v.assigneeId), ...((v.qa || []).map(opChip)), opChip(v.responsibleId)].filter(Boolean);
              return (
                <React.Fragment key={wp.id}>
                <div onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } toggle(ouid); }} style={{ display: "flex", alignItems: "center", gap: 4, padding: "7px 12px", background: zebra, cursor: "pointer" }}>
                  <div style={txt(COLW.num, "#475569", 10, false)}>{oOpen ? "▾" : "▸"} {wp.id}</div>
                  <div style={txt(COLW.task, "#f1f5f9", 11, true, { flex: 1, width: "auto", flexShrink: 1, minWidth: COLW.task, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" })}>{v.subject || wp.typeName || "—"}</div>
                  <div style={txt(COLW.area, "#94a3b8", 10, false)}>{wp.typeName || "—"}</div>
                  <div style={{width:40,flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <button type="button" onClick={(e) => { e.stopPropagation(); bdClick(wp.id, {id:wp.id,task:v.subject||wp.typeName,opId:wp.id,typeName:wp.typeName,assigneeName:wp.assigneeName,priorityName:wp.priorityName}); }} style={{background:'none',border:'none',cursor:'pointer',padding:0,color:'var(--accent-warning,#F59E0B)',fontSize:14}} title="Breakdown → Feature">⚡</button>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.prio} options={PRIO_OPTS} colorMap={prio} w={COLW.prio} radius={4} onChange={(x) => setOpEdit(wp.id, "prio", x)} /></div>
                  <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.status} options={["now", "next", "backlog", "done", "hold", "blocked"]} colorMap={stat} w={COLW.status} radius={12} onChange={(x) => setOpEdit(wp.id, "status", x)} /></div>
                  <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.impact || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "impact", x)} /></div>
                  <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.effort || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "effort", x)} /></div>
                  <div onClick={(e) => e.stopPropagation()}><RoadmapDropdown value={v.testing || "—"} options={EIM_OPTS} colorMap={eim} w={COLW.eim} radius={4} onChange={(x) => setOpEdit(wp.id, "testing", x)} /></div>
                  <div onClick={(e) => e.stopPropagation()}>{avatars(ouid, v.subject || "", opFlat, () => setOpAssign({ wpId: wp.id }))}</div>
                  {qStrip(QUARTERS.map((_q, qi) => barQuarterEdit(wp, qi)))}
                </div>
                {oOpen && <OpDetailPanel wp={wp} />}
                </React.Fragment>
              );
            })}
          </React.Fragment>
        ))}
      </div>
      {qPopupEl}
      {tipEl}
      {roleTaskEl}
      {opAssignEl}
      {bdTargetEl}
      {addTaskModalEl}
    </div>
  );
}

  // expose the "+Q" bridge so the host nav row can call it
  window.roadmapAddQ = roadmapAddQ;
  return { RoadmapPage, roadmapAddQ };
})();
