import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CategoryManager } from '@/components/events/category-manager'
import type { CategoryRow } from '@/components/events/use-category-manager'

type Props = { params: Promise<{ id: string }> }

export default async function CategoriesPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: event } = await supabase
    .from('events')
    .select('id, categories(*, workouts(*))')
    .eq('id', id)
    .eq('organizer_id', user.id)
    .single()

  if (!event) notFound()

  const categories = ((event.categories ?? []) as CategoryRow[])
    .sort((a, b) => a.order_num - b.order_num)
    .map((cat) => ({
      ...cat,
      isEditing: false,
      isNew: false,
      workouts: (cat.workouts ?? [])
        .sort((a: { order_num: number }, b: { order_num: number }) => a.order_num - b.order_num)
        .map((w: object) => ({ ...w, isEditing: false, isNew: false })),
    }))

  return (
    <main className="max-w-3xl mx-auto px-page-x py-10">
      <header className="pb-8 mb-8 border-b border-border">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground mb-1">
          Event settings
        </p>
        <h1 className="text-2xl font-bold tracking-tight">Categories &amp; workouts</h1>
        <p className="mt-1.5 text-sm text-muted-foreground max-w-lg leading-relaxed">
          Categories are the divisions athletes register for. Workouts are what each division
          actually competes in — ordered top to bottom as they&apos;ll run on the day.
        </p>
      </header>

      <CategoryManager eventId={id} initial={categories as CategoryRow[]} />
    </main>
  )
}
