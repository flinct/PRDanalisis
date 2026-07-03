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
        const editActive = workflowEdit.enabled && workflowEdit.modeKey === workflowModePick;
        const baseNodes = editActive ? (workflowEdit.nodes || []) : (mode.nodes || []);
        const baseEdges = editActive ? (workflowEdit.edges || []) : (mode.edges || []);
        const detailNode = workflowNodePick && isGraph ? baseNodes.find(n => n.id === workflowNodePick) : null;
        const setEditError = (msg) => setWorkflowEdit(prev => ({ ...prev, error: msg }));
        const labelForEdge = (edge) => edge.label || '';
        const nextNodeId = (type, nodes) => {
          const prefix = type === 'trigger' ? 'trigger' : type === 'gate' ? 'gate' : type === 'marker' ? 'marker' : ((workflowNewNode.ref || 'agent').replace(/[^a-z0-9]+/gi, '_').replace(/^_+|_+$/g, '').toLowerCase() || 'agent');
          let i = 1;
          const used = new Set((nodes || []).map(n => n.id));
          while (used.has(`${prefix}_${i}`)) i += 1;
          return `${prefix}_${i}`;
        };
        const upsertEditDraft = (next) => {
          const snapshot = { ...next, edges: (next.edges || []).map((e, idx) => ({ id: e.id || `edge_${idx}`, ...e })) };
          syncWorkflowDraft(snapshot);
          setWorkflowEdit(snapshot);
        };
        const onAddNode = () => {
          if (!editActive) return;
          const type = workflowNewNode.type || 'agent';
          if (type === 'agent' && !workflowNewNode.ref) return setEditError('agent node butuh ref');
          const id = nextNodeId(type, baseNodes);
          const label = workflowNewNode.label?.trim() || workflowNewNode.ref?.trim() || id;
          const ref = type === 'agent' || type === 'gate' || type === 'marker' ? (workflowNewNode.ref || '').trim() : '';
          const node = { id, type, label, position:{ x: 80 + ((baseNodes.length % 4) * 180), y: 80 + (Math.floor(baseNodes.length / 4) * 120) } };
          if (ref) node.ref = ref;
          if (type === 'agent') node.attachments = [];
          const next = { ...workflowEdit, nodes:[...baseNodes, node], error:null, dirty:true };
          upsertEditDraft(next);
          setWorkflowNewNode({ type:'agent', ref:'', label:'' });
          setWorkflowNodePick(id);
        };
        const onDeleteNode = (nodeId) => {
          if (!editActive || !nodeId) return;
          const next = {
            ...workflowEdit,
            nodes: baseNodes.filter(n => n.id !== nodeId),
            edges: baseEdges.filter(e => e.from !== nodeId && e.to !== nodeId),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
          setWorkflowNodePick(null);
        };
        const onNodeFieldChange = (nodeId, field, value) => {
          if (!editActive) return;
          const next = {
            ...workflowEdit,
            nodes: baseNodes.map(n => n.id === nodeId ? { ...n, [field]: value } : n),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
        };
        const onEdgeLabelChange = (edgeId, value) => {
          if (!editActive) return;
          const next = {
            ...workflowEdit,
            edges: baseEdges.map(e => e.id === edgeId ? { ...e, label: value } : e),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
        };
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
        const nodes = baseNodes.map(n => ({ ...n }));
        const edges = baseEdges.map((e, i) => ({ id: e.id || `e_${i}_${e.from}_${e.to}_${e.label||'plain'}`, ...e }));
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
            draggable: editActive,
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
          id: e.id,
          source: e.from,
          target: e.to,
          label: labelForEdge(e),
          animated: !!e.loop_back,
          type: 'smoothstep',
          style: { stroke: e.loop_back ? '#f59e0b' : '#60a5fa', strokeWidth: e.loop_back ? 1.8 : 1.5 },
          labelStyle: { fill:'#cbd5e1', fontSize:10 },
          labelBgStyle: { fill:'#0f172a', fillOpacity:0.92 },
          markerEnd: { type:'arrowclosed', color: e.loop_back ? '#f59e0b' : '#60a5fa' },
        }));
        const modeGateRefs = Object.keys(setupCfg.parsed?.rules?.gates || {});
        return (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:10, flexWrap:'wrap' }}>
              <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>
                Viewer graph. Edit dasar: add node, drag node, connect edge, ubah label/ref, save ke <code>Setup/workflows.yaml</code>.
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Mode</div>
                <select value={workflowModePick} onChange={e=>{ setWorkflowModePick(e.target.value); setWorkflowNodePick(null); }} style={{ background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'6px 8px', fontSize:11 }}>
                  {Object.keys(modes).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {!editActive && isLocalhost && editableBtn('Edit graph', ()=>startWorkflowEdit(workflowModePick), { primary:true })}
                {editActive && editableBtn('Cancel', cancelWorkflowEdit)}
                {editActive && editableBtn('Save graph', saveWorkflowGraphConfirm, { primary:true, disabled: !workflowEdit.dirty || workflowEdit.saving })}
                {isLocalhost && editableBtn('Open YAML', ()=>startEditOrch('workflows'))}
              </div>
            </div>
            {editActive ? (
              <div style={{ ...panel, marginBottom:12 }}>
                <div style={{ display:'grid', gridTemplateColumns:'1.1fr 1fr 1fr auto', gap:8, alignItems:'end' }}>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Node type</div>
                    <select value={workflowNewNode.type} onChange={e=>setWorkflowNewNode(v => ({ ...v, type:e.target.value, ref:e.target.value==='agent' ? v.ref : e.target.value==='gate' ? (modeGateRefs[0] || '') : '' }))} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                      <option value='agent'>agent</option>
                      <option value='marker'>marker</option>
                      <option value='gate'>gate</option>
                      <option value='trigger'>trigger</option>
                    </select>
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>{workflowNewNode.type === 'agent' ? 'Agent ref' : workflowNewNode.type === 'gate' ? 'Gate ref' : 'Ref (optional)'}</div>
                    {workflowNewNode.type === 'agent' ? (
                      <select value={workflowNewNode.ref} onChange={e=>setWorkflowNewNode(v => ({ ...v, ref:e.target.value }))} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                        <option value=''>-- pilih agent --</option>
                        {agentsArr.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                      </select>
                    ) : workflowNewNode.type === 'gate' ? (
                      <select value={workflowNewNode.ref} onChange={e=>setWorkflowNewNode(v => ({ ...v, ref:e.target.value }))} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                        <option value=''>-- pilih gate --</option>
                        {modeGateRefs.map(a => <option key={a} value={a}>{a}</option>)}
                      </select>
                    ) : (
                      <input value={workflowNewNode.ref} onChange={e=>setWorkflowNewNode(v => ({ ...v, ref:e.target.value }))} placeholder='change_intake / qa_post / ...' style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Label</div>
                    <input value={workflowNewNode.label} onChange={e=>setWorkflowNewNode(v => ({ ...v, label:e.target.value }))} placeholder='Node label' style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} />
                  </div>
                  <button onClick={onAddNode} style={{ ...btn('primary'), whiteSpace:'nowrap' }}>+ Add node</button>
                </div>
                <div style={{ fontSize:10, color:'var(--text-4)', marginTop:8, lineHeight:1.6 }}>Connect edge dari canvas. Klik node untuk edit detail. Delete edge: pilih edge lalu Backspace/Delete.</div>
                {workflowEdit.error ? <div style={{ fontSize:11, color:'#f87171', marginTop:8 }}>⚠ {workflowEdit.error}</div> : null}
              </div>
            ) : null}
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 320px', gap:12 }}>
              <div style={{ ...panel, height:560, padding:0, overflow:'hidden' }}>
                <RF
                  nodes={rfNodes}
                  edges={rfEdges}
                  fitView
                  nodesDraggable={editActive}
                  nodesConnectable={editActive}
                  elementsSelectable
                  onNodeClick={(_, node)=>setWorkflowNodePick(node.id)}
                  onNodesChange={(changes)=>{
                    if (!editActive) return;
                    const nextNodes = baseNodes.map(n => {
                      const hit = changes.find(c => c.id === n.id && c.type === 'position' && c.position);
                      return hit ? { ...n, position: hit.position } : n;
                    }).filter(n => !changes.find(c => c.id === n.id && c.type === 'remove'));
                    upsertEditDraft({ ...workflowEdit, nodes: nextNodes, edges: baseEdges, error:null, dirty:true });
                  }}
                  onConnect={(params)=>{
                    if (!editActive || !params.source || !params.target) return;
                    const already = baseEdges.some(e => e.from === params.source && e.to === params.target);
                    if (already) return setEditError('edge sudah ada');
                    const edge = { id:`e_${Date.now()}`, from:params.source, to:params.target, label:'' };
                    upsertEditDraft({ ...workflowEdit, nodes: baseNodes, edges:[...baseEdges, edge], error:null, dirty:true });
                  }}
                  onEdgesDelete={(deleted)=>{
                    if (!editActive) return;
                    const del = new Set((deleted || []).map(e => e.id));
                    upsertEditDraft({ ...workflowEdit, nodes: baseNodes, edges: baseEdges.filter(e => !del.has(e.id)), error:null, dirty:true });
                  }}
                  deleteKeyCode={editActive ? ['Backspace', 'Delete'] : null}
                  proOptions={{ hideAttribution:true }}>
                  <Background color="#1e293b" gap={18} />
                  <MiniMap pannable zoomable style={{ height:110, width:160 }} nodeColor={n => typeStyle((baseNodes || []).find(x => x.id === n.id)?.type).bd} />
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
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>nodes: {baseNodes.length}</div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>edges: {baseEdges.length}</div>
                  <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>freeze: {mode.freeze?.enabled ? `on after ${mode.freeze?.starts_after}` : 'off'}</div>
                  {editActive ? <div style={{ fontSize:11, color:'#fbbf24', lineHeight:1.7 }}>draft: {workflowEdit.dirty ? 'dirty' : 'clean'}</div> : null}
                </div>
                <div style={{ ...panel, minHeight:260 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'center', marginBottom:8 }}>
                    <div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:1 }}>Node Detail</div>
                    {editActive && detailNode ? <button onClick={()=>onDeleteNode(detailNode.id)} style={{ ...btn('transparent'), fontSize:10, color:'#f87171', border:'1px solid #7f1d1d' }}>Delete node</button> : null}
                  </div>
                  {!detailNode ? <div style={{ fontSize:11, color:'var(--text-5)', lineHeight:1.6 }}>Klik node di canvas untuk lihat detail.</div> : (
                    <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>
                      <div><b style={{ color:'var(--text-1)' }}>{detailNode.label || detailNode.ref || detailNode.id}</b></div>
                      <div>id: <code>{detailNode.id}</code></div>
                      <div>type: <code>{detailNode.type}</code></div>
                      {detailNode.ref ? <div>ref: <code>{detailNode.ref}</code></div> : null}
                      {detailNode.type === 'agent' && agentsMap[detailNode.ref] ? <div>role_type: <code>{agentsMap[detailNode.ref].role_type}</code></div> : null}
                      {detailNode.type === 'gate' ? <div>outputs: <code>{((setupCfg.parsed?.rules?.gates?.[detailNode.ref]?.allowed_statuses) || []).join(' | ') || '—'}</code></div> : null}
                      {editActive ? (
                        <div style={{ display:'grid', gap:8, marginTop:10 }}>
                          <div>
                            <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Label</div>
                            <input value={detailNode.label || ''} onChange={e=>onNodeFieldChange(detailNode.id, 'label', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} />
                          </div>
                          {detailNode.type !== 'trigger' ? (
                            <div>
                              <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Ref</div>
                              {detailNode.type === 'agent' ? (
                                <select value={detailNode.ref || ''} onChange={e=>onNodeFieldChange(detailNode.id, 'ref', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                                  <option value=''>-- pilih agent --</option>
                                  {agentsArr.map(a => <option key={a.id} value={a.id}>{a.id}</option>)}
                                </select>
                              ) : detailNode.type === 'gate' ? (
                                <select value={detailNode.ref || ''} onChange={e=>onNodeFieldChange(detailNode.id, 'ref', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                                  {modeGateRefs.map(a => <option key={a} value={a}>{a}</option>)}
                                </select>
                              ) : (
                                <input value={detailNode.ref || ''} onChange={e=>onNodeFieldChange(detailNode.id, 'ref', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} />
                              )}
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                      {detailNode.type === 'agent' && Array.isArray(detailNode.attachments) ? <div style={{ marginTop:8 }}><div style={{ color:'var(--text-4)' }}>attachments:</div>{detailNode.attachments.length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : detailNode.attachments.map((a,i)=><div key={i}>• {a.kind}: <code>{a.path || a.id}</code></div>)}</div> : null}
                      <div style={{ marginTop:10, color:'var(--text-4)' }}>outgoing:</div>
                      {rfEdges.filter(e => e.source === detailNode.id).length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : rfEdges.filter(e => e.source === detailNode.id).map(e => (
                        <div key={e.id} style={{ marginBottom:8, padding:'6px 8px', border:'1px solid var(--border-1)', borderRadius:6 }}>
                          <div>• <code>{e.target}</code>{e.animated ? ' (loop_back)' : ''}</div>
                          {editActive ? <input value={e.label || ''} onChange={ev=>onEdgeLabelChange(e.id, ev.target.value)} placeholder='edge label / gate status' style={{ marginTop:6, width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'6px 8px' }} /> : (e.label ? <div style={{ color:'var(--text-3)' }}>{e.label}</div> : null)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      };
