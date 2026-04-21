# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server (Turbopack by default in Next.js 16)
npm run build    # production build
npm run lint     # run ESLint (uses ESLint CLI directly, not next lint)
```

No test suite is configured.

## Stack

- **Next.js 16** (App Router) — see breaking changes below
- **React 19**, TypeScript 5, Tailwind CSS v4
- **Supabase** — auth + Postgres database with Row Level Security
- **shadcn/ui** components built on Radix UI primitives

Required env vars (see `.env.local`):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Architecture

### Route structure

```
src/app/
  (auth)/         # login, register, confirm-email — no navbar
  (dashboard)/    # athlete/ and organizer/ — wrapped in Navbar layout
    athlete/
    organizer/
      events/[id]/
        categories/
        heats/[workoutId]/
        registrations/
  events/         # public event listing and detail pages
  api/auth/callback/route.ts   # Supabase OAuth code exchange
```

### Auth and sessions

- `middleware.ts` (root-level) refreshes the Supabase session on every request and redirects unauthenticated users away from `/organizer` and `/athlete`.
- Use `src/lib/supabase/server.ts` (`createClient`) in Server Components and Route Handlers — it reads/writes cookies.
- Use `src/lib/supabase/client.ts` in Client Components — browser singleton.
- User role (`organizer` | `athlete`) is stored in `public.users.role` and drives which dashboard is shown.

### Data model

Types are in `src/types/index.ts`. Core entities: `User`, `Event`, `Category`, `Workout`, `Registration`, `Heat`, `HeatAssignment`. The Supabase schema with RLS policies lives in `supabase/schema.sql`.

When querying registrations with athlete details, join via `.select('*, athlete:users(*)')`. Aggregate counts come back as `{ count: number }[]` from `.select('*, registrations(count)')`.

### Component organisation

- `src/components/ui/` — shadcn primitives (Button, Dialog, etc.)
- `src/components/layout/` — Navbar, NavLinks
- `src/components/events/` — feature components (heat-manager, category-card, event-tabs, etc.)

## Next.js 16 breaking changes in this codebase

- **`middleware.ts` is deprecated** — the file should be renamed to `proxy.ts` and the exported function renamed from `middleware` to `proxy`. The project currently still uses the old name; the runtime accepts it with a deprecation warning.
- **`next lint` is gone** — the lint script correctly calls `eslint` directly.
- **Turbopack is the default bundler** — no flag needed.
- **`revalidateTag` requires a second `cacheLife` argument** — the single-argument form is a TypeScript error in v16.
- **`unstable_` prefix removed** from stabilised APIs (`cacheTag`, etc.) — use the unprefixed names.
- **Instant navigation** — export `unstable_instant` from any route that should navigate instantly client-side, in addition to using `<Suspense>` boundaries. Read `node_modules/next/dist/docs/01-app/02-guides/instant-navigation.md` before wiring this up.

Before writing any Next.js code, check the relevant guide in `node_modules/next/dist/docs/`.
