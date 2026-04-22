'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Users, User, ArrowRight, CheckCircle2, ChevronDown, ChevronUp,
  Clock, Repeat, Dumbbell, RefreshCw,
} from 'lucide-react'
import type { Category, Workout, ScoringType } from '@/types'

const scoringMeta: Record<ScoringType, { label: string; Icon: React.ElementType; color: string }> = {
  time:   { label: 'For Time',  Icon: Clock,     color: 'bg-brand-100 text-brand-700'   },
  reps:   { label: 'Max Reps',  Icon: Repeat,    color: 'bg-success-100 text-success-700' },
  load:   { label: 'Max Load',  Icon: Dumbbell,  color: 'bg-warning-100 text-warning-700' },
  rounds: { label: 'AMRAP',     Icon: RefreshCw, color: 'bg-neutral-100 text-neutral-600' },
}

export type HeatEntry = {
  workoutName: string
  workoutOrder: number
  heatName: string
  startTime: string | null
}

type Props = {
  eventId:          string
  category:         Category & { workouts: Workout[] }
  isRegistered:     boolean
  heatEntries?:     HeatEntry[]
  clickable:        boolean
  defaultExpanded?: boolean
}

export function CategoryCard({
  eventId,
  category: cat,
  isRegistered,
  heatEntries = [],
  clickable,
  defaultExpanded = false,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const workouts = (cat.workouts ?? []).sort((a, b) => a.order_num - b.order_num)
  const isTeam   = cat.type === 'team'

  return (
    <div className="relative group">
      {/* Registration overlay — sits below expand button (z-10 vs z-20) */}
      {clickable && (
        <Link
          href={`/events/${eventId}/register?category=${cat.id}`}
          className="absolute inset-0 z-10 rounded-[1.25rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Register for ${cat.name}`}
        />
      )}

      <div
        className={`rounded-[1.25rem] border-2 bg-card overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isRegistered
            ? 'border-success-300 bg-success-50/30'
            : clickable
              ? 'border-border group-hover:border-primary/40 group-hover:shadow-panel group-hover:-translate-y-0.5'
              : 'border-border opacity-70'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5">
          <div className="flex items-center gap-3 min-w-0">
            <h3 className={`font-bold text-lg transition-colors duration-200 ${clickable ? 'group-hover:text-primary' : ''}`}>
              {cat.name}
            </h3>
            <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold shrink-0 ${
              isTeam ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-600'
            }`}>
              {isTeam
                ? <><Users className="size-3" strokeWidth={1.5} />Team</>
                : <><User  className="size-3" strokeWidth={1.5} />Individual</>}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {cat.capacity > 0 && (
              <span className="text-xs text-muted-foreground tabular-nums">{cat.capacity} spots</span>
            )}
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); setExpanded(v => !v) }}
              className="relative z-20 flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {workouts.length} workout{workouts.length !== 1 ? 's' : ''}
              {expanded
                ? <ChevronUp  className="size-3.5" strokeWidth={1.5} />
                : <ChevronDown className="size-3.5" strokeWidth={1.5} />}
            </button>
          </div>
        </div>

        {/* Collapsible workouts */}
        {expanded && (
          <div className="border-t border-border">
            {workouts.length > 0 ? (
              <div className="px-6 py-4 flex flex-col gap-3">
                {workouts.map((w) => {
                  const { label, Icon, color } = scoringMeta[w.scoring_type]
                  return (
                    <div key={w.id} className="rounded-xl border border-border bg-background p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                            Workout {w.order_num}
                          </span>
                          <h4 className="font-semibold text-sm mt-0.5">{w.name}</h4>
                        </div>
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2.5 py-1 shrink-0 ${color}`}>
                          <Icon className="size-3" strokeWidth={1.5} />
                          {label}
                        </span>
                      </div>
                      {w.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                          {w.description}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="px-6 py-4 text-sm text-muted-foreground italic">
                Workouts not yet announced.
              </p>
            )}
          </div>
        )}

        {/* Footer CTA */}
        <div className={`flex items-center justify-between px-6 py-4 border-t border-border transition-colors ${
          isRegistered
            ? 'bg-success-50/40'
            : clickable
              ? 'bg-muted/30 group-hover:bg-primary/5'
              : 'bg-muted/20'
        }`}>
          <span className="text-sm text-muted-foreground">
            {isTeam ? 'Team registration' : 'Individual registration'}
          </span>
          {isRegistered ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-success-700">
              <CheckCircle2 className="size-4" strokeWidth={1.5} />
              Registered
            </span>
          ) : clickable ? (
            <span className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground group-hover:text-primary transition-colors">
              Register
              <span className="flex size-6 items-center justify-center rounded-full bg-muted group-hover:bg-primary/10 transition-colors">
                <ArrowRight className="size-3" strokeWidth={2} />
              </span>
            </span>
          ) : null}
        </div>

        {/* Per-category heat schedule */}
        {isRegistered && heatEntries.length > 0 && (
          <div className="px-6 py-4 border-t border-border bg-success-50/20">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              Your heats
            </p>
            <div className="flex flex-col gap-1.5">
              {heatEntries
                .slice()
                .sort((a, b) => a.workoutOrder - b.workoutOrder)
                .map((entry, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground w-24 truncate text-xs shrink-0">
                      {entry.workoutName}
                    </span>
                    <span className="font-semibold">{entry.heatName}</span>
                    {entry.startTime && (
                      <span className="text-muted-foreground text-xs">
                        · {new Date(entry.startTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    )}
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
