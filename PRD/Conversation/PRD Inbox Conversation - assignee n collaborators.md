# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: Assignees and Collaborators Permission Model  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

## **1\. Revision History**

| Version | Date | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-05-05 | Yusril Ibnu Maulana | Initial for Collaborators permission model across Conversation and Ticket. |

## **2\. Overview**

This feature adds **Collaborators** as an internal-only participation role while keeping existing multi-assignee behavior. Assignees can handle customer-facing actions, while Collaborators can view and add internal notes only.

| In Scope | Out of Scope |
| ----- | ----- |
| Add Collaborators to Conversation. | Changing existing multi-assignee model. |
| Add Collaborators to Ticket. | Single primary assignee migration. |
| Permission separation between Assignee and Collaborator. | External customer visibility for collaborators. |
| Auto-remove user from Collaborators when added as Assignee. | New approval workflow for collaborator changes. |
| Read-only customer reply composer for Collaborators. | Advanced collaborator notification preference. |
| Audit log for collaborator add, remove, and promotion. | Billing or pricing changes. |

## **3\. Problem Statement**

| ID | Problem | Impact |
| ----- | ----- | ----- |
| PS-001 | Non-assigned team members need to help without replying to customers. | Teams rely on informal coordination and risk exposing inconsistent answers. |
| PS-002 | Existing multi-assignee model does not provide a safe read-only collaboration layer. | More users may be assigned only to observe or add notes, which weakens ownership clarity. |
| PS-003 | Same user can potentially be added to multiple role lists without validation. | Permission ambiguity, UI confusion, and noisy audit records. |

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Keep customer replies controlled by Assignees. | 100% customer replies are sent only by users in Assignees list or users with override permission. |
| Enable safe internal collaboration. | At least 70% of assisted cases use Collaborator notes instead of adding unnecessary assignees within 60 days. |
| Prevent role ambiguity. | 0 objects contain the same user in Assignees and Collaborators after save. |
| Improve auditability. | 100% collaborator add, remove, and promotion events are recorded in activity log. |

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Assignee, I want to reply to customers so that I can handle the conversation or ticket directly. | 1\. Given I am listed as an Assignee, When I open the Conversation or Ticket, Then I can use "Balas pelanggan". 2\. Given I am listed as an Assignee, When I click open, close, reopen, or resolve, Then the action is allowed based on object status and RBAC. 3\. Given I am not listed as an Assignee, When I try to send a customer reply, Then the customer reply action is blocked. |
| US-002 | P0 | As a Collaborator, I want to view the Conversation or Ticket and add internal notes so that I can help without contacting the customer. | 1\. Given I am listed as a Collaborator, When I open the Conversation or Ticket, Then I can view the thread based on Team Inbox visibility rules. 2\. Given I am listed as a Collaborator, When I use "Catatan internal", Then the note is saved as internal and not visible to the customer. 3\. Given I am listed as a Collaborator, When I open the composer, Then "Balas pelanggan" is disabled. 4\. Given I am listed as a Collaborator, When I try to close, reopen, or resolve, Then the action is blocked. |
| US-003 | P0 | As a Supervisor, I want to add Collaborators so that I can involve other team members without giving reply access. | 1\. Given I have permission to manage collaborators, When I add an active user as Collaborator, Then the user appears in the Collaborators list. 2\. Given the selected user is already an Assignee, When I try to add them as Collaborator, Then the system blocks the action and shows "User ini sudah menjadi assignee". 3\. Given the selected user is inactive, When I try to add them as Collaborator, Then the system blocks the action and shows "User tidak aktif". |
| US-004 | P0 | As a Supervisor, I want to promote a Collaborator into an Assignee so that they can take customer-facing ownership. | 1\. Given a user is already a Collaborator, When I add the same user as Assignee, Then the system removes the user from Collaborators automatically. 2\. Given the promotion succeeds, When the activity log is viewed, Then it records "Dipindahkan dari kolaborator ke assignee". 3\. Given the assignee save fails, When the system rolls back, Then the user remains as Collaborator. |
| US-005 | P0 | As a user, I want clear role labels so that I understand why I can or cannot reply. | 1\. Given I am an Assignee, When I open the sidebar, Then my user chip appears under "Assignee". 2\. Given I am a Collaborator, When I open the sidebar, Then my user chip appears under "Kolaborator". 3\. Given I am a Collaborator, When I hover disabled customer reply controls, Then I see "Hanya assignee yang dapat membalas pelanggan". |
| US-006 | P1 | As an Admin, I want collaborator actions logged so that ownership and assistance history are auditable. | 1\. Given a Collaborator is added, When the action succeeds, Then the activity log records actor, target user, object ID, and timestamp. 2\. Given a Collaborator is removed, When the action succeeds, Then the activity log records actor, target user, object ID, and timestamp. 3\. Given a Collaborator is promoted to Assignee, When the action succeeds, Then the activity log records the role transition. |
| US-007 | P1 | As an Assignee or Supervisor, I want to mention Collaborators in internal notes so that I can request support. | 1\. Given a Collaborator exists, When I type "@" in "Catatan internal", Then the Collaborator appears in mention suggestions. 2\. Given I mention a Collaborator, When the note is saved, Then the Collaborator receives an internal notification. 3\. Given the mentioned user is removed as Collaborator before save, When I submit the note, Then the note still saves and mention delivery is skipped. |

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Role Model | 1\. FR-001: System MUST keep existing multi-assignee behavior for Conversation and Ticket. 2\. FR-002: System MUST add Collaborators as a separate user list on Conversation and Ticket. 3\. FR-003: System MUST enforce Assignee as a higher permission role than Collaborator. 4\. FR-004: System MUST prevent the same user from existing in Assignees and Collaborators on the same object. |
| Assignee Permissions | 1\. FR-005: Assignees MUST be able to reply to customers if the object status allows replies. 2\. FR-006: Assignees MUST be able to add internal notes. 3\. FR-007: Assignees MUST be able to open, close, reopen, or resolve based on RBAC and object status. 4\. FR-008: Assignees MUST be able to view full object context based on Team Inbox scope. |
| Collaborator Permissions | 1\. FR-009: Collaborators MUST be able to view Conversation or Ticket based on Team Inbox visibility rules. 2\. FR-010: Collaborators MUST be able to add internal notes. 3\. FR-011: Collaborators MUST NOT be able to send customer replies. 4\. FR-012: Collaborators MUST NOT be able to open, close, reopen, resolve, or change customer-facing status. 5\. FR-013: Collaborators MUST NOT be shown as assignee in assignment-based performance reports. |
| Add Collaborator | 1\. FR-014: Users with manage collaborator permission MUST be able to add active users as Collaborators. 2\. FR-015: System MUST block adding inactive users as Collaborators. 3\. FR-016: System MUST block adding an existing Assignee as Collaborator. 4\. FR-017: System MUST support adding multiple Collaborators in one save action. 5\. FR-018: Bulk add MUST skip invalid users and show a validation summary before save. |
| Promote Collaborator to Assignee | 1\. FR-019: When a Collaborator is added as Assignee, System MUST automatically remove that user from Collaborators. 2\. FR-020: Promotion MUST be atomic. 3\. FR-021: If promotion fails, System MUST keep the previous Collaborator state. 4\. FR-022: System MUST write an activity log for automatic Collaborator removal during promotion. |
| Remove Assignee | 1\. FR-023: Removing a user from Assignees MUST NOT automatically add them as Collaborator. 2\. FR-024: If the user should remain involved, the user MUST be added manually as Collaborator. 3\. FR-025: System MAY show optional action "Pindahkan ke kolaborator" after removing an Assignee. |
| Composer Behavior | 1\. FR-026: "Balas pelanggan" tab MUST be enabled for Assignees only. 2\. FR-027: "Balas pelanggan" tab MUST be disabled for Collaborators. 3\. FR-028: "Catatan internal" tab MUST be enabled for Assignees and Collaborators. 4\. FR-029: Viewer users without collaborator or assignee role MUST follow existing RBAC for internal notes. |
| Ticket Behavior | 1\. FR-030: Ticket Collaborators MUST follow the same permission rules as Conversation Collaborators. 2\. FR-031: Ticket Collaborators MUST NOT update ticket status. 3\. FR-032: Ticket Collaborators MUST NOT reply to customers from Ticket Room. 4\. FR-033: Ticket Collaborators MUST be able to add internal ticket notes. |
| Activity Log | 1\. FR-034: System MUST log collaborator\_added. 2\. FR-035: System MUST log collaborator\_removed. 3\. FR-036: System MUST log collaborator\_promoted\_to\_assignee. 4\. FR-037: System MUST log blocked customer reply attempts by Collaborators. |
| Reporting | 1\. FR-038: Assignee metrics MUST not include Collaborators. 2\. FR-039: Collaborator notes MAY be counted in collaboration activity metrics. 3\. FR-040: SLA attribution MUST remain based on Assignee at event time. |

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Duplicate Role | Block adding an Assignee as Collaborator. | Show "User ini sudah menjadi assignee". |
| EH-002 | Promotion Save Failure | Roll back to previous state. | Show "Gagal menjadikan assignee. Coba lagi". |
| EH-003 | Inactive User | Block add as Collaborator or Assignee. | Show "User tidak aktif". |
| EH-004 | Permission Denied | Hide or disable collaborator management controls. | Show "Akses ditolak" if forced. |
| EH-005 | Customer Reply Blocked | Block message send and keep draft text. | Show "Hanya assignee yang dapat membalas pelanggan". |
| EH-006 | Internal Note Save Failure | Retry save up to 3 times. Keep draft if still failed. | Show "Gagal menyimpan catatan. Coba lagi". |
| EH-007 | Stale Role State | Refresh role list before save if object was updated by another user. | Show "Data berubah. Silakan cek kembali". |
| EH-008 | User Not Found | Block save and remove invalid option from selector. | Show "User tidak ditemukan". |
| EH-009 | Object Closed | Disable customer reply for all users unless reopened. | Show "Percakapan ditutup. Buka kembali untuk membalas". |
| EH-010 | Audit Log Delay | Do not block user action. Queue audit event for retry. | Show no user-facing error. |

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | User is Collaborator and added as Assignee. | User is removed from Collaborators and added to Assignees. | Toast "User dipindahkan ke assignee". |
| EC-002 | User is Assignee and added as Collaborator. | Action is blocked. | Show "User ini sudah menjadi assignee". |
| EC-003 | User is removed from Assignees. | User is not automatically added to Collaborators. | Optional action "Pindahkan ke kolaborator". |
| EC-004 | Collaborator opens a closed ticket. | Collaborator can view and add internal notes if notes are allowed on closed objects. | "Balas pelanggan" disabled. |
| EC-005 | Collaborator is removed while typing internal note. | Save is allowed if user still has note permission at submit time. Otherwise block save. | Show "Akses catatan berubah". |
| EC-006 | Assignee is removed while composing customer reply. | Sending is blocked at submit time. Draft remains. | Show "Anda bukan assignee lagi". |
| EC-007 | Bulk collaborator add includes existing Assignee. | Assignee user is skipped. Other valid users are added. | Show "1 user dilewati karena sudah menjadi assignee". |
| EC-008 | Same user appears twice in collaborator picker. | Deduplicate before save. | No duplicate chip shown. |
| EC-009 | Supervisor removes last Assignee. | Allow only if object can be unassigned by current policy. Otherwise block. | Show "Minimal 1 assignee diperlukan". |
| EC-010 | Object moved to another Team Inbox. | Keep Assignees and Collaborators only if they remain valid in target scope. Invalid users are removed based on move policy. | Show move summary before confirm. |
| EC-011 | Collaborator loses Team Inbox access. | Remove from Collaborators or make inaccessible based on RBAC sync policy. | Show no object in list. |
| EC-012 | API sends overlapping assigneeIds and collaboratorIds. | Assignee wins. System removes overlap from collaboratorIds. | Activity log records auto-correction. |

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Assignees Section | Existing multi-select list for assignees. Label stays "Assignee". | User opens sidebar and sees Assignee chips with avatars. | US-001, US-004 |
| Collaborators Section | New user list below Assignees. Label "Kolaborator". | User clicks "Tambah kolaborator", selects active users, then saves. | US-002, US-003 |
| Collaborator Selector | Searchable user picker filtered by Team Inbox scope and active status. | Existing Assignees are disabled in picker. Disabled reason says "Sudah menjadi assignee". | US-003 |
| Promotion Flow | Adding a Collaborator to Assignees automatically removes them from Collaborators. | User adds Collaborator in Assignee selector, saves, and sees toast "User dipindahkan ke assignee". | US-004 |
| Read-only Customer Reply Composer | Customer reply tab disabled for Collaborators. | Collaborator opens room and sees disabled "Balas pelanggan". Tooltip says "Hanya assignee yang dapat membalas pelanggan". | US-002, US-005 |
| Internal Note Composer | Internal note tab available for Collaborators. | Collaborator selects "Catatan internal", writes note, and sends. | US-002, US-007 |
| Header Badge | Role badge shows current user role. | Assignee sees "Anda assignee". Collaborator sees "Anda kolaborator". | US-005 |
| Activity Log | Logs collaborator changes. | Supervisor opens Activity Log and sees add, remove, and promotion records. | US-006 |
| Empty State | Collaborators section has no users. | Show "Belum ada kolaborator". CTA "Tambah kolaborator". | US-003 |
| Loading State | User picker is loading. | Show "Memuat user". Disable save until loaded. | US-003 |
| Error State | User picker fails. | Show "Gagal memuat user. Coba lagi". | US-003 |
| Disabled State | Collaborator lacks action permission. | Hide close, reopen, resolve, and customer reply controls. | US-002, US-005 |

