# Enriched Scenario → sixV2Automation Mapping

> **Generated:** 2026-08-08 · **Source:** enriched-conversation-scenario-catalog.md (729 scenarios)
> **Automation Repo:** C:\Users\MyBook SAGA 12\Desktop\sixV2Automation\

## Aggregate Summary

| | Count | % |
|---|---|---|
| **test() covered** (real Playwright test exists) | **185** | 25% |
| **test.fixme (stub)** (stub exists, activate) | **172** | 24% |
| **NONE** (zero automation, new spec needed) | **242** | 33% |
| **[UNDEV] labelled** (feature not built) | **130** | 18% |
| **Total** | **729** | 100% |

### By surface type

| Surface | Spec File | Status | Count |
|---|---|---|---|
| SC-INBOXNAV, SC-TEAMNAV, SC-CHATLIST | convo-nav / chat-list / convo-list-overview | test() 84 + test.fixme 82 | 166 |
| SC-INBOX | inbox.spec.js | test() 19 + test.fixme 11 | 30 |
| SC-ROOM | convo-room.spec.js | test.fixme 27 + [UNDEV] 5 | 32 |
| SC-DETAIL | convo-detail-panel.spec.js | test.fixme 25 | 25 |
| SC-PULL | convo-supplement.spec.js | test.fixme 14 | 14 |
| SC-SESSIONS, SC-MULTITKT, SC-MEMBERHUD | convo-supplement.spec.js | test.fixme 78 | 78 |
| SC-METRICS | sla-metrics.spec.js | test() 42 | 42 |
| SC-OWNERSHIP | convo-ownership.spec.js | test() 24 | 24 |
| SC-SLA, SC-RLT | sla-metrics.spec.js | test() 35 | 35 |
| SC-TICKETV2, Part C (all 11) | convo-supplement.spec.js (or none) | NONE 242 | 242 |
| SC-AUTOREPLY, SC-SNOOZE, SC-RELATED, SC-WAMENTION, COLLAB-UNDEV, ATTRS-UNDEV | convo-supplement.spec.js | [UNDEV] 130 | 130 |

---

## Part A — Core Inbox + Navigation + Room + Detail (261 scenarios)

# Part A Scenario → Automation Spec Mapping

> Generated: 2026-08-08 | Source: enriched-conversation-scenario-catalog.md
> Part A surfaces: SC-INBOX, SC-INBOXNAV, SC-TEAMNAV, SC-CHATLIST, SC-ROOM, SC-DETAIL, SC-PULL, SC-SESSIONS, SC-MULTITKT, SC-MEMBERHUD

| Scenario ID | Surface | Spec File | Status |
|---|---|---|---|
| SC-INBOX-001 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-002 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-003 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-004 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-005 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-006 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-007 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-008 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-009 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-010 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-011 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-012 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-013 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-014 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-015 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-016 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-017 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-018 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-019 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-020 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-021 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-022 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-023 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-024 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-025 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-026 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-027 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-028 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-029 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOX-030 | SC-INBOX | inbox.spec.js | test() covered |
| SC-INBOXNAV-001 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-002 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-003 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-004 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-005 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-006 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-007 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-008 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-009 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-010 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-011 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-012 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-013 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-014 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-015 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-016 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-017 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-018 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-019 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-020 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-021 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-022 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-023 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-INBOXNAV-024 | SC-INBOXNAV | convo-nav.spec.js | test() covered |
| SC-TEAMNAV-001 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-002 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-003 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-004 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-005 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-006 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-007 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-008 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-009 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-010 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-011 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-012 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-013 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-014 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-015 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-016 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-017 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-018 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-019 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-020 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-021 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-022 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-023 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-024 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-025 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-026 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-027 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-TEAMNAV-028 | SC-TEAMNAV | convo-nav.spec.js | test.fixme (stub) |
| SC-CHATLIST-001 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-002 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-003 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-004 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-005 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-006 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-007 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-008 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-009 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-010 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-011 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-012 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-013 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-014 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-015 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-016 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-017 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-018 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-019 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-020 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-021 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-022 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-023 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-024 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-025 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-026 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-027 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-028 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-029 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-CHATLIST-030 | SC-CHATLIST | chat-list.spec.js, convo-list-overview.spec.js | test() covered |
| SC-ROOM-001 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-002 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-003 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-004 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-005 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-006 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-007 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-008 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-009 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-010 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-011 | SC-ROOM | convo-room.spec.js | [UNDEV] labelled |
| SC-ROOM-012 | SC-ROOM | convo-room.spec.js | [UNDEV] labelled |
| SC-ROOM-013 | SC-ROOM | convo-room.spec.js | [UNDEV] labelled |
| SC-ROOM-014 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-015 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-016 | SC-ROOM | convo-room.spec.js | [UNDEV] labelled |
| SC-ROOM-017 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-018 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-019 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-020 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-021 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-022 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-023 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-024 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-025 | SC-ROOM | convo-room.spec.js | [UNDEV] labelled |
| SC-ROOM-026 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-027 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-028 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-029 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-030 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-031 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-ROOM-032 | SC-ROOM | convo-room.spec.js | test.fixme (stub) |
| SC-DETAIL-001 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-002 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-003 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-004 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-005 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-006 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-007 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-008 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-009 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-010 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-011 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-012 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-013 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-014 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-015 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-016 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-017 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-018 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-019 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-020 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-021 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-022 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-023 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-024 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-DETAIL-025 | SC-DETAIL | convo-detail-panel.spec.js | test.fixme (stub) |
| SC-PULL-001 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-002 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-003 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-004 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-005 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-006 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-007 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-008 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-009 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-010 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-011 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-012 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-013 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-PULL-014 | SC-PULL | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-001 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-002 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-003 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-004 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-005 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-006 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-007 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-008 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-009 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-010 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-011 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-012 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-013 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-014 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-015 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-016 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-017 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-018 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-019 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-020 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-021 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-022 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-023 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-024 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-025 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-026 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-027 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-028 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-029 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-SESSIONS-030 | SC-SESSIONS | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-001 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-002 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-003 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-004 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-005 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-006 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-007 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-008 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-009 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-010 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-011 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-012 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-013 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-014 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-015 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-016 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-017 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-018 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-019 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-020 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-021 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-022 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-023 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MULTITKT-024 | SC-MULTITKT | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-001 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-002 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-003 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-004 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-005 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-006 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-007 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-008 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-009 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-010 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-011 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-012 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-013 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-014 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-015 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-016 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-017 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-018 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-019 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-020 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-021 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-022 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-023 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |
| SC-MEMBERHUD-024 | SC-MEMBERHUD | convo-supplement.spec.js | test.fixme (stub) |

