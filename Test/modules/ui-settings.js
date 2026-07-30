window.SettingsModule = (function(){
function SettingsPage({ status, onRefreshStatus, onSwitchTheme, currentTheme, onImport, importing, importMsg, user }) {
    const [busy, setBusy] = useState(false);
    const [msg, setMsg]   = useState('');
    const [autoCfg, setAutoCfg]   = useState(null);
    const [autoPath, setAutoPath] = useState('');
    const [autoMsg, setAutoMsg]   = useState('');
    const [folderOptions, setFolderOptions] = useState([]);
    const [folderValue, setFolderValue] = useState('__default__');
    const [execMode, setExecMode]   = useState(()=>{ try { return localStorage.getItem('qa_exec_mode') || 'host'; } catch { return 'host'; } });
    const [runnerUrl, setRunnerUrl] = useState(()=>{ try { return localStorage.getItem('qa_runner_url') || 'http://localhost:9876'; } catch { return 'http://localhost:9876'; } });
    const [runnerHealth, setRunnerHealth] = useState(null);
    // Phase 2.0 + 2.1 + 2.2 + 2.3 — Workflow & Agent Setup.
    // Tidak menambah enum view di App; semua state lokal SettingsPage.
    const [settingsSubview, setSettingsSubview] = useState('hub'); // 'hub' | 'google' | 'theme' | 'import' | 'automation' | 'execution' | 'setup'
    const [setupTab, setSetupTab] = useState('rule'); // 'rule' | 'memory' | 'agent' | 'workflow' | 'runtime'
    const [setupCfg, setSetupCfgState] = useState({ loading:true, exists:false, parsed:null, raw:null, runtime:'', hash:'', error:null });
    const [setupValidation, setSetupValidation] = useState(null); // {ok, errors[], warnings[]}
    const [rulesList, setRulesList]   = useState([]);
    const [memoryList, setMemoryList] = useState([]);
    // docPick = currently selected Rules/Memory file
    const [docPick, setDocPick] = useState({ kind:null, relPath:null, content:'', loading:false, error:null, hash:'', editing:false, draft:'', saving:false, saveMsg:null, backups:[], showBackups:false });
    // setupDraft = orchestration YAML draft per key (raw text); when set, user is editing
    const [setupDraft, setSetupDraft] = useState({ manifest:null, rules:null, agents:null, workflows:null, pointers:null, saving:false, error:null });
    // confirm modal for save
    const [confirmOpen, setConfirmOpen] = useState(null); // {title, body, onOk, danger}
    const canAdminEdit = user?.role === 'admin';
    // localhost detection (host browser → can edit). Updated via /api/health by useEffect below.
    const isLocalhost = typeof window !== 'undefined' && /^(localhost|127\.0\.0\.1|::1)$/.test(window.location.hostname);
    const [workflowModePick, setWorkflowModePick] = useState('full_lane');
    const [workflowGraphLib, setWorkflowGraphLib] = useState({ loading:false, ready:false, error:null });
    const [workflowNodePick, setWorkflowNodePick] = useState(null);
    const [workflowEdgePick, setWorkflowEdgePick] = useState(null);
    const [workflowEdit, setWorkflowEdit] = useState({ enabled:false, modeKey:null, dirty:false, nodes:[], edges:[], error:null, saving:false });
    const [workflowNewNode, setWorkflowNewNode] = useState({ type:'agent', ref:'', label:'' });
    const [workflowNewAttachment, setWorkflowNewAttachment] = useState({ kind:'memory', value:'' });

    async function loadSetupCfg() {
      setSetupCfgState(s => ({ ...s, loading:true, error:null }));
      try {
        const d = await fetch('/api/setup/config').then(r => r.json());
        setSetupCfgState({ loading:false, exists:!!d.exists, parsed:d.parsed||null, raw:d.raw||null, runtime:d.runtime||'', hash:d.hash||'', error:null });
        if (d.exists && d.parsed) {
          try {
            const v = await fetch('/api/setup/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(d.parsed) }).then(r => r.json());
            setSetupValidation(v);
          } catch {}
        } else setSetupValidation(null);
      } catch (e) {
        setSetupCfgState(s => ({ ...s, loading:false, error:e.message }));
      }
    }
    async function loadRulesMemoryLists() {
      try { setRulesList(await fetch('/api/setup/rules').then(r=>r.json())); } catch {}
      try { setMemoryList(await fetch('/api/setup/memory').then(r=>r.json())); } catch {}
    }
    async function initSetupFolder() {
      try {
        const r = await fetch('/api/setup/init', { method:'POST' });
        if (!r.ok) { const d = await r.json().catch(()=>({})); alert(d.error || 'init failed'); return; }
        await loadSetupCfg();
      } catch (e) { alert(e.message); }
    }
    async function openManagedDoc(kind, relPath) {
      setDocPick({ kind, relPath, content:'', loading:true, error:null, hash:'', editing:false, draft:'', saving:false, saveMsg:null, backups:[], showBackups:false });
      try {
        const d = await fetch(`/api/setup/${kind}/file?path=` + encodeURIComponent(relPath)).then(r => r.ok ? r.json() : r.json().then(x => { throw new Error(x.error || 'load failed'); }));
        const backups = await fetch(`/api/setup/backups?kind=${kind}&path=` + encodeURIComponent(relPath)).then(r=>r.ok?r.json():[]).catch(()=>[]);
        setDocPick(prev => ({ ...prev, kind, relPath, content:d.content || '', loading:false, error:null, hash:d.hash || '', editing:false, draft:d.content || '', saving:false, saveMsg:null, backups, showBackups:false }));
      } catch (e) {
        setDocPick(prev => ({ ...prev, kind, relPath, content:'', loading:false, error:e.message }));
      }
    }
    function startEditDoc() { setDocPick(p => ({ ...p, editing:true, draft: p.content, saveMsg:null })); }
    function cancelEditDoc() { setDocPick(p => ({ ...p, editing:false, draft: p.content, saveMsg:null })); }
    function setDocDraft(v)  { setDocPick(p => ({ ...p, draft:v })); }
    function diffLines(a, b) {
      // Tiny diff: list line additions / removals only (good enough for review UI).
      const A = (a || '').split(/\r?\n/), B = (b || '').split(/\r?\n/);
      const out = [];
      const max = Math.max(A.length, B.length);
      for (let i = 0; i < max; i++) {
        if (A[i] === B[i]) continue;
        if (A[i] !== undefined) out.push({ t:'-', n:i+1, line:A[i] });
        if (B[i] !== undefined) out.push({ t:'+', n:i+1, line:B[i] });
      }
      return out;
    }
    async function saveDocConfirm() {
      const { kind, relPath, draft, hash, content } = docPick;
      if (!kind || !relPath) return;
      if (draft === content) { setDocPick(p => ({ ...p, editing:false, saveMsg:'(no changes)' })); return; }
      const diff = diffLines(content, draft);
      setConfirmOpen({
        danger: true,
        title: `Save ${kind === 'rules' ? 'Rules/' : 'Memory/'}${relPath}?`,
        body: (
          <div>
            <div style={{ fontSize:11, color:'#fcd34d', marginBottom:8, lineHeight:1.6 }}>
              ⚠ File ini dibaca oleh agent AI. Save akan mengubah behavior agent berikutnya.<br/>
              Backup otomatis tersimpan di <code>Setup/.backups/{kind}/…</code> (retensi 10 versi).
            </div>
            <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:6 }}>Perubahan ({diff.length} baris):</div>
            <pre style={{ fontSize:10, fontFamily:'inherit', maxHeight:240, overflowY:'auto', background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px 10px', margin:0, lineHeight:1.5 }}>
              {diff.slice(0, 300).map((d,i) => (
                <div key={i} style={{ color: d.t==='+' ? '#86efac' : '#fca5a5' }}>{d.t} L{d.n}: {d.line}</div>
              ))}
              {diff.length > 300 ? <div style={{ color:'var(--text-5)' }}>(+{diff.length-300} baris lagi disembunyikan)</div> : null}
            </pre>
          </div>
        ),
        onOk: async () => {
          setConfirmOpen(null);
          setDocPick(p => ({ ...p, saving:true, saveMsg:null }));
          try {
            const r = await fetch(`/api/setup/${kind}/file?path=` + encodeURIComponent(relPath), {
              method:'PUT', headers:{ 'Content-Type':'application/json' },
              body: JSON.stringify({ content: draft, expectedHash: hash }),
            });
            const d = await r.json();
            if (!r.ok) throw Object.assign(new Error(d.error || 'save failed'), { serverHash: d.serverHash, status: r.status });
            // refresh content + backups
            const backups = await fetch(`/api/setup/backups?kind=${kind}&path=` + encodeURIComponent(relPath)).then(r=>r.ok?r.json():[]).catch(()=>[]);
            setDocPick(p => ({ ...p, content: draft, hash: d.hash, editing:false, saving:false, saveMsg:`✓ saved · backup ${(d.backup||'').split('/').pop() || '—'}`, backups }));
          } catch (e) {
            if (e.status === 409 && e.serverHash) {
              setDocPick(p => ({ ...p, saving:false, saveMsg:`⚠ ${e.message}. Klik Reload file untuk ambil versi terbaru, lalu apply ulang.` }));
            } else {
              setDocPick(p => ({ ...p, saving:false, saveMsg:`⚠ ${e.message}` }));
            }
          }
        },
      });
    }
    async function loadBackupIntoDraft(ts) {
      const { kind, relPath } = docPick;
      if (!kind || !relPath || !ts) return;
      try {
        const d = await fetch(`/api/setup/backups/content?kind=${kind}&path=${encodeURIComponent(relPath)}&ts=${encodeURIComponent(ts)}`).then(r=>r.json());
        setDocPick(p => ({ ...p, editing:true, draft: d.content || '', saveMsg:`(loaded backup ${ts} into draft — review & save to restore)` }));
      } catch (e) { setDocPick(p => ({ ...p, saveMsg:`⚠ ${e.message}` })); }
    }

    // ── Orchestration editor helpers ─────────────────────────────────────────
    function startEditOrch(key) {
      setSetupDraft(d => ({ ...d, [key]: setupCfg.raw?.[key] || '', error:null }));
    }
    function cancelEditOrch(key) {
      setSetupDraft(d => ({ ...d, [key]: null, error:null }));
    }
    function setOrchDraft(key, v) {
      setSetupDraft(d => ({ ...d, [key]: v }));
    }
    // Build the effective bundle: for each of the 5 orchestration keys, use the draft (parsed) if present, else current parsed.
    function buildEffectiveBundle() {
      const keys = ['manifest','rules','agents','workflows','pointers'];
      const out = {};
      for (const k of keys) {
        const draft = setupDraft[k];
        if (draft !== null && draft !== undefined) {
          try { out[k] = window.jsyaml ? window.jsyaml.load(draft) : null; }
          catch (e) {
            const err = new Error(`YAML parse error di ${k}.yaml: ${e.message}`);
            err.key = k;
            throw err;
          }
        } else {
          out[k] = setupCfg.parsed?.[k] ?? null;
        }
      }
      return out;
    }
    async function validateOrchPreview() {
      try {
        const bundle = buildEffectiveBundle();
        const v = await fetch('/api/setup/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(bundle) }).then(r=>r.json());
        setSetupValidation(v);
        // Also refresh compiled runtime so user sees what will be written
        try {
          const rp = await fetch('/api/setup/runtime-preview', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(bundle) }).then(r=>r.json());
          setSetupCfgState(s => ({ ...s, runtime: rp.runtime || s.runtime }));
        } catch {}
        setSetupDraft(d => ({ ...d, error:null }));
      } catch (e) {
        setSetupDraft(d => ({ ...d, error: e.message }));
      }
    }

    function workflowSnapshot(modeKey) {
      const workflows = setupCfg.parsed?.workflows;
      const mode = workflows?.modes?.[modeKey];
      if (!mode) return null;
      return {
        modeKey,
        nodes: JSON.parse(JSON.stringify(mode.nodes || [])),
        edges: JSON.parse(JSON.stringify(mode.edges || [])),
      };
    }
    function startWorkflowEdit(modeKey) {
      const snap = workflowSnapshot(modeKey);
      if (!snap) return;
      setWorkflowNodePick(null);
      setWorkflowEdit({ enabled:true, modeKey, dirty:false, nodes:snap.nodes, edges:snap.edges, error:null, saving:false });
      startEditOrch('workflows');
    }
    function cancelWorkflowEdit() {
      setWorkflowEdit({ enabled:false, modeKey:null, dirty:false, nodes:[], edges:[], error:null, saving:false });
      cancelEditOrch('workflows');
    }
    function patchWorkflowEdit(mutator) {
      setWorkflowEdit(prev => {
        const next = mutator(prev);
        return { ...next, dirty:true, error:null };
      });
    }
    function syncWorkflowDraft(nextEdit) {
      try {
        const base = JSON.parse(JSON.stringify(setupCfg.parsed?.workflows || {}));
        if (!base.modes || !nextEdit.modeKey || !base.modes[nextEdit.modeKey]) throw new Error('workflow mode tidak ditemukan');
        base.modes[nextEdit.modeKey].nodes = nextEdit.nodes;
        base.modes[nextEdit.modeKey].edges = nextEdit.edges.map(({ id, ...rest }) => rest);
        const dumped = window.jsyaml ? window.jsyaml.dump(base, { lineWidth: 120, noRefs: true }) : '';
        setSetupDraft(d => ({ ...d, workflows: dumped, error:null }));
        return true;
      } catch (e) {
        setWorkflowEdit(prev => ({ ...prev, error:e.message }));
        return false;
      }
    }
    function saveWorkflowGraphConfirm() {
      if (!workflowEdit.enabled) return;
      const snapshot = { ...workflowEdit, edges: workflowEdit.edges.map(({ id, ...rest }) => rest) };
      if (!syncWorkflowDraft(snapshot)) return;
      saveOrchBundleConfirm();
    }

    async function saveOrchBundleConfirm() {
      let bundle;
      try { bundle = buildEffectiveBundle(); }
      catch (e) { setSetupDraft(d => ({ ...d, error:e.message })); return; }
      // Quick validate before showing confirm modal
      let validation;
      try {
        validation = await fetch('/api/setup/validate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(bundle) }).then(r=>r.json());
      } catch (e) { setSetupDraft(d => ({ ...d, error:'validate failed: ' + e.message })); return; }
      if (!validation.ok) {
        setSetupValidation(validation);
        setSetupDraft(d => ({ ...d, error:`Validation gagal (${validation.errors.length} error). Fix dulu sebelum save.` }));
        return;
      }
      const editedKeys = ['manifest','rules','agents','workflows','pointers'].filter(k => setupDraft[k] !== null && setupDraft[k] !== undefined);
      setConfirmOpen({
        danger: true,
        title: `Save Setup/${editedKeys.length === 1 ? editedKeys[0] + '.yaml' : `(${editedKeys.length} file)`}?`,
        body: (
          <div>
            <div style={{ fontSize:11, color:'#fcd34d', marginBottom:8, lineHeight:1.6 }}>
              ⚠ Save akan menulis ulang {editedKeys.join(', ')} di <code>Setup/</code> + regen <code>runtime.md</code>.<br/>
              Versi sebelumnya tersimpan di <code>Setup/.backups/setup/*.yaml</code>.
            </div>
            {validation.warnings.length ? (
              <div style={{ fontSize:11, color:'#fcd34d', marginBottom:8 }}>
                Warnings ({validation.warnings.length}):
                {validation.warnings.map((w,i) => <div key={i}>• {w}</div>)}
              </div>
            ) : null}
            <div style={{ fontSize:10, color:'var(--text-4)' }}>Edited keys: {editedKeys.join(', ')}</div>
          </div>
        ),
        onOk: async () => {
          setConfirmOpen(null);
          setSetupDraft(d => ({ ...d, saving:true, error:null }));
          try {
            const r = await fetch('/api/setup/config', {
              method:'PUT', headers:{ 'Content-Type':'application/json' },
              body: JSON.stringify({ bundle, expectedHash: setupCfg.hash }),
            });
            const d = await r.json();
            if (!r.ok) throw Object.assign(new Error(d.error || 'save failed'), { serverHash: d.serverHash, validation: d.validation, status: r.status });
            // Reset drafts + reload config
            setSetupDraft({ manifest:null, rules:null, agents:null, workflows:null, pointers:null, saving:false, error:null });
            await loadSetupCfg();
          } catch (e) {
            setSetupDraft(d => ({ ...d, saving:false, error:`⚠ ${e.message}${e.status === 409 ? ' (klik Reload untuk ambil versi terbaru)' : ''}` }));
          }
        },
      });
    }

    useEffect(() => {
      if (settingsSubview !== 'setup') return;
      loadSetupCfg();
      loadRulesMemoryLists();
    }, [settingsSubview]);
    useEffect(() => {
      const mode = setupCfg.parsed?.manifest?.active?.workflow_mode;
      if (mode) setWorkflowModePick(mode);
    }, [setupCfg.parsed?.manifest?.active?.workflow_mode]);
    useEffect(() => {
      if (settingsSubview !== 'setup' || setupTab !== 'workflow') return;
      if (window.ReactFlow && window.dagre) { setWorkflowGraphLib({ loading:false, ready:true, error:null }); return; }
      let cancelled = false;
      setWorkflowGraphLib(s => ({ ...s, loading:true, error:null }));
      Promise.all([
        loadScriptOnce('https://unpkg.com/dagre@0.8.5/dist/dagre.min.js', 'dagre'),
        loadScriptOnce('https://unpkg.com/reactflow@11.11.4/dist/umd/index.js', 'ReactFlow'),
      ]).then(() => {
        if (!cancelled) setWorkflowGraphLib({ loading:false, ready:true, error:null });
      }).catch(e => {
        if (!cancelled) setWorkflowGraphLib({ loading:false, ready:false, error:e.message || 'failed to load workflow viewer libs' });
      });
      return () => { cancelled = true; };
    }, [settingsSubview, setupTab]);
    function saveExec(mode, url) { try { localStorage.setItem('qa_exec_mode', mode); localStorage.setItem('qa_runner_url', url); } catch {} setExecMode(mode); setRunnerUrl(url); }
    async function testRunner() {
      setRunnerHealth('checking');
      try { const h = await fetch(runnerUrl.replace(/\/+$/, '') + '/health').then(r=>r.json()); setRunnerHealth(h); }
      catch(e){ setRunnerHealth({ ok:false, error:e.message }); }
    }
    useEffect(() => { fetch('/api/automation/config').then(r=>r.json()).then(c=>{ setAutoCfg(c); setAutoPath(c.automationRoot || ''); }).catch(()=>{}); }, []);
    useEffect(() => { setFolderValue(status && status.folderId ? status.folderId : '__default__'); }, [status && status.folderId]);
    useEffect(() => {
      let cancelled = false;
      if (!(status && status.connected) || (status && status.needsReconnect)) { setFolderOptions([]); return () => { cancelled = true; }; }
      fetch('/api/google/folders')
        .then(async r => {
          const d = await r.json().catch(() => ([]));
          if (!r.ok) throw new Error(d.error || 'Gagal memuat folder Google Drive');
          return d;
        })
        .then(list => { if (!cancelled) setFolderOptions(Array.isArray(list) ? list : []); })
        .catch(e => { if (!cancelled) setMsg('⚠ ' + e.message); });
      return () => { cancelled = true; };
    }, [status && status.connected, status && status.needsReconnect]);
    async function saveAuto() {
      try {
        const c = await fetch('/api/automation/config', { method:'PUT', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ automationRoot: autoPath }) }).then(r=>r.json());
        setAutoCfg(c);
        setAutoMsg(c.exists ? '✓ Tersimpan — folder ditemukan' : '⚠ Tersimpan, tapi folder tidak ditemukan di host');
        setTimeout(()=>setAutoMsg(''), 4000);
      } catch(e){ setAutoMsg('⚠ ' + e.message); }
    }
    const connected  = status && status.connected;
    const configured = status && status.oauthConfigured;
    const needsReconnect = status && status.needsReconnect;
    const folderLocked = !!(status && status.folderLockedByEnv);

    async function logout() {
      setBusy(true); setMsg('');
      try { await fetch('/api/google/logout', { method:'POST' }); await onRefreshStatus(); setMsg('Disconnected.'); }
      catch(e){ setMsg('⚠ ' + e.message); }
      setBusy(false);
    }
    async function saveFolder() {
      if (folderLocked) return;
      setBusy(true); setMsg('');
      try {
        const picked = folderValue === '__default__' ? null : folderOptions.find(x => x.id === folderValue);
        const r = await fetch('/api/google/folder', {
          method:'PUT',
          headers:{ 'Content-Type':'application/json' },
          body: JSON.stringify(picked ? { folderId: picked.id, folderName: picked.name, folderPath: picked.path } : { folderId: null })
        });
        const d = await r.json().catch(() => ({}));
        if (!r.ok) throw new Error(d.error || 'Gagal menyimpan folder Google Drive');
        await onRefreshStatus();
        setMsg(picked
          ? `✓ Folder aktif: ${picked.path}. Mirror map direset — klik “Mirror all docs now”.`
          : '✓ Kembali ke folder default PRD. Mirror map direset — klik “Mirror all docs now”.');
      } catch(e){ setMsg('⚠ ' + e.message); }
      setBusy(false);
    }
    async function mirrorNow() {
      setBusy(true); setMsg('Mirroring PRD, BRD, dan Assessment files…');
      try {
        const r = await fetch('/api/mirror', { method:'POST' });
        const d = await r.json();
        if (!r.ok) throw new Error(d.error || 'mirror failed');
        const firstErr = d.errors && d.errors.length ? ` — ${d.errors[0].file}: ${d.errors[0].error}` : '';
        setMsg(`✓ Mirror selesai — created ${d.created}, updated ${d.updated}, skipped ${d.skipped}` + (d.errors && d.errors.length ? `, ${d.errors.length} error${firstErr}` : ''));
        await onRefreshStatus();
      } catch(e){ setMsg('⚠ ' + e.message); }
      setBusy(false);
    }

    const card = { background:'var(--elevated-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:'16px 18px', marginBottom:16 };
    const hd   = { fontSize:11, fontWeight:700, textTransform:'uppercase', letterSpacing:1, color:'var(--text-3)', marginBottom:12 };
    const btn  = bg => ({ fontSize:11, padding:'6px 14px', borderRadius:6, border:'none', background:bg, color:'#fff', cursor: busy ? 'default' : 'pointer' });

    if (settingsSubview === 'setup') {
      const tabBtn = (active) => ({
        fontSize:11, padding:'6px 14px', borderRadius:6, cursor:'pointer',
        border:`1px solid ${active ? '#3b82f6' : 'var(--border-1)'}`,
        background: active ? '#3b82f6' : 'transparent',
        color: active ? '#fff' : 'var(--text-3)',
      });
      const statBox = { background:'var(--elevated-bg)', border:'1px solid var(--border-1)', borderRadius:8, padding:'12px 14px' };
      const codeBox = { fontSize:11, color:'var(--text-2)', background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:6, padding:'12px 14px', overflowX:'auto', lineHeight:1.6, whiteSpace:'pre-wrap', wordBreak:'break-word', maxHeight:520, overflowY:'auto', margin:0 };
      const listRow = (active) => ({
        padding:'6px 10px', fontSize:11, cursor:'pointer', borderRadius:5, lineHeight:1.5,
        background: active ? 'rgba(96,165,250,0.12)' : 'transparent',
        color: active ? 'var(--text-1)' : 'var(--text-3)',
        borderLeft: `2px solid ${active ? '#60a5fa' : 'transparent'}`,
      });

      const p = setupCfg.parsed || {};
      const modeName    = p.manifest?.active?.workflow_mode || (setupCfg.exists ? '—' : 'belum init');
      const agentsCount = (p.agents?.agents || []).length;
      const freezeOn    = !!(p.rules?.freeze_policy?.enabled);

      // ── Empty state (Setup/ belum ada) ────────────────────────────────────
      if (!setupCfg.loading && !setupCfg.exists) {
        return (
          <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
            <div style={{ maxWidth:840, margin:'0 auto' }}>
              <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:8 }}>
                <span onClick={()=>setSettingsSubview('hub')} style={{ color:'#60a5fa', cursor:'pointer' }}>← Back to Settings</span>
                <span style={{ margin:'0 6px' }}>/</span>
                <span>Workflow & Agent Setup</span>
              </div>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text-1)', marginBottom:6 }}>Setup Dashboard</div>
              <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:18, lineHeight:1.6 }}>
                Folder <code>Setup/</code> belum ada. Init dari template <code>Assessments/templates/Setup/*.example.*</code> untuk mulai.
              </div>
              <button onClick={initSetupFolder} style={btn('#3b82f6')}>⚙ Init Setup/ from example</button>
            </div>
          </div>
        );
      }

      // ── Renderers per tab ────────────────────────────────────────────────
      const editableBtn = (label, onClick, opts={}) => (
        <button onClick={onClick} disabled={opts.disabled} style={{
          fontSize:11, padding:'5px 12px', borderRadius:6, cursor: opts.disabled ? 'not-allowed' : 'pointer',
          border:`1px solid ${opts.primary ? '#3b82f6' : 'var(--border-1)'}`,
          background: opts.primary ? '#3b82f6' : (opts.danger ? '#7f1d1d' : 'transparent'),
          color: opts.primary || opts.danger ? '#fff' : 'var(--text-3)',
          opacity: opts.disabled ? 0.5 : 1,
        }}>{label}</button>
      );

      const renderOrchTab = (key, desc) => {
        const draft = setupDraft[key];
        const editing = draft !== null && draft !== undefined;
        const raw = setupCfg.raw?.[key] || '';
        return (
          <div style={card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:8 }}>
              <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>{desc}</div>
              <div style={{ display:'flex', gap:6 }}>
                {!editing && canAdminEdit && editableBtn('✎ Edit', ()=>startEditOrch(key))}
                {editing && editableBtn('Cancel', ()=>cancelEditOrch(key))}
                {editing && editableBtn('Validate', validateOrchPreview)}
                {editing && editableBtn('Save', saveOrchBundleConfirm, { primary:true, disabled: setupDraft.saving })}
                {!canAdminEdit && <span style={{ fontSize:10, color:'var(--text-5)' }}>(edit hanya untuk role admin)</span>}
              </div>
            </div>
            {setupCfg.loading
              ? <div style={{ fontSize:11, color:'var(--text-5)' }}>Loading…</div>
              : editing
                ? <textarea value={draft} onChange={e=>setOrchDraft(key, e.target.value)}
                    spellCheck={false}
                    style={{ width:'100%', minHeight:420, fontFamily:'inherit', fontSize:11, lineHeight:1.6,
                             background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'10px 12px', outline:'none', resize:'vertical' }} />
                : <pre style={codeBox}>{raw || '(kosong)'}</pre>}
            {setupDraft.error && <div style={{ fontSize:11, color:'#f87171', marginTop:8 }}>{setupDraft.error}</div>}
          </div>
        );
      };

      const renderManagedBrowser = (kind, list) => (
        <div style={{ display:'grid', gridTemplateColumns:'minmax(220px, 280px) 1fr', gap:12, ...card }}>
          <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px 6px', maxHeight:560, overflowY:'auto' }}>
            <div style={{ fontSize:9, color:'var(--text-5)', textTransform:'uppercase', letterSpacing:1, padding:'4px 8px' }}>{list.length} file</div>
            {list.length === 0 && <div style={{ fontSize:11, color:'var(--text-5)', padding:8 }}>(kosong)</div>}
            {list.map(f => (
              <div key={f.relPath}
                   onClick={()=>openManagedDoc(kind, f.relPath)}
                   style={listRow(docPick.kind===kind && docPick.relPath===f.relPath)}
                   title={`${f.relPath} · ${Math.round(f.size/1024)} KB`}>
                {f.relPath}
              </div>
            ))}
          </div>
          <div>
            {!docPick.relPath || docPick.kind !== kind
              ? <div style={{ fontSize:11, color:'var(--text-5)', padding:8 }}>Pilih file di kiri untuk membaca / edit isinya. {canAdminEdit ? '' : '(edit hanya untuk role admin.)'}</div>
              : docPick.loading
                ? <div style={{ fontSize:11, color:'var(--text-5)' }}>Loading {docPick.relPath}…</div>
                : docPick.error
                  ? <div style={{ fontSize:11, color:'#f87171' }}>⚠ {docPick.error}</div>
                  : <>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8, gap:8, flexWrap:'wrap' }}>
                        <div style={{ fontSize:10, color:'var(--text-4)' }}>
                          {kind === 'rules' ? 'Rules/' : 'Memory/'}{docPick.relPath}
                          <span style={{ marginLeft:8, color:'var(--text-5)' }}>· hash {docPick.hash.slice(0,8)}</span>
                          {docPick.editing && <span style={{ marginLeft:8, color:'#fbbf24' }}>● editing</span>}
                        </div>
                        <div style={{ display:'flex', gap:6 }}>
                          {!docPick.editing && canAdminEdit && editableBtn('✎ Edit', startEditDoc)}
                          {docPick.editing && editableBtn('Cancel', cancelEditDoc, { disabled: docPick.saving })}
                          {docPick.editing && editableBtn('Save', saveDocConfirm, { primary:true, disabled: docPick.saving || docPick.draft === docPick.content })}
                          {editableBtn(docPick.showBackups ? 'Hide history' : `History (${docPick.backups.length})`, ()=>setDocPick(p => ({ ...p, showBackups: !p.showBackups })))}
                          {editableBtn('Reload', ()=>openManagedDoc(kind, docPick.relPath), { disabled: docPick.saving })}
                        </div>
                      </div>
                      {docPick.saveMsg && (
                        <div style={{ fontSize:11, marginBottom:8, color: docPick.saveMsg.startsWith('⚠') ? '#f87171' : docPick.saveMsg.startsWith('✓') ? '#4ade80' : 'var(--text-4)' }}>
                          {docPick.saveMsg}
                        </div>
                      )}
                      {docPick.showBackups && (
                        <div style={{ background:'var(--deep-bg)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px 10px', marginBottom:8, maxHeight:160, overflowY:'auto' }}>
                          <div style={{ fontSize:10, color:'var(--text-5)', marginBottom:6 }}>Backup history (retensi 10) — klik untuk preload ke draft</div>
                          {docPick.backups.length === 0 && <div style={{ fontSize:11, color:'var(--text-5)' }}>(belum ada backup)</div>}
                          {docPick.backups.map(b => (
                            <div key={b.ts} onClick={()=>loadBackupIntoDraft(b.ts)}
                              style={{ fontSize:11, color:'var(--text-3)', padding:'4px 6px', cursor:'pointer', borderRadius:4, lineHeight:1.5 }}
                              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                              onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                              {b.ts.replace('T',' ').replace(/-/g,(m,i)=>i<10?'-':':').replace('Z','')} · {Math.round(b.size/1024)} KB
                            </div>
                          ))}
                        </div>
                      )}
                      {docPick.editing
                        ? <textarea value={docPick.draft} onChange={e=>setDocDraft(e.target.value)}
                            spellCheck={false}
                            style={{ width:'100%', minHeight:480, fontFamily:'inherit', fontSize:11, lineHeight:1.6,
                                     background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'10px 12px', outline:'none', resize:'vertical' }} />
                        : <pre style={codeBox}>{docPick.content || '(kosong)'}</pre>}
                    </>}
          </div>
        </div>
      );

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
        const detailEdge = workflowEdgePick ? baseEdges.find(e => e.id === workflowEdgePick) : null;
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
          const node = { id, type, label, position:{ x: 80 + ((baseNodes.length % 3) * 220), y: 80 + (Math.floor(baseNodes.length / 3) * 150) } };
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
        const { Background, Controls, MiniMap, Handle, Position } = window.ReactFlow;
        const dagre = window.dagre;
        const nodes = baseNodes.map(n => ({ ...n }));
        const edges = baseEdges.map((e, i) => ({ id: e.id || `e_${i}_${e.from}_${e.to}_${e.label||'plain'}`, ...e }));
        const graph = new dagre.graphlib.Graph();
        graph.setGraph({ rankdir:'TB', ranker:'tight-tree', nodesep:56, ranksep:92, marginx:28, marginy:28 });
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
                <div style={{ minWidth:130, position:'relative' }}>
                  {editActive ? <><Handle type='target' position={Position.Top} id='t' style={{ width:6, height:6, background:'#64748b', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='source' position={Position.Top} id='s-top' style={{ width:6, height:6, background:'#38bdf8', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='target' position={Position.Right} id='r' style={{ width:6, height:6, background:'#64748b', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='source' position={Position.Right} id='s-right' style={{ width:6, height:6, background:'#38bdf8', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='target' position={Position.Bottom} id='b' style={{ width:6, height:6, background:'#64748b', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='source' position={Position.Bottom} id='s-bottom' style={{ width:6, height:6, background:'#38bdf8', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='target' position={Position.Left} id='l' style={{ width:6, height:6, background:'#64748b', border:'1px solid #0f172a', opacity:0.85 }} /><Handle type='source' position={Position.Left} id='s-left' style={{ width:6, height:6, background:'#38bdf8', border:'1px solid #0f172a', opacity:0.85 }} /></> : null}
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.7)', textTransform:'uppercase', letterSpacing:1 }}>{n.type}</div>
                  <div style={{ fontSize:11, fontWeight:700, color:'#fff', marginTop:3 }}>{n.label || n.ref || n.id}</div>
                  <div style={{ fontSize:9, color:'rgba(255,255,255,0.75)', marginTop:4 }}>{n.ref || n.id}</div>
                  {n.type === 'agent' && Array.isArray(n.attachments) && n.attachments.length > 0 ? <div style={{ fontSize:9, color:'#c4b5fd', marginTop:4 }}>attch: {n.attachments.length}</div> : null}
                </div>
              )
            },
            style: { background:c.bg, color:c.fg, border:`1px solid ${c.bd}`, borderRadius:n.type === 'trigger' ? 18 : n.type === 'gate' ? 10 : 8, padding:8, width:n.type === 'gate' ? 180 : 160, minHeight:n.type === 'agent' ? 70 : 58, boxShadow:'0 6px 20px rgba(0,0,0,0.18)' },
            sourcePosition:'bottom',
            targetPosition:'top',
          };
        });
        const rfEdges = edges.map(e => ({
          id: e.id,
          source: e.from,
          target: e.to,
          sourceHandle: e.source_handle || null,
          targetHandle: e.target_handle || null,
          label: labelForEdge(e),
          animated: !!e.loop_back,
          type: 'smoothstep',
          selected: workflowEdgePick === e.id,
          style: { stroke: workflowEdgePick === e.id ? '#22d3ee' : (e.loop_back ? '#f59e0b' : '#60a5fa'), strokeWidth: workflowEdgePick === e.id ? 2.6 : (e.loop_back ? 1.8 : 1.5) },
          labelStyle: { fill:'#cbd5e1', fontSize:10 },
          labelBgStyle: { fill:'#0f172a', fillOpacity:0.92 },
          markerEnd: { type:'arrowclosed', color: workflowEdgePick === e.id ? '#22d3ee' : (e.loop_back ? '#f59e0b' : '#60a5fa') },
        }));
        const modeGateRefs = Object.keys(setupCfg.parsed?.rules?.gates || {});
        const attachmentOptions = {
          memory: setupCfg.parsed?.pointers?.active_memory || [],
          rule: setupCfg.parsed?.pointers?.active_rules || [],
          reference: setupCfg.parsed?.pointers?.active_references || [],
          tool: ['qa-tooling'],
        };
        const applyNodePatch = (nodeId, mutate) => {
          const next = {
            ...workflowEdit,
            nodes: baseNodes.map(n => n.id === nodeId ? mutate(n) : n),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
        };
        const addAttachmentToNode = (nodeId) => {
          if (!editActive || !detailNode || detailNode.type !== 'agent') return;
          const kind = workflowNewAttachment.kind || 'memory';
          const rawValue = (workflowNewAttachment.value || '').trim();
          if (!rawValue) return setEditError('attachment value kosong');
          const item = kind === 'tool' ? { kind, id: rawValue, label: rawValue } : { kind, path: rawValue };
          const dup = (detailNode.attachments || []).some(a => a.kind === item.kind && (a.path || a.id) === (item.path || item.id));
          if (dup) return setEditError('attachment sudah ada');
          applyNodePatch(nodeId, node => ({ ...node, attachments:[...(node.attachments || []), item] }));
          setWorkflowNewAttachment({ kind:'memory', value:'' });
        };
        const removeAttachmentFromNode = (nodeId, idx) => {
          if (!editActive) return;
          applyNodePatch(nodeId, node => ({ ...node, attachments:(node.attachments || []).filter((_, i) => i !== idx) }));
        };
        const markLoopback = (edgeId, checked) => {
          if (!editActive) return;
          const next = {
            ...workflowEdit,
            edges: baseEdges.map(e => e.id === edgeId ? { ...e, loop_back: !!checked } : e),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
        };
        const setEdgeHandle = (edgeId, key, value) => {
          if (!editActive) return;
          const next = {
            ...workflowEdit,
            edges: baseEdges.map(e => e.id === edgeId ? { ...e, [key]: value || undefined } : e),
            error:null,
            dirty:true,
          };
          upsertEditDraft(next);
        };
        const addGateBranch = (nodeId) => {
          if (!editActive || !detailNode || detailNode.type !== 'gate') return;
          const allowed = ((setupCfg.parsed?.rules?.gates?.[detailNode.ref]?.allowed_statuses) || []);
          const used = new Set(baseEdges.filter(e => e.from === nodeId).map(e => e.label || ''));
          const nextLabel = allowed.find(v => !used.has(v)) || '';
          if (!nextLabel) return setEditError('semua status gate sudah dipakai');
          const target = baseEdges.find(e => e.from === nodeId)?.to || baseNodes.find(n => n.id !== nodeId)?.id;
          if (!target) return setEditError('tidak ada target node untuk branch');
          const edge = { id:`e_${Date.now()}`, from:nodeId, to:target, label:nextLabel, source_handle:'s-bottom', target_handle:'t' };
          upsertEditDraft({ ...workflowEdit, nodes: baseNodes, edges:[...baseEdges, edge], error:null, dirty:true });
        };
        return (
          <div style={editActive ? { position:'fixed', inset:0, background:'var(--app-bg, #0b1220)', zIndex:9999, overflow:'auto', padding:'16px 20px' } : card}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, gap:10, flexWrap:'wrap' }}>
              <div style={{ fontSize:11, color:'var(--text-3)', lineHeight:1.6 }}>
                Viewer graph. Edit dasar: add node, drag node, connect edge, ubah label/ref, save ke <code>Setup/workflows.yaml</code>.
              </div>
              <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Mode</div>
                <select value={workflowModePick} onChange={e=>{ setWorkflowModePick(e.target.value); setWorkflowNodePick(null); }} style={{ background:'var(--deep-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'6px 8px', fontSize:11 }}>
                  {Object.keys(modes).map(k => <option key={k} value={k}>{k}</option>)}
                </select>
                {!editActive && canAdminEdit && editableBtn('Edit graph', ()=>startWorkflowEdit(workflowModePick), { primary:true })}
                {editActive && editableBtn('Exit edit', cancelWorkflowEdit, { danger:true })}
                {editActive && editableBtn('Save graph', saveWorkflowGraphConfirm, { primary:true, disabled: !workflowEdit.dirty || workflowEdit.saving })}
                {canAdminEdit && editableBtn('Open YAML', ()=>startEditOrch('workflows'))}
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
                  <button onClick={onAddNode} style={{ ...btn('transparent'), whiteSpace:'nowrap', background:'#111827', color:'#e5e7eb', border:'1px solid #374151', fontWeight:700 }}>+ Add node</button>
                </div>
                <div style={{ fontSize:10, color:'var(--text-4)', marginTop:8, lineHeight:1.6 }}>Connect edge dari canvas. Klik node untuk edit detail. Delete edge: pilih edge lalu Backspace/Delete.</div>
                {workflowEdit.error ? <div style={{ fontSize:11, color:'#f87171', marginTop:8 }}>⚠ {workflowEdit.error}</div> : null}
              </div>
            ) : null}
            <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 340px', gap:12 }}>
              <div style={{ ...panel, height: editActive ? 'calc(100vh - 200px)' : 560, padding:0, overflow:'hidden' }}>
                <RF
                  nodes={rfNodes}
                  edges={rfEdges}
                  fitView
                  nodesDraggable={editActive}
                  nodesConnectable={editActive}
                  elementsSelectable
                  onNodeClick={(_, node)=>{ setWorkflowNodePick(node.id); setWorkflowEdgePick(null); }}
                  onEdgeClick={(_, edge)=>{ if (!edge?.id) return; setWorkflowEdgePick(edge.id); setWorkflowNodePick(null); }}
                  onPaneClick={()=>{ setWorkflowEdgePick(null); }}
                  onNodesChange={(changes)=>{
                    if (!editActive) return;
                    const removed = new Set((changes || []).filter(c => c.type === 'remove').map(c => c.id));
                    if (!removed.size) return;
                    const nextNodes = baseNodes.filter(n => !removed.has(n.id));
                    upsertEditDraft({ ...workflowEdit, nodes: nextNodes, edges: baseEdges.filter(e => !removed.has(e.from) && !removed.has(e.to)), error:null, dirty:true });
                  }}
                  onNodeDragStop={(_, node)=>{
                    if (!editActive || !node?.id || !node.position) return;
                    const nextNodes = baseNodes.map(n => n.id === node.id ? { ...n, position:{ x:Number(node.position.x || 0), y:Number(node.position.y || 0) } } : n);
                    upsertEditDraft({ ...workflowEdit, nodes: nextNodes, edges: baseEdges, error:null, dirty:true });
                  }}
                  onConnect={(params)=>{
                    if (!editActive || !params.source || !params.target) return;
                    const already = baseEdges.some(e => e.from === params.source && e.to === params.target);
                    if (already) return setEditError('edge sudah ada');
                    const edge = { id:`e_${Date.now()}`, from:params.source, to:params.target, source_handle:params.sourceHandle || 's-bottom', target_handle:params.targetHandle || 't' };
                    setWorkflowEdgePick(edge.id);
                    setWorkflowNodePick(null);
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
                    <div style={{ fontSize:10, color:'var(--text-4)', textTransform:'uppercase', letterSpacing:1 }}>{detailEdge ? 'Connector Detail' : 'Node Detail'}</div>
                    {editActive && detailNode ? <button onClick={()=>onDeleteNode(detailNode.id)} style={{ ...btn('transparent'), fontSize:10, color:'#f87171', border:'1px solid #7f1d1d' }}>Delete node</button> : null}
                    {editActive && detailEdge ? <button onClick={()=>{ setWorkflowEdgePick(null); upsertEditDraft({ ...workflowEdit, nodes: baseNodes, edges: baseEdges.filter(e => e.id !== detailEdge.id), error:null, dirty:true }); }} style={{ ...btn('transparent'), fontSize:10, color:'#f87171', border:'1px solid #7f1d1d' }}>Delete line</button> : null}
                  </div>
                  {detailEdge ? (
                    <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>
                      <div><b style={{ color:'var(--text-1)' }}>connector</b></div>
                      <div>id: <code>{detailEdge.id}</code></div>
                      <div>from: <code>{detailEdge.from}</code></div>
                      <div>to: <code>{detailEdge.to}</code></div>
                      <div style={{ display:'grid', gap:8, marginTop:10 }}>
                        <div>
                          <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Label</div>
                          <input value={detailEdge.label || ''} onChange={e=>onEdgeLabelChange(detailEdge.id, e.target.value)} placeholder='edge label / gate status' style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} />
                        </div>
                        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                          <div>
                            <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Source side</div>
                            <select value={detailEdge.source_handle || 's-bottom'} onChange={e=>setEdgeHandle(detailEdge.id, 'source_handle', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                              <option value='s-top'>top</option>
                              <option value='s-right'>right</option>
                              <option value='s-bottom'>bottom</option>
                              <option value='s-left'>left</option>
                            </select>
                          </div>
                          <div>
                            <div style={{ fontSize:10, color:'var(--text-4)', marginBottom:4 }}>Target side</div>
                            <select value={detailEdge.target_handle || 't'} onChange={e=>setEdgeHandle(detailEdge.id, 'target_handle', e.target.value)} style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}>
                              <option value='t'>top</option>
                              <option value='r'>right</option>
                              <option value='b'>bottom</option>
                              <option value='l'>left</option>
                            </select>
                          </div>
                        </div>
                        <label style={{ display:'flex', alignItems:'center', gap:8, fontSize:11, color:'var(--text-3)' }}>
                          <input type='checkbox' checked={!!detailEdge.loop_back} onChange={e=>markLoopback(detailEdge.id, e.target.checked)} /> loop_back
                        </label>
                      </div>
                    </div>
                  ) : !detailNode ? <div style={{ fontSize:11, color:'var(--text-5)', lineHeight:1.6 }}>Klik node atau line di canvas untuk lihat detail.</div> : (
                    <div style={{ fontSize:11, color:'var(--text-2)', lineHeight:1.7 }}>
                      <div><b style={{ color:'var(--text-1)' }}>{detailNode.label || detailNode.ref || detailNode.id}</b></div>
                      <div>id: <code>{detailNode.id}</code></div>
                      <div>type: <code>{detailNode.type}</code></div>
                      {detailNode.ref ? <div>ref: <code>{detailNode.ref}</code></div> : null}
                      {detailNode.type === 'agent' && agentsMap[detailNode.ref] ? <div>role_type: <code>{agentsMap[detailNode.ref].role_type}</code></div> : null}
                      {detailNode.type === 'gate' ? <div>outputs: <code>{((setupCfg.parsed?.rules?.gates?.[detailNode.ref]?.allowed_statuses) || []).join(' | ') || '—'}</code></div> : null}
                      {editActive && detailNode.type === 'gate' ? <div style={{ marginTop:8 }}><button onClick={()=>addGateBranch(detailNode.id)} style={{ ...btn('transparent'), fontSize:10, border:'1px solid var(--border-1)' }}>+ Add branch from gate</button></div> : null}
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
                      {detailNode.type === 'agent' && Array.isArray(detailNode.attachments) ? <div style={{ marginTop:8 }}><div style={{ color:'var(--text-4)' }}>attachments:</div>{detailNode.attachments.length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : detailNode.attachments.map((a,i)=><div key={i} style={{ display:'flex', justifyContent:'space-between', gap:8, alignItems:'center', marginTop:6, padding:'6px 8px', border:'1px solid var(--border-1)', borderRadius:6 }}><div>• {a.kind}: <code>{a.path || a.id}</code></div>{editActive ? <button onClick={()=>removeAttachmentFromNode(detailNode.id, i)} style={{ ...btn('transparent'), fontSize:10, color:'#f87171', border:'1px solid #7f1d1d' }}>remove</button> : null}</div>)}</div> : null}
                      {editActive && detailNode.type === 'agent' ? <div style={{ marginTop:10, padding:'8px', border:'1px solid var(--border-1)', borderRadius:6 }}><div style={{ fontSize:10, color:'var(--text-4)', marginBottom:6 }}>Add attachment</div><div style={{ display:'grid', gridTemplateColumns:'110px 1fr auto', gap:6 }}><select value={workflowNewAttachment.kind} onChange={e=>setWorkflowNewAttachment(v => ({ kind:e.target.value, value:'' }))} style={{ background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}><option value='memory'>memory</option><option value='rule'>rule</option><option value='reference'>reference</option><option value='tool'>tool</option></select>{(attachmentOptions[workflowNewAttachment.kind] || []).length ? <select value={workflowNewAttachment.value} onChange={e=>setWorkflowNewAttachment(v => ({ ...v, value:e.target.value }))} style={{ background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }}><option value=''>-- pilih --</option>{(attachmentOptions[workflowNewAttachment.kind] || []).map(v => <option key={v} value={v}>{v}</option>)}</select> : <input value={workflowNewAttachment.value} onChange={e=>setWorkflowNewAttachment(v => ({ ...v, value:e.target.value }))} placeholder='path / tool id' style={{ background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'8px' }} /> }<button onClick={()=>addAttachmentToNode(detailNode.id)} style={{ ...btn('primary'), fontSize:10 }}>+ Add</button></div></div> : null}
                      <div style={{ marginTop:10, color:'var(--text-4)' }}>outgoing:</div>
                      {rfEdges.filter(e => e.source === detailNode.id).length === 0 ? <div style={{ color:'var(--text-5)' }}>(none)</div> : rfEdges.filter(e => e.source === detailNode.id).map(e => (
                        <div key={e.id} style={{ marginBottom:8, padding:'6px 8px', border:'1px solid var(--border-1)', borderRadius:6 }}>
                          <div>• <code>{e.target}</code>{e.animated ? ' (loop_back)' : ''}</div>
                          {editActive ? <div style={{ marginTop:6, display:'grid', gap:6 }}><input value={e.label || ''} onChange={ev=>onEdgeLabelChange(e.id, ev.target.value)} placeholder='edge label / gate status' style={{ width:'100%', background:'var(--app-bg)', color:'var(--text-1)', border:'1px solid var(--border-1)', borderRadius:6, padding:'6px 8px' }} /><label style={{ display:'flex', alignItems:'center', gap:6, fontSize:10, color:'var(--text-4)' }}><input type='checkbox' checked={!!e.animated} onChange={ev=>markLoopback(e.id, ev.target.checked)} /> loop_back</label></div> : (e.label ? <div style={{ color:'var(--text-3)' }}>{e.label}</div> : null)}
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

      const tabBody = setupTab === 'rule'
        ? renderManagedBrowser('rules', rulesList)
        : setupTab === 'memory'
        ? renderManagedBrowser('memory', memoryList)
        : setupTab === 'agent'
        ? renderOrchTab('agents', 'Roster agent + role + artifact ownership. Sumber: Setup/agents.yaml.')
        : setupTab === 'workflow'
        ? renderWorkflowGraph()
        : null; // runtime di bawah

      return (
        <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
          <div style={{ maxWidth:1100, margin:'0 auto' }}>
            <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:8 }}>
              <span onClick={()=>setSettingsSubview('hub')} style={{ color:'#60a5fa', cursor:'pointer' }}>← Back to Settings</span>
              <span style={{ margin:'0 6px' }}>/</span>
              <span>Workflow & Agent Setup</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:14, marginBottom:6 }}>
              <div style={{ fontSize:16, fontWeight:700, color:'var(--text-1)' }}>Setup Dashboard</div>
              <button onClick={loadSetupCfg} style={{ ...btn('transparent'), color:'var(--text-3)', border:'1px solid var(--border-1)' }}>⟳ Reload</button>
            </div>
            <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:14, lineHeight:1.6 }}>
              Manage Rules + Memory + orchestration config yang dibaca agent AI. Sumber: <code>Setup/*.yaml</code>, <code>Rules/*.md</code>, <code>Memory/*.md</code>. Phase 2.0 + 2.1: <strong>read-only</strong>. Edit + save masuk Phase 2.2 (localhost-only).
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:14 }}>
              <div style={statBox}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Workflow Mode</div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', marginTop:4 }}>{modeName}</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Active Agents</div>
                <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)', marginTop:4 }}>{agentsCount}</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Freeze Policy</div>
                <div style={{ fontSize:14, fontWeight:700, color: freezeOn ? '#4ade80' : 'var(--text-5)', marginTop:4 }}>{freezeOn ? 'Enabled' : 'Disabled'}</div>
              </div>
              <div style={statBox}>
                <div style={{ fontSize:10, color:'var(--text-4)' }}>Validation</div>
                <div style={{ fontSize:14, fontWeight:700, marginTop:4,
                    color: !setupValidation ? 'var(--text-5)' : setupValidation.ok ? '#4ade80' : '#f87171' }}>
                  {!setupValidation ? '—' : setupValidation.ok ? '✓ OK' : `${setupValidation.errors.length} error`}
                </div>
              </div>
            </div>

            {setupValidation && (setupValidation.errors.length || setupValidation.warnings.length) ? (
              <div style={{ ...card, borderColor: setupValidation.errors.length ? '#7f1d1d' : '#713f12' }}>
                <div style={{ fontSize:11, fontWeight:700, color: setupValidation.errors.length ? '#f87171' : '#fbbf24', marginBottom:8 }}>
                  {setupValidation.errors.length ? 'Validation errors' : 'Validation warnings'}
                </div>
                {setupValidation.errors.map((e,i) => <div key={'e'+i} style={{ fontSize:11, color:'#fca5a5', lineHeight:1.6 }}>• {e}</div>)}
                {setupValidation.warnings.map((w,i) => <div key={'w'+i} style={{ fontSize:11, color:'#fcd34d', lineHeight:1.6 }}>• {w}</div>)}
              </div>
            ) : null}

            <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap' }}>
              <button onClick={()=>setSetupTab('rule')} style={tabBtn(setupTab==='rule')}>Rule ({rulesList.length})</button>
              <button onClick={()=>setSetupTab('memory')} style={tabBtn(setupTab==='memory')}>Memory ({memoryList.length})</button>
              <button onClick={()=>setSetupTab('agent')} style={tabBtn(setupTab==='agent')}>Agent</button>
              <button onClick={()=>setSetupTab('workflow')} style={tabBtn(setupTab==='workflow')}>Workflow Agent</button>
              <button onClick={()=>setSetupTab('runtime')} style={tabBtn(setupTab==='runtime')}>Runtime</button>
            </div>

            {setupTab === 'runtime' ? (
              <div style={card}>
                <div style={hd}>Compiled Runtime</div>
                <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:10, lineHeight:1.6 }}>
                  Sumber: <code>Setup/runtime.md</code>. File ini yang dibaca Hermes / Claude Code saat task start. Compile ulang dilakukan saat save (Phase 2.2/2.3).
                </div>
                {setupCfg.loading
                  ? <div style={{ fontSize:11, color:'var(--text-5)' }}>Loading…</div>
                  : <pre style={codeBox}>{setupCfg.runtime || '(belum ada)'}</pre>}
              </div>
            ) : tabBody}

            <div style={{ fontSize:10, color:'var(--text-5)', marginTop:14, lineHeight:1.6 }}>
              Phase 2.0–2.3 active — orchestration config + Rules/Memory browser + edit/diff/atomic save.
              {!canAdminEdit && <span style={{ color:'#fbbf24', marginLeft:6 }}>● Role non-admin → mode view-only.</span>}
            </div>
          </div>

          {/* Confirm modal */}
          {confirmOpen && (
            <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center' }}
                 onClick={()=>setConfirmOpen(null)}>
              <div onClick={e=>e.stopPropagation()} style={{ background:'var(--elevated-bg)', border:'1px solid var(--border-1)', borderRadius:10, padding:'18px 20px', width:'min(640px, 92vw)', maxHeight:'88vh', overflowY:'auto' }}>
                <div style={{ fontSize:13, fontWeight:700, color: confirmOpen.danger ? '#f87171' : 'var(--text-1)', marginBottom:10 }}>{confirmOpen.title}</div>
                <div style={{ marginBottom:14 }}>{confirmOpen.body}</div>
                <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
                  <button onClick={()=>setConfirmOpen(null)} style={{ ...btn('transparent'), color:'var(--text-3)', border:'1px solid var(--border-1)' }}>Cancel</button>
                  <button onClick={confirmOpen.onOk} style={btn(confirmOpen.danger ? '#dc2626' : '#3b82f6')}>Confirm</button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Tile launcher (hub) — Settings as a grid like img 2.
    const TILES = [
      { id:'google',     title:'Google Docs',           desc:'Login OAuth, mirror PRD/BRD/Assessment ke Google Docs, dan cek connection status.', cta:'Open Docs Settings' },
      { id:'theme',      title:'Theme',                 desc:'Pilih tema, simpan preference UI, dan preview dark/light variants.',           cta:'Open Theme Settings' },
      { id:'import',     title:'Manual Import',         desc:'Scan ulang file TSV/MD ke SQLite dan sync index QA Browser.',                   cta:'Open Import Tools' },
      { id:'automation', title:'Automation (Playwright)', desc:'Set path repo automation (sixV2Automation) di mesin host.',                   cta:'Open Automation Settings' },
      { id:'execution',  title:'Execution',             desc:'Pilih run di host (central) atau di perangkat ini via runner.js.',             cta:'Open Execution Settings' },
      { id:'setup',      title:'Workflow & Agent Setup',desc:'Atur Rule, Agent, dan Workflow Agent untuk orchestration multi-agent tanpa menyimpan API key di dashboard.', cta:'Open Setup Dashboard', highlight:true },
    ];
    const tileStyle = (hl) => ({
      background:'var(--elevated-bg)', border:'1px solid var(--border-1)', borderRadius:12, padding:'18px 20px',
      display:'flex', flexDirection:'column', gap:10, height:'100%',
      outline: hl ? '1px solid rgba(96,165,250,0.45)' : 'none', outlineOffset: hl ? 2 : 0,
    });
    const tileBtn  = { padding:'12px 14px', borderRadius:10, border:'1px solid var(--border-1)', background:'#132246', color:'#fff', fontWeight:700, fontSize:12, cursor:'pointer', width:'100%', marginTop:'auto' };
    const detailBack = (
      <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:14 }}>
        <span onClick={()=>setSettingsSubview('hub')} style={{ color:'#60a5fa', cursor:'pointer' }}>← Back to Settings</span>
      </div>
    );
    const detailShell = (children) => (
      <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
        <div style={{ maxWidth:760, margin:'0 auto' }}>
          {detailBack}
          {children}
        </div>
      </div>
    );

    if (settingsSubview === 'hub') {
      return (
        <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
          <div style={{ maxWidth:1180, margin:'0 auto' }}>
            <div style={{ fontSize:22, fontWeight:800, color:'var(--text-1)', marginBottom:6 }}>Settings</div>
            <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:20, lineHeight:1.6 }}>
              Halaman settings QA Browser. Pilih kategori untuk mengatur masing-masing fitur.
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14, gridAutoRows:'1fr' }}>
              {TILES.map(t => (
                <div key={t.id} style={tileStyle(t.highlight)}>
                  <div style={{ fontSize:14, fontWeight:700, color:'var(--text-1)' }}>{t.title}</div>
                  <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6, flex:1 }}>{t.desc}</div>
                  <button onClick={()=>{ setSettingsSubview(t.id); if (t.id==='setup') setSetupTab('rule'); }} style={tileBtn}>{t.cta}</button>
                </div>
              ))}
            </div>
            <div style={{ marginTop:18, padding:'12px 14px', borderRadius:12,
              background:'rgba(52,211,153,0.08)', border:'1px solid rgba(52,211,153,0.24)', color:'#b8ffe4', fontSize:12, lineHeight:1.6 }}>
              Rekomendasi akses: tetap lewat <b>⚙ Settings</b> agar setup agent dianggap sebagai konfigurasi global QA Browser, bukan action per-file/per-testcase.
            </div>
          </div>
        </div>
      );
    }

    if (settingsSubview === 'google') return detailShell(
      <div style={card}>
        <div style={hd}>1 · Google Connection</div>
            {!configured && (
              <div style={{ fontSize:12, color:'var(--text-3)', lineHeight:1.6 }}>
                OAuth belum dikonfigurasi. Tambahkan <code>oauth-credentials.json</code> ke root project
                (lihat <strong>GDOCS-SETUP.md</strong>), lalu restart server.
              </div>
            )}
            {configured && !connected && !needsReconnect && (
              <div>
                <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:12 }}>Belum terhubung ke Google.</div>
                <a href="/api/google/login" style={{ ...btn('#3b82f6'), textDecoration:'none', display:'inline-block' }}>Login with Google</a>
              </div>
            )}
            {configured && needsReconnect && (
              <div>
                <div style={{ fontSize:12, color:'#f59e0b', marginBottom:10, lineHeight:1.6 }}>
                  Token Google yang tersimpan belum punya izin <strong>Google Docs</strong> + <strong>Google Drive</strong>, jadi status lama bisa terlihat “connected” tapi mirror gagal membuat dokumen baru.
                </div>
                <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:12 }}>
                  Solusi: login ulang lalu approve permission terbaru.
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <a href="/api/google/login" style={{ ...btn('#3b82f6'), textDecoration:'none', display:'inline-block' }}>Reconnect with Google</a>
                  <button onClick={logout} disabled={busy} style={{ ...btn('transparent'), color:'var(--text-3)', border:'1px solid var(--border-1)' }}>Disconnect</button>
                </div>
              </div>
            )}
            {connected && (
              <div>
                <div style={{ fontSize:12, color:'var(--text-2)', marginBottom:4 }}>✓ Connected{status.email ? ` — ${status.email}` : ''}</div>
                <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:8 }}>Folder aktif: {status.folderPath || status.folderName || status.folderId || 'PRD'}</div>
                <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:10, lineHeight:1.6 }}>
                  Hanya dokumen dalam folder ini yang tampil di sidebar Google Docs, dan semua mirror PRD, BRD, dan Assessment akan dibuat/diupdate di folder yang sama.
                </div>
                {folderLocked && (
                  <div style={{ fontSize:11, color:'#f59e0b', marginBottom:10 }}>
                    Folder dikunci dari environment (<code>GDRIVE_FOLDER_ID</code> / <code>GDRIVE_FOLDER_NAME</code>), jadi tidak bisa diubah dari UI.
                  </div>
                )}
                <div style={{ display:'flex', gap:8, flexWrap:'wrap', alignItems:'center', marginBottom:12 }}>
                  <select value={folderValue} onChange={e=>setFolderValue(e.target.value)} disabled={busy || folderLocked}
                    style={{ minWidth:280, maxWidth:'100%', fontSize:11, padding:'6px 8px', borderRadius:6, border:'1px solid var(--border-1)', background:'var(--deep-bg)', color:'var(--text-1)', outline:'none', fontFamily:'inherit' }}>
                    <option value="__default__">Default: PRD (auto-created)</option>
                    {folderOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.path}</option>)}
                  </select>
                  {!folderLocked && <button onClick={saveFolder} disabled={busy} style={btn('#0f766e')}>Save folder</button>}
                </div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  <button onClick={mirrorNow} disabled={busy} style={btn('#0369a1')}>{busy ? '…' : '⇪ Mirror all docs now'}</button>
                  <button onClick={logout} disabled={busy} style={{ ...btn('transparent'), color:'var(--text-3)', border:'1px solid var(--border-1)' }}>Disconnect</button>
                </div>
              </div>
            )}
            {msg && <div style={{ fontSize:11, color: msg.startsWith('⚠') ? '#f87171' : '#4ade80', marginTop:12 }}>{msg}</div>}
      </div>
    );

    if (settingsSubview === 'theme') return detailShell(
      <div style={card}>
        <div style={hd}>2 · Theme</div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {THEMES.map(t => (
            <button key={t.id} onClick={() => onSwitchTheme(t.id)} title={t.name}
              style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 10px', borderRadius:6, cursor:'pointer',
                border:`1px solid ${currentTheme === t.id ? '#3b82f6' : 'var(--border-1)'}`, background:'var(--app-bg)', color:'var(--text-2)', fontSize:11 }}>
              <span style={{ display:'flex' }}>
                {t.swatch.map((c, i) => <span key={i} style={{ width:10, height:10, background:c, borderRadius:2, marginLeft:i ? -2 : 0, border:'1px solid rgba(0,0,0,.3)' }}/>)}
              </span>
              {t.name}
            </button>
          ))}
        </div>
      </div>
    );

    if (settingsSubview === 'import') return detailShell(
      <div style={card}>
        <div style={hd}>3 · Manual Import</div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:12 }}>Re-scan workspace & reindex semua TSV/MD ke database.</div>
        <button onClick={onImport} disabled={importing} style={btn('#0369a1')}>{importing ? 'Importing…' : '⟳ Import TSV/MD'}</button>
        {importMsg && <div style={{ fontSize:11, color: importMsg.startsWith('⚠') ? '#f87171' : '#4ade80', marginTop:10 }}>{importMsg}</div>}
      </div>
    );

    if (settingsSubview === 'automation') return detailShell(
      <div style={card}>
        <div style={hd}>4 · Automation (Playwright)</div>
        <div style={{ fontSize:12, color:'var(--text-3)', marginBottom:10, lineHeight:1.5 }}>
          Path folder repo automation (sixV2Automation) di mesin <strong>host</strong> — tempat Playwright dijalankan.
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <input value={autoPath} onChange={e=>setAutoPath(e.target.value)} placeholder="C:\\Users\\…\\Desktop\\sixV2Automation"
            style={{ flex:1, fontSize:11, padding:'6px 8px', borderRadius:6, border:'1px solid var(--border-1)', background:'var(--deep-bg)', color:'var(--text-1)', outline:'none', fontFamily:'inherit' }} />
          <button onClick={saveAuto} style={btn('#0369a1')}>Save</button>
        </div>
        {autoCfg && <div style={{ fontSize:11, color: autoCfg.exists ? '#4ade80' : 'var(--text-5)', marginTop:8 }}>
          {autoCfg.automationRoot ? (autoCfg.exists ? '✓ Folder ditemukan di host' : '⚠ Folder belum ada di host') : 'Belum diset'}
        </div>}
        {autoMsg && <div style={{ fontSize:11, color: autoMsg.startsWith('⚠') ? '#f87171' : '#4ade80', marginTop:6 }}>{autoMsg}</div>}
      </div>
    );

    if (settingsSubview === 'execution') return detailShell(
      <div style={card}>
        <div style={hd}>5 · Execution (Playwright Run)</div>
        <div style={{ display:'flex', gap:8, marginBottom:10 }}>
          <button onClick={()=>saveExec('host', runnerUrl)}
            style={{ fontSize:11, padding:'5px 12px', borderRadius:6, cursor:'pointer',
              border:`1px solid ${execMode==='host' ? '#3b82f6' : 'var(--border-1)'}`,
              background: execMode==='host' ? '#3b82f6' : 'transparent', color: execMode==='host' ? '#fff' : 'var(--text-3)' }}>
            Run di host (central)
          </button>
          <button onClick={()=>saveExec('local', runnerUrl)}
            style={{ fontSize:11, padding:'5px 12px', borderRadius:6, cursor:'pointer',
              border:`1px solid ${execMode==='local' ? '#3b82f6' : 'var(--border-1)'}`,
              background: execMode==='local' ? '#3b82f6' : 'transparent', color: execMode==='local' ? '#fff' : 'var(--text-3)' }}>
            Run di perangkat ini
          </button>
        </div>
        {execMode === 'local' ? (
          <div>
            <div style={{ fontSize:11, color:'var(--text-4)', marginBottom:6, lineHeight:1.5 }}>
              Jalankan <code>node runner.js</code> di PC ini (di dalam repo automation). Playwright akan jalan di sini, bukan di host.
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <input value={runnerUrl} onChange={e=>setRunnerUrl(e.target.value)} onBlur={()=>saveExec('local', runnerUrl)} placeholder="http://localhost:9876"
                style={{ flex:1, fontSize:11, padding:'6px 8px', borderRadius:6, border:'1px solid var(--border-1)', background:'var(--deep-bg)', color:'var(--text-1)', outline:'none', fontFamily:'inherit' }} />
              <button onClick={testRunner} style={btn('#0369a1')}>Test</button>
            </div>
            {runnerHealth === 'checking' && <div style={{ fontSize:11, color:'var(--text-4)', marginTop:8 }}>Mengecek…</div>}
            {runnerHealth && runnerHealth !== 'checking' && (
              <div style={{ fontSize:11, marginTop:8, color: runnerHealth.ok ? '#4ade80' : '#f87171' }}>
                {runnerHealth.ok ? `✓ Runner aktif — root: ${runnerHealth.root}${runnerHealth.exists ? '' : ' (⚠ repo tidak ada)'}` : `⚠ Tidak terhubung: ${runnerHealth.error || 'error'}`}
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize:11, color:'var(--text-4)', lineHeight:1.5 }}>Run dieksekusi di server host (pakai AUTOMATION_ROOT di atas). Cocok bila host yang punya repo + browser.</div>
        )}
      </div>
    );

    // Fallback: kembalikan ke hub kalau subview tidak dikenali
    return detailShell(<div style={{ fontSize:12, color:'var(--text-3)' }}>Pilih kategori dari Settings.</div>);
  }

  // ─── LOGIN PAGE ──────────────────────────────────────────────────────────

  return { SettingsPage };
})();
