# Product Task Prioritization & Roadmap --- UI/UX Requirements

## 1. Purpose

Build a **Product Task Prioritization & Roadmap** page that converts a
task backlog into a visually clear prioritization matrix and roadmap.

Primary goals:

-   Show total/current/P1/P2/P3 task counts.
-   Explain the prioritization rule.
-   Show task metadata: strategic area, description, impact, effort,
    testing, dependency, and priority.
-   Provide a timeline from **September--December 2026 + Backlog**.
-   Support a future dynamic roadmap where timeline columns and task
    bars can be extended.
-   Preserve the visual hierarchy of the supplied reference while
    adapting it to the **QA Browser dark-theme system**.
-   Make the layout usable at desktop widths, especially 1280×720 and
    above.

------------------------------------------------------------------------

# 2. Page Structure

Recommended semantic HTML:

``` html
<main class="roadmap-page">

  <header class="page-header">
    <section class="page-title">...</section>
    <aside class="roadmap-period">...</aside>
  </header>

  <section class="summary-grid">...</section>

  <section class="roadmap-rules">
    <article class="priority-rule-card">...</article>
    <article class="timeline-code-card">...</article>
  </section>

  <section class="roadmap-board">

    <aside class="strategic-area-column">
      <!-- sticky strategic-area cards -->
    </aside>

    <section class="roadmap-table">

      <header class="roadmap-table-header">...</header>

      <div class="roadmap-body">

        <section class="roadmap-group">
          <aside class="strategic-area-card">...</aside>

          <article class="task-row">
            ...
          </article>
        </section>

      </div>

    </section>
  </section>

  <section class="key-takeaways">...</section>

  <footer class="roadmap-footer">...</footer>

</main>
```

The implementation may use CSS Grid rather than literal nested table
markup. **CSS Grid is preferred** because the roadmap timeline requires
independently positioned bars.

------------------------------------------------------------------------

# 3. Page Header

## 3.1 Left area

Display:

**SatuInbox**

Subtitle:

> One Conversation. More Possibilities.

Then a vertical divider.

Main title:

> Product Task Prioritization & Roadmap

Description:

> From current priorities to long-term growth

Supporting text:

> Based on impact, effort, testing, and dependency. Focus on what
> matters most for SatuInbox.

### Structure

``` html
<header class="page-header">
  <div class="brand-block">
    <div class="brand-name">SatuInbox</div>
    <div class="brand-tagline">One Conversation. More Possibilities.</div>
  </div>

  <div class="header-divider"></div>

  <div class="title-block">
    <h1>Product Task Prioritization &amp; Roadmap</h1>
    <p class="title-subtitle">From current priorities to long-term growth</p>
    <p class="title-description">
      Based on impact, effort, testing, and dependency.
      Focus on what matters most for SatuInbox.
    </p>
  </div>

  <div class="quote-block">
    <blockquote>
      “Build the right things,<br />
      in the right order,<br />
      for a bigger tomorrow.”
    </blockquote>
  </div>

  <div class="period-card">
    <span class="period-label">Roadmap Period</span>
    <strong>Sep – Dec 2026</strong>
    <span>(+ Backlog)</span>
  </div>
</header>
```

------------------------------------------------------------------------

# 4. Summary Cards

Create five KPI cards:

  Metric                   Value Meaning
  ---------------------- ------- --------------------------------
  Total Tasks                 23 All roadmap tasks
  Current Tasks                6 Tasks currently being executed
  High Priority (P1)           7 Highest priority
  Medium Priority (P2)        10 Medium priority
  Low Priority (P3)            6 Lower priority / backlog

## Card structure

``` html
<article class="metric-card metric-card--total">
  <div class="metric-icon">
    <i data-lucide="users"></i>
  </div>

  <div class="metric-content">
    <span class="metric-label">Total Tasks</span>
    <strong class="metric-value">23</strong>
  </div>
</article>
```

## Icons

Use **Lucide Icons** or an equivalent outline icon library.

Recommended:

-   Total Tasks → `users`
-   Current Tasks → `star`
-   P1 → `circle`
-   P2 → `circle`
-   P3 → `circle`

