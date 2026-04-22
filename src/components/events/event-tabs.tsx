import Link from 'next/link'
import { cn } from '@/lib/utils'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'workouts', label: 'Workouts' },
  { key: 'schedule', label: 'Schedule' },
]

export function EventTabs({ eventId, activeTab }: { eventId: string; activeTab: string }) {
  const base = `/events/${eventId}`

  return (
    <div className="sticky top-14 z-20 -mx-page-x px-page-x py-2.5 bg-background/80 backdrop-blur-xl border-b border-border">
      <nav className="flex gap-1 max-w-4xl">
        {TABS.map((tab) => {
          const href = tab.key === 'overview' ? base : `${base}?tab=${tab.key}`
          const isActive = activeTab === tab.key
          return (
            <Link
              key={tab.key}
              href={href}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]',
                isActive
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted',
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
