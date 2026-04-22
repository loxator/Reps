import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from 'lucide-react'
import { Navbar } from '@/components/layout/navbar'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1800&h=1200&fit=crop&q=85'

const PROOF = { athletes: 483, events: 47, regions: 12 }

const athletePillars = [
  {
    lead: 'Find the right room.',
    body: 'Filter by region, sport, and skill level. The events that fit you surface first — not the ones paying for placement.',
  },
  {
    lead: 'Register in one sitting.',
    body: "Pick a division, pay once, done. No printable PDFs, no email chains, no \"we'll get back to you.\"",
  },
  {
    lead: 'Keep your history in one place.',
    body: 'Every division, every event, every year — organised for you the day you sign up.',
  },
]

const organizerPillars = [
  {
    lead: 'Spin up an event in an afternoon.',
    body: "Custom divisions, workouts, capacity caps, open and close windows — all in one form. Publish when you're ready.",
  },
  {
    lead: 'Stop running event day on a spreadsheet.',
    body: 'Heats, check-in, scoring, and capacity all live on the same surface athletes registered on.',
  },
  {
    lead: 'Talk to your athletes, not the ones who showed up by accident.',
    body: "Registrations come in structured — so you know exactly who's coming, in what division, and on what team.",
  },
]

const steps = [
  { n: 1, title: 'Create an account',        body: "Athlete or organiser — it takes a minute." },
  { n: 2, title: 'Find a room or build one', body: 'Browse competitions near you, or set up your own.' },
  { n: 3, title: 'Turn up and compete',      body: "Secure your spot. Show up. We'll take it from there." },
]

