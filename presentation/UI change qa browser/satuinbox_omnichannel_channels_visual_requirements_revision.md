# SatuInbox Big Picture --- Omnichannel Channels

## UI Review & Revision Requirements

## 1. Review Scope

This document revises the previous Omnichannel Channels visual
specification based on the latest UI reference.

The latest reference is a compact vertical card containing: - section
title - section subtitle - 9 channel rows - channel icon containers -
channel labels - dotted blue connector paths - one circular next/flow
icon outside the card

The intended visual message remains:

> **Many channels → One SatuInbox Platform**

------------------------------------------------------------------------

# 2. Current UI Assessment

## Overall

The latest version is **cleaner and closer to the intended Big Picture
style** than the previous version.

Strengths: - compact card - clear title hierarchy - readable channel
labels - consistent row height - clear many-to-one connector concept -
next icon is visually separated from the card - light enterprise SaaS
appearance - good use of whitespace - channel list is easy to scan

However, several elements should be refined before treating this as the
final design.

------------------------------------------------------------------------

# 3. Priority Issues

## P0 --- Must Fix

### P0.1 Channel icons are visually inconsistent

The current screenshot shows icons that look like mixed
representations: - some look like actual brand logos - some look like
generic emoji/icon substitutions - icon background treatment varies -
visual weight is inconsistent

Examples: - Website Widget appears as a small generic chat symbol. -
Email appears as a pale envelope. - TikTok appears as a musical-note
representation. - API is a code symbol.

### Requirement

Use a consistent icon strategy.

Preferred:

``` text
Brand channel
→ official/approved brand SVG

Functional channel
→ consistent product icon set
```

Do not use emoji.

Do not mix emoji with SVG logos.

Recommended icon size:

``` text
24 × 24 px
```

Recommended icon container:

``` text
30 × 30 px
```

Each icon should be optically centered.

------------------------------------------------------------------------

## P0.2 Connector paths are too visually dominant

The connector is important, but the current dotted blue paths compete
with the channel list.

The visual currently reads:

``` text
Channel rows
                 \\          \\           → 
```

rather than:

``` text
Channel rows  ···╲
Channel rows  ····╲
Channel rows  ·····→
```

### Requirement

Reduce connector visual weight.

Recommended:

``` css
stroke-width: 1.25px;
stroke: #60A5FA;
stroke-dasharray: 2 5;
stroke-linecap: round;
```

If necessary:

``` text
opacity: 0.75–0.85
```

The connector must remain visible but secondary to channel content.

------------------------------------------------------------------------

## P0.3 Connector convergence needs cleaner geometry

The paths currently converge into a narrow vertical area immediately
beside the card.

This creates a visually dense point.

Target:

``` text
top rows       ╲
                ╲
middle rows ─────●
                ╱
bottom rows   ╱
```

Use a wider convergence area.

The lines should: - leave each channel from approximately its
right-center - curve smoothly - distribute endpoints around the Next
Icon - avoid crossing each other - avoid looking tangled - avoid
touching the card border unnecessarily

------------------------------------------------------------------------

## P0.4 Next icon should visually belong to the flow

The circular arrow currently looks slightly detached from the channel
panel.

The relationship should be unmistakable:

``` text
[Channel Panel] ────→ (→) ────→ [SatuInbox Platform]
```

The Next Icon should sit halfway between: - channel panel - SatuInbox
Platform panel

It should not look like a floating action button.

### Recommendation

Treat it as a **flow connector node**, not a UI button.

Therefore: - no strong button shadow - no hover treatment unless
interactive - no excessive blue fill - use a soft blue circular node -
arrow should be visually clear

------------------------------------------------------------------------

# 4. Card Proportion

The current card is vertically dominant.

This is acceptable because there are 9 channels, but the panel should
remain compact.

Recommended:

``` text
Width:
240–270px

Padding:
16–18px

Channel row:
38–40px

Gap:
6–8px
```

Avoid making the card significantly wider just to create more connector
space.

Connector space should be provided outside the card.

------------------------------------------------------------------------

# 5. Header Revision

Current:

``` text
Omnichannel Channels
Meet your customers everywhere
```

This wording is good and should remain.

## Title

Recommended:

``` css
font-size: 17–18px;
font-weight: 700;
line-height: 1.25;
color: #172554;
```

## Subtitle

Recommended:

``` css
font-size: 11–12px;
font-weight: 400;
line-height: 1.4;
color: #64748B;
```

## Spacing

``` text
Title → Subtitle: 3–5px
Subtitle → First channel: 14–18px
```

