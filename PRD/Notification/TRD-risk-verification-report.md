# TRD Risk Verification Report — Notification Recipient & Channel Expansion

**Date:** 2026-08-10
**Verifier:** Automated codebase cross-reference
**PRD:** notification-recipient-channel-expansion-PRD-v1.md (v0.3)
**BE Repo:** omnichannel-satuinbox-be (NestJS Nx monorepo)
**FE Repo:** omnichannel-satuinbox-fe (Next.js)

---

## Summary

| Risk | Status | Severity | Blocking? |
|------|--------|----------|-----------|
| R-1  | **CONFIRMED** | Critical | **Yes — Phase 2** |
| R-2  | PLAUSIBLE | Medium | No — deferred |
| R-3  | **CONFIRMED** | High | **Yes — Phase 1** |
| R-4  | PREMATURE | Low | No — code doesn't exist yet |
| R-5  | CONFIRMED (absence) | Medium | **Yes — Phase 4** |
| R-6  | UNVERIFIABLE | Medium | Ops-dependent |
| R-7  | UNVERIFIABLE | Low | Organizational |
| R-8  | PREMATURE | Low | No — schema doesn't exist yet |
| R-9  | PREMATURE | Low | No — code doesn't exist yet |
| R-10 | **CONFIRMED** | Medium | No — correct in current code, schema trap |

---

## Risk-by-Risk Verification

### R-1: Soft-cap / rollup conflict with FR-011 and FR-014

**Status: CONFIRMED**

**Code evidence:**

| Claim | File | Line(s) | Verified |
|-------|------|---------|----------|
| `UPDATES_SOFT_CAP_PER_HOUR = 2` | `apps/notification-service/src/app/interfaces/in-app-notification.interface.ts` | 118 | ✅ Value is `2` |
| Doc comment says "20/hour" | `apps/notification-service/src/app/processors/in-app-notification.processor.ts` | 31 | ✅ **MISMATCH** — comment says "20/hour", code is 2 |
| Soft cap applies to ALL Updates group | `in-app-notification.processor.ts` | 100–126 | ✅ Guard is `if (group === NotificationGroupEnum.UPDATES)` — no conversation_ticket exemption |
| Rollup deletes previous notification | `notification.repository.ts` | 280–297 | ✅ `findOneAndDelete` within 120s window |
| Digest placeholder created on cap | `in-app-notification.processor.ts` | 246–287 | ✅ Creates `UPDATES_DIGEST` type notification |
| SLA exempt from rollup but NOT soft cap | `in-app-notification.processor.ts` | 103 vs 118 | ✅ `isSlaEvent` check at rollup only; soft cap has no exemption |

**PRD conflict analysis:**

- **FR-011** (line 116): "Channel toggle MUST control real-time delivery only. Historical notification list visibility MUST NOT be affected by toggle state." → The soft cap silently replaces individual notifications with a digest placeholder. The original notification records are never created, so they can never appear in history. **Violated.**
- **FR-014** (line 124): "System MUST NOT coalesce different `eventId`s into a single notification." → The rollup deletes the previous notification and creates a new one; the digest collapses multiple events into one record. **Violated.**
- **FR-013** (line 123): "at most one notification record per `(recipientUserId, eventId)` pair" → Rollup deletes the record for the previous eventId. **Violated.**

**Doc-comment mismatch:** Processor line 31 says "Updates soft cap of 20/hour" but the actual constant is 2. This suggests either (a) the value was changed after the doc was written, or (b) the doc is aspirational and the code is wrong. Either way, it's a bug — the code and comment disagree by 10x.

**Severity: Critical.** Two assignment/unassignment events in one hour triggers digest mode for all subsequent updates. This makes the Updates notification group nearly useless for operational awareness.

**Blocking:** Phase 2 (recipient tightening). The soft cap logic must be fixed before new operational notification types are added.

**Proposed fix:** Exempt `conversation_ticket` category events from the soft cap (or raise the cap to 20 as the doc comment suggests). Consider separating "noisy" events (reopen, SLA) from "actionable" events (assign, unassign) with different caps.

