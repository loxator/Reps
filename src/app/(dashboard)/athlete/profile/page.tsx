import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileSetupForm } from '@/components/athlete/profile-setup-form'
import type { AthleteProfile, User } from '@/types'

export default async function AthleteProfilePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('athlete_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // If all three fields are already set, profile is complete
  if (profile?.date_of_birth && profile?.gender && profile?.location) {
    redirect('/events')
  }

  const { data: userData } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  return (
    <ProfileSetupForm
      userId={user.id}
      userName={(userData as Pick<User, 'name'>)?.name ?? 'Athlete'}
      initialProfile={profile as AthleteProfile | null}
    />
  )
}
