# Product Context

## Domain

Customer service live chat platform with WhatsApp integration.

---

# Canonical Rules

## Contact

- One global contact per customer.
- Phone number is unique identifier.

## Room Chat

- Status flow:
  unassigned -> ongoing -> solved
- Reopen creates new ongoing room.
- Solved room is immutable.

---

# RBAC Rules

- Sales only sees Sales Area Context.
- Operational only sees Operational Area Context.
- Super Admin bypasses restrictions.

---

# Dependencies

- Broadcast depends on Contact visibility.
- KPI depends on room ownership.
- Queue depends on division assignment.

---

# Risk Areas

- Cross-division visibility leakage.
- Duplicate contact merge race condition.
- Queue synchronization inconsistency.

---

# Regression Sensitive

- Assignment flow
- Reopen flow
- Broadcast filtering
- Multi-handler synchronization

---

# Resolved Decisions

- Duplicate detection uses normalized phone number.
- Reopen creates new room instead of reopening old room.
- Ticket SLA reopen creates a new SLA cycle.

---

# Open Questions

- Conversation SLA reopen behavior still undefined (ticket SLA already defines it).
