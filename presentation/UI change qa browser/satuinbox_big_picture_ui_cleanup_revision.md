# SatuInbox Big Picture --- UI Cleanup & Layout Revision Requirement

## 1. Scope

Dokumen ini berisi requirement revisi visual untuk halaman **SatuInbox
Big Picture** berdasarkan screenshot terbaru.

Fokus revisi:

-   merapikan keseluruhan composition
-   memperbaiki alignment antar container
-   memperjelas hierarchy
-   memperbaiki penempatan icon
-   memperbaiki connector / dotted line
-   memperjelas box/container
-   menyamakan spacing
-   memperbaiki hubungan visual antar section
-   menjaga dark theme QA Browser
-   menjaga pesan utama: **Many Channels → One SatuInbox Platform →
    Product Modules → Business Value**

Revisi ini **bukan redesign total**. Struktur informasi yang sudah ada
tetap dipertahankan, tetapi layout dan visual hierarchy diperbaiki.

------------------------------------------------------------------------

# 2. Current Layout Assessment

Screenshot saat ini memiliki empat area utama:

``` text
┌──────────────────┐
│ Omnichannel      │
│ Channels         │
│                  │
│ channel list     │
└──────────────────┘
          ↓
┌─────────────────────────────────────────┐
│ SatuInbox Platform                      │
│                                         │
│ Unity / Manage / Automate                │
│ Conversation Preview                    │
│ Secure / Scalable / Customizable        │
└─────────────────────────────────────────┘
                       ↓
              ┌────────────────┐
              │ Product Modules │
              └────────────────┘
                       ↓
              ┌────────────────┐
              │ Business Value │
              └────────────────┘
```

## Main visual issues

### P0 --- Composition

1.  Area kosong di bawah terlalu besar.
2.  Product Modules dan Business Value terasa seperti dua section
    terpisah yang tidak cukup kuat hubungannya dengan SatuInbox
    Platform.
3.  Horizontal alignment antar panel belum konsisten.
4.  Flow connector terlalu tipis/kurang terstruktur pada beberapa area.
5.  Next icon terlihat seperti floating button, bukan flow node.
6.  Product Modules memiliki content density tinggi dibandingkan area
    SatuInbox Platform.
7.  Business Value terlalu sempit sehingga terasa seperti sidebar.
8.  Legend berada terlalu jauh dari content utama.
9.  Border container belum memiliki hierarchy yang cukup jelas.
10. Connector dari SatuInbox Platform ke Product Modules perlu lebih
    jelas.
11. Icon dan text pada Product Modules belum memiliki vertical rhythm
    yang konsisten.
12. Beberapa section title terlihat terlalu dekat dengan border.
13. Overall composition belum terasa sebagai satu diagram yang utuh.

------------------------------------------------------------------------

# 3. Target Composition

Target layout:

``` text
                 SATUINBOX BIG PICTURE

┌─────────────────┐
│ Omnichannel     │
│ Channels        │
│                 │
│ [channel]  ╲    │
│ [channel]   ╲   │
│ [channel]    ╲  │
│ [channel]     ╲ │
│ [channel]      ●│
│ [channel]     ╱ │
│ [channel]    ╱  │
│ [channel]   ╱   │
│ [channel]  ╱    │
└─────────────────┘
           │
           ↓
      ┌────────────────────────────────────────────┐
      │              SatuInbox Platform            │
      │                                            │
      │   ┌────────┐ ┌────────┐ ┌────────┐        │
      │   │ Unity  │ │ Manage │ │Automate│        │
      │   └────────┘ └────────┘ └────────┘        │
      │                                            │
      │   ┌────────────────────────────────────┐   │
      │   │ Conversation / Inbox Representation │   │
      │   └────────────────────────────────────┘   │
      │                                            │
      │   ┌────────┐ ┌────────┐ ┌────────┐        │
      │   │ Secure │ │Scalable│ │Custom. │        │
      │   └────────┘ └────────┘ └────────┘        │
      └────────────────────────────────────────────┘
                           │
                           ↓
                 ┌──────────────────────┐
                 │    Product Modules   │
                 │                      │
                 │  Chat • Ticket • AI  │
                 │  Sales • Broadcast   │
                 │  Analytics • Tools   │
                 │  ...                 │
                 └──────────────────────┘
                           │
                           ↓
                 ┌──────────────────────┐
                 │    Business Value    │
                 │                      │
                 │ Operational          │
                 │ Cost & Insight       │
                 │ Platform             │
                 └──────────────────────┘
```

