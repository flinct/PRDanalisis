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


# 27. Dark Theme Requirements — Big Picture & Roadmap

## 27.1 Scope

Dark theme support applies to **all Big Picture pages and all Roadmap / Task Prioritization pages**.

The dark theme must not be implemented as a simple inversion of the light theme.

The UI must use semantic dark-theme tokens so that:
- background hierarchy remains readable
- cards remain distinguishable
- text maintains sufficient contrast
- channel icons remain recognizable
- connectors remain visible without becoming too bright
- priority badges remain distinguishable
- Gantt bars remain readable
- borders remain subtle
- visual hierarchy remains consistent across Big Picture and Roadmap

All components must consume the same theme variables.

Do not hardcode light-theme colors inside individual components.

---

# 28. QA Browser Dark Theme Modes

The QA Browser currently uses four dark themes.

Default:

```text
navy
```

Theme list:

| ID | Name | App Background | Accent Direction |
|---|---|---|---|
| `navy` | Deep Navy | `#080c14` | purple / blue / emerald |
| `slate` | Slate Tengah | `#111827` | violet / blue / teal |
| `charcoal` | Charcoal Hangat | `#1c1917` | purple / cyan / green |
| `zinc` | Zinc Netral | `#18181b` | indigo / sky / green |

The implementation must support all four themes through CSS variables.

Default theme:

```text
data-theme="navy"
```

---

# 29. Theme Token Architecture

The shared theme layer must expose at minimum:

```css
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

Additional component-specific tokens may be derived from these variables, but the core theme must remain based on the QA Browser token system.

Recommended semantic interpretation:

| Token | Usage |
|---|---|
| `--app-bg` | page/main background |
| `--sidebar-bg` | sidebar / navigation background if present |
| `--elevated-bg` | cards, panels, elevated surfaces |
| `--text-1` | primary heading / strongest text |
| `--text-2` | primary body text |
| `--text-3` | secondary text |
| `--text-4` | metadata / supporting text |
| `--text-5` | muted text |
| `--text-6` | lowest-emphasis text / disabled content |
| `--border-1` | primary card/panel border |
| `--border-2` | secondary/divider border |
| `--border-3` | subtle/low-emphasis border |
| `--sec-brd` | strategic/product section color |
| `--sec-prd` | product/priority section color |
| `--sec-test` | testing/QA section color |

---

# 30. Theme Switching

Theme switching must be implemented at application/root level.

Recommended:

```html
<body data-theme="navy">
```

or:

```html
<div class="app" data-theme="navy">
```

Available values:

```text
navy
slate
charcoal
zinc
```

Example:

```html
<div class="app" data-theme="navy">
    ...
</div>
```

Theme changes must update all visual components without requiring page-specific overrides.

---

# 31. Deep Navy — Default Theme

Default:

```css
[data-theme="navy"] {
    --app-bg: #080c14;
}
```

Visual direction:

> Deep Navy enterprise interface with purple, blue and emerald accents.

Requirements:
- darkest overall background
- high readability
- blue remains the primary SatuInbox interaction/accent direction
- purple may be used for AI/product-related elements
- emerald may be used for positive/success states
- white text must not be pure white everywhere; use the semantic text scale

The default Big Picture and Roadmap must use this theme when no explicit theme is selected.

---

# 32. Slate Theme

```css
[data-theme="slate"] {
    --app-bg: #111827;
}
```

Visual direction:

> Neutral slate interface with violet, blue and teal accents.

Requirements:
- slightly lighter visual background than Deep Navy
- violet can represent AI/product differentiation
- blue remains a core SatuInbox accent
- teal can represent positive/system states
- preserve the same semantic hierarchy as `navy`

---

# 33. Charcoal Theme

```css
[data-theme="charcoal"] {
    --app-bg: #1c1917;
}
```

Visual direction:

> Warm charcoal interface with purple, cyan and green accents.

Requirements:
- background must retain warm charcoal character
- avoid introducing blue-gray surfaces that make it look like the Navy theme
- purple/cyan/green accents should remain distinguishable
- text must use theme variables rather than fixed navy text

---

# 34. Zinc Theme

```css
[data-theme="zinc"] {
    --app-bg: #18181b;
}
```

Visual direction:

> Neutral zinc interface with indigo, sky and green accents.

Requirements:
- neutral dark-gray foundation
- indigo and sky provide primary visual accents
- green provides positive/system emphasis
- maintain clean enterprise SaaS appearance

---

# 35. Dark Surface Hierarchy

The hierarchy must be:

```text
Page Background
    ↓
