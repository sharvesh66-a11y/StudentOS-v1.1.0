# StudentOS — UI GUIDELINES

**Version:** 1.0.0 — Production-Ready (2026-07-13)

> **CRITICAL RULE:** StudentOS UI designs are already approved. **Do NOT
> redesign.** These guidelines exist to keep all engineers aligned on the
> approved visual language. When in doubt, defer to the approved Figma.

---

## 1. Design Language

| Property            | Value                                        |
| ------------------- | -------------------------------------------- |
| **Theme**           | Dark (primary)                               |
| **Primary color**   | Purple                                       |
| **Secondary color** | Blue                                         |
| **Color space**     | oklch (CSS Color 4)                          |
| **Style**           | Modern · Futuristic · Minimal · Premium SaaS |
| **Responsiveness**  | Mobile-first, fully responsive               |
| **Animations**      | Smooth, subtle, purposeful                   |

---

## 2. Color Tokens

All colors are defined as CSS variables in `src/app/globals.css` using the
**oklch** color space and surfaced through Tailwind utility classes
(`bg-primary`, `text-foreground`, etc.). **Never use raw hex values in
components** — always use the design tokens.

### Dark theme (active)

| Token                | Role                         | Approx. hex                                       |
| -------------------- | ---------------------------- | ------------------------------------------------- |
| `--background`       | App background               | `#0a0a14` (deep near-black with purple-blue tint) |
| `--foreground`       | Body text                    | `#f5f5fa`                                         |
| `--card`             | Card surfaces                | `#13131f`                                         |
| `--popover`          | Popovers, dropdowns          | `#15151f`                                         |
| `--primary`          | Brand purple (CTAs, accents) | `#7c3aed` vibe                                    |
| `--secondary`        | Brand blue                   | `#3b82f6` vibe                                    |
| `--accent`           | Subtle purple-blue blend     | `#1a1530`                                         |
| `--muted`            | Muted surfaces               | `#1a1a26`                                         |
| `--muted-foreground` | Secondary text               | `#a0a0b8`                                         |
| `--border`           | Hairline borders             | `rgba(255,255,255,0.08)`                          |
| `--input`            | Input borders                | `rgba(255,255,255,0.12)`                          |
| `--ring`             | Focus rings                  | matches primary                                   |
| `--destructive`      | Errors, destructive actions  | `#dc2626` vibe                                    |

### Chart palette (purple → blue spectrum)

1. `--chart-1` Purple
2. `--chart-2` Blue
3. `--chart-3` Cyan
4. `--chart-4` Magenta
5. `--chart-5` Orange (accent)

### Known contrast caveat

`--muted-foreground` (L=68%) on `--muted` (L=22%) background yields a contrast
ratio of ~3.3:1. This **fails WCAG AA for normal text** (4.5:1) but **passes
for large text** (3:1). Affects tag chips and small badges inside `bg-muted`
surfaces. Documented as a known limitation in `docs/PROJECT_STATUS.md` — not
adjusted in v1.0.0 to preserve visual hierarchy between primary and secondary
text.

---

## 3. Component Library

**shadcn/ui (Radix UI) is the standard.** Every primitive in
`src/components/ui/` is a shadcn/ui component, customized to match the
StudentOS dark theme. There are 50+ primitives (Button, Input, Dialog, Sheet,
DropdownMenu, Select, Popover, Tooltip, Tabs, Table, Card, Avatar, Badge,
Skeleton, Sonner toast, etc.).

**Rule:** Prefer composing shadcn/ui primitives over writing custom HTML.
Custom components live in feature folders, not in `src/components/ui/`.

### Tailwind CSS 4 utility classes preferred

- Use Tailwind utilities (`p-5`, `gap-4`, `rounded-xl`) instead of custom CSS.
- Custom CSS lives only in `src/app/globals.css` and only for things Tailwind
  cannot express (CSS variable definitions, `@layer base` rules).
- The `cn()` helper (`src/lib/utils.ts`) merges class names with
  `tailwind-merge` for conflict resolution.

---

## 4. File & Component Naming

| Element          | Convention                         | Example                           |
| ---------------- | ---------------------------------- | --------------------------------- |
| Component file   | kebab-case                         | `chat-input.tsx`, `note-card.tsx` |
| Component export | PascalCase                         | `ChatInput`, `NoteCard`           |
| Hook file        | `use-*`                            | `use-streaming-chat.ts`           |
| Service file     | `*.service.ts`                     | `teacher.service.ts`              |
| Store file       | `*.store.ts`                       | `junova.store.ts`                 |
| Constant file    | `*.constants.ts` or `constants.ts` | `exam.constants.ts`               |

---

## 5. Typography

| Role        | Font           | Weight    | Notes                                    |
| ----------- | -------------- | --------- | ---------------------------------------- |
| Body        | **Geist Sans** | 400 / 500 | Loaded via `next/font/google`            |
| Headings    | **Geist Sans** | 600 / 700 | Same family, heavier weight              |
| Code / mono | **Geist Mono** | 400 / 500 | Code blocks, inline code, version badges |

### Type scale (Tailwind defaults)

