window.MonitoringModule = (function () {
  const e = React.createElement;
  const { useState, useEffect, useMemo, useCallback } = React;

  // Dark theme mirrors ui-tracker so both modules feel like one product.
  const T = {
    bgMain: "#0B0F14", card: "#121820", cardAlt: "#11161C",
    headerBg: "#151B23", hover: "#171F28",
    border: "#263244", divider: "#232A36",
    text1: "#E6EAF1", text2: "#A7B1C2", text3: "#6B7280",
    info: "#3B82F6", success: "#22C55E", warning: "#F59E0B",
    danger: "#EF4444", high: "#F97316",
  };

  // Configurable alert thresholds (PRD §20). count = occurrences per window.
  const THRESHOLDS = { critical: 50, high: 20, warning: 5 };
  function severityOf(count) {
    if (count > THRESHOLDS.critical) return "critical";
    if (count > THRESHOLDS.high) return "high";
    if (count > THRESHOLDS.warning) return "warning";
    return "info";
  }
  const SEV = {
    critical: { color: T.danger, icon: "\u25CF", label: "CRITICAL" },
    high: { color: T.high, icon: "\u25B2", label: "HIGH" },
    warning: { color: T.warning, icon: "\u25C6", label: "WARNING" },
    info: { color: T.info, icon: "\u25CB", label: "INFO" },
  };

  const fmtTime = (ts) => (ts ? String(ts).slice(11, 19) : "--:--:--");
  const shortMsg = (c) => (c.message || c.ctx || "(no message)").slice(0, 80);

  // "2026-09-08T11:41:34" → "08 Sep 2026, 11:41:34" (date + time, readable).
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  function fmtTs(ts) {
    if (!ts) return "\u2014";
    const [date, time] = String(ts).split("T");
    const [y, m, dd] = (date || "").split("-");
    return dd + " " + (MON[+m - 1] || m) + " " + y + ", " + (time || "").slice(0, 8);
  }

  // Aggregate stats across ALL runs (for the summary card above View All Runs).
  function summarizeRuns(runs) {
    if (!runs.length) return null;
    const totals = runs.map((r) => r.totalErrors);
    const truncated = runs.filter((r) => r.truncated).length;
    const svc = {};
    const cat = {};
    for (const r of runs)
      for (const c of r.categories || []) {
        svc[c.service] = (svc[c.service] || 0) + c.count;
        const key = c.service + " | " + (c.message || c.ctx || "");
        const entry = (cat[key] = cat[key] || { service: c.service, message: c.message || c.ctx || "(no message)", count: 0, runsSeen: 0, lastSeen: null });
        entry.count += c.count;
        entry.runsSeen += 1;
        if (!entry.lastSeen || r.ts > entry.lastSeen) entry.lastSeen = r.ts;
      }
    const allCats = Object.values(cat).sort((a, b) => b.count - a.count);
    const topCat = allCats[0] ? [allCats[0].service + " | " + allCats[0].message, allCats[0].count] : ["\u2014", 0];
    const topSvc = Object.entries(svc).sort((a, b) => b[1] - a[1])[0] || ["\u2014", 0];
    return {
      runCount: runs.length,
      first: runs[runs.length - 1].ts,
      last: runs[0].ts,
      sum: totals.reduce((a, b) => a + b, 0),
      peak: Math.max(...totals),
      avg: Math.round(totals.reduce((a, b) => a + b, 0) / runs.length),
      truncated,
      services: Object.keys(svc).length,
      topService: topSvc,
      topCategory: topCat,
      allCategories: allCats,
    };
  }

  // Derive everything the dashboard needs from the raw runs array.
  function derive(runs, selectedTs) {
    if (!runs.length) return null;
    const foundIndex = selectedTs && selectedTs !== "latest" ? runs.findIndex((r) => r.ts === selectedTs) : 0;
    const runIndex = foundIndex >= 0 ? foundIndex : 0;
    const latest = runs[runIndex];
    const prev = runs[runIndex + 1] || null;
    const cats = (latest.categories || [])
      .slice()
      .sort((a, b) => b.count - a.count);

    // Service health: aggregate counts per service in latest window.
    const svcMap = {};
    for (const c of cats) {
      const s = (svcMap[c.service] = svcMap[c.service] || { service: c.service, count: 0 });
      s.count += c.count;
    }
    const prevSvc = {};
    if (prev)
      for (const c of prev.categories || [])
        prevSvc[c.service] = (prevSvc[c.service] || 0) + c.count;
    const services = Object.values(svcMap)
      .map((s) => {
        const rate = s.count / (latest.windowMinutes || 5);
        const before = prevSvc[s.service];
        const trend = before == null ? "\u2192" : s.count > before ? "\u2191" : s.count < before ? "\u2193" : "\u2192";
        const status = s.count > THRESHOLDS.critical ? "Critical" : s.count > THRESHOLDS.high ? "Warning" : s.count > THRESHOLDS.warning ? "Warning" : "Info";
        return { ...s, rate, trend, status };
      })
      .sort((a, b) => b.count - a.count);

    // Alerts = actionable categories above warning threshold.
    const prevCat = {};
    if (prev)
      for (const c of prev.categories || [])
        prevCat[c.service + "|" + c.message] = c.count;
    const alerts = cats
      .filter((c) => c.count > THRESHOLDS.warning)
      .map((c) => {
        const sev = severityOf(c.count);
        const before = prevCat[c.service + "|" + c.message];
        const growth = before ? Math.round(((c.count - before) / before) * 100) : null;
        return { ...c, sev, growth };
      })
      .sort((a, b) => b.count - a.count);

    // System status from worst alert.
    let sysStatus = "Healthy";
    if (alerts.some((a) => a.sev === "critical")) sysStatus = "Critical";
    else if (alerts.some((a) => a.sev === "high")) sysStatus = "Degraded";
    else if (alerts.some((a) => a.sev === "warning")) sysStatus = "Warning";
    else if (!cats.length) sysStatus = "Healthy";

    const errorRate = latest.totalErrors / (latest.windowMinutes || 5);
    const critServices = services.filter((s) => s.status === "Critical").length;
    const critAlerts = alerts.filter((a) => a.sev === "critical" || a.sev === "high").length;
    const totalDelta = prev && prev.totalErrors
      ? Math.round(((latest.totalErrors - prev.totalErrors) / prev.totalErrors) * 100)
      : null;

    // Trend series: last 12 runs (chronological).
    const trend = runs.slice(0, 12).reverse().map((r) => ({ ts: r.ts, total: r.totalErrors }));

    return {
      latest, prev, cats, services, alerts, sysStatus,
      errorRate, critServices, critAlerts, totalDelta, trend,
    };
  }

  // ── small view helpers ──────────────────────────────────────────────
  function Card(props, ...children) {
    return e("div", {
      style: {
        background: T.card, border: "1px solid " + T.border, borderRadius: 10,
        padding: 16, ...(props.style || {}),
      },
    }, ...children);
  }
  function CardTitle(text, right) {
    return e("div", {
      style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    },
      e("div", { style: { fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.text2 } }, text),
      right ? e("div", { style: { fontSize: 11, color: T.text3 } }, right) : null,
    );
  }

  function StatusPill(status) {
    const map = { Healthy: T.success, Warning: T.warning, Degraded: T.high, Critical: T.danger, Unknown: T.text3 };
    const color = map[status] || T.text3;
    return e("div", { style: { display: "flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 600, color: T.text1 } },
      e("span", { style: { width: 9, height: 9, borderRadius: "50%", background: color, boxShadow: "0 0 8px " + color } }),
      e("span", null, "System " + status),
    );
  }

  function KpiCard(label, value, sub, accent) {
    return Card({ style: { padding: 14 } },
      e("div", { style: { fontSize: 10.5, letterSpacing: 0.6, textTransform: "uppercase", color: T.text3, marginBottom: 8 } }, label),
      e("div", { style: { fontSize: 26, fontWeight: 700, color: T.text1, lineHeight: 1 } }, value),
      sub ? e("div", { style: { fontSize: 11, color: accent || T.text2, marginTop: 6 } }, sub) : null,
    );
  }

  // Inline SVG area trend — no chart lib.
  function TrendChart(series) {
    if (series.length < 2)
      return e("div", { style: { color: T.text3, fontSize: 12, padding: "24px 0" } },
        "Not enough historical data \u2014 trend appears once more runs exist.");
    const W = 640, H = 160, pad = 8;
    const max = Math.max(...series.map((p) => p.total), 1);
    const x = (i) => pad + (i * (W - 2 * pad)) / (series.length - 1);
    const y = (v) => H - pad - (v / max) * (H - 2 * pad);
    const line = series.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.total).toFixed(1)).join(" ");
    const area = line + " L" + x(series.length - 1).toFixed(1) + " " + (H - pad) + " L" + x(0).toFixed(1) + " " + (H - pad) + " Z";
    return e("div", null,
      e("svg", { viewBox: "0 0 " + W + " " + H, width: "100%", height: 160, preserveAspectRatio: "none", role: "img", "aria-label": "Error trend, peak " + max },
        e("defs", null, e("linearGradient", { id: "mg", x1: 0, y1: 0, x2: 0, y2: 1 },
          e("stop", { offset: "0%", stopColor: T.info, stopOpacity: 0.35 }),
          e("stop", { offset: "100%", stopColor: T.info, stopOpacity: 0 }))),
        e("path", { d: area, fill: "url(#mg)" }),
        e("path", { d: line, fill: "none", stroke: T.info, strokeWidth: 2 }),
      ),
      e("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 10, color: T.text3, marginTop: 4 } },
        e("span", null, fmtTime(series[0].ts)),
        e("span", null, "peak " + max),
        e("span", null, fmtTime(series[series.length - 1].ts)),
      ),
    );
  }

  function severityChip(sev) {
    const s = SEV[sev];
    return e("span", {
      style: { display: "inline-flex", alignItems: "center", gap: 5, fontSize: 10, fontWeight: 700, letterSpacing: 0.4, color: s.color },
    }, e("span", null, s.icon), e("span", null, s.label));
  }

  // ── detail drawer (pure render function, NO hooks — parent owns Escape) ──
  function renderDrawer(item, onClose) {
    if (!item) return null;
    const field = (label, val) => e("div", { style: { marginBottom: 14 } },
      e("div", { style: { fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: T.text3, marginBottom: 3 } }, label),
      e("div", { style: { fontSize: 13, color: T.text1, wordBreak: "break-word" } }, val),
    );
    return e("div", {
      onClick: onClose,
      style: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 60, display: "flex", justifyContent: "flex-end" },
    },
      e("div", {
        onClick: (ev) => ev.stopPropagation(),
        role: "dialog", "aria-label": "Error detail",
        style: { width: 460, maxWidth: "90vw", height: "100%", background: T.cardAlt, borderLeft: "1px solid " + T.border, overflowY: "auto", padding: 20 },
      },
        e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 } },
          e("div", { style: { fontSize: 12, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.text2 } }, "Error Detail"),
          e("button", { onClick: onClose, "aria-label": "Close", style: { background: "none", border: "none", color: T.text2, fontSize: 20, cursor: "pointer" } }, "\u00D7"),
        ),
        e("div", { style: { fontSize: 15, fontWeight: 600, color: T.text1, marginBottom: 16, wordBreak: "break-word" } }, item.message || item.ctx || "(no message)"),
        e("div", { style: { marginBottom: 12 } }, severityChip(item.sev || severityOf(item.count))),
        field("Service", item.service),
        item.ctx ? field("Context", item.ctx) : null,
        field("Occurrences", String(item.count)),
        item.growth != null ? field("Change vs previous", (item.growth >= 0 ? "\u2191" : "\u2193") + Math.abs(item.growth) + "%") : null,
        (function () {
          const a = (window.ErrorAnalyzer && window.ErrorAnalyzer.analyze(item.service, item.message)) || null;
          if (!a) return null;
          const box = (label, val, color) => e("div", { style: { marginBottom: 10 } },
            e("div", { style: { fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: color || T.text3, marginBottom: 3 } }, label),
            e("div", { style: { fontSize: 12.5, color: T.text1, lineHeight: 1.45, wordBreak: "break-word" } }, val));
          return e("div", { style: { background: T.card, border: "1px solid " + T.border, borderRadius: 8, padding: "12px 14px", margin: "4px 0 16px" } },
            e("div", { style: { fontSize: 11, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", color: T.text2, marginBottom: 10 } }, "\uD83D\uDD0D Analysis"),
            box("What", a.what),
            box("Why it happens", a.why),
            box("Recommended fix", a.fix, T.warning));
        })(),
        field("Raw message", e("code", { style: { fontSize: 11, color: T.text2, whiteSpace: "pre-wrap" } }, item.message || "\u2014")),
      ),
    );
  }

  // ── main view ───────────────────────────────────────────────────────
  // ALL hooks at the top — no early returns before hook declarations.
  function MonitoringView() {
    const [state, setState] = useState({ loading: true, error: null, runs: [] });
    const [search, setSearch] = useState("");
    const [svcFilter, setSvcFilter] = useState("all");
    const [selectedTs, setSelectedTs] = useState("latest");
    const [showAllErrors, setShowAllErrors] = useState(false);
    const [drawer, setDrawer] = useState(null);

    // Escape closes drawer — hook always registered (React #310 fix).
    useEffect(() => {
      if (!drawer) return;
      const h = (ev) => { if (ev.key === "Escape") setDrawer(null); };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [drawer]);

    const load = useCallback(async () => {
      try {
        const r = await fetch("/api/monitoring/errors");
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "load failed");
        setState({ loading: false, error: null, runs: j.runs || [] });
      } catch (err) {
        setState({ loading: false, error: err.message, runs: [] });
      }
    }, []);
    useEffect(() => { load(); }, [load]);

    const d = useMemo(() => derive(state.runs, selectedTs), [state.runs, selectedTs]);
    const summary = useMemo(() => summarizeRuns(state.runs), [state.runs]);

    if (state.loading)
      return e("div", { style: { padding: 40, color: T.text2, background: T.bgMain, minHeight: "100%" } }, "Loading monitoring data\u2026");
    if (state.error)
      return e("div", { style: { padding: 40, background: T.bgMain, minHeight: "100%", color: T.text1 } },
        e("div", { style: { fontSize: 15, marginBottom: 8 } }, "Unable to load monitoring data"),
        e("div", { style: { fontSize: 12, color: T.text3, marginBottom: 16 } }, state.error),
        e("button", { onClick: load, style: btn() }, "Retry"));
    if (!d)
      return e("div", { style: { padding: 40, background: T.bgMain, minHeight: "100%", color: T.text2 } },
        "No errors detected. The monitoring dataset is empty.");

    const svcOptions = ["all"].concat(d.services.map((s) => s.service));
    const q = search.trim().toLowerCase();
    const matchCat = (c) =>
      (svcFilter === "all" || c.service === svcFilter) &&
      (!q || (c.message + " " + c.service + " " + c.ctx).toLowerCase().includes(q));
    const recent = d.cats.filter(matchCat).slice(0, 12);
    const alerts = d.alerts.filter(matchCat);
    const topCats = d.cats.filter(matchCat).slice(0, 8);
    const topMax = Math.max(...topCats.map((c) => c.count), 1);

    return e("div", { style: { background: T.bgMain, minHeight: "100%", color: T.text1, padding: 20, boxSizing: "border-box" } },
      // Header
      e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 } },
        e("div", { style: { fontSize: 20, fontWeight: 700 } }, "Error Monitoring"),
        e("div", { style: { textAlign: "right" } },
          StatusPill(d.sysStatus),
          e("div", { style: { fontSize: 11, color: T.text3, marginTop: 4 } }, "Snapshot " + fmtTs(d.latest.ts)),
        ),
      ),
      // Filter bar
      e("div", { style: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 } },
        e("select", { value: selectedTs, onChange: (ev) => setSelectedTs(ev.target.value), title: "View a past run", style: input(240) },
          e("option", { value: "latest" }, "Latest run"),
          state.runs.map((r) => e("option", { key: r.ts, value: r.ts },
            fmtTs(r.ts) + " \u00B7 " + r.totalErrors + (r.truncated ? "+" : "")))),
        e("select", { value: svcFilter, onChange: (ev) => setSvcFilter(ev.target.value), style: input(160) },
          svcOptions.map((s) => e("option", { key: s, value: s }, s === "all" ? "All Services" : s))),
        e("input", { value: search, onChange: (ev) => setSearch(ev.target.value), placeholder: "Search errors\u2026", style: { ...input(260), flex: 1, minWidth: 180 } }),
        selectedTs !== "latest" ? e("button", { onClick: () => setSelectedTs("latest"), title: "Back to latest", style: btn() }, "\u2192 Latest") : null,
        e("button", { onClick: load, title: "Refresh", "aria-label": "Refresh", style: btn() }, "\u21BB"),
      ),
      // Truncation warning
      d.latest.truncated ? e("div", {
        style: { background: "rgba(245,158,11,0.12)", border: "1px solid " + T.warning, borderRadius: 8, padding: "10px 14px", marginBottom: 14, fontSize: 12.5, color: T.text1 },
      },
        e("span", { style: { fontWeight: 700, color: T.warning } }, "\u26A0 " + d.latest.totalErrors + "+ errors detected. "),
        "Collector hit its Loki line cap during this window; counts/categories are partial until the next non-truncated run.",
      ) : null,
      // KPI grid
      e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginBottom: 14 } },
        KpiCard("Total Errors", (d.latest.truncated ? "\u003E" : "") + d.latest.totalErrors,
          d.totalDelta != null ? (d.totalDelta >= 0 ? "\u2191 " : "\u2193 ") + Math.abs(d.totalDelta) + "% vs previous" : null,
          d.totalDelta > 0 ? T.danger : T.success),
        KpiCard("Error Rate", (d.latest.truncated ? "\u003E" : "") + Math.round(d.errorRate) + " / min", "window " + d.latest.windowMinutes + "m"),
        KpiCard("Affected Services", String(d.services.length), d.critServices ? d.critServices + " critical" : null, d.critServices ? T.danger : T.text2),
        KpiCard("Active Alerts", String(d.alerts.length), d.critAlerts ? d.critAlerts + " critical/high" : null, d.critAlerts ? T.danger : T.text2),
      ),
      // Trend + Service Health
      e("div", { style: { display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 12, marginBottom: 14 } },
        Card({}, CardTitle("Error Trend", d.trend.length + " runs"), TrendChart(d.trend)),
        Card({}, CardTitle("Service Health"),
          e("div", null, d.services.slice(0, 8).map((s) =>
            e("div", { key: s.service, style: { display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 8, alignItems: "center", padding: "6px 0", borderBottom: "1px solid " + T.divider, fontSize: 12 } },
              e("span", { style: { color: T.text1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, s.service),
              e("span", { style: { color: T.text2, textAlign: "right" } }, s.count),
              e("span", { style: { color: T.text3, textAlign: "right" } }, s.rate.toFixed(1) + "/m"),
              e("span", { style: { color: statusColor(s.status), fontWeight: 600, textAlign: "right", minWidth: 60 } }, s.trend + " " + s.status),
            ))),
        ),
      ),
      // Active Alerts + Top Categories
      e("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 } },
        Card({}, CardTitle("Active Alerts"),
          alerts.length ? alerts.slice(0, 8).map((a, i) =>
            e("div", { key: i, style: { padding: "10px 0", borderBottom: "1px solid " + T.divider } },
              severityChip(a.sev),
              e("div", { style: { fontSize: 13, fontWeight: 600, color: T.text1, margin: "5px 0 3px", wordBreak: "break-word" } }, shortMsg(a)),
              e("div", { style: { fontSize: 11, color: T.text3 } },
                a.service + " \u00B7 " + a.count + " occurrences" + (a.growth != null ? " \u00B7 " + (a.growth >= 0 ? "\u2191" : "\u2193") + Math.abs(a.growth) + "%" : "")),
              e("button", { onClick: () => setDrawer(a), style: { ...linkBtn(), marginTop: 6 } }, "Investigate \u2192"),
            ))
            : e("div", { style: { color: T.text3, fontSize: 12, padding: "12px 0" } }, "No active alerts. Everything looks healthy."),
        ),
        Card({}, CardTitle("Top Error Categories"),
          topCats.length ? topCats.map((c, i) =>
            e("div", { key: i, onClick: () => setDrawer(c), style: { padding: "6px 0", cursor: "pointer" } },
              e("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 12, color: T.text1, marginBottom: 3 } },
                e("span", { style: { overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", marginRight: 8 } }, shortMsg(c)),
                e("span", { style: { color: T.text2, fontWeight: 600 } }, c.count)),
              e("div", { style: { height: 6, background: T.headerBg, borderRadius: 3, overflow: "hidden" } },
                e("div", { style: { height: "100%", width: (c.count / topMax) * 100 + "%", background: SEV[severityOf(c.count)].color } }))),
            )
            : e("div", { style: { color: T.text3, fontSize: 12, padding: "12px 0" } }, "No categories match."),
        ),
      ),
      // View all runs (+ aggregate summary across every run)
      Card({}, CardTitle("View All Runs", String(state.runs.length) + " total"),
        summary ? e("div", { style: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10, marginBottom: 12 } },
          [
            ["Period", fmtTs(summary.first).slice(0, 11) + " \u2192 " + fmtTs(summary.last).slice(0, 11)],
            ["Total errors (all runs)", summary.sum.toLocaleString()],
            ["Avg / run", summary.avg.toLocaleString()],
            ["Peak run", summary.peak.toLocaleString() + (summary.truncated ? " (" + summary.truncated + " truncated)" : "")],
            ["Services seen", String(summary.services)],
            ["Top service", summary.topService[0] + " \u00B7 " + summary.topService[1].toLocaleString()],
            ["Top error", summary.topCategory[0].slice(0, 60) + " \u00B7 " + summary.topCategory[1].toLocaleString()],
          ].map(([label, val]) =>
            e("div", { key: label, style: { background: T.bgMain, border: "1px solid " + T.border, borderRadius: 8, padding: "8px 10px" } },
              e("div", { style: { fontSize: 10, color: T.text3, textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 3 } }, label),
              e("div", { style: { fontSize: 12, fontWeight: 600, wordBreak: "break-word" } }, val))),
        ) : null,
        // Top errors aggregated across ALL runs (filterable, top 30 by default).
        summary ? (function () {
          const q2 = search.trim().toLowerCase();
          const filtered = summary.allCategories.filter((c) =>
            (svcFilter === "all" || c.service === svcFilter) &&
            (!q2 || (c.message + " " + c.service).toLowerCase().includes(q2)));
          const shown = showAllErrors ? filtered : filtered.slice(0, 30);
          return e("div", { style: { marginBottom: 14 } },
            e("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 } },
              e("div", { style: { fontSize: 13, fontWeight: 600, color: T.text2 } },
                "Top Errors \u00B7 All Runs " + (showAllErrors ? "(" + filtered.length + ")" : "(top 30 of " + filtered.length + ")")),
              filtered.length > 30 ? e("button", { onClick: () => setShowAllErrors((v) => !v), style: btn() },
                showAllErrors ? "Show top 30" : "Show all") : null),
            e("div", { style: { maxHeight: 320, overflow: "auto", border: "1px solid " + T.border, borderRadius: 8 } },
              e("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
                e("thead", null, e("tr", { style: { color: T.text3, textAlign: "left", position: "sticky", top: 0, background: T.card } },
                  ["#", "Service", "Error", "Total", "Runs", "Last seen"].map((h) =>
                    e("th", { key: h, style: { padding: "6px 8px", borderBottom: "1px solid " + T.border, fontWeight: 600 } }, h)))),
                e("tbody", null, shown.length ? shown.map((c, i) =>
                  e("tr", {
                    key: c.service + i,
                    onClick: () => setDrawer(c),
                    style: { cursor: "pointer", borderBottom: "1px solid " + T.divider },
                    onMouseEnter: (ev) => (ev.currentTarget.style.background = T.hover),
                    onMouseLeave: (ev) => (ev.currentTarget.style.background = "transparent"),
                  },
                    e("td", { style: { ...td(), color: T.text3 } }, String(i + 1)),
                    e("td", { style: td() }, c.service),
                    e("td", { style: { ...td(), maxWidth: 440, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }, title: c.message }, c.message),
                    e("td", { style: { ...td(), fontWeight: 600 } }, c.count.toLocaleString()),
                    e("td", { style: td() }, String(c.runsSeen)),
                    e("td", { style: { ...td(), color: T.text3 } }, fmtTs(c.lastSeen)),
                  )) : e("tr", null, e("td", { colSpan: 6, style: { ...td(), color: T.text3 } }, "No errors match."))),
              )),
          );
        })() : null,
        e("div", { style: { maxHeight: 260, overflow: "auto" } },
          e("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
            e("thead", null, e("tr", { style: { color: T.text3, textAlign: "left" } },
              ["Timestamp", "Total", "Window", "Truncated", "Categories"].map((h) =>
                e("th", { key: h, style: { padding: "6px 8px", borderBottom: "1px solid " + T.border, fontWeight: 600 } }, h)))),
            e("tbody", null, state.runs.map((r) =>
              e("tr", {
                key: r.ts,
                onClick: () => setSelectedTs(r.ts),
                style: { cursor: "pointer", borderBottom: "1px solid " + T.divider, background: selectedTs === r.ts ? "rgba(59,130,246,0.10)" : "transparent" },
                onMouseEnter: (ev) => (ev.currentTarget.style.background = selectedTs === r.ts ? "rgba(59,130,246,0.14)" : T.hover),
                onMouseLeave: (ev) => (ev.currentTarget.style.background = selectedTs === r.ts ? "rgba(59,130,246,0.10)" : "transparent"),
              },
                e("td", { style: td() }, fmtTs(r.ts)),
                e("td", { style: td() }, String(r.totalErrors) + (r.truncated ? "+" : "")),
                e("td", { style: td() }, String(r.windowMinutes) + "m"),
                e("td", { style: td() }, r.truncated ? "Yes" : "No"),
                e("td", { style: td() }, String((r.categories || []).length)),
              )),
            ),
          )),
      ),
      // Recent Errors
      Card({}, CardTitle("Recent Errors"),
        e("div", { style: { overflowX: "auto" } },
          e("table", { style: { width: "100%", borderCollapse: "collapse", fontSize: 12 } },
            e("thead", null, e("tr", { style: { color: T.text3, textAlign: "left" } },
              ["Time", "Service", "Error", "Count", "Severity"].map((h) =>
                e("th", { key: h, style: { padding: "6px 8px", borderBottom: "1px solid " + T.border, fontWeight: 600 } }, h)))),
            e("tbody", null, recent.map((c, i) => {
              const sev = severityOf(c.count);
              return e("tr", { key: i, onClick: () => setDrawer(c),
                style: { cursor: "pointer", borderBottom: "1px solid " + T.divider },
                onMouseEnter: (ev) => (ev.currentTarget.style.background = T.hover),
                onMouseLeave: (ev) => (ev.currentTarget.style.background = "transparent") },
                e("td", { style: td() }, fmtTime(d.latest.ts)),
                e("td", { style: td() }, c.service),
                e("td", { style: { ...td(), maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" } }, shortMsg(c)),
                e("td", { style: td() }, c.count),
                e("td", { style: td() }, severityChip(sev)),
              );
            })),
          )),
      ),
      renderDrawer(drawer, () => setDrawer(null)),
    );
  }

  const statusColor = (s) => (s === "Critical" ? T.danger : s === "Warning" ? T.warning : T.info);
  const td = () => ({ padding: "7px 8px", color: T.text2 });
  const input = (w) => ({ background: T.headerBg, border: "1px solid " + T.border, borderRadius: 6, padding: "7px 10px", fontSize: 12, color: T.text1, outline: "none", fontFamily: "inherit", width: w });
  const btn = () => ({ background: T.headerBg, border: "1px solid " + T.border, borderRadius: 6, padding: "7px 12px", fontSize: 13, color: T.text1, cursor: "pointer" });
  const linkBtn = () => ({ background: "none", border: "none", color: T.info, fontSize: 12, fontWeight: 600, cursor: "pointer", padding: 0 });

  return { MonitoringView };
})();
