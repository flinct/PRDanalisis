# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Web Broadcast Humanization (Multi-bubble \+ Self-Quote)  
**Product Manager**: Yusril Ibnu Maulana  
**Engineering Lead**: Naftal  
**Design Lead**: Resky

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v0.1 | 2026-02-05 | Yusril Ibnu Maulana | Initial PRD for automatic bubble splitting, dynamic patterns, and self-quote randomization for WhatsApp Web broadcast. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Make WhatsApp Web broadcast messages feel more natural by splitting long announcements into human-like chat bubbles with dynamic patterns per recipient. |
| Scope | Applies to WhatsApp Web broadcast delivery worker, including sentence-safe splitting, timing simulation, and optional self-quote behavior. |

| In Scope | Out of Scope |
| ----- | ----- |
| Auto split wall-of-text into multiple chat bubbles. | AI/NLP-based sentence understanding. |
| Split strictly per sentence (no mid-sentence break). | Content rewriting or tone generation. |
| Dynamic grouping pattern per recipient (1 to N bubbles). | Per-recipient personalization based on user profile history. |
| Optional self-quote toggle (dynamic true/false). | Quoting other users’ messages. |
| Anti-noise guardrails (max bubbles, pacing). | “Typing errors” simulation, deliberate mistakes. |
| Pattern-based abbreviation protection (addresses, honorifics). | Full locale grammar support beyond defined patterns. |
| Billing counted as 1 broadcast even if split into multiple WA messages. | Changing WhatsApp billing or external pricing models. |

---

## **3\. Problem Statement**