The actual implementation may remain horizontally arranged on desktop,
but the visual relationship must follow this hierarchy.

------------------------------------------------------------------------

# 4. Grid System

Use a single parent grid for the entire Big Picture.

Recommended desktop:

``` text
12-column grid
```

Example:

``` text
┌─────────────────────────────────────────────────────────────┐
│ 12-column Big Picture Grid                                  │
│                                                             │
│ [ 2.0 ] [      6.8      ] [ 2.0 ] [ 1.2 ]                  │
│ Channels   Platform          Modules      Value             │
└─────────────────────────────────────────────────────────────┘
```

Recommended proportional allocation:

``` text
Omnichannel Channels : 18–20%
SatuInbox Platform   : 52–56%
Product Modules      : 17–19%
Business Value       : 15–17%
```

Do not allow Business Value to become an extremely narrow side column.

------------------------------------------------------------------------

# 5. Container Alignment

All primary containers must align to the same top baseline where they
belong to the same horizontal layer.

Current issue:

``` text
Channels
    └──── starts higher

Platform
    └──── starts at same level

Product Modules
    └──── starts at same level

Business Value
    └──── title is slightly detached
```

Target:

``` text
┌──────────────┐ ┌───────────────────────┐ ┌──────────────┐ ┌──────────────┐
│ Omnichannel  │ │ SatuInbox Platform    │ │ Product      │ │ Business     │
│ Channels     │ │                       │ │ Modules      │ │ Value        │
│              │ │                       │ │              │ │              │
└──────────────┘ └───────────────────────┘ └──────────────┘ └──────────────┘
```

Use consistent top margin/padding.

------------------------------------------------------------------------

# 6. Outer Container

The entire Big Picture should be treated as one visual composition.

Recommended:

``` css
.big-picture {
    width: 100%;
    max-width: 1680px;
    margin: 0 auto;
    padding: 24px 20px 28px;
}
```

Do not use excessive vertical empty space.

Content should occupy the majority of the available viewport.

------------------------------------------------------------------------

# 7. Primary Section Box

Every major section should have a clear container.

Sections:

1.  Omnichannel Channels
2.  SatuInbox Platform
3.  Product Modules
4.  Business Value

Recommended:

``` css
.primary-section {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    border-radius: 14px;
}
```

Each container must have: - consistent border radius - consistent
border - consistent internal padding - clear title area - predictable
content area

Do not mix: - square box - rounded box - borderless box

unless there is a deliberate hierarchy reason.

------------------------------------------------------------------------

# 8. Border Hierarchy

Use three levels.

## Level 1 --- Main Section

``` css
border: 1px solid var(--border-1);
```

Used for: - Omnichannel - SatuInbox Platform - Product Modules -
Business Value

## Level 2 --- Internal Card

``` css
border: 1px solid var(--border-2);
```

Used for: - Unity - Manage - Automate - Secure - Scalable -
Customizable - KPI/stat cards if applicable

## Level 3 --- Divider

``` css
border-color: var(--border-3);
```

Used for: - table separators - list separators - subtle internal
divisions

Do not use `border-1` everywhere.

------------------------------------------------------------------------

# 9. SatuInbox Platform Container

This is the visual center of the Big Picture.

It should receive the strongest container emphasis.

Recommended:

``` text
width: 100%
min-height: consistent
padding: 18–20px
```

The title should be centered.

``` text
SatuInbox Platform
Omnichannel Customer Service Platform · 20 microservices · NestJS · MongoDB · RabbitMQ
```

The subtitle should be visually secondary.

------------------------------------------------------------------------

# 10. Platform Header

## Title

``` text
SatuInbox Platform
```

Recommended:

``` css
font-size: 18px;
font-weight: 700;
color: var(--text-1);
text-align: center;
```

## Subtitle

