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



# 67. Roadmap — Dynamic Planning & Timeline Interaction Revision

## 67.1 Scope

This revision adds interactive planning behavior to the SatuInbox Task Prioritization & Roadmap.

The following fields must become dynamically editable:

- Strategic Area
- Impact
- Effort
- Testing
- Priority

The Timeline must also become an interactive planning grid:

- existing months can be extended
- months can be added one at a time
- each month is divided into 4 weekly sections
- task schedule is selected by dragging across timeline cells
- Backlog remains permanently at the far right
- a task can span multiple weeks and multiple months

---

# 68. Current Roadmap Structure

Current columns:

```text
# | Task | Strategic Area | Description |
Impact | Effort | Testing | Dependency | Priority |
Sep | Oct | Nov | Dec | Backlog
```

The revised structure remains conceptually the same, but these columns become interactive.

---

# 69. Dynamic Combobox Fields

The following fields must be implemented as editable combobox/select controls:

```text
Strategic Area
Impact
Effort
Testing
Priority
```

The user must be able to change the value without editing the underlying source/code manually.

---

# 70. Strategic Area Combobox

## Behavior

Clicking the Strategic Area cell opens a dropdown.

Example:

```text
┌────────────────────────────┐
│ Growth & Internal Ops   ▾  │
└────────────────────────────┘
```

Dropdown:

```text
┌────────────────────────────┐
│ Search...                  │
├────────────────────────────┤
│ Analytics                  │
│ Open API                   │
│ Broadcast                 │
│ Omnichannel Chat           │
│ Ticket                     │
│ Sales                      │
│ Tools / Add-ons            │
│ AI                         │
│ Theme                      │
│ Affiliate                  │
│ Payment                    │
│ Notification               │
│ Mobile App                 │
│ Growth & Internal Ops      │
└────────────────────────────┘
```

The list should be data-driven.

Do not hardcode options into individual table rows.

Recommended data model:

```js
strategicAreas = [
  "Analytics",
  "Open API",
  "Broadcast",
  "Omnichannel Chat",
  "Ticket",
  "Sales",
  "Tools / Add-ons",
  "AI",
  "Theme",
  "Affiliate",
  "Payment",
  "Notification",
  "Mobile App",
  "Growth & Internal Ops"
]
```

New strategic areas should be addable without changing the component structure.

---

# 71. Impact Combobox

Values:

```text
Low
Medium
High
```

Short display:

```text
L
M
H
```

Recommended UI:

```text
Impact
┌─────┐
│  M ▾│
└─────┘
```

Dropdown:

```text
Low
Medium
High
```

The selected value should retain semantic styling.

---

# 72. Effort Combobox

Values:

```text
Low
Medium
High
```

Display:

```text
L
M
H
```

The user can dynamically change the effort classification.

Changing effort must trigger re-evaluation of the displayed priority if priority is configured as derived.

However, if Priority is explicitly user-editable, the system must not silently overwrite it.

See Priority Rules below.

---

# 73. Testing Combobox

Values:

```text
Low
Medium
High
```

Meaning:

```text
Low:
limited testing methods / limited affected area

Medium:
multiple test methods or moderate regression area

High:
broad regression / integration / cross-module / channel testing
```

The UI should only show:

```text
L / M / H
```

with full meaning available in tooltip/popover if needed.

---

# 74. Priority Combobox

Priority must be selectable dynamically.

Recommended values:

```text
P1
P2
P3
Backlog
```

Display:

```text
P1 ▾
P2 ▾
P3 ▾
Backlog ▾
```

Use the same semantic colors defined by the Roadmap design system.

---

# 75. Priority Rule

Dynamic selection must still respect the product's priority principle:

```text
Impact ↓
    ↓
Effort ↑
    ↓
Testing ↑
    ↓
Dependency
    ↓
Readiness
```

Interpretation:

1. Higher Impact comes first.
2. For equal Impact, lower Effort comes first.
3. For equal Impact and Effort, lower Testing comes first.
4. Dependency and readiness constrain scheduling.

The combobox does not remove this principle.

It allows the planner to explicitly set/update the classification.

---

# 76. Priority Validation

If the selected Priority conflicts strongly with the metrics, the UI should warn rather than silently changing it.

Example:

```text
Impact: Low
Effort: High
Testing: High
Priority: P1
```

Show:

```text
⚠ Priority may be inconsistent with the current
Impact / Effort / Testing combination.
```

Do not automatically change the user's value unless an explicit auto-priority mode is enabled.

---

# 77. Auto Priority vs Manual Priority

Recommended architecture:

```text
Priority Mode:
[ Manual ▾ ]
```

Optional future mode:

```text
Automatic
```

### Manual

User controls Priority.

### Automatic

System calculates priority using:

```text
Impact
→ Effort
→ Testing
→ Dependency
→ Readiness
```

For the current roadmap, **Manual should be the default** unless product requirements specify otherwise.

---

# 78. Combobox UX

Combobox requirements:

- click to open
- keyboard accessible
- search for Strategic Area
- single selection
- selected state visible
- click outside closes
- Escape closes
- Enter selects
- arrow keys navigate
- no page layout shift
- dropdown must appear above/below based on available viewport space

Recommended width:

```text
Strategic Area:
180–220px

Impact:
70–90px

Effort:
70–90px

Testing:
70–90px

Priority:
80–100px
```

---

# 79. Editable Cell Visual

Default:

```text
┌──────────────┐
│ Growth & Ops │
└──────────────┘
```

Hover:

```text
┌──────────────┐
│ Growth & Ops ▾
└──────────────┘
```

Focus:

```text
┌──────────────┐
│ Growth & Ops ▾
└──────────────┘
   ↑ focus ring
```

Do not make every cell look like a permanent form field.

The table should remain readable in view mode.

---

# 80. Timeline Revision

Current:

```text
Sep | Oct | Nov | Dec | Backlog
```

New:

```text
Sep | Oct | Nov | Dec | + Add Month | Backlog
```

However, `+ Add Month` is an action, not a permanent timeline column.

After adding:

```text
Sep | Oct | Nov | Dec | Jan | Backlog
```

Add another:

```text
Sep | Oct | Nov | Dec | Jan | Feb | Backlog
```

The Backlog column must always remain last.

---

# 81. Add Month Interaction

Provide a control near the timeline header:

```text
                         [+ Add Month]
```

Clicking it opens a compact month selector.

Example:

```text
┌──────────────────────────┐
│ Add timeline month       │
├──────────────────────────┤
│ January                  │
│ February                 │
│ March                    │
│ April                    │
│ ...                      │
└──────────────────────────┘
```

The new month is inserted chronologically before Backlog.

Do not allow:

```text
Backlog | Jan
```

Correct:

```text
Jan | Backlog
```

---

# 82. Month Order

Months must always be chronological.

Example:

```text
Sep | Oct | Nov | Dec | Jan | Backlog
```

If the user adds February before January, the system should still place it correctly:

```text
Sep | Oct | Nov | Dec | Jan | Feb | Backlog
```

Do not rely on insertion order.

---

# 83. Duplicate Month Prevention

A month can exist only once in the timeline.

If September already exists:

```text
Add September
```

must be disabled or show:

```text
September is already in the timeline.
```

---

# 84. Month Header Structure

Every month must contain exactly 4 timeline sections.

Example:

```text
┌──────────────────────────────┐
│          September           │
├──────┬──────┬──────┬─────────┤
│ W1   │ W2   │ W3   │ W4      │
└──────┴──────┴──────┴─────────┘
```

The month header spans all four weekly cells.

---

# 85. Timeline Grid

Final header:

```text
Task
Strategic Area
Description
Impact
Effort
Testing
Dependency
Priority
             September
          ┌────┬────┬────┬────┐
          │ W1 │ W2 │ W3 │ W4 │
          └────┴────┴────┴────┘
             October
          ┌────┬────┬────┬────┐
          │ W1 │ W2 │ W3 │ W4 │
          └────┴────┴────┴────┘
             ...
                                  Backlog
```

---

# 86. Timeline Cell

Each week is an individual selectable cell.

Example:

```text
┌───────┐
│ W1    │
│       │
└───────┘
```

Recommended minimum width:

```text
44–56px
```

depending on viewport.

The timeline must remain horizontally scrollable if many months are added.

---

# 87. Task Scheduling Model

A task schedule must be represented by:

```js
{
  taskId: "...",
  start: {
    month: "Sep",
    week: 4
  },
  end: {
    month: "Oct",
    week: 2
  }
}
```

Example:

```text
Start:
September Week 4

End:
October Week 2
```

Selected cells:

```text
Sep W4
Oct W1
Oct W2
```

Total:

```text
3 timeline cells
```

---

# 88. Drag-to-Select Requirement

The primary scheduling interaction is drag selection.

User can:

```text
click + drag
```

across weekly cells.

Example:

```text
September

W1   W2   W3   W4
                     ████
                          ╲
October

W1   W2   W3   W4
████ ████
```

For:

```text
Sep W4 → Oct W2
```

the system highlights:

```text
Sep W4
Oct W1
Oct W2
```

and creates one continuous task bar.

---

# 89. Drag Interaction

Start:

```text
pointer down
```

on a timeline cell.

Move:

```text
pointer drag
```

through adjacent cells.

End:

```text
pointer up
```

The selected range becomes the task schedule.

---

# 90. Selection Preview

While dragging, show the selection immediately.

Example:

```text
Sep
W1 W2 W3 [W4]
           ╲
Oct
[W1][W2] W3 W4
```

A lightweight preview bar should appear before release.

Do not require the user to guess the final range.

---

# 91. Continuous Range

Scheduling must use continuous ranges.

If user selects:

```text
Sep W4 → Oct W2
```

the system automatically includes:

```text
Sep W4
Oct W1
Oct W2
```

The user should not have to manually select each cell.

---

# 92. Reverse Drag

Support dragging in either direction.

If user starts at:

```text
Oct W2
```

and drags toward:

```text
Sep W4
```

the system normalizes the result to:

```text
Start = Sep W4
End   = Oct W2
```

---

# 93. Drag Cancel

If the user presses Escape while dragging:

```text
cancel selection
```

No schedule should be changed.

Clicking outside before completing the interaction should not unexpectedly create a range.

---

# 94. Existing Schedule Editing

If a task already has:

```text
Sep W2 → Sep W4
```

the user must be able to resize or replace the range.

Recommended interactions:

### Move

Drag the entire bar.

### Resize start

Drag left edge.

### Resize end

Drag right edge.

Example:

```text
W1 W2 [████████] W4
       ↑      ↑
      start   end
```

---

# 95. Timeline Bar

Task schedule is represented by one visual bar spanning the selected cells.

Example:

```text
Sep
W1 W2 W3 W4
         ┌─────┐
         │Task │
         └─────┘

Oct
W1 W2 W3 W4
┌─────────┐
│  Task   │
└─────────┘
```

The bar should visually continue across the month boundary.

---

# 96. Month Boundary

Do not break the task into visually unrelated bars.

For:

```text
Sep W4 → Oct W2
```

the user should see one continuous schedule:

```text
Sep                       Oct
W1 W2 W3 [████] | [████ ████] W3 W4
                ↑
          month boundary
```

The month boundary remains visible, but the task bar remains continuous.

---

# 97. Timeline Status

The task bar may use Priority color:

```text
P1 → emerald
P2 → blue
P3 → violet
Backlog → orange
```

The color must come from semantic theme variables.

The bar must not replace the visible Priority combobox.

Both must remain visible.

---

# 98. Backlog

Backlog is a special timeline state.

Rules:

- always the final column
- not divided into weeks
- cannot be moved
- cannot appear between months
- cannot be duplicated
- remains visible when horizontal scrolling
- preferably sticky/fixed to the right edge of the timeline region

Example:

```text
Sep | Oct | Nov | Dec | Jan | Feb | ... | Backlog
```

---

# 99. Backlog Interaction

Selecting Backlog means:

```text
Task is not currently scheduled to a month/week.
```

If a task is moved from Backlog into a week:

```text
Backlog
   ↓
Sep W3 → Sep W4
```

the task leaves the Backlog state.

If a scheduled task is moved into Backlog:

```text
Sep W3 → Backlog
```

the previous weekly schedule is removed.

---

# 100. Backlog Visual

Backlog should visually differ from weekly cells.

Example:

```text
┌───────────────┐
│   Backlog     │
│ not scheduled │
└───────────────┘
```

It must not look like Week 5.

Backlog is a distinct state.

---

# 101. Timeline Horizontal Scrolling

As months are added, the timeline can become wider than the viewport.

Recommended:

```text
┌──────────────────────────────────────────────┐
│ fixed task information │ ← timeline scroll → │
└──────────────────────────────────────────────┘
```

The left task columns should remain sticky:

```text
# / Task
```