- Display: `text-5xl` → `text-7xl` (hero only)
- H1: `text-3xl` / `text-4xl`
- H2: `text-2xl`
- H3: `text-xl`
- Body: `text-base` (16px)
- Small: `text-sm` (14px)
- Caption: `text-xs` (12px)

### Line height & letter spacing

- Headings: `tracking-tight` (slightly tight)
- Body: default
- Captions / uppercase labels: `tracking-wider`

---

## 6. Spacing

StudentOS uses **Tailwind's default spacing scale** (4px base).

### Common patterns

| Pattern                  | Class              |
| ------------------------ | ------------------ |
| Card padding             | `p-5` or `p-6`     |
| Card gap (grid)          | `gap-4` or `gap-6` |
| Section spacing          | `mt-12` / `mt-16`  |
| Inline label ↔ value gap | `gap-2`            |
| Form field gap           | `gap-4`            |

### Page layout

- Mobile: `px-4` horizontal padding
- Tablet: `px-6`
- Desktop: `px-8` / `px-10`
- Max content width: `max-w-5xl` (default), `max-w-7xl` (dashboards)

---

## 7. Border Radius

| Token          | Value                       | Use                    |
| -------------- | --------------------------- | ---------------------- |
| `rounded-sm`   | `calc(var(--radius) - 4px)` | Small chips            |
| `rounded-md`   | `calc(var(--radius) - 2px)` | Inputs, small buttons  |
| `rounded-lg`   | `var(--radius)` = `0.75rem` | Cards, default         |
| `rounded-xl`   | `calc(var(--radius) + 4px)` | Feature cards          |
| `rounded-full` | `9999px`                    | Badges, pills, avatars |

---

## 8. Shadows & Depth

Dark theme relies on **subtle depth via opacity + borders**, not heavy shadows.

| Elevation      | Recipe                                                                         |
| -------------- | ------------------------------------------------------------------------------ |
| Card (default) | `bg-card/50 border border-border backdrop-blur-sm`                             |
| Card (hover)   | `hover:bg-card hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5` |
| Popover        | `bg-popover border border-border shadow-xl`                                    |
| Modal          | `bg-popover border border-border shadow-2xl`                                   |

---

## 9. Components

### Buttons (shadcn/ui Button)

| Variant             | Use                                     |
| ------------------- | --------------------------------------- |
| `default` (primary) | Primary CTAs — uses `bg-primary`        |
| `secondary`         | Secondary actions — uses `bg-secondary` |
| `outline`           | Tertiary actions — border only          |
| `ghost`             | Inline actions, no chrome               |
| `destructive`       | Delete / irreversible actions           |

**Sizes:** `sm`, `default`, `lg`, `icon`.

### Cards

- Always `rounded-xl` (or `rounded-lg` for compact)
- Always `border border-border`
- Padding: `p-5` (compact) or `p-6` (default)
- Hover state: subtle border color shift to `primary/40`

### Inputs

- `rounded-md`
- `bg-transparent` with `border border-input`
- Focus: `focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]`
- Error: `border-destructive`

---

## 10. Loading & Error States

### Loading states

- Use `<Skeleton>` from `src/components/ui/skeleton.tsx` for content
  placeholders.
- Do NOT use spinners except for button loading states (`<Button disabled>
<Loader2 className="animate-spin" /> ...`).
- Feature route pages use `next/dynamic` with `ssr: false` and a `<Skeleton>`
  fallback to reduce initial bundle size.
- Every route has a `loading.tsx` file for streaming-SSR loading states.

### Error states

- Use `toast.error()` from Sonner for transient user-facing errors.
- Use `<Alert variant="destructive">` for persistent form-level errors.
- API errors are normalized through `normalizeFirebaseError()` to user-friendly
  messages before being displayed.
- Every route has an `error.tsx` file (React error boundary) for graceful
  failure recovery.
- The global `src/app/error.tsx` catches uncaught errors.

---

## 11. Animation Guidelines

**Principle:** Animations should feel **calm and purposeful**, never bouncy or
distracting. Use them to guide attention, not to decorate.

### Durations

| Type                     | Duration    | Easing        |
| ------------------------ | ----------- | ------------- |
| Micro (hover, focus)     | `150ms`     | `ease-out`    |
| Small (modal, dropdown)  | `200ms`     | `ease-out`    |
| Medium (page transition) | `300ms`     | `ease-in-out` |
| Large (hero entrance)    | `400–500ms` | `ease-out`    |

### Custom keyframes

Defined in `src/app/globals.css` (Tailwind v4 syntax):

- `animate-fade-in` — opacity 0→1
- `animate-fade-up` — opacity 0→1, translateY 8px→0
- `animate-scale-in` — opacity 0→1, scale 0.96→1
- `animate-shimmer` — loading skeleton shimmer

### Framer Motion (preferred for orchestrated motion)

- Use `framer-motion` for layout animations, drag, gestures.
- Keep spring stiffness low (calm feel): `{ stiffness: 200, damping: 30 }`.

### Reduced motion

- All animations MUST respect `prefers-reduced-motion: reduce`.
- Wrap animated elements in a `MotionConfig` with `reducedMotion="user"`.

