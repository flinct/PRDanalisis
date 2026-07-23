window.TrackerModule = (function(){
  const e = React.createElement;
  const DEFAULT_ROWS = [
    { id:'t1', owner:'Dany', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Breakdown error message', description:'Analisa existing flow', status:'in progress', progress:0, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
    { id:'t2', owner:'Dany', sourceSheet:'Sheet1', type:'milestone', parentTaskId:'t1', task:'Mapping error code', description:'Backend', status:'in progress', progress:20, version:'', difficulty:'', priority:'', week:'now', startDate:'', endDate:'' },
    { id:'t3', owner:'Dany', sourceSheet:'Sheet1', type:'milestone', parentTaskId:'t1', task:'Implement API', description:'', status:'new', progress:0, version:'', difficulty:'', priority:'', week:'last', startDate:'', endDate:'' },
    { id:'t4', owner:'Naftal', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Create new draft PRD referral system', description:'Draft PRD', status:'in progress', progress:70, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
    { id:'t5', owner:'Agung', sourceSheet:'Sheet1', type:'core', parentTaskId:'', task:'Conversation performance improve', description:'', status:'new', progress:0, version:'', difficulty:'', priority:'', week:'', startDate:'', endDate:'' },
  ];
  const STATUS_OPTIONS = ['new', 'waiting', 'in progress', 'complete', 'hold'];
  const TYPE_OPTIONS = ['core', 'milestone'];
  const DIFFICULTY_OPTIONS = ['easy', 'medium', 'hard'];
  const PRIORITY_OPTIONS = ['low', 'medium', 'high', 'critical'];
  const WEEK_OPTIONS = ['now', 'last'];

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

  function normalizePriority(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return PRIORITY_OPTIONS.includes(normalized) ? normalized : '';
  }

  function normalizeWeek(value) {
    const normalized = String(value || '').trim().toLowerCase();
    return WEEK_OPTIONS.includes(normalized) ? normalized : '';
  }

  function normalizeRow(row, index) {
    const type = TYPE_OPTIONS.includes(row?.type) ? row.type : 'core';
    return {
      id: row?.id || `row-${index + 1}`,
      owner: String(row?.owner || row?.name || ''),
      sourceSheet: String(row?.sourceSheet || row?.sheet_name || 'Sheet1'),
      sourceRowNumber: Number(row?.sourceRowNumber || 0),
      type,
      parentTaskId: type === 'milestone' ? String(row?.parentTaskId || row?.parentTask || row?.['Parent Task'] || '') : '',
      task: String(row?.task || row?.taskTitle || row?.['Task Title'] || ''),
      description: String(row?.description || row?.Description || ''),
      status: STATUS_OPTIONS.includes(String(row?.status || '').toLowerCase()) ? String(row?.status || '').toLowerCase() : 'new',
      progress: normalizeProgress(row?.progress),
      version: String(row?.version || row?.ver || ''),
      difficulty: DIFFICULTY_OPTIONS.includes(String(row?.difficulty || '').toLowerCase()) ? String(row?.difficulty || '').toLowerCase() : '',
      priority: normalizePriority(row?.priority),
      week: normalizeWeek(row?.week),
      startDate: normalizeDate(row?.startDate || row?.start),
      endDate: normalizeDate(row?.endDate || row?.end),
    };
  }

  function normalizeRows(rows) {
    const list = Array.isArray(rows) && rows.length ? rows.map(normalizeRow) : DEFAULT_ROWS.map(normalizeRow);
    const ids = new Set(list.map(row => row.id));
    return list.map(row => {
      if (row.type !== 'milestone') return row;
      if (!row.parentTaskId || !ids.has(row.parentTaskId) || row.parentTaskId === row.id) return { ...row, parentTaskId:'' };
      return row;
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

  function summarizeRows(rows) {
    const next = {
      total:rows.length,
      overall:0,
      new:0,
      waiting:0,
      'in progress':0,
      complete:0,
      hold:0,
      version:0,
      difficulty:0,
      difficulties:{ easy:0, medium:0, hard:0, unset:0 },
      priorities:{ low:0, medium:0, high:0, critical:0, unset:0 },
      weeks:{ now:0, last:0, unset:0 },
    };
    if (!rows.length) return next;
    let sum = 0;
    const versions = new Set();
    const difficulties = new Set();
    rows.forEach(row => {
      sum += getEffectiveProgress(row, rows);
      next[row.status] += 1;
      if (row.version) versions.add(row.version);
      if (row.difficulty) {
        difficulties.add(row.difficulty);
        if (next.difficulties[row.difficulty] !== undefined) next.difficulties[row.difficulty] += 1;
      } else next.difficulties.unset += 1;
      if (row.priority && next.priorities[row.priority] !== undefined) next.priorities[row.priority] += 1;
      else next.priorities.unset += 1;
      if (row.week && next.weeks[row.week] !== undefined) next.weeks[row.week] += 1;
      else next.weeks.unset += 1;
    });
    next.overall = sum / rows.length;
    next.version = versions.size;
    next.difficulty = difficulties.size;
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
      { id:'b', owner:'A', sourceSheet:'Alpha', type:'milestone', parentTask:'a', task:'Y', description:'', status:'complete', progress:100, priority:'high', week:'now' },
      { id:'c', owner:'A', sourceSheet:'Beta', type:'milestone', parentTaskId:'a', task:'Z', description:'', status:'new', progress:0, difficulty:'hard', week:'last' },
    ]);
    const moved = moveRow(rows, 'c', 'a');
    console.assert(rows[1].parentTaskId === 'a', 'tracker parent normalize failed');
    console.assert(moved[0].id === 'c', 'tracker moveRow failed');
    console.assert(getEffectiveProgress(rows[0], rows) === 50, 'tracker core milestone progress failed');
    console.assert(groupByOwner(rows)[0].summary.overall === 50, 'tracker summary overall failed');
    console.assert(groupByOwner(rows)[0].summary.priorities.high === 1, 'tracker priority summary failed');
    console.assert(groupByOwner(rows)[0].summary.weeks.now === 1, 'tracker week summary failed');
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

  function StatusBarChart({ summary }) {
    const rows = STATUS_OPTIONS.map(label => ({ label, value:summary[label] || 0 }));
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

  function DifficultyBarChart({ summary }) {
    const rows = [
      { label:'Easy', value:summary.difficulties.easy || 0, color:'#22c55e' },
      { label:'Medium', value:summary.difficulties.medium || 0, color:'#f59e0b' },
      { label:'Hard', value:summary.difficulties.hard || 0, color:'#ef4444' },
      { label:'Unset', value:summary.difficulties.unset || 0, color:'#64748b' },
    ];
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ height:220, display:'flex', alignItems:'flex-end', gap:16, padding:'16px 10px 8px', borderBottom:'1px solid var(--border-1)' } },
      ...rows.map(row => e('div', { key:row.label, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 } },
        e('div', { style:{ fontSize:14, fontWeight:800, color:'var(--text-2)' } }, row.value),
        e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${max ? (row.value / max) * 135 : 0}px`, minHeight:row.value ? 8 : 0, background:row.color, borderRadius:'8px 8px 0 0' } }),
        e('div', { style:{ fontSize:15, fontWeight:800, color:'var(--text-2)', textAlign:'center' } }, row.label)
      ))
    );
  }

  function PriorityBarChart({ summary }) {
    const rows = [
      { label:'Low', value:summary.priorities.low || 0, color:'#22c55e' },
      { label:'Medium', value:summary.priorities.medium || 0, color:'#f59e0b' },
      { label:'High', value:summary.priorities.high || 0, color:'#ef4444' },
      { label:'Critical', value:summary.priorities.critical || 0, color:'#7c3aed' },
      { label:'Unset', value:summary.priorities.unset || 0, color:'#64748b' },
    ];
    const max = Math.max(3, ...rows.map(row => row.value));
    return e('div', { style:{ height:220, display:'flex', alignItems:'flex-end', gap:16, padding:'16px 10px 8px', borderBottom:'1px solid var(--border-1)' } },
      ...rows.map(row => e('div', { key:row.label, style:{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:8 } },
        e('div', { style:{ fontSize:14, fontWeight:800, color:'var(--text-2)' } }, row.value),
        e('div', { title:`${row.label}: ${row.value}`, style:{ width:'100%', maxWidth:36, height:`${max ? (row.value / max) * 135 : 0}px`, minHeight:row.value ? 8 : 0, background:row.color, borderRadius:'8px 8px 0 0' } }),
        e('div', { style:{ fontSize:15, fontWeight:800, color:'var(--text-2)', textAlign:'center' } }, row.label)
      ))
    );
  }

  function buildProgressCards(summary) {
    return [
      ['Total', summary.total],
      ['New', summary.new],
      ['Waiting', summary.waiting],
      ['In Progress', summary['in progress']],
      ['Complete', summary.complete],
      ['Hold', summary.hold],
      ['Version', summary.version],
      ['Overall', formatPercent(summary.overall)],
    ];
  }

  function ProgressCardGrid({ card, summary }) {
    return e('div', { style:{ display:'grid', gridTemplateColumns:'repeat(8, minmax(0, 1fr))', gap:10 } },
      ...buildProgressCards(summary).map(([label, value]) => e('div', { key:label, style:card },
        e('div', { style:{ fontSize:24, fontWeight:700, color:'var(--text-1)', lineHeight:1.2 } }, value),
        e('div', { style:{ fontSize:11, color:'var(--text-4)', marginTop:4 } }, label)
      ))
    );
  }

  function WeekSplitTable({ rows, card }) {
    const milestoneRows = rows.filter(row => row.type === 'milestone');
    return e('div', { style:{ display:'grid', gridTemplateColumns:'minmax(0, 1fr)', gap:16, marginTop:16 } },
      ...['last', 'now'].map(week => {
        const items = milestoneRows.filter(row => row.week === week);
        const weekSummary = summarizeRows(items);
        const title = week === 'last' ? 'Last Week' : 'This Week';
        return e('div', { key:week, style:{ border:'1px solid var(--border-1)', borderRadius:12, overflow:'hidden', background:'var(--sidebar-bg)' } },
          e('div', { style:{ padding:'12px 14px', borderBottom:'1px solid var(--border-1)', fontSize:14, fontWeight:700, color:'var(--text-1)' } }, title),
          e('div', { style:{ padding:12, borderBottom:'1px solid var(--border-1)', overflowX:'auto' } },
            e('div', { style:{ minWidth:860 } },
              e(ProgressCardGrid, { card, summary:weekSummary })
            )
          ),
          e('div', { style:{ maxHeight:260, overflow:'auto' } },
            e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
              e('thead', null,
                e('tr', null,
                  ...['Task', 'Status', 'Priority', 'Progress'].map(label => e('th', { key:label, style:{ textAlign:'left', fontSize:11, color:'var(--text-4)', padding:'10px 8px', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase' } }, label))
                )
              ),
              e('tbody', null,
                ...((items.length ? items : [{ id:`empty-${week}`, task:'—', status:'—', priority:'—' }]).map(row => e('tr', { key:row.id },
                  e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)' } }, row.task || '—'),
                  e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', textTransform:'capitalize' } }, row.status || '—'),
                  e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)', textTransform:'capitalize' } }, row.priority || '—'),
                  e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', color:'var(--text-2)' } }, row.task === '—' ? '—' : formatPercent(getEffectiveProgress(row, milestoneRows)))
                )))
              )
            )
          )
        );
      })
    );
  }

  function StatSection({ shell, card, title, summary, countLabel, rows }) {
    const sectionShell = { ...shell, background:'#2e4976', padding:16 };
    return e('div', { style:sectionShell },
      e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', marginBottom:12 } },
        e('div', { style:{ fontSize:18, fontWeight:700, color:'var(--text-1)' } }, title),
        e('div', { style:{ fontSize:12, color:'var(--text-4)' } }, countLabel)
      ),
      e('div', { style:{ overflowX:'auto' } },
        e('div', { style:{ minWidth:860 } },
          e(ProgressCardGrid, { card, summary })
        )
      ),
      e('div', { style:{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:16, marginTop:16, alignItems:'stretch' } },
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Overall Project Progress'),
          e(DoughnutChart, { percent:summary.overall })
        ),
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Task Status'),
          e(StatusBarChart, { summary })
        ),
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Difficulty'),
          e(DifficultyBarChart, { summary })
        ),
        e('div', { style:{ ...shell, padding:16 } },
          e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Priority'),
          e(PriorityBarChart, { summary })
        )
      ),
      e(WeekSplitTable, { rows, card }),
      e('div', { style:{ ...shell, padding:16, marginTop:16, overflowX:'auto' } },
        e('div', { style:{ fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Task List'),
        e('table', { style:{ width:'100%', borderCollapse:'collapse' } },
          e('thead', null,
            e('tr', null,
              ...['Task', 'Description', 'Status', 'Difficulty', 'Priority', 'Progress'].map(label => e('th', { key:label, style:{ textAlign:'left', fontSize:11, color:'var(--text-4)', padding:'12px 8px', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase' } }, label))
            )
          ),
          e('tbody', null,
            ...rows.map(row => e('tr', { key:row.id },
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', minWidth:180, verticalAlign:'top', color:'var(--text-2)' } }, row.task || '—'),
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', minWidth:200, verticalAlign:'top', color:'var(--text-3)' } }, row.description || '—'),
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', width:120, color:'var(--text-2)', textTransform:'capitalize' } }, row.status),
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', width:100, color:'var(--text-2)', textTransform:'capitalize' } }, row.difficulty || '—'),
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', width:100, color:'var(--text-2)', textTransform:'capitalize' } }, row.priority || '—'),
              e('td', { style:{ padding:'10px 8px', borderBottom:'1px solid var(--border-1)', width:120, color:'var(--text-2)' } }, formatPercent(getEffectiveProgress(row, rows)))
            ))
          )
        )
      )
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

  function TrackerView({ user, onDirtyChange }) {
    const shell = { border:'1px solid var(--border-1)', borderRadius:16, background:'var(--sidebar-bg)', boxShadow:'0 18px 36px rgba(15,23,42,0.16)' };
    const card = { border:'1px solid var(--border-1)', borderRadius:12, background:'#06090F', padding:'14px 16px' };
    const inputStyle = { width:'100%', border:'1px solid var(--border-1)', borderRadius:10, background:'var(--app-bg)', color:'var(--text-1)', padding:'10px 12px', fontSize:12, outline:'none', fontFamily:'inherit' };
    const [rows, setRows] = React.useState(() => normalizeRows(DEFAULT_ROWS));
    const [savedJson, setSavedJson] = React.useState(JSON.stringify(normalizeRows(DEFAULT_ROWS)));
    const [meta, setMeta] = React.useState({ loading:true, saving:false, error:'', updatedAt:null, updatedBy:null, storage:'server', sheetTabs:[] });
    const [dragId, setDragId] = React.useState('');
    const [tab, setTab] = React.useState('statistics');
    const [selectedOwner, setSelectedOwner] = React.useState('');
    const [selectedSheet, setSelectedSheet] = React.useState('all');
    const [source, setSource] = React.useState({ loading:true, saving:false, error:'', source:'none', spreadsheetId:'', spreadsheetName:'', tabs:[], lockedByEnv:false, rootFolder:null, files:[], folders:[], selectedFolderId:'', availableTabs:[], selectedSpreadsheetId:'', selectedTabs:[] });
    const dirty = JSON.stringify(rows) !== savedJson;

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

    const ownerGroups = React.useMemo(() => groupByOwner(rows), [rows]);
    const coreOptions = React.useMemo(() => rows.filter(row => row.type === 'core' && row.task.trim()), [rows]);
    const sheetTabs = React.useMemo(() => collectSheetTabs(meta.sheetTabs, rows), [meta.sheetTabs, rows]);
    const statRows = React.useMemo(() => selectedSheet === 'all' ? rows : rows.filter(row => row.sourceSheet === selectedSheet), [rows, selectedSheet]);
    const visibleOwnerGroups = React.useMemo(() => groupByOwner(statRows), [statRows]);
    const visibleGroup = React.useMemo(() => visibleOwnerGroups.find(group => group.owner === selectedOwner) || null, [visibleOwnerGroups, selectedOwner]);
    const overallSummary = React.useMemo(() => summarizeRows(statRows), [statRows]);

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
      saveTrackerRows(rows, user?.name || user?.username || 'user').then(data => {
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

    return e('div', { style:{ display:'grid', gap:16, minHeight:0 } },
      e('div', { style:{ display:'flex', justifyContent:'space-between', gap:16, alignItems:'center', flexWrap:'wrap' } },
        e('div', { style:{ display:'flex', gap:8, flexWrap:'wrap' } },
          ['statistics', 'input'].map(id => e('button', {
            key:id,
            type:'button',
            onClick:() => setTab(id),
            style:{ border:'1px solid ' + (tab === id ? '#2563eb' : 'var(--border-1)'), background:tab === id ? '#2563eb' : 'var(--sidebar-bg)', color:tab === id ? '#fff' : 'var(--text-2)', borderRadius:999, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer', textTransform:'capitalize' }
          }, id === 'input' ? 'Input Table' : 'Statistics')),
          e('button', { type:'button', onClick:addRow, style:{ border:'1px solid var(--border-1)', background:'var(--sidebar-bg)', color:'var(--text-2)', borderRadius:999, padding:'8px 14px', fontSize:12, fontWeight:600, cursor:'pointer' } }, '+ Row')
        ),
        tab === 'input' ? e('button', { type:'button', disabled:meta.saving || !dirty, onClick:handleSave, style:{ border:'1px solid ' + ((!dirty || meta.saving) ? 'var(--border-1)' : '#0f766e'), background:(!dirty || meta.saving) ? 'var(--border-2)' : '#0f766e', color:(!dirty || meta.saving) ? 'var(--text-4)' : '#fff', borderRadius:999, padding:'9px 16px', fontSize:12, fontWeight:700, cursor:(!dirty || meta.saving) ? 'not-allowed' : 'pointer' } }, meta.saving ? 'Saving...' : 'Save') : null
      ),
      tab === 'input' ? sourceBox : null,
      meta.error ? e('div', { style:{ ...shell, padding:'10px 12px', color:'#fecaca', background:'#3b0d0d', borderColor:'#7f1d1d', fontSize:12 } }, meta.error) : null,
      e('div', { style:{ fontSize:11, color:'var(--text-4)' } }, statsSavedLabel),
      tab === 'statistics'
        ? e('div', { style:{ display:'grid', gap:18 } },
            e('div', { style:{ ...shell, padding:16 } },
              e('div', { style:{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:16, flexWrap:'wrap' } },
                e('div', null,
                  e('div', { style:{ fontSize:18, fontWeight:700, color:'var(--text-1)' } }, 'Sheet Selector'),
                  e('div', { style:{ fontSize:12, color:'var(--text-4)', marginTop:4 } }, 'Default tampil semua data. Click card buat filter statistik per sheet.')
                ),
                e('div', { style:{ display:'flex', gap:10, flexWrap:'wrap', justifyContent:'flex-end' } },
                  ...['all'].concat(sheetTabs).map(sheetName => {
                    const active = selectedSheet === sheetName;
                    const label = sheetName === 'all' ? 'All Sheets' : sheetName;
                    const count = sheetName === 'all' ? rows.length : rows.filter(row => row.sourceSheet === sheetName).length;
                    return e('button', {
                      key:sheetName,
                      type:'button',
                      onClick:() => setSelectedSheet(sheetName),
                      style:{ minWidth:140, textAlign:'left', border:'1px solid ' + (active ? '#2563eb' : 'var(--border-1)'), background:active ? '#1d4ed8' : 'var(--app-bg)', color:active ? '#fff' : 'var(--text-2)', borderRadius:14, padding:'12px 14px', cursor:'pointer' }
                    },
                      e('div', { style:{ fontSize:13, fontWeight:700 } }, label),
                      e('div', { style:{ fontSize:11, color:active ? 'rgba(255,255,255,0.82)' : 'var(--text-4)', marginTop:4 } }, `${count} rows`)
                    );
                  })
                )
              )
            ),
            e(StatSection, { shell, card, title:selectedSheet === 'all' ? 'All Sheets' : selectedSheet, summary:overallSummary, countLabel:`${statRows.length} rows`, rows:statRows }),
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
              visibleGroup ? e(StatSection, { shell, card, title:visibleGroup.owner, summary:visibleGroup.summary, countLabel:`${visibleGroup.rows.length} rows`, rows:visibleGroup.rows }) : null
            )
          )
        : e('div', { style:{ ...shell, overflow:'visible', minHeight:0 } },
            e('div', { style:{ overflowX:'auto', overflowY:'visible' } },
              e('table', { style:{ width:'100%', borderCollapse:'collapse', minWidth:1400 } },
                e('thead', null,
                  e('tr', { style:{ background:'var(--app-bg)' } },
                    ...['Owner', 'Sheet', 'Type', 'Parent Task', 'Task', 'Description', 'Status', 'Difficulty', 'Priority', 'Week', 'Progress', 'Version', 'Start', 'End', 'Action'].map(label => e('th', { key:label, style:{ textAlign:'left', padding:'12px 10px', fontSize:11, color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', textTransform:'uppercase', position:'sticky', top:0, background:'var(--app-bg)', zIndex:1 } }, label))
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
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.parentTaskId, onChange:ev => patchRow(row.id, 'parentTaskId', ev.target.value), style:inputStyle, disabled:row.type !== 'milestone' }, e('option', { value:'' }, row.type === 'milestone' ? 'Select parent' : 'N/A'), ...coreOptions.filter(option => option.id !== row.id).map(option => e('option', { key:option.id, value:option.id }, option.task || option.id)))) ,
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.task, onChange:ev => patchRow(row.id, 'task', ev.target.value), style:inputStyle })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('textarea', { value:row.description, onChange:ev => patchRow(row.id, 'description', ev.target.value), rows:2, style:{ ...inputStyle, minHeight:56, resize:'vertical' } })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.status, onChange:ev => patchRow(row.id, 'status', ev.target.value), style:inputStyle }, ...STATUS_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.difficulty, onChange:ev => patchRow(row.id, 'difficulty', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...DIFFICULTY_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.priority, onChange:ev => patchRow(row.id, 'priority', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...PRIORITY_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('select', { value:row.week, onChange:ev => patchRow(row.id, 'week', ev.target.value), style:inputStyle }, e('option', { value:'' }, 'Unset'), ...WEEK_OPTIONS.map(opt => e('option', { key:opt, value:opt }, opt)))),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:120 } }, e('input', { type:'number', min:0, max:100, step:1, value:row.progress, onChange:ev => patchRow(row.id, 'progress', ev.target.value), style:inputStyle })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('input', { value:row.version, onChange:ev => patchRow(row.id, 'version', ev.target.value), style:inputStyle })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.startDate, onChange:value => patchRow(row.id, 'startDate', value), inputStyle })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)', minWidth:150 } }, e(DateCell, { value:row.endDate, onChange:value => patchRow(row.id, 'endDate', value), inputStyle })),
                    e('td', { style:{ padding:'10px', borderBottom:'1px solid var(--border-1)' } }, e('button', { type:'button', onClick:() => removeRow(row.id), style:{ border:'1px solid #7f1d1d', background:'#3b0d0d', color:'#fecaca', borderRadius:10, padding:'8px 10px', fontSize:11, cursor:'pointer' } }, 'Delete'))
                  ))
                )
              )
            )
          )
    );
  }

  return { TrackerView };
})();