Do not use emoji as interface icons.

------------------------------------------------------------------------

# 5. Priority Rule Card

Display a card explaining how priority is determined.

Title:

> Priority Rule

Icon:

-   Lucide `target`

Rules:

``` text
1. Impact (H > M > L)
2. Effort (L > M > H)
3. Testing (L > M > H)
4. Dependency (if any)
```

### Important interpretation

Priority ranking should favor:

1.  Higher business/product impact.
2.  Lower implementation effort.
3.  Lower testing complexity/risk.
4.  Dependency constraints.

Priority should be represented as:

-   `P1` --- high priority
-   `P2` --- medium priority
-   `P3` --- low priority

------------------------------------------------------------------------

# 6. Timeline Code Card

Title:

> Timeline Codes

Icon:

-   Lucide `calendar-days`

Legend:

``` text
S = September
O = October
N = November
D = December
B = Backlog
```

The code legend must remain understandable without relying on color
alone.

------------------------------------------------------------------------

# 7. Main Roadmap Board

The main board is the most important component.

## Columns

Required columns:

1.  `#`
2.  `Task`
3.  `Current`
4.  `Strategic Area`
5.  `Description (Short)`
6.  `Impact`
7.  `Effort`
8.  `Testing`
9.  `Dependency`
10. `Priority`
11. `Sep (S)`
12. `Oct (O)`
13. `Nov (N)`
14. `Dec (D)`
15. `Backlog (B)`

## Recommended CSS Grid

``` css
.roadmap-grid {
  display: grid;

  grid-template-columns:
    42px
    155px
    64px
    145px
    minmax(180px, 1fr)
    58px
    58px
    64px
    72px
    68px
    repeat(5, minmax(70px, 1fr));
}
```

The timeline columns must have equal width.

------------------------------------------------------------------------

# 8. Strategic Area Groups

Tasks are grouped into strategic areas.

Required groups from the reference:

### Internal Tools

Description:

> Internal operations and business growth.

Suggested icon:

-   `settings`

### Core Platform & Stability

Description:

> Reliable, scalable and high-performing foundation.

Suggested icon:

-   `layers-3`

### Omnichannel Chat & AI

Description:

> Better conversation experiences with AI.

Suggested icon:

-   `messages-square`

### Sales & Customer Management

Description:

> Turn conversations into opportunities.

Suggested icon:

-   `chart-column`

### Analytics & Data

Description:

> Data-driven insights for better decisions.

Suggested icon:

-   `pie-chart`

### Channels & Integrations

Description:

> More channels, broader reach.

Suggested icon:

-   `plug`

### Product Experience

Description:

> Easier, simpler, more delightful.

Suggested icon:

-   `sparkles`

------------------------------------------------------------------------

# 9. Strategic Area Card

``` html
<aside class="strategic-area-card">
  <div class="strategic-area-icon">
    <i data-lucide="settings"></i>
  </div>

  <h2>Internal Tools</h2>

  <p>Internal operations and business growth.</p>
</aside>
```

## Behavior

-   The area card spans the height of all tasks belonging to that group.
-   It must visually communicate grouping.
-   On large screens, it may use `position: sticky`.
-   It must not visually compete with the task rows.
-   Background should be a dark elevated surface with a subtle
    section-specific border/accent.

------------------------------------------------------------------------

# 10. Task Rows

Every task row must expose the same data structure.

``` html
<article class="task-row">

  <div class="task-number">1</div>

  <div class="task-name">
    Super admin internal
  </div>

  <div class="task-current">
    <i data-lucide="star"></i>
  </div>

  <div class="task-strategic-area">
    ...
  </div>

  <div class="task-description">
    Approval pendaftaran user, internal dashboard.
  </div>

  <div class="rating rating--high">H</div>
  <div class="rating rating--medium">M</div>
  <div class="rating rating--medium">M</div>

  <div class="dependency">—</div>

  <div class="priority priority--p1">P1</div>

  <div class="timeline-cell">
    <div class="timeline-bar"></div>
  </div>

</article>
```