``` text
Omnichannel Customer Service Platform · 20 microservices · NestJS · MongoDB · RabbitMQ
```

Recommended:

``` css
font-size: 10–11px;
font-weight: 400;
color: var(--text-4);
text-align: center;
```

Do not allow technical stack information to visually compete with the
product title.

------------------------------------------------------------------------

# 11. Platform Capability Cards

Current:

``` text
Unity
Manage
Automate
```

and:

``` text
Secure
Scalable
Customizable
```

This structure is good.

Keep a 3 × 2 arrangement:

``` text
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    icon     │ │    icon     │ │    icon     │
│    Unity    │ │   Manage    │ │  Automate   │
│ description │ │ description │ │ description │
└─────────────┘ └─────────────┘ └─────────────┘

┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    icon     │ │    icon     │ │    icon     │
│   Secure    │ │  Scalable   │ │ Customizable│
│ description │ │ description │ │ description │
└─────────────┘ └─────────────┘ └─────────────┘
```

All six cards must have: - equal width - equal height - same internal
spacing - same icon placement - same text hierarchy

------------------------------------------------------------------------

# 12. Platform Capability Icon

Icon placement:

``` text
      [ ICON ]

       Unity

 All channels in one inbox
```

Recommended:

``` text
Icon area: 28–32px
Icon center aligned
Title below icon
Description below title
```

Do not place icon next to title in these capability cards.

The centered icon is important because it creates a clear visual pattern
across all six cards.

------------------------------------------------------------------------

# 13. Capability Card Typography

Title:

``` css
font-size: 12–13px;
font-weight: 650–700;
color: var(--text-1);
```

Description:

``` css
font-size: 9–10px;
font-weight: 400;
color: var(--text-4);
```

Maintain consistent line height.

------------------------------------------------------------------------

# 14. Conversation Preview

The conversation preview is the strongest visual proof of what the
SatuInbox Platform actually does.

It should remain between:

``` text
Top capabilities
        ↓
Conversation preview
        ↓
Bottom capabilities
```

Recommended spacing:

``` text
top cards → preview: 10–12px
preview → bottom cards: 10–12px
```

The preview must not dominate the entire platform container.

------------------------------------------------------------------------

# 15. Conversation Preview Container

Use an internal card:

``` css
.conversation-preview {
    background: var(--app-bg);
    border: 1px solid var(--border-2);
    border-radius: 10px;
}
```

It should visually look like an application preview embedded inside the
platform card.

The preview should have: - header/search - conversation list - message
area - input - send button

but these elements are illustrative only.

------------------------------------------------------------------------

# 16. Omnichannel Container

The current channel card is directionally correct.

Recommended:

``` css
.omnichannel-section {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    border-radius: 14px;
    padding: 18px;
}
```

The card should not be wider than necessary.

------------------------------------------------------------------------

# 17. Omnichannel Header

Keep:

``` text
Omnichannel Channels
Meet your customers everywhere
```

Title:

``` css
font-size: 16–18px;
font-weight: 700;
color: var(--text-1);
```

Subtitle:

``` css
font-size: 10–11px;
color: var(--text-3);
```

------------------------------------------------------------------------

# 18. Channel Rows

Keep:

``` text
[icon] Website Widget
[icon] WhatsApp Official (BSP)
[icon] WhatsApp Web
[icon] Instagram
[icon] Facebook
[icon] Email
[icon] TikTok Chat
[icon] Shopee Chat
[icon] API Integration
```

Recommended:

``` text
height: 34–38px
gap: 6–8px
```

Do not make the rows too tall.

The goal is to fit all 9 channels comfortably without making the panel
disproportionately tall.

------------------------------------------------------------------------

# 19. Channel Icon Placement

Each icon must have:

``` text
Icon wrapper
    ↓
Icon
    ↓
Text
```

Recommended:

``` text
wrapper: 26–28px
icon: 18–20px
```

The icon wrapper should be vertically centered.

Example:

``` text
┌────────────────────────────┐
│  [ ○ ]   WhatsApp Official │
└────────────────────────────┘
```

The icon must never visually touch the row border.

------------------------------------------------------------------------

# 20. Connector From Channels

The current dotted connector concept is correct but needs more
discipline.

