Implement two new response metrics for SatuInbox:

1.  **Response Lead Time (RLT)**  
    Measures staff handling time after a conversation is assigned to an agent.

```
RLT = First Customer-Facing Agent Reply Time - First Agent Assignment Time
```

2.  **Wait Time in Queue**  
    Measures how long the customer waits before the conversation is assigned to an agent.

```
Wait Time in Queue = First Agent Assignment Time - First Customer Inbound Message Time
```

These metrics are added as **tracked metrics only** in Phase 1. They must be stored in database, displayed as live timers in Conversation Detail and linked Ticket Detail, and included in Offline Report Download exports.

Existing **FRT** and **TTC** are already available and must not be changed.

What’s New
Area

Scope

New Metric: RLT

Track time from first agent assignment until first successful customer-facing reply.

New Metric: Wait Time in Queue

Track time from first customer inbound message until first agent assignment.

Live Timer

Show running timer in Conversation Detail.

Linked Ticket Support

Show the same metrics in Ticket Detail when ticket is linked to a customer conversation.

Internal-only Ticket Handling

Show Tidak berlaku for tickets without linked customer conversation.

Offline Report Export

Add RLT and Wait Time columns to Conversation and Ticket XLSX reports.

Database Persistence

Store timestamps, raw duration, adjusted duration, status, and quality flags.

Reassignment Handling

RLT starts from first assignment and does not reset on reassignment before first reply.

Multi-assignee Handling

Use earliest assignment as T2 and attribute first response to the agent who sends the first customer-facing reply.

AUX / Snooze Handling

Apply only to adjusted RLT when existing SLA pause policy supports it.

No Alert in Phase 1

No reminder, breach, escalation, sound, or notification for RLT and Wait Time.

Out of Scope
Item

Reason

FRT changes

Already implemented.

TTC changes

Already implemented.

RLT SLA threshold

Not part of Phase 1.

Wait Time SLA threshold

Not part of Phase 1.

Alert / reminder / breach

Phase 1 is metric tracking and visibility only.

Dashboard widget

Not included yet.

New SLA settings UI

Not included yet.

Acceptance Criteria
ID

Acceptance Criteria

AC-01

Given a conversation receives the first customer message, when no agent is assigned yet, then Waktu Antre timer runs from T1.

AC-02

Given an agent is assigned, when T2 is recorded, then Waktu Antre stops and final duration is stored.

AC-03

Given an agent is assigned and has not replied, when Conversation Detail is opened, then Waktu Kerja Staf timer runs from T2.

AC-04

Given the first successful customer-facing reply is sent, when T3 is recorded, then RLT timer stops and final duration is stored.

AC-05

Internal notes, failed replies, drafts, and system messages must not count as T3.

AC-06

Reassignment before first reply must not reset primary RLT.

AC-07

For multi-assignee conversations, first assignment timestamp is used as T2 and first replying agent is stored as first responder.

AC-08

Linked tickets show inherited metrics from linked conversation.

AC-09

Internal-only tickets show Tidak berlaku.

AC-10

Offline Report Download for Conversation and Ticket includes RLT and Wait Time columns.

AC-11

No alert, reminder, breach badge, notification, or escalation is triggered by RLT or Wait Time in Phase 1.

Suggested Column Additions for Export
Report

New Columns

Conversation

First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, First Assignee, First Responder, Metric Status, Metric Quality Flags

Ticket

Linked Conversation ID, Response Metric Source, First Customer Message At, First Assigned At, First Customer Reply At, Wait Time in Queue, Response Lead Time, RLT Adjusted, Metric Status, Metric Quality Flags