| \# | Problem | Impact |
| ----- | ----- | ----- |
| 1 | Banned and detected anti spam system because long text in consistent word count | Banned account. |
| 2 | Naive splitting can create noisy spam-like bursts. | Higher complaint risk. Higher WA flag risk. |
| 3 | Incorrect sentence splitting on abbreviations (Bp., Jl., No.) breaks meaning. | Confusion and lower trust in HR broadcasts. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result (Target) |
| ----- | ----- |
| Improve readability and perceived “human” delivery. | Reduce average message length per bubble to 40–160 chars for 80% of bubbles. |
| Reduce noise while preserving clarity. | Keep median bubbles per recipient at 2–4 for long announcements. Hard cap at 5 by default. |
| Avoid incorrect sentence breaks. | Sentence-splitting accuracy ≥ 99% for defined abbreviation patterns in QA corpus. |
| Maintain pricing semantics. | Billing counts 1 broadcast job per campaign even if split. 0 regressions in billing reconciliation. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Admin/Supervisor, I want long broadcast text to be automatically split 1-4 into natural chat bubbles so recipients do not receive a wall of text. | 1\. Given a WhatsApp Web broadcast with a long text, When the campaign is sent, Then the system splits content into multiple bubbles grouped by sentences only diynamicly. 2\. Given a sentence list, When bubbles are formed, then no bubble contains a partial sentence fragment. 3\. Given recipients A and B, When both receive the same broadcast, Then bubble grouping patterns can differ per recipient while preserving the same sentence order. 4\. Given a short message, When sent, Then the system may keep it as a single bubble based on dynamic rules. |
| US-002 | P0 | As an Admin/Supervisor, I want the bubble delivery to avoid spam-like noise. | 1\. Given a long broadcast, When bubble plan exceeds the max bubble cap, Then the system automatically merges sentence groups to stay within the cap. 2\. Given multi-bubble delivery, When sending bubbles, Then the system applies pacing (typing \+ gap) between bubbles per recipient. 3\. Given a campaign, When sending to many recipients, Then the worker respects concurrency and rate guardrails to avoid bursts. |
| US-003 | P1 | As an Admin/Supervisor, I want the system to optionally quote its own previous bubble sometimes so it feels like a human follow-up, not always the same pattern. | 1\. Given a multi-bubble plan, When sending bubble i, Then the system may quote bubble i-1 based on probability rules. 2\. Given the first bubble, When sending, then it is never a reply/quote of any prior bubble. 3\. Given quote probability enabled, When a recipient receives bubbles, Then quote usage is dynamic (true/false) and does not exceed the configured cap per recipient. |
| US-004 | P1 | As an Admin/Supervisor, I want to preview how the humanized bubbles might look so I can trust the system before sending. | 1\. Given a draft broadcast message, When I click “Pratinjau bubble”, Then I see 3 example variants of bubble grouping for the same text. 2\. Given a message containing abbreviations (Bp., Jl., No.), When preview is rendered, Then sentence splits do not break at protected patterns. |
| US-005 | P0 | As Admin, I want the campaign to be counted as 1 billable broadcast even if it sends multiple WA messages due to splitting. | 1\. Given a broadcast campaign with bubble splitting enabled, When billing usage is calculated, Then it counts as 1 broadcast job for pricing. 2\. Given the same campaign, When viewing delivery analytics, Then it still records the number of message parts sent for operational visibility. |
| US-006 | P0 | As an Agent, I want conversation threads created by broadcast bubbles to appear in correct order and be understandable. | 1\. Given a recipient conversation is opened, When bubbles arrive, Then messages appear in the original sentence order without reordering. 2\. Given partial failures, When some bubbles fail, Then the conversation does not continue sending later bubbles that would confuse the recipient. |
| US-007 | P0 | As an Admin/Supervisor, I want sentence splitting to handle common Indonesian abbreviations for names and addresses without AI so meaning is preserved. | 1\. Given text containing protected abbreviations, When sentence splitting runs, Then the splitter does not treat those dots as sentence end. 2\. Given numeric formats (No. 5, 10.30), When splitting runs, Then it does not break incorrectly at dots inside these patterns. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Humanization Default | FR-001: System MUST enable humanization by default for WhatsApp Web broadcast delivery. FR-002: System MUST provide a kill switch to disable humanization at tenant level for incident mitigation. |
| Input Handling | FR-003: System MUST accept a raw message as a single string or as an array of strings. FR-004: If input is an array of strings, System MUST treat each entry as an explicit bubble and MUST NOT re-split it. FR-005: If input is a single string, System MUST generate bubbles automatically using rules in “Sentence Splitting” and “Bubble Grouping”. |
| Sentence Splitting (No AI) | FR-006: System MUST split only at sentence terminators: `.`, `!`, `?`. FR-007: System MUST preserve original sentence order. FR-008: System MUST protect common Indonesian abbreviations from being treated as sentence end, using pattern list and heuristics in “Edge Cases”. FR-009: System MUST treat line breaks as soft separators, not mandatory bubble boundaries. |
| Bubble Grouping (Dynamic) | FR-010: System MUST group 1–3 sentences per bubble by default, but may group more to satisfy max bubble cap. FR-011: System MUST target 40–160 characters per bubble for most bubbles (excluding micro-intro). FR-012: System MUST support an optional micro-intro bubble for the opening (10–40 chars), used dynamically per recipient. FR-013: System MUST enforce a max bubble cap per recipient with default 5 bubbles. FR-014: If cap is exceeded, System MUST merge bubbles by increasing sentences per bubble while still keeping sentence boundaries intact. FR-015: System MUST allow 1-bubble delivery for the same text in some recipients to avoid repetitive patterns. |
| Randomization and Consistency | FR-016: System MUST generate different bubble grouping patterns across recipients for the same broadcast. FR-017: System MUST use a deterministic seed per recipient per broadcast so retries do not reshuffle bubble boundaries mid-send. |
| Self-Quote Behavior | FR-018: System MUST support sending bubble i as a reply quoting bubble i-1 based on probability rules. FR-019: System MUST never quote on the first bubble. FR-020: System MUST cap self-quote usage to max 1 quoted bubble per recipient by default. FR-021: System MUST disable quoting when the quoted candidate bubble exceeds 200 characters. |
| Timing and Presence Simulation | FR-022: System MUST simulate typing before each bubble using composing presence, based on bubble length and randomized typing speed. FR-023: System MUST apply an inter-bubble gap after sending each bubble to simulate “send then continue typing”. FR-024: System MUST cap per-bubble typing delay to a maximum to avoid suspiciously long composing states. FR-025: If computed typing delay exceeds presence expiry window, System MUST refresh composing presence periodically. |
| Anti-Noise Guardrails | FR-026: System MUST ensure minimum inter-bubble gap of 500 ms and maximum of 2500 ms by default. FR-027: System MUST ensure the total per-recipient send sequence does not exceed a maximum duration threshold, otherwise it disables micro-intro and reduces bubble count by merging. |
| Delivery, Retries, and Stop Rules | FR-028: System MUST send bubbles sequentially per recipient to preserve order. FR-029: System MUST retry failed bubble sends up to 3 attempts with exponential backoff for transient errors. FR-030: If a bubble fails with a non-recoverable error, System MUST stop remaining bubbles for that recipient and mark recipient as failed. |
| Reporting and Billing Semantics | FR-031: System MUST keep “campaign status” progress per recipient (not per bubble) for backward compatibility. FR-032: System MUST store per-recipient part metrics: partsTotal, partsSent, partsFailed, quoteUsed, seedUsed. FR-033: System MUST count pricing usage as 1 broadcast per campaign regardless of number of parts sent. |
| Audit and Observability | FR-034: System MUST log the final bubble plan per recipient in a compact form (counts, char lengths, quote pattern, seed). FR-035: System MUST provide a way to export per-recipient part metrics for debugging and support. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX (Bahasa Indonesia) |
| ----- | ----- | ----- | ----- |
| EH-001 | Invalid input | Reject campaign if message is empty or whitespace only. | “Pesan tidak boleh kosong.” |
| EH-002 | Message too long | If sentence splitting yields extreme bubble count, auto-merge to cap. If still exceeds hard cap, fail campaign validation. | “Pesan terlalu panjang untuk dikirim secara aman. Ringkas pesan atau pecah menjadi beberapa bagian.” |
| EH-003 | Abbreviation split anomaly | If splitter detects suspicious 1–3 char “sentence” caused by dot pattern, auto-merge with next sentence and log. | “Sistem menyesuaikan pemisahan kalimat untuk menjaga makna.” |
| EH-004 | Session disconnected mid-send | Pause recipient sending, retry with backoff. If not recovered within threshold, mark recipient failed. | “Koneksi WhatsApp terputus. Menghubungkan ulang.” |
| EH-005 | Rate limited | Slow down concurrency and apply retry-after backoff. | “Terlalu banyak pesan. Coba lagi nanti.” |
| EH-006 | Quote send fails | Disable quote for remaining bubbles for that recipient, continue sending non-quoted bubbles if safe. | “Gagal mengirim sebagai balasan. Sistem akan mengirim tanpa kutipan.” |
| EH-007 | Partial send | Stop remaining bubbles for that recipient when non-recoverable failure occurs. Mark recipient failed with partial metrics. | “Sebagian pesan gagal dikirim. Lihat detail di laporan broadcast.” |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior |
| ----- | ----- | ----- |
| EC-001 | Honorific abbreviations: “Bp.”, “Ibu.”, “Tn.”, “Sdr.”, “Sdri.” | Do not split at the dot. Treat as part of the same sentence. |
| EC-002 | Address abbreviations: “Jl.”, “Jln.”, “No.”, “Rt.”, “Rw.”, “Kec.”, “Kab.”, “Prov.” | Do not split at the dot. |
| EC-003 | Medical and title abbreviations: “dr.”, “Sp.”, “Prof.”, “Ir.” | Do not split at the dot when followed by a capitalized token. |
| EC-004 | Time formats: “10.30”, “12.05” | Do not treat dot as sentence end if both sides are digits. |
| EC-005 | Decimal numbers: “1.5”, “2.0” | Same as EC-004. |
| EC-006 | URLs with dots | Do not split inside URLs. Only split at sentence end after whitespace that is not part of URL token. |
| EC-007 | Ellipsis “...” | Treat ellipsis as not ending a sentence unless followed by whitespace and a capitalized token, otherwise keep as same sentence token. |
| EC-008 | No punctuation at all | Do not split. Send as 1 bubble unless length exceeds safe threshold, then split by line breaks and hard-wrap at word boundaries while preserving words (still not mid-sentence). |
| EC-009 | First sentence is a greeting (“Halo tim.”) | Optionally send as micro-intro bubble if within 10–40 chars and probability triggers. |
| EC-010 | Input already provided as message array | Respect the array as bubble plan. Still apply pacing, presence, and optional quoting rules. |
| EC-011 | Very short messages (\<= 120 chars) | Often keep as 1 bubble. Occasionally split into 2 bubbles only if there are 2+ sentences and randomization triggers. |
| EC-012 | Multi-paragraph content | Preserve paragraph breaks as newline inside a bubble only if bubble stays under target char band. Otherwise treat each paragraph as a set of sentences to be grouped. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Broadcast composer, Advanced | Toggle “Mode Humanize” with default ON. | 1\. User creates broadcast. 2\. User opens advanced options. 3\. User sees “Mode Humanize” enabled by default. 4\. User may disable if needed. | US-001, US-002 |
| Bubble preview | Button “Pratinjau bubble” renders 3 example variants. | 1\. User clicks “Pratinjau bubble”. 2\. System shows Variant A/B/C bubble grouping and estimated send duration. 3\. User closes preview. | US-004 |
| Noise guard warning | Inline warning when predicted bubbles exceed cap and auto-merge will happen. | 1\. User inputs very long text. 2\. System shows warning that it will merge to reduce noise. | US-002 |
| Broadcast detail, Delivery analytics | Show “Rata-rata bubble per penerima”, “Persentase pakai kutipan”, “Durasi rata-rata per penerima”. | 1\. User opens broadcast detail. 2\. User sees aggregate humanization metrics and per-recipient status. | US-005, US-006 |
| Per-recipient detail | Show partsTotal, partsSent, partsFailed for support debugging. | 1\. User opens recipient detail row. 2\. User sees part metrics and failure reason if any. | US-006 |

