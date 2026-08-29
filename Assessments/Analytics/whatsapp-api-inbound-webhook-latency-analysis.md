# WhatsApp API Inbound Webhook Latency

**Statistical report — `whatsapp_api.whatsappapiwebhooklogs` inbound delivery and processing lag**

| | |
|---|---|
| **Date** | 2026-08-14 |
| **Data** | `brief/seed-data/dumpprod_whatsapp_api.whatsappapiwebhooklogs.json` — 1.28 GB, 775,676 records |
| **Scope** | 220,941 **inbound message** webhooks (status/delivery-receipt webhooks excluded) |
| **Observation window** | 2026-02-27T09:53:34Z → 2026-08-05T05:02:45Z (160 days with data) |
| **Business account** | `282998331574040` (single WABA — all 220,941 records) |
| **Diagrams** | [`diagram/whatsapp-api-webhook-latency-pipeline.md`](../diagram/whatsapp-api-webhook-latency-pipeline.md) |

---

## Executive summary

**99.53% of inbound WhatsApp API messages land in under 30 seconds. 0.16% (359 messages) take more than 5 minutes — and those 359 are late by an average of 3 hours 59 minutes.**

The split matters more than the headline, because the two hops behave completely differently:

- **`message.timestamp` → `createdAt`** (Meta delivers the webhook to us) is where **100% of the latency lives**. Median 1.51 s, p99 6.50 s, worst case **37 h 47 m**.
- **`createdAt` → `processedAt`** (our own pipeline consumes it) is effectively free. Median **7 ms**, p99 **30 ms**, and **not a single record** out of 220,834 exceeded 5 minutes.

So the >5-minute tail is **not a SatuInbox processing problem**. It is inbound webhook delivery — Meta redelivering a backlog after our endpoint failed to acknowledge, or Meta-side delay.

Two further findings the bucket counts hide:

- **The tail is incident-shaped, not chronic.** Only **35 of 160 days** contain any >5 min event; **125 days are completely clean**. Five days account for **76.6%** of all 359 late messages, and the 14–16 April window alone accounts for **164 (45.7%)**.
- **107 inbound messages were never processed at all.** They sit at `status: "received"` with no `processedAt`, despite having arrived normally (ingest lag 1–3 s). They cluster into four tight windows — a stalled-consumer signature, invisible to any latency percentile because they have no end timestamp.

---

## 1. Method

Three latency measurements per inbound record:

| Metric | Definition | What it measures |
|---|---|---|
| **A — Ingest lag** | `createdAt` − `metaData…messages[].timestamp` | Meta → our webhook endpoint |
| **B — Processing lag** | `processedAt` − `createdAt` | Our internal consumer |
| **C — End-to-end** | `processedAt` − `metaData…messages[].timestamp` | Customer send → fully processed |

Inbound records are those whose `metaData.entry[].changes[].value` contains a `messages[]` array. The 554,735 records carrying `statuses[]` (sent/delivered/read receipts) are **excluded** — they are outbound state, not inbound traffic. Every record was verified to carry exactly one message timestamp, so no batch-flattening was required, and 0 records were dropped for missing fields.

Counts differ slightly by metric: Metric A has **n = 220,941**; Metrics B and C have **n = 220,834**, because 107 records have no `processedAt`. Those 107 are reported separately in §5 rather than being silently dropped — they are the worst cases, not missing data.

---

## 2. The three categories

### Metric A — Ingest lag (`message.timestamp` → `createdAt`), n = 220,941

| Category | Messages | Share | Mean within category |
|---|---|---|---|
| **< 30 seconds** | 219,908 | **99.533%** | 1.65 s |
| **30 s – 5 minutes** | 674 | **0.305%** | 1 m 34 s |
| **> 5 minutes** | 359 | **0.163%** | **3 h 59 m 04 s** |

### Metric B — Processing lag (`createdAt` → `processedAt`), n = 220,834

| Category | Messages | Share | Mean within category |
|---|---|---|---|
| **< 30 seconds** | 220,833 | **99.9995%** | 12.2 ms |
| **30 s – 5 minutes** | 1 | 0.0005% | 44.26 s |
| **> 5 minutes** | **0** | **0.000%** | — |

### Metric C — End-to-end (`message.timestamp` → `processedAt`), n = 220,834

| Category | Messages | Share | Mean within category |
|---|---|---|---|
| **< 30 seconds** | 219,797 | **99.530%** | 1.66 s |
| **30 s – 5 minutes** | 678 | **0.307%** | 1 m 34 s |
| **> 5 minutes** | 359 | **0.163%** | **3 h 59 m 04 s** |