---

## 12. Responsive Breakpoints

Tailwind defaults:

| Prefix | Min width | Target                      |
| ------ | --------- | --------------------------- |
| (none) | 0px       | Mobile (default)            |
| `sm:`  | 640px     | Large phones, small tablets |
| `md:`  | 768px     | Tablets                     |
| `lg:`  | 1024px    | Small laptops               |
| `xl:`  | 1280px    | Desktops                    |
| `2xl:` | 1536px    | Large desktops              |

### Rules

- **Mobile-first:** always start with mobile styles, then layer `sm:`, `md:`, etc.
- **Touch targets:** minimum 44×44px (`min-h-11 min-w-11`).
- **Sidebar:** collapses to drawer below `lg:`.
- **Forms:** single column on mobile, multi-column on `lg:`.

---

## 13. Accessibility (Mandatory)

### Semantic HTML

- Use `<main>`, `<header>`, `<nav>`, `<section>`, `<article>`, `<footer>`.
- The app shell has a skip-to-content link (`#main-content`) as its first
  child for keyboard users.
- Landmarks (`<aside>`, `<nav>`) have `aria-label` when there could be more
  than one on a page.

### Icon-only buttons

**Every icon-only button must have an `aria-label`.** This is enforced by the
Sprint 13.0 accessibility audit — ~30 icon-only buttons across 12 files now
have accessible names. Examples:

```tsx
<Button size="icon" aria-label="Send message" onClick={handleSend}>
  <Send className="h-4 w-4" />
</Button>

<Button
  size="icon"
  aria-label={`Delete quiz ${quiz.title}`}
  onClick={() => deleteQuiz(quiz.id)}
>
  <Trash2 className="h-4 w-4" />
</Button>
```

### Form inputs

**Every form input must have an associated `<Label>`** via `htmlFor` / `id`:

```tsx
<div className="space-y-2">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" {...register('email')} />
</div>
```

For inputs without a visible label (e.g. search boxes, code examples), use
`aria-label`:

```tsx
<Input
  type="search"
  placeholder="Search notes..."
  aria-label="Search notes"
  value={query}
  onChange={(e) => setQuery(e.target.value)}
/>
```

### Keyboard navigation

- Every interactive element must be reachable and operable via keyboard.
- shadcn/ui components (Dialog, DropdownMenu, Sheet, Select, Popover, etc.)
  inherit Radix's built-in keyboard support (Enter / Space / Arrow keys /
  Esc / focus trap).
- Custom modal patterns in `notes-hub-view.tsx`, `community-view.tsx`,
  `freelance-view.tsx` use plain `<div onClick>` overlays — documented as a
  known limitation (lacks Esc-to-close + focus trap).

### Focus

- Visible focus ring on every focusable element.
- Global CSS rule: `*:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; }`
  in `src/app/globals.css`.
- shadcn/ui Button / Input / Textarea / Select additionally use
  `focus-visible:ring-[3px]` Tailwind utilities.

### Screen readers

- Use `sr-only` for visually-hidden but accessible text.
- Decorative icons use `aria-hidden="true"`.
- Every meaningful image has descriptive alt text.

### Color contrast

- Minimum 4.5:1 for body text, 3:1 for large text (WCAG AA).
- Main text combinations all pass:
  - `--foreground` on `--background`: ~14:1 (AAA)
  - `--muted-foreground` on `--background`: ~5.5:1 (AA)
  - `--primary` on `--background`: ~4.7:1 (AA)
  - `--primary-foreground` on `--primary`: ~6.5:1 (AA)
- See Section 2 for the known `--muted-foreground` on `--muted` caveat.

---

## 14. Iconography

- **Library:** `lucide-react` (already installed).
- **Size:** `h-4 w-4` (inline), `h-5 w-5` (default), `h-6 w-6` (large).
- **Stroke width:** default `2` (don't override).
- **Color:** inherit from parent text color (`text-current`).
- Do NOT use `@radix-ui/react-icons` — it is not a dependency.

---

## 15. Do NOT

- ❌ Redesign approved screens.
- ❌ Use raw hex colors in components — always use design tokens.
- ❌ Use `indigo` Tailwind color (conflicts with brand).
- ❌ Use heavy box-shadows (use borders + opacity for depth).
- ❌ Use bouncy / elastic animations.
- ❌ Hardcode padding / margin values — use Tailwind spacing scale.
- ❌ Use `<img>` — use `next/image` (unless explicitly decorative).
- ❌ Ship an icon-only button without an `aria-label`.
- ❌ Ship a form input without an associated `<Label>` or `aria-label`.
- ❌ Use raw `fetch('/api/...')` from client code — use `authedFetch()` from
  `src/lib/api-client.ts`.
- ❌ Import server-only modules (`src/firebase/admin.ts`,
  `src/features/junova/services/ai-provider*.ts`) from client code — they are
  guarded by `import 'server-only'`.

---

_These guidelines are the canonical UI / design-system rules for StudentOS
v1.0.0. Changes require explicit approval and a documented rationale in
`docs/CHANGELOG.md`._
