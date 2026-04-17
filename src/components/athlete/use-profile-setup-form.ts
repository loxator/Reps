'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import type { AthleteProfile } from '@/types'

export const GENDER_OPTIONS = [
  { value: 'male',              label: 'Male' },
  { value: 'female',            label: 'Female' },
  { value: 'non-binary',        label: 'Non-binary' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

export function useProfileSetupForm(
  userId: string,
  initialProfile: Partial<AthleteProfile> | null,
) {
  const [dob,      setDob]      = useState(initialProfile?.date_of_birth ?? '')
  const [gender,   setGender]   = useState(initialProfile?.gender ?? '')
  const [location, setLocation] = useState(initialProfile?.location ?? '')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)

  const router   = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error } = await supabase
      .from('athlete_profiles')
      .upsert({
        user_id:       userId,
        date_of_birth: dob      || null,
        gender:        gender   || null,
        location:      location || null,
      }, { onConflict: 'user_id' })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/events')
  }

  return { dob, setDob, gender, setGender, location, setLocation, error, loading, handleSubmit }
}
