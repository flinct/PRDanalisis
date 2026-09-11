# SatuInbox Big Picture --- Omnichannel Channels Visual Requirements

## 1. Purpose

Define the detailed UI requirements for the **Omnichannel Channels**
panel in the SatuInbox Big Picture visual.

Core message:

**Many channels → One SatuInbox Platform**

The visual flow is:

`Channel → Icon + Text → Dotted/Curved Connector → Next Icon → SatuInbox Platform`

## 2. Channel List

Display exactly these channels in this order:

1.  Website Widget
2.  WhatsApp Official (BSP)
3.  WhatsApp Web
4.  Instagram
5.  Facebook
6.  Email
7.  TikTok Chat
8.  Shopee Chat
9.  API Integration

Do not change the order without a new product requirement.

## 3. Panel

The panel is a vertical rounded container on the left side of the
SatuInbox Platform panel.

Recommended CSS:

``` css
.omnichannel-panel {
    position: relative;
    background: #FFFFFF;
    border: 1px solid #E2E8F0;
    border-radius: 16px;
    padding: 20px;
    overflow: hidden;
    box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}
```

Visual characteristics: - white surface - thin light-gray border - 16px
rounded corners - subtle shadow only - enough vertical space for all 9
channels - no heavy decoration

## 4. Section Header

Title:

`Omnichannel Channels`

Subtitle:

`Meet your customers everywhere`

Title: - Inter - 18--20px desktop - 700 weight - `#172554` - left
aligned

Subtitle: - Inter - 12px - 400 weight - `#64748B` - 4px below title -
approximately 18px bottom spacing

## 5. Channel Item

Each channel is displayed as a rounded horizontal strip.

Structure:

``` text
┌──────────────────────────────┐
│ [ICON]  Channel Name         │
└──────────────────────────────┘
                              ···╲
```

Recommended:

``` css
.channel-item {
    height: 40px;
    display: flex;
    align-items: center;
    gap: 9px;
    padding: 0 12px;
    border-radius: 20px;
    background: #F1F5F9;
    color: #172554;
    font-size: 13px;
    font-weight: 500;
    white-space: nowrap;
}
```

Recommended desktop width: 170--190px.

Channel items must: - have equal height - align icon and text
vertically - use consistent horizontal padding - avoid text overlap -
leave enough right-side space for connectors

## 6. Channel Icon

Every channel must have a recognizable icon.

  Channel                   Icon
  ------------------------- --------------------
  Website Widget            Chat/widget icon
  WhatsApp Official (BSP)   WhatsApp logo
  WhatsApp Web              WhatsApp logo
  Instagram                 Instagram logo
  Facebook                  Facebook logo
  Email                     Mail/envelope icon
  TikTok Chat               TikTok logo
  Shopee Chat               Shopee logo
  API Integration           Code/API icon

Recommended:

``` css
.channel-icon {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    object-fit: contain;
}
```

Rules: - use SVG/icon assets, not emoji - maintain consistent
dimensions - brand logos must remain recognizable - do not stretch
icons - icon-to-text gap: 8--10px

## 7. Channel Text

Exact labels:

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
font-family: "Inter", "Segoe UI", Arial, sans-serif;
font-size: 13px;
font-weight: 500;
color: #172554;
```

Text must be vertically centered with the icon.

## 8. Connector / Striped Line

Every channel connects visually to the same Next Icon.

The connector must be: - dotted/dashed - blue - thin - curved - smooth -
one-to-many-to-one visual flow - without arrowheads on individual lines

Recommended SVG style:

``` css
.connector-svg path {
    fill: none;
    stroke: #60A5FA;
    stroke-width: 1.5;
    stroke-dasharray: 2 5;
    stroke-linecap: round;
}
```

Use SVG instead of CSS borders for accurate curved paths.

## 9. Connector Geometry

Each line starts from the right edge/center area of its channel item and
ends near the Next Icon.

Concept:

``` text
Channel ───────╲
Channel ────────╲
Channel ─────────╲
                  ╲
                   (→)
                  ╱
Channel ────────╱
Channel ───────╱
```

The purpose is to communicate:

`Many channels → one destination`

Avoid: - straight lines that make the layout look rigid - lines crossing
through text/icons - disconnected lines - lines leaving the panel -
thick solid connectors - arrowheads on every connector

## 10. Connector Layer

Recommended DOM:

``` html
<div class="connector-layer" aria-hidden="true">
    <svg class="connector-svg"
         viewBox="0 0 320 500"
         preserveAspectRatio="none">
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
        <path d="..." />
    </svg>