or:

```text
# / Task / Strategic Area
```

depending on available width.

---

# 102. Timeline Sticky Header

The month/week header should remain visible while vertically scrolling the task list.

Recommended:

```css
.timeline-header {
    position: sticky;
    top: 0;
    z-index: 20;
}
```

The sticky header must respect the application shell/header height.

---

# 103. Sticky Backlog

Recommended:

```text
Backlog = sticky right
```

This makes the special state always accessible even when many months are added.

The sticky Backlog must have a visual separator:

```css
border-left: 1px solid var(--border-1);
```

---

# 104. Week Header

Use:

```text
W1
W2
W3
W4
```

Do not display exact calendar dates unless required later.

This requirement is based on four planning sections per month, not real calendar week calculation.

---

# 105. Month Width

Each month:

```text
4 × week width
```

Example:

```text
week width = 52px

month width = 208px
```

The month header spans all four cells.

---

# 106. Timeline Grid HTML

Recommended structure:

```html
<div class="timeline">

    <div class="timeline-header">

        <div class="fixed-column task-column">
            Task
        </div>

        <div class="fixed-column strategic-column">
            Strategic Area
        </div>

        <div class="fixed-column description-column">
            Description
        </div>

        <div class="fixed-column metric-column">
            Impact
        </div>

        <div class="fixed-column metric-column">
            Effort
        </div>

        <div class="fixed-column metric-column">
            Testing
        </div>

        <div class="fixed-column dependency-column">
            Dependency
        </div>

        <div class="fixed-column priority-column">
            Priority
        </div>

        <div class="timeline-scroll">

            <div class="month">
                <div class="month-title">
                    September
                </div>

                <div class="weeks">
                    <div>W1</div>
                    <div>W2</div>
                    <div>W3</div>
                    <div>W4</div>
                </div>
            </div>

            <!-- more months -->

        </div>

        <div class="backlog-column">
            Backlog
        </div>

    </div>

</div>
```

---

# 107. Task Row Timeline HTML

```html
<div class="task-row">

    <div class="fixed-cell task-cell">
        Super admin internal
    </div>

    <div class="fixed-cell">
        <Combobox />
    </div>

    <div class="fixed-cell">
        ...
    </div>

    <div class="fixed-cell">
        <Combobox />
    </div>

    <div class="fixed-cell">
        <Combobox />
    </div>

    <div class="fixed-cell">
        <Combobox />
    </div>

    <div class="fixed-cell">
        ...
    </div>

    <div class="fixed-cell">
        <PriorityCombobox />
    </div>

    <div class="timeline-scroll">

        <div class="week-cell"></div>
        <div class="week-cell"></div>
        <div class="week-cell"></div>

        <div class="week-cell selected">
            <div class="task-bar">
                Super admin internal
            </div>
        </div>

        ...

    </div>

    <div class="backlog-cell"></div>

</div>
```

---

# 108. Timeline CSS Baseline

```css
.timeline-scroll {
    overflow-x: auto;
    overflow-y: visible;
}

.month {
    display: inline-block;
}

.weeks {
    display: grid;
    grid-template-columns:
        repeat(4, 52px);
}

.week-cell {
    width: 52px;
    min-width: 52px;
    height: 44px;

    border-right:
        1px solid var(--border-3);

    border-bottom:
        1px solid var(--border-3);

    position: relative;
}

.task-bar {
    position: absolute;

    left: 2px;
    right: 2px;

    top: 8px;
    height: 28px;

    border-radius: 8px;

    display: flex;
    align-items: center;

    padding: 0 8px;

    white-space: nowrap;

    overflow: hidden;
}
```

---

# 109. Drag Selection CSS

During drag:

```css
.week-cell.is-selecting {
    background: var(--timeline-selection-bg);
}

.week-cell.is-selected {
    background: var(--timeline-selected-bg);
}
```

The selection should remain subtle.

Do not use an extremely bright block that obscures the grid.

---

# 110. Task Bar CSS

```css
.task-bar {
    z-index: 3;

    pointer-events: auto;

    cursor: grab;
}

.task-bar:active {
    cursor: grabbing;
}
```

Resize handles:

```css
.task-bar::before,
.task-bar::after {
    content: "";
    position: absolute;

    top: 0;
    bottom: 0;

    width: 5px;

    cursor: ew-resize;
}
```

