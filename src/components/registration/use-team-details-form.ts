'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { Category } from '@/types'

export type MemberStatus = 'idle' | 'checking' | 'found' | 'not-found'

export type MemberState = {
  name:   string
  email:  string
  status: MemberStatus
  userId: string | null
}

function emptyMember(): MemberState {
  return { name: '', email: '', status: 'idle', userId: null }
}

export function useTeamDetailsForm(
  eventId: string,
  athleteId: string,
  category: Category,
) {
  const isTeam      = category.type === 'team'
  const teamSize    = isTeam ? Math.max(1, category.team_size ?? 1) : 1
  const inviteCount = Math.max(0, teamSize - 1)

  const [teamName, setTeamName] = useState('')
  const [members,  setMembers]  = useState<MemberState[]>(() =>
    Array.from({ length: inviteCount }, emptyMember)
  )
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  const updateMember = useCallback((i: number, patch: Partial<MemberState>) => {
    setMembers((prev) => prev.map((m, idx) => (idx === i ? { ...m, ...patch } : m)))
  }, [])

  async function checkEmail(i: number, email: string) {
    const trimmed = email.trim()
    if (!trimmed) return

    updateMember(i, { status: 'checking' })

    const { data } = await supabase.rpc('get_user_by_email', { email_to_check: trimmed })

    if (data) {
      setMembers((prev) =>
        prev.map((m, idx) => {
          if (idx !== i) return m
          return {
            ...m,
            status: 'found',
            userId: data.id,
            name:   data.name,   // always use the name from their account
          }
        })
      )
    } else {
      updateMember(i, { status: 'not-found', userId: null })
    }
  }

  const allMembersComplete =
    inviteCount === 0 ||
    members.every((m) => m.name.trim() && m.email.trim())

  const canSubmit = !loading && allMembersComplete

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: reg, error: regErr } = await supabase
      .from('registrations')
      .insert({
        athlete_id:  athleteId,
        event_id:    eventId,
        category_id: category.id,
        division:    category.name,
        team_name:   isTeam ? (teamName.trim() || null) : null,
        is_team:     isTeam,
        status:      'confirmed',
      })
      .select('id')
      .single()

    if (regErr) {
      setError(
        regErr.code === '23505' || regErr.message.includes('category_full')
          ? regErr.message.includes('category_full')
            ? 'This category is full.'
            : `You're already registered for this category.`
          : regErr.message
      )
      setLoading(false)
      return
    }

    if (isTeam && members.length > 0) {
      const inserts = members.map((m) => ({
        registration_id: reg.id,
        name:    m.name.trim(),
        email:   m.email.trim(),
        user_id: m.userId ?? null,
        status:  'invited',
      }))

      const { error: memberErr } = await supabase.from('team_members').insert(inserts)

      if (memberErr) {
        setError(memberErr.message)
        setLoading(false)
        return
      }

      // Invite new members (no existing account) via Supabase auth invite.
      // Existing members see the invite on their dashboard — no email needed.
      const newEmails = members
        .filter((m) => m.status === 'not-found' && m.email.trim())
        .map((m) => m.email.trim())

      if (newEmails.length > 0) {
        fetch('/api/invite', {
          method:  'POST',
          headers: { 'Content-Type': 'application/json' },
          body:    JSON.stringify({
            emails:     newEmails,
            redirectTo: `${window.location.origin}/athlete`,
          }),
        }).catch(() => {/* best-effort */})
      }
    }

    router.push(`/events/${eventId}/register/success`)
  }

  return {
    isTeam,
    teamSize,
    inviteCount,
    teamName,
    setTeamName,
    members,
    updateMember,
    checkEmail,
    canSubmit,
    loading,
    error,
    handleSubmit,
  }
}