------------------------------------------------------------------------

# 11. Current Indicator

Current tasks are indicated by a star icon.

``` html
<div class="current-indicator" title="Current task">
  <i data-lucide="star"></i>
</div>
```

Rules:

-   Show the indicator only for current tasks.
-   Empty state should preserve column alignment.
-   Do not use text `Current` on every row.
-   Use accessible tooltip/`aria-label`.

------------------------------------------------------------------------

# 12. Impact / Effort / Testing Chips

Use compact status chips.

Values:

-   `H` = High
-   `M` = Medium
-   `L` = Low

Example:

``` html
<span class="rating-chip rating-chip--high">H</span>
<span class="rating-chip rating-chip--medium">M</span>
<span class="rating-chip rating-chip--low">L</span>
```

Semantic colors:

### Impact

-   High → stronger attention color
-   Medium → neutral blue
-   Low → muted green

### Effort

-   Low → positive
-   Medium → neutral
-   High → warning

### Testing

-   Low → positive
-   Medium → neutral
-   High → risk/warning

Do not depend solely on color; the H/M/L label must remain visible.

------------------------------------------------------------------------

# 13. Dependency

Dependency values may be:

-   `—`
-   Task number, e.g. `7`
-   Multiple task IDs, e.g. `11,15`

Example:

``` html
<div class="dependency-cell">
  <span class="dependency-id">11</span>
</div>
```

Dependencies should be visually distinguishable from ordinary text but
remain compact.

------------------------------------------------------------------------

# 14. Priority Badge

Use strong filled badges.

``` html
<span class="priority-badge priority-badge--p1">P1</span>
<span class="priority-badge priority-badge--p2">P2</span>
<span class="priority-badge priority-badge--p3">P3</span>
```

Semantic palette:

``` css
.priority-badge--p1 {
  /* emerald / success-oriented */
}

.priority-badge--p2 {
  /* blue */
}

.priority-badge--p3 {
  /* purple */
}
```

P1 must have the strongest visual prominence.

------------------------------------------------------------------------

# 15. Timeline

Timeline starts at:

**September 2026**

and continues through:

**October 2026 → November 2026 → December 2026 → Backlog**

Each month is a separate grid column.

``` html
<div class="timeline">
  <div class="timeline-month timeline-month--sep">Sep (S)</div>
  <div class="timeline-month timeline-month--oct">Oct (O)</div>
  <div class="timeline-month timeline-month--nov">Nov (N)</div>
  <div class="timeline-month timeline-month--dec">Dec (D)</div>
  <div class="timeline-month timeline-month--backlog">Backlog (B)</div>
</div>
```

------------------------------------------------------------------------

# 16. Timeline Bars

Task scheduling is represented by horizontal bars.

Example:

``` html
<div class="timeline-track">
  <div
    class="timeline-bar"
    style="grid-column: 1 / span 1;"
    aria-label="Scheduled September 2026"
  ></div>
</div>
```

For multi-month tasks:

``` html
<div
  class="timeline-bar"
  style="grid-column: 2 / span 2;"
></div>
```

## Bar rules

-   Bars must align exactly with month columns.
-   Bars use the priority color family:
    -   P1 → emerald
    -   P2 → blue
    -   P3 → purple
    -   Backlog → orange/amber
-   Rounded corners: approximately `6px`.
-   Height: approximately `18–22px`.
-   Do not use excessive gradients.
-   Maintain enough contrast against dark surfaces.

------------------------------------------------------------------------

# 17. Dynamic Timeline Requirement

The roadmap must not be hard-coded to December forever.

The architecture should support adding timeline periods dynamically.

Example:

``` text
Sep → Oct → Nov → Dec → Backlog
```

can become:

``` text
Sep → Oct → Nov → Dec → Jan → Feb → Backlog
```

When a new month is added:

1.  Create a new timeline column.
2.  Place it before Backlog.
3.  Preserve Backlog as the final column.
4.  Recalculate task bar positioning.
5.  Preserve existing task schedules.
6.  Do not move Backlog into the middle.
7.  Update the timeline-code legend.

Recommended data model:

``` js
const timelinePeriods = [
  { id: '2026-09', label: 'Sep', code: 'S' },
  { id: '2026-10', label: 'Oct', code: 'O' },
  { id: '2026-11', label: 'Nov', code: 'N' },
  { id: '2026-12', label: 'Dec', code: 'D' },
  { id: 'backlog', label: 'Backlog', code: 'B' }
];
```

------------------------------------------------------------------------

# 18. Future Timeline Interaction

The roadmap should be designed to support a future drag interaction.

Desired behavior:

-   User can drag from one week/month segment to another.
-   Start and end period are visually represented.
-   A task can span multiple periods.
-   Backlog is treated as a separate terminal state.
-   Dragging must not alter priority automatically.
-   Dependency relationships should remain intact.

For a more granular implementation, each month can be divided into four
sub-sections:

``` text
September
├── W1
├── W2
├── W3
└── W4
```

This allows schedules such as:

``` text
Sep W4 → Oct W2
```

without changing the high-level monthly header.

------------------------------------------------------------------------

# 19. Key Takeaways

Create four summary cards:

### 1 --- Execute Current Tasks

> 6 tasks to be started now (Sep -- Oct).

Icon:

-   `circle-play`

### 2 --- Focus on High Impact

> Follow Impact → Effort → Testing → Dependency.

Icon:

-   `target`

### 3 --- Build the Foundation

> DB Topology and Infra stability enable long-term growth.

Icon:

-   `layers`

### 4 --- Plan the Rest

> Sequence medium & low priority based on dependency.

Icon:

-   `route`

Structure:

``` html
<section class="key-takeaways">

  <article class="takeaway-card">
    <span class="takeaway-number">1</span>
    <i data-lucide="circle-play"></i>
    <div>
      <h3>Execute Current Tasks</h3>
      <p>6 tasks to be started now (Sep – Oct).</p>
    </div>
  </article>

</section>
```

------------------------------------------------------------------------

# 20. Closing Brand Card

Bottom-right CTA/brand panel:

> A Stronger SatuInbox

Supporting text:

> More conversations.`<br />`{=html} More opportunities.`<br />`{=html}
> A bigger tomorrow.

Use an analytics/growth icon:

-   `chart-no-axes-combined`

The card should feel like the conclusion of the roadmap rather than
another KPI.

------------------------------------------------------------------------

# 21. Dark Theme System

The entire application must use the existing **QA Browser four-theme
architecture**.

All themes are dark themes.

## Theme IDs

``` text
navy
slate
charcoal
zinc
```

Default:

``` text
navy
```

------------------------------------------------------------------------

# 22. Theme Tokens

Define these CSS variables globally:

``` css
:root {
  --app-bg: ...;
  --sidebar-bg: ...;
  --elevated-bg: ...;

  --text-1: ...;
  --text-2: ...;
  --text-3: ...;
  --text-4: ...;
  --text-5: ...;
  --text-6: ...;

  --border-1: ...;
  --border-2: ...;
  --border-3: ...;

  --sec-brd: ...;
  --sec-prd: ...;
  --sec-test: ...;
}
```

Do not hard-code page-specific background colors throughout components.

------------------------------------------------------------------------

# 23. Theme Definitions

## Navy --- Default

``` css
[data-theme="navy"] {
  --app-bg: #080c14;

  /* deep navy surfaces */
  --sidebar-bg: #0b1120;
  --elevated-bg: #111827;

  /* text hierarchy */
  --text-1: #f8fafc;
  --text-2: #dbe4f0;
  --text-3: #a8b5c7;
  --text-4: #7d8ca3;
  --text-5: #526176;
  --text-6: #344154;

  /* borders */
  --border-1: #263247;
  --border-2: #1b2638;
  --border-3: #111a29;

  /* section semantics */
  --sec-brd: #263a63;
  --sec-prd: #3b82f6;
  --sec-test: #10b981;
}
```

Accent families:

``` text
Purple
Blue
Emerald
```

------------------------------------------------------------------------

# 24. Slate Theme