Use actual elements instead of pseudo-elements if accessibility or complex interaction requires it.

---

# 111. Drag Interaction States

Required states:

```text
idle
hover
selecting
selected
dragging
resizing-start
resizing-end
```

Visual changes must remain subtle.

---

# 112. Mouse Interaction

Desktop:

```text
mousedown
mousemove
mouseup
```

must support:
- range selection
- moving task bar
- resizing start
- resizing end

---

# 113. Touch Interaction

On touch devices, support:
- tap cell
- tap-and-drag if practical
- task bar move
- task bar resize

Avoid accidental page scrolling during timeline drag.

Use:

```css
touch-action: none;
```

only on the interactive timeline drag surface, not the entire page.

---

# 114. Keyboard Accessibility

Combobox:
- Tab
- Arrow Up/Down
- Enter
- Escape

Timeline:
- selected task can receive focus
- arrow keys can move schedule by one week
- Shift + Arrow can resize selection
- Enter can edit schedule if needed

The timeline must not rely exclusively on mouse dragging.

---

# 115. Timeline Tooltip

On hover/selection, show:

```text
Super admin internal
Sep W4 → Oct W2
3 weeks
```

Optional:

```text
Start: September Week 4
End: October Week 2
Duration: 3 weeks
```

This prevents ambiguity when a bar spans month boundaries.

---

# 116. Timeline Duration

Duration is based on selected planning cells.

Examples:

```text
Sep W1 → Sep W1
= 1 week

Sep W1 → Sep W4
= 4 weeks

Sep W4 → Oct W2
= 3 weeks

Sep W3 → Nov W1
= 7 weeks
```

Calculation is based on the planning grid, not actual calendar days.

---

# 117. Task Scheduling Validation

Before saving a schedule:

Check:

```text
start <= end
```

Check that:
- timeline month exists
- week is 1–4
- task is not simultaneously Backlog and scheduled
- range is continuous
- no invalid month order exists

---

# 118. Dependency + Timeline

Dependency must be visible before scheduling.

Example:

```text
GTM
Dependency: Task #1
```

If Task #1 is scheduled:

```text
Sep W1 → Sep W2
```

GTM should not silently be scheduled before the dependency if dependency enforcement is enabled.

Recommended warning:

```text
⚠ Dependency Task #1 is scheduled after this task.
```

Do not silently move the task.

---

# 119. Current Task Section

Current tasks remain grouped at the top:

```text
Current tasks — start now
```

The interactive timeline applies to them normally.

Their timeline can begin in the current planning period.

---

# 120. Row Reordering

This revision does not require drag-and-drop row reordering.

Task priority is controlled through:

```text
Priority
```

and the roadmap sorting logic.

Do not introduce row drag unless separately requested.

---

# 121. Sorting

Recommended optional sort:

```text
Current Tasks
    ↓
P1
    ↓
P2
    ↓
P3
    ↓
Backlog
```

Within the same priority:

```text
Impact
→ Effort
→ Testing
→ Dependency
```

However, explicit manual ordering should be preserved if the roadmap requires a fixed sequence.

---

# 122. Dynamic Timeline + Priority Relationship

Changing:

```text
Impact
Effort
Testing
Priority
```

must not automatically move a task's timeline bar without explicit user action.

Example:

```text
Task scheduled:
Sep W4 → Oct W2

User changes Impact:
Medium → High
```

The timeline remains:

```text
Sep W4 → Oct W2
```

Only priority classification changes.

This prevents accidental schedule destruction.

---

# 123. Timeline Persistence

Every change should persist:

```text
Strategic Area
Impact
Effort
Testing
Priority
Timeline start
Timeline end
Backlog state
```

Recommended object:

```js
{
  id: "task-001",

  strategicArea: "Growth & Internal Ops",

  impact: "M",
  effort: "M",
  testing: "M",

  priority: "P1",

  schedule: {
    start: {
      month: "Sep",
      week: 4
    },

    end: {
      month: "Oct",
      week: 2
    }
  }
}
```

---

# 124. Unsaved Changes

If persistence is not immediate, show:

```text
Unsaved changes
```

with:

```text
Save
Cancel
```

If autosave is used:

```text
Saved
```

should appear subtly.

---

# 125. Undo

Recommended:

```text
Undo
```

for destructive timeline operations.

Useful actions:
- delete schedule
- move task
- resize task
- change priority
- change metric

