# Reps

A platform for discovering, running, and competing in fitness competitions. Athletes browse open events, register for categories, and track their heat schedules. Organizers create events, define categories and workouts, manage registrations, and assign athletes to heats.

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui + Radix UI |
| Auth & Database | Supabase (Postgres + Row Level Security) |
| Font | Figtree |

## Getting Started

```bash
npm install
npm run dev
```

Create a `.env.local` with your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

To seed the database, follow the instructions at the top of `supabase/seed.sql`.

## Key Features

**Athletes**
- Browse and register for open events by category (Rx, Scaled, Teams, etc.)
- View personal heat schedule and start times

**Organizers**
- Create and publish events with description, location, and status
- Define categories (individual or team) with per-category capacity and workouts
- Manage the registration roster with check-in support
- Assign athletes to heats and set start times

## Scripts

```bash
npm run dev      # development server
npm run build    # production build
npm run lint     # ESLint
```
