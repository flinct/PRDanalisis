window.TrackerModule = (function(){
  const e = React.createElement;
  const DEFAULT_SOURCE = `- Breakdown error message
    - Analisa existing flow -> 20%
    - Mapping error code
    - Implement API
    - QA Testing

- Global search dan autotagging
    - PRD -> 100%
    - Backend -> 40%
    - Frontend
    - QA

- Create new draft PRD referral system
    -> 70%

- Conversation performance improve`;

  function color(v) {
    if (v === 100) return '#2563eb';
    if (v >= 70) return '#16a34a';
    if (v >= 30) return '#eab308';
    if (v > 0) return '#f97316';
    return '#ef4444';
  }

  function parseTrackerText(text) {
    const tasks = [];
    let current = null;
    String(text || '').split(/\r?\n/).forEach(raw => {
      if (!raw.trim()) return;
      if (/^- /.test(raw)) {
        current = { name: raw.slice(2).trim(), children: [], parent: null, progress: 0 };
        tasks.push(current);
        return;
      }
      if (!current) return;
      if (/^\s+- /.test(raw)) {
        const row = raw.trim().slice(2);
        const match = row.match(/^(.*?)(?:\s*->\s*(\d+)%)?$/);
        current.children.push({ name: (match?.[1] || row).trim(), progress: match?.[2] ? Number(match[2]) : 0 });
        return;
      }
      const parentMatch = raw.trim().match(/^->\s*(\d+)%$/);
      if (parentMatch) current.parent = Number(parentMatch[1]);
    });
    tasks.forEach(task => {
      task.progress = task.children.length
        ? task.children.reduce((sum, child) => sum + child.progress, 0) / task.children.length
        : (task.parent || 0);
    });
    return tasks;
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

  function formatPercent(value) {
    return `${Number(value || 0).toFixed(1)}%`;
  }

  function DoughnutChart({ percent }) {
    const safe = Math.max(0, Math.min(100, Number(percent) || 0));
    const endDeg = (safe / 100) * 360;
    return e('div', { style:{ display:'grid', justifyItems:'center', gap:10 } },
      e('svg', { viewBox:'0 0 160 160', width:220, height:220, 'aria-label':'Overall Project Progress' },
        e('circle', { cx:80, cy:80, r:46, fill:'none', stroke:'#ec5b7c', strokeWidth:24 }),
        safe > 0 ? e('path', { d:arcPath(80, 80, 46, 0, endDeg), fill:'none', stroke:'#3b9be5', strokeWidth:24, strokeLinecap:'butt' }) : null,
        e('circle', { cx:80, cy:80, r:26, fill:'var(--sidebar-bg)' }),
        e('text', { x:80, y:80, textAnchor:'middle', dominantBaseline:'middle', fill:'var(--text-1)', fontSize:16, fontWeight:700 }, formatPercent(safe))
      ),
      e('div', { style:{ display:'flex', gap:18, flexWrap:'wrap', justifyContent:'center', fontSize:12, color:'var(--text-3)' } },
        e('div', { style:{ display:'flex', alignItems:'center', gap:6 } }, e('span', { style:{ width:10, height:10, borderRadius:2, background:'#3b9be5', display:'inline-block' } }), 'Completed'),
        e('div', { style:{ display:'flex', alignItems:'center', gap:6 } }, e('span', { style:{ width:10, height:10, borderRadius:2, background:'#ec5b7c', display:'inline-block' } }), 'Remaining')
      )
    );
  }

  function StatusBarChart({ done, progress, todo, total }) {
    const rows = [
      { label:'Done', value:done },
      { label:'Progress', value:progress },
      { label:'Todo', value:todo },
    ];
    const max = Math.max(3, total || 0, ...rows.map(row => row.value));
    const steps = 6;
    const gridValues = Array.from({ length:steps }, (_, idx) => ((steps - idx) * max) / steps);
    return e('div', { style:{ display:'grid', gap:8 } },
      e('div', { style:{ display:'flex', justifyContent:'center', gap:6, fontSize:12, color:'var(--text-3)' } },
        e('span', { style:{ width:10, height:10, borderRadius:2, background:'#8fd0f8', display:'inline-block', marginTop:2 } }),
        'Tasks'
      ),
      e('div', { style:{ display:'grid', gridTemplateColumns:'40px 1fr', gap:10, alignItems:'stretch' } },
        e('div', { style:{ position:'relative', height:220 } },
          ...gridValues.map(value => e('div', {
            key:`axis-${value}`,
            style:{ position:'absolute', left:0, right:0, top:`${((max - value) / max) * 100}%`, transform:'translateY(-50%)', fontSize:11, color:'var(--text-4)', textAlign:'right' }
          }, value.toFixed(1).replace('.', ',')))
        ),
        e('div', { style:{ position:'relative', height:220, borderLeft:'1px solid var(--border-1)', borderBottom:'1px solid var(--border-1)', padding:'0 16px 0 12px' } },
          ...gridValues.map(value => e('div', {
            key:`grid-${value}`,
            style:{ position:'absolute', left:12, right:16, top:`${((max - value) / max) * 100}%`, borderTop:'1px solid rgba(148,163,184,0.2)' }
          })),
          e('div', { style:{ position:'absolute', inset:'0 16px 0 12px', display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', alignItems:'end', gap:18 } },
            ...rows.map(row => e('div', { key:row.label, style:{ height:'100%', display:'flex', flexDirection:'column', justifyContent:'flex-end', alignItems:'center', gap:8 } },
              e('div', { style:{ width:'100%', maxWidth:54, height:`${max ? (row.value / max) * 180 : 0}px`, minHeight:row.value ? 10 : 0, background:'#8fd0f8', borderRadius:'8px 8px 0 0' } }),
              e('div', { style:{ fontSize:12, color:'var(--text-3)' } }, row.label)
            ))
          )
        )
      )
    );
  }

  function applyListShortcut(value, start, end, key) {
    const before = value.slice(0, start);
    const after = value.slice(end);
    const lineStart = before.lastIndexOf('\n') + 1;
    const line = value.slice(lineStart, start);
    const indent = (line.match(/^\s*/) || [''])[0];
    const bulletMatch = line.match(/^(\s*)-\s?.*$/);

    if (key === '-' && line.trim() === '') {
      return { value: `${before}- ${after}`, start: start + 2, end: start + 2 };
    }
    if (key === 'Enter' && bulletMatch) {
      return { value: `${before}\n${indent}- ${after}`, start: start + 3 + indent.length, end: start + 3 + indent.length };
    }
    if (key === 'Tab' && bulletMatch) {
      const nextValue = `${value.slice(0, lineStart)}    ${value.slice(lineStart)}`;
      return { value: nextValue, start: start + 4, end: end + 4 };
    }
    return null;
  }

  function selfCheck() {
    const dash = applyListShortcut('', 0, 0, '-');
    const enter = applyListShortcut('- item', 6, 6, 'Enter');
    const tab = applyListShortcut('- item', 6, 6, 'Tab');
    console.assert(dash && dash.value === '- ', 'tracker dash shortcut failed');
    console.assert(enter && enter.value === '- item\n- ', 'tracker enter shortcut failed');
    console.assert(tab && tab.value === '    - item', 'tracker tab shortcut failed');
  }
  selfCheck();

  function readTrackerLocal() {
    try {
      const raw = localStorage.getItem('qa_tracker_source');
      const source = typeof raw === 'string' && raw ? raw : DEFAULT_SOURCE;
      const updatedAt = localStorage.getItem('qa_tracker_updated_at') || null;
      const updatedBy = localStorage.getItem('qa_tracker_updated_by') || null;
      return { source, updatedAt, updatedBy };
    } catch {
      return { source: DEFAULT_SOURCE, updatedAt:null, updatedBy:null };
    }
  }

  function writeTrackerLocal(source, updatedBy) {
    const updatedAt = new Date().toISOString();
    try {
      localStorage.setItem('qa_tracker_source', source);
      localStorage.setItem('qa_tracker_updated_at', updatedAt);
      localStorage.setItem('qa_tracker_updated_by', updatedBy || 'user');
    } catch {}
    return { updatedAt, updatedBy: updatedBy || 'user' };
  }

  async function loadTrackerSource() {
    try {
      const response = await fetch('/api/tracker');
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('api unavailable');
      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || 'Load failed');
      return { source: data.source || DEFAULT_SOURCE, updatedAt: data.updatedAt || null, updatedBy: data.updatedBy || null, storage:'server' };
    } catch {
      const local = readTrackerLocal();
      return { ...local, storage:'local' };
    }
  }

  async function saveTrackerSource(source, updatedBy) {
    try {
      const response = await fetch('/api/tracker', {
        method:'PUT',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ source, updatedBy })
      });
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !contentType.includes('application/json')) throw new Error('api unavailable');
      const data = await response.json();
      if (!data?.ok) throw new Error(data?.error || 'Save failed');
      writeTrackerLocal(source, updatedBy);
      return { updatedAt:data.updatedAt || null, updatedBy:data.updatedBy || updatedBy || 'user', storage:'server' };
    } catch {
      const local = writeTrackerLocal(source, updatedBy);
      return { ...local, storage:'local' };
    }
  }

  function TrackerView({ user, onDirtyChange }) {
    const [source, setSource] = React.useState(DEFAULT_SOURCE);
    const [savedSource, setSavedSource] = React.useState(DEFAULT_SOURCE);
    const [meta, setMeta] = React.useState({ loading:true, saving:false, error:'', updatedAt:null, updatedBy:null, storage:'server' });
    const inputRef = React.useRef(null);
    const dirty = source !== savedSource;

    React.useEffect(() => {
      let active = true;
      loadTrackerSource()
        .then(data => {
          if (!active) return;
          const nextSource = data.source || DEFAULT_SOURCE;
          setSource(nextSource);
          setSavedSource(nextSource);
          setMeta({ loading:false, saving:false, error:'', updatedAt:data.updatedAt || null, updatedBy:data.updatedBy || null, storage:data.storage || 'server' });
        })
        .catch(err => {
          if (!active) return;
          setMeta({ loading:false, saving:false, error:'Load failed: ' + err.message, updatedAt:null, updatedBy:null, storage:'server' });
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

    const tasks = React.useMemo(() => parseTrackerText(source), [source]);
    const summary = React.useMemo(() => {
      const next = { total: tasks.length, done: 0, progress: 0, todo: 0, overall: 0 };
      if (!tasks.length) return next;
      let sum = 0;
      tasks.forEach(task => {
        sum += task.progress;
        if (task.progress === 100) next.done += 1;
        else if (task.progress === 0) next.todo += 1;
        else next.progress += 1;
      });
      next.overall = sum / tasks.length;
      return next;
    }, [tasks]);

    function handleSourceKeyDown(ev) {
      const next = applyListShortcut(source, ev.target.selectionStart, ev.target.selectionEnd, ev.key);
      if (!next) return;
      ev.preventDefault();
      setSource(next.value);
      requestAnimationFrame(() => {
        if (!inputRef.current) return;
        inputRef.current.selectionStart = next.start;
        inputRef.current.selectionEnd = next.end;
      });
    }

    function handleSave() {
      if (!dirty || meta.saving) return;
      setMeta(prev => ({ ...prev, saving:true, error:'' }));
      saveTrackerSource(source, user?.name || user?.username || 'user')
        .then(data => {
          setSavedSource(source);
          setMeta({ loading:false, saving:false, error:'', updatedAt:data.updatedAt || null, updatedBy:data.updatedBy || null, storage:data.storage || 'server' });
        })
        .catch(err => {
          setMeta(prev => ({ ...prev, saving:false, error:'Save failed: ' + err.message }));
        });
    }

    const shell = { background:'var(--sidebar-bg)', border:'1px solid var(--border-1)', borderRadius:12, boxShadow:'0 2px 8px rgba(15,23,42,0.04)' };
    const stat = { ...shell, padding:'14px 12px', textAlign:'center' };
    const track = { height:10, background:'var(--border-2)', borderRadius:999, overflow:'hidden', marginTop:8 };
    const saveDisabled = !dirty || meta.saving || meta.loading;
    const metaText = meta.loading
      ? 'Loading...'
      : meta.error
        ? meta.error
        : dirty
          ? 'Belum disimpan'
          : meta.updatedAt
            ? `Saved ${meta.updatedAt}${meta.updatedBy ? ` by ${meta.updatedBy}` : ''}${meta.storage === 'local' ? ' (local)' : ''}`
            : meta.storage === 'local'
              ? 'Sudah disimpan (local)'
              : 'Sudah disimpan';

    return e('div', { style:{ flex:1, overflow:'auto', padding:20, background:'var(--app-bg)' } },
      e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start', marginBottom:18 } },
        e('div', null,
          e('div', { style:{ fontSize:24, fontWeight:700, color:'var(--text-1)', marginBottom:6 } }, 'Tracker'),
          e('div', { style:{ fontSize:12, color:meta.error ? '#dc2626' : 'var(--text-4)' } }, metaText)
        ),
        e('button', {
          type:'button',
          disabled: saveDisabled,
          onClick: handleSave,
          style:{ border:'1px solid var(--border-1)', background:saveDisabled ? 'var(--border-2)' : '#2563eb', color:saveDisabled ? 'var(--text-4)' : '#fff', borderRadius:10, padding:'10px 16px', fontSize:12, fontWeight:600, cursor:saveDisabled ? 'not-allowed' : 'pointer' }
        }, meta.saving ? 'Saving...' : 'Save')
      ),
      e('div', { style:{ display:'grid', gridTemplateColumns:'380px minmax(0, 1fr)', gap:18, alignItems:'start' } },
        e('div', { style:{ ...shell, padding:16 } },
          e('textarea', {
            ref: inputRef,
            value: source,
            onChange: ev => setSource(ev.target.value),
            onKeyDown: handleSourceKeyDown,
            spellCheck: false,
            style:{ width:'100%', minHeight:700, resize:'vertical', fontFamily:'Consolas, monospace', fontSize:12, lineHeight:1.6, color:'var(--text-2)', background:'var(--app-bg)', border:'1px solid var(--border-1)', borderRadius:10, padding:12, outline:'none' }
          })
        ),
        e('div', null,
          e('div', { style:{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:10 } },
            ...[
              ['Total', summary.total],
              ['Done', summary.done],
              ['Progress', summary.progress],
              ['Todo', summary.todo],
              ['Overall', formatPercent(summary.overall)],
            ].map(([label, value]) => e('div', { key:label, style:stat },
              e('div', { style:{ fontSize:26, fontWeight:700, color:'var(--text-1)', lineHeight:1.2 } }, value),
              e('div', { style:{ fontSize:11, color:'var(--text-4)', marginTop:4 } }, label)
            ))
          ),
          e('div', { style:{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginTop:16 } },
            e('div', { style:{ ...shell, padding:16 } },
              e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Overall Project Progress'),
              e(DoughnutChart, { percent:summary.overall })
            ),
            e('div', { style:{ ...shell, padding:16 } },
              e('div', { style:{ textAlign:'center', fontSize:14, fontWeight:600, color:'var(--text-2)', marginBottom:12 } }, 'Task Status'),
              e(StatusBarChart, { done:summary.done, progress:summary.progress, todo:summary.todo, total:summary.total })
            )
          ),
          e('div', { style:{ ...shell, padding:16, marginTop:16 } },
            e('div', { style:{ fontSize:18, fontWeight:700, color:'var(--text-1)', marginBottom:12 } }, 'Tasks'),
            e('div', { style:{ display:'grid', gap:16 } },
              tasks.length
                ? tasks.map(task => e('div', { key:task.name },
                    e('div', { style:{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'baseline' } },
                      e('div', { style:{ fontSize:14, fontWeight:600, color:'var(--text-1)' } }, task.name),
                      e('div', { style:{ fontSize:12, color:'var(--text-3)' } }, formatPercent(task.progress))
                    ),
                    e('div', { style:track },
                      e('div', { style:{ width:`${task.progress}%`, height:'100%', background:color(Math.round(task.progress)) } })
                    ),
                    task.children.length
                      ? e('ul', { style:{ margin:'8px 0 0 18px', padding:0, color:'var(--text-3)', fontSize:12, lineHeight:1.6 } },
                          ...task.children.map(child => e('li', { key:`${task.name}-${child.name}` },
                            child.name,
                            ' ',
                            e('b', { style:{ color:'var(--text-1)' } }, `${child.progress}%`)
                          ))
                        )
                      : null
                  ))
                : e('div', { style:{ fontSize:12, color:'var(--text-5)' } }, 'Belum ada task.')
            )
          )
        )
      )
    );
  }

  return { TrackerView };
})();
