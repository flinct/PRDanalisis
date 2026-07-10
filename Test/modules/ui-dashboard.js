window.DashboardModule = (function(){
function OpenProjectDashboard() {
    // ponytail: single localStorage key holds the whole dashboard UI state so it survives tab switches. Split keys / migrate schema when we outgrow one blob.
    const OP_STATE_KEY = 'qa_openproject_dashboard_state_v1';
    const defaultFilters = { projectId:'7', versionIds:[], statusId:'', typeId:'', priorityId:'', assigneeId:'', sort:'updatedAt:desc', keyword:'', page:1, pageSize:100 };
    const [meta, setMeta] = useState({ loading:true, error:'', versions:[], statuses:[], types:[], priorities:[], sortOptions:[], assigneeNote:'' });
    const [filtersOpen, setFiltersOpen] = useState(() => {
      try { return JSON.parse(localStorage.getItem(OP_STATE_KEY) || '{}').filtersOpen || false; } catch { return false; }
    });
    const [statusSort, setStatusSort] = useState(() => {
      try { return JSON.parse(localStorage.getItem(OP_STATE_KEY) || '{}').statusSort || 'asc'; } catch { return 'asc'; }
    });
    const [filters, setFilters] = useState(() => {
      try { return { ...defaultFilters, ...(JSON.parse(localStorage.getItem(OP_STATE_KEY) || '{}').filters || {}) }; } catch { return defaultFilters; }
    });
    const [data, setData] = useState({ loading:false, error:'', total:0, count:0, workPackages:[], summary:{ byStatus:[], byType:[], byPriority:[] } });
    const [showScrollTop, setShowScrollTop] = useState(false);
    const dashboardRef = useRef(null);

    useEffect(() => {
      try { localStorage.setItem(OP_STATE_KEY, JSON.stringify({ filters, filtersOpen, statusSort })); } catch {}
    }, [filters, filtersOpen, statusSort]);

    useEffect(() => {
      let dead = false;
      (async () => {
        try {
          const r = await fetch(`/api/dashboard/openproject/meta?projectId=${filters.projectId}`);
          const d = await r.json();
          if (!r.ok || !d.ok) throw new Error(d.error || 'Failed to load dashboard metadata');
          if (dead) return;
          setMeta({ loading:false, error:'', ...d });
          setFilters(prev => ({
            ...prev,
            versionIds: prev.versionIds.length ? prev.versionIds : ((d.versions || []).slice(0, 1).map(v => String(v.id))),
          })); // ponytail: only seed when user hasn't already picked (persisted or manual).
        } catch (e) {
          if (!dead) setMeta({ loading:false, error:e.message, versions:[], statuses:[], types:[], priorities:[], sortOptions:[], assigneeNote:'' });
        }
      })();
      return () => { dead = true; };
    }, [filters.projectId]);

    useEffect(() => {
      if (!filters.versionIds.length) return;
      let dead = false;
      setData(prev => ({ ...prev, loading:true, error:'' }));
      (async () => {
        try {
          const params = new URLSearchParams();
          Object.entries(filters).forEach(([k, v]) => {
            if (k === 'versionIds') {
              if (v.length) params.set('versionIds', v.join(','));
              return;
            }
            if (v !== '' && v != null) params.set(k, String(v));
          });
          const r = await fetch('/api/dashboard/openproject/work-packages?' + params.toString());
          const d = await r.json();
          if (!r.ok || !d.ok) throw new Error(d.error || 'Failed to load work packages');
          if (!dead) setData({ loading:false, error:'', ...d });
        } catch (e) {
          if (!dead) setData(prev => ({ ...prev, loading:false, error:e.message }));
        }
      })();
      return () => { dead = true; };
    }, [filters]);

    useEffect(() => {
      const el = dashboardRef.current;
      if (!el) return;
      const onScroll = () => setShowScrollTop(el.scrollTop > 240);
      onScroll();
      el.addEventListener('scroll', onScroll);
      return () => el.removeEventListener('scroll', onScroll);
    }, []);

    function patchFilters(next) {
      setFilters(prev => ({ ...prev, ...next, page: Object.prototype.hasOwnProperty.call(next, 'page') ? next.page : 1 }));
    }

    function toggleVersion(id) {
      setFilters(prev => ({
        ...prev,
        page: 1,
        versionIds: prev.versionIds.includes(id)
          ? prev.versionIds.filter(v => v !== id)
          : [...prev.versionIds, id],
      }));
    }

    const miniInput = { width:'100%', background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px 10px', fontSize:12 };
    const skeleton = { background:'linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.12), rgba(255,255,255,0.06))', backgroundSize:'200% 100%', animation:'shimmer 1.2s ease-in-out infinite', borderRadius:6 };
    const card = { background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:12 };
    const selectedVersionNames = filters.versionIds.map(id => meta.versions.find(v => String(v.id) === String(id))?.name || id);
    const statusOrder = ['New', 'In specification', 'Specified', 'Confirmed', 'In progress', 'Waiting Merge Request', 'Developed', 'In testing', 'Tested', 'Test failed', 'Closed', 'On hold', 'Rejected'];
    const statusRank = new Map(statusOrder.map((name, idx) => [name.toLowerCase(), idx]));
    const byOpenProjectStatus = (left, right) => {
      const l = statusRank.get(String(left || '').toLowerCase());
      const r = statusRank.get(String(right || '').toLowerCase());
      if (l != null && r != null) return l - r;
      if (l != null) return -1;
      if (r != null) return 1;
      return String(left || '').localeCompare(String(right || ''), 'id', { sensitivity:'base' });
    };
    const groupedByStatus = Object.entries(((data.allWorkPackages || data.workPackages) || []).reduce((acc, row) => {
      const key = row.statusName || 'Unknown';
      (acc[key] ||= []).push(row);
      return acc;
    }, {})).sort((a, b) => byOpenProjectStatus(a[0], b[0]) * (statusSort === 'asc' ? 1 : -1));
    const statusSummary = [...(data.summary?.byStatus || [])].sort((a, b) => byOpenProjectStatus(a.key, b.key) * (statusSort === 'asc' ? 1 : -1));
    const statSections = [
      { title:'By Status', rows:statusSummary },
      { title:'By Type', rows:data.summary?.byType || [] },
      { title:'By Priority', rows:data.summary?.byPriority || [] },
    ];
    const skeletonGroups = statusSummary.length ? statusSummary.slice(0, 3).map(item => ({ name:item.key || 'Loading', count:item.count || 4 })) : [
      { name:'Loading', count:5 },
      { name:'Loading', count:4 },
      { name:'Loading', count:3 },
    ];

    return (
      <div ref={dashboardRef} style={{ padding:16, paddingBottom:96, display:'grid', gap:12, minHeight:'100%', overflow:'auto' }}>
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>

        <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
          <div style={{ display:'flex', gap:10, alignItems:'flex-start' }}>
            <button onClick={() => setFiltersOpen(v => !v)} title='Filters' style={{ ...miniInput, width:36, height:36, padding:0, display:'grid', placeItems:'center', cursor:'pointer', fontSize:16 }}>≡</button>
            <div>
              <div style={{ fontSize:20, fontWeight:700, color:'var(--text-1)' }}>OpenProject Dashboard</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginTop:4 }}>Work package by version. Filter from OpenProject live data.</div>
            </div>
          </div>
          {meta.assigneeNote ? <div style={{ fontSize:11, color:'#fbbf24', maxWidth:340, textAlign:'right' }}>{meta.assigneeNote}</div> : null}
        </div>

        {filtersOpen ? (
          <div style={{ ...card, display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
            <div style={{ gridColumn:'1 / -1', fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Version</div>
            <div style={{ gridColumn:'1 / -1', display:'flex', flexWrap:'wrap', gap:8 }}>
              {meta.versions.map(v => {
                const active = filters.versionIds.includes(String(v.id));
                return <button key={v.id} onClick={() => toggleVersion(String(v.id))} style={{ ...miniInput, width:'auto', cursor:'pointer', borderColor: active ? '#f59e0b' : 'var(--border-1)', color: active ? '#f59e0b' : 'var(--text-2)' }}>{v.name}</button>;
              })}
            </div>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Status
              <select value={filters.statusId} onChange={e => patchFilters({ statusId:e.target.value })} style={miniInput}>
                <option value=''>All status</option>
                {[...(meta.statuses || [])].sort((a, b) => String(a.name || '').localeCompare(String(b.name || ''), 'id', { sensitivity:'base' }) * -1).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Type
              <select value={filters.typeId} onChange={e => patchFilters({ typeId:e.target.value })} style={miniInput}>
                <option value=''>All type</option>
                {meta.types.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Priority
              <select value={filters.priorityId} onChange={e => patchFilters({ priorityId:e.target.value })} style={miniInput}>
                <option value=''>All priority</option>
                {meta.priorities.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Sort
              <select value={filters.sort} onChange={e => patchFilters({ sort:e.target.value })} style={miniInput}>
                {meta.sortOptions.map(v => <option key={v.value} value={v.value}>{v.label}</option>)}
              </select>
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Assignee ID
              <input value={filters.assigneeId} onChange={e => patchFilters({ assigneeId:e.target.value })} placeholder='contoh: 14' style={miniInput} />
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Keyword
              <input value={filters.keyword} onChange={e => patchFilters({ keyword:e.target.value })} placeholder='subject search' style={miniInput} />
            </label>
            <label style={{ display:'grid', gap:6, fontSize:11, color:'var(--text-3)' }}>Max Item
              <select value={filters.pageSize} onChange={e => patchFilters({ pageSize:Number(e.target.value), page:1 })} style={miniInput}>
                {[10,20,50,100].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </label>
          </div>
        ) : null}

        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
          <div style={card}><div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase' }}>Project</div><div style={{ fontSize:16, color:'var(--text-1)', marginTop:6 }}>SatuInbox</div></div>
          <div style={card}><div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase' }}>Total</div><div style={{ fontSize:16, color:'var(--text-1)', marginTop:6 }}>{data.total}</div></div>
          <div style={card}><div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase' }}>Shown</div><div style={{ fontSize:16, color:'var(--text-1)', marginTop:6 }}>{data.count}</div></div>
          <div style={card}><div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase' }}>Version</div><div style={{ fontSize:16, color:'var(--text-1)', marginTop:6 }}>{selectedVersionNames.length ? selectedVersionNames.join(', ') : '—'}</div></div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gap:10 }}>
          {statSections.map(section => (
            <div key={section.title} style={card}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                <div style={{ fontSize:11, color:'var(--text-4)' }}>{section.title}</div>
                {section.title === 'By Status' ? (
                  <button onClick={() => setStatusSort(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ background:'transparent', border:'none', color:'var(--text-4)', fontSize:11, cursor:'pointer', padding:0 }}>STATUS {statusSort === 'asc' ? '↑' : '↓'}</button>
                ) : null}
              </div>
              {data.loading ? Array.from({ length:4 }).map((_, idx) => (
                <div key={idx} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0' }}>
                  <div style={{ ...skeleton, height:12, width:'62%' }} />
                  <div style={{ ...skeleton, height:12, width:28 }} />
                </div>
              )) : section.rows.length ? section.rows.map(item => <div key={item.key} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-2)', padding:'4px 0' }}><span>{item.key}</span><span>{item.count}</span></div>) : <div style={{ fontSize:12, color:'var(--text-4)' }}>No data</div>}
            </div>
          ))}
        </div>

        <div style={card}>
          <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', marginBottom:12 }}>
            <button onClick={() => setStatusSort(prev => prev === 'asc' ? 'desc' : 'asc')} style={{ background:'transparent', border:'none', color:'var(--text-1)', fontSize:14, fontWeight:700, cursor:'pointer', padding:0 }}>Work Packages by Status · STATUS {statusSort === 'asc' ? '↑' : '↓'}</button>
          </div>
          {data.error ? <div style={{ fontSize:12, color:'#f87171' }}>{data.error}</div> : data.loading ? (
            <div style={{ display:'grid', gap:12 }}>
              {skeletonGroups.map((group, groupIdx) => (
                <div key={groupIdx} style={{ border:'1px solid var(--border-1)', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ padding:'10px 12px', background:'var(--sidebar-bg)', borderBottom:'1px solid var(--border-1)' }}>
                    <div style={{ ...skeleton, height:14, width:160 }} />
                  </div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, tableLayout:'fixed' }}>
                      <colgroup>
                        <col style={{ width:64 }} />
                        <col />
                        <col style={{ width:110 }} />
                        <col style={{ width:90 }} />
                        <col style={{ width:140 }} />
                        <col style={{ width:100 }} />
                        <col style={{ width:170 }} />
                      </colgroup>
                      <thead><tr>{['ID','Subject','Type','Priority','Assignee','Version','Updated'].map(h => <th key={h} style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', background:'var(--deep-bg)' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {Array.from({ length:Math.min(group.count || 4, 5) }).map((_, idx) => (
                          <tr key={idx} style={{ borderBottom:'1px solid var(--border-3)', background:idx % 2 ? 'var(--sidebar-bg)' : 'transparent' }}>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:36 }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'72%' }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'60%' }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'56%' }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'64%' }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'70%' }} /></td>
                            <td style={{ padding:'8px 10px' }}><div style={{ ...skeleton, height:12, width:'58%' }} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : !groupedByStatus.length ? <div style={{ fontSize:12, color:'var(--text-4)' }}>No work package found.</div> : (
            <div style={{ display:'grid', gap:12 }}>
              {groupedByStatus.map(([statusName, rows]) => (
                <div key={statusName} style={{ border:'1px solid var(--border-1)', borderRadius:8, overflow:'hidden' }}>
                  <div style={{ padding:'10px 12px', background:'var(--sidebar-bg)', borderBottom:'1px solid var(--border-1)', fontSize:12, color:'var(--text-1)', fontWeight:700 }}>{statusName} · {rows.length}</div>
                  <div style={{ overflowX:'auto' }}>
                    <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12, tableLayout:'fixed' }}>
                      <colgroup>
                        <col style={{ width:64 }} />
                        <col />
                        <col style={{ width:110 }} />
                        <col style={{ width:90 }} />
                        <col style={{ width:140 }} />
                        <col style={{ width:100 }} />
                        <col style={{ width:170 }} />
                      </colgroup>
                      <thead><tr>{['ID','Subject','Type','Priority','Assignee','Version','Updated'].map(h => <th key={h} style={{ textAlign:'left', padding:'8px 10px', color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', background:'var(--deep-bg)' }}>{h}</th>)}</tr></thead>
                      <tbody>
                        {rows.map((row, idx) => (
                          <tr key={row.id || idx} style={{ borderBottom:'1px solid var(--border-3)', background:idx % 2 ? 'var(--sidebar-bg)' : 'transparent' }}>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)' }}>{row.id}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-1)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={row.subject || ''}>{row.subject || '-'}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)' }}>{row.typeName || '-'}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)' }}>{row.priorityName || '-'}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={row.assigneeName || row.assigneeId || ''}>{row.assigneeName || row.assigneeId || '-'}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }} title={row.versionName || ''}>{row.versionName || '-'}</td>
                            <td style={{ padding:'8px 10px', color:'var(--text-2)' }}>{row.updatedAt || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display:'flex', justifyContent:'flex-end', gap:8, marginTop:12 }}>
            <button onClick={() => patchFilters({ page: Math.max(1, Number(filters.page) - 1) })} disabled={Number(filters.page) <= 1} style={{ ...miniInput, width:'auto', cursor:'pointer', opacity:Number(filters.page) <= 1 ? 0.5 : 1 }}>Prev</button>
            <div style={{ ...miniInput, width:'auto' }}>Page {filters.page}</div>
            <button onClick={() => patchFilters({ page: Number(filters.page) + 1 })} disabled={data.count < Number(filters.pageSize)} style={{ ...miniInput, width:'auto', cursor:'pointer', opacity:data.count < Number(filters.pageSize) ? 0.5 : 1 }}>Next</button>
          </div>
          {showScrollTop ? <button onClick={() => dashboardRef.current?.scrollTo({ top:0, behavior:'smooth' })} style={{ position:'fixed', right:24, bottom:56, zIndex:20, background:'var(--deep-bg)', color:'#f59e0b', border:'1px solid var(--border-1)', borderRadius:999, padding:'10px 14px', cursor:'pointer', boxShadow:'0 8px 24px rgba(0,0,0,0.35)' }}>Scroll to top</button> : null}
        </div>
      </div>
    );
  }

function TestcaseStatsDashboard({ stats }) {
    const byType = stats?.byType || [];
    const byFeature = stats?.byFeature || [];
    const recent = stats?.recent || [];
    const total = Number(stats?.total || 0);
    const automation = byType.filter(x => x.tc_type === 'automation').reduce((s, x) => s + Number(x.n || 0), 0);
    const manual = Math.max(0, total - automation);
    const automationRate = total ? automation / total : 0;
    const rateColor = automationRate > 0.7 ? '#22c55e' : automationRate >= 0.5 ? '#f59e0b' : '#ef4444';
    const circumference = 2 * Math.PI * 42;
    const autoArc = circumference * automationRate;
    const topFeatures = byFeature.slice(0, 8);
    return (
      <div style={{ padding:16, display:'grid', gap:12, minHeight:'100%', overflow:'auto' }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--text-1)' }}>Testcase Statistics</div>
          <div style={{ fontSize:12, color:'var(--text-4)', marginTop:4 }}>Source: SQLite `test_cases`</div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12 }}>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:12 }}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Total Testcases</div><div style={{ marginTop:6, fontSize:28, fontWeight:700 }}>{total}</div></div>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:12 }}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Automation Coverage</div><div style={{ marginTop:6, fontSize:28, fontWeight:700, color:rateColor }}>{Math.round(automationRate * 100)}%</div></div>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:12 }}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Manual</div><div style={{ marginTop:6, fontSize:28, fontWeight:700, color:'#60a5fa' }}>{manual}</div></div>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:12 }}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Automated</div><div style={{ marginTop:6, fontSize:28, fontWeight:700, color:'#22c55e' }}>{automation}</div></div>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'minmax(320px, 0.9fr) minmax(420px, 1.1fr)', gap:12 }}>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:12 }}>Manual vs Automation</div>
            <div style={{ display:'flex', alignItems:'center', gap:18 }}>
              <svg width="140" height="140" viewBox="0 0 120 120" aria-label="Manual vs Automation donut">
                <circle cx="60" cy="60" r="42" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="14" />
                <circle cx="60" cy="60" r="42" fill="none" stroke="#22c55e" strokeWidth="14" strokeDasharray={`${autoArc} ${circumference - autoArc}`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                <circle cx="60" cy="60" r="30" fill="var(--deep-bg)" />
                <text x="60" y="58" textAnchor="middle" fill="var(--text-1)" style={{ fontSize:18, fontWeight:700 }}>{Math.round(automationRate * 100)}%</text>
                <text x="60" y="74" textAnchor="middle" fill="var(--text-4)" style={{ fontSize:9 }}>auto</text>
              </svg>
              <div style={{ display:'grid', gap:10, flex:1 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#22c55e' }}>Automation</span><strong>{automation}</strong></div>
                <div style={{ height:8, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}><div style={{ width:`${automationRate * 100}%`, height:'100%', background:'#22c55e' }} /></div>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}><span style={{ color:'#60a5fa' }}>Manual</span><strong>{manual}</strong></div>
                <div style={{ height:8, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}><div style={{ width:`${(1 - automationRate) * 100}%`, height:'100%', background:'#60a5fa' }} /></div>
              </div>
            </div>
          </div>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:16 }}>
            <div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:12 }}>Automation Progress per Feature</div>
            <div style={{ display:'grid', gap:10 }}>
              {topFeatures.map(row => <div key={row.feature} style={{ display:'grid', gridTemplateColumns:'160px 1fr 48px', gap:10, alignItems:'center' }}><div style={{ fontSize:12, color:'var(--text-2)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{row.feature || '-'}</div><div style={{ height:8, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}><div style={{ width:`${Math.round((row.coverage || 0) * 100)}%`, height:'100%', background:'#22c55e' }} /></div><div style={{ fontSize:12, color:'var(--text-1)', textAlign:'right' }}>{Math.round((row.coverage || 0) * 100)}%</div></div>)}
            </div>
          </div>
        </div>
        <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:16 }}>
          <div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:12 }}>Feature Coverage</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr>{['Feature','Total','Manual','Automation','Coverage'].map(h => <th key={h} style={{ textAlign:h === 'Feature' ? 'left' : 'right', padding:'8px 10px', color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', fontWeight:600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {byFeature.map(row => <tr key={row.feature || 'unknown'}><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', color:'var(--text-2)' }}><div>{row.feature || '-'}</div><div style={{ marginTop:6, height:6, borderRadius:999, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}><div style={{ width:`${Math.round((row.coverage || 0) * 100)}%`, height:'100%', background:'#22c55e' }} /></div></td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', textAlign:'right' }}>{row.total}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', textAlign:'right', color:'#60a5fa' }}>{row.manual}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', textAlign:'right', color:'#22c55e' }}>{row.automation}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', textAlign:'right' }}>{Math.round((row.coverage || 0) * 100)}%</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
        <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:16 }}>
          <div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:12 }}>Recent Testcases</div>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
              <thead><tr>{['ID','Feature','Scenario','Type','Updated','Last Run'].map(h => <th key={h} style={{ textAlign:h === 'Scenario' ? 'left' : 'left', padding:'8px 10px', color:'var(--text-4)', borderBottom:'1px solid var(--border-1)', fontWeight:600 }}>{h}</th>)}</tr></thead>
              <tbody>
                {recent.map(row => <tr key={row.id}><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)' }}>{row.id}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', color:'var(--text-2)' }}>{row.module || '-'}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', maxWidth:520, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{row.scenario || '-'}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', color:row.tc_type === 'automation' ? '#22c55e' : '#60a5fa' }}>{row.tc_type}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', color:'var(--text-3)' }}>{row.updated_at || '-'}</td><td style={{ padding:'10px', borderBottom:'1px solid var(--border-2)', color:row.last_run_status === 'fail' ? '#ef4444' : 'var(--text-3)' }}>{row.last_run_status || '-'}</td></tr>)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }


  return { OpenProjectDashboard, TestcaseStatsDashboard };
})();