Metric C is Metric A plus a rounding error. That is the whole diagnosis: our processing contributes nothing measurable to the tail.

### Percentile view

| | A — Ingest lag | B — Processing lag | C — End-to-end |
|---|---|---|---|
| p50 | 1.51 s | 7 ms | 1.52 s |
| p75 | 1.82 s | 20 ms | 1.83 s |
| p90 | 2.27 s | 22 ms | 2.28 s |
| p95 | 2.71 s | 23 ms | 2.72 s |
| p99 | 6.50 s | 30 ms | 6.55 s |
| p99.9 | 43 m 53 s | 101 ms | 43 m 53 s |
| max | **37 h 47 m 13 s** | 44.26 s | 37 h 47 m 13 s |
| mean | 25.23 s | 12.41 ms | 25.26 s |

The mean ingest lag (25.23 s) is **16× the median** (1.51 s). Report the median or a percentile — the mean here is an artifact of the 359-message tail and describes no real message.

---

## 3. The > 5 minute category — average lateness

Requested detail for the worst bucket. **n = 359**, all of which come from Metric A / C (Metric B has none).

| Statistic | Value |
|---|---|
| **Average (mean) lateness** | **3 h 59 m 04 s** (14,343,887 ms) |
| Median lateness | 1 h 00 m 25 s |
| p90 | 14 h 20 m 41 s |
| p95 | 20 h 10 m 23 s |
| p99 | 27 h 53 m 11 s |
| Minimum | 5 m 09 s |
| Maximum | 37 h 47 m 13 s |
| Cumulative late time | **59.60 days** |

The mean (3 h 59 m) sits far above the median (1 h 00 m) because the bucket is itself bimodal — a cluster of near-miss delays and a much smaller cluster of multi-hour redeliveries:

| Sub-band | Messages | Share of >5 min | Average lateness |
|---|---|---|---|
| 5 m – 15 m | 92 | 25.63% | 7 m 54 s |
| 15 m – 1 h | 85 | 23.68% | 39 m 14 s |
| 1 h – 6 h | 106 | 29.53% | 2 h 00 m 12 s |
| 6 h – 24 h | 65 | 18.11% | 12 h 59 m 32 s |
| 1 d – 7 d | 11 | 3.06% | 27 h 48 m 18 s |
| > 7 d | 0 | 0% | — |

**49.3% of the >5 min bucket is under an hour.** The 76 messages beyond 6 hours (21.2% of the bucket) contribute the bulk of the 59.6 cumulative late-days and are what drags the average to 3 h 59 m.

---

## 4. The tail is incidents, not steady-state

| | |
|---|---|
| Days with data | 160 |
| Days with **zero** >5 min events | **125 (78.1%)** |
| Days with ≥1 >5 min event | 35 |
| Share of all late messages in the top 5 days | **76.6%** |

| Date | Inbound | > 5 min | Rate | Avg lateness | Worst |
|---|---|---|---|---|---|
| **2026-04-14** | 1,923 | **93** | 4.84% | 1 h 10 m | 7.7 h |
| **2026-05-19** | 1,484 | **65** | 4.38% | 3 h 53 m | 15.4 h |
| **2026-04-15** | 1,728 | **63** | 3.65% | 12 h 36 m | **37.8 h** |
| **2026-03-09** | 2,191 | 39 | 1.78% | 37 m | 5.5 h |
| 2026-04-08 | 1,707 | 15 | 0.88% | 23 m | 1.7 h |
| 2026-06-12 | 1,776 | 11 | 0.62% | 1 h 14 m | 3.0 h |
| 2026-07-27 | 2,347 | 10 | 0.43% | 2 h 11 m | 5.1 h |
| 2026-07-29 | 1,783 | 10 | 0.56% | 3 h 16 m | 12.1 h |
| 2026-04-16 | 1,928 | 8 | 0.41% | **15 h 45 m** | 24.5 h |
| 2026-07-13 | 1,690 | 8 | 0.47% | 19 m | 1.0 h |
| 2026-04-23 | 1,364 | 6 | 0.44% | 11 m | 0.4 h |
| 2026-03-25 | 1,748 | 4 | 0.23% | 10 m | 0.2 h |
| *19 other days* | — | 1 each | — | — | — |

**The 14–16 April window is the dominant event: 164 late messages (45.7% of all 359).** Its signature is redelivery, not slowness — the top 12 worst records all carry a `message.timestamp` on 14 April with a `createdAt` on 15 or 16 April:

