'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Calendar, MapPin, Users, Clock, BarChart2 } from 'lucide-react'

export type TeamMemberRow = {
  id: string
  name: string
  email: string
  status: 'invited' | 'accepted' | 'declined'
}

type Props = {
  event: {
    id: string
    name: string
    date: string
    location: string
  }
  registration: {
    division: string
    teamName: string | null
    isTeam: boolean
  } | null
  teamMembers: TeamMemberRow[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

const MEMBER_STATUS: Record<TeamMemberRow['status'], { label: string; className: string }> = {
  invited:  { label: 'Invited',  className: 'bg-warning-50 text-warning-700 ring-1 ring-warning-200' },
  accepted: { label: 'Accepted', className: 'bg-success-50 text-success-700 ring-1 ring-success-200' },
  declined: { label: 'Declined', className: 'bg-danger-50 text-danger-700 ring-1 ring-danger-200' },
}

const NEXT_STEPS = [
  {
    icon: Clock,
    title: 'Heat assignment coming',
    body: 'The organiser will post heat times closer to the event. You\'ll see them on your dashboard and on the event page.',
  },
  {
    icon: Users,
    title: 'Check in on the day',
    body: 'Head to the registration desk when you arrive. Your division, heat, and lane will all be ready.',
  },
  {
    icon: BarChart2,
    title: 'Live results after each workout',
    body: 'Scores and rankings appear on the Results tab of the event page as the competition runs.',
  },
]

// Lightweight confetti burst — pure CSS/DOM, no library
function useConfetti(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const COLORS = ['#22c55e', '#16a34a', '#4ade80', '#f59e0b', '#3b82f6', '#8b5cf6', '#ec4899']
    const COUNT = 48

    const pieces: HTMLDivElement[] = []
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('div')
      const size = Math.random() * 6 + 4
      const color = COLORS[Math.floor(Math.random() * COLORS.length)]
      const x = Math.random() * 100        // % across container
      const delay = Math.random() * 400    // ms
      const duration = Math.random() * 800 + 1200  // ms
      const endY = Math.random() * 80 + 40  // vh drop
      const rotate = Math.random() * 720 - 360

      el.style.cssText = `
        position:fixed; top:20px; left:${x}%; width:${size}px; height:${size}px;
        border-radius:${Math.random() > 0.5 ? '50%' : '2px'};
        background-color:${color}; opacity:0; pointer-events:none; z-index:9999;
        animation:confetti-fall ${duration}ms ${delay}ms cubic-bezier(0.25,0.46,0.45,0.94) forwards;
        --end-y:${endY}vh; --rotate:${rotate}deg;
      `

      document.body.appendChild(el)
      pieces.push(el)
    }

    // Inject keyframes once
    if (!document.getElementById('confetti-style')) {
      const style = document.createElement('style')
      style.id = 'confetti-style'
      style.textContent = `
        @keyframes confetti-fall {
          0%   { opacity: 1;   transform: translateY(0)              rotate(0deg); }
          100% { opacity: 0;   transform: translateY(var(--end-y))   rotate(var(--rotate)); }
        }
      `
      document.head.appendChild(style)
    }

    const timeout = setTimeout(() => {
      pieces.forEach((el) => el.remove())
    }, 2500)

    return () => {
      clearTimeout(timeout)
      pieces.forEach((el) => el.remove())
    }
  }, [containerRef])
}

export function SuccessScreen({ event, registration, teamMembers }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  useConfetti(containerRef)

  return (
    <div ref={containerRef} className="mx-auto max-w-5xl px-page-x pt-28 pb-section">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">

        {/* ── Left ──────────────────────────────────────────────────── */}
        <div className="md:col-span-7">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-success-50 ring-1 ring-success-200 px-3.5 py-1.5 mb-8 animate-fade-up [animation-delay:0ms]">
            <span className="size-2 rounded-full bg-success-500 animate-pulse" />
            <span className="text-xs font-semibold text-success-700 uppercase tracking-widest">
              Registration confirmed
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-title md:text-display font-bold leading-[1.02] tracking-tight animate-fade-up [animation-delay:80ms]">
            You&apos;re in.
          </h1>

          {/* Summary sentence */}
          <p className="mt-6 text-base text-muted-foreground leading-relaxed max-w-prose animate-fade-up [animation-delay:160ms]">
            Registered for{' '}
            <span className="font-semibold text-foreground">{event.name}</span>
            {registration?.division && (
              <> · <span className="font-semibold text-foreground">{registration.division}</span></>
            )}
            {registration?.teamName && (
              <> as <span className="font-semibold text-foreground">{registration.teamName}</span></>
            )}
            .
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap gap-3 animate-fade-up [animation-delay:240ms]">
            <Link
              href="/athlete"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                         px-5 py-2.5 text-sm font-semibold
                         hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Go to my dashboard
              <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="size-3" strokeWidth={2} />
              </span>
            </Link>
            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background
                         px-5 py-2.5 text-sm font-semibold hover:bg-muted transition-colors duration-200"
            >
              View event
            </Link>
          </div>

          {/* Team members */}
          {registration?.isTeam && teamMembers.length > 0 && (
            <div className="mt-12 animate-fade-up [animation-delay:320ms]">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-4">
                Your team
              </p>
              <ul className="flex flex-col gap-2">
                {teamMembers.map((m) => {
                  const { label, className: pillCn } = MEMBER_STATUS[m.status]
                  return (
                    <li key={m.id} className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{m.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                      </div>
                      <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${pillCn}`}>
                        {label}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* What's next */}
          <div className="mt-12 animate-fade-up [animation-delay:400ms]">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-6">
              What happens next
            </p>
            <ol className="flex flex-col gap-0 divide-y divide-border border-y border-border">
              {NEXT_STEPS.map(({ icon: Icon, title, body }, i) => (
                <li key={title} className="grid grid-cols-[2rem_1fr] gap-4 items-start py-5">
                  <div className="flex items-center justify-center size-7 rounded-full bg-muted shrink-0 mt-0.5">
                    <Icon className="size-3.5 text-muted-foreground" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-snug">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {/* ── Right: event card ──────────────────────────────────────── */}
        <div className="md:col-span-5 animate-fade-up [animation-delay:160ms]">
          <div className="rounded-xl border border-border bg-muted/30 p-6 sticky top-24">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Your registration
            </p>
            <dl className="flex flex-col gap-5">
              <div>
                <dt className="text-xs text-muted-foreground mb-1">Event</dt>
                <dd className="font-semibold text-sm leading-snug">{event.name}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Calendar className="size-3 shrink-0" strokeWidth={1.5} />
                  Date
                </dt>
                <dd className="font-semibold text-sm">{formatDate(event.date)}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <MapPin className="size-3 shrink-0" strokeWidth={1.5} />
                  Location
                </dt>
                <dd className="font-semibold text-sm">{event.location}</dd>
              </div>
              {registration?.division && (
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Division</dt>
                  <dd className="font-semibold text-sm">{registration.division}</dd>
                </div>
              )}
              {registration?.teamName && (
                <div>
                  <dt className="text-xs text-muted-foreground mb-1">Team</dt>
                  <dd className="font-semibold text-sm">{registration.teamName}</dd>
                </div>
              )}
            </dl>

            <div className="mt-6 pt-5 border-t border-border">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Heat times will appear on the{' '}
                <Link href={`/events/${event.id}?tab=schedule`} className="underline underline-offset-2 hover:text-foreground transition-colors">
                  event schedule
                </Link>
                {' '}before competition day.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
