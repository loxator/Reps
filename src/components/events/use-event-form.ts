'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useEventForm(organizerId: string) {
  const [name,        setName]        = useState('')
  const [location,    setLocation]    = useState('')
  const [date,        setDate]        = useState('')
  const [description, setDescription] = useState('')
  const [capacity,    setCapacity]    = useState('0')
  const [status,      setStatus]      = useState<'draft' | 'open' | 'closed'>('draft')
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const router   = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data, error: err } = await supabase
      .from('events')
      .insert({
        organizer_id: organizerId,
        name:         name.trim(),
        location:     location.trim(),
        date,
        description:  description.trim() || null,
        capacity:     parseInt(capacity) || 0,
        status,
      })
      .select('id')
      .single()

    if (err) {
      setError(err.message)
      setSaving(false)
      return
    }

    router.push(`/organizer/events/${data.id}`)
  }

  return {
    name, setName,
    location, setLocation,
    date, setDate,
    description, setDescription,
    capacity, setCapacity,
    status, setStatus,
    saving, error,
    handleSubmit,
  }
}
