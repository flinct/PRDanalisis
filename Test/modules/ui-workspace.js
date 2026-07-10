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

function renderWorkspaceSubView({ WORKSPACE_SUB, workspaceNav, setWorkspaceNav, tcStats }) {
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
      ) : (
        <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-5)', fontSize:12 }}>
          {sub}: konten akan diisi sesuai item yang dipilih
        </div>
      )}
    </div>
  );
}
return { renderRoomsView, renderWorkspaceSubView };
})();
