# Deep Analysis Notes: WA Web Outbound Anti-Ban Guard

## PRD v0.1 — Current Status: REVISE_PRD (NO_GO)

7 Open Questions blocking implementation:
1. OQ-01: Phase 1 scope — text only vs attachments/templates
2. OQ-02: Canonical fingerprint normalization rules
3. OQ-03: Manual vs broadcast collision precedence
4. OQ-04: In-flight behavior when safe mode activates
5. OQ-05: IT Support override model
6. OQ-06: Sender restriction signal source of truth
7. OQ-07: Tenant isolation FR (elevated from NFR)

## Additional gaps I need to explore:

### Logical gaps
- Pagination/performance for audit log query (FR-028) — no pagination strategy mentioned for high-volume tenants
- What happens if Redis is down? The entire anti-ban guard becomes a SPOF for outbound sends
- No mention of rate limiting for the anti-ban settings API itself (PATCH settings could be abused)
- Operator risk score decay mechanism not defined — does score reset after cooldown?
- No mention of what happens when multiple operators share the same sender account — risk aggregation?

### Edge cases not covered
- What if recipient has been deleted/blocked the sender?
- What about group messages? Are they in scope?
- Template messages with dynamic parameters — how does fingerprint work?
- What about scheduled messages that fire during cooldown?
- Message recall/delete and its interaction with deduplication?

### Cross-service issues
- No contract testing/versioning strategy mentioned for the new gRPC/RabbitMQ contracts
- No SLA for safe mode activation latency (FR says "within 5 seconds" but no test strategy for this)
- Error handling for anti-ban service degradation — FR says "degrade safely" but no specific behavior
