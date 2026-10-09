window.WorkspaceModule = (function(){
function renderRoomsView({ WORKSPACE_SUB, workspaceNav, setWorkspaceNav }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', padding:'20px 28px', background:'var(--app-bg)' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
        <div>
          <div style={{ fontSize:20, fontWeight:700, color:'var(--text-1)' }}>Rooms</div>
          <div style={{ fontSize:11, color:'var(--text-4)' }}>{WORKSPACE_SUB.length} workspace items</div>
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', display:'grid', gap:10, alignContent:'start' }}>
        {WORKSPACE_SUB.map(item => (
          <div key={item.id} onClick={() => setWorkspaceNav(item.id)}
            style={{ padding:'16px 18px', borderRadius:10, background:'var(--sidebar-bg)', border:'1px solid var(--border-1)', cursor:'pointer', transition:'border 0.1s, background 0.1s, opacity 0.1s', borderColor: workspaceNav === item.id ? '#3b82f6' : 'var(--border-1)', opacity: workspaceNav && workspaceNav !== item.id ? 0.92 : 1 }}>
            <div style={{ fontSize:13, fontWeight:600, color:'var(--text-1)' }}>{item.label}</div>
            <div style={{ fontSize:10, color:'var(--text-4)', marginTop:4 }}>0 documents · 0 agents · now</div>
            <div style={{ display:'inline-block', marginTop:6, padding:'1px 8px', borderRadius:4, fontSize:9, background:'rgba(59,130,246,0.15)', color:'#60a5fa', border:'1px solid rgba(59,130,246,0.3)' }}>{item.id}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function renderWorkspaceSubView({ WORKSPACE_SUB, workspaceNav, setWorkspaceNav, tcStats, openFile }) {
  const sub = workspaceNav;
  const label = WORKSPACE_SUB.find(w => w.id === sub)?.label || sub;
  const statCard = { background:'var(--sidebar-bg)', border:'1px solid var(--border-1)', borderRadius:12, padding:12 };
  const topModules = (tcStats?.byModule || []).slice(0, 6);
  const typeRows = tcStats?.byType || [];
  const runRows = tcStats?.byLastRunStatus || [];
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--app-bg)' }}>
      <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border-1)', display:'flex', alignItems:'center', gap:12 }}>
        <button onClick={() => setWorkspaceNav(null)} style={{ fontSize:16, lineHeight:1, cursor:'pointer', background:'none', border:'none', color:'var(--text-4)', padding:'0' }}>←</button>
        <div><span style={{ fontSize:12, color:'var(--text-3)' }}>Workspace / </span><span style={{ fontSize:12, fontWeight:600, color:'var(--text-1)' }}>{label}</span></div>
      </div>
      {sub === 'testcase' ? (
        <div style={{ flex:1, overflow:'auto', padding:20, display:'grid', gap:12, alignContent:'start' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:12 }}>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Total</div><div style={{ marginTop:6, fontSize:24, fontWeight:700 }}>{tcStats?.total ?? '-'}</div></div>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Manual</div><div style={{ marginTop:6, fontSize:24, fontWeight:700 }}>{typeRows.find(x => x.tc_type === 'manual')?.n ?? 0}</div></div>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Auto</div><div style={{ marginTop:6, fontSize:24, fontWeight:700 }}>{typeRows.find(x => x.tc_type === 'auto')?.n ?? 0}</div></div>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>Last Run Status</div><div style={{ marginTop:6, fontSize:13, lineHeight:1.7, color:'var(--text-2)' }}>{runRows.length ? runRows.map(x => `${x.status}: ${x.n}`).join(' · ') : '-'}</div></div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1.4fr 1fr 1fr', gap:12 }}>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:8 }}>By Module</div><div style={{ display:'grid', gap:6 }}>{topModules.length ? topModules.map(row => <div key={row.module} style={{ display:'flex', justifyContent:'space-between', gap:8, fontSize:12 }}><span style={{ color:'var(--text-2)' }}>{row.module || '-'}</span><span style={{ color:'var(--text-1)', fontWeight:700 }}>{row.n}</span></div>) : <div style={{ fontSize:12, color:'var(--text-5)' }}>No data</div>}</div></div>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:8 }}>By Type</div><div style={{ display:'grid', gap:6 }}>{typeRows.length ? typeRows.map(row => <div key={row.tc_type} style={{ display:'flex', justifyContent:'space-between', gap:8, fontSize:12 }}><span style={{ color:'var(--text-2)' }}>{row.tc_type}</span><span style={{ color:'var(--text-1)', fontWeight:700 }}>{row.n}</span></div>) : <div style={{ fontSize:12, color:'var(--text-5)' }}>No data</div>}</div></div>
            <div style={statCard}><div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase', marginBottom:8 }}>By Last Run</div><div style={{ display:'grid', gap:6 }}>{runRows.length ? runRows.map(row => <div key={row.status} style={{ display:'flex', justifyContent:'space-between', gap:8, fontSize:12 }}><span style={{ color:'var(--text-2)' }}>{row.status}</span><span style={{ color:'var(--text-1)', fontWeight:700 }}>{row.n}</span></div>) : <div style={{ fontSize:12, color:'var(--text-5)' }}>No run data</div>}</div></div>
          </div>
        </div>
      ) : sub === 'prd' ? (
        <PrdAuthorView openFile={openFile} />
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-5)', fontSize:12 }}>
          {sub}: konten akan diisi sesuai item yang dipilih
        </div>
      )}
    </div>
  );
}

function PrdAuthorView({ openFile }) {
  const [groups, setGroups] = React.useState(null);
  const [activeTab, setActiveTab] = React.useState('yusril');
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');
  const [expanded, setExpanded] = React.useState({});

  React.useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch('/api/prd/authors')
      .then(r => { if (!r.ok) throw new Error('Failed to load'); return r.json(); })
      .then(d => { if (alive) { setGroups(d); setLoading(false); } })
      .catch(e => { if (alive) { setError(e.message); setLoading(false); } });
    return () => { alive = false; };
  }, []);

  const tabs = [
    { key: 'yusril', label: 'Yusril', color: '#f59e0b', icon: '\u{1F464}' },
    { key: 'dany', label: 'Dany / Hermes', color: '#8b5cf6', icon: '\u{1F916}' },
    { key: 'collab', label: 'Kolaborasi', color: '#10b981', icon: '\u{1F91D}' },
    { key: 'unknown', label: 'Unknown', color: '#6b7280', icon: '\u{2753}' },
  ];

  const currentFiles = groups ? (groups[activeTab] || []) : [];
  const totalFiles = groups ? Object.values(groups).reduce((s, g) => s + g.length, 0) : 0;

  const folderMap = {};
  currentFiles.forEach(f => {
    const parts = f.path.replace('PRD/', '').split('/');
    const folder = parts.length > 1 ? parts.slice(0, -1).join('/') : '(root)';
    if (!folderMap[folder]) folderMap[folder] = [];
    folderMap[folder].push(f);
  });
  const sortedFolders = Object.keys(folderMap).sort();

  const card = { background:'var(--sidebar-bg)', border:'1px solid var(--border-1)', borderRadius:10, padding:14 };

  function handleClickFile(f) {
    if (!openFile) return;
    openFile({ kind:'file', name:f.name, path:f.path, ext:'md' }, 'prd');
  }

  if (loading) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-4)', fontSize:13 }}>
      <span style={{ opacity:0.6 }}>Loading PRD classification\u2026</span>
    </div>
  );

  if (error) return (
    <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'#f87171', fontSize:13 }}>
      Error: {error}
    </div>
  );

  return (
    <div style={{ flex:1, overflow:'auto', padding:20, display:'flex', flexDirection:'column', gap:16 }}>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4, minmax(0, 1fr))', gap:10 }}>
        {tabs.map(t => (
          <div key={t.key} onClick={() => setActiveTab(t.key)}
            style={{ ...card, cursor:'pointer', borderColor: activeTab === t.key ? t.color : 'var(--border-1)', transition:'border-color 0.15s' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:18 }}>{t.icon}</span>
              <div>
                <div style={{ fontSize:11, color:'var(--text-4)', textTransform:'uppercase' }}>{t.label}</div>
                <div style={{ fontSize:22, fontWeight:700, color: t.color, marginTop:2 }}>{groups[t.key]?.length ?? 0}</div>
              </div>
            </div>
            <div style={{ fontSize:10, color:'var(--text-5)', marginTop:4 }}>
              {totalFiles > 0 ? Math.round((groups[t.key]?.length / totalFiles) * 100) : 0}% of {totalFiles}
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:4, borderBottom:'1px solid var(--border-1)', paddingBottom:0 }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding:'8px 16px', fontSize:12, fontWeight: activeTab === t.key ? 600 : 400,
              color: activeTab === t.key ? t.color : 'var(--text-4)',
              background:'none', border:'none', borderBottom: activeTab === t.key ? `2px solid ${t.color}` : '2px solid transparent',
              cursor:'pointer', transition:'all 0.15s', marginBottom:-1,
            }}>
            {t.icon} {t.label} ({groups[t.key]?.length ?? 0})
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gap:8 }}>
        {sortedFolders.length === 0 && (
          <div style={{ color:'var(--text-5)', fontSize:12, padding:20, textAlign:'center' }}>No PRD files in this group</div>
        )}
        {sortedFolders.map(folder => {
          const isOpen = expanded[folder] !== false;
          return (
            <div key={folder} style={{ ...card, padding:0, overflow:'hidden' }}>
              <div onClick={() => setExpanded(prev => ({ ...prev, [folder]: !isOpen }))}
                style={{ padding:'10px 14px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom: isOpen ? '1px solid var(--border-1)' : 'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span style={{ fontSize:10, color:'var(--text-5)', transform: isOpen ? 'rotate(90deg)' : 'none', transition:'transform 0.15s', display:'inline-block' }}>{'\u25B6'}</span>
                  <span style={{ fontSize:12, fontWeight:600, color:'var(--text-2)' }}>{folder}</span>
                </div>
                <span style={{ fontSize:11, color:'var(--text-5)' }}>{folderMap[folder].length} files</span>
              </div>
              {isOpen && (
                <div style={{ padding:'6px 0' }}>
                  {folderMap[folder].sort((a,b) => a.name.localeCompare(b.name)).map(f => (
                    <div key={f.path} onClick={() => handleClickFile(f)}
                      style={{ padding:'6px 14px 6px 32px', cursor:'pointer', fontSize:12, color:'var(--text-2)',
                        display:'flex', alignItems:'center', gap:8,
                        transition:'background 0.1s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize:11, opacity:0.5 }}>{'\u{1F4C4}'}</span>
                      <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{f.name.replace(/\.md$/i, '')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

return { renderRoomsView, renderWorkspaceSubView };
})();