``` css
[data-theme="slate"] {
  --app-bg: #111827;

  --sidebar-bg: #0f172a;
  --elevated-bg: #1e293b;

  --text-1: #f8fafc;
  --text-2: #e2e8f0;
  --text-3: #a8b4c5;
  --text-4: #7b8aa0;
  --text-5: #56657a;
  --text-6: #3b4657;

  --border-1: #334155;
  --border-2: #263449;
  --border-3: #1e293b;

  --sec-brd: #344a67;
  --sec-prd: #6366f1;
  --sec-test: #14b8a6;
}
```

Accent families:

``` text
Violet
Blue
Teal
```

------------------------------------------------------------------------

# 25. Charcoal Theme

``` css
[data-theme="charcoal"] {
  --app-bg: #1c1917;

  --sidebar-bg: #171412;
  --elevated-bg: #292524;

  --text-1: #fafaf9;
  --text-2: #e7e5e4;
  --text-3: #c4bfba;
  --text-4: #918b85;
  --text-5: #655f59;
  --text-6: #48433e;

  --border-1: #44403c;
  --border-2: #37322e;
  --border-3: #292524;

  --sec-brd: #4a423a;
  --sec-prd: #8b5cf6;
  --sec-test: #22c55e;
}
```

Accent families:

``` text
Purple
Cyan
Green
```

------------------------------------------------------------------------

# 26. Zinc Theme

``` css
[data-theme="zinc"] {
  --app-bg: #18181b;

  --sidebar-bg: #111113;
  --elevated-bg: #27272a;

  --text-1: #fafafa;
  --text-2: #e4e4e7;
  --text-3: #b8b8c0;
  --text-4: #8b8b95;
  --text-5: #62626b;
  --text-6: #45454d;

  --border-1: #3f3f46;
  --border-2: #303036;
  --border-3: #27272a;

  --sec-brd: #41414a;
  --sec-prd: #4f46e5;
  --sec-test: #38bdf8;
}
```

Accent families:

``` text
Indigo
Sky
Green
```

------------------------------------------------------------------------

# 27. Component Color Rules

Do not assign colors based directly on theme IDs inside components.

Bad:

``` css
[data-theme="navy"] .priority-p1 {
  color: #10b981;
}
```

Preferred:

``` css
.priority-p1 {
  color: var(--priority-p1);
  background: var(--priority-p1-bg);
  border-color: var(--priority-p1-border);
}
```

Then define semantic tokens per theme.

Example:

``` css
:root,
[data-theme="navy"] {
  --priority-p1: #34d399;
  --priority-p1-bg: rgba(16, 185, 129, .16);
  --priority-p1-border: rgba(16, 185, 129, .30);

  --priority-p2: #60a5fa;
  --priority-p2-bg: rgba(59, 130, 246, .16);
  --priority-p2-border: rgba(59, 130, 246, .30);

  --priority-p3: #a78bfa;
  --priority-p3-bg: rgba(139, 92, 246, .16);
  --priority-p3-border: rgba(139, 92, 246, .30);

  --backlog: #fb923c;
}
```

------------------------------------------------------------------------

# 28. Typography

Recommended font stack:

``` css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Hierarchy:

``` css
.page-title {
  font-size: 28–32px;
  font-weight: 700;
}

.title-subtitle {
  font-size: 15–17px;
}

.body {
  font-size: 13–14px;
}

.table-text {
  font-size: 12–13px;
}

