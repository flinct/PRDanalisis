# Supplement Test Cases — Conversation Partial Gaps
> Target modules: Chat List, Conversation Room, Inbox Navigation, Agent Pull Queue, Group Chat
> Label convention reused from main mapping: Developed/Undeveloped/Pending as needed.

---

## 1. Chat List — Partial User Story Coverage
| Test ID (new) | PRD File | Scenario / Description | Steps Sample | Expected Result |
|---|---|---|---|---|
| SIX-Convo-Gap-01 | Chat List | Switch to All Conversation tab; verify combined chats across channels appear | Open main navigation -> click All Conversation | All conversations visible; counters update |
| SIX-Convo-Gap-02 | Chat List | Switch to Closed tab; verify resolved chats only | Open main navigation -> click Closed | Only resolved chats appear in Closed |
| SIX-Convo-Gap-03 | Chat List | Filter chats by channel Live Chat | Open main navigation -> select channel filter Live Chat | Only Live Chat items appear |
| SIX-Convo-Gap-04 | Chat List | Filter chats by tag CS Pre-order | Open chat list -> open filter panel -> select CS Pre-order | Only that tag shows; filter badge shown |
| SIX-Convo-Gap-05 | Chat List | Sort by Most Recent | Open chat list -> change sort Most Recent | Latest chat at top; persists after tab switch |
| SIX-Convo-Gap-06 | Chat List | Sort by Longest Waiting | Open chat list -> change sort Longest Waiting | Oldest unresolved at top; reorders in <1s |
| SIX-Convo-Gap-07 | Chat List | Scroll and filter persist per tab | Open Your Inbox -> scroll -> filter Agent=Rizki -> switch tabs and back | Scroll restored; filter still applied |
| SIX-Convo-Gap-08 | Chat List | Bulk assign unassigned chats | Select 3 chats in Unassigned -> Assign to me | Chats move to Your Inbox; counter decreases |
| SIX-Convo-Gap-09 | Chat List | Bulk delete selected chats | Select 2 chats in Your Inbox -> Delete and confirm | Selected chats removed; counter updates |
| SIX-Convo-Gap-10 | Chat List | Hold indicator visibility | Open Your Inbox where a chat is on Hold | Hold icon appears; tooltip shows user + time |
| SIX-Convo-Gap-11 | Chat List | SLA countdown colors | Open chats with various SLA remaining | Green>50%, Yellow<=50%&>10%, Red<=10% or overdue |
| SIX-Convo-Gap-12 | Chat List | Presence avatars on chat card | Open Your Inbox with 2 agents viewing same chat | Presence avatars appear; hover shows names |

---

## 2. Conversation Room — Partial User Story Coverage
| Test ID (new) | PRD File | Scenario / Description | Steps Sample | Expected Result |
|---|---|---|---|---|
| SIX-Convo-Gap-13 | Conversation Room | Private note styling and role visibility | Open room -> agent posts private note | Yellow background, only agents see it |
| SIX-Convo-Gap-14 | Conversation Room | Inline reply-to shows referenced message | Open chat -> reply to a message | Reply bar shows referenced bubble; click opens anchor |
| SIX-Convo-Gap-15 | Conversation Room | Typing indicator lists up to 5 agent names | Two agents start typing | Names shown; >5 shows "and X more" |
| SIX-Convo-Gap-16 | Conversation Room | Typing indicator fades after inactivity | Typing stops -> wait 6s | Indicator disappears |
| SIX-Convo-Gap-17 | Conversation Room | Message status progression sent → delivered → read | Send message | Shows sent → delivered → read |
| SIX-Convo-Gap-18 | Conversation Room | Failed message shows red status + retry | Open failed message | Red icon; retry clickable; max 3 auto retries |
| SIX-Convo-Gap-19 | Conversation Room | Ctrl+V paste image | Copy image -> paste into text area | Preview becomes attachment |
| SIX-Convo-Gap-20 | Conversation Room | Drag and drop file | Drag PDF into text area | Preview before send; attaches on send |
| SIX-Convo-Gap-21 | Conversation Room | Invalid attachment toast | Paste file >100MB | Toast: gagal mengunggah; check size/format |
| SIX-Convo-Gap-22 | Conversation Room | Create ticket from message | Multi-select -> Create Ticket | Ticket linked; reference ID shown |
| SIX-Convo-Gap-23 | Conversation Room | Screenshot button if add-on active | Open room with add-on enabled | Screenshot button visible in header |
| SIX-Convo-Gap-24 | Conversation Room | Quick Reply dropdown | Open dropdown -> select template | Template text inserted in composer |

---