Requirement:

``` text
Every channel
      ↓
individual curved dotted line
      ↓
single convergence area
      ↓
Next Icon
```

Recommended:

``` css
stroke: var(--connector);
stroke-width: 1.2px;
stroke-dasharray: 2 5;
stroke-linecap: round;
opacity: .70–.80;
```

The line should be visible but secondary.

------------------------------------------------------------------------

# 21. Channel Connector Geometry

Do not allow paths to form a tangled bundle.

Recommended geometry:

``` text
row 1 ────────────╲
row 2 ─────────────╲
row 3 ──────────────╲
row 4 ───────────────╲
row 5 ────────────────●
row 6 ───────────────╱
row 7 ──────────────╱
row 8 ─────────────╱
row 9 ────────────╱
```

The middle channel can have the shortest path.

Top and bottom channels should curve toward the center.

------------------------------------------------------------------------

# 22. Next Icon

The current blue circle should be treated as a **flow node**, not a
button.

Recommended:

``` text
size: 32–36px
```

Position:

``` text
outside Omnichannel container
between Omnichannel and SatuInbox Platform
```

Visual:

``` text
[Omnichannel] ─────── ( → ) ─────── [SatuInbox Platform]
```

Do not attach it directly to the channel card.

Do not make it look like a floating action button.

Recommended:

``` css
.next-flow {
    width: 34px;
    height: 34px;
    border-radius: 50%;

    background: var(--next-bg);
    border: 1px solid var(--next-border);
    color: var(--next-fg);
}
```

------------------------------------------------------------------------

# 23. Platform → Product Modules Connector

The current screenshot has a connector and a second Next Icon.

This relationship should be made explicit.

Target:

``` text
SatuInbox Platform
        │
        │
       (→)
        │
        ↓
Product Modules
```

The connector should visually originate from the right-middle area of
the platform.

It should not appear to originate from random content inside the
platform.

------------------------------------------------------------------------

# 24. Product Modules Container

Product Modules should be treated as a proper section, not merely a
floating list.

Current issue: - content is dense - panel is narrow - title is
disconnected from the list - module descriptions are very small

Recommended:

``` css
.product-modules {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    border-radius: 14px;
    padding: 14px;
}
```

------------------------------------------------------------------------

# 25. Product Modules Header

``` text
Product Modules
Turn conversations into value
```

Title:

``` css
font-size: 15–16px;
font-weight: 700;
color: var(--text-1);
```

Subtitle:

``` css
font-size: 10px;
color: var(--text-4);
```

------------------------------------------------------------------------

# 26. Product Module Row

Each module should use:

``` text
[icon]  Module Name ●
        short description
```

Recommended:

``` text
icon wrapper: 24–26px
icon: 15–18px
title: 11–12px
description: 9–10px
```

Example:

``` text
┌──────────────────────────┐
│ [icon] Omnichannel Chat ●│
│        Conversation V2   │
└──────────────────────────┘
```

Use consistent vertical spacing.

------------------------------------------------------------------------

# 27. Product Module Status Dot

The colored dot has useful semantic meaning and should remain.

Legend:

``` text
Green  = Live
Orange = In development / scoped
Gray   = Planned / backlog
```

Dot:

``` text
6–7px diameter
```

Place it immediately after the module title.

Example:

``` text
Omnichannel Chat ●
```

Do not place the dot too far from the title.

------------------------------------------------------------------------

# 28. Product Module Status

Current content:

``` text
Omnichannel Chat     Live
Ticket               Live
Sales                In development / scoped
Broadcast            Live
Analytics            Live
AI                   Planned / scoped
Tools / Add-ons      In development / scoped
Payment              Planned / backlog
Theme                Planned / backlog
Affiliate            Planned / backlog
Notification         Live
Mobile App           Planned / backlog
Open API             Planned / backlog
```

Status color must remain semantic.

------------------------------------------------------------------------

# 29. Product Module Descriptions

Descriptions should be short.

Examples:

``` text
Conversation V2
Ticket V2
PRD + P0 fixes
+ invoice fraud*
+ advance export
bot + summary
widget module + chat tools API
scoping
scoping
targeting fix
widget app web / mobile
public contract
```

