import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'overview',  label: 'Overview'  },
  { key: 'workouts',  label: 'Workouts'  },
  { key: 'schedule',  label: 'Schedule'  },
]

export function EventTabs({ eventId, activeTab }: { eventId: string; activeTab: string }) {
  const base = `/events/${eventId}`

  return (
    <div className="sticky top-14 z-20 bg-background border-b border-border -mx-page-x px-page-x mt-6">
      <nav className="flex max-w-4xl">
        {TABS.map((tab) => {
          const href = tab.key === 'overview' ? base : `${base}?tab=${tab.key}`
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                'px-4 py-3.5 text-sm font-medium border-b-2 -mb-px transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
              )}
            >
              {tab.label}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