**UI copy (Bahasa Indonesia only):**

* “Mode Humanize”

* “Pratinjau bubble”

* “Sistem akan menggabungkan beberapa kalimat untuk mengurangi spam.”

* “Rata-rata bubble per penerima”

* “Persentase pakai kutipan”

* “Durasi rata-rata per penerima”

---

## **10\. Field & Validation**

| Field | Type | Default | Validation | UI Exposure |
| ----- | ----- | ----- | ----- | ----- |
| humanizeEnabled | Boolean | true | Required. | Visible |
| maxBubblesPerRecipient | Integer | 5 | Min 1\. Max 8\. | Hidden (system default) |
| targetCharsMin | Integer | 40 | Min 20\. Max 120\. | Hidden |
| targetCharsMax | Integer | 160 | Min 80\. Max 400\. Must be \> targetCharsMin. | Hidden |
| microIntroEnabled | Boolean | true | Required. | Hidden |
| microIntroProbability | Float | 0.25 | Min 0.0. Max 0.5. | Hidden |
| quoteEnabled | Boolean | true | Required. | Hidden |
| quoteProbability | Float | 0.18 | Min 0.0. Max 0.35. | Hidden |
| quoteMaxPerRecipient | Integer | 1 | Min 0\. Max 2\. | Hidden |
| typingSpeedCharsPerSec | Integer | 6 | Min 4\. Max 10\. | Hidden |
| typingJitterMs | Integer | 600 | Min 0\. Max 1500\. | Hidden |
| interBubbleGapMinMs | Integer | 500 | Min 200\. Max 1500\. | Hidden |
| interBubbleGapMaxMs | Integer | 2500 | Min 800\. Max 6000\. Must be \> interBubbleGapMinMs. | Hidden |
| seedMode | Enum | per\_recipient\_per\_broadcast | Must be one of: per\_recipient\_per\_broadcast. | Hidden |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Humanization planning per recipient must complete in \< 10 ms at p95 for typical announcements. |
| Reliability | Bubble plan must be deterministic per recipient per broadcast so retries do not change the structure. |
| Observability | Emit metrics: avgBubblesPerRecipient, quoteUsageRate, partFailureRate, medianSendDuration. |
| Security | Store only minimum needed plan metadata. Avoid logging full message content in plain text when not required. |
| Compliance | Respect tenant scoping and WhatsApp Web channel constraints already enforced by Satuinbox broadcast system. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| Baileys reply/quote behavior can vary by version | Engineering | Quote may silently not appear as reply | Cap quote usage. Add automatic fallback to non-quoted send. Maintain regression tests. |
| Increased WA message count due to splitting | Product \+ Eng | Higher quota consumption and ban risk | Keep bubble cap low. Prefer 2–4 bubbles. Use conservative pacing. |
| Progress semantics mismatch (recipient vs parts) | Engineering | Confusing analytics | Keep campaign progress per recipient. Add part metrics as additional fields. |
| Over-randomization creates inconsistent brand tone | Product | Perceived unprofessional | Use bounded probability ranges. Keep micro-intro limited. Provide kill switch. |
| Abbreviation pattern gaps | QA | Wrong sentence splitting | Maintain a protected abbreviation dictionary and QA corpus. Add telemetry for anomaly detection. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Avg bubbles per recipient (for messages \> 300 chars) | 2–4 | Weekly | Broadcast analytics |
| Quote usage rate | 10–25% | Weekly | Broadcast analytics |
| Part failure rate | \< 1% | Weekly | Delivery logs |
| Recipient complaint proxy (manual disable rate) | \< 5% | Monthly | Setting audit logs |
| Message read proxy (if read receipts available) | \+10% uplift vs baseline | Monthly | WhatsApp read sync analytics |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| “Conservative vs Natural” preset in UI | Allows easy tuning for different tenant risk profiles. |
| Quiet hours scheduling | Avoid sending bursts outside office hours. |
| Template-level overrides | Some templates should always be single bubble (legal notices). |
| Expanded abbreviation dictionary per industry | Logistics, healthcare, finance have unique abbreviations. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Pattern-based splitting only | Some rare grammar cases may still split incorrectly. |
| No content rewriting | If original message is poorly written, bubbles will not fix clarity. |
| Quoting is best-effort | Some WA/Baileys versions may not render reply quoting reliably. |
| More WA messages means higher quota usage | Operational quotas can be hit sooner even if pricing counts 1 broadcast. |

---

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Existing broadcast input constraints | Broadcast send accepts `message` as String or Array\<String\> with max 4096 chars per string and spintax support. Concurrency includes max 5 parallel send per tenant. |
| WhatsApp Web integration context | WhatsApp Web Integration scope already includes human-like send simulation and random delays as a capability. |
| Baileys quote and presence references (internet) | Baileys-based send options commonly include `quoted` message for reply quoting and presence updates such as `composing` and `paused`. Presence expiry is noted around 10 seconds. |
| Known instability risk | Community reports show reply/quoted behavior can fail depending on version or conditions, reinforcing the need for fallback.  |