.metric-value {
  font-size: 26–30px;
  font-weight: 700;
}
```

Use `text-1` only for primary information. Avoid making every label
bright white.

------------------------------------------------------------------------

# 29. Spacing

Use a consistent spacing scale:

``` css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-5: 20px;
--space-6: 24px;
--space-8: 32px;
```

Recommended:

-   Page padding: `24px`
-   Card gap: `8–12px`
-   Section gap: `14–20px`
-   Table row height: `32–36px`
-   Card radius: `8–12px`

------------------------------------------------------------------------

# 30. Borders & Elevation

Use subtle borders rather than heavy shadows.

``` css
.card {
  background: var(--elevated-bg);
  border: 1px solid var(--border-2);
  border-radius: 10px;
}
```

Hover:

``` css
.card:hover {
  border-color: var(--border-1);
}
```

Avoid bright white borders.

------------------------------------------------------------------------

# 31. Responsive Behavior

## 1280×720

This is a key target viewport.

Requirements:

-   Keep the roadmap usable without excessive vertical scrolling.
-   Reduce padding before reducing information.
-   Timeline columns must remain readable.
-   Header may compress horizontally.
-   Strategic-area descriptions may become smaller.
-   Table can use horizontal scrolling if necessary.

## Large desktop

At `>= 1440px`:

-   Show the complete roadmap comfortably.
-   Increase timeline width.
-   Preserve whitespace.
-   Avoid stretching text excessively.

## Smaller desktop/tablet

At `< 1100px`:

-   Allow horizontal scrolling for the roadmap.
-   Keep Task and Strategic Area columns sticky where practical.
-   Do not collapse critical task metadata into inaccessible tooltips.

------------------------------------------------------------------------

# 32. Sticky Behavior

Recommended:

``` css
.roadmap-table {
  overflow: auto;
}

.task-number,
.task-name {
  position: sticky;
  left: 0;
  z-index: 3;
}
```

If both columns are sticky, use separate offsets.

The timeline should scroll horizontally while the identity of the task
remains visible.

------------------------------------------------------------------------

# 33. Accessibility

Requirements:

-   All icons that convey meaning need accessible labels.
-   Decorative icons use `aria-hidden="true"`.
-   Current task star has an accessible label.
-   Priority must not rely solely on color.
-   H/M/L labels must remain visible.
-   Timeline bars need accessible descriptions.
-   Focus states must be visible.
-   Minimum interactive target: `32px`, preferably `36–40px`.
-   Keyboard navigation must be possible for interactive timeline
    controls.
-   Contrast should meet WCAG AA for normal text where practical.

Example:

``` html
<button
  class="current-indicator"
  aria-label="Current task"
  type="button"
>
  <i data-lucide="star" aria-hidden="true"></i>
</button>
```

------------------------------------------------------------------------

# 34. Icon System

Use **Lucide**.

Recommended icon mapping:

  UI                   Icon
  -------------------- --------------------------
  Brand / roadmap      `route`
  Total tasks          `users`
  Current              `star`
  Priority rule        `target`
  Timeline             `calendar-days`
  Internal Tools       `settings`
  Core Platform        `layers-3`
  Omnichannel          `messages-square`
  Sales                `chart-column`
  Analytics            `pie-chart`
  Integrations         `plug`
  Product Experience   `sparkles`
  Dependency           `git-branch`
  Current task         `star`
  Takeaway 1           `circle-play`
  Takeaway 2           `target`
  Takeaway 3           `layers`
  Takeaway 4           `route`
  Closing card         `chart-no-axes-combined`

Icon rules:

``` css
.icon {
  width: 16px;
  height: 16px;
  stroke-width: 2;
}
```

Do not mix multiple icon libraries.

------------------------------------------------------------------------

# 35. Data Model

Recommended task schema:

``` ts
interface RoadmapTask {
  id: number;
  name: string;
  current: boolean;

  strategicArea: {
    id: string;
    label: string;
    description: string;
    icon: string;
  };

  description: string;

  impact: 'H' | 'M' | 'L';
  effort: 'H' | 'M' | 'L';
  testing: 'H' | 'M' | 'L';

  dependency: number[];

  priority: 'P1' | 'P2' | 'P3';