## Summary

| Status | Count |
|---|---|
| test() covered | 84 |
| test.fixme (stub) | 172 |
| NONE | 0 |
| [UNDEV] labelled | 5 |
| **Total** | **261** |

---

# Parts B+C Automation Mapping — sixV2Automation

> **Generated:** 2026-08-08 · **Source:** enriched-conversation-scenario-catalog.md
> **Scope:** 468 scenarios across 21 surfaces (Part B: 234, Part C: 234)
> **Specs audited:** sla-metrics.spec.js, convo-ownership.spec.js, convo-supplement.spec.js, agent-validation.spec.js

## Mapping Table

| Scenario ID | Surface | Spec File | Status |
|---|---|---|---|
| SC-METRICS-001 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-002 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-003 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-004 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-005 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-006 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-007 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-008 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-009 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-010 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-011 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-012 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-013 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-014 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-015 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-016 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-017 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-018 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-019 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-020 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-021 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-022 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-023 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-024 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-025 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-026 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-027 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-028 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-029 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-030 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-031 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-032 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-033 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-034 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-035 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-036 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-037 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-038 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-039 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-040 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-041 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-METRICS-042 | SC-METRICS | sla-metrics.spec.js | test() covered |
| SC-OWNERSHIP-001 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-002 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-003 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-004 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-005 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-006 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-007 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-008 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-009 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-010 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-011 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-012 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-013 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-014 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-015 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-016 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-017 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-018 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-019 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-020 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-021 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-022 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-023 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-OWNERSHIP-024 | SC-OWNERSHIP | convo-ownership.spec.js | test() covered |
| SC-TICKETV2-001 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-002 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-003 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-004 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-005 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-006 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-007 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-008 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-009 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-010 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-011 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-012 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-013 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-014 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-015 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-016 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-017 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-018 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-019 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-020 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-021 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-TICKETV2-022 | SC-TICKETV2 | convo-supplement.spec.js | NONE |
| SC-COLLAB-001 | SC-COLLAB | convo-supplement.spec.js | NONE |
| SC-COLLAB-002 | SC-COLLAB | convo-supplement.spec.js | NONE |
| SC-COLLAB-003 | SC-COLLAB | convo-supplement.spec.js | NONE |
| SC-COLLAB-019 | SC-COLLAB | convo-supplement.spec.js | NONE |
| SC-COLLAB-024 | SC-COLLAB | convo-supplement.spec.js | NONE |
| SC-ATTRS-001 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-002 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-003 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-004 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-005 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-006 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-007 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-008 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-009 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-010 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-011 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-012 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-013 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-014 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-015 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-ATTRS-021 | SC-ATTRS | convo-supplement.spec.js | NONE |
| SC-GSEARCH-001 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-002 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-003 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-004 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-005 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-006 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-007 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-008 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-009 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-010 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-011 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-012 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-013 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-014 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-015 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-016 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-017 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-018 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-019 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-GSEARCH-020 | SC-GSEARCH | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-001 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-002 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-003 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-004 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-005 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-006 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-007 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-008 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-009 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-010 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-011 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-012 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-013 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-014 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-015 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-016 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-017 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHAREATTR-018 | SC-SHAREATTR | convo-supplement.spec.js | NONE |
| SC-SHOPEE-001 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-002 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-003 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-004 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-005 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-006 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-007 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-008 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-009 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-010 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-011 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-012 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-013 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-014 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-015 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-016 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-017 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-018 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-019 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-020 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-021 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-022 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-023 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-024 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-SHOPEE-025 | SC-SHOPEE | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-001 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-002 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-003 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-004 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-005 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-006 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-007 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-008 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-009 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-010 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-011 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-012 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-013 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-014 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-015 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-016 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-017 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-018 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-019 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-020 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-021 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-022 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-023 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-TRANSCRIPT-024 | SC-TRANSCRIPT | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-001 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-002 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-003 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-004 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-005 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-006 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-007 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-008 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-009 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-010 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-011 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-012 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-013 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-014 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-015 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-016 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-017 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-018 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-019 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-020 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-021 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-022 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-023 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-EMAILREPLY-024 | SC-EMAILREPLY | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-001 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-002 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-003 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-004 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-005 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-006 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-007 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-008 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-009 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-010 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-011 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-012 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-013 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-014 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-015 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-016 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-017 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-018 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-019 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-WIDGETEMAIL-020 | SC-WIDGETEMAIL | convo-supplement.spec.js | NONE |
| SC-SLA-001 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-002 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-003 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-004 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-005 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-006 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-007 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-008 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-009 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-010 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-011 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-012 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-013 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-014 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-015 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-016 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-017 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-018 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-019 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-020 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-021 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-022 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-023 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-SLA-024 | SC-SLA | sla-metrics.spec.js | test() covered |
| SC-RLT-001 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-002 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-003 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-004 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-005 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-006 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-007 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-008 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-009 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-010 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-RLT-011 | SC-RLT | sla-metrics.spec.js | test() covered |
| SC-ANALYTICS-001 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-002 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-003 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-004 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-005 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-006 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-007 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-008 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-009 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-010 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-011 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-012 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-013 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-014 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-015 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-016 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-017 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-ANALYTICS-018 | SC-ANALYTICS | convo-supplement.spec.js | NONE |
| SC-OPENAPI-001 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-002 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-003 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-004 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-005 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-006 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-007 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-008 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-009 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-010 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-011 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-012 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-013 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-014 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-015 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-016 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-017 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-018 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-019 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-OPENAPI-020 | SC-OPENAPI | convo-supplement.spec.js | NONE |
| SC-PUBLICID-001 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-002 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-003 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-004 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-005 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-006 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-007 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-008 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-009 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-010 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-011 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-012 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-013 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-PUBLICID-014 | SC-PUBLICID | convo-supplement.spec.js | NONE |
| SC-MACRO-001 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-002 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-003 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-004 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-005 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-006 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-007 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-008 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-009 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-010 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-011 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-012 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-013 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-014 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-015 | SC-MACRO | convo-supplement.spec.js | NONE |
| SC-MACRO-016 | SC-MACRO | convo-supplement.spec.js | NONE |

