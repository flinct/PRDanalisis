# **PRODUCT REQUIREMENT DOCUMENT**

**Feature**: WhatsApp Group Mention in Conversation (WhatsApp Web)  
 **Product Manager**: Yusril Ibnu Maulana  
 **Engineering Lead**: Naftal  
 **Design Lead: Sabrina**

---

## **1\. Revision History**

| Version | Date (Asia/Jakarta) | Author | Changes |
| ----- | ----- | ----- | ----- |
| v1.0 | 2026-01-15 | Yusril Ibnu Maulana | Initial draft for WhatsApp group mention in Conversation. |

---

## **2\. Overview**

| Item | Description |
| ----- | ----- |
| Purpose | Enable agents to mention group participants in WhatsApp group chats from SatuInbox Conversation, so tagging works as in WhatsApp and is visible to all group members. |
| Scope | Keep implementation lean with minimal UI additions and safe fallback when participant metadata is unavailable. |

| In Scope | Out of Scope |
| ----- | ----- |
| Mention group participants in WhatsApp group chats. | Internal teammate mention and notifications. |
| Participant picker triggered by "@". | "@all" or mass mention features. |
| Mention rendering for inbound and outbound messages. | Cross-channel mention parity. |
| Retry when participant metadata cannot be loaded. | Advanced group member management. |
| "Internal" label for participants that match workspace connected WhatsApp accounts. | Rules engine for auto-tagging. |

---

## **3\. Problem Statement**

| Problem | Impact |
| ----- | ----- |
| Agents cannot tag group participants from Conversation UI. | Slower collaboration in group chats and higher risk of missed responses. |
| Participant metadata can be unavailable or stale. | Tagging fails silently or causes agent confusion. |
| Agents cannot distinguish internal numbers vs external participants. | Higher risk of mentioning the wrong target and leaking internal coordination into group context. |

---

## **4\. Objectives and Key Results**

| Objective | Key Result |
| ----- | ----- |
| Enable reliable WhatsApp group mention from Conversation. | At least 90% mention send success for group chats where participant metadata is available. |
| Reduce confusion when group metadata is unavailable. | Less than 5% of mention attempts end with unclear outcome (measured by error toast shown without recovery action). |
| Make internal participants obvious in picker and message view. | At least 80% of agents can correctly identify internal participants in usability test. |

---

## **5\. User Stories and Acceptance Criteria**

| ID | Priority | User Story | Acceptance Criteria |
| ----- | ----- | ----- | ----- |
| US-001 | P0 | As an Agent, I want a participant picker when I type "@", so I can select group members to mention quickly. | 1\. Given a WhatsApp group conversation, When the agent types "@", Then the participant picker opens. 2\. Given the picker is open, When the agent types a query, Then the list filters by name and number. 3\. Given the picker request fails, When the system completes one automatic retry, Then the picker shows an error state with "Coba lagi". |
| US-002 | P0 | As an Agent, I want selected participants to be inserted into my message, so I can send a tagged message successfully. | 1\. Given the picker is open, When the agent selects a participant, Then the message input inserts a mention token for that participant. 2\. Given at least one mention token exists, When the agent sends the message, Then the message is delivered with working mentions in WhatsApp group chat. 3\. Given a selected participant is no longer valid, When the agent sends the message, Then the system removes invalid mentions and sends the message, and shows "Sebagian mention tidak tersedia". |
| US-003 | P0 | As an Agent, I want inbound and outbound mentions to be visually distinct, so I can scan messages faster. | 1\. Given a message contains mentions, When the message is rendered in timeline, Then mention text is highlighted consistently. 2\. Given a message contains mentions, When the agent hovers the mention, Then a tooltip shows the participant display name and number. 3\. Given mention metadata is missing on render, When the message is displayed, Then the UI falls back to plain text without breaking layout. |
| US-004 | P0 | As an Agent, I want the system to retry loading group participants when metadata is missing, so I can still mention without manual reload. | 1\. Given the agent opens the picker, When the first participant load fails, Then the system retries once automatically within 2 seconds. 2\. Given the retry fails, When the error state is shown, Then the user can tap "Coba lagi" to reattempt load. 3\. Given participants still cannot be loaded, When the agent continues typing, Then the message can still be sent as plain text without mentions. |
| US-005 | P0 | As an Agent, I want internal phone number registered on dashboard labeled, so I can distinguish numbers from external client. | 1\. Given the picker shows participants, When a participant matches a connected WhatsApp account in the same workspace, Then show label "Internal" in the list item. 2\. Given a message shows a mention, When the mentioned participant is internal, Then the tooltip includes label "Internal". 3\. Given the system cannot determine internal status, When rendering list or tooltip, Then show no label and do not block mention. |

---

## **6\. Functional Requirements**