  schedule: {
    start: string;
    end: string;
  };
}
```

------------------------------------------------------------------------

# 36. Initial Task Dataset

Use the supplied roadmap as the initial dataset.

  -------------------------------------------------------------------------------------------------------
       \# Task            Current  Strategic Area    Impact    Effort    Testing  Dependency    Priority
  ------- -------------- --------- ---------------- --------- --------- --------- ------------ ----------
        1 Super admin       Yes    Internal             H         M         M     ---              P1
          internal                                                                             

        2 GTM               Yes    Internal             H         M         M     ---              P1

        3 Demo database     Yes    Internal             H         M         M     ---              P1
          and dashboard                                                                        

        4 Notification      Yes    Notification         H         M         M     ---              P1
          service                                                                              
          improvement                                                                          

        5 Advance           Yes    Analytics            H         M         M     ---              P1
          exporting                                                                            

        6 Fraud             Yes    Broadcast            H         M         H     ---              P1
          dashboard                                                                            

        7 DB topology       No     Infrastructure       H         H         H     ---              P2

        8 Infra redesign    No     Infrastructure       H         H         H     7                P2
          and stability                                                                        

        9 WA official       No     Omnichannel Chat     M         M         M     ---              P2
          adjustment                                                                           
          research                                                                             

       10 Cost              No     Omnichannel Chat     M         M         M     ---              P2
          simulation WA                                                                        
          official &                                                                           
          guarding                                                                             

       11 UI                No     Omnichannel Chat     H         M         M     ---              P2
          conversation                                                                         
          redesign                                                                             

       12 Informative       No     Tools / Add-ons      M         L         L     ---              P2
          utilities                                                                            

       13 Chat bot auto     No     AI                   H         M         H     11               P2
          response                                                                             

       14 Conversation      No     AI                   M         M         M     11               P2
          AI summary                                                                           

       15 Sales module      No     Sales                H         H         H     ---              P2
          improvement                                                                          

       16 Create            No     Sales                H         M         M     11,15            P2
          prospect from                                                                        
          conversation                                                                         

       17 Grouping          No     Omnichannel Chat     H         M         M     ---              P2
          contact                                                                              

       18 Email summary     No     Notification         M         M         M     ---              P3

       19 Chat tools API    No     Open API             H         M         H     ---              P3

       20 Widget module     No     Tools / Add-ons      M         M         M     ---              P3

       21 Widget app        No     Mobile App           M         H         H     ---              P3
          (web & mobile)                                                                       

       22 Telegram          No     Omnichannel Chat     L         M         M     ---              P3

       23 Shopee chat       No     Omnichannel Chat     L         M         M     ---              P3

       24 TikTok chat       No     Omnichannel Chat     L         M         M     ---              P3
  -------------------------------------------------------------------------------------------------------

> Note: The visual reference shows a duplicate `23` near the final rows.
> The implementation should use stable unique task IDs and should
> correct the numbering to `24` for TikTok chat.

------------------------------------------------------------------------

# 37. Interaction Requirements

## Task selection

Clicking a task should be able to open a detail drawer/modal in a future
iteration.

Minimum interaction now:

-   Hover row → subtle highlight.
-   Hover timeline bar → show schedule tooltip.
-   Hover dependency → show dependency task name.
-   Hover priority → show priority rationale if available.

## Timeline

Future-ready interactions:

-   Drag task bar.
-   Resize start/end.
-   Move schedule.
-   Add period.
-   Remove period.
-   Keep Backlog locked to the rightmost position.

------------------------------------------------------------------------

# 38. Visual Direction

The supplied reference has a **light, executive roadmap/dashboard
aesthetic**. Translate its hierarchy into the dark QA Browser system
rather than simply inverting colors.

Preserve:

-   Strong title hierarchy.
-   Compact KPI cards.
-   Colored strategic-area grouping.
-   Dense but readable table.
-   Distinct priority badges.
-   Horizontal roadmap bars.
-   Bottom takeaway cards.
-   Clean executive-dashboard composition.

Avoid:

-   Pure black backgrounds.
-   Excessive neon.
-   Excessive glassmorphism.
-   Huge cards.
-   Overly saturated backgrounds.
-   Decorative gradients that reduce readability.
-   Excessive rounded corners.
-   Excessive animation.

------------------------------------------------------------------------

# 39. Animation

Use restrained motion.

Allowed:

``` css
transition:
  background-color 160ms ease,
  border-color 160ms ease,
  transform 160ms ease,
  opacity 160ms ease;
