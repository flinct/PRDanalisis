# WhatsApp API Inbound Webhook — Latency Pipeline and Distribution

Companion to [`reports/whatsapp-api-inbound-webhook-latency-analysis.md`](../reports/whatsapp-api-inbound-webhook-latency-analysis.md).

All figures from 220,941 inbound message webhooks in
`whatsapp_api.whatsappapiwebhooklogs`, 2026-02-27 → 2026-08-05.

---

## 1. Where the time actually goes

Two hops, three timestamps. The first hop owns effectively all of the latency;
the second is measured in milliseconds.

```mermaid
flowchart LR
    C["<b>Customer sends</b><br/>message.timestamp<br/><i>1-second granularity</i>"]
    M["<b>Meta / WhatsApp</b><br/>webhook delivery<br/>+ retry schedule"]
    W["<b>Webhook persisted</b><br/>createdAt<br/>status = 'received'"]
    P["<b>Consumer done</b><br/>processedAt<br/>status = 'processed'"]
    X["<b>NEVER PROCESSED</b><br/>107 records<br/>stuck at 'received'"]

    C -->|"<b>HOP A — ingest lag</b><br/>p50 <b>1.51 s</b> · p99 <b>6.50 s</b><br/>p99.9 43m · max <b>37h 47m</b><br/><b>100% of the tail lives here</b>"| W
    C -.-> M -.-> W
    W -->|"<b>HOP B — processing lag</b><br/>p50 <b>7 ms</b> · p99 <b>30 ms</b><br/>max 44 s · <b>0 records >5 min</b>"| P
    W -->|"consumer stalled<br/>4 tight windows<br/>no retry exists"| X

    classDef src fill:#dbeafe,stroke:#2563eb,color:#000
    classDef slow fill:#fed7aa,stroke:#c2410c,color:#000
    classDef ok fill:#bbf7d0,stroke:#15803d,color:#000
    classDef dead fill:#fecaca,stroke:#b91c1c,color:#000
    class C src
    class M slow
    class W src
    class P ok
    class X dead
```

**Reading:** Hop B is three to four orders of magnitude faster than Hop A at every
percentile. The `> 5 minute` category is an inbound-delivery phenomenon, not a
SatuInbox processing phenomenon.

---

## 2. The three categories, side by side

```mermaid
flowchart TB
    subgraph A["HOP A — ingest lag · n = 220,941"]
        direction LR
        A1["<b>&lt; 30 s</b><br/>219,908<br/><b>99.533%</b><br/>mean 1.65 s"]
        A2["<b>30 s – 5 m</b><br/>674<br/>0.305%<br/>mean 1m 34s"]
        A3["<b>&gt; 5 m</b><br/>359<br/>0.163%<br/><b>mean 3h 59m</b>"]
    end
    subgraph B["HOP B — processing lag · n = 220,834"]
        direction LR
        B1["<b>&lt; 30 s</b><br/>220,833<br/><b>99.9995%</b><br/>mean 12.2 ms"]
        B2["<b>30 s – 5 m</b><br/>1<br/>0.0005%<br/>44.26 s"]
        B3["<b>&gt; 5 m</b><br/><b>0</b><br/>0.000%"]
    end
    subgraph C["END-TO-END · n = 220,834"]
        direction LR
        C1["<b>&lt; 30 s</b><br/>219,797<br/><b>99.530%</b><br/>mean 1.66 s"]
        C2["<b>30 s – 5 m</b><br/>678<br/>0.307%<br/>mean 1m 34s"]
        C3["<b>&gt; 5 m</b><br/>359<br/>0.163%<br/><b>mean 3h 59m</b>"]
    end

    classDef good fill:#bbf7d0,stroke:#15803d,color:#000
    classDef warn fill:#fef08a,stroke:#a16207,color:#000
    classDef bad fill:#fecaca,stroke:#b91c1c,color:#000
    classDef none fill:#e5e7eb,stroke:#6b7280,color:#000
    class A1,B1,C1 good
    class A2,C2 warn
    class B2 warn
    class A3,C3 bad
    class B3 none
```

End-to-end is Hop A plus a rounding error — 359 late in both, identical 3 h 59 m
average. That equality *is* the finding.

---

## 3. Inside the `> 5 minute` bucket

359 messages, average lateness **3 h 59 m 04 s**, median **1 h 00 m 25 s**. The gap
between mean and median is explained by the shape below: half the bucket is a
near-miss, a fifth of it is a multi-hour redelivery.

| Sub-band | Count | Share | Avg late | Bar |
|---|---|---|---|---|
| 5 m – 15 m | 92 | 25.6% | 7 m 54 s | `██████████████████████████` |
| 15 m – 1 h | 85 | 23.7% | 39 m 14 s | `████████████████████████` |
| 1 h – 6 h | 106 | 29.5% | 2 h 00 m | `██████████████████████████████` |
| 6 h – 24 h | 65 | 18.1% | 12 h 59 m | `██████████████████` |
| 1 d – 7 d | 11 | 3.1% | 27 h 48 m | `███` |
| > 7 d | 0 | 0% | — | |

```mermaid
pie showData title ">5 min bucket by severity (359 messages)"
    "5m-15m — near miss" : 92
    "15m-1h" : 85
    "1h-6h" : 106
    "6h-24h — redelivery" : 65
    "1d-7d — redelivery" : 11
```

**49.3%** of the bucket resolves within an hour. The **76 messages beyond 6 hours
(21.2%)** carry most of the 59.6 cumulative late-days and are what pulls the
average up to 3 h 59 m.