## 3. Inbox Navigation — Partial User Story Coverage
| Test ID (new) | PRD File | Scenario / Description | Steps Sample | Expected Result |
|---|---|---|---|---|
| SIX-Convo-Gap-25 | Inbox Navigation | Unread badge real-time update | Open sidebar -> new message elsewhere | Badge increments within 2s |
| SIX-Convo-Gap-26 | Inbox Navigation | Counter tooltip breakdown | Hover unread badge | Shows Unassigned/Ongoing/Resolved counts |
| SIX-Convo-Gap-27 | Inbox Navigation | Tab switch <1s | Switch all main tabs repeatedly | Each switch completes in <1s |
| SIX-Convo-Gap-28 | Inbox Navigation | Admin create Team Inbox | Admin click Create Team Inbox -> fill form | New Team Inbox appears live in all agents' sidebar |
| SIX-Convo-Gap-29 | Inbox Navigation | Rename Team Inbox live | Admin rename CS Kurir to CS Driver | Name updates instantly via socket |
| SIX-Convo-Gap-30 | Inbox Navigation | Delete Team Inbox confirmation | Admin click Delete -> confirm | Team Inbox removed; success toast |
| SIX-Convo-Gap-31 | Inbox Navigation | Drag & drop chat to Team Inbox | Drag chat to CS Kurir -> confirm | Chat moved; backend owner team updated |
| SIX-Convo-Gap-32 | Inbox Navigation | Multi-select handover | Select 3 chats -> Handover to other agent | Chats reassigned; source/target counters update |
| SIX-Convo-Gap-33 | Inbox Navigation | Quick search team name | Type "CS" in sidebar search | Matching teams filtered; click navigates |
| SIX-Convo-Gap-34 | Inbox Navigation | Keyboard shortcuts | Ctrl+1/Ctrl+2 | Tabs switch accordingly |
| SIX-Convo-Gap-35 | Inbox Navigation | Failure retry on sidebar load |Force API failure then retry | Retry button appears; reload succeeds when API up |

---

## 4. Agent Pull Queue — Partial User Story Coverage
| Test ID (new) | PRD File | Scenario / Description | Steps Sample | Expected Result |
|---|---|---|---|---|
| SIX-Convo-Gap-36 | Get New Conversation | Get Conversation FIFO assignment | Click Get Conversation | Conversation assigned; appears in Your Inbox |
| SIX-Convo-Gap-37 | Get New Conversation | Editable batch size | Set batch 3 -> Get Conversation | Exactly 3 assigned; batch resets after |
| SIX-Convo-Gap-38 | Get New Conversation | Conflict toast on simultaneous pull | Two agents click concurrently | One success, other sees conflict toast |
| SIX-Convo-Gap-39 | Get New Conversation | Warning at max active limit | Reach max active -> Get Conversation | Warning toast; no new chat assigned |
| SIX-Convo-Gap-40 | Get New Conversation | Empty queue message | Click Get Conversation with empty queue | "No conversations available" toast |
| SIX-Convo-Gap-41 | Get New Conversation | Negative batch resets | Input -1 -> Get Conversation | Batch resets to queue size default |
| SIX-Convo-Gap-42 | Get New Conversation | Retry on fetch failure | API failing -> Get Conversation | Retry toast appears; retry works again |

---

## 5. Group Chat — Partial User Story Coverage
| Test ID (new) | PRD File | Scenario / Description | Steps Sample | Expected Result |
|---|---|---|---|---|
| SIX-Convo-Gap-43 | Group Handling | Group metadata system messages | Change group icon/name | System messages appear; no SLA/ownership change |
| SIX-Convo-Gap-44 | Group Handling | Send as selector visible and preselected | Open group composer | Send as shows session identity |
| SIX-Convo-Gap-45 | Group Handling | Identity switch with confirmation | Change Send as -> send | Uses chosen identity; shows confirmation badge |
| SIX-Convo-Gap-46 | Group Handling | Quoted reply preview and deeplink | Open quoted preview -> click history | Preview shows context; click opens related room |
| SIX-Convo-Gap-47 | Group Handling | Multi-number inbound appends to same session | Inbound from number A then B | Appends in same session; outbound identity unchanged unless overridden |
| SIX-Convo-Gap-48 | Group Handling | Resolved then new inbound creates new session | Resolve -> new inbound | New Unassigned session created; banner links prior |
| SIX-Convo-Gap-49 | Group Handling | Group typing and online state preserved | Open group with participants | Typing and presence update in real time |

---

## 6. Ready-to-Write Request
Kamu bisa minta saya:
1. Menyalin isi ini ke `Test/conversation/Conversation_gap_supplement.tsv` dengan format sesuai standar TSV repo.
2. Menghubungkan setiap `SIX-Convo-Gap-xx` ke TC Automation script id (mis. `Auto-Convo-Gap-xx`) agar siap di-run sebagai automation candidate.
