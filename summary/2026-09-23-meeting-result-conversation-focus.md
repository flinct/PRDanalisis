# Meeting Result — SatuInbox Product Focus (23 Sep 2026)

**Status:** Tim sudah alignment.

---

## 🟣 Product Design — Conversation UI

> Owner: Product Design team
> Prototype: [`prototypes/satuinbox-prototype/index.html`](../prototypes/satuinbox-prototype/index.html) (login: `dany` / `password123`, navigate `#/conversation`)
> Responsive: **1280 → 1366 → 1440**

| # | Task | Target Area | Interconnection |
|---|------|-------------|-----------------|
| 1 | **Filter layout** → search bar → list | List | — |
| 2 | **Client contacts bar layout** | Room | — |
| 3 | **Detail conversation styling** | Detail | 🔗 QA-1 (close ticket behavior → status indicator) |
| 4 | **Cost grand WAP** | Detail | — |
| 5 | **Button Close placement** di room & detail | Room + Detail | 🔗 QA-1 (semantics tergantung jawaban close ticket → conversation) |
| 6 | **Message utility** → Conversation history | Room | — |
| 7 | **Assignee component placement** → room/detail → popup | Room + Detail | 🔗 QA-4 (flow definisi behavior assignee) |
| 8 | **Bubble message owner @ pinned msg** | Detail | — |
| 9 | **Disconnect channel icon/mark** di conv list | List | — |
| 10 | **Responsive behavior** 1280 → 1366 → 1440 | All | 🔗 QA-4 (flow menentukan layout per breakpoint) |

---

## 🔵 QA — Flow & Investigation

> Owner: QA team

| # | Task | Type | Output | Interconnection |
|---|------|------|--------|-----------------|
| 1 | **Close ticket berpengaruh ke conversation?** | Investigation | Decision doc | 🔗 → Design-3, Design-5 (blocker: button & detail status) |
| 2 | **Flow Wizard Onboarding** — role, permission, each member | Flow diagram | New artifact | — (independent) |
| 3 | **Subscription flow + UI layout** — new user, subscriber, expiring | Flow diagram + UI spec | New artifact | 🔗 → PM (PRD subscription) |
| 4 | **Conversation flow** — split: Fatih → room+detail, Aprizal → sidenav+list | Flow diagram | New artifact | 🔗 → Design-1..10 (flow = spec, Design executes) |

---

## 🔗 Interconnection Map

```
QA-1  ──→ Design-3 (detail: status indicator depends on close→conv behavior)
      ──→ Design-5 (button Close: same action? separate? depends on answer)
       ⚠️  CRITICAL PATH: Design-5 blocked until QA-1 resolves

QA-4  ──→ Design-1..10 (conversation flow = upstream spec for all UI tasks)
   ├── Aprizal flow (sidenav+list) ──→ Design-1, 2, 9, 10
   └── Fatih flow (room+detail)   ──→ Design-3, 4, 5, 6, 7, 8

QA-3  ──→ PM (subscription PRD) ──→ Design (subscription UI, later sprint)

QA-2  ──→ independent, no blocking dependency
```

---

## ⏸️ Defer

| Topic | Status |
|-------|--------|
| Subscription module | QA-3 flow dulu, PRD & UI nanti |
| Sales module | Bukan fokus sprint ini |

---

## References

- Prototype: `prototypes/satuinbox-prototype/`
- Redesign Wireframe: `prototypes/conversation-page-redesign/conversation-page-redesign.html`
- Audit: `Assessments/audit/detail-uiux/uiux-audit-report-sabrina.md`
- Impact: `Assessments/audit/detail-uiux/uiux-impact-assessment.md`
- Redesign Review: `Assessments/audit/detail-uiux/2026-09-11-conversation-page-redesign-review.md`
- Change List: `Assessments/audit/detail-uiux/2026-09-11-conversation-page-change-list.md`
- Filter Research: `Assessments/audit/detail-uiux/2026-09-11-conversation-list-filter-placement-research.md`
- Undeveloped Features: `Memory/conversation-undeveloped-features-analysis.md`