| Category | Requirements |
| ----- | ----- |
| Mention authoring | FR-001: System MUST open participant picker when user types "@". FR-002: System MUST support selecting multiple participants in one message. FR-003: System MUST insert a structured mention token into the message input after selection. FR-004: System MUST allow sending message without mentions if picker fails. |
| Participant list | FR-005: System MUST load group participants for the active conversation group. FR-006: System MUST support search by display name and by number. FR-007: System MUST show loading state while fetching participants. FR-008: System MUST automatically retry participant load 1 time after initial failure within 2 seconds. |
| Sending behavior | FR-009: System MUST send WhatsApp group messages with mention targets aligned to selected tokens. FR-010: System MUST validate mention targets server-side against group membership. FR-011: System MUST drop invalid mention targets and continue sending message when possible. FR-012: System MUST show a warning toast when mentions are dropped. FR-013: System MUST prevent duplicate mention targets in the structured list. |
| Rendering behavior | FR-014: System MUST render mentions with consistent highlight styling in timeline. FR-015: System MUST display tooltip on hover with participant display name and number. FR-016: System MUST degrade gracefully to plain text if mention metadata is missing. |
| Internal label | FR-017: System MUST mark a participant as internal when it matches a connected WhatsApp account in the same workspace. FR-018: System MUST display label "Internal" in picker results for internal participants. FR-019: System MUST display internal label in tooltip for internal mentions. |
| Permissions | FR-020: Users with permission to send WhatsApp messages MUST be able to use mentions. FR-021: Users without send permission MUST not see mention picker and MUST see "Akses ditolak" if forced. |
| Observability | FR-022: System MUST record mention usage metrics per workspace. FR-023: System MUST log participant load failures and send failures with reason category. |

---

## **7\. Error Handling**

| ID | Type | Handling | UI/UX |
| ----- | ----- | ----- | ----- |
| EH-001 | Participant list load fails | 1\. Retry automatically 1 time within 2 seconds. 2\. If still fails, allow manual retry. 3\. Do not block plain message send. | Show "Gagal memuat anggota grup". Show button "Coba lagi". |
| EH-002 | Session invalid | Block mention send and message send for this channel. | Show "Sesi WA perlu login ulang". |
| EH-003 | Network unstable | Keep UI responsive and allow retry. | Show "Jaringan tidak stabil". Show "Coba lagi". |
| EH-004 | Rate limit | Throttle sending and avoid repeated failures. | Show "Terlalu banyak request, coba beberapa saat lagi". |
| EH-005 | Mention validation fails | Drop invalid mentions and continue sending if possible. | Show "Sebagian mention tidak tersedia". |
| EH-006 | Unauthorized access | Block action. | Show "Akses ditolak". |
| EH-007 | Server error | Provide retry path. | Show "Gagal mengirim pesan. Silakan coba lagi". |

---

## **8\. Edge Cases**

| ID | Scenario | Expected Behavior | UI/UX |
| ----- | ----- | ----- | ----- |
| EC-001 | Two participants have the same display name | Selection must remain unambiguous by showing number in list. | List item shows name and number. |
| EC-002 | Participant leaves group after picker opens | Mention becomes invalid on send and is dropped. | Show "Sebagian mention tidak tersedia". |
| EC-003 | Group has very large member count | Picker remains usable and responsive. | Show list virtualization behavior as needed. Show "Memuat anggota grup" skeleton rows. |
| EC-004 | Agent inserts "@text" without selecting a participant | No mention metadata is created. | Message sends as normal text. |
| EC-005 | Message contains many mentions | System supports up to 100 mentions per message. Above 100, block additional selections. | Show "Maksimal 100 mention per pesan". |
| EC-006 | Emoji and special characters in message affect offsets | Rendering uses stored mention tokens rather than string parsing. | Highlight remains correct. |
| EC-007 | Inbound message has mention targets not recognized as metadata | Render as plain text without error. | No toast. |
| EC-008 | Internal participant is also renamed in group | Internal label still applies based on matched connected account identity. | Badge "Internal" stays visible. |

---

## **9\. UI & UX Requirements**