---

### R-2: GetMemberByUserId latency on wide fan-out

**Status: PLAUSIBLE — not directly verifiable from code**

**Code evidence:**

| Claim | File | Line(s) | Verified |
|-------|------|---------|----------|
| GetMemberByUserId gRPC exists | `apps/people-service/src/app/controllers/member.controller.ts` | 28 | ✅ `GetMemberByUserIdRequest` imported |
| MemberServiceControllerMethods registered | `member.controller.ts` | 87 | ✅ gRPC service interface |

**Analysis:** The gRPC method exists. The TRD claims per-recipient role lookup dominates latency on wide supervisor fan-out. This is a runtime performance concern that cannot be verified from static code — it depends on:
- Number of supervisors per team
- people-service gRPC latency (p95)
- Whether results are cached

The current notification-service code (`in-app-notification.processor.ts`) does not show the supervisor fan-out logic — it processes one recipient at a time via `@MessagePattern`. The fan-out to multiple recipients (assignee + supervisors) must happen upstream in conversation-service/ticket-service.

**PRD mapping:** Not directly tied to a specific FR, but impacts the §19 KPI "Supervisor intake notification success rate ≥99% within 3s p95" (line 467).

**Severity: Medium.** Latency concern is valid but not blocking — can be addressed with batching or caching after launch.

---

### R-3: @MessagePattern crash gap — no redelivery

**Status: CONFIRMED**

**Code evidence:**

| Claim | File | Line(s) | Verified |
|-------|------|---------|----------|
| `@MessagePattern` decorator | `in-app-notification.processor.ts` | 56 | ✅ `@MessagePattern(EventTypeEnum.IN_APP_NOTIFICATION_CREATE)` |
| DB create before gateway emit | `in-app-notification.processor.ts` | 132–154 (create), 157 (emit) | ✅ Two-step: save then emit |
| try/catch just logs | `in-app-notification.processor.ts` | 158–160 | ✅ `this.logger.error(...)` — no rethrow, no nack |
| No explicit ack/nack | entire handler | 58–161 | ✅ NestJS `@MessagePattern` auto-acks on return |

**Analysis:** The handler flow is:
1. Validate (lines 64–78)
2. Dedup check (lines 87–97)
3. **Create notification in MongoDB** (lines 132–154)
4. **Emit to API Gateway** via RMQ (line 157)

If the process crashes between steps 3 and 4, the notification record exists in the DB but no real-time WebSocket event is emitted. On restart, RabbitMQ has already acked the message (auto-ack with `@MessagePattern`), so the event is lost for real-time delivery.

**Contradiction with PRD EH-005** (line 185): "Notification-service queue processor crashes mid-event → Rely on RabbitMQ ack/redelivery; dedupe key prevents duplicate on retry." This assumes manual ack/nack with `@EventPattern` + `Ctx`, NOT `@MessagePattern` auto-ack. **The PRD's own error handling strategy is incompatible with the current implementation.**

