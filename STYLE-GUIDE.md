# Onions Without Tears — Style Guide

## Colours

| Token | Hex | Usage |
|-------|-----|-------|
| `cream` | `#FFF8F0` | Page backgrounds (alternating sections) |
| `cream-dark` | `#F5EDE3` | Footer, image frame backgrounds |
| `onion` | `#C2185B` | Primary accent — buttons, links, active nav |
| `onion-light` | `#E91E7E` | Hover states (light) |
| `onion-dark` | `#880E4F` | Hover states (dark), section subheadings |
| `warm` | `#D4A574` | Decorative accents |
| `warm-light` | `#E8CDB5` | Image frame borders |
| `text` | `#2D2016` | Body text, headings |
| `text-muted` | `#6B5B4E` | Secondary text, captions, descriptions |
| `white` | `#FFFFFF` | Card backgrounds, hero sections |
| `border` | `#E8DDD2` | Card borders, dividers |

## Typography

- **Body font**: Georgia, 'Times New Roman', serif
- **Line height**: 1.8 (generous, readable)
- **Headings**: Bold, `text` colour
  - Page title (h1): `text-3xl md:text-4xl` (or `text-4xl md:text-5xl lg:text-6xl` on home hero)
  - Section heading (h2): `text-2xl md:text-3xl`
  - Card heading (h3): `text-lg font-semibold`
- **Body text**: `text-base`, colour `text`
- **Secondary text**: `text-sm` or `text-base`, colour `text-muted`
- **Captions**: `text-xs`, colour `text-muted`
- **Quotes**: `italic text-text-muted`

## Spacing Protocol

Every spacing decision must follow this table. Do not deviate without documenting a reason.

| Relationship | Value | Notes |
|---|---|---|
| Section padding (standard) | `py-16 md:py-20` | All sections |
| Section padding (hero only) | `py-16 md:py-24` | Home page hero only |
| H1 → short subtitle (1–5 words) | `mb-2` | Glued together as one visual unit |
| H1 → intro paragraph | `mb-4` | Loosely grouped with content below |
| H2 → short subtitle | `mb-4` | Same tightness as H1 → subtitle |
| Short subtitle → first content | `mb-8` | Same as H2 — both introduce content below |
| Intro paragraph → next heading | `mb-12` | Separates content blocks in same section |
| H2 → content | `mb-8` | Standard. Use `mb-12` when followed by dense content (grids). Use `mb-16` before image galleries — large bold text needs extra room before visual content |
| H3 (inside card) → card text | `mb-3` | Inside card only |
| Body paragraph → next paragraph | `mb-6` | Standard |
| Body paragraph → buttons | `mb-8` | Extra breathing room before CTAs |
| Last element inside a card | `mb-0` | Parent card padding handles the gap |
| Image/logo block → next element | `mb-10` | Block separator |
| Card/box → next element | `mb-8` | Block separator |
| Card/box → next H2 (same content type) | `mb-12` | e.g. card then related heading |
| Card/box → next H2 (content type change) | `mb-16` | e.g. artist bio box → gallery heading |
| Card inner padding (standard) | `p-6 md:p-8` | All standard cards |
| Card inner padding (large/hero) | `p-8 md:p-10` | Info boxes only |
| Grid gap | `gap-6 md:gap-8` | All grids |
| Stack of cards | `space-y-6` | Vertical card lists |
| Button group gap | `gap-3` | Between sibling buttons |

**Content max-width**: `max-w-2xl` (672px) for text, `max-w-4xl` (896px) for galleries/hero
**Horizontal padding**: `px-6` (24px)
**Between sections**: Gradient divider `h-1 bg-gradient-to-r from-cream via-onion/20 to-cream`

## Cards

- **Background**: `bg-cream` or `bg-white` (alternate with section background)
- **Border**: `border border-border`
- **Corners**: `rounded-xl`
- **Padding**: `p-6 md:p-8`
- **Shadow**: `shadow-sm` (subtle, only on feature cards)
- **Card heading**: `text-lg font-semibold text-onion-dark mb-3`

## Buttons

- **Primary (filled)**: `flex items-center justify-center bg-onion hover:bg-onion-dark text-white font-semibold px-8 py-3 rounded-full transition-colors`
- **Secondary (outline)**: `flex items-center justify-center border-2 border-onion text-onion hover:bg-onion-dark hover:border-onion-dark hover:text-white font-semibold px-8 py-3 rounded-full transition-colors`
- **Text link**: `text-onion hover:text-onion-dark underline decoration-onion/40 hover:decoration-onion transition-colors`

## Form Inputs

- **Style**: `w-full px-4 py-3 rounded-lg border border-border bg-cream focus:outline-none focus:ring-2 focus:ring-onion/30 focus:border-onion transition-colors`
- **Labels**: `block text-sm font-semibold mb-2`
- **Spacing between fields**: `space-y-6`

## Images

- **Framed illustrations**: `bg-cream-dark border-2 border-warm-light rounded-lg p-4 shadow-lg`
- **Gallery thumbnails**: `bg-cream-dark border-2 border-warm-light rounded-lg p-3 shadow-sm`
- **Inline images**: `rounded` with `w-full h-auto`

## Navigation

- **Desktop**: Centred horizontal links, `text-sm`, pill-shaped active state (`rounded-full bg-cream text-onion font-semibold`)
- **Mobile**: Hamburger menu, vertical link list
- **Sticky**: `sticky top-0 z-50` with `bg-white border-b border-border`

## Footer

- **Background**: `bg-cream-dark border-t border-border`
- **Padding**: `py-10`
- **Content**: Centred, `text-sm text-text-muted`
- **Format**: *Onions Without Tears* © [year] Alison Bessborough + farm shop link

## Page Structure

Every page follows this pattern:
1. Nav (via Layout)
2. Content sections (alternating `bg-white` and `bg-cream`)
3. Gradient dividers between sections on home page
4. White spacer before footer (home page)
5. Footer (shared component)

## Tone of Voice

- Warm, friendly, conversational
- Ali's own words where possible (Introduction, Farm Shop quote)
- Never preachy or salesy
- Book title always in italics: *Onions Without Tears*
- **No em dashes (—).** Use commas, full stops, or restructure the sentence instead.