```

Timeline drag:

-   `cursor: grab`
-   active: `cursor: grabbing`

Avoid:

-   Continuous pulsing.
-   Auto-moving timeline bars.
-   Large entrance animations.
-   Flashing priority indicators.

------------------------------------------------------------------------

# 40. Loading / Empty / Error States

## Loading

Use skeleton rows matching:

-   Task name
-   Metadata chips
-   Priority badge
-   Timeline

## Empty

Message:

> No roadmap tasks available.

Provide:

> Add task

## Error

Message:

> Unable to load roadmap data.

Provide:

> Retry

------------------------------------------------------------------------

# 41. Component Architecture

Suggested component hierarchy:

``` text
RoadmapPage
├── PageHeader
│   ├── BrandBlock
│   ├── TitleBlock
│   ├── QuoteBlock
│   └── RoadmapPeriod
│
├── SummaryGrid
│   └── MetricCard[]
│
├── RulesGrid
│   ├── PriorityRuleCard
│   └── TimelineCodeCard
│
├── RoadmapBoard
│   ├── RoadmapHeader
│   ├── StrategicAreaGroup[]
│   │   ├── StrategicAreaCard
│   │   └── TaskRow[]
│   └── Timeline
│
├── KeyTakeaways
│   └── TakeawayCard[]
│
└── ClosingBrandCard
```

------------------------------------------------------------------------

# 42. CSS Architecture

Recommended organization:

``` text
styles/
├── tokens.css
├── themes.css
├── base.css
├── layout.css
├── header.css
├── metrics.css
├── rules.css
├── roadmap.css
├── timeline.css
├── takeaways.css
└── responsive.css
```

Theme tokens must live separately from component styles.

------------------------------------------------------------------------

# 43. Acceptance Criteria

## Functional

-   [ ] All 23/24 unique tasks can be rendered from data.
-   [ ] Current tasks are visually identified.
-   [ ] P1/P2/P3 are rendered correctly.
-   [ ] H/M/L values are visible.
-   [ ] Dependencies are visible.
-   [ ] Timeline bars align with their periods.
-   [ ] Backlog is always the last period.
-   [ ] Timeline can be extended without rewriting the roadmap layout.
-   [ ] Task schedule can support multi-period spans.
-   [ ] Strategic-area grouping is preserved.

## UI/UX

-   [ ] Layout follows the supplied reference hierarchy.
-   [ ] Dark theme is native to QA Browser rather than a simple color
    inversion.
-   [ ] Navy is the default theme.
-   [ ] Slate, Charcoal and Zinc are supported.
-   [ ] No hard-coded global background colors inside components.
-   [ ] Typography has clear hierarchy.
-   [ ] Table density remains readable.
-   [ ] Timeline remains understandable at 1280×720.
-   [ ] Horizontal overflow is handled intentionally.
-   [ ] Sticky task identity works when horizontally scrolling.

## Accessibility

-   [ ] Semantic headings are used.
-   [ ] Icon-only controls have accessible labels.
-   [ ] H/M/L and P1/P2/P3 are not color-only.
-   [ ] Keyboard focus is visible.
-   [ ] Timeline interactions are keyboard accessible when enabled.
-   [ ] Tooltips do not contain the only copy of critical information.

## Code quality

-   [ ] Task data is separated from presentation.
-   [ ] Timeline periods are data-driven.
-   [ ] Theme values use CSS variables.
-   [ ] Components do not contain duplicated theme-specific CSS.
-   [ ] Icons come from one icon system.
-   [ ] Stable IDs are used for tasks and timeline periods.

------------------------------------------------------------------------

# 44. Definition of Done

The feature is complete when:

1.  The roadmap matches the supplied visual hierarchy.
2.  The UI works with all four QA Browser themes.
3.  Navy is the default.
4.  The complete task matrix is readable.
5.  Timeline bars accurately represent task scheduling.
6.  Backlog remains the final timeline column.
7.  New timeline periods can be added dynamically.
8.  The implementation is responsive at 1280×720 and larger.
9.  Accessibility requirements are met.
10. No component depends on hard-coded theme colors.
11. The architecture is ready for future drag/resize timeline
    interactions.
12. The roadmap can evolve from a static visualization into an
    interactive planning tool without a major rewrite.
