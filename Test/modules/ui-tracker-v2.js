// ui-tracker-v2.js — Dashboard v2 Tracker page. Extracted 2026-10-13.
window.TrackerV2Module = (function () {
// ── TrackerPage: Project Tracker connected to OpenProject ──
function TrackerPage() {
    const DV2 = window.DV2, dv2Card = window.dv2Card, dv2SecTitle = window.dv2SecTitle, dv2Root = window.dv2Root;
  const [versions, setVersions] = React.useState([]);
  const [statuses, setStatuses] = React.useState([]);
  const [selVer, setSelVer] = React.useState(() => { try { return JSON.parse(localStorage.getItem("tp_ver") || "null"); } catch { return null; } }); // {id, name}
  const [verOpen, setVerOpen] = React.useState(false);
  const [wps, setWps] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [timeFilter, setTimeFilter] = React.useState(() => localStorage.getItem("tp_time") || "week");
  const [userFilter, setUserFilter] = React.useState(() => localStorage.getItem("tp_user") || "all");
  const [selUser, setSelUser] = React.useState(() => { try { return JSON.parse(localStorage.getItem("tp_selUser") || "null"); } catch { return null; } });
  // persist tracker state to localStorage
  React.useEffect(() => { try { selVer ? localStorage.setItem("tp_ver", JSON.stringify(selVer)) : localStorage.removeItem("tp_ver"); } catch {} }, [selVer]);
  React.useEffect(() => { localStorage.setItem("tp_time", timeFilter); }, [timeFilter]);
  React.useEffect(() => { localStorage.setItem("tp_user", userFilter); }, [userFilter]);
  React.useEffect(() => { try { selUser ? localStorage.setItem("tp_selUser", JSON.stringify(selUser)) : localStorage.removeItem("tp_selUser"); } catch {} }, [selUser]);
  // fetch OP meta on mount
  React.useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const r = await fetch("/api/dashboard/openproject/meta?projectId=7");
        const d = await r.json();
        if (!dead && d.ok) {
          setVersions(d.versions || []);
          setStatuses(d.statuses || []);
          // restore saved version or auto-select first
          const vs = d.versions || [];
          setSelVer(prev => {
            if (prev) {
              const match = vs.find(v => String(v.id) === String(prev.id));
              return match ? { id: match.id, name: match.name } : (vs.length ? { id: vs[0].id, name: vs[0].name } : null);
            }
            return vs.length ? { id: vs[0].id, name: vs[0].name } : null;
          });
        }
      } catch (_) {}
    })();
    return () => { dead = true; };
  }, []);
  // fetch WPs when version selected
  React.useEffect(() => {
    if (!selVer) return;
    let dead = false;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch("/api/dashboard/openproject/work-packages?versionIds=" + selVer.id + "&pageSize=200");
        const d = await r.json();
        if (!dead) setWps(d.ok ? (d.allWorkPackages || d.workPackages || []) : []);
      } catch (_) { if (!dead) setWps([]); }
      if (!dead) setLoading(false);
    })();
    return () => { dead = true; };
  }, [selVer && selVer.id]);
  // date helpers — rolling window based on updatedAt (activity)
  const now = new Date();
  const day = 24 * 60 * 60 * 1000;
  const wpInRange = (wp) => {
    if (timeFilter === "all") return true;
    const ts = new Date(wp.updatedAt || wp.createdAt || 0);
    if (isNaN(ts)) return timeFilter !== "all" && timeFilter !== "lastweek" && timeFilter !== "lastmonth"; // no date → show only if not strict
    const age = now - ts;
    if (timeFilter === "week") return age <= 7 * day;
    if (timeFilter === "lastweek") return age > 7 * day && age <= 14 * day;
    if (timeFilter === "month") return age <= 30 * day;
    if (timeFilter === "lastmonth") return age > 30 * day && age <= 60 * day;
    return true;
  };
  // filter WPs by time + user
  const filtered = wps.filter(wpInRange).filter(wp => !selUser || wp.assigneeName === selUser);
  // unique assignees for per-user filter
  const users = [...new Set(wps.map(w => w.assigneeName).filter(Boolean))].sort();
  // stats from filtered WPs
  const total = filtered.length;
  const statusGroups = {};
  filtered.forEach(wp => { const s = mapOpStatusId(wp.statusId || 0); statusGroups[s] = (statusGroups[s] || 0) + 1; });
  const prioGroups = {};
  filtered.forEach(wp => { const p = rmPrioFromOp(wp.priorityName); prioGroups[p] = (prioGroups[p] || 0) + 1; });
  const byAssignee = {};
  filtered.forEach(wp => {
    const name = wp.assigneeName || "Unassigned";
    if (!byAssignee[name]) byAssignee[name] = { total: 0, closed: 0 };
    byAssignee[name].total++;
    if (mapOpStatusId(wp.statusId || 0) === "Closed") byAssignee[name].closed++;
  });
  const closedCount = filtered.filter(wp => mapOpStatusId(wp.statusId || 0) === "Closed").length;
  const overallPct = total ? Math.round((closedCount / total) * 100) : 0;
  const R = 46, C = 2 * Math.PI * R, dash = (overallPct / 100) * C;
  // status bar config
  const STATUS_COLORS = { "New": DV2.T3, "In Progress": DV2.INFO, "Closed": DV2.GRN, "On Hold": DV2.ORG, "Rejected": DV2.RED };
  const statusBars = Object.entries(STATUS_COLORS).map(([k, c]) => [k, statusGroups[k] || 0, c]);
  const barMax = Math.max(1, ...statusBars.map(s => s[1]));
  const prioColor = { P0: DV2.RED, P1: DV2.ORG, P2: DV2.PUR, P3: DV2.T3 };
  const prioBars = ["P0", "P1", "P2", "P3"].map(p => [p, prioGroups[p] || 0, prioColor[p]]);
  // date range label from WPs
  const allDates = wps.flatMap(wp => [wp.startDate, wp.dueDate].filter(Boolean)).sort();
  const fmtDate = (iso) => { const d = new Date(iso); if (isNaN(d)) return ""; return d.getDate() + " " + ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"][d.getMonth()] + " " + d.getFullYear(); };
  const dateRange = allDates.length >= 2 ? fmtDate(allDates[0]) + " – " + fmtDate(allDates[allDates.length - 1]) : "";
  const TIME_OPTS = [["week", "This Week"], ["lastweek", "Last Week"], ["month", "This Month"], ["lastmonth", "Last Month"], ["all", "All"]];
  const col = (title, items) => (
    <div style={dv2Card}>
      <div style={dv2SecTitle}>{title}</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
        {items.map(([k, v, c]) => (
          <div key={k} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <div style={{ fontSize: 11, color: DV2.T2 }}>{v}</div>
            <div style={{ width: "100%", height: Math.round((v / Math.max(1, ...items.map(x => x[1]))) * 90) + 6, background: c, borderRadius: "4px 4px 0 0" }} />
            <div style={{ fontSize: 10, color: DV2.T3, textAlign: "center" }}>{k}</div>
          </div>
        ))}
      </div>
    </div>
  );
  const hbarCol = (title, items, max) => (
    <div style={dv2Card}>
      <div style={dv2SecTitle}>{title}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(([k, v, c]) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 90, fontSize: 11, color: DV2.T2, textAlign: "right" }}>{k}</div>
            <div style={{ flex: 1, height: 14, background: DV2.BORDER, borderRadius: 4, overflow: "hidden" }}>
              <div style={{ width: Math.round((v / max) * 100) + "%", height: "100%", background: c }} />
            </div>
            <div style={{ width: 24, fontSize: 11, color: DV2.T1 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
  const pill = (text, color) => (
    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, color, background: color + "2E", whiteSpace: "nowrap" }}>{text}</span>
  );
  // difficulty from effort/impact (OP WPs don't have these, use priority as proxy)
  const diffGroups = { Easy: 0, Medium: 0, Hard: 0 };
  filtered.forEach(wp => {
    const p = rmPrioFromOp(wp.priorityName);
    if (p === "P0" || p === "P1") diffGroups.Hard++;
    else if (p === "P2") diffGroups.Medium++;
    else diffGroups.Easy++;
  });
  return (
    <div style={dv2Root}>
      {/* sub-header strip — matched to image: Project Tracker · version · date range + time/user filters */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: DV2.T1, position: "relative" }}>
          <span style={{ color: DV2.CYAN }}>▮</span>{" "}
          <span style={{ cursor: "pointer", borderBottom: "1px dotted " + DV2.T3 }} onClick={() => setVerOpen(v => !v)}>Project Tracker</span>
          {selVer && <span style={{ color: DV2.T3, fontWeight: 400 }}>{" · "}{selVer.name}{dateRange ? " · " + dateRange : ""}</span>}
          {verOpen && (
            <div style={{ position: "absolute", top: "100%", left: 0, marginTop: 4, background: DV2.CARD, border: "1px solid " + DV2.BORDER, borderRadius: 8, padding: 6, zIndex: 100, minWidth: 200, maxHeight: 240, overflowY: "auto" }}>
              {versions.map(v => (
                <div key={v.id} onClick={() => { setSelVer({ id: v.id, name: v.name }); setVerOpen(false); }}
                  style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", borderRadius: 4, color: selVer && selVer.id === v.id ? DV2.CYAN : DV2.T2, background: selVer && selVer.id === v.id ? DV2.CYAN + "18" : "transparent" }}>
                  {v.name}
                </div>
              ))}
              {versions.length === 0 && <div style={{ padding: 6, fontSize: 11, color: DV2.T3 }}>No versions found</div>}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }} />
        {/* time filter pills */}
        <div style={{ display: "flex", border: "1px dashed " + DV2.BORDER, borderRadius: 6, overflow: "hidden" }}>
          {TIME_OPTS.map(([k, label]) => (
            <div key={k} onClick={() => setTimeFilter(k)}
              style={{ padding: "4px 12px", fontSize: 12, fontWeight: timeFilter === k ? 600 : 400, cursor: "pointer",
                color: timeFilter === k ? DV2.T1 : DV2.T3,
                background: timeFilter === k ? DV2.INFO + "22" : "transparent",
                borderRight: k !== "all" ? "1px solid " + DV2.BORDER : "none" }}>{label}</div>
          ))}
        </div>
        {/* user filter pills */}
        <div style={{ display: "flex", border: "1px dashed " + DV2.BORDER, borderRadius: 6, overflow: "hidden" }}>
          <div onClick={() => { setUserFilter("all"); setSelUser(null); }}
            style={{ padding: "4px 12px", fontSize: 12, fontWeight: userFilter === "all" ? 600 : 400, cursor: "pointer",
              color: userFilter === "all" ? DV2.T1 : DV2.T3, background: userFilter === "all" ? DV2.INFO + "22" : "transparent" }}>
            {userFilter === "all" && <span style={{ color: DV2.INFO, marginRight: 4 }}>●</span>}All Users
          </div>
          <div onClick={() => setUserFilter("per")}
            style={{ padding: "4px 12px", fontSize: 12, fontWeight: userFilter === "per" ? 600 : 400, cursor: "pointer",
              color: userFilter === "per" ? DV2.T1 : DV2.T3, background: userFilter === "per" ? DV2.INFO + "22" : "transparent",
              borderLeft: "1px solid " + DV2.BORDER }}>Per User</div>
        </div>
        {selVer && <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, color: DV2.T2, background: DV2.PANEL, border: "1px solid " + DV2.BORDER }}>{selVer.name}</span>}
      </div>
      {/* per-user selector row */}
      {userFilter === "per" && (
        <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
          <span onClick={() => setSelUser(null)} style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, cursor: "pointer", color: !selUser ? DV2.T1 : DV2.T3, background: !selUser ? DV2.INFO + "22" : DV2.PANEL, border: "1px solid " + (!selUser ? DV2.INFO + "55" : DV2.BORDER) }}>All</span>
          {users.map(u => (
            <span key={u} onClick={() => setSelUser(u)} style={{ padding: "3px 10px", borderRadius: 10, fontSize: 11, cursor: "pointer", color: selUser === u ? DV2.T1 : DV2.T3, background: selUser === u ? DV2.INFO + "22" : DV2.PANEL, border: "1px solid " + (selUser === u ? DV2.INFO + "55" : DV2.BORDER) }}>{u}</span>
          ))}
        </div>
      )}
      {loading && <div style={{ padding: 20, fontSize: 13, color: DV2.T3 }}>Loading OP work packages…</div>}
      {!loading && !selVer && <div style={{ padding: 20, fontSize: 13, color: DV2.T3 }}>Pilih version di header untuk mulai.</div>}
      {!loading && selVer && total === 0 && <div style={{ padding: 20, fontSize: 13, color: DV2.T3 }}>Tidak ada work packages di version ini.</div>}
      {!loading && total > 0 && (<>
      {/* hero row */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 12, marginBottom: 16 }}>
        <div style={{ ...dv2Card, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ ...dv2SecTitle, alignSelf: "flex-start" }}>Overall</div>
          <svg width="140" height="140" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r={R} fill="none" stroke={DV2.BORDER} strokeWidth="12" />
            <circle cx="60" cy="60" r={R} fill="none" stroke={DV2.CYAN} strokeWidth="12"
              strokeLinecap="round" strokeDasharray={dash + " " + C} transform="rotate(-90 60 60)" />
            <text x="60" y="60" textAnchor="middle" dominantBaseline="central" fontSize="24" fontWeight="700" fill={DV2.T1}>{overallPct + "%"}</text>
          </svg>
        </div>
        <div style={dv2Card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
            <div style={dv2SecTitle}>Task Status</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: DV2.T1 }}>Total {total}</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {statusBars.map(([k, v, c]) => (
              <div key={k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 90, fontSize: 11, color: DV2.T2, textAlign: "right" }}>{k}</div>
                <div style={{ flex: 1, height: 14, background: DV2.BORDER, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: Math.round((v / barMax) * 100) + "%", height: "100%", background: c }} />
                </div>
                <div style={{ width: 24, fontSize: 11, color: DV2.T1 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* chart row */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12, marginBottom: 16 }}>
        {col("Difficulty", [["Easy", diffGroups.Easy, DV2.GRN], ["Medium", diffGroups.Medium, DV2.ORG], ["Hard", diffGroups.Hard, DV2.RED]])}
        {col("Priority Mix", prioBars)}
        {hbarCol("Assignees", Object.entries(byAssignee).map(([name, d]) => [name, d.total, DV2.INFO]).sort((a, b) => b[1] - a[1]), Math.max(1, ...Object.values(byAssignee).map(d => d.total)))}
        {(() => {
          const totalSpent = filtered.reduce((s, wp) => s + (wp.spentTime || 0), 0);
          const totalEst = filtered.reduce((s, wp) => s + (wp.estimatedTime || 0), 0);
          return hbarCol("Time Tracking", [
            ["Spent", totalSpent, DV2.CYAN],
            ["Estimated", totalEst, DV2.PUR],
            ["Remaining", Math.max(0, totalEst - totalSpent), DV2.GRN],
          ], Math.max(1, totalEst, totalSpent));
        })()}
      </div>
      {/* team workload */}
      <div style={{ ...dv2Card, marginBottom: 16 }}>
        <div style={dv2SecTitle}>Team Workload</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(byAssignee).sort((a, b) => (a[1].closed / Math.max(1, a[1].total)) - (b[1].closed / Math.max(1, b[1].total))).map(([name, d]) => {
            const pct = Math.round((d.closed / Math.max(1, d.total)) * 100);
            const c = pct >= 70 ? DV2.GRN : pct >= 40 ? DV2.PUR : DV2.INFO;
            return (
              <div key={name} style={{ display: "grid", gridTemplateColumns: "28px 140px 80px 1fr 48px", alignItems: "center", gap: 10 }}>
                <span style={{ width: 24, height: 24, borderRadius: "50%", background: c }} />
                <div style={{ fontSize: 13, fontWeight: 600, color: DV2.T1 }}>{name}</div>
                <div style={{ fontSize: 12, color: DV2.T2 }}>{d.total} tasks</div>
                <div style={{ height: 10, background: DV2.BORDER, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: pct + "%", height: "100%", background: c }} />
                </div>
                <div style={{ fontSize: 12, color: DV2.T1, textAlign: "right" }}>{pct}%</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* task list */}
      <div style={dv2Card}>
        <div style={dv2SecTitle}>Task List</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {filtered.map((wp, i) => {
            const st = mapOpStatusId(wp.statusId || 0);
            const pr = rmPrioFromOp(wp.priorityName);
            return (
              <div key={wp.id} style={{ display: "grid", gridTemplateColumns: "1fr 120px 96px 80px 80px 56px", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid " + DV2.BORDER, fontSize: 13, color: DV2.T1 }}>
                <div><span style={{ color: DV2.T3 }}>▸ </span>{wp.subject || wp.typeName || "—"}</div>
                <div style={{ fontSize: 12, color: DV2.T2 }}>{wp.assigneeName || "—"}</div>
                <div>{pill(st, STATUS_COLORS[st] || DV2.T3)}</div>
                <div style={{ fontSize: 12, color: DV2.T2 }}>{wp.percentageDone || 0}%</div>
                <div style={{ fontSize: 12, color: DV2.T2 }}>{(wp.spentTime || 0) + "h / " + (wp.estimatedTime || 0) + "h"}</div>
                <div>{pill(pr, prioColor[pr])}</div>
              </div>
            );
          })}
        </div>
      </div>
      </>)}
    </div>
  );
}

  return { TrackerPage };
})();