## Summary

| Status | Count |
|---|---|
| test() covered | 101 |
| test.fixme (stub) | 0 |
| NONE | 242 |
| [UNDEV] labelled | 0 |
| **Total** | **468** |

### Coverage

- **test()=101** — SC-METRICS (42) + SC-OWNERSHIP (24) + SC-SLA (24) + SC-RLT (11) have real Playwright tests
- **test.fixme=0** — No Part B+C surface has stub coverage in any spec file
- **NONE=242** — SC-TICKETV2 (22) + SC-COLLAB non-UNDEV (5) + SC-ATTRS non-UNDEV (16) + all Part C surfaces (199) have zero automation
- **[UNDEV]=125** — AUTOREPLY (36), SNOOZE (18), RELATED (24), WAMENTION (18), COLLAB (23), ATTRS (6) are undeveloped features

### Spec File Coverage Summary

| Spec File | Surfaces | test() | test.fixme | NONE | [UNDEV] |
|---|---|---|---|---|---|
| sla-metrics.spec.js | METRICS, SLA, RLT | 77 | 0 | 0 | 0 |
| convo-ownership.spec.js | OWNERSHIP | 24 | 0 | 0 | 0 |
| convo-supplement.spec.js | TICKETV2, COLLAB, ATTRS, AUTOREPLY, SNOOZE, RELATED, WAMENTION, GSEARCH, SHAREATTR, SHOPEE, TRANSCRIPT, EMAILREPLY, WIDGETEMAIL, ANALYTICS, OPENAPI, PUBLICID, MACRO | 0 | 0 | 242 | 125 |
| agent-validation.spec.js | (none mapped) | 0 | 0 | 0 | 0 |