## **10\. Field & Validation**

| Field | Type | Rules | Required |
| ----- | ----- | ----- | ----- |
| assigneeIds | Array of user IDs | 1\. Existing behavior remains multi-select. 2\. User must be active. 3\. User must be valid in current Team Inbox scope. 4\. User must be removed from collaboratorIds when added here. | Conditional |
| collaboratorIds | Array of user IDs | 1\. User must be active. 2\. User must be valid in current Team Inbox scope. 3\. User must not exist in assigneeIds. 4\. Max 20 collaborators per object. 5\. Duplicate user IDs are not allowed. | Optional |
| roleConflictPolicy | Enum | 1\. Allowed value: assignee\_wins. 2\. Default value: assignee\_wins. 3\. Used when API or race condition sends overlapping roles. | Required |
| collaboratorNotePermission | Boolean | 1\. Default true for Collaborators. 2\. Controlled by RBAC if workspace disables collaborator notes. | Required |
| customerReplyPermission | Boolean | 1\. True for Assignees. 2\. False for Collaborators. 3\. Can be true for Supervisor or Admin only if override permission exists. | Required |
| collaboratorAddedAt | Datetime | 1\. Stored in ISO 8601\. 2\. Used for audit and sorting. | Auto |
| collaboratorAddedBy | User ID | 1\. Must be active at action time. 2\. Stored for audit. | Auto |
| promotionSourceRole | Enum | 1\. Value is collaborator when user is promoted. 2\. Empty for direct assignee add. | Auto |

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Role list load must be under 500 ms at P95 for up to 20 collaborators. |
| Performance | Save role changes must complete under 1 second at P95. |
| Reliability | Promotion from Collaborator to Assignee must be atomic. |
| Security | Collaborators must never send customer-facing messages unless they become Assignees or have explicit override permission. |
| Privacy | Collaborator visibility must follow existing Team Inbox and RBAC visibility rules. |
| Observability | Track collaborator add, remove, promotion, blocked reply attempt, and note creation events. |
| Accessibility | Disabled controls must include accessible labels and keyboard focus explanation. |
| Auditability | 100% role changes must be recorded in activity log. |