| Component | Description | UX Flow | Related User Story IDs |
| ----- | ----- | ----- | ----- |
| Message composer mention picker | Dropdown list triggered by "@". Supports search and selection. Shows number and internal label. | 1\. User types "@". 2\. Picker opens with loading state "Memuat anggota grup". 3\. User types query to filter. 4\. User selects participant. 5\. Picker closes or stays open for multi-select based on last action. | US-001, US-005 |
| Mention token in composer | Selected participant appears as a distinct token in input. | 1\. User selects participant. 2\. Token appears in text. 3\. User can backspace to remove token. | US-002 |
| Timeline mention highlight | Mentions display with highlight styling in inbound and outbound messages. | 1\. Timeline renders message. 2\. Mention text is highlighted. 3\. Hover shows tooltip. | US-003 |
| Tooltip | Shows participant display name and number. Shows "Internal" label when applicable. | 1\. User hovers mention. 2\. Tooltip appears near text. 3\. Tooltip disappears on mouse leave. | US-003, US-005 |
| Error state for picker | Explicit error state with recovery action. | 1\. Participant load fails. 2\. System retries once. 3\. On failure, show message and "Coba lagi". | US-001, US-004 |
| Toast warnings | Warn when mentions dropped or selection limit reached. | 1\. User sends message. 2\. System drops invalid mentions if needed. 3\. Toast shows warning. | US-002, US-004 |

UI copy list (Bahasa Indonesia only):

1. "Memuat anggota grup".  
2. "Gagal memuat anggota grup".  
3. "Coba lagi".  
4. "Sebagian mention tidak tersedia".  
5. "Maksimal 100 mention per pesan".  
6. "Internal".  
7. "Sesi WA perlu login ulang".  
8. "Jaringan tidak stabil".  
9. "Terlalu banyak request, coba beberapa saat lagi".  
10. "Gagal mengirim pesan. Silakan coba lagi".  
11. "Akses ditolak".

---

## **10\. Field & Validation**

| Field | Type | Example | Validation | Required |
| ----- | ----- | ----- | ----- | ----- |
| Message text | String | "Halo @Budi" | 1\. Must allow plain text send without mentions. 2\. Must support mention tokens inline. | Required |
| Mention tokens | List | \["participant\_1"\] | 1\. Each token must map to a single participant identity. 2\. Max 100 tokens per message. 3\. Dedupe repeated participants. | Optional |
| Participant search query | String | "budi" | 1\. Max 50 characters. 2\. Ignore leading "@". | Optional |
| Internal label flag | Boolean | true | 1\. Derived from workspace connected accounts. 2\. Must not block send if unknown. | Optional |

---

## **11\. Non-Functional Requirements**

| Category | Requirement |
| ----- | ----- |
| Performance | Participant list initial load completes within 2 seconds for typical groups. Search filtering responds within 200 ms after typing stops. |
| Reliability | Participant load retry occurs once automatically within 2 seconds after failure. Send operation remains available as plain text even when mention data fails. |
| Security | Server-side validation ensures mention targets are members of the group. Unauthorized users cannot send or mention. |
| Privacy | Internal label determination uses workspace account mapping only. No additional personal data is exposed beyond what is already shown in conversation. |
| Observability | Track mention usage rate, picker load failures, and mention drop events. |
| Accessibility | Picker supports keyboard navigation and selection. Focus order is deterministic from composer to picker to selection. |

---

## **12\. Dependencies & Risks**

| Dependency or Risk | Owner | Impact | Mitigation |
| ----- | ----- | ----- | ----- |
| WhatsApp Web integration stability | Engineering | Mention send and participant metadata may break. | Keep retry and fallback to plain text send. |
| Group participant metadata staleness | Engineering | Invalid mentions and user confusion. | Drop invalid mentions on send and show warning toast. |
| Session conflicts in group chats | Engineering | Sending from wrong sender identity. | Respect active sender identity selection for the conversation. |
| Very large groups | Engineering | Slow picker performance. | Limit visible results per page and use incremental loading. |

---

## **13\. Success Metrics**

| KPI | Target | Time Window | Data Source |
| ----- | ----- | ----- | ----- |
| Mention send success rate | \>= 90% | 30 days after release | Message delivery logs |
| Participant picker load success rate | \>= 95% | 30 days after release | Client telemetry |
| Mention drop rate due to invalid membership | \<= 3% | 30 days after release | Validation logs |
| Feature adoption | \>= 30% of WA group conversations use mentions | 60 days after release | Usage analytics |

---

## **14\. Future Considerations**

| Topic | Why it matters later |
| ----- | ----- |
| Internal teammate mention | Separate feature with notification rules. |
| "@all" | High-risk for spam and should be gated by permissions. |
| Smart suggestions | Speed up tagging with recent mentions. |

---

## **15\. Limitations**

| Limitation | Impact |
| ----- | ----- |
| Mentions require participant metadata availability | When metadata cannot be loaded, only plain text sending is available. |
| Max 100 mentions per message | Some very large groups cannot be fully tagged in one message. |
| No internal mention notifications | This feature does not notify internal users in-app. |

---

## **16\. Appendix**

| Item | Details |
| ----- | ----- |
| Glossary | Mention: Tagging a WhatsApp group participant so they are explicitly referenced in the message. Internal participant: A group member whose identity matches a connected WhatsApp account within the same workspace. |