Avoid overly long descriptions that force inconsistent row heights.

------------------------------------------------------------------------

# 30. Business Value Container

The Business Value section currently looks visually detached from
Product Modules.

It should become a proper container.

Recommended:

``` css
.business-value {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    border-radius: 14px;
    padding: 14px;
}
```

It should contain:

``` text
Business Value
Create impact at every level.

┌────────────────────┐
│ [icon] Operational │
│                    │
│ ✓ Faster response  │
│ ✓ Unified contact  │
└────────────────────┘

┌────────────────────┐
│ [icon] Cost & ...  │
│                    │
│ ✓ Cost visibility  │
│ ✓ Insight          │
└────────────────────┘

┌────────────────────┐
│ [icon] Platform    │
│                    │
│ ✓ Stable infra     │
└────────────────────┘
```

------------------------------------------------------------------------

# 31. Business Value Card

Each value card:

``` css
.value-card {
    background: var(--elevated-bg);
    border: 1px solid var(--border-2);
    border-radius: 10px;
    padding: 10px;
}
```

Icon:

``` text
24–26px wrapper
```

Title:

``` text
11–12px / 700
```

Bullet:

``` text
9–10px
```

------------------------------------------------------------------------

# 32. Business Value Icon Placement

Use:

``` text
[ICON]  Operational
```

rather than placing the icon far away from the title.

The icon and title should form one semantic group.

Example:

``` text
┌─────────────────────────┐
│ [⚡] Operational         │
│                         │
│ ✓ Faster response       │
│ ✓ Unified contact       │
└─────────────────────────┘
```

------------------------------------------------------------------------

# 33. Main Flow Lines

There are three conceptual flows.

## Flow 1

``` text
Omnichannel Channels
        ↓
SatuInbox Platform
```

## Flow 2

``` text
SatuInbox Platform
        ↓
Product Modules
```

## Flow 3

``` text
Product Modules
        ↓
Business Value
```

All three must use a consistent connector language.

Recommended:

``` text
thin dotted/dashed line
+
circular flow node where needed
+
consistent blue/theme accent
```

------------------------------------------------------------------------

# 34. Connector Rule

Do not mix:

``` text
solid line
dotted line
thick line
arrow
floating button
```

without semantic meaning.

Recommended system:

``` text
Relationship connector:
dotted

Direction node:
circular arrow

Container:
border

Hierarchy:
position + spacing
```

------------------------------------------------------------------------

# 35. Legend

Current legend:

``` text
● Live
● In development / scoped
● Planned / backlog
* Fraud broadcast blocked, menunggu requirement Lincah
```

The legend is useful and should remain.

But it should be positioned closer to the Product Modules section.

Recommended:

``` text
Product Modules
      ↓
module list
      ↓
legend
```

Instead of placing it far at the bottom of the viewport.

------------------------------------------------------------------------

# 36. Legend Typography

``` css
font-size: 9–10px;
color: var(--text-4);
```

Status dot:

``` text
6px
```

Legend should not become a large footer.

------------------------------------------------------------------------

# 37. Footnote

Current:

``` text
* Fraud broadcast blocked, menunggu requirement Lincah
```

Keep the footnote because it communicates a real product constraint.

However, visually separate it from status legend:

``` text
● Live
● In development / scoped
● Planned / backlog

* Fraud broadcast blocked, menunggu requirement Lincah
```

Footnote should use:

``` css
color: var(--text-5);
font-size: 9px;
```

------------------------------------------------------------------------

# 38. Vertical Space

The current design has excessive unused vertical space below the primary
content.

Requirement:

``` text
Do not vertically center the entire architecture inside a huge canvas.
```

Instead:

``` text
Top padding
    ↓
Main architecture
    ↓
Legend / footnote
    ↓
Small bottom padding
```

Recommended:

``` text
main content should occupy approximately 70–85%
of the available initial viewport height
```

The page should feel intentionally composed rather than vertically
empty.

------------------------------------------------------------------------

# 39. Horizontal Spacing

Recommended gaps:

``` text
Channels ↔ Platform:
24–36px

Platform ↔ Product Modules:
24–36px

Product Modules ↔ Business Value:
18–28px
```