Sidebar / Navigation
    ↓
Card / Panel
    ↓
Elevated Component
    ↓
Interactive Element
```

Do not make every surface the same dark color.

Example conceptual hierarchy:

```text
--app-bg
    darkest / page canvas

--sidebar-bg
    navigation layer

--elevated-bg
    cards / panels

component surface
    slightly differentiated through borders and elevation
```

The card must remain visibly distinguishable from the page background.

---

# 36. Big Picture — Dark Theme

The Big Picture must preserve its information architecture:

```text
Omnichannel Channels
        ↓
SatuInbox Platform
        ↓
Product Modules
        ↓
Business Value
```

Only the visual treatment changes.

## Panel

Light theme:

```text
white surface
light border
dark text
```

Dark theme:

```text
elevated dark surface
subtle border
light primary text
```

Example:

```css
.big-picture-panel {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    color: var(--text-1);
}
```

Do not use:

```css
background: #FFFFFF;
color: #172554;
```

inside the component.

---

# 37. Omnichannel Channels — Dark Theme

The channel panel must use:

```css
background: var(--elevated-bg);
border-color: var(--border-1);
```

Title:

```css
color: var(--text-1);
```

Subtitle:

```css
color: var(--text-3);
```

Channel row:

```css
background: color-mix(
    in srgb,
    var(--elevated-bg) 78%,
    var(--text-1) 22%
);

color: var(--text-2);
```

If `color-mix()` is avoided for browser compatibility, define a dedicated channel-surface variable per theme.

The channel row must remain distinguishable from the parent card without becoming bright.

---

# 38. Channel Icons — Dark Theme

Icon treatment must be reviewed individually.

Requirements:

- brand logos must remain recognizable
- do not apply a generic white filter to every icon
- do not invert official brand logos blindly
- icon containers should use a subtle tinted surface
- icon background must remain visible against the dark row
- maintain the same icon dimensions as light theme

Recommended:

```css
.channel-icon-wrapper {
    background: var(--icon-bg);
}
```

where `--icon-bg` is theme-specific.

For brand logos:
- preserve recognizable brand colors where possible
- use a light/dark-compatible asset if the original logo becomes unreadable
- do not force every brand into the SatuInbox accent color

---

# 39. Channel Text — Dark Theme

The exact labels remain unchanged:

```text
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

Typography:

```css
color: var(--text-2);
```

Use:

```css
font-weight: 500;
```

Do not use dark navy text in any dark theme.

Incorrect:

```css
color: #172554;
```

Correct:

```css
color: var(--text-2);
```

---

# 40. Connector — Dark Theme

The connector must remain visible but secondary.

Do not reuse the light-theme connector blindly.

Recommended semantic token:

```css
--connector: var(--accent-primary);
```

Then use theme-specific accent values.

Recommended behavior:

```text
navy:
purple / blue direction

slate:
violet / blue direction

charcoal:
cyan direction

zinc:
sky / indigo direction
```

Connector:

```css
.connector {
    fill: none;
    stroke: var(--connector);
    stroke-width: 1.25px;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
    opacity: 0.75;
}
```

The connector must not become neon or overly bright.

---

# 41. Next Icon — Dark Theme

The Next Icon should use an elevated/tinted accent surface.