export default function Home() {
  return (
    <>
      <Navbar />
      <main>

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <section className="relative min-h-[100svh] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={HERO_IMAGE}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover animate-fade-up [animation-delay:0ms]"
          />
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 38%, rgba(0,0,0,0.08) 72%, transparent 100%), linear-gradient(to right, rgba(0,0,0,0.40) 0%, transparent 55%)',
            }}
          />
          <div className="relative z-raised min-h-[100svh] flex flex-col justify-end">
            <div className="mx-auto max-w-6xl w-full px-page-x pb-16 md:pb-24">
              <p className="animate-fade-up [animation-delay:80ms] text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50 mb-5">
                The fitness competition platform
              </p>
              <h1 className="animate-fade-up [animation-delay:150ms] text-white font-bold tracking-tight leading-[0.92] text-[3.25rem] sm:text-[4rem] md:text-[5.25rem] max-w-[18ch]">
                Show up.
                <br />
                <span className="text-white/50">Compete.</span>
                <br />
                Do it again.
              </h1>

              <p className="animate-fade-up [animation-delay:320ms] mt-7 max-w-[44ch] text-base md:text-lg text-white/70 leading-relaxed">
                reps. is where athletes find local competitions and where organisers run them.
                No forms in Google Drive. No check-in on a clipboard.
              </p>

              <div className="animate-fade-up [animation-delay:480ms] mt-9 flex flex-wrap items-center gap-4">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2.5 rounded-full bg-white text-foreground
                             px-6 py-3 text-sm font-semibold
                             hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Browse open events
                  <span className="flex size-5 items-center justify-center rounded-full bg-black/10">
                    <ArrowRight className="size-3" strokeWidth={2} />
                  </span>
                </Link>
                <Link
                  href="/register"
                  className="text-sm font-medium text-white/75 hover:text-white transition-colors inline-flex items-center gap-1"
                >
                  Host your own
                  <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
                </Link>
              </div>

              <p className="animate-fade-up [animation-delay:640ms] mt-16 text-xs text-white/45 max-w-xl leading-relaxed">
                <span className="text-white/75 font-semibold tabular-nums">{PROOF.athletes}</span> athletes
                {' · '}
                <span className="text-white/75 font-semibold tabular-nums">{PROOF.events}</span> events
                {' · '}
                <span className="text-white/75 font-semibold tabular-nums">{PROOF.regions}</span> regions
                {' · '}
                last updated this morning.
              </p>
            </div>
          </div>
        </section>

        {/* ── For athletes ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-page-x py-section">
          <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
            <div className="md:col-span-4 md:sticky md:top-24">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
                For athletes
              </p>
              <h2 className="text-heading md:text-title font-bold leading-[1.05]">
                If you train,<br />you should race.
              </h2>
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
                Not everyone who lifts is chasing a podium. Most people just want a date on the calendar
                and someone else keeping score.
              </p>
              <Link
                href="/events"
                className="inline-flex items-center gap-1.5 mt-6 text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                See what&apos;s open
                <ArrowRight className="size-3.5" strokeWidth={1.5} />
              </Link>
            </div>

            <ol className="md:col-span-8 flex flex-col gap-0 divide-y divide-border border-y border-border">
              {athletePillars.map(({ lead, body }, i) => (
                <li key={lead} className="grid grid-cols-[3rem_1fr] gap-6 items-start py-8">
                  <span className="text-xs font-semibold text-muted-foreground tabular-nums pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <p className="font-bold text-xl leading-snug">{lead}</p>
                    <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed max-w-prose">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ── Full-bleed photo divider ────────────────────────────────────── */}
        <div className="h-80 md:h-[28rem] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1800&h=600&fit=crop&q=85"
            alt=""
            aria-hidden
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* ── For organisers ─────────────────────────────────────────────── */}
        <section className="bg-foreground text-background">
          <div className="mx-auto max-w-6xl px-page-x py-section">
            <div className="grid md:grid-cols-12 gap-10 md:gap-14 items-start">
              <div className="md:col-span-4 md:sticky md:top-24 md:order-last">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-background/45 mb-3">
                  For organisers
                </p>
                <h2 className="text-heading md:text-title font-bold leading-[1.05]">
                  Run better events<br />with less glue code.
                </h2>
                <p className="mt-4 text-sm text-background/60 leading-relaxed max-w-sm">
                  You know what the event looks like. We handle the part where 80 athletes need to
                  find their heat at 7:14am.
                </p>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 mt-7 rounded-full bg-background text-foreground
                             px-5 py-2.5 text-sm font-semibold
                             hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Start — it&apos;s free
                  <span className="flex size-5 items-center justify-center rounded-full bg-black/10">
                    <ArrowRight className="size-3" strokeWidth={2} />
                  </span>
                </Link>
              </div>

              <ol className="md:col-span-8 flex flex-col divide-y divide-white/10 border-y border-white/10">
                {organizerPillars.map(({ lead, body }, i) => (
                  <li key={lead} className="grid grid-cols-[3rem_1fr] gap-6 items-start py-8">
                    <span className="text-xs font-semibold text-background/35 tabular-nums pt-1">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="font-bold text-xl leading-snug">{lead}</p>
                      <p className="mt-2.5 text-sm text-background/60 leading-relaxed max-w-prose">
                        {body}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────────────────── */}
        <section className="mx-auto max-w-6xl px-page-x py-section">
          <div className="mb-10">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
              Simple by design
            </p>
            <h2 className="text-heading md:text-title font-bold leading-[1.05]">
              How it works.
            </h2>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-sm">
              Three steps. No onboarding tour, no concierge call, no enterprise demo.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {steps.map(({ n, title, body }) => (
              <div key={n} className="rounded-xl border border-border bg-muted/30 p-7 flex flex-col">
                <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-5">
                  Step {n}
                </span>
                <p className="font-bold text-xl leading-snug mb-3">{title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-auto">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Footer CTA ─────────────────────────────────────────────────── */}
        <footer className="border-t border-border">
          <div className="mx-auto max-w-6xl px-page-x pt-section pb-12">
            <div className="grid md:grid-cols-12 gap-8 items-end mb-14">
              <div className="md:col-span-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-4">
                  Ready?
                </p>
                <p className="text-[clamp(2rem,6vw,3.75rem)] font-bold leading-[0.95] tracking-tight">
                  Find your next<br />competition.
                </p>
              </div>
              <div className="md:col-span-4 flex md:justify-end flex-wrap gap-3">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                             px-5 py-2.5 text-sm font-semibold
                             hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
                >
                  Browse events
                  <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                    <ArrowRight className="size-3" strokeWidth={2} />
                  </span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background
                             px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors duration-200"
                >
                  Sign up
                </Link>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pt-8 border-t border-border text-sm text-muted-foreground">
              <p className="font-bold text-foreground tracking-tight text-base">
                reps<span className="text-primary">.</span>
              </p>
              <nav className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/events" className="hover:text-foreground transition-colors">Events</Link>
                <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
                <Link href="/login" className="hover:text-foreground transition-colors">Sign in</Link>
                <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
              </nav>
              <p className="tabular-nums">© {new Date().getFullYear()}</p>
            </div>
          </div>
        </footer>
      </main>
    </>
  )
}
