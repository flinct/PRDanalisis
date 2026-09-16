# Modern Seamless UI Design Patterns 2024–2026
## Referensi untuk SatuInbox (Next.js + React 19 + Tailwind CSS 4 + Zustand 5 + TanStack Query 5)

> Dikompilasi dari design system Linear, Vercel (Geist), Raycast, Arc, Notion, shadcn/ui, dan tren industri SaaS 2024–2026. Ditulis dalam Bahasa Indonesia dengan istilah teknis dalam bahasa Inggris.

---

## Daftar Isi

1. [Subtle Depth: Alternatif Glassmorphism](#1-subtle-depth-alternatif-glassmorphism)
2. [Design Token System](#2-design-token-system)
3. [Typography Scale](#3-typography-scale)
4. [Spacing Scale](#4-spacing-scale)
5. [Shadow & Elevation System](#5-shadow--elevation-system)
6. [Border Radius Scale](#6-border-radius-scale)
7. [Dark Mode Patterns](#7-dark-mode-patterns)
8. [Micro-Interactions & Fluid Animations](#8-micro-interactions--fluid-animations)
9. [Skeleton Loading](#9-skeleton-loading)
10. [Optimistic UI](#10-optimistic-ui)
11. [Infinite Scroll vs Pagination](#11-infinite-scroll-vs-pagination)
12. [Responsive Design System](#12-responsive-design-system)
13. [Tren 2025–2026: Bento Grids & Dimensional Layering](#13-tren-2025-2026-bento-grids--dimensional-layering)
14. [Tailwind CSS 4 + shadcn/ui Implementation Notes](#14-tailwind-css-4--shadcnui-implementation-notes)
15. [Rekomendasi Stack SatuInbox](#15-rekomendasi-stack-satuinbox)

---

## 1. Subtle Depth: Alternatif Glassmorphism

### Tren 2024–2026

Glassmorphism penuh (`backdrop-filter: blur(40px)`) sudah mulai ditinggalkan untuk SaaS. Tren bergeser ke **subtle depth** — surface hierarchy yang mengandalkan:

- **Transparent overlays tipis** — `rgba(255,255,255,0.03)` hingga `rgba(255,255,255,0.06)` untuk surface cards
- **Inset borders** — `1px solid rgba(255,255,255,0.08)` bukan solid borders
- **Layered surfaces** — background → elevated surface → modal, masing-masing beda 1 level kecerahan
- **Micro-blur** — `backdrop-filter: blur(8px)` hingga `blur(16px)`, bukan `blur(40px)+`

### Contoh dari Linear

```css
/* Linear's surface hierarchy — dark mode canonical */
--surface-0: #08090a;   /* page background */
--surface-1: #0f1011;   /* cards, panels */
--surface-2: #161718;   /* elevated cards */
--surface-3: #1c1d1e;   /* modals, dropdowns */

/* Inset border pattern (Linear-style) */
.surface-card {
  background: var(--surface-1);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 8px;
}

/* Subtle glow on hover (Linear's button secondary) */
.button-secondary {
  background: transparent;
  box-shadow:
    rgba(255,255,255,0.03) 0px 0px 0px 1px inset,
    rgba(255,255,255,0.04) 0px 1px 0px 0px inset,
    rgba(0,0,0,0.6) 0px 0px 0px 1px,
    rgba(0,0,0,0.1) 0px 4px 4px 0px;
  border-radius: 9999px; /* pill shape */
}
```

### Frost UI (Glassmorphism Ringan)

```css
/* Subtle frosted panel — untuk sidebar/toolbar */
.frost-panel {
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(8px) saturate(1.2);
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 12px;
}
```

### Key Insight dari Linear & Vercel

> "Borders are always semi-transparent white, never solid dark colors on dark backgrounds." — Linear design system

---

## 2. Design Token System

### Filosofi: 41 Tokens di Hari Pertama

Dari studi Blake Crosley (yang membangun sistem yang terinspirasi Linear/Vercel/Raycast):

| Kategori | Jumlah | Purpose |
|---|---|---|
| Colors | 10 | Background, text, border, accent |
| Typography | 13 | Font sizes dari xs ke display |
| Spacing | 8 | 8px base unit scale |
| Border radius | 4 | sm, md, lg, xl |
| Transitions | 3 | fast, base, slow |
| Layout | 3 | max-width narrow, default, wide |

**Total: 41 tokens. Zero components. Zero documentation site.**

### CSS Custom Properties (Recommended Pattern)

```css
:root {
  /* Color tokens — 10 total */
  --color-bg-dark:        #08090a;
  --color-bg-elevated:    #111111;
  --color-bg-surface:     #1a1a1a;
  --color-text-primary:   #f7f8f8;
  --color-text-secondary: rgba(255,255,255,0.65);
  --color-text-tertiary:  rgba(255,255,255,0.4);
  --color-border:         rgba(255,255,255,0.1);
  --color-border-subtle:  rgba(255,255,255,0.05);
  --color-accent:         #5e6ad2;  /* Linear lavender-blue */
  --color-accent-hover:   #828fff;

  /* Transition tokens — 3 total */
  --transition-fast: 150ms ease;
  --transition-base: 300ms ease;
  --transition-slow: 600ms ease;

  /* Layout tokens — 3 total */
  --max-width-narrow:  800px;
  --max-width-default: 1400px;
  --max-width-wide:    1600px;
}
```

### Tailwind CSS 4 Implementation

Di Tailwind v4, tokens langsung didefinisikan di CSS (bukan `tailwind.config.js`):

```css
@import "tailwindcss";

@theme {
  --color-bg-dark: #08090a;
  --color-bg-elevated: #111111;
  --color-text-primary: #f7f8f8;
  --color-text-secondary: oklch(85% 0 0);
  --color-accent: #5e6ad2;

  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */
  --spacing-12: 3rem;    /* 48px */
  --spacing-16: 4rem;    /* 64px */

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;
}
```

---

## 3. Typography Scale

### Perbandingan Font Family Top SaaS

| App | Font | Fallback | Mono |
|---|---|---|---|
| **Linear** | Inter Variable (`cv01`, `ss03`) | SF Pro Display, -apple-system, system-ui | Berkeley Mono |
| **Vercel** | Geist Sans | -apple-system, Segoe UI | Geist Mono |
| **Raycast** | Inter Variable | system-ui | SF Mono, JetBrains Mono |
| **Notion** | Inter Variable | system-ui | SF Mono |

**Rekomendasi SatuInbox: Inter Variable** — free, universal, great at all sizes.

### Type Scale: Linear (Reference Terbaik untuk SaaS)

```css
:root {
  /* Display (hero, marketing) */
  --text-display-xl: 72px;    /* weight 510, lh 1.0, ls -1.584px */
  --text-display-lg: 64px;    /* weight 510, lh 1.0, ls -1.408px */
  --text-display:    48px;    /* weight 510, lh 1.0, ls -1.056px */

  /* Headings (app UI) */
  --text-h1: 32px;            /* weight 510, lh 1.13, ls -0.704px */
  --text-h2: 24px;            /* weight 500, lh 1.33, ls -0.288px */
  --text-h3: 20px;            /* weight 590, lh 1.33, ls -0.24px */

  /* Body */
  --text-body-lg:  18px;      /* weight 400, lh 1.60, ls -0.165px */
  --text-body:     16px;      /* weight 400, lh 1.50, ls normal */
  --text-body-sm:  15px;      /* weight 400, lh 1.60, ls -0.165px */
  --text-body-xs:  14px;      /* weight 400, lh 1.50, ls normal */

  /* Labels & Metadata */
  --text-label:    13px;      /* weight 510, lh 1.50, ls -0.13px */
  --text-caption:  12px;      /* weight 400, lh 1.40, ls normal */
  --text-micro:    11px;      /* weight 510, lh 1.40, ls normal */
}
```

### Negative Letter-Spacing Pattern (Linear & Vercel Signature)

Kedua sistem menggunakan aggressive negative letter-spacing pada display sizes:

```
72px → -1.584px
48px → -1.056px
32px → -0.704px
24px → -0.288px
20px → -0.24px
16px → normal
```

**Vercel lebih agresif:** -2.4px hingga -2.88px di display hero (48px).

```css
/* Tailwind custom utility */
@utility tracking-display {
  letter-spacing: -0.022em;  /* ~-1.584px at 72px */
}
@utility tracking-heading {
  letter-spacing: -0.022em;
}
@utility tracking-body {
  letter-spacing: -0.01em;
}
```

### Font Feature Settings (Linear's Signature)

```css
body {
  font-feature-settings: "cv01", "ss03";
  /* cv01 = alternative a, ss03 = open four — ini yang bikin Inter "Linear's Inter" */
}
```

---

## 4. Spacing Scale

### Sistem 8-Point Grid (Linear, Vercel, Raycast)

```css
:root {
  --space-xxs: 4px;    /* 0.25rem */
  --space-xs:  8px;    /* 0.5rem */
  --space-sm:  12px;   /* 0.75rem */
  --space-md:  16px;   /* 1rem */
  --space-lg:  24px;   /* 1.5rem */
  --space-xl:  32px;   /* 2rem */
  --space-2xl: 48px;   /* 3rem */
  --space-3xl: 64px;   /* 4rem */
  --space-4xl: 96px;   /* 6rem */
  --space-section: 128px; /* 8rem */
}
```

### Tailwind CSS 4 Mapping

```css
@theme {
  --spacing-1:  0.25rem;  /* 4px — icon gaps, tight padding */
  --spacing-2:  0.5rem;   /* 8px — compact list item padding */
  --spacing-3:  0.75rem;  /* 12px — form input padding */
  --spacing-4:  1rem;     /* 16px — standard component padding */
  --spacing-6:  1.5rem;   /* 24px — card padding, section gap */
  --spacing-8:  2rem;     /* 32px — section padding */
  --spacing-12: 3rem;     /* 48px — section divider */
  --spacing-16: 4rem;     /* 64px — major section gap */
  --spacing-24: 6rem;     /* 96px — page section */
  --spacing-32: 8rem;     /* 128px — hero/section spacing */
}
```

### Aturan Keras

> "Jika layout memerlukan spacing yang tidak ada di sistem, desainnya yang salah, bukan sistemnya." — Blake Crosley

**Jangan pernah pakai arbitrary values** seperti `mt-[37px]`. Gunakan scale di atas.

### Linear's Practical Spacing

| Context | Token | Value |
|---|---|---|
| Card interior padding | `--space-lg` | 24px |
| Pill button padding | 8px 14px | vertical / horizontal |
| Form input padding | 8px 12px | vertical / horizontal |
| Section separation | `--space-section` | 96px–128px |
| Nav link spacing | `--space-sm` | 12px |

---

## 5. Shadow & Elevation System

### Linear's Shadow System (Dark Mode Optimized)

```css
:root {
  /* Inset border — pengganti solid border di dark mode */
  --shadow-inset-border: inset rgb(35, 37, 42) 0px 0px 0px 1px;

  /* Subtle card lift */
  --shadow-sm: rgba(0, 0, 0, 0.1) 0px 0px 0px 2px;

  /* Button (secondary) — complex layered shadow */
  --shadow-button-secondary:
    inset rgba(255,255,255,0.03) 0px 0px 0px 1px,
    inset rgba(255,255,255,0.04) 0px 1px 0px 0px,
    rgba(0,0,0,0.6) 0px 0px 0px 1px,
    rgba(0,0,0,0.1) 0px 4px 4px 0px;

  /* Deep card — untuk modal/overlay */
  --shadow-lg:
    rgba(8,9,10,0.1) 0px 0px 0px 1px,
    rgba(8,9,10,0.4) 0px 0px 64px 0px;

  /* Focus ring */
  --shadow-focus: 0 0 0 2px var(--color-accent);
}
```

### Vercel (Geist) Shadow System (Light Mode Optimized)

```css
:root {
  --shadow-sm: 0 2px 4px rgba(0,0,0,0.1);
  --shadow-md: 0 8px 30px rgba(0,0,0,0.12);
}
```

### Prinsip

- **Dark mode:** Shadow yang kuat jarang terlihat. Gunakan **inset borders** dan **surface layering** untuk depth.
- **Light mode:** Drop shadows bekerja lebih baik. Gunakan `rgba(0,0,0,0.1)` hingga `rgba(0,0,0,0.12)`.
- **Hindari:** Neon glows, colored shadows, glassmorphism berat di SaaS.

---

## 6. Border Radius Scale

### Perbandingan Top SaaS

| System | xs | sm | md | lg | xl | full |
|---|---|---|---|---|---|---|
| **Linear** | 1px | 4px | 7px | 12px | 20px | 9999px |
| **Vercel** | — | 6px | 8px | 12px | — | 9999px |
| **shadcn/ui** | — | 0.25rem (4px) | 0.375rem (6px) | 0.5rem (8px) | 0.75rem (12px) | 9999px |

### Rekomendasi SatuInbox

```css
@theme {
  --radius-xs:   2px;     /* badge, chip kecil */
  --radius-sm:   4px;     /* input, button kecil */
  --radius-md:   8px;     /* card, panel */
  --radius-lg:   12px;    /* dialog, dropdown */
  --radius-xl:   16px;    /* large card */
  --radius-2xl:  20px;    /* feature card */
  --radius-full: 9999px;  /* pill button, avatar */
}
```

### Pattern Usage

- **Buttons:** `radius-full` (pill shape) — signature Linear & Vercel
- **Cards:** `radius-md` (8px)
- **Inputs:** `radius-sm` (4px)
- **Dialogs:** `radius-lg` (12px)
- **Badges/Chips:** `radius-xs` atau `radius-full`

---

## 7. Dark Mode Patterns

### Pattern A: CSS Custom Properties + Media Query (Recommended)

```css
/* Light mode tokens */
:root {
  --color-bg-primary: #ffffff;
  --color-bg-secondary: #f8fafc;
  --color-text-primary: #0f172a;
  --color-text-secondary: #475569;
  --color-border: #e2e8f0;
  --color-accent: #5e6ad2;
  --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
}

/* Dark mode overrides */
@media (prefers-color-scheme: dark) {
  :root:not(.theme-light) {
    --color-bg-primary: #0c1222;
    --color-bg-secondary: #151b2e;
    --color-text-primary: #f1f5f9;
    --color-text-secondary: #94a3b8;
    --color-border: rgba(255,255,255,0.1);
    --color-accent: #828fff;
    --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
  }
}

/* Manual override classes */
:root.theme-dark { /* same as dark media query values */ }
:root.theme-light { /* same as default :root values */ }
```

### Pattern B: CSS `light-dark()` Function (2024+ — Modern)

```css
:root { color-scheme: light dark; }

.card {
  background: light-dark(#ffffff, #1e1e1e);
  color: light-dark(#1f2937, #f3f4f6);
  border: 1px solid light-dark(#e5e7eb, rgba(255,255,255,0.1));
}
```

**Browser support:** Chrome 123+, Firefox 120+, Safari 17.5+ — sudah cukup untuk 2025+.

### Preventing Flash of Wrong Theme (FOWT)

```html
<head>
  <!-- BLOCKING script — runs before any CSS renders -->
  <script>
    (function() {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') {
        document.documentElement.classList.add('theme-dark');
      } else if (saved === 'light') {
        document.documentElement.classList.add('theme-light');
      }
    })();
  </script>
  <!-- CSS loads AFTER theme class is set -->
  <link rel="stylesheet" href="styles.css">
</head>
```

### React 19 + Zustand 5 Theme Hook

```typescript
// hooks/useTheme.ts
import { create } from 'zustand';

type Theme = 'light' | 'dark' | 'system';

interface ThemeStore {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeStore>((set) => {
  // Initialize from localStorage or system
  const saved = localStorage.getItem('theme') as Theme | null;
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  return {
    theme: saved || 'system',
    resolvedTheme:
      saved === 'dark' ? 'dark'
      : saved === 'light' ? 'light'
      : systemDark ? 'dark' : 'light',
    setTheme: (theme) => {
      const root = document.documentElement;
      root.classList.remove('theme-light', 'theme-dark');

      if (theme === 'system') {
        localStorage.removeItem('theme');
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (isDark) root.classList.add('theme-dark');
        set({ theme, resolvedTheme: isDark ? 'dark' : 'light' });
      } else {
        localStorage.setItem('theme', theme);
        root.classList.add(`theme-${theme}`);
        set({ theme, resolvedTheme: theme });
      }
    },
  };
});
```

### Image Handling in Dark Mode

```css
/* Dim images slightly */
:root.theme-dark img:not([data-no-dim]) {
  filter: brightness(0.9);
}

/* Invert black-on-white diagrams */
:root.theme-dark img[data-invert] {
  filter: invert(1) hue-rotate(180deg);
}
```

---

## 8. Micro-Interactions & Fluid Animations

### Tren 2025: Functional Motion > Fancy Motion

> "By 2025, functional motion-interfaces that put clarity above spectacle will be the trend in SaaS design. This approach has already been adopted by companies like Linear, Notion, and Arc Browser." — Industry analysis

### Transition Durations

```css
:root {
  --duration-instant: 100ms;  /* toggle, switch, checkbox */
  --duration-fast:    150ms;  /* button hover, focus ring */
  --duration-base:    200ms;  /* dropdown open, panel slide */
  --duration-medium:  300ms;  /* modal enter, page transition */
  --duration-slow:    500ms;  /* skeleton → content, major layout */
  --duration-glacial: 600ms;  /* decorative animations only */

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-out-quart: cubic-bezier(0.25, 1, 0.5, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### Essential Micro-Interactions untuk SaaS

#### 1. Button Hover/Focus

```css
.btn-primary {
  transition: all var(--duration-fast) var(--ease-out-expo);
}
.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}
.btn-primary:active {
  transform: translateY(0);
  box-shadow: none;
}
/* Tailwind: transition-all duration-150 hover:-translate-y-0.5 active:translate-y-0 */
```

#### 2. Navigation Underline (Linear-style)

```css
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  width: 100%;
  height: 2px;
  background: var(--color-accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--duration-base) var(--ease-out-expo);
}
.nav-link:hover::after,
.nav-link.active::after {
  transform: scaleX(1);
}
/* Tailwind: after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-accent after:scale-x-0 after:origin-left after:transition-transform after:duration-200 hover:after:scale-x-100 */
```

#### 3. Card Hover Lift

```css
.card-interactive {
  transition: transform var(--duration-fast) var(--ease-out-expo),
              box-shadow var(--duration-fast) var(--ease-out-expo);
}
.card-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
}
```

#### 4. List Item Enter Animation (Staggered)

```css
@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.list-item {
  animation: slide-up var(--duration-medium) var(--ease-out-expo) both;
}
/* Stagger via inline style or JS */
.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 30ms; }
.list-item:nth-child(3) { animation-delay: 60ms; }
/* ...or use CSS custom property: animation-delay: calc(var(--index) * 30ms); */
```

#### 5. Page/Route Transition (Next.js)

```css
@keyframes fade-in {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

.page-enter {
  animation: fade-in var(--duration-medium) var(--ease-out-expo);
}
```

#### 6. Tooltip/Popover Enter

```css
[data-state="open"] {
  animation: scale-in var(--duration-fast) var(--ease-out-expo);
}

@keyframes scale-in {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}
```

### Prinsip Motion

1. **Functional first** — setiap animasi harus memberi feedback atau konteks
2. **< 300ms** untuk UI feedback (hover, click, toggle)
3. **< 500ms** untuk layout transitions (page change, panel open)
4. **Hindari** animasi > 600ms kecuali dekoratif
5. **Respect `prefers-reduced-motion`**:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 9. Skeleton Loading

### Best Practices

1. **Match real content dimensions** — skeleton harus persis ukuran konten asli untuk mencegah CLS
2. **Gunakan hanya untuk primary structural components** — jangan skeleton untuk tombol kecil atau ikon
3. **Shimmer animation** — gradient yang bergerak dari kiri ke kanan

### CSS Implementation

```css
.skeleton {
  background: linear-gradient(
    90deg,
    var(--color-bg-secondary) 25%,
    var(--color-bg-elevated) 50%,
    var(--color-bg-secondary) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
  border-radius: var(--radius-sm);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### React Component Pattern

```tsx
// Skeleton primitive
function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

// Conversation list skeleton
function ConversationListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[160px]" />
          </div>
          <Skeleton className="h-3 w-[48px]" />
        </div>
      ))}
    </div>
  );
}
```

### TanStack Query Integration

```tsx
import { useQuery } from '@tanstack/react-query';

function ConversationList() {
  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });

  if (isLoading) return <ConversationListSkeleton />;

  return <ConversationListInner data={data} />;
}
```

### Advanced: Suspense + Skeleton (React 19)

```tsx
import { Suspense } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

function ConversationsPage() {
  return (
    <Suspense fallback={<ConversationListSkeleton />}>
      <ConversationListContent />
    </Suspense>
  );
}

function ConversationListContent() {
  const { data } = useSuspenseQuery({
    queryKey: ['conversations'],
    queryFn: fetchConversations,
  });
  return <ConversationListInner data={data} />;
}
```

---

## 10. Optimistic UI

### React 19 `useOptimistic` Hook

```tsx
import { useOptimistic } from 'react';

function MessageInput({ sendMessage }: { sendMessage: (text: string) => Promise<void> }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (state, newMessage: string) => [
      ...state,
      { id: crypto.randomUUID(), text: newMessage, sending: true },
    ]
  );

  async function handleSend(formData: FormData) {
    const text = formData.get('message') as string;
    addOptimisticMessage(text);
    await sendMessage(text); // actual API call
  }

  return (
    <form action={handleSend}>
      <input name="message" />
      <button type="submit">Send</button>
    </form>
  );
}
```

### TanStack Query 5 Optimistic Updates

```tsx
import { useMutation, useQueryClient } from '@tanstack/react-query';

function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onMutate: async (newMessage) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['messages'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['messages']);

      // Optimistically update
      queryClient.setQueryData(['messages'], (old: any[]) => [
        ...old,
        { ...newMessage, id: 'temp-' + Date.now(), status: 'sending' },
      ]);

      return { previous };
    },
    onError: (_err, _newMessage, context) => {
      // Rollback on error
      queryClient.setQueryData(['messages'], context?.previous);
    },
    onSettled: () => {
      // Refetch to sync with server
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
}
```

### Optimistic UI Patterns untuk SatuInbox

| Action | Optimistic Behavior | Rollback |
|---|---|---|
| Send message | Show message immediately with "sending" indicator | Show error toast, mark message as failed |
| Assign conversation | Update UI list immediately | Revert assignment on API error |
| Change status | Badge changes color instantly | Revert to previous status |
| Mark as read | Remove unread indicator | Re-add unread indicator |
| Add tag | Tag appears on conversation | Remove tag on error |

---

## 11. Infinite Scroll vs Pagination

### Decision Matrix

| Aspek | Infinite Scroll | Pagination |
|---|---|---|
| **Best for** | Feeds, conversation lists, activity logs | Search results, admin tables, data export |
| **UX** | Seamless, app-like, continuous | Predictable, page-aware, navigable |
| **Performance** | Memory grows with scroll depth | Fixed memory per page |
| **Accessibility** | Harder (keyboard, screen reader) | Easier (standard navigation) |
| **Deep linking** | Hard (need scroll restoration) | Easy (`?page=3`) |
| **SEO** | Not applicable for SaaS apps | Better for public pages |
| **User expectation** | Social media, chat apps | Data tables, reports |

### TanStack Query 5 Infinite Queries (Cursor-based)

```tsx
import { useInfiniteQuery } from '@tanstack/react-query';

function ConversationList() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['conversations'],
    queryFn: ({ pageParam }) =>
      fetchConversations({ cursor: pageParam }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
  });

  return (
    <>
      {data?.pages.map((page) =>
        page.data.map((conv) => <ConversationItem key={conv.id} data={conv} />)
      )}
      {hasNextPage && (
        <button
          onClick={() => fetchNextPage()}
          disabled={isFetchingNextPage}
        >
          {isFetchingNextPage ? 'Loading...' : 'Load more'}
        </button>
      )}
    </>
  );
}
```

### Infinite Scroll with Intersection Observer

```tsx
import { useEffect, useRef } from 'react';

function InfiniteScrollTrigger({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
}: {
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  fetchNextPage: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: '200px' } // prefetch before user reaches bottom
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return <div ref={ref} className="h-1" />;
}
```

### Rekomendasi SatuInbox

- **Conversation list:** Infinite scroll (cursor-based)
- **Search results:** Pagination (page-based)
- **Activity logs:** Infinite scroll
- **Reports/Analytics:** Pagination
- **Inbox kanban view:** Virtualized list (react-virtual / @tanstack/react-virtual)

---

## 12. Responsive Design System

### Breakpoint Scale (Tailwind CSS 4 Default)

```css
/* Tailwind v4 breakpoints */
@theme {
  --breakpoint-sm: 640px;   /* small tablet */
  --breakpoint-md: 768px;   /* tablet */
  --breakpoint-lg: 1024px;  /* small desktop */
  --breakpoint-xl: 1280px;  /* desktop */
  --breakpoint-2xl: 1536px; /* wide desktop */
}
```

### SatuInbox Responsive Strategy

| Breakpoint | Layout | Sidebar | Conversation Detail |
|---|---|---|---|
| `< 768px` (mobile) | Single column | Hidden (drawer) | Full screen |
| `768px–1023px` (tablet) | Two columns | Collapsed icon bar | Stacked |
| `1024px+` (desktop) | Three columns | Full sidebar | Full detail panel |

### CSS Container Queries (2024+ — Better than Media Queries for Components)

```css
/* Card yang responsif terhadap container, bukan viewport */
.card-container {
  container-type: inline-size;
  container-name: card;
}

@container card (min-width: 400px) {
  .card-content {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 16px;
  }
}

@container card (max-width: 399px) {
  .card-content {
    display: flex;
    flex-direction: column;
  }
}
```

---

## 13. Tren 2025–2026: Bento Grids & Dimensional Layering

### Bento Grid Layout (Apple-Inspired)

```css
.bento-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: auto;
  gap: 16px;
}

.bento-item-wide { grid-column: span 2; }
.bento-item-tall { grid-row: span 2; }
.bento-item-featured {
  grid-column: span 2;
  grid-row: span 2;
}
```

### Dimensional Layering

```css
/* Layer 0 — page background */
.page-bg { background: var(--color-bg-dark); }

/* Layer 1 — elevated surface */
.surface {
  background: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}

/* Layer 2 — floating panel */
.panel {
  background: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 8px 30px rgba(0,0,0,0.12);
  z-index: 10;
}

/* Layer 3 — modal/overlay */
.modal {
  background: var(--color-bg-surface);
  box-shadow: 0 24px 80px rgba(0,0,0,0.25);
  z-index: 50;
}
```

---

## 14. Tailwind CSS 4 + shadcn/ui Implementation Notes

### Tailwind v4 Changes yang Relevan

1. **CSS-first configuration** — tidak ada `tailwind.config.js`, semua di CSS
2. **OKLCH colors** — HSL otomatis dikonversi ke OKLCH untuk konsistensi perceptual
3. **`@theme` directive** — gantikan `extend` di config
4. **`color-mix()` support** — untuk dynamic color variants
5. **`@utility` directive** — untuk custom utilities

### shadcn/ui Theme Token Convention

```css
/* shadcn/ui uses semantic token names */
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --card: 0 0% 100%;
  --card-foreground: 222.2 84% 4.9%;
  --popover: 0 0% 100%;
  --popover-foreground: 222.2 84% 4.9%;
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;
  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;
  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 210 40% 98%;
  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;
  --ring: 222.2 84% 4.9%;
  --radius: 0.5rem;
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --card: 222.2 84% 4.9%;
  --card-foreground: 210 40% 98%;
  /* ... etc */
}
```

### Tailwind v4 + OKLCH Migration

```css
/* OLD (HSL-based) */
--primary: 222.2 47.4% 11.2%;

/* NEW (OKLCH — lebih perceptually uniform) */
--primary: oklch(0.205 0.037 265);
```

### Menggunakan @theme untuk Custom Tokens

```css
@import "tailwindcss";

@theme {
  /* Colors */
  --color-bg-primary: #08090a;
  --color-bg-surface: #0f1011;
  --color-text-primary: #f7f8f8;
  --color-text-muted: oklch(70% 0 0);
  --color-accent: #5e6ad2;
  --color-accent-hover: #828fff;

  /* Spacing */
  --spacing-1: 0.25rem;
  --spacing-2: 0.5rem;
  --spacing-3: 0.75rem;
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;
  --spacing-8: 2rem;
  --spacing-12: 3rem;

  /* Radius */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;

  /* Fonts */
  --font-sans: 'Inter Variable', 'Geist Sans', -apple-system, system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, 'Cascadia Code', monospace;

  /* Shadows (dark mode) */
  --shadow-card: 0 0 0 1px rgba(255,255,255,0.06);
  --shadow-elevated: 0 8px 30px rgba(0,0,0,0.12);
  --shadow-modal: 0 24px 80px rgba(0,0,0,0.25);
}
```

---

## 15. Rekomendasi Stack SatuInbox

### Design Token File Structure

```
styles/
├── tokens.css          # @theme block with all design tokens
├── base.css            # Reset + global styles
├── components.css      # Component-specific styles (if needed)
└── utilities.css       # Custom @utility definitions
```

### Foundation Decisions

| Aspek | Rekomendasi | Alasan |
|---|---|---|
| **Font** | Inter Variable | Universal, free, great at all sizes, Linear/Vercel standard |
| **Color system** | OKLCH + semantic tokens | Perceptually uniform, Tailwind v4 native |
| **Spacing** | 4px base unit | Industry standard (Linear, Vercel, shadcn) |
| **Radius** | sm:4 md:8 lg:12 xl:20 pill:9999 | Matches Linear/Vercel |
| **Dark mode** | CSS custom properties + class toggle | Most flexible, FOWT-proof |
| **Motion** | 150ms/200ms/300ms + ease-out-expo | Functional motion, Linear-style |
| **Shadow** | Inset borders (dark) / subtle drop (light) | Modern SaaS standard |
| **Loading** | Skeleton shimmer + Suspense | Best perceived performance |
| **Lists** | Infinite scroll (cursor) + TanStack Query | Chat/conversation app pattern |

### Minimal Token CSS untuk SatuInbox

```css
/* styles/tokens.css */
@import "tailwindcss";

@theme {
  /* === Colors (OKLCH) === */
  --color-bg-0: oklch(0.145 0.01 265);       /* #08090a — deepest */
  --color-bg-1: oklch(0.165 0.01 265);       /* #0f1011 — surface */
  --color-bg-2: oklch(0.195 0.01 265);       /* elevated */
  --color-bg-3: oklch(0.225 0.01 265);       /* modal */

  --color-fg-0: oklch(0.975 0.005 265);      /* #f7f8f8 — primary text */
  --color-fg-1: oklch(0.75 0.005 265);       /* secondary text */
  --color-fg-2: oklch(0.55 0.005 265);       /* tertiary/muted */

  --color-border-0: oklch(1 0 0 / 0.06);     /* subtle border */
  --color-border-1: oklch(1 0 0 / 0.10);     /* standard border */

  --color-accent: oklch(0.55 0.18 275);       /* #5e6ad2 — Linear lavender */
  --color-accent-hover: oklch(0.65 0.18 275); /* #828fff */

  --color-success: oklch(0.65 0.18 145);      /* green */
  --color-warning: oklch(0.75 0.15 80);       /* amber */
  --color-error: oklch(0.60 0.22 25);         /* red */

  /* === Typography === */
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'Geist Mono', ui-monospace, monospace;

  /* === Spacing (4px base) === */
  --spacing-0: 0;
  --spacing-px: 1px;
  --spacing-0-5: 0.125rem;  /* 2px */
  --spacing-1: 0.25rem;     /* 4px */
  --spacing-1-5: 0.375rem;  /* 6px */
  --spacing-2: 0.5rem;      /* 8px */
  --spacing-3: 0.75rem;     /* 12px */
  --spacing-4: 1rem;        /* 16px */
  --spacing-5: 1.25rem;     /* 20px */
  --spacing-6: 1.5rem;      /* 24px */
  --spacing-8: 2rem;        /* 32px */
  --spacing-10: 2.5rem;     /* 40px */
  --spacing-12: 3rem;       /* 48px */
  --spacing-16: 4rem;       /* 64px */
  --spacing-20: 5rem;       /* 80px */
  --spacing-24: 6rem;       /* 96px */

  /* === Radius === */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 20px;
  --radius-full: 9999px;

  /* === Shadows === */
  --shadow-border: 0 0 0 1px var(--color-border-0);
  --shadow-sm: 0 1px 2px rgba(0,0,0,0.15);
  --shadow-md: 0 4px 12px rgba(0,0,0,0.2);
  --shadow-lg: 0 8px 30px rgba(0,0,0,0.25);
  --shadow-xl: 0 24px 80px rgba(0,0,0,0.35);

  /* === Motion === */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-medium: 300ms;
  --duration-slow: 500ms;
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* === Layout === */
  --max-width-app: 1400px;
  --max-width-content: 800px;
  --max-width-wide: 1600px;

  /* === Sidebar === */
  --sidebar-width: 260px;
  --sidebar-collapsed: 64px;
}
```

---

## References

- **Linear Design System:** https://linear.app — dark, high-contrast, Inter Variable, 8px spacing grid
- **Vercel Geist:** https://vercel.com/geist — true black/white, Geist Sans, 4px base unit
- **shadcn/ui Theming:** https://ui.shadcn.com/docs/theming — CSS variable convention
- **Tailwind CSS v4:** https://tailwindcss.com — CSS-first, @theme, OKLCH
- **TanStack Query Infinite Queries:** https://tanstack.com/query/latest/docs/framework/react/guides/infinite-queries
- **React 19 useOptimistic:** https://react.dev/reference/react/useOptimistic
- **CSS light-dark() function:** https://developer.mozilla.org/en-US/docs/Web/CSS/color_value/light-dark
- **Design Systems for Startups (Blake Crosley):** https://blakecrosley.com/blog/design-systems-startups
- **dark-mode-design-expert (GitHub):** CSS implementation patterns for dark mode

---

*Dikompilasi: September 2026 | Target: SatuInbox SaaS Customer Service Platform*
