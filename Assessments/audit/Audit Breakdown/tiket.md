# Feature

Ticket

---

# Purpose

Ticket is the primary feature within the Ticket module that enables agents to organize, monitor, and manage customer issues through a structured ticketing workflow.

A Ticket serves as a tracking object that transforms conversations into manageable work items. Each Ticket allows agents and teams to monitor progress, ownership, SLA compliance, priority, and resolution status throughout the customer support lifecycle.

Unlike Conversation, which focuses on communication, Ticket focuses on issue management and operational tracking.

---

# Business Goal

*   Organize customer issues into structured work items.
*   Track issue progress from creation until resolution.
*   Improve collaboration between agents.
*   Monitor SLA compliance.
*   Prioritize customer requests.
*   Provide measurable operational data for reporting and analytics.

---

# Core Objects

*   Ticket
*   Conversation >> Ticket Room Chat
*   Customer
*   Agent
*   Team
*   Status
*   Priority
*   SLA
*   Tags
*   Inbox >bedanya sama conversation apa?
*   Channel

---

# Views

Ticket provides multiple representations of ticket data based on predefined conditions.

Examples include:

*   Semua Ticket
*   Tiket Baru
*   Butuh Respons
*   Sedang Diproses
*   Lewat SLA
*   Selesai
*   Snoozed

Each View displays the same Ticket objects using different filtering conditions.

---

# Actions

Users can perform various actions on Tickets, including:

*   Create Ticket (Without message)
*   Assign Ticket
*   Change Ticket Status
*   Change Priority
*   Change Inbox Team (Which team can see that ticket)
*   Add Tag
*   Update Assignee
*   Reply to Customer from ticket
*   Export Ticket
*   Bulk Reply (Balas massal)
*   Filter Tickets
*   Sort Tickets
*   Configure Table Display
*   Setting ticket type
*   Snooze chat >> snooze ticket
*   Chat on ticket page conversation real time
*   Add mark on ticket
*   Add description on ticket
*   Add media and file (attachment)
*   Add makro (text template)
*   Internal chat (on ticket conversation. so the costumer doesn't can see that message, the message just can show for internal team that assign to that ticket)
*   Close ticket on ticket conversation
*   Navigate to costum "Tipe Tiket" when

---

# Components

Several UI components support the Ticket feature.

Examples:

*   Ticket List
*   Status Cards
*   Search Box
*   Filter
*   Sorting
*   View Selector
*   Date Range Picker
*   Table Display Settings
*   Export Button
*   Bulk Action Toolbar
*   Pagination
*   Ticket Table
*   Priority Badge
*   SLA Indicator
*   Status Dropdown
*   Tag Selector
*   Inbox Selector
*   Assignee Selector
*   Ticket attribute (costum attribute that appear on "Detail ticket" in ticket conversation)
*   Add tag button (on ticket conversation page)

These Components assist users when interacting with Tickets but do not represent business capabilities.

---

# Business Rules

Ticket follows several important business rules.

Examples include:

*   Every Ticket must have a current Status.
*   A Ticket may be assigned to one Agent at a time.
*   Ticket Priority determines operational urgency.
*   SLA is continuously calculated during the Ticket lifecycle.
*   Ticket status changes must follow predefined workflows.
*   Permissions depend on User Role.
*   Ticket information must remain synchronized with its related Conversation when applicable.
*   Historical ticket activities should be recorded for auditing purposes.

---

# Dependencies

Ticket interacts closely with several other Features inside SatuInbox.

### Upstream

Ticket depends on:

*   Conversation
*   Contact
*   Authentication
*   User Management
*   Team Management
*   Channel Integration

Conversation provides the communication context that becomes the foundation of Ticket management.

Contact provides customer identity information.

Authentication and User Management determine permissions.

---

### Downstream

Ticket provides data to:

*   Dashboard
*   Analytics
*   Reporting
*   Global Search
*   Notification System (this feature was appear on current version (2.7.0) but this feature will develop be develop (improve design system) soon )

Ticket information is also used by business reporting and operational monitoring features.

---

# Notes

This document describes the Ticket feature from a business capability perspective.

Detailed dependencies between Ticket and other Features are documented separately in the Feature Dependency Flow (FDF).

This document should be validated with Product, QA, and Development teams whenever new Ticket capabilities are introduced.