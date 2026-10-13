// ui-cost.js — Dashboard v2 Cost page (AWS cost CSV/XLSX parse). Extracted 2026-10-13.
window.CostModule = (function () {
// ── Cost sub-page: upload AWS cost export (CSV/XLSX), parse in-browser ──
// ponytail: CSV native parser (no dep); XLSX via CDN SheetJS. No fabricated numbers.
function parseCsv(text) {
  // RFC-4180-ish: handles quoted fields, commas/newlines inside quotes, "" escape.
  const rows = [];
  let row = [], field = "", inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQ = false;
      } else field += c;
    } else {
      if (c === '"') inQ = true;
      else if (c === ",") { row.push(field); field = ""; }
      else if (c === "\r") { /* skip */ }
      else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  // drop trailing empty rows
  while (rows.length && rows[rows.length - 1].every((x) => String(x).trim() === "")) rows.pop();
  return rows;
}
// ponytail: strip currency/commas/parens-as-negative; keep real negatives (credits).
function parseNum(v) {
  if (v == null) return NaN;
  let s = String(v).trim();
  if (!s) return NaN;
  let neg = false;
  if (/^\(.*\)$/.test(s)) { neg = true; s = s.slice(1, -1); }
  s = s.replace(/[^0-9.\-]/g, "");
  if (s === "" || s === "-" || s === ".") return NaN;
  let n = Number(s);
  if (!isFinite(n)) return NaN;
  return neg ? -n : n;
}
function CostDashboard() {
  const [data, setData] = React.useState(null); // { headers, rows, fileName }
  const [err, setErr] = React.useState("");

  const card = { background: "var(--elevated-bg)", border: "1px solid var(--border-1)", borderRadius: 10, padding: 16 };
  const kpiVal = { fontSize: 26, fontWeight: 700, color: "var(--text-1)", lineHeight: 1.1 };
  const kpiLbl = { fontSize: 11, color: "var(--text-3)", marginTop: 4, textTransform: "uppercase", letterSpacing: 0.4 };
  const secTitle = { fontSize: 12, fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 12 };
  const ACCENTS = ["#6ea8fe", "#63e6be", "#ffd43b", "#ff8787", "#b197fc", "#ffa94d", "#74c0fc", "#8ce99a"];
  const colorFor = (i) => ACCENTS[i % ACCENTS.length];
  const fmt = (n) => (isFinite(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—");

  // matrix = array-of-arrays (header row + data rows). Normalize to {headers, rows}.
  function ingest(matrix, fileName) {
    const clean = (matrix || []).filter((r) => r && r.some((c) => String(c == null ? "" : c).trim() !== ""));
    if (clean.length < 2) { setErr("File has no data rows."); setData(null); return; }
    const headers = clean[0].map((h) => String(h == null ? "" : h).trim());
    const rows = clean.slice(1);
    setErr("");
    setData({ headers, rows, fileName });
  }

  function onFile(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const isX = /\.xlsx$/i.test(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        if (isX) {
          if (!window.XLSX) { setErr("XLSX library not loaded (offline?)"); setData(null); return; }
          const wb = window.XLSX.read(new Uint8Array(ev.target.result), { type: "array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const matrix = window.XLSX.utils.sheet_to_json(ws, { header: 1 });
          ingest(matrix, file.name);
        } else {
          ingest(parseCsv(String(ev.target.result)), file.name);
        }
      } catch (ex) {
        setErr("Parse failed: " + (ex && ex.message ? ex.message : String(ex)));
        setData(null);
      }
    };
    reader.onerror = () => { setErr("Could not read file."); setData(null); };
    if (isX) reader.readAsArrayBuffer(file);
    else reader.readAsText(file);
  }

  // derive metrics from parsed data
  const model = React.useMemo(() => {
    if (!data) return null;
    const { headers, rows } = data;
    const n = headers.length;
    // numeric columns = any col where a majority of data cells parse as numbers
    const numericCols = [];
    for (let c = 0; c < n; c++) {
      let ok = 0, tot = 0;
      for (const r of rows) { const v = r[c]; if (String(v == null ? "" : v).trim() !== "") { tot++; if (isFinite(parseNum(v))) ok++; } }
      if (tot > 0 && ok / tot >= 0.6) numericCols.push(c);
    }
    // service/name col = first non-numeric column (fallback col 0)
    let nameCol = 0;
    for (let c = 0; c < n; c++) { if (!numericCols.includes(c)) { nameCol = c; break; } }
    // identify a 'Total costs' column (if present) and month columns = numeric cols that aren't the total col
    const lc = headers.map((h) => h.toLowerCase());
    let totalColIdx = -1;
    for (const c of numericCols) { if (/total/.test(lc[c])) { totalColIdx = c; break; } }
    const monthCols = numericCols.filter((c) => c !== totalColIdx);

    // detect a 'Total costs' summary data row (name col matches /total/)
    let summaryRowIdx = -1;
    for (let i = rows.length - 1; i >= 0; i--) {
      if (/total/i.test(String(rows[i][nameCol] || ""))) { summaryRowIdx = i; break; }
    }
    const serviceRows = rows.filter((_, i) => i !== summaryRowIdx);

    // per-month sums over service rows
    const monthSums = monthCols.map((c) => serviceRows.reduce((a, r) => { const v = parseNum(r[c]); return a + (isFinite(v) ? v : 0); }, 0));
    const monthLabels = monthCols.map((c) => headers[c] || ("col" + c));

    // per-service total (use total col if present else sum of month cols)
    const services = serviceRows.map((r) => {
      const name = String(r[nameCol] == null ? "" : r[nameCol]).trim() || "(unnamed)";
      let tot;
      if (totalColIdx >= 0) { tot = parseNum(r[totalColIdx]); }
      else { tot = monthCols.reduce((a, c) => { const v = parseNum(r[c]); return a + (isFinite(v) ? v : 0); }, 0); }
      return { name, total: isFinite(tot) ? tot : 0, cells: monthCols.map((c) => parseNum(r[c])) };
    });

    // net total: prefer summary row's total col, else total col sum, else month sums sum
    let net;
    if (summaryRowIdx >= 0 && totalColIdx >= 0) net = parseNum(rows[summaryRowIdx][totalColIdx]);
    if (!isFinite(net)) net = services.reduce((a, s) => a + s.total, 0);
    const gross = services.reduce((a, s) => a + (s.total > 0 ? s.total : 0), 0);
    const credits = services.reduce((a, s) => a + (s.total < 0 ? s.total : 0), 0); // negative or 0
    const nMonths = monthCols.length;
    const avg = nMonths ? net / nMonths : net;

    return { headers, nameCol, monthCols, monthLabels, monthSums, services, net, gross, credits, nMonths, avg, totalColIdx, summaryRowIdx };
  }, [data]);

  if (!data || !model) {
    return (
      <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--app-bg)", padding: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Cost — AWS Billing</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>net of credits/discounts</div>
          <span style={{ display: "inline-block", marginTop: 8, padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#F59E0B", background: "#F59E0B22", border: "1px solid #F59E0B55" }}>costs.csv • AWS Cost Explorer</span>
        </div>
        <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 40 }}>
          <div style={{ color: "var(--text-2)", fontSize: 14 }}>Upload AWS cost export (CSV or XLSX)</div>
          <input type="file" accept=".csv,.xlsx" onChange={onFile}
            style={{ color: "var(--text-3)", fontSize: 12 }} />
          {err ? <div style={{ color: "#ff8787", fontSize: 12 }}>{err}</div> : null}
        </div>
      </div>
    );
  }

  const topServices = [...model.services].sort((a, b) => Math.abs(b.total) - Math.abs(a.total)).slice(0, 7);
  const topMax = Math.max(1, ...topServices.map((s) => Math.abs(s.total)));
  const monthMax = Math.max(1, ...model.monthSums.map((v) => Math.abs(v)));

  const kpis = [
    { v: fmt(model.net), l: "Net Total" },
    { v: fmt(model.gross), l: "Gross" },
    { v: fmt(model.credits), l: "Credits" },
    { v: fmt(model.avg), l: "Avg / Month" },
    { v: String(model.nMonths), l: "# Months" },
  ];

  return (
    <div style={{ flex: 1, minHeight: 0, overflow: "auto", background: "var(--app-bg)", padding: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text-1)" }}>Cost — AWS Billing</div>
          <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2 }}>net of credits/discounts</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ padding: "3px 10px", borderRadius: 6, fontSize: 11, color: "#F59E0B", background: "#F59E0B22", border: "1px solid #F59E0B55" }}>costs.csv • AWS Cost Explorer</span>
          <span style={{ fontSize: 11, color: "var(--text-3)" }}>{data.fileName}</span>
          <input type="file" accept=".csv,.xlsx" onChange={onFile} style={{ color: "var(--text-3)", fontSize: 11 }} />
        </div>
      </div>
      {err ? <div style={{ color: "#ff8787", fontSize: 12, marginBottom: 12 }}>{err}</div> : null}
      {model.net !== model.gross ? (
        <div style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 12 }}>
          Net differs from Gross — credits/negative values present ({fmt(model.credits)}).
        </div>
      ) : null}

      {/* KPI strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}>
        {kpis.map((k) => (
          <div key={k.l} style={card}>
            <div style={kpiVal}>{k.v}</div>
            <div style={kpiLbl}>{k.l}</div>
          </div>
        ))}
      </div>

      {/* Monthly column chart */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={secTitle}>Monthly Cost</div>
        {model.monthCols.length === 0 ? (
          <div style={{ fontSize: 12, color: "var(--text-3)" }}>No monthly columns detected.</div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 140 }}>
            {model.monthSums.map((v, i) => {
              const h = Math.round((Math.abs(v) / monthMax) * 110) + 4;
              return (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                  <div style={{ fontSize: 10, color: "var(--text-2)" }}>{fmt(v)}</div>
                  <div style={{ width: "100%", height: h, background: v < 0 ? "#ff8787" : colorFor(i), borderRadius: "4px 4px 0 0" }} />
                  <div style={{ fontSize: 10, color: "var(--text-3)", textAlign: "center", wordBreak: "break-word" }}>{model.monthLabels[i]}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top services horizontal bars */}
      <div style={{ ...card, marginBottom: 16 }}>
        <div style={secTitle}>Top Services</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {topServices.map((s, i) => {
            const w = Math.round((Math.abs(s.total) / topMax) * 100);
            return (
              <div key={s.name + i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 160, fontSize: 11, color: "var(--text-2)", textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</div>
                <div style={{ flex: 1, height: 16, background: "var(--border-1)", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ width: w + "%", height: "100%", background: s.total < 0 ? "#ff8787" : colorFor(i) }} />
                </div>
                <div style={{ width: 90, fontSize: 11, color: "var(--text-1)", textAlign: "right" }}>{fmt(s.total)}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Breakdown table */}
      <div style={card}>
        <div style={secTitle}>Breakdown</div>
        <div style={{ overflow: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", padding: "6px 8px", color: "var(--text-3)", borderBottom: "1px solid var(--border-1)" }}>Service</th>
                {model.monthLabels.map((m) => (
                  <th key={m} style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-3)", borderBottom: "1px solid var(--border-1)", whiteSpace: "nowrap" }}>{m}</th>
                ))}
                <th style={{ textAlign: "right", padding: "6px 8px", color: "var(--text-3)", borderBottom: "1px solid var(--border-1)" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {model.services.map((s, ri) => (
                <tr key={s.name + ri}>
                  <td style={{ padding: "6px 8px", color: "var(--text-2)", borderBottom: "1px solid var(--border-1)", whiteSpace: "nowrap", maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis" }}>{s.name}</td>
                  {s.cells.map((v, ci) => (
                    <td key={ci} style={{ padding: "6px 8px", textAlign: "right", color: v < 0 ? "#ff8787" : "var(--text-1)", borderBottom: "1px solid var(--border-1)" }}>{isFinite(v) ? fmt(v) : "—"}</td>
                  ))}
                  <td style={{ padding: "6px 8px", textAlign: "right", color: s.total < 0 ? "#ff8787" : "var(--text-1)", fontWeight: 600, borderBottom: "1px solid var(--border-1)" }}>{fmt(s.total)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td style={{ padding: "6px 8px", color: "var(--text-1)", fontWeight: 700 }}>Net Total</td>
                {model.monthSums.map((v, i) => (
                  <td key={i} style={{ padding: "6px 8px", textAlign: "right", color: v < 0 ? "#ff8787" : "var(--text-1)", fontWeight: 700 }}>{fmt(v)}</td>
                ))}
                <td style={{ padding: "6px 8px", textAlign: "right", color: "var(--text-1)", fontWeight: 700 }}>{fmt(model.net)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

  return { CostDashboard };
})();