## **12\. Dependencies & Risks**

| Item | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Existing Assignee model | Product and Engineering | Existing multi-assignee behavior must not regress. | Add regression tests for current assignment flows. |
| RBAC service | Engineering | Incorrect permission could allow Collaborator to reply. | Add explicit permission checks at submit time. |
| Conversation Room composer | Design and Engineering | Disabled customer reply tab must be clear. | Use role banner and tooltip. |
| Ticket Room composer | Design and Engineering | Ticket permission must match Conversation permission. | Reuse same permission model. |
| Activity Log | Engineering | Missing logs reduce audit quality. | Add required audit event schema. |
| Team Inbox visibility | Product and Engineering | Collaborator may lose access after move. | Validate collaborators during move and role sync. |
| Risk: Role confusion | Product and Design | Users may not understand Assignee versus Collaborator. | Use clear labels, helper text, and disabled-state copy. |
| Risk: Overuse of Collaborators | Product | Too many collaborators can create noise. | Set max 20 collaborators per object. |

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Customer replies sent by valid Assignees | 100% | Ongoing | Message send logs |
| Role overlap incidents after save | 0 | Ongoing | Validation logs |
| Collaborator internal note usage | 30% of cases with collaborators | 60 days | Product analytics |
| Assignee-only reply block accuracy | 100% | Ongoing | Permission test logs |
| Assignment regression incidents | 0 critical | 30 days after launch | QA and support tickets |
| Activity log coverage for collaborator events | 100% | Ongoing | Audit logs |

