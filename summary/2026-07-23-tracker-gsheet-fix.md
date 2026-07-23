# Summary — 2026-07-23 tracker gsheet fix

## Scope
- Repair broken `Test/modules/ui-tracker.js` save handlers after conflicting patches.
- Keep tracker statistics layout change in place.
- Re-verify syntax.

## What changed
- `loadTrackerFiles(folderId)` now supports folder-scoped query `?folderId=...`.
- Initial source load now fetches files with active saved folder id.
- `handleSpreadsheetChange()` now clears stale selected tabs, reloads tabs for picked spreadsheet, and keeps only tabs that still exist.
- `handleFolderChange()` now clears selected spreadsheet/tab state immediately when folder changes.
- `handleSaveFolder()` now saves selected folder, reloads source + files for saved folder, then resets saved spreadsheet/tab selection to prevent stale spreadsheet scope.
- `handleSaveSource()` now:
  - guards saving/locked state
  - requires spreadsheet selection
  - requires at least one selected tab
  - saves tracker source
  - reloads source + tracker rows
  - refreshes `rows`, `savedJson`, `meta`, and `source`
  - restores explicit catch handling so save failures surface in UI again

## Verification
- `node --check Test/modules/ui-tracker.js` → OK
- `git diff -- Test/modules/ui-tracker.js` inspected

## Current status
- Syntax-valid again.
- Main stale-folder/stale-spreadsheet mitigation present in FE flow.
- Runtime/browser verification not done in this session.

## Next suggested check
1. In UI, switch folder.
2. Confirm file dropdown reloads for new folder only.
3. Pick spreadsheet with tabs, save source.
4. Confirm tracker rows reload and no `Requested entity not found` for stale spreadsheet/tab.