Flow nodes occupy part of this gap.

Do not allow cards to touch.

------------------------------------------------------------------------

# 40. Internal Padding

Recommended:

``` text
Primary section:
16–20px

Internal card:
10–14px

Dense module row:
6–8px vertical
```

All four major sections should use comparable visual padding.

------------------------------------------------------------------------

# 41. Border Radius System

Use:

``` text
Primary section: 14–16px
Internal card:   9–12px
Channel row:     18–20px
Icon wrapper:    7–9px
Flow icon:       50%
```

Do not use many unrelated radius values.

------------------------------------------------------------------------

# 42. Icon System

Use a consistent icon family.

Rules:

-   same stroke language
-   same optical weight
-   same visual scale
-   same wrapper dimensions
-   no emoji
-   no random icon libraries mixed together

Recommended:

``` text
Primary section icon:
20–24px

Capability icon:
22–26px

Module icon:
16–18px

Business value icon:
16–18px
```

------------------------------------------------------------------------

# 43. Icon Color

Do not make every icon bright blue.

Use semantic/accent color.

Example:

``` text
Omnichannel:
blue

Platform capabilities:
blue / violet

AI:
purple

Success/live:
emerald

Development:
orange

Planned:
muted gray

Business value:
theme semantic accent
```

The exact color must come from theme variables.

------------------------------------------------------------------------

# 44. Dark Theme Requirement

The entire Big Picture must support:

``` text
navy      #080c14
slate     #111827
charcoal  #1c1917
zinc      #18181b
```

Default:

``` text
navy
```

Use the QA Browser variables:

``` text
--app-bg
--sidebar-bg
--elevated-bg

--text-1
--text-2
--text-3
--text-4
--text-5
--text-6

--border-1
--border-2
--border-3

--sec-brd
--sec-prd
--sec-test
```

------------------------------------------------------------------------

# 45. Dark Theme Surface Mapping

``` text
Page
→ --app-bg

Primary section
→ --elevated-bg

Internal card
→ derived elevated surface

Main heading
→ --text-1

Body
→ --text-2

Secondary
→ --text-3 / --text-4

Metadata
→ --text-5

Border
→ --border-1 / --border-2 / --border-3
```

Never use fixed light-theme values inside components.

Incorrect:

``` css
background: #FFFFFF;
color: #172554;
border: 1px solid #E2E8F0;
```

Correct:

``` css
background: var(--elevated-bg);
color: var(--text-1);
border: 1px solid var(--border-1);
```

------------------------------------------------------------------------

# 46. Dark Theme Connector

Connector must adapt to theme.

``` css
.connector {
    stroke: var(--connector);
    stroke-width: 1.2px;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
    opacity: .75;
}
```

Recommended accent direction:

``` text
navy:
blue / purple / emerald

slate:
violet / blue / teal

charcoal:
purple / cyan / green

zinc:
indigo / sky / green
```

Avoid neon glow.

------------------------------------------------------------------------

# 47. Dark Theme Channel Rows

Channel rows:

``` css
background: var(--channel-bg);
color: var(--channel-text);
border: 0;
```

They must remain distinguishable from:

``` text
--app-bg
```

and:

``` text
--elevated-bg
```

Icon wrappers may use a theme-specific tinted surface.

------------------------------------------------------------------------

# 48. Dark Theme Product Module Cards

Use:

``` css
background: var(--elevated-bg);
border: 1px solid var(--border-2);
```

Status colors remain semantic:

``` text
Live       → emerald
Development → orange
Planned    → muted gray
```

The color must be readable against dark surfaces.

------------------------------------------------------------------------

# 49. Dark Theme Business Value

Business value cards should not become brighter than the main platform.

Hierarchy:

``` text
app background
    ↓
primary cards
    ↓
value cards
```

Business Value is an outcome of the platform, not the primary focus.

------------------------------------------------------------------------

# 50. Responsive Layout

## Desktop ≥1200px

Use horizontal composition:

``` text
Channels → Platform → Product Modules → Business Value
```

## Tablet 768--1199px

Use:

``` text
Channels
    ↓
Platform
    ↓
Product Modules + Business Value
```

or a two-row grid.