The current title/subtitle hierarchy is already good; do not increase
the subtitle size.

------------------------------------------------------------------------

# 6. Channel Row Revision

Current row treatment is good:

``` text
┌───────────────────────────────┐
│ [icon]  Website Widget        │
└───────────────────────────────┘
```

Keep the soft rounded strip.

Recommended:

``` css
.channel-item {
    height: 38–40px;
    border-radius: 20px;
    background: #F1F5F9;
}
```

The row should not have a visible border.

The background should be slightly darker than the page background but
lighter than the card border.

------------------------------------------------------------------------

# 7. Channel Text

Keep exact labels:

``` text
Website Widget
WhatsApp Official (BSP)
WhatsApp Web
Instagram
Facebook
Email
TikTok Chat
Shopee Chat
API Integration
```

Recommended:

``` css
font-size: 12–13px;
font-weight: 500;
color: #172554;
```

Text should remain one line on desktop.

For:

``` text
WhatsApp Official (BSP)
```

do not truncate on the intended desktop viewport.

------------------------------------------------------------------------

# 8. Icon Container

Instead of placing the icon directly on the row background, use a subtle
icon container.

Recommended:

``` text
channel row
┌─────────────────────────────────┐
│  ◉    Channel Name              │
└─────────────────────────────────┘
```

Icon container:

``` css
.channel-icon-wrapper {
    width: 28–30px;
    height: 28–30px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;
}
```

The icon itself:

``` text
20–24px
```

This gives every channel the same visual footprint even when the actual
logos have different shapes.

------------------------------------------------------------------------

# 9. Brand Icon Treatment

Use a consistent treatment:

### WhatsApp

Use the WhatsApp brand mark.

Both: - WhatsApp Official (BSP) - WhatsApp Web

may use the same WhatsApp icon.

Differentiate them through text, not by inventing different icons.

### Instagram

Use Instagram brand mark.

### Facebook

Use Facebook brand mark.

### TikTok

Use TikTok brand mark.

### Shopee

Use Shopee brand mark.

### Email

Use a consistent mail/envelope product icon.

### API Integration

Use a consistent code/API icon.

### Website Widget

Use a consistent chat/widget icon.

------------------------------------------------------------------------

# 10. Connector Architecture

The connector should be implemented as an independent SVG layer.

Recommended DOM:

``` html
<div class="omnichannel-flow">

    <div class="channel-list">
        ...
    </div>

    <svg class="connector-layer"
         aria-hidden="true">
        ...
    </svg>

    <div class="next-flow">
        →
    </div>

</div>
```

Do not implement the nine connectors using individual borders or
pseudo-elements if accurate curves are required.

SVG gives better control over: - curve - endpoint - spacing - responsive
behavior - convergence - stroke style

------------------------------------------------------------------------

# 11. Connector Style

Recommended final style:

``` css
.connector {
    fill: none;
    stroke: #60A5FA;
    stroke-width: 1.25;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
    opacity: 0.8;
}
```

Do not use: - thick lines - solid lines - gradients - arrows on every
path - animated moving dots by default

The only arrow should be the Next Icon.

------------------------------------------------------------------------

# 12. Connector Entry Point

Each connector begins approximately at:

``` text
channel-item right center
```

Example:

``` text
┌──────────────────────┐
│ Website Widget       │────···╲
└──────────────────────┘        ╲
```

Do not attach the line to: - top edge - bottom edge - text - icon

unless required by a responsive layout.

------------------------------------------------------------------------

# 13. Connector Convergence

Use a single convergence zone.

Concept:

``` text
row 1  ─────╲
row 2  ──────╲
row 3  ───────╲
row 4  ────────╲
row 5  ─────────●
row 6  ────────╱
row 7  ───────╱
row 8  ──────╱
row 9  ─────╱
```

The actual paths can converge around the left edge/center of the Next
Icon.

Avoid all paths terminating at exactly the same pixel because this
creates a dark/overlapping dot.

------------------------------------------------------------------------

# 14. Next Icon Revision

The Next Icon should be:

``` text
38 × 38px
```

or:

``` text
36 × 36px
```

Recommended:

``` css
.next-flow {
    width: 36px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 50%;

    background: #DBEAFE;
    border: 1px solid #BFDBFE;

    color: #2563EB;

    font-size: 16px;
    font-weight: 600;

    box-shadow:
        0 2px 5px rgba(37, 99, 235, 0.10);
}
```

The icon should look like:

