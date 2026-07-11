window.NewRequestModule = (function(){
function renderNewRequestView(ctx) {
  const clampLevel = (level) => Math.max(0, Math.min(Number(level || 0) || 0, 3));
  const escapeHtml = (s) => String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
  const toRoman = (num) => {
    let n = Number(num) || 0;
    if (n <= 0) return '';
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let out = '';
    map.forEach(([v, s]) => { while (n >= v) { out += s; n -= v; } });
    return out;
  };
  const alphaLabel = (n, upper) => {
    let x = Math.max(1, Number(n) || 1);
    let out = '';
    while (x > 0) {
      x -= 1;
      out = String.fromCharCode((upper ? 65 : 97) + (x % 26)) + out;
      x = Math.floor(x / 26);
    }
    return out;
  };
  const numberedLabel = (index, level) => {
    const n = Math.max(1, index || 1);
    const l = clampLevel(level);
    if (l === 0) return `${n}.`;
    if (l === 1) return `${alphaLabel(n, true)}.`;
    if (l === 2) return `${alphaLabel(n, false)}.`;
    return `${toRoman(n).toLowerCase() || n}.`;
  };
  const markerHtml = (block, counters) => {
    const level = clampLevel(block.level || 0);
    if (block.type === 'todo') return `<input type="checkbox" data-checkbox="${block.id}" ${block.checked ? 'checked' : ''} />`;
    if (block.type === 'bullet') {
      const n = level % 3;
      if (n === 0) return '<span style="width:8px;height:8px;border-radius:999px;display:inline-block;background:currentColor;margin-top:6px"></span>';
      if (n === 1) return '<span style="width:8px;height:8px;border-radius:999px;display:inline-block;background:var(--text-5);margin-top:6px"></span>';
      return '<span style="width:8px;height:8px;border-radius:999px;display:inline-block;border:1.5px solid currentColor;box-sizing:border-box;margin-top:6px"></span>';
    }
    if (block.type === 'numbered') {
      counters[level] += 1;
      for (let i = level + 1; i < counters.length; i += 1) counters[i] = 0;
      return `<span>${numberedLabel(counters[level], level)}</span>`;
    }
    for (let i = 0; i < counters.length; i += 1) counters[i] = 0;
    return '';
  };
  const splitInfoFromSelection = (id) => {
    const textEl = id ? ctx.requestEditorRef.current?.querySelector(`[data-block-id="${id}"] [data-block-text]`) : null;
    if (!id || !textEl) return null;
    const sel = window.getSelection();
    const full = textEl.textContent || '';
    let offset = full.length;
    if (sel && sel.rangeCount && sel.anchorNode && textEl.contains(sel.anchorNode)) {
      const range = sel.getRangeAt(0);
      try {
        const probe = document.createRange();
        probe.selectNodeContents(textEl);
        probe.setEnd(range.startContainer, range.startOffset);
        offset = probe.toString().length;
      } catch (_) {
        offset = full.length;
      }
    }
    return { textEl, full, offset };
  };
  const rememberFocus = (id, offset = null) => {
    if (!id) return;
    ctx.pendingRequestFocusOffsetRef.current = typeof offset === 'number' ? offset : null;
    ctx.setPendingRequestFocusId(id);
  };
  const controlBtnStyle = { fontSize:11, padding:'6px 10px', borderRadius:6, border:'1px solid var(--border-1)', background:'transparent', color:'var(--text-3)', cursor:'pointer' };
  const ghostBtnStyle = { ...controlBtnStyle, opacity:0, pointerEvents:'none', transition:'opacity 0.12s ease' };
  const editorHtml = (() => {
    const counters = [0,0,0,0];
    return ctx.requestBlocks.map((block) => {
      const level = clampLevel(block.level || 0);
      const marker = markerHtml(block, counters);
      const addRowTitle = 'Add row';
      const dragTitle = 'Drag row';
      const typeTitle = block.type === 'todo' ? 'Todo' : block.type === 'bullet' ? 'Bullet' : block.type === 'numbered' ? 'Numbered' : 'Text';
      return `
        <div class="nr-block" draggable="true" data-block-id="${block.id}" data-block-type="${block.type}" data-block-level="${level}" data-block-checked="${block.checked ? 'true' : 'false'}" style="position:relative;padding:4px 0;display:flex;align-items:flex-start;gap:10px;">
          <div class="nr-hover-actions" contenteditable="false" style="width:72px;display:flex;align-items:center;justify-content:flex-end;gap:6px;opacity:0;transition:opacity 0.12s ease;flex-shrink:0;padding-top:1px;">
            <button type="button" data-add-row="${block.id}" title="${addRowTitle}" style="width:22px;height:22px;border-radius:6px;border:1px solid var(--border-1);background:transparent;color:var(--text-3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;">+</button>
            <button type="button" data-set-type="${block.id}" title="${typeTitle}" style="min-width:22px;height:22px;padding:0 6px;border-radius:6px;border:1px solid var(--border-1);background:transparent;color:var(--text-3);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;font-size:10px;">${escapeHtml(typeTitle)}</button>
            <button type="button" data-drag-handle="${block.id}" title="${dragTitle}" style="width:22px;height:22px;border-radius:6px;border:1px solid var(--border-1);background:transparent;color:var(--text-3);cursor:grab;display:inline-flex;align-items:center;justify-content:center;">⋮⋮</button>
          </div>
          <div style="margin-left:${block.type === 'text' ? 0 : level * 28}px;display:flex;align-items:flex-start;gap:${block.type === 'text' ? 0 : 10}px;flex:1;min-width:0;">
            ${block.type === 'text' ? '' : `<span contenteditable="false" style="width:22px;user-select:none;color:var(--text-4);margin-top:2px;display:inline-flex;justify-content:center">${marker}</span>`}
            <span data-block-text style="flex:1;min-height:20px;white-space:pre-wrap">${escapeHtml(block.text)}</span>
          </div>
        </div>`;
    }).join('');
  })();

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden', background:'var(--app-bg)' }}>
      <div style={{ padding:'12px 20px', borderBottom:'1px solid var(--border-1)' }}>
        <div style={{ fontSize:18, fontWeight:700, color:'var(--text-1)' }}>New Request</div>
        <div style={{ fontSize:11, color:'var(--text-4)', marginTop:4 }}>Tab = child. Shift+Tab = parent. Enter ikut type block sebelumnya. Cross-block selection tetap hidup.</div>
        <div style={{ fontSize:10, color: ctx.requestSyncMeta.error ? '#fca5a5' : 'var(--text-5)', marginTop:4 }}>
          {ctx.requestSyncMeta.loading ? 'Loading shared draft…' : ctx.requestSyncMeta.saving ? 'Saving to server…' : ctx.requestSyncMeta.error ? ctx.requestSyncMeta.error : `Shared draft${ctx.requestSyncMeta.updatedBy ? ` · by ${ctx.requestSyncMeta.updatedBy}` : ''}${ctx.requestSyncMeta.updatedAt ? ` · ${ctx.requestSyncMeta.updatedAt}` : ''}`}
        </div>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:'18px 26px 80px' }}>
        <div style={{ maxWidth:860, margin:'0 auto' }}>
          <div
            ref={ctx.requestEditorRef}
            contentEditable
            suppressContentEditableWarning
            dangerouslySetInnerHTML={{ __html: editorHtml }}
            onClick={e => {
              const checkbox = e.target.closest('[data-checkbox]');
              if (checkbox) {
                const id = checkbox.getAttribute('data-checkbox');
                ctx.patchRequestBlock(id, { checked: checkbox.checked });
                return;
              }
              const addBtn = e.target.closest('[data-add-row]');
              if (addBtn) {
                const id = addBtn.getAttribute('data-add-row');
                ctx.syncRequestBlocksFromDom();
                ctx.addRequestBlock(id);
                return;
              }
              const typeBtn = e.target.closest('[data-set-type]');
              if (typeBtn) {
                const id = typeBtn.getAttribute('data-set-type');
                const block = ctx.requestBlocks.find(b => b.id === id);
                if (!block) return;
                const nextType = block.type === 'text' ? 'bullet' : block.type === 'bullet' ? 'numbered' : block.type === 'numbered' ? 'todo' : 'text';
                ctx.patchRequestBlock(id, { type: nextType, checked: nextType === 'todo' ? !!block.checked : false, level: nextType === 'text' ? 0 : clampLevel(block.level || 0) });
                ctx.pendingRequestFocusOffsetRef.current = block.text?.length || 0;
                ctx.setPendingRequestFocusId(id);
                return;
              }
            }}
            onMouseDown={e => {
              if (e.target.closest('[data-add-row], [data-set-type], [data-drag-handle], [data-checkbox]')) e.preventDefault();
            }}
            onDragStart={e => {
              const handle = e.target.closest('[data-drag-handle]');
              const blockEl = e.target.closest('[data-block-id]');
              const id = handle?.getAttribute('data-drag-handle') || blockEl?.dataset?.blockId;
              if (!id) return e.preventDefault();
              ctx.requestDragSrcRef.current = id;
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', id);
              }
            }}
            onDragOver={e => {
              const blockEl = e.target.closest('[data-block-id]');
              if (!blockEl) return;
              e.preventDefault();
              if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={e => {
              const blockEl = e.target.closest('[data-block-id]');
              if (!blockEl) return;
              e.preventDefault();
              const toId = blockEl.dataset.blockId;
              const fromId = ctx.requestDragSrcRef.current || e.dataTransfer?.getData('text/plain');
              ctx.requestDragSrcRef.current = null;
              if (!fromId || !toId || fromId === toId) return;
              ctx.syncRequestBlocksFromDom();
              ctx.moveRequestBlock(fromId, toId);
            }}
            onDragEnd={() => {
              ctx.requestDragSrcRef.current = null;
            }}

            onPaste={e => {
              e.preventDefault();
              const text = e.clipboardData?.getData('text/plain') || '';
              document.execCommand('insertText', false, text);
            }}
            onKeyDown={e => {
              if (e.isComposing) return;
              if (e.key === 'Tab') {
                const ids = ctx.currentBlockIdsFromSelection();
                if (!ids.length) return;
                e.preventDefault();
                const focusId = ctx.currentBlockIdFromSelection() || ids[ids.length - 1];
                const focusBlock = ctx.requestBlocks.find(b => b.id === focusId);
                ctx.syncRequestBlocksFromDom();
                ctx.patchRequestBlocks(ids, (prev) => ({ level: clampLevel((prev.level || 0) + (e.shiftKey ? -1 : 1)) }));
                rememberFocus(focusId, (focusBlock?.text || '').length);
                return;
              }
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const id = ctx.currentBlockIdFromSelection();
                const info = splitInfoFromSelection(id);
                if (!id || !info) return;
                ctx.syncRequestBlocksFromDom();
                const block = ctx.requestBlocks.find(b => b.id === id) || { type:'text', level:0, checked:false };
                const head = info.full.slice(0, info.offset);
                const tail = info.full.slice(info.offset);
                ctx.patchRequestBlock(id, { text: head });
                ctx.addRequestBlock(id, { type:block.type, level:block.level || 0, checked:false, text:tail });
                return;
              }
              if (e.key === ' ' && !e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
                const id = ctx.currentBlockIdFromSelection();
                const el = id ? ctx.requestEditorRef.current?.querySelector(`[data-block-id="${id}"] [data-block-text]`) : null;
                if (id && el && (el.textContent || '').trim() === '-') {
                  e.preventDefault();
                  el.textContent = '';
                  ctx.syncRequestBlocksFromDom();
                  ctx.patchRequestBlock(id, { type:'bullet', level: clampLevel(ctx.requestBlocks.find(b => b.id === id)?.level || 0), text:'' });
                  ctx.pendingRequestFocusOffsetRef.current = 0;
                  ctx.setPendingRequestFocusId(id);
                }
                return;
              }
              if (e.key === 'Backspace') {
                const id = ctx.currentBlockIdFromSelection();
                if (!id) return;
                const el = ctx.requestEditorRef.current?.querySelector(`[data-block-id="${id}"] [data-block-text]`);
                if (el && (el.textContent || '') === '' && ctx.caretAtBlockStart(id)) {
                  e.preventDefault();
                  ctx.syncRequestBlocksFromDom();
                  ctx.removeRequestBlock(id);
                  return;
                }
                if (ctx.caretAtBlockStart(id)) {
                  e.preventDefault();
                  ctx.syncRequestBlocksFromDom();
                  ctx.setRequestBlocks(prev => {
                    const idx = prev.findIndex(b => b.id === id);
                    if (idx <= 0) return prev;
                    const curr = prev[idx];
                    const before = prev[idx - 1];
                    const left = before.text || '';
                    const right = curr.text || '';
                    const glue = left && right && /[\w)]$/.test(left) && /^[\w(]/.test(right) ? ' ' : '';
                    const merged = { ...before, text: `${left}${glue}${right}` };
                    ctx.pendingRequestFocusOffsetRef.current = left.length + glue.length;
                    ctx.setPendingRequestFocusId(before.id);
                    return [...prev.slice(0, idx - 1), merged, ...prev.slice(idx + 1)];
                  });
                }
              }
            }}
            style={{ outline:'none', color:'var(--text-1)', fontSize:13, lineHeight:1.7 }}
          />
          <div style={{ marginTop:12, display:'flex', gap:8 }}>
            <button onMouseDown={e => { e.preventDefault(); ctx.syncRequestBlocksFromDom(); ctx.addRequestBlock(ctx.requestBlocks[ctx.requestBlocks.length - 1]?.id); }} style={controlBtnStyle}>+ Add block</button>
            <button onMouseDown={e => { e.preventDefault(); const id = ctx.currentBlockIdFromSelection(); if (id) ctx.patchRequestBlock(id, { type:'bullet' }); }} style={ghostBtnStyle} aria-hidden="true" tabIndex={-1}>Bullet</button>
            <button onMouseDown={e => { e.preventDefault(); const id = ctx.currentBlockIdFromSelection(); if (id) ctx.patchRequestBlock(id, { type:'numbered' }); }} style={ghostBtnStyle} aria-hidden="true" tabIndex={-1}>Numbered</button>
            <button onMouseDown={e => { e.preventDefault(); const id = ctx.currentBlockIdFromSelection(); if (id) ctx.patchRequestBlock(id, { type:'text', level:0 }); }} style={ghostBtnStyle} aria-hidden="true" tabIndex={-1}>Text</button>
          </div>
        </div>
      </div>
    </div>
  );
}
return { renderNewRequestView };
})();