Recommended:

```css
.next-flow {
    background: var(--next-bg);
    border: 1px solid var(--next-border);
    color: var(--next-fg);
}
```

Do not use the light-theme values:

```css
#DBEAFE
#BFDBFE
#2563EB
```

directly in dark themes.

The icon should visually read as:

```text
dark elevated surface
+
accent arrow
```

rather than a bright light-blue button floating on a dark canvas.

---

# 42. Big Picture Strategic Cards — Dark Theme

Strategic/product cards must maintain semantic differentiation.

Do not assign arbitrary colors per card.

Use the section tokens:

```css
.section-product {
    border-color: var(--sec-prd);
}

.section-testing {
    border-color: var(--sec-test);
}

.section-board {
    border-color: var(--sec-brd);
}
```

If a card uses a tinted background, keep opacity/subtlety low enough that text remains dominant.

---

# 43. Roadmap — Dark Theme

The Roadmap must use exactly the same theme system as Big Picture.

Structure remains:

```text
Header
    ↓
Summary Cards
    ↓
Priority Rule
    ↓
Task Table
    ↓
Current Tasks
    ↓
Next Priorities
    ↓
Later / Backlog
```

Theme only changes the visual layer.

---

# 44. Roadmap Background

Use:

```css
.roadmap {
    background: var(--app-bg);
    color: var(--text-1);
}
```

Do not use fixed:

```css
background: #F8FAFC;
```

inside dark-theme components.

---

# 45. Roadmap Summary Cards

Light:

```text
white card
dark text
gray border
```

Dark:

```text
elevated dark card
light text
subtle border
```

Recommended:

```css
.stat {
    background: var(--elevated-bg);
    border: 1px solid var(--border-1);
    color: var(--text-1);
}
```

Secondary label:

```css
.stat span {
    color: var(--text-4);
}
```

---

# 46. Roadmap Table — Dark Theme

Table header:

```css
background: var(--sidebar-bg);
color: var(--text-3);
border-color: var(--border-2);
```

Table body:

```css
background: var(--elevated-bg);
color: var(--text-2);
```

Rows:

```css
border-color: var(--border-3);
```

Hover:

```css
background: var(--hover-bg);
```

Hover must remain subtle.

Do not use bright white row hover.

---

# 47. Roadmap Task Text Hierarchy

Recommended:

```text
Task title       → --text-1
Task description → --text-2
Strategic area   → --text-3
Metadata         → --text-4
Low emphasis     → --text-5
Disabled         → --text-6
```

Never use fixed dark-theme-incompatible colors.

---

# 48. Priority Badge — Dark Theme

Priority semantic meaning must remain unchanged.

```text
P1 = highest
P2 = medium
P3 = lower
Backlog = not scheduled
```

Dark theme badges should use tinted dark surfaces rather than bright pastel backgrounds.

Concept:

```text
P1
dark green surface + green text

P2
dark blue surface + blue text

P3
dark purple surface + purple text

Backlog
dark orange/brown surface + orange text
```

Do not use the light-theme badge values directly:

```css
#DCFCE7
#DBEAFE
#EDE9FE
#FFEDD5
```

Create theme-aware semantic variables.

---

# 49. Impact / Effort / Testing Pills — Dark Theme

Keep the meaning:

```text
H = High
M = Medium
L = Low
```

Dark theme treatment:

```text
High
dark red surface
light red text

Medium
dark blue/slate surface
light blue text

Low
dark green surface
light green text
```

The H/M/L label must remain visible even if color is unavailable.

Do not rely on color alone.

---

# 50. Gantt / Timeline Bars — Dark Theme

Timeline bars must remain visible against dark table cells.

Recommended semantic treatment:

```text
P1 → emerald family
P2 → blue/sky family
P3 → violet/indigo family
Backlog → orange family
```

Bars must:
- have enough contrast
- not glow excessively
- not look fluorescent
- retain rounded corners
- remain visible in all four themes

