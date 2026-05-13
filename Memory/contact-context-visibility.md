# Feature Context

- Two PRDs: `PRD Contact.md` (production) and `PRD Contact - context and visibility.md` (update).
- Update adds Area Context (operational/sales) + RBAC visibility scope to existing Contacts module.
- Existing Contacts already in production with one-entity-per-person model, teamInboxIds derivation, and Agent-denied access.

# Canonical Business Rules

- One Global Contact per unique identifier per workspace.
- Contact Area Context is a separate record (contactId, area, teamInboxId, status, source).
- One Global Contact can have multiple Area Contexts.
- Area Context values: `operational`, `sales`.
- Duplicate identifier no longer throws error — shows reuse prompt (add to sales or use existing).
- Contact visibility evaluated in order: module permission → area scope → visibility scope → team inbox → data privacy masking.
- Visibility scopes: `own_and_assigned`, `team`, `all`.
- Agent can access Contacts if role has Client Contacts enabled (new behavior, previously blocked).
- Contact References track source object (conversation, ticket, lead, broadcast) with teamInboxId at source time.

# Lifecycle Rules

- Area Context created on: new contact creation, inbound conversation match, Lead creation, duplicate reuse prompt confirmation.
- Area Context NOT created on: view, search, preview.
- Broadcast recipient picker filtered by Area Context + Visibility Scope + Team Inbox.
- Lead contact picker scoped to Sales Area only.
- Conversation/Ticket contact linking resolves to existing Global Contact and creates Area Context if missing.

# Visibility/RBAC Rules

- Admin default: Area Scope all, Visibility Scope all.
- Supervisor default: Area Scope operational, Visibility Scope team.
- Agent default: Area Scope operational, Visibility Scope own_and_assigned (if Client Contacts enabled).
- Contact list/detail/picker/direct URL must enforce same visibility rules server-side.
- User assigned to conversation/ticket may see contact summary even if centralized Contacts would not show the contact.
- Opening full Contact Detail from assigned conversation still enforces Contacts permission.

# Critical Dependencies

- Existing Contacts data model (teamInboxIds field must be migrated to Contact References).
- Existing Roles Management (must add Contact Area Scope + Contact Visibility Scope fields).
- Broadcast recipient picker (must add area filtering, previously only checked Send Broadcast permission).
- Lead contact picker (must scope to Sales contacts only).
- Inbound conversation matching (must now resolve to Global Contact + manage Area Context).
- Existing API contract for contact creation (duplicate handling changes from error to prompt).

# High Risk Areas

- Supervisor loses visibility of legacy contacts without Area Context after migration.
- Contacts legacy without Team Inbox scope become invisible (zombie records).
- Migration `SHOULD` default mapping creates inconsistency (workspaces may behave differently).
- Duplicate handling change is API breaking — all existing clients must update.
- Contact References backfill for existing conversations/tickets undefined — history could be lost.
- Area Context deactivation effect on existing References not defined.
- Broadcast drafts referencing contacts that become invisible after update.
- Batch role migration could accidentally grant Agent access to Contacts.

# Edge Cases

- Contact with zero conversations/tickets/leads: Area Context only via manual creation.
- Area Context created for Team Inbox A, conversation moves to Team Inbox B: stale context remains.
- Duplicate prompt race: two users try same identifier simultaneously.
- Migration dry-run needed: verify all legacy contacts get correct Area Context.
- Team Inbox membership changes while user views contact list.
- Contact is blocked but has active Area Context: visibility still allowed, Broadcast disabled.

# Technical Constraints

- Migration must happen before API deploy to prevent visibility gap.
- Feature flag recommended to toggle area filtering.
- Backup contact table before migration for rollback.
- Composite indexes needed for contact list with area + visibility + team inbox filters.
- Contact References must be immutable after creation (FR-013).

# Regression Sensitive Areas

- All contact list/detail endpoints (query logic changes fundamentally).
- All contact create/edit flows (duplicate prompt replaces error).
- Conversation contact linking.
- Ticket contact linking.
- Roles CRUD (new fields).
- Broadcast recipient selection.
- Lead contact picker.
- Inbound conversation → contact matching.
- Agent workspace (may now show Contacts).
- Search/filter contacts by identifier.

# Resolved Decisions

- This analysis belongs in feature memory (contact-scoped, not system-wide).
- The update does not invalidate the existing Contacts PRD — it layers on top of it.
- Migration default mapping must use `MUST` not `SHOULD` for consistency.

# Open Questions

- What happens to Area Context when a conversation moves between Operational and Sales Team Inbox?
- What is the exact field boundary between "contact summary" and "contact detail" for FR-060/FR-061?
- How are Contact References backfilled for existing conversations/tickets?
- What happens to Broadcast drafts that reference contacts no longer visible due to area mismatch?
- Should legacy contacts without any Team Inbox scope get a system-level Area Context to remain visible?
