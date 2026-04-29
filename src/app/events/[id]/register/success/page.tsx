import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'
import { SuccessScreen } from '@/components/registration/success-screen'
import type { TeamMemberRow } from '@/components/registration/success-screen'

type Props = { params: Promise<{ id: string }> }

export default async function RegistrationSuccessPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  const { data: event } = await supabase
    .from('events')
    .select('id, name, date, location')
    .eq('id', id)
    .single()

  if (!event) notFound()

  let registration: { division: string; teamName: string | null; isTeam: boolean; regId: string } | null = null
  let teamMembers: TeamMemberRow[] = []

  if (user) {
    const { data: reg } = await supabase
      .from('registrations')
      .select('id, division, team_name, is_team')
      .eq('event_id', id)
      .eq('athlete_id', user.id)
      .order('registered_at', { ascending: false })
      .limit(1)
      .single()

    if (reg) {
      registration = {
        division:  reg.division,
        teamName:  reg.team_name,
        isTeam:    reg.is_team,
        regId:     reg.id,
      }

      if (reg.is_team) {
        const { data: members } = await supabase
          .from('team_members')
          .select('id, name, email, status')
          .eq('registration_id', reg.id)
          .order('invited_at')

        teamMembers = (members ?? []) as TeamMemberRow[]
      }
    }
  }

  return (
    <>
      <Navbar />
      <main>
        <SuccessScreen
          event={event}
          registration={registration}
          teamMembers={teamMembers}
        />
      </main>
    </>
  )
}