</div>
```

CSS:

``` css
.connector-layer {
    position: absolute;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}

.connector-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}
```

Layering:

``` text
Connector Layer  z-index 1
Channel Items     z-index 2
Next Icon         z-index 3
```

## 11. Next Icon

The Next Icon represents the convergence of all channels before entering
the SatuInbox Platform.

Visual:

``` text
      ( → )
```

Recommended:

``` css
.next-flow {
    width: 38px;
    height: 38px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: #DBEAFE;
    border: 1px solid #BFDBFE;
    color: #2563EB;
    font-size: 18px;
    font-weight: 600;
    box-shadow: 0 2px 6px rgba(37, 99, 235, 0.12);
}
```

Position: - right side of channel list - vertically around the center of
the channel group - close enough to communicate flow - not touching the
panel border - visually aligned with the next SatuInbox Platform panel

## 12. Flow Relationship

The full relationship should read visually as:

``` text
┌─────────────────────────────┐
│ Omnichannel Channels        │
│                             │
│ [icon] Website Widget  ···╲ │
│ [icon] WhatsApp        ····╲│
│ [icon] WhatsApp Web    ····╲│
│ [icon] Instagram       ·····╲
│ [icon] Facebook        ·····(→)
│ [icon] Email           ·····╱
│ [icon] TikTok          ····╱│
│ [icon] Shopee          ···╱ │
│ [icon] API             ··╱  │
└─────────────────────────────┘
                         ↓
                 SatuInbox Platform
```

Only the Next Icon uses an arrow.

## 13. Spacing

Recommended: - channel height: 40px - gap: 8--10px - icon: 28px -
icon/text gap: 8--10px - panel padding: 20px - title-to-subtitle: 4px -
subtitle-to-list: 18px

Approximate channel stack:

`9 × 40px + 8 × 8px = 424px`

With header/padding, target panel height is approximately 520--570px.

## 14. Responsive

### Desktop ≥1200px

Show: - full names - full icons - curved connectors - Next Icon - full
horizontal flow

### Tablet 768--1199px

-   reduce item width if necessary
-   font can reduce to 12px
-   icon remains at least 26px
-   connector remains visible
-   Next Icon remains visible

### Mobile \<768px

Do not force the desktop curved layout.

Preferred transformation:

``` text
Omnichannel Channels
        ↓
[icon] Website Widget
[icon] WhatsApp Official
[icon] WhatsApp Web
...
[icon] API Integration
        ↓
      ( → )
        ↓
SatuInbox Platform
```

On mobile, connector can become a vertical flow if horizontal curves
become unreadable.

No unintended horizontal overflow.

## 15. Accessibility

If icon is decorative because channel name is already visible:

``` html
<img src="whatsapp.svg" alt="" aria-hidden="true">
```

Connector:

``` html
<svg aria-hidden="true">
```

If Next Icon is decorative:

``` html
<div aria-hidden="true">→</div>
```

If Next Icon becomes interactive:

``` html
<button
    type="button"
    aria-label="Continue to SatuInbox Platform">
    →
</button>
```

Do not duplicate visible channel names in screen-reader labels
unnecessarily.

## 16. Interaction

Default component is a static architecture visualization.

Channel items do not need to be clickable unless product requirements
define navigation.

If interaction is added: - hover may slightly increase contrast -
related connector may highlight - transition 150--200ms - no heavy
animation - no layout shift

Example:

``` css
.channel-item {
    transition: background-color 160ms ease;
}

