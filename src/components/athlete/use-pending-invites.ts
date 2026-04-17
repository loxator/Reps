'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export type Invite = {
  id: string
  name: string
  email: string
  status: string
  registration_id: string
  registrations: {
    id: string
    division: string
    team_name: string | null
    events: {
      id: string
      name: string
      date: string
      location: string
    } | null
  } | null
}

export function usePendingInvites(initial: Invite[]) {
  const [invites,    setInvites]    = useState(initial)
  const [processing, setProcessing] = useState<string | null>(null)

  const supabase = createClient()

  async function respond(inviteId: string, accept: boolean) {
    setProcessing(inviteId)

    await supabase
      .from('team_members')
      .update({ status: accept ? 'accepted' : 'declined' })
      .eq('id', inviteId)

    setInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
    setProcessing(null)
  }

  return { invites, processing, respond }
}
