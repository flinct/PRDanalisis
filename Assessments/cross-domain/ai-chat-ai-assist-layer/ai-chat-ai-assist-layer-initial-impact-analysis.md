# Initial Impact Analysis — AI Chat / AI Assist Layer

## Directly Affected Modules
- Live chat widget configuration and runtime behavior
- WhatsApp channel automation path, especially Official API surface
- Omnichannel inbox conversation flow
- Ticket draft / summary / classification assist flow
- Analytics pages for conversation and ticket
- Timeline / audit / notification surfaces

## Indirectly Affected Modules
- Contact identity resolution if AI uses customer context
- Team inbox / routing / assignment resolver
- Presence / availability logic if AI decides handoff or no-agent path
- SLA metric calculators and analytics aggregators
- Reporting/export if AI-originated events enter metrics datasets

## Database Impact
- Likely new entities for AI policy/config, AI run/event log, handoff state, confidence metadata, suggestion artifacts, analytics counters
- Must avoid polluting existing message/agent attribution semantics
- Feature flag or per-channel enablement config likely needed

## API Contract Impact
- New endpoints for AI config, AI logs, AI analytics, suggestion retrieval, maybe handoff controls
- Conversation/ticket payloads may need AI metadata fields
- Event contract needed for AI-generated outbound, handoff, skip/failure reasons

## Frontend Impact
- Widget needs AI-first or assisted state UI
- Inbox needs AI badge/state, handoff summary, suggestion surfaces
- Ticket detail/create flow needs AI summary/classification suggestion widgets
- Analytics pages need AI KPI cards and charts or new AI analytics section

## Automation Testing Impact
- New test packs needed for live chat AI, WhatsApp AI, ticket AI assist, analytics
- Existing widget, WA, inbox, ticket, analytics tests need regression expansion
- Bot/non-bot metric exclusion must be asserted

## Security / RBAC Impact
- Need role matrix for configure AI / view logs / approve suggestions / see analytics
- Must guarantee tenant isolation and no cross-tenant knowledge leak
- Bot action auditability required

## Performance Risks
- Inbound message path may add latency
- Async orchestration likely needed to avoid blocking channel receive path
- Analytics may need pre-aggregation for AI KPIs

## Concurrency Risks
- Duplicate inbound processing may send duplicate AI replies
- Agent reply vs pending AI reply race
- Handoff vs AI follow-up race
- Ticket state may change while AI draft/summary is being generated

## Regression Scope
- Widget manual flow
- WhatsApp Official message send path
- Conversation routing/assignment
- Timeline and audit trail
- Ticket creation from conversation
- Conversation and ticket analytics baseline

## Migration / Deployment Risks
- Should roll out behind feature flags per channel/account
- Must support clean disable path without breaking manual service flow
- Historical metrics may need exclusion logic from rollout date forward

## Recommended Additional Validations
- Duplicate inbound idempotency
- Low-confidence fallback
- Human handoff continuity
- Bot message exclusion from SLA and agent metrics
- AI analytics consistency vs raw event logs