.channel-item:hover {
    background: #EAF2FF;
}
```

Do not make static architecture look like navigation.

## 17. Recommended HTML

``` html
<section class="omnichannel-panel"
         aria-labelledby="omnichannel-title">

    <header class="section-header">
        <h2 id="omnichannel-title">
            Omnichannel Channels
        </h2>

        <p>
            Meet your customers everywhere
        </p>
    </header>

    <div class="omnichannel-flow">

        <div class="channel-list">

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/widget.svg"
                     alt=""
                     aria-hidden="true">
                <span>Website Widget</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/whatsapp.svg"
                     alt=""
                     aria-hidden="true">
                <span>WhatsApp Official (BSP)</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/whatsapp.svg"
                     alt=""
                     aria-hidden="true">
                <span>WhatsApp Web</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/instagram.svg"
                     alt=""
                     aria-hidden="true">
                <span>Instagram</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/facebook.svg"
                     alt=""
                     aria-hidden="true">
                <span>Facebook</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/email.svg"
                     alt=""
                     aria-hidden="true">
                <span>Email</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/tiktok.svg"
                     alt=""
                     aria-hidden="true">
                <span>TikTok Chat</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/shopee.svg"
                     alt=""
                     aria-hidden="true">
                <span>Shopee Chat</span>
            </div>

            <div class="channel-item">
                <img class="channel-icon"
                     src="icons/api.svg"
                     alt=""
                     aria-hidden="true">
                <span>API Integration</span>
            </div>

        </div>

        <div class="connector-layer" aria-hidden="true">
            <svg class="connector-svg"
                 viewBox="0 0 320 500"
                 preserveAspectRatio="none">
                <!-- 9 curved dotted paths -->
            </svg>
        </div>

        <div class="next-flow" aria-hidden="true">
            →
        </div>

    </div>
</section>
```

## 18. Design Tokens

``` css
:root {
    --brand-primary: #2563EB;
    --brand-dark: #172554;

    --text-primary: #172554;
    --text-secondary: #64748B;

    --surface: #FFFFFF;
    --surface-channel: #F1F5F9;
    --surface-next: #DBEAFE;

    --border: #E2E8F0;
    --border-next: #BFDBFE;

    --connector: #60A5FA;

    --radius-panel: 16px;
    --radius-channel: 20px;

    --channel-height: 40px;
    --channel-icon-size: 28px;
    --channel-gap: 8px;

    --font-family:
        "Inter",
        "Segoe UI",
        Arial,
        sans-serif;
}
```

## 19. Acceptance Criteria

### Header

-   [ ] Title is exactly `Omnichannel Channels`.
-   [ ] Subtitle is exactly `Meet your customers everywhere`.
-   [ ] Correct typography and alignment.

### Channels

-   [ ] Exactly 9 channels are displayed.
-   [ ] Order matches the requirement.
-   [ ] Icon dimensions are consistent.
-   [ ] Text is vertically aligned.
-   [ ] Each channel uses a rounded strip.
-   [ ] No overlap or clipping.

### Connector

-   [ ] Every channel has one connector.
-   [ ] Connector is dotted/dashed.
-   [ ] Connector is blue.
-   [ ] Connector is curved.
-   [ ] All connectors converge toward the same Next Icon.
-   [ ] No connector crosses text or icons.
-   [ ] No connector is visibly broken.
-   [ ] No connector exits the panel.

### Next Icon

-   [ ] Circular shape.
-   [ ] Right arrow.
-   [ ] Located on the right side of the channel group.
-   [ ] Visually connected to all channel paths.
-   [ ] Leads visually toward SatuInbox Platform.

### Responsive

-   [ ] Desktop preserves horizontal many-to-one flow.
-   [ ] Tablet remains readable.
-   [ ] Mobile switches to a vertical flow when necessary.
-   [ ] No unintended horizontal overflow.

### Accessibility

-   [ ] Channel names are semantic text.
-   [ ] Decorative icons do not duplicate text.
-   [ ] Connector SVG is hidden from assistive technology.
-   [ ] Interactive Next Icon has an accessible label.

## 20. Visual Quality Priorities

### P0 --- Must match

1.  Title
2.  Subtitle
3.  9 channels
4.  Icon placement
5.  Text placement
6.  Rounded channel strips
7.  Dotted curved connectors
8.  Convergence
9.  Next Icon
10. Flow into SatuInbox Platform

### P1 --- High importance

1.  Spacing
2.  Typography
3.  Alignment
4.  Connector geometry
5.  Icon sizing
6.  Panel proportions

### P2 --- Enhancement

1.  Hover
2.  Micro-animation
3.  Additional interaction
4.  Decorative shadow

Do not sacrifice P0/P1 accuracy for P2 decoration.

## 21. Final Visual Message

The area must immediately communicate:

> **Customers can reach SatuInbox through many channels, while SatuInbox
> unifies those channels into one platform.**

The visual hierarchy is:

`Many Channels → One Convergence Point → SatuInbox Platform`