---

# 51. Timeline Code Labels

Timeline codes remain:

```text
S = September
O = October
N = November
D = December
B = Backlog
```

Header text:

```css
color: var(--text-3);
```

Selected/current month may use the primary theme accent.

---

# 52. Dependency Visualization — Dark Theme

Dependency remains a scheduling constraint, not a priority score.

Use:

```css
color: var(--text-3);
```

for normal dependency references.

If dependency is blocking:

```text
use warning semantic color
```

but do not use red by default for every dependency.

Only actual blocking dependency should receive stronger warning treatment.

---

# 53. Theme-Safe CSS Architecture

Recommended:

```css
:root,
[data-theme="navy"],
[data-theme="slate"],
[data-theme="charcoal"],
[data-theme="zinc"] {
    /* shared structural tokens */
}

[data-theme="navy"] {
    --app-bg: #080c14;
    /* remaining semantic tokens */
}

[data-theme="slate"] {
    --app-bg: #111827;
    /* remaining semantic tokens */
}

[data-theme="charcoal"] {
    --app-bg: #1c1917;
    /* remaining semantic tokens */
}

[data-theme="zinc"] {
    --app-bg: #18181b;
    /* remaining semantic tokens */
}
```

Components should only consume semantic tokens:

```css
.card {
    background: var(--elevated-bg);
    color: var(--text-1);
    border-color: var(--border-1);
}
```

Never:

```css
.card {
    background: #FFFFFF;
    color: #172554;
}
```

---

# 54. Suggested Semantic Token Set

The QA Browser variables are mandatory. The following derived variables are recommended for these visual components:

```css
--accent-primary
--accent-secondary
--accent-success
--accent-warning
--accent-danger

--icon-bg
--icon-fg

--channel-bg
--channel-text

--connector

--next-bg
--next-border
--next-fg

--hover-bg

--priority-p1-bg
--priority-p1-fg

--priority-p2-bg
--priority-p2-fg

--priority-p3-bg
--priority-p3-fg

--priority-backlog-bg
--priority-backlog-fg
```

These variables should be mapped from the four QA Browser themes.

---

# 55. Theme Mapping Principle

The exact semantic meaning must stay consistent across themes.

Example:

```text
--text-1
always = strongest readable text

--text-3
always = secondary text

--border-1
always = primary component boundary

--elevated-bg
always = elevated surface
```

Only the actual color values change.

Do not change semantic meaning between themes.

---

# 56. Light vs Dark Component Mapping

| Component | Light Theme | Dark Theme |
|---|---|---|
| Page | light gray | `--app-bg` |
| Card | white | `--elevated-bg` |
| Heading | dark navy | `--text-1` |
| Body | dark | `--text-2` |
| Secondary | gray | `--text-3/4` |
| Border | light gray | `--border-1/2/3` |
| Channel row | light gray-blue | dark elevated/tinted surface |
| Channel icon bg | pastel | dark tinted accent surface |
| Connector | light blue | theme accent |
| Next icon | pale blue | dark accent surface |
| P1 | pale green | dark green |
| P2 | pale blue | dark blue |
| P3 | pale purple | dark purple |
| Backlog | pale orange | dark orange |
| Gantt | pastel | saturated-but-muted accent |

---

# 57. No Hardcoded Light Colors

The following colors must not remain hardcoded in dark-theme components:

```text
#FFFFFF
#F8FAFC
#F1F5F9
#E2E8F0
#172554
#64748B
#DBEAFE
#BFDBFE
#2563EB
```

They may remain in a dedicated light-theme token definition, but components must reference semantic variables.

Example:

```css
/* WRONG */
.channel-item {
    background: #F1F5F9;
}

/* CORRECT */
.channel-item {
    background: var(--channel-bg);
}
```

---

# 58. Theme Transition

If theme switching is interactive, use a short transition for surface/text/border changes.

