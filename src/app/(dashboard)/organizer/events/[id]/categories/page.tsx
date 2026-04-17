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
      isNew:     false,
      workouts:  (cat.workouts ?? [])
        .sort((a: { order_num: number }, b: { order_num: number }) => a.order_num - b.order_num)
        .map((w: object) => ({ ...w, isEditing: false, isNew: false })),
    }))

  return (
    <main className="max-w-3xl mx-auto px-page-x py-10">
      <h1 className="text-xl font-semibold mb-2">Categories & Workouts</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Define the divisions athletes register for, and the workouts they&apos;ll compete in.
      </p>
      <CategoryManager eventId={id} initial={categories} />
    </main>
  )
}
