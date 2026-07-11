import React, { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { useCreateBlockNote } from '@blocknote/react';
import { BlockNoteView } from '@blocknote/mantine';

function BlockNoteApp({ initialContent, onChange }) {
  const editor = useCreateBlockNote({
    initialContent: initialContent && initialContent.length ? initialContent : undefined,
    uploadFile: async () => { throw new Error('Upload belum diaktifkan'); },
  });

  useEffect(() => {
    const off = editor.onChange(() => {
      try { onChange(editor.document); } catch (e) { console.error('BlockNote change sync failed', e); }
    });
    return () => { try { off && off(); } catch {} };
  }, [editor, onChange]);

  return React.createElement(BlockNoteView, {
    editor,
    theme:'dark',
    formattingToolbar:true,
    linkToolbar:true,
    slashMenu:true,
    sideMenu:true,
    emojiPicker:false,
    filePanel:false,
    tableHandles:true,
  });
}

window.__qaBlockNote = {
  mountBlockNote(el, initialContent, onChange) {
    if (!el) return () => {};
    const root = createRoot(el);
    root.render(React.createElement(BlockNoteApp, { initialContent, onChange }));
    return () => { try { root.unmount(); } catch {} };
  }
};