## **14\. Future Considerations**

| Topic | Why It Matters Later |
| ----- | ----- |
| Collaborator notification preferences | Reduce noise for users added only for awareness. |
| Suggested collaborators | Recommend experts based on tags, ticket type, or previous cases. |
| Temporary collaborator access | Useful for escalation with automatic expiry. |
| Field-level collaborator permission | Some teams may want collaborators to edit tags or attributes. |
| Collaborator analytics | Measure cross-team assistance and escalation patterns. |

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Collaborators cannot reply to customers. | Teams must promote a Collaborator to Assignee before customer-facing handling. |
| Collaborators cannot open, close, reopen, or resolve. | Status ownership remains with Assignees and authorized supervisors. |
| Max 20 collaborators per object. | Large incident rooms may need group-level collaboration later. |
| No automatic collaborator conversion after Assignee removal. | Users must explicitly add ex-assignees as Collaborators. |
| Collaborator permissions follow Team Inbox scope. | Users outside the target Team Inbox may not remain collaborators after object move. |

## **16\. Appendix**

| Item | Definition |
| ----- | ----- |
| Assignee | User assigned to handle the Conversation or Ticket. Existing multi-assignee behavior is retained. |
| Collaborator | Internal participant who can view and add internal notes but cannot reply to customer or change customer-facing status. |
| Role Conflict Rule | Assignee wins. A user cannot exist in Assignees and Collaborators on the same object. |
| Promotion | Action where a Collaborator is added as Assignee and automatically removed from Collaborators. |
| UI Labels | "Assignee", "Kolaborator", "Tambah kolaborator", "Balas pelanggan", "Catatan internal", "User ini sudah menjadi assignee", "Hanya assignee yang dapat membalas pelanggan", "User dipindahkan ke assignee". |
| Permission Summary | Assignees can reply, open, close, reopen, resolve, and add notes. Collaborators can view and add internal notes only. |