---

## 4. The tail is incident-shaped

125 of 160 days are completely clean. Five days hold 76.6% of all late messages.

| Date | > 5 min | Rate | Avg late | Bar (count) |
|---|---|---|---|---|
| **2026-04-14** | 93 | 4.84% | 1 h 10 m | `█████████████████████████████████████` |
| **2026-05-19** | 65 | 4.38% | 3 h 53 m | `██████████████████████████` |
| **2026-04-15** | 63 | 3.65% | 12 h 36 m | `█████████████████████████` |
| **2026-03-09** | 39 | 1.78% | 37 m | `████████████████` |
| 2026-04-08 | 15 | 0.88% | 23 m | `██████` |
| 2026-06-12 | 11 | 0.62% | 1 h 14 m | `████` |
| 2026-07-27 | 10 | 0.43% | 2 h 11 m | `████` |
| 2026-07-29 | 10 | 0.56% | 3 h 16 m | `████` |
| 2026-04-16 | 8 | 0.41% | **15 h 45 m** | `███` |
| 2026-07-13 | 8 | 0.47% | 19 m | `███` |
| 2026-04-23 | 6 | 0.44% | 11 m | `██` |
| 2026-03-25 | 4 | 0.23% | 10 m | `█` |
| *19 other days* | 1 each | — | — | `▪` |

### The 14–16 April redelivery event — 164 messages, 45.7% of all lateness

```mermaid
flowchart LR
    D13["<b>Apr 13</b><br/>1,553 inbound<br/>0 late<br/><i>normal</i>"]
    D14["<b>Apr 14</b><br/>1,923 inbound<br/><b>93 late</b><br/>volume NOT down"]
    D15["<b>Apr 15</b><br/>1,728 inbound<br/><b>63 late</b><br/>avg 12h 36m"]
    D16["<b>Apr 16</b><br/>1,928 inbound<br/>8 late<br/>avg 15h 45m"]
    D17["<b>Apr 17</b><br/>1,640 inbound<br/>0 late<br/><i>recovered</i>"]

    D13 --> D14 --> D15 --> D16 --> D17
    D14 -.->|"Apr 14 messages<br/>arriving Apr 15"| D15
    D14 -.->|"Apr 14-15 messages<br/>arriving Apr 16"| D16

    classDef ok fill:#bbf7d0,stroke:#15803d,color:#000
    classDef hot fill:#fecaca,stroke:#b91c1c,color:#000
    classDef warm fill:#fed7aa,stroke:#c2410c,color:#000
    class D13,D17 ok
    class D14,D15 hot
    class D16 warm
```

Fresh traffic kept flowing at normal volume (1,923 on Apr 14 vs. a 1,466 median)
**while** messages stamped Apr 14 kept arriving through Apr 16. That combination —
no volume loss, plus long-delayed arrivals of older messages — is the signature of
**partial webhook non-acknowledgement and Meta retry**, not of an endpoint outage
or of Meta being uniformly slow.

---

## 5. The 107 that never finished

Invisible to every percentile in this document, because a record with no
`processedAt` cannot enter a latency distribution.

```mermaid
flowchart TB
    W["<b>Webhook persisted OK</b><br/>ingest lag 1–3 s<br/>status = 'received'"]
    W --> Q{"Consumer<br/>alive?"}
    Q -->|"220,834 records"| OK["status = 'processed'<br/>p50 7 ms"]
    Q -->|"<b>107 records</b>"| DEAD["<b>stuck at 'received'</b><br/>no processedAt<br/>no retry<br/>message never reaches inbox"]

    DEAD --> W1["Mar 05 · 15–16h · <b>13</b>"]
    DEAD --> W2["Apr 27 · 11–12h · <b>46</b>"]
    DEAD --> W3["Jul 20 · 07h · <b>2</b>"]
    DEAD --> W4["Jul 24 · 11–13h · <b>46</b>"]

    classDef src fill:#dbeafe,stroke:#2563eb,color:#000
    classDef ok fill:#bbf7d0,stroke:#15803d,color:#000
    classDef dead fill:#fecaca,stroke:#b91c1c,color:#000
    classDef win fill:#7f1d1d,stroke:#450a0a,color:#fff
    class W src
    class OK ok
    class DEAD dead
    class W1,W2,W3,W4 win
```

Clean ingest (1–3 s) followed by no processing at all, in four windows one to two
hours wide — a **stalled consumer after persist**, with no reconciliation path.
Types: 99 text, 6 image, 2 `user_changed_number`.

Latency dashboards report **100% under 30 s** on the exact days this happened.

---

## 6. Percentile reference

| | Hop A — ingest | Hop B — processing | End-to-end |
|---|---|---|---|
| p50 | 1.51 s | **7 ms** | 1.52 s |
| p75 | 1.82 s | 20 ms | 1.83 s |
| p90 | 2.27 s | 22 ms | 2.28 s |
| p95 | 2.71 s | 23 ms | 2.72 s |
| p99 | **6.50 s** | **30 ms** | 6.55 s |
| p99.9 | **43 m 53 s** | 101 ms | 43 m 53 s |
| max | **37 h 47 m** | 44.26 s | 37 h 47 m |
| mean | 25.23 s | 12.41 ms | 25.26 s |

Mean ingest lag is **16× the median** — an artifact of 359 records out of 220,941.
Track p99 as the SLO and p99.9 as the incident signal; the mean describes no real
message.