**Severity: High.** Users miss real-time notifications on process crashes. The notification will appear on next page load (it's in the DB), but the real-time "pop" is lost.

**Blocking:** Phase 1. Should switch to `@EventPattern` with manual ack, or add a post-create reconciliation step.

---

### R-4: Receipt cron double-polling

**Status: PREMATURE — code does not exist**

**Code evidence:**

| Claim | Verified |
|-------|----------|
| Receipt cron exists | ❌ No `@Cron` decorator in notification-service |
| Receipt reconciliation processor | ❌ Not found |

**Analysis:** No receipt reconciliation cron exists in the codebase. The `ReminderScheduleProcessor` and `ComebackScheduleProcessor` use `@MessagePattern` (RMQ-driven), not `@Cron` (timer-driven). The receipt reconciliation is a Phase 4 deliverable per FR-017k.

The TRD's concern about Redis locking is valid as a design recommendation for when this code is built, but it's not a current codebase risk.

**PRD mapping:** FR-017k (line 150): "reconcile push receipts…no earlier than 15 minutes after send."

**Severity: Low.** Not blocking anything. Document as a design requirement for Phase 4 implementation.

---

### R-5: expo-server-sdk dependency

**Status: CONFIRMED (absence)**

**Code evidence:**

| Claim | Verified |
|-------|----------|
| expo-server-sdk in package.json | ❌ Not found in root `package.json` or `package-lock.json` |
| @nestjs/axios in notification-service | ❌ Not found |

**Analysis:** Neither dependency exists. The TRD correctly identifies this as a dependency that needs to be added for Phase 4 (Expo push integration). The fallback to `@nestjs/axios` behind a wrapper is a reasonable recommendation — avoids a new dependency for what is essentially one HTTP POST endpoint.

**PRD mapping:** FR-015 (line 125): "send mobile push through the Expo Push Notification Service."

**Severity: Medium.** Blocking Phase 4. Must be resolved before mobile push is implemented.

---

### R-6: Egress to exp.host blocked in production

**Status: UNVERIFIABLE from code**

**Analysis:** This is an infrastructure/network policy concern. No code evidence can confirm or deny production egress rules. The PRD §18 (line 452) acknowledges "Expo Push Notification Service is a third-party hop" and mitigates with `mobile_push_v1` feature flag.

**Severity: Medium.** Ops-dependent. Verify with DevOps before Phase 4.

---

### R-7: Mobile app built by another team

**Status: UNVERIFIABLE — organizational concern**

**Analysis:** The PRD §18 (line 451) acknowledges this: "Mobile app `expo-notifications` integration…Blocks Phase 4 rollout. Ship BE first; mobile follows independently behind app flag."

**Severity: Low.** Already acknowledged in PRD. Not a codebase risk.

---

### R-8: mobiledevicetokens unique index conflict

**Status: PREMATURE — schema does not exist**

**Code evidence:**

| Claim | Verified |
|-------|----------|
| mobiledevicetokens collection | ❌ Not found in codebase |
| expoPushToken field | ❌ Not found |

**Analysis:** The `mobiledevicetokens` schema has not been built yet. The PRD §14.3 (referenced in v0.3 changelog) defines the contract for this collection, but no implementation exists. The TRD's concern about concurrent upsert conflicts is a valid design consideration for when the schema is created.

**PRD mapping:** FR-017g (line 146): token registration endpoint. FR-017j (line 149): ticket persistence.

**Severity: Low.** Design recommendation for Phase 4 schema implementation. Use MongoDB `findOneAndUpdate` with `upsert: true` and `unique: true` index on `expoPushToken`.

---

### R-9: teamInboxNotifiedAt persisted marker for intake dedup

**Status: PREMATURE — code does not exist**

**Code evidence:**

| Claim | Verified |
|-------|----------|
| `teamInboxNotifiedAt` field in BE | ❌ Not found in any service |
| Intake dedup marker pattern | ❌ No `findOneAndUpdate` marker pattern for intake |

**Analysis:** The TRD states: *"Intake events need a persisted marker, not a time window — teamInboxNotifiedAt set via a conditional findOneAndUpdate, so FR-020 (no re-fire on rehydrate/retry/reassignment) holds by construction."* However, no intake dedup marker of any kind exists in the current BE codebase. The field name `teamInboxNotifiedAt` is not present in any service, schema, or repository. No equivalent marker pattern (e.g., a flag set on first intake notification to prevent re-fire) was found either.

This is a TRD design specification for code that has not been written yet.

**PRD mapping:** FR-020 (no re-fire on rehydrate/retry/reassignment). This is a Phase 2+ concern as intake notification dispatch is part of the recipient tightening scope.

**Severity: Low.** The TRD's proposed mechanism (conditional `findOneAndUpdate` on a persisted marker) is sound as a design recommendation. Implement when intake notification dispatch is built.

---

### R-10: member.id vs member.user.id id-space quirk

**Status: CONFIRMED**

**Code evidence:**

| Claim | File | Line(s) | Verified |
|-------|------|---------|----------|
| `member.id` stored as participant.userId in ticket schema | `ticket.service.ts` | 2067–2068 | ✅ Comment: "member.id (which is stored as participant.userId in the ticket schema — a known inconsistency)" |
| Notification dispatch uses `member.user?.id` | `ticket.service.ts` | 2088 | ✅ `const recipientUserId = member.user?.id` — correct |
| `member.id` used elsewhere as userId | `ticket.repository.ts` | 1298, 2757, 2870 | ✅ `formatStringToMongoObjectId(member.id)` — uses member.id, NOT member.user.id |
| `message.service.ts` documents the trap | `message.service.ts` | 78 | ✅ Comment: "because ticket participant.userId stores member.id (not user.id)" |

**Analysis:** Two distinct ID spaces exist:
- `member.id` — the member document's own `_id` in the people-service members collection.
- `member.user.id` — the actual user account ID (the `userId` in the auth system).

The ticket schema's `participant.userId` stores `member.id`, not `member.user.id`. This means any code that reads participants from a ticket and uses their stored userId as a notification recipient target will hit the wrong ID space. The current `emitTicketAssignNotifications` (line 2066) correctly resolves `member.user?.id` — but the ticket.repository.ts methods (lines 1298, 2757, 2870) use `member.id` for participant storage.

**Risk:** Any future code that looks up ticket participants and dispatches notifications using the stored `participant.userId` without going through the member → user resolution will silently send to the wrong user (or nobody). This is a latent trap, not an active bug in current code.

**PRD mapping:** Phase 2 supervisor resolver — when fan-out resolves supervisors from ticket participants, it must use `member.user.id`, not the stored `participant.userId`.

**Severity: Medium.** No active bug (current notification code resolves correctly), but the schema inconsistency is a documented trap. Any Phase 2 code that reads participants from tickets must account for this.

**Blocking:** No — current code is correct. Must be documented as a known pitfall for Phase 2 implementors.

---

## Gap Analysis: Risks the TRD Missed

### G-1: FR-017e violation — click-through does NOT mark as read

**Evidence:**
- PRD FR-017e (line 137): "Opening a notification via tap/click MUST mark that notification as read."
- FE `use-notification-actions.ts` line 24–27: `handleNotificationClick` only does `window.location.href = notification.actionLink` — **no mark-read call**.
- `handleMarkAsRead` is a separate action bound to the mark-read button, not triggered on card click.

**Severity: Medium.** UX inconsistency — users expect click = read.

### G-2: Dedup uses app-level check, not unique index (race condition)

**Evidence:**
- PRD §18 (line 458) recommends: "Unique index on `(userId, eventId)` at DB level, not app-level check."
- Current implementation: `notification.repository.ts` line 264–273 uses `countDocuments` with time window — two concurrent messages with the same `dedupKey` could both pass the check.
- The schema (`notification.schema.ts` line 100–101) has `dedupKey` indexed but NOT unique.

**Severity: Medium.** Race condition can cause duplicate notifications under concurrent load.

### G-3: PRD EH-005 assumes manual ack — current code auto-acks

**Evidence:**
- PRD EH-005 (line 185): "Rely on RabbitMQ ack/redelivery."
- Code uses `@MessagePattern` (auto-ack) not `@EventPattern` + manual `Ctx.ack()`.

This is the same as R-3 but frames it as a PRD-code contract violation, not just a crash gap.

**Severity: High.** (Covered by R-3.)

### G-4: Expo MessageRateExceeded backoff not implemented

**Evidence:**
- PRD EH-011 (line 191): "Apply per-token exponential backoff."
- No Expo push code exists yet (Phase 4).

**Severity: Low.** Phase 4 design requirement. Document in implementation plan.

### G-5: Token rotation / re-registration not addressed

**Evidence:**
- PRD FR-017g defines token format validation.
- No code exists for token lifecycle (register, rotate, invalidate on app reinstall).
- TRD R-8 partially covers this but only for the unique index conflict.

**Severity: Low.** Phase 4 concern.

### G-6: Receipt job scaling not addressed

**Evidence:**
- PRD FR-017k: receipts must be reconciled within 24h, ≤1000 ticket ids per request.
- No receipt job exists yet.
- TRD R-4 partially covers this (Redis lock) but misses the chunking requirement for large ticket volumes.

**Severity: Low.** Phase 4 design requirement.

### G-7: Soft cap value doc mismatch (2 vs 20)

**Evidence:**
- `in-app-notification.interface.ts` line 118: `UPDATES_SOFT_CAP_PER_HOUR = 2`
- `in-app-notification.processor.ts` line 31: doc comment says "20/hour"

This is a 10x discrepancy. Either the code or the comment is wrong.

**Severity: High.** (Covered by R-1.)

---

## PRD §18 Cross-Reference

| PRD §18 Risk | TRD Coverage | Gap? | Severity | Recommendation |
|---|---|---|---|---|
| people-service RPC availability | R-2 (partial) | No — covered by EH-001 fallback | — | — |
| Expo/EAS push credentials | R-6 (partial) | No — ops concern | — | — |
| Mobile app expo-notifications | R-7 | No — acknowledged | — | — |
| Expo Push Service third-party hop | R-6 | No — feature flag mitigated | — | — |
| Expo rate limit (600/sec) | Not covered by TRD | **Yes** — no R-number for queue pacing design | Medium | **Phase 4 design requirement.** Implement request batching with configurable batch size and inter-batch delay to stay under 600/sec. Use a Bull/BullMQ rate-limited queue or similar. |
| 4096-byte payload cap | Not covered by TRD | **Yes** — no R-number for truncation design | Medium | **Phase 4 design requirement.** Truncate `body` field before sending to Expo API; keep first 4000 bytes + `[truncated]` suffix. Log truncation events for monitoring. |
| api-gateway socket rule change | Not covered by TRD | **Yes** — regression risk on existing socket delivery | High | **Phase 2 test requirement.** Any change to socket delivery rules in api-gateway must include regression test for existing IN_APP_NOTIFICATION_CREATE path. Add integration test that verifies socket emit after handler completes. |
| IN_APP_NOTIFICATION_CREATE envelope | Not covered by TRD | **Yes** — backward compatibility concern | Low | **Phase 1 (already backward-compatible per Q6).** Current envelope shape (`type`, `data`, `actionLink`, `createdAt`) is additive-safe. New fields added in Phase 2+ must be optional; consumers must ignore unknown fields. |
| Preference collection uniqueness | Not covered by TRD | **Yes** — race condition on concurrent PATCH | Medium | **Phase 3 design requirement.** Use `findOneAndUpdate` with `$set` and optimistic concurrency (version field or `updatedAt` guard). Alternatively, use MongoDB unique index on `(userId, notificationType)` and handle duplicate key errors. |
| Dedupe key implementation | Partially (R-3) | G-2 covers the gap | — | — |

---

## Severity Assessment Summary

### Blocking (must resolve before next phase)

1. **R-1** — Soft cap = 2 breaks operational notifications. Fix before Phase 2.
2. **R-3** — Auto-ack crash gap. Fix before Phase 1 (or accept as known limitation with monitoring).
3. **R-5** — No Expo dependency. Resolve before Phase 4.

### Deferred (design now, implement later)

4. **R-2** — Latency concern. Monitor in staging; add caching if p95 exceeds 3s.
5. **R-4** — Redis lock for receipt cron. Design requirement for Phase 4.
6. **R-8** — Unique index on mobiledevicetokens. Design requirement for Phase 4.

### Accept (acknowledge, no action)

7. **R-6** — Egress blocking. Ops concern, verify with DevOps.
8. **R-7** — Mobile team timeline. Organizational, already in PRD.

### Additional gaps to address

9. **G-1** — FR-017e: add mark-read to click handler. Medium effort.
10. **G-2** — Dedup race condition: add unique index on `(userId, dedupKey)` with TTL. Low effort.
11. **G-7** — Fix doc comment or code value for soft cap. Trivial.
