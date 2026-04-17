import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EventCreateForm } from '@/components/events/event-form'

export default async function NewEventPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  if (user.user_metadata?.role !== 'organizer') redirect('/athlete')

  return (
    <main className="max-w-2xl mx-auto px-page-x pt-28 pb-section">
      <h1 className="text-2xl font-semibold mb-2">New event</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Fill in the details below. You can add categories and workouts after saving.
      </p>
      <EventCreateForm organizerId={user.id} />
    </main>
  )
}
