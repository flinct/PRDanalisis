# Product Module Map

> This document provides a high-level overview of the SatuInbox product structure.
>
> The purpose of this document is **not** to explain how each module works, but to establish a standardized map of the entire SatuInbox ecosystem before constructing the **Feature Dependency Flow (FDF)**.
>
> Every module listed below will eventually have its own knowledge documentation and later become a node within the Feature Dependency Flow.

---

# Product Structure

```text
SatuInbox
│
├── Conversation
│
├── Ticket
│
├── Broadcast
│
├── Global Search
│
├── Analytics
│
├── Contacts
│
├── Prospek (Leads)
│
├── Notification
│
├── Settings
│
└── Authentication
      ├── Profile (just show name current username, not can edit or etc without permission)
      └── Logout
```

---

# Module Overview

| Module | Purpose |
|---------|---------|
| Conversation | Central workspace where agents receive, manage, and respond to customer conversations across multiple communication channels. |
| Ticket | Manage customer issues, case tracking, and ticket lifecycle. |
| Broadcast | Create, schedule, and monitor mass message campaigns across supported communication channels. |
| Global search | Make the flexibility for user experience for searching some chat or ticket more easy to navigate |
| Analytics | Provide operational reports, performance metrics, KPIs, and business insights generated from product activities. |
| Contacts | Store and manage customer profiles, contact information, attributes, and communication history. |
| Prospek (Leads) | Manage potential customers before they become active contacts or customers. |
| Notification | Deliver system notifications, alerts, reminders, and important events to users. |
| Settings | Configure global system behavior, channels, users, permissions, templates, integrations, SLA, and other application configurations. |
| Authentication | Handle user authentication and account access, including Profile management and Logout functionality. |

---

# Documentation Hierarchy

Each module should have its own knowledge documentation.

Example:

```text
Knowledge/

├── Conversation.md
├── Ticket.md
├── Broadcast.md
├── Analytics.md
├── Contacts.md
├── Leads.md
├── Notification.md
├── Settings.md
└── Authentication.md
```

Each document focuses only on explaining its respective module.

The relationships between modules are intentionally excluded from this document and will instead be documented within the **Feature Dependency Flow (FDF)**.

---

# Relationship with Feature Dependency Flow (FDF)

This document serves as the foundation for building the Feature Dependency Flow.

The expected documentation workflow is:

```text
Product Module Map
        │
        ▼
Module Knowledge
        │
        ▼
Feature Dependency Flow (FDF)
```

Where:

- **Product Module Map** defines **what modules exist**.
- **Module Knowledge** explains **what each module is responsible for**.
- **Feature Dependency Flow (FDF)** explains **how those modules interact, exchange data, and depend on one another**.

---

# Scope

This document intentionally remains concise.

It answers only one question:

> **"What modules exist inside SatuInbox?"**

It does **not** explain:

- Feature workflows
- Business rules
- Dependencies
- User journeys
- Technical implementation
- System architecture

Those topics belong to other documentation.

---

# Notes

Whenever a new module is introduced into SatuInbox, it should first be added to this Product Module Map before creating its corresponding knowledge document and integrating it into the Feature Dependency Flow.

This ensures that the Product Module Map always represents the latest high-level structure of the SatuInbox product ecosystem.