## Mobile \<768px

Use vertical narrative:

``` text
Omnichannel Channels
        ↓
SatuInbox Platform
        ↓
Product Modules
        ↓
Business Value
```

This is preferable to compressing all four columns into unreadable
narrow cards.

------------------------------------------------------------------------

# 51. Mobile Connector

On mobile:

``` text
Channel list
      ↓
Flow node
      ↓
Platform
```

Do not retain nine long horizontal curved lines if they become
unreadable.

The relationship is more important than preserving desktop geometry.

------------------------------------------------------------------------

# 52. CSS Architecture

Recommended class hierarchy:

``` text
.big-picture
├── .big-picture-grid
│
├── .omnichannel-section
│   ├── .section-header
│   ├── .channel-list
│   ├── .connector-layer
│   └── .next-flow
│
├── .platform-section
│   ├── .platform-header
│   ├── .capability-grid
│   ├── .conversation-preview
│   └── .capability-grid
│
├── .product-modules-section
│   ├── .section-header
│   ├── .module-list
│   └── .legend
│
└── .business-value-section
    ├── .section-header
    └── .value-list
```

------------------------------------------------------------------------

# 53. CSS Grid Baseline

``` css
.big-picture-grid {
    display: grid;

    grid-template-columns:
        minmax(220px, 1fr)
        minmax(560px, 2.8fr)
        minmax(210px, 1fr)
        minmax(180px, .9fr);

    gap: 28px;

    align-items: start;
}
```

Do not hardcode pixel widths that break at common desktop resolutions.

------------------------------------------------------------------------

# 54. Flow Node Positioning

Flow nodes should not use arbitrary viewport coordinates.

Bad:

``` css
left: 278px;
top: 244px;
```

Preferred:

``` css
position: absolute;
top: 50%;
right: -18px;
transform: translateY(-50%);
```

The node must remain attached to the relationship between containers.

------------------------------------------------------------------------

# 55. Connector Implementation

Recommended:

``` html
<div class="flow-wrapper">

    <section class="source-card">
        ...
    </section>

    <svg class="connector-layer" aria-hidden="true">
        ...
    </svg>

    <div class="flow-node" aria-hidden="true">
        →
    </div>

</div>
```

Use SVG for: - curved lines - responsive path geometry - precise
endpoint control

------------------------------------------------------------------------

# 56. Z-index

Recommended:

``` text
Connector       z-index: 1
Cards           z-index: 2
Flow Node       z-index: 3
```

Connector must never visually cut through: - text - icon - card content

------------------------------------------------------------------------

# 57. Recommended Final Hierarchy

The user should scan the page in this order:

``` text
1. SatuInbox Big Picture
2. Omnichannel Channels
3. SatuInbox Platform
4. Product Modules
5. Business Value
6. Status / roadmap context
```

The platform is the center of the composition.

------------------------------------------------------------------------

# 58. Visual Weight

Recommended visual weight:

``` text
SatuInbox Platform   ██████████
Omnichannel          ███████
Product Modules      ██████
Business Value       █████
Connector            ██
Legend               █
```

The connector should never overpower the content.

The platform should remain the visual anchor.

------------------------------------------------------------------------

# 59. What Should NOT Be Changed

Do not change without a separate product/content requirement:

-   SatuInbox Platform positioning
-   9 omnichannel channel names
-   product module names
-   business value categories
-   status semantics
-   status colors meaning
-   overall Big Picture narrative
-   QA Browser theme IDs
-   theme background values

This document is primarily a **visual/layout refinement requirement**.

------------------------------------------------------------------------

# 60. Acceptance Criteria --- Layout

-   [ ] Four primary areas have clear containers.
-   [ ] Containers use consistent border hierarchy.
-   [ ] Containers align correctly.
-   [ ] Platform remains the visual center.
-   [ ] Product Modules is not excessively narrow.
-   [ ] Business Value is not visually detached.
-   [ ] No excessive unused vertical space.
-   [ ] Main content fills the viewport intentionally.
-   [ ] Horizontal spacing is consistent.
-   [ ] Internal padding is consistent.

------------------------------------------------------------------------

# 61. Acceptance Criteria --- Icons