---

# 126. Delete Timeline Schedule

The user should be able to clear a schedule.

Possible interaction:

```text
Right click / context menu / task menu

Clear schedule
Move to backlog
```

After clearing:

```text
Backlog
```

is the resulting state if selected.

---

# 127. Add Month Limit

There should be no artificial four-month limit.

The roadmap may grow:

```text
Sep
Oct
Nov
Dec
Jan
Feb
Mar
...
```

Backlog always remains last.

The UI must handle horizontal growth through scrolling.

---

# 128. Timeline Header Visual Hierarchy

Month:

```text
font-size: 11–12px;
font-weight: 700;
```

Week:

```text
font-size: 9–10px;
font-weight: 500;
```

Month header should be visually stronger than Week labels.

---

# 129. Timeline Grid Borders

Month boundary:

```text
border-left:
1px solid var(--border-1);
```

Week boundary:

```text
border-right:
1px solid var(--border-3);
```

This creates hierarchy:

```text
Month boundary = strong
Week boundary = subtle
```

---

# 130. Dark Theme Timeline

All interactive timeline elements must support:

```text
navy
slate
charcoal
zinc
```

Default:

```text
navy
```

Use:

```text
--app-bg
--elevated-bg
--text-1 ... --text-6
--border-1 ... --border-3
```

plus derived:

```text
--timeline-cell-bg
--timeline-hover-bg
--timeline-selection-bg
--timeline-selected-bg
--timeline-grid
```

---

# 131. Dark Theme Timeline Cell

Default:

```css
.week-cell {
    background: var(--timeline-cell-bg);
    border-color: var(--border-3);
}
```

Hover:

```css
.week-cell:hover {
    background: var(--timeline-hover-bg);
}
```

Selected:

```css
.week-cell.is-selected {
    background: var(--timeline-selected-bg);
}
```

Do not use bright blue full-cell fills.

---

# 132. Dark Theme Task Bars

Task bars should remain saturated enough to be recognized but not neon.

Example semantic families:

```text
P1 → emerald
P2 → blue / sky
P3 → violet / indigo
Backlog → orange
```

Use theme-specific values.

---

# 133. Dark Theme Combobox

Combobox:

```css
.combobox {
    background: var(--elevated-bg);
    color: var(--text-2);
    border: 1px solid var(--border-2);
}
```

Dropdown:

```css
.combobox-menu {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
}
```

Option hover:

```css
.combobox-option:hover {
    background: var(--hover-bg);
}
```

No white dropdown panels in dark theme.

---

# 134. Responsive Timeline

## Desktop

Show:

```text
fixed task columns
+
horizontal weekly timeline
+
sticky Backlog
```

## Tablet

Reduce fixed columns.

Recommended minimum fixed columns:

```text
Task
Priority
```

Other metadata can be condensed.

## Mobile

Use a two-layer interaction:

```text
Task Card
    ↓
Metrics / Comboboxes
    ↓
Timeline
```

The full desktop table should not be compressed into unreadable columns.

---

# 135. Mobile Timeline

Recommended:

```text
┌──────────────────────────────┐
│ Super admin internal         │
│ Growth & Internal Ops        │
│ Impact M  Effort M  Test M   │
│ Priority P1                  │
├──────────────────────────────┤
│ September                    │
│ W1 W2 W3 W4                  │
│       █████                  │
├──────────────────────────────┤
│ October                      │
│ W1 W2 W3 W4                  │
│ ███████                      │
└──────────────────────────────┘
```

Drag scheduling remains possible.

---

# 136. Final Interaction Model

The roadmap should behave as:

```text
VIEW
 ↓
EDIT METRICS
 ↓
EDIT PRIORITY
 ↓
SELECT TIMELINE
 ↓
DRAG / RESIZE SCHEDULE
 ↓
SAVE
```

The user should not need a separate planning page for normal timeline adjustments.

---

# 137. Final Visual Model

