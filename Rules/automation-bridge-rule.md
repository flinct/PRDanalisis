# Automation Bridge Rule

**Purpose:** Keep `PRDanalisis` and `sixV2Automation` connected so that test case changes can be reflected into automation scripts consistently.

---

## Source of Truth

| Layer | Source | Role |
|------|--------|------|
| PRD | `PRD/Conversation/` and `PRD/Conversationv2/` | Product requirement source |
| Test cases | `Test/conversation/Conversation.tsv` | Manual/traceability test source of truth |
| Gap supplement | `Test/conversation/Conversation_gap_supplement.tsv` | Temporary gap coverage input |
| Parsed JSON | `Test/conversation/conversation_tests_parsed.json` | Machine-readable test input |
| Summary JSON | `Test/conversation/conversation_tests_summary.json` | Lightweight automation summary |
| Automation repo | `C:\Users\MyBook SAGA 12\Desktop\sixV2Automation\` | Playwright spec generation target |
| Automation manifest | `sixV2Automation/playwright/support/config/conversation-testcases.generated.json` | Sync payload consumed by automation repo |
| Automation module | `sixV2Automation/playwright/support/config/conversation-testcases.generated.js` | CommonJS export of the sync payload |


---

## Flow

1. **Update PRD/test source** in `PRDanalisis`.
2. **Update `Conversation.tsv`** so the testcase list is the latest and labeled clearly.
3. **Regenerate JSON artifacts** in `Test/conversation/` if needed.
4. **Sync/generate automation specs** in `sixV2Automation` from the updated TSV/JSON.
5. **Update `sixV2Automation/AGENTS.md`** whenever generated scripts, page objects, or test counts change.
6. **Do not use a single meta-spec as the final automation target**; bucket the testcase into the real spec files (`convo-list-overview`, `convo-room`, `convo-detail-panel`, `convo-nav`, `convo-list-features`, `convo-supplement`).

---

## Rules

- Do **not** treat the two repos as separate truths.
- `PRDanalisis` is the **requirement and coverage source**.
- `sixV2Automation` is the **implementation target**.
- Any testcase addition, deletion, rename, or status label change must be reflected in the automation generator input.
- If a testcase is marked `[UNDEVELOPED]`, keep that label in `Conversation.tsv`; automation should respect it and can skip/mark fixme.
- Keep generated automation files out of `PRDanalisis` root. Put scripts in `Temp Analysis/scripts/` and outputs in `Test/conversation/`.

---

## Practical Trigger

Whenever `Conversation.tsv` changes:
- re-run parsing/generation,
- refresh the automation input,
- then regenerate or patch specs in `sixV2Automation`.

If the automation repo changes its page objects or locators, update the mapping back in this rule or the automation repo AGENTS file.
