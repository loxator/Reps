import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Settings, LayoutList, Users, Flame, BarChart2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import type { EventStatus } from '@/types'

type Props = {
  children: React.ReactNode
  params:   Promise<{ id: string }>
}

const statusLabel: Record<EventStatus, string> = {
  draft:  'Draft',
  open:   'Open',
  closed: 'Closed',
}

export default async function OrganizerEventLayout({ children, params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'organizer') redirect('/athlete')

  const { data: event } = await supabase
    .from('events')
    .select('id, name, status, categories(id, name, workouts(id, name, order_num))')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (!event) notFound()

  type WorkoutLink = { id: string; name: string; order_num: number }
  type CategoryLink = { id: string; name: string; workouts: WorkoutLink[] }

  const categories = (event.categories ?? []) as CategoryLink[]
  const allWorkouts = categories.flatMap((c) =>
    (c.workouts ?? []).map((w) => ({ ...w, categoryName: c.name }))
  ).sort((a, b) => a.order_num - b.order_num)

  const base = `/organizer/events/${id}`

  return (
    <div className="flex min-h-screen pt-14">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-border bg-background/60 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto p-4 hidden md:block">
        <Link href="/organizer" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-5">
          <ArrowLeft className="size-3.5" />
          All events
        </Link>

        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1 px-2">
          {event.name}
        </p>
        <Badge variant={event.status as EventStatus} className="ml-2 mb-4 text-xs">
          {statusLabel[event.status as EventStatus]}
        </Badge>

        <nav className="flex flex-col gap-0.5">
          <SidebarLink href={base} icon={Settings} label="Overview" />
          <SidebarLink href={`${base}/categories`} icon={LayoutList} label="Categories & Workouts" />
          <SidebarLink href={`${base}/registrations`} icon={Users} label="Registrations" />

          {allWorkouts.length > 0 && (
            <>
              <p className="text-xs text-muted-foreground uppercase tracking-widest px-2 pt-4 pb-1">
                Heats
              </p>
              {allWorkouts.map((w) => (
                <SidebarLink
                  key={w.id}
                  href={`${base}/heats/${w.id}`}
                  icon={Flame}
                  label={w.name}
                />
              ))}

              <p className="text-xs text-muted-foreground uppercase tracking-widest px-2 pt-4 pb-1">
                Scores
              </p>
              {allWorkouts.map((w) => (
                <SidebarLink
                  key={`scores-${w.id}`}
                  href={`${base}/scores/${w.id}`}
                  icon={BarChart2}
                  label={w.name}
                />
              ))}
            </>
          )}
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  )
}

function SidebarLink({
  href, icon: Icon, label,
}: {
  href:  string
  icon:  React.ElementType
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      <Icon className="size-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )
}
