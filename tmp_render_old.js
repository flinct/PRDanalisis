      const renderWorkflowGraph = () => {
        const workflows = setupCfg.parsed?.workflows;
        const agentsArr = setupCfg.parsed?.agents?.agents || [];
        const agentsMap = Object.fromEntries(agentsArr.map(a => [a.id, a]));
        const modes = workflows?.modes || {};
        const mode = modes[workflowModePick] || modes[Object.keys(modes)[0]];
        if (!mode) return <div style={{ ...card, fontSize:11, color:'var(--text-5)' }}>(workflow kosong)</div>;
        const isGraph = Array.isArray(mode.nodes) && Array.isArray(mode.edges);
        const panel = { background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:'10px 12px' };
        const typeStyle = (type) => ({
          trigger:{ bg:'#172554', bd:'#2563eb', fg:'#dbeafe' },
          agent:{ bg:'#1e1b4b', bd:'#8b5cf6', fg:'#ede9fe' },
          marker:{ bg:'#111827', bd:'#475569', fg:'#cbd5e1' },
          gate:{ bg:'#3f1d0b', bd:'#f59e0b', fg:'#fef3c7' },
        }[type] || { bg:'var(--deep-bg)', bd:'var(--border-1)', fg:'var(--text-2)' });
        const detailNode = workflowNodePick && isGraph ? (mode.nodes || []).find(n => n.id === workflowNodePick) : null;
        if (!isGraph) {
          return (
            <div style={card}>
              <div style={{ fontSize:11, color:'var(--text-3)', marginBottom:10, lineHeight:1.6 }}>
                Workflow ini masih format linear. Viewer graph butuh schema <code>workflow-v2</code>. Saat ini tampil fallback YAML.
              </div>
              {renderOrchTab('workflows', 'Lane builder, gate mapping, freeze, routing. Sumber: Setup/workflows.yaml.')}
            </div>
          );
        }
        if (workflowGraphLib.loading) return <div style={card}><div style={{ fontSize:11, color:'var(--text-5)' }}>Loading workflow viewer libs…</div></div>;
        if (workflowGraphLib.error) return <div style={card}><div style={{ fontSize:11, color:'#f87171' }}>⚠ {workflowGraphLib.error}</div></div>;
        if (!workflowGraphLib.ready || !window.ReactFlow) return <div style={card}><div style={{ fontSize:11, color:'var(--text-5)' }}>Workflow viewer belum siap…</div></div>;
        const RF = window.ReactFlow.default || window.ReactFlow;
        const { Background, Controls, MiniMap } = window.ReactFlow;
        const dagre = window.dagre;
        const nodes = (mode.nodes || []).map(n => ({ ...n }));
        const edges = (mode.edges || []).map((e, i) => ({ ...e, id: `e_${i}_${e.from}_${e.to}_${e.label||'plain'}` }));
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir:'LR', nodesep:40, ranksep:80, marginx:20, marginy:20 });
        graph.setDefaultEdgeLabel(() => ({}));
        nodes.forEach(n => graph.setNode(n.id, { width: n.type === 'gate' ? 180 : 160, height: n.type === 'agent' ? 70 : 58 }));
        edges.forEach(e => graph.setEdge(e.from, e.to));
        try { dagre.layout(graph); } catch {}
        const rfNodes = nodes.map(n => {
          const c = typeStyle(n.type);
          const pos = n.position || graph.node(n.id) || { x:0, y:0 };
          return {
            id: n.id,
            position: { x: Number(pos.x || 0), y: Number(pos.y || 0) },
            draggable: false,
            selectable: true,
            data: {
              label: (
                <div style={{ minWidth:130 }}>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>{n.type}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#fff', marginTop:3 }}>{n.label || n.ref || n.id}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', marginTop:4 }}>{n.ref || n.id}</div>
                  {n.type === 'agent' && Array.isArray(n.attachments) && n.attachments.length > 0 ? <div style={{ fontSize:9, color:'#c4b5fd', marginTop:4 }}>attch: {n.attachments.length}</div> : null}
                </div>
              )
            },
            style: { background:c.bg, color:c.fg, border:`1px solid ${c.bd}`, borderRadius:n.type === 'trigger' ? 18 : n.type === 'gate' ? 10 : 8, padding:8, width:n.type === 'gate' ? 180 : 160, boxShadow:'0 6px 20px rgba(0,0,0,0.18)' },
            sourcePosition:'right',
            targetPosition:'left',
          };
        });
        const rfEdges = edges.map(e => ({
          id: e.id, source: e.from, target: e.to, label: e.label || '', animated: !!e.loop_back, type: 'smoothstep',
          style: { stroke: e.loop_back ? '#f59e0b' : '#60a5fa', strokeWidth: e.loop_back ? 1.8 : 1.5 },
          labelStyle: { fill:'#cbd5e1', fontSize:10 }, labelBgStyle: { fill:'#0f172a', fillOpacity:0.92 },
          markerEnd: { type:'arrowclosed', color: e.loop_back ? '#f59e0b' : '#60a5fa' },
        }));
        return (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:10, flexWrap:'wrap' }}>
              <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>
                Viewer graph read-only. Sumber: <code>Setup/workflows.yaml</code>. Mode aktif bisa dipilih untuk lihat topology + routing.
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Mode</div>
                <select value={workflowModePick} onChange={e=>{ setWorkflowModePick(e.target.value); setWorkflowNodePick(null); }} style={{ background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'6px 8px', fontSize:11 }}>
                  {Object.keys(modes).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {isLocalhost && editableBtn('Open YAML', ()=>startEditOrch('workflows'))}
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:12 }}>
              <div style={{ ...panel, height:560, padding:0, overflow:'hidden' }}>
                <RF
                  nodes={rfNodes}
                  edges={rfEdges}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable
                  onNodeClick={(_, node)=>setWorkflowNodePick(node.id)}
                  proOptions={{ hideAttribution:true }}>
                  <Background color="#1e293b" gap={18} />
                  <MiniMap pannable zoomable style={{ height:110, width:160 }} nodeColor={n => typeStyle((mode.nodes || []).find(x => x.id === n.id)?.type).bd} />
                  <Controls showInteractive={false} />
                </RF>
              </div>
              <div style={{ display:'grid', gap:12, alignContent:'start' }}>
                <div style={panel}>
                  <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Legend</div>
                  {['trigger','agent','marker','gate'].map(t => { const c = typeStyle(t); return <div key={t} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, fontSize:11, color:'var(--text-2)' }}><span style={{ width:14, height:14, borderRadius:4, background:c.bg, border:`1px solid ${c.bd}`, display:'inline-block' }} /> {t}</div>; })}
                </div>
                <div style={panel}>
                  <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Mode Summary</div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>id: <code>{mode.id}</code></div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>nodes: {(mode.nodes || []).length}</div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>edges: {(mode.edges || []).length}</div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>freeze: {mode.freeze?.enabled ? `on after ${mode.freeze?.starts_after}` : 'off'}</div>
                </div>
                <div style={{ ...panel, minHeight:260 }}>
                  <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:8, textTransform:'uppercase', letterSpacing:1 }}>Node Detail</div>
                  {!detailNode ? <div style={{ fontSize:11, color:'var(--text-5)', lineHeight:1.6 }}>Klik node di canvas untuk lihat detail.</div> : (
                    <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>
                      <div><b style={{ color:'var(--text-1)' }}>{detailNode.label || detailNode.ref || detailNode.id}</b></div>
                      <div>id: <code>{detailNode.id}</code></div>
                      <div>type: <code>{detailNode.type}</code></div>
                      {detailNode.ref ? <div>ref: <code>{detailNode.ref}</code></div> : null}
                      {detailNode.type === 'agent' && agentsMap[detailNode.ref] ? <div>role_type: <code>{agentsMap[detailNode.ref].role_type}</code></div> : null}
                      {detailNode.type === 'gate' ? <div>outputs: <code>{((setupCfg.parsed?.rules?.gates?.[detailNode.ref]?.allowed_statuses) || []).join(' | ') || '—'}</code></div> : null}
                      {detailNode.type === 'agent' && Array.isArray(detailNode.attachments) ? <div style={{ marginTop:8 }}><div style={{ color:'var(--text-4)' }}>attachments:</div>{detailNode.attachments.length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : detailNode.attachments.map((a,i)=><div key={i}>• {a.kind}: <code>{a.path || a.id}</code></div>)}</div> : null}
                      <div style={{ marginTop:8, color:'var(--text-4)' }}>outgoing:</div>
                      {rfEdges.filter(e => e.source === detailNode.id).length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : rfEdges.filter(e => e.source === detailNode.id).map(e => <div key={e.id}>• {e.label ? `${e.label} → ` : ''}<code>{e.target}</code>{(mode.edges || []).find(x => `e_${(mode.edges || []).indexOf(x)}_${x.from}_${x.to}_${x.label||'plain'}` === e.id)?.loop_back ? ' (loop_back)' : ''}</div>)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      };