```text
┌─────────────────────────────────────────────────────────────────────────┐
│ SatuInbox Task Prioritization & Roadmap                                  │
├───────┬─────────────┬──────────────┬────┬────┬────┬────┬──────┬─────────┤
│ Task  │ Strategic   │ Description  │ I  │ E  │ T  │Dep │ Prio │ Timeline│
│       │ Area        │              │    │    │    │    │      │         │
├───────┴─────────────┴──────────────┴────┴────┴────┴────┴──────┤         │
│                                                               │         │
│ Current tasks — start now                                     │         │
│                                                               │         │
│ Super admin │ Growth & Ops ▾ │ ... │ M ▾ │ M ▾ │ M ▾ │ — │ P1 ▾ │        │
│                                                               │         │
│                                                               │ Sep      │
│                                                               │W1 W2 W3 W4│
│                                                               │   █████  │
│                                                               │ Oct      │
│                                                               │W1 W2 W3 W4│
│                                                               │████      │
│                                                               │         │
│                                                               │ + Add    │
│                                                               │   Month  │
│                                                               │         │
│                                                               │ Backlog  │
└───────────────────────────────────────────────────────────────┴─────────┘
```

---

# 138. Acceptance Criteria — Dynamic Fields

- [ ] Strategic Area is a combobox.
- [ ] Impact is a combobox.
- [ ] Effort is a combobox.
- [ ] Testing is a combobox.
- [ ] Priority is a combobox.
- [ ] Values can be changed without source-code editing.
- [ ] Selected values are visually clear.
- [ ] Dropdown supports keyboard navigation.
- [ ] Strategic Area supports search.
- [ ] Semantic colors remain correct.
- [ ] Changes persist.
- [ ] Changing metrics does not silently destroy timeline data.

---

# 139. Acceptance Criteria — Timeline

- [ ] Timeline currently supports September–December.
- [ ] User can add one month at a time.
- [ ] Added months appear chronologically.
- [ ] Duplicate months are prevented.
- [ ] Every month contains exactly 4 week sections.
- [ ] Weeks are labeled W1–W4.
- [ ] Each week is independently addressable.
- [ ] User can drag across cells to select a range.
- [ ] Range can cross month boundaries.
- [ ] Sep W4 → Oct W2 produces exactly 3 selected weeks.
- [ ] Existing range can be resized.
- [ ] Existing range can be moved.
- [ ] Reverse drag is normalized.
- [ ] Selection can be cancelled.
- [ ] Backlog is always last.
- [ ] Backlog is not divided into weeks.
- [ ] Timeline supports horizontal scrolling.
- [ ] Backlog remains accessible at the end/right.
- [ ] Month/week header remains readable while scrolling.

---

# 140. Acceptance Criteria — Timeline Example

Given:

```text
Start = September Week 4
End   = October Week 2
```

Expected selection:

```text
September:
W1  W2  W3  [W4]

October:
[W1] [W2] W3 W4
```

Expected duration:

```text
3 weeks
```

Expected stored state:

```js
{
  start: {
    month: "Sep",
    week: 4
  },
  end: {
    month: "Oct",
    week: 2
  }
}
```

---

# 141. Acceptance Criteria — Backlog

- [ ] Backlog is always the final timeline column.
- [ ] Adding a month never places it after Backlog.
- [ ] Backlog is visually different from weekly cells.
- [ ] Moving a task to Backlog clears its active timeline range.
- [ ] Moving a Backlog task into a week removes its Backlog state.
- [ ] Backlog remains accessible when the timeline becomes horizontally large.

---

# 142. Acceptance Criteria — Dark Theme

Test all interactions in:

```text
navy
slate
charcoal
zinc
```

Verify:

- [ ] combobox
- [ ] dropdown
- [ ] dropdown hover
- [ ] selected option
- [ ] timeline cell
- [ ] timeline hover
- [ ] timeline selection
- [ ] task bar
- [ ] task bar drag
- [ ] resize handles
- [ ] month header
- [ ] week header
- [ ] sticky columns
- [ ] sticky Backlog
- [ ] warnings
- [ ] tooltips
- [ ] focus states

No interactive element may fall back to a light-theme surface in dark mode.

---

# 143. Final UX Principle

The roadmap should move from a **static table** into a lightweight **interactive planning board**, while preserving the table's readability.

Core interaction:

```text
COMBOBOX
   ↓
Classify task

DRAG TIMELINE
   ↓
Schedule task

BACKLOG
   ↓
Explicitly unscheduled state

DEPENDENCY
   ↓
Scheduling constraint
```

The planner should be able to answer three questions directly from the page:

```text
1. How important is this task?
2. What does it require?
3. When will we work on it?
```

The timeline interaction must make scheduling fast enough that planning does not require manually entering dates or week values.
