---
name: Design token system
description: How colors, spacing, and other visual constants are organized in this project — what file owns them and how to reference them
type: project
---

All design tokens live in `src/styles/tokens.css` (imported by `globals.css`).

**Rule:** Never use raw Tailwind palette utilities (e.g. `violet-600`, `gray-300`) in component classNames or variant definitions. Use a token instead.

**Why:** Single source of truth for all visual constants. Rebranding or tweaking the palette is a one-file change. Matches the user's explicit preference.

**How to apply:** When writing className strings or CVA variants, use only tokens from the hierarchy below.

---

## Token hierarchy

```
Palette tokens  →  Semantic tokens  →  Component variants
(tokens.css)       (globals.css)        (ui/*.tsx)
```

### Palette tokens (in `tokens.css`) — use when semantic token doesn't fit

| Token name       | Maps to          | Use for                              |
|------------------|------------------|--------------------------------------|
| `brand-{50-950}` | violet palette   | brand color, accent, highlights      |
| `neutral-{50-950}`| mist palette    | grays, borders, backgrounds          |
| `success-{50-950}`| emerald palette | positive states, confirmations       |
| `danger-{50-950}` | red palette     | errors, destructive actions          |
| `warning-{50-950}`| amber palette   | caution states                       |

### Semantic tokens (in `globals.css`) — prefer these in components

These are already wired to Tailwind utilities via `@theme inline`:
`bg-primary`, `text-primary`, `bg-muted`, `text-muted-foreground`, `border-border`,
`text-destructive`, `bg-secondary`, `text-secondary-foreground`, etc.

### Named spacings (`tokens.css`) — use for layout
`px-page-x`, `py-page-y`, `gap-section`, `p-card`, `gap-form-gap`, `gap-stack`, `gap-inline`

### Named typography
Font sizes: `text-display`, `text-title`, `text-heading`, `text-subhead`, `text-label`
Font weights: `font-regular`, `font-medium`, `font-semibold`, `font-bold`

### Named shadows
`shadow-card`, `shadow-panel`, `shadow-modal`

### Named z-index
`z-base`, `z-raised`, `z-overlay`, `z-modal`, `z-notification`, `z-top`
