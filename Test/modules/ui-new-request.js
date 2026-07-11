window.NewRequestModule = (function(){
  const e = React.createElement;
  const controlBtnStyle = { fontSize:11, padding:'6px 10px', borderRadius:6, border:'1px solid var(--border-1)', background:'var(--deep-bg)', color:'var(--text-2)', cursor:'pointer' };

  function BlockNoteHost({ ctx }) {
    React.useEffect(() => {
      if (!ctx.blockNote?.ready || !ctx.requestEditorRef?.current || !ctx.blockNote?.api?.mountBlockNote) return undefined;
      const unmount = ctx.blockNote.api.mountBlockNote(
        ctx.requestEditorRef.current,
        ctx.requestBlocks,
        doc => ctx.onRequestDocChange(doc),
      );
      return () => { try { unmount && unmount(); } catch {} };
    }, [ctx.blockNote?.rev]);

    return e('div', { style:{ border:'1px solid var(--border-1)', borderRadius:12, background:'var(--elevated-bg)', overflow:'hidden' } },
      e('div', { ref:ctx.requestEditorRef, style:{ minHeight:520, padding:12 } }),
    );
  }

  function renderNewRequestView(ctx) {
    const statusTone = ctx.requestSyncMeta.error ? '#fca5a5' : (ctx.requestSyncMeta.saving ? '#fbbf24' : '#86efac');
    const fallback = e('div', { style:{ border:'1px solid var(--border-1)', borderRadius:12, background:'var(--elevated-bg)', padding:12 } },
      e('div', { style:{ marginBottom:10, fontSize:12, color:'#fca5a5' } }, 'BlockNote gagal dimuat. Fallback plain text aktif.'),
      e('textarea', {
        value:ctx.fallbackText,
        onChange:ev => ctx.onFallbackTextChange(ev.target.value),
        placeholder:'# Heading\nParagraf bebas\n- bullet\n1. numbered\n- [ ] checklist\n> quote',
        style:{ width:'100%', minHeight:520, resize:'vertical', border:'1px solid var(--border-1)', borderRadius:10, background:'var(--deep-bg)', color:'var(--text-1)', padding:14, outline:'none', fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:13, lineHeight:1.6 }
      }),
    );

    return e('div', { style:{ padding:20, height:'100%', overflow:'auto' } },
      e('div', { style:{ maxWidth:1100, margin:'0 auto', display:'grid', gap:14 } },
        e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' } },
          e('div', null,
            e('div', { style:{ fontSize:24, fontWeight:700, color:'var(--text-1)' } }, 'New Request'),
            e('div', { style:{ marginTop:6, fontSize:12, color:'var(--text-3)' } }, 'Editor bebas untuk ide feature baru. Shared draft, autosave, rich block.'),
          ),
          e('div', { style:{ display:'flex', gap:8, alignItems:'center' } },
            e('button', { type:'button', onClick:ctx.retryBlockNoteLoad, style:controlBtnStyle }, 'Reload editor'),
          ),
        ),
        e('div', { style:{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'center', padding:'10px 12px', border:'1px solid var(--border-1)', borderRadius:10, background:'var(--deep-bg)' } },
          e('div', { style:{ fontSize:12, color:'var(--text-3)' } }, ctx.blockNote.loading ? 'Memuat BlockNote…' : ctx.blockNote.ready ? 'BlockNote aktif' : 'Fallback mode'),
          e('div', { style:{ display:'flex', gap:12, alignItems:'center', fontSize:12, color:'var(--text-3)' } },
            e('span', { style:{ color:statusTone } }, ctx.requestSyncMeta.error || (ctx.requestSyncMeta.saving ? 'Saving…' : 'Saved')),
            e('span', null, ctx.requestSyncMeta.updatedAt ? `Update: ${ctx.requestSyncMeta.updatedAt}` : 'Belum ada update'),
            e('span', null, ctx.requestSyncMeta.updatedBy ? `By ${ctx.requestSyncMeta.updatedBy}` : ''),
          ),
        ),
        ctx.blockNote.ready ? e(BlockNoteHost, { ctx }) : fallback,
      ),
    );
  }

  return { renderNewRequestView };
})();