``` text
        ┌──────┐
        │  →   │
        └──────┘
```

but rendered as a circular node.

------------------------------------------------------------------------

# 15. Next Icon Position

The icon should be positioned outside the card.

Recommended relationship:

``` text
┌─────────────────────┐       (→)       ┌─────────────────────┐
│ Omnichannel Channels│───────────────→ │ SatuInbox Platform  │
└─────────────────────┘                 └─────────────────────┘
```

The distance from: - card → Next Icon - Next Icon → Platform

should feel balanced.

Do not place the icon so close to the card that it appears attached to
the border.

Do not place it so far away that the relationship disappears.

------------------------------------------------------------------------

# 16. Background

The latest background is appropriate.

Recommended:

``` css
background: #F8FAFC;
```

The card should be:

``` css
background: #FFFFFF;
```

Page background should remain visibly different from card background.

------------------------------------------------------------------------

# 17. Border

Current thin border treatment is good.

Recommended:

``` css
border: 1px solid #E2E8F0;
```

Avoid: - dark border - double border - strong inner border - decorative
outline

------------------------------------------------------------------------

# 18. Shadow

Keep shadow extremely subtle.

Recommended:

``` css
box-shadow:
    0 2px 8px rgba(15, 23, 42, 0.05);
```

The component should feel like a product architecture card, not a
floating modal.

------------------------------------------------------------------------

# 19. Typography System

Use:

``` css
font-family:
    "Inter",
    "Segoe UI",
    Arial,
    sans-serif;
```

Hierarchy:

``` text
Title       17–18px / 700
Subtitle    11–12px / 400
Channel     12–13px / 500
```

Text color:

``` text
Primary     #172554
Secondary   #64748B
```

------------------------------------------------------------------------

# 20. Responsive Behavior

## Desktop

Preferred:

``` text
[Omnichannel Card] ─── (→) ─── [SatuInbox Platform]
```

Connector stays horizontal/curved.

## Tablet

Keep same structure if there is enough room.

Reduce: - card width - row font size - gap

Do not reduce icon below 20px.

## Mobile

Do not preserve the desktop geometry if it causes unreadable curves.

Transform to:

``` text
Omnichannel Channels

[icon] Website Widget
[icon] WhatsApp Official
[icon] WhatsApp Web
...
[icon] API Integration

       ↓
     ( → )

SatuInbox Platform
```

The semantic relationship must remain, even if the geometry changes.

------------------------------------------------------------------------

# 21. Layering

Required z-index:

``` text
Connector SVG     1
Channel Items     2
Next Icon         3
```

This prevents connector paths from visually cutting through channel
rows.

------------------------------------------------------------------------

# 22. Do Not Change

The following parts of the current design are directionally correct and
should remain:

-   vertical channel list
-   9-channel structure
-   title
-   subtitle
-   rounded row style
-   light background
-   compact card
-   dotted connector concept
-   single Next Icon
-   rightward flow
-   overall enterprise SaaS aesthetic

------------------------------------------------------------------------

# 23. Revised HTML Structure

``` html
<section class="omnichannel-panel">

    <header class="section-header">
        <h2>Omnichannel Channels</h2>
        <p>Meet your customers everywhere</p>
    </header>

    <div class="omnichannel-flow">

        <div class="channel-list">

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/widget.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>Website Widget</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/whatsapp.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>WhatsApp Official (BSP)</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/whatsapp.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>WhatsApp Web</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/instagram.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>Instagram</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/facebook.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>Facebook</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/email.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>Email</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/tiktok.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>TikTok Chat</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/shopee.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>Shopee Chat</span>
            </div>

            <div class="channel-item">
                <span class="channel-icon-wrapper">
                    <img src="icons/api.svg"
                         alt=""
                         aria-hidden="true">
                </span>
                <span>API Integration</span>
            </div>

        </div>

        <svg
            class="connector-layer"
            aria-hidden="true"
            preserveAspectRatio="none">
            <!-- 9 curved dotted connector paths -->
        </svg>

        <div
            class="next-flow"
            aria-hidden="true">
            →
        </div>

    </div>

</section>
```

------------------------------------------------------------------------

# 24. Revised CSS Baseline