| Ingest lag | Type | Message sent | Row created |
|---|---|---|---|
| 37.79 h | text | 2026-04-14T04:29:34Z | 2026-04-15T18:16:47Z |
| 28.96 h | text | 2026-04-14T18:12:56Z | 2026-04-15T23:10:21Z |
| 28.85 h | text | 2026-04-14T04:33:41Z | 2026-04-15T09:24:26Z |
| 27.89 h | text | 2026-04-14T15:54:58Z | 2026-04-15T19:48:09Z |
| 26.60 h | image | 2026-04-14T15:56:01Z | 2026-04-15T18:32:06Z |

Daily inbound volume did **not** drop on 14 April (1,923 vs. a 1,466 median), so the endpoint was not fully down. The pattern is consistent with **partial webhook non-acknowledgement followed by Meta's retry schedule** — a subset of deliveries failing and being replayed hours later, while fresh traffic continued to flow.

### Time-of-day

The >5 min *rate* peaks at 18:00–20:00 UTC (01:00–03:00 WIB) at 2.1–4.4%, but those hours carry only 191–321 messages. In absolute terms the late messages concentrate at 03:00–05:00 UTC (69 and 68 events at ~0.36%), which is peak inbound volume. **Volume drives absolute exposure; the small-hours rate spike is a low-denominator effect and not the priority.**

---

## 5. 107 inbound messages were never processed

These are excluded from every latency percentile above because they have no `processedAt` — which makes them the most severe finding, not the least.

| | |
|---|---|
| Records | **107** |
| `status` | `"received"` (all 107) — never advanced to `"processed"` |
| Ingest lag | 1–3 s — **they arrived perfectly normally** |
| Types | text 99, image 6, `user_changed_number` 2 |

They cluster into four tight windows, each an hour or two wide:

| Window | Records |
|---|---|
| 2026-03-05 15:00–16:00Z | 13 |
| **2026-04-27 11:00–12:00Z** | **46** |
| 2026-07-20 07:00Z | 2 |
| **2026-07-24 11:00–13:00Z** | **46** |

Bursts this tight, following a clean ingest, are a **stalled or crashed consumer** — the webhook was persisted, the downstream processing step never ran, and nothing retried it. 107 customer messages were silently dropped from the inbox.

Note this failure mode is invisible to latency monitoring by construction: a record with no end timestamp never enters a percentile. Anything measuring only `processedAt − createdAt` reports 100% under 30 s on the exact days this happened.

---

## 6. Recommendations

| Priority | Action | Rationale |
|---|---|---|
| **P1** | Alert on `status: "received"` with `createdAt` older than ~2 minutes | The 107 dropped messages are a correctness bug, not a latency one. This is the only signal that catches it. |
| **P1** | Add a reconciliation sweep that re-processes stale `received` rows | Nothing currently retries a webhook whose consumer died after persist. |
| **P2** | Verify webhook ACK latency and HTTP status under load | The Apr 14–16 redelivery pattern points at non-2xx or slow ACKs triggering Meta retries, not at Meta being slow. Meta requires a fast 200. |
| **P2** | Monitor ingest lag on p99 / p99.9, not mean | Mean is 16× median and describes nothing real. p99 (6.50 s) is a usable SLO; p99.9 (43 m) is where incidents surface. |
| **P3** | Leave processing-lag optimisation alone | p99 of 30 ms and zero records over 5 minutes across 220,834 samples. There is nothing to win here. |

---

## 7. Caveats

- **`message.timestamp` has 1-second granularity** while `createdAt` is millisecond-precision, so ingest lag carries up to ±1 s of quantisation error. This is immaterial at the 30 s / 5 min boundaries but means sub-second ingest figures should not be read as exact.
- **3 records have a slightly negative ingest lag** (minimum −1.34 s), from that truncation combined with minor clock skew between Meta and the application host. They fall in the `< 30 s` bucket and do not affect any conclusion.
- **`message.timestamp` is Meta's stamp**, so Metric A includes WhatsApp-side handling and public-internet transit, not only our endpoint. It is an upper bound on our own receipt delay, not an isolated measurement of it.
- **Single WABA.** All 220,941 records belong to business account `282998331574040`, so no cross-tenant comparison is possible from this dump and none of these figures should be generalised to other accounts.
- **Inbound only.** The 554,735 status-receipt webhooks were excluded by scope and are not characterised here; they are 71.5% of webhook volume and could hide a separate latency profile.
