'use client'

import { ArrowRight, Users, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Category } from '@/types'

type Props = {
  eventName: string
  categories: Category[]
  onPick: (c: Category) => void
}

export function CategoryPicker({ eventName, categories, onPick }: Props) {
  return (
    <div>
      <h1 className="text-title font-bold leading-tight mb-1">{eventName}</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Choose a category to register for.
      </p>

      {categories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border border-dashed border-border">
          <p className="font-medium text-sm mb-1">No categories set up yet</p>
          <p className="text-sm text-muted-foreground">
            The organizer hasn&apos;t added categories for this event.
          </p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {categories.map((cat) => {
            const isTeam = cat.type === 'team'
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onPick(cat)}
                className={cn(
                  'group relative flex flex-col w-full rounded-xl border-2 border-border bg-card p-6 text-left',
                  'shadow-card transition-all duration-150',
                  'hover:border-primary hover:bg-primary/5 hover:-translate-y-px hover:shadow-panel',
                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                )}
              >
                {/* Type badge */}
                <span className={cn(
                  'inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium mb-4 w-fit',
                  isTeam
                    ? 'bg-brand-100 text-brand-700'
                    : 'bg-neutral-100 text-neutral-600'
                )}>
                  {isTeam
                    ? <><Users className="size-3" /> Team</>
                    : <><User  className="size-3" /> Individual</>
                  }
                </span>

                <p className="font-semibold text-xl leading-tight group-hover:text-primary transition-colors">
                  {cat.name}
                </p>

                {cat.capacity > 0 && (
                  <p className="text-sm text-muted-foreground mt-1.5">
                    {cat.capacity} spots
                  </p>
                )}

                {/* Bottom row */}
                <div className="mt-auto pt-5 flex items-center justify-between">
                  <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
                    Register
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
