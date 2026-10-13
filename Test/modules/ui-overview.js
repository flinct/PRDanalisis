// ui-overview.js — Dashboard v2 Overview page. Extracted from testcase-browser.html 2026-10-13.
// Shared tokens (DV2/dv2Card/dv2Root) read from window (exposed by host HTML).
window.OverviewModule = (function () {
// ── OverviewPage: replica of 'Project — Overview' canvas ──
// ponytail: static replica, wire real data later.
function OverviewPage({ onOpen }) {
    const DV2 = window.DV2, dv2Card = window.dv2Card, dv2SecTitle = window.dv2SecTitle, dv2Root = window.dv2Root;
  // KPI mini-card: label (muted) · big colored number · sub caption (muted)  — pen 'Project — Overview'
  const mini = (label, num, color, sub) => (
    <div key={label} style={{ flex: 1, minWidth: 0, background: DV2.PANEL, border: "1px solid " + DV2.BORDER, borderRadius: 8, padding: "14px 18px" }}>
      <div style={{ fontSize: 11, color: DV2.T3 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, marginTop: 6 }}>{num}</div>
      <div style={{ fontSize: 10, color: DV2.T3, marginTop: 6 }}>{sub}</div>
    </div>
  );
  const card = (title, children) => (
    <div style={{ ...dv2Card, marginBottom: 16 }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: DV2.T1, marginBottom: 14 }}>{title}</div>
      {children}
    </div>
  );
  const launch = (title, sub, key) => (
    <div key={title} style={{ flex: 1, minWidth: 0, ...dv2Card, display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: DV2.T1 }}>{title}</div>
      <div style={{ fontSize: 12, color: DV2.T3 }}>{sub}</div>
      <span onClick={() => onOpen && onOpen(key)} style={{ marginTop: 4, cursor: "pointer", color: DV2.INFO, fontSize: 13, fontWeight: 600 }}>Open</span>
    </div>
  );
  const feed = [
    "Auto-reply System moved to In Progress (Naftal, 2h ago)",
    "WA Group Mention milestone added (Dany, 5h ago)",
    "Broadcast v2 scheduled Oct W3 (Agung, 1d ago)",
    "API Rate Limiting closed (Naftal, 2d ago)",
  ];
  return (
    <div style={dv2Root}>
      {card("Roadmap — Oct 2026", (
        <div style={{ display: "flex", gap: 12 }}>
          {mini("Active Tasks", "5", DV2.GRN, "In Progress")}
          {mini("Planned", "3", DV2.INFO, "This month")}
          {mini("Overdue", "1", DV2.RED, "P0 blocked")}
          {mini("Capacity", "83%", DV2.ORG, "Dev 2.5/3")}
        </div>
      ))}
      {card("Tracker — This Week", (
        <div style={{ display: "flex", gap: 12 }}>
          {mini("Total Tasks", "162", DV2.INFO, "All sheets")}
          {mini("Complete", "104", DV2.GRN, "93.3% overall")}
          {mini("In Progress", "19", DV2.ORG, "5 owners")}
          {mini("Cost", "$4,290", DV2.TEAL, "AWS Oct")}
        </div>
      ))}
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        {launch("Roadmap", "Timeline & dependencies", "roadmap")}
        {launch("Tracker", "KPI charts & task stats", "tracker")}
        {launch("Cost", "AWS cost breakdown", "cost")}
      </div>
      <div style={dv2Card}>
        <div style={{ fontSize: 14, fontWeight: 700, color: DV2.T1, marginBottom: 14 }}>Recent Activity</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {feed.map((t) => (
            <div key={t} style={{ fontSize: 13, color: DV2.T2 }}><span style={{ color: DV2.INFO, marginRight: 8 }}>•</span>{t}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

  return { OverviewPage };
})();