Recommended:

```css
.theme-aware {
    transition:
        background-color 160ms ease,
        border-color 160ms ease,
        color 160ms ease;
}
```

Do not animate layout, size, connector geometry, or task positions during theme switching.

---

# 59. Dark Theme Acceptance Criteria — Big Picture

- [ ] Big Picture works in `navy`.
- [ ] Big Picture works in `slate`.
- [ ] Big Picture works in `charcoal`.
- [ ] Big Picture works in `zinc`.
- [ ] `navy` is the default.
- [ ] Page background uses `--app-bg`.
- [ ] Panels use `--elevated-bg`.
- [ ] Titles use semantic text tokens.
- [ ] Subtitles use secondary text tokens.
- [ ] Channel rows remain distinguishable.
- [ ] Channel icons remain recognizable.
- [ ] No icon is blindly inverted.
- [ ] Connector remains visible but secondary.
- [ ] Next Icon remains visible and integrated with the flow.
- [ ] Strategic section colors remain distinguishable.
- [ ] No light-theme hardcoded text colors remain in dark components.

---

# 60. Dark Theme Acceptance Criteria — Roadmap

- [ ] Roadmap works in all four themes.
- [ ] `navy` is the default.
- [ ] Summary cards remain distinguishable.
- [ ] Table header remains readable.
- [ ] Table rows remain readable.
- [ ] Task text follows text hierarchy.
- [ ] Priority badges remain semantically distinguishable.
- [ ] H/M/L pills remain readable.
- [ ] Gantt bars remain visible.
- [ ] Timeline codes remain readable.
- [ ] Dependency information remains readable.
- [ ] Backlog remains visually distinguishable.
- [ ] Hover states do not become excessively bright.
- [ ] No fixed light-theme background remains.
- [ ] No fixed navy/dark text remains in dark mode.

---

# 61. Cross-Theme QA Matrix

Every release of Big Picture and Roadmap must be checked against:

| Area | Navy | Slate | Charcoal | Zinc |
|---|---:|---:|---:|---:|
| Page background | ✓ | ✓ | ✓ | ✓ |
| Panel contrast | ✓ | ✓ | ✓ | ✓ |
| Heading contrast | ✓ | ✓ | ✓ | ✓ |
| Body text | ✓ | ✓ | ✓ | ✓ |
| Channel icons | ✓ | ✓ | ✓ | ✓ |
| Connector | ✓ | ✓ | ✓ | ✓ |
| Next Icon | ✓ | ✓ | ✓ | ✓ |
| Priority badges | ✓ | ✓ | ✓ | ✓ |
| Gantt bars | ✓ | ✓ | ✓ | ✓ |
| Borders | ✓ | ✓ | ✓ | ✓ |
| Hover states | ✓ | ✓ | ✓ | ✓ |
| Responsive layout | ✓ | ✓ | ✓ | ✓ |

---

# 62. Final Dark Theme Principle

The design must not feel like:

```text
Light UI
    ↓
Invert colors
    ↓
Dark UI
```

It must feel like:

```text
SatuInbox Design System
        ↓
Semantic Theme Tokens
        ↓
Navy / Slate / Charcoal / Zinc
        ↓
Same information hierarchy
        ↓
Theme-specific visual expression
```

The user should immediately recognize the same SatuInbox product architecture and roadmap regardless of theme.

The four themes change **surface, contrast, and accent expression**, not:
- information architecture
- component hierarchy
- content
- priority meaning
- timeline meaning
- dependency meaning
- channel order
- product structure

---

# 63. Final Theme Design Keyword

For all Big Picture and Roadmap dark variants:

> **Modern enterprise SaaS dark dashboard, deep layered surfaces, high readability, semantic accent colors, subtle borders, restrained shadows, compact information-dense layout, premium but functional, no excessive glow, no neon overload, consistent SatuInbox visual hierarchy.**