``` css
.omnichannel-panel {
    position: relative;

    width: 250px;

    padding: 18px;

    background: #FFFFFF;

    border: 1px solid #E2E8F0;

    border-radius: 16px;

    box-shadow:
        0 2px 8px rgba(15, 23, 42, 0.05);
}

.section-header h2 {
    margin: 0;

    font-family:
        "Inter",
        "Segoe UI",
        Arial,
        sans-serif;

    font-size: 18px;
    line-height: 1.25;
    font-weight: 700;

    color: #172554;
}

.section-header p {
    margin: 4px 0 16px;

    font-size: 11px;
    line-height: 1.4;
    font-weight: 400;

    color: #64748B;
}

.omnichannel-flow {
    position: relative;
}

.channel-list {
    position: relative;
    z-index: 2;

    display: flex;
    flex-direction: column;

    gap: 7px;
}

.channel-item {
    height: 40px;

    display: flex;
    align-items: center;

    gap: 9px;

    padding: 0 10px;

    border-radius: 20px;

    background: #F1F5F9;

    color: #172554;

    font-size: 12.5px;
    font-weight: 500;

    white-space: nowrap;
}

.channel-icon-wrapper {
    width: 28px;
    height: 28px;

    flex: 0 0 28px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 8px;
}

.channel-icon-wrapper img {
    width: 22px;
    height: 22px;

    object-fit: contain;
}

.connector-layer {
    position: absolute;

    top: 0;
    left: 0;

    width: 100%;
    height: 100%;

    z-index: 1;

    overflow: visible;

    pointer-events: none;
}

.connector-layer path {
    fill: none;

    stroke: #60A5FA;

    stroke-width: 1.25;

    stroke-dasharray: 2 5;

    stroke-linecap: round;

    opacity: 0.8;
}

.next-flow {
    position: absolute;

    z-index: 3;

    top: 50%;
    right: -44px;

    width: 36px;
    height: 36px;

    display: flex;
    align-items: center;
    justify-content: center;

    transform: translateY(-50%);

    border-radius: 50%;

    background: #DBEAFE;

    border: 1px solid #BFDBFE;

    color: #2563EB;

    font-size: 16px;
    font-weight: 600;

    box-shadow:
        0 2px 5px rgba(37, 99, 235, 0.10);
}
```

------------------------------------------------------------------------

# 25. Acceptance Criteria

## Content

-   [ ] Exactly 9 channels.
-   [ ] Exact channel names.
-   [ ] Correct order.
-   [ ] Title and subtitle match requirement.

## Icons

-   [ ] No emoji.
-   [ ] Brand channels use approved brand icons.
-   [ ] Functional channels use consistent product icons.
-   [ ] All icon containers have equal dimensions.
-   [ ] All icons are optically centered.

## Rows

-   [ ] Equal row height.
-   [ ] Equal spacing.
-   [ ] Rounded shape.
-   [ ] Light background.
-   [ ] No unnecessary border.
-   [ ] Text remains readable.

## Connector

-   [ ] One connector per channel.
-   [ ] Dotted/dashed.
-   [ ] Thin.
-   [ ] Blue.
-   [ ] Curved.
-   [ ] Smooth.
-   [ ] No connector crosses text/icon.
-   [ ] No connector leaves the card.
-   [ ] Convergence looks intentional.
-   [ ] Connector remains secondary to channel content.

## Next Icon

-   [ ] Circular.
-   [ ] Right arrow.
-   [ ] Outside card.
-   [ ] Clearly represents flow, not a random floating action button.
-   [ ] Balanced distance to the next SatuInbox Platform panel.

## Responsive

-   [ ] Desktop uses horizontal many-to-one flow.
-   [ ] Tablet remains readable.
-   [ ] Mobile can switch to vertical flow.
-   [ ] No unintended horizontal overflow.

------------------------------------------------------------------------

# 26. Final Visual Direction

The latest version should be refined, **not redesigned from zero**.

Keep the current visual language:

``` text
Clean
Compact
Enterprise SaaS
Light
Structured
```

Improve only the areas that currently reduce visual quality:

``` text
ICON CONSISTENCY
        ↓
CONNECTOR WEIGHT
        ↓
CONNECTOR GEOMETRY
        ↓
NEXT ICON RELATIONSHIP
```

Final visual hierarchy:

``` text
1. Section title
2. Channel names
3. Channel icons
4. Channel grouping
5. Connector
6. Next Icon
```

The connector must communicate the relationship without becoming the
primary visual element.

## Final semantic message

``` text
Website Widget       ╲
WhatsApp Official     ╲
WhatsApp Web           ╲
Instagram               ╲
Facebook                 ● → SatuInbox Platform
Email                   ╱
TikTok                 ╱
Shopee                ╱
API                   ╱
```

**One clear message: many communication channels enter one unified
SatuInbox platform.**