-   [ ] Icon family is consistent.
-   [ ] No emoji icons.
-   [ ] Icon wrapper dimensions are consistent within each component
    type.
-   [ ] Icons are vertically/horizontally aligned.
-   [ ] Icon does not touch container edges.
-   [ ] Icon color follows semantic theme tokens.
-   [ ] Brand icons remain recognizable.

------------------------------------------------------------------------

# 62. Acceptance Criteria --- Connectors

-   [ ] Channel → Platform connector is visible.
-   [ ] Platform → Product connector is visible.
-   [ ] Product → Business Value relationship is clear.
-   [ ] Connector style is consistent.
-   [ ] Connector does not overlap content.
-   [ ] Connector geometry is smooth.
-   [ ] Flow node is clearly a relationship node.
-   [ ] No arbitrary absolute coordinates.
-   [ ] Desktop and mobile connector behavior are different where
    necessary.

------------------------------------------------------------------------

# 63. Acceptance Criteria --- Containers

-   [ ] Primary sections use `--border-1`.
-   [ ] Internal cards use `--border-2`.
-   [ ] Dividers use `--border-3`.
-   [ ] Border radius is consistent.
-   [ ] Background uses semantic theme variables.
-   [ ] No hardcoded light background in dark components.
-   [ ] Cards are distinguishable from page background.

------------------------------------------------------------------------

# 64. Acceptance Criteria --- Dark Themes

Test all pages in:

``` text
navy
slate
charcoal
zinc
```

For each theme verify:

-   [ ] page background
-   [ ] section background
-   [ ] internal cards
-   [ ] text hierarchy
-   [ ] icon readability
-   [ ] connector readability
-   [ ] flow node
-   [ ] status dots
-   [ ] product modules
-   [ ] business value
-   [ ] borders
-   [ ] hover states
-   [ ] responsive behavior

Default must be:

``` text
navy
```

------------------------------------------------------------------------

# 65. Recommended Final Visual

Desktop:

``` text
┌──────────────┐       ┌─────────────────────────────┐
│              │       │                             │
│ Omnichannel  │  (→)  │       SatuInbox Platform    │
│ Channels     │──────→│                             │
│              │       │  [ Unity ][ Manage ][ Auto ]│
│ [channels]   │       │                             │
│ [channels]   │       │  [ Conversation Preview ]   │
│ [channels]   │       │                             │
│ [channels]   │       │ [Secure][Scale][Custom]     │
│              │       │                             │
└──────────────┘       └─────────────────────────────┘
                                  │
                                (→)
                                  │
                                  ↓
                       ┌────────────────────┐
                       │  Product Modules   │
                       │                    │
                       │  Chat ●            │
                       │  Ticket ●          │
                       │  Sales ●           │
                       │  Broadcast ●       │
                       │  Analytics ●       │
                       │  AI ●              │
                       │  Tools ●           │
                       │  Payment ●         │
                       │  Theme ●           │
                       │  Affiliate ●       │
                       │  Notification ●    │
                       │  Mobile App ●      │
                       │  Open API ●        │
                       └────────────────────┘
                                  │
                                  ↓
                       ┌────────────────────┐
                       │   Business Value   │
                       │                    │
                       │ Operational        │
                       │ Cost & Insight     │
                       │ Platform           │
                       └────────────────────┘
```

The exact desktop implementation may keep Product Modules and Business
Value side-by-side, but their visual relationship must remain explicit.

------------------------------------------------------------------------

# 66. Final Design Principle

The Big Picture should read as a **product architecture story**, not as
four unrelated cards.

The visual narrative is:

``` text
WHERE CUSTOMERS COME FROM
        ↓
WHAT SATUINBOX DOES
        ↓
WHAT PRODUCTS IT PROVIDES
        ↓
WHAT BUSINESS VALUE IT CREATES
```

Therefore:

``` text
Omnichannel
     ↓
SatuInbox Platform
     ↓
Product Modules
     ↓
Business Value
```

The platform is the visual anchor.

Connectors explain relationships.

Containers establish hierarchy.

Icons provide recognition.

Typography establishes information priority.

Spacing provides structure.

Dark theme changes the visual expression, but never changes the
information hierarchy.
