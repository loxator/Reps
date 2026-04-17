'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Event, EventStatus } from '@/types'

type EditableEvent = Pick<Event, 'id' | 'name' | 'location' | 'date' | 'description' | 'status' | 'capacity'>

export function useEventOverviewForm(initial: EditableEvent) {
  const [name,        setName]        = useState(initial.name)
  const [location,    setLocation]    = useState(initial.location)
  const [date,        setDate]        = useState(initial.date)
  const [description, setDescription] = useState(initial.description ?? '')
  const [capacity,    setCapacity]    = useState(String(initial.capacity))
  const [status,      setStatus]      = useState<EventStatus>(initial.status)
  const [saving,      setSaving]      = useState(false)
  const [error,       setError]       = useState<string | null>(null)
  const [saved,       setSaved]       = useState(false)

  const supabase = createClient()

  const isDirty =
    name !== initial.name ||
    location !== initial.location ||
    date !== initial.date ||
    description !== (initial.description ?? '') ||
    capacity !== String(initial.capacity) ||
    status !== initial.status

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSaved(false)

    const { error: err } = await supabase
      .from('events')
      .update({
        name:        name.trim(),
        location:    location.trim(),
        date,
        description: description.trim() || null,
        capacity:    parseInt(capacity) || 0,
        status,
      })
      .eq('id', initial.id)

    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
    setSaving(false)
  }

  return {
    name, setName,
    location, setLocation,
    date, setDate,
    description, setDescription,
    capacity, setCapacity,
    status, setStatus,
    isDirty, saving, saved, error,
    handleSave,
  }
}
