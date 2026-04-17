'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export type RegistrationRow = {
  id: string
  division: string
  team_name: string | null
  is_team: boolean
  status: 'confirmed' | 'waitlist'
  registered_at: string
  checked_in: boolean
  athlete: { id: string; name: string; email: string } | null
  category: { id: string; name: string } | null
  heat_assignments: {
    heats: {
      name: string
      start_time: string | null
      workouts: { name: string; order_num: number } | null
    } | null
  }[]
}

export function useRegistrationList(initial: RegistrationRow[]) {
  const [registrations, setRegistrations] = useState(initial)
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [search,         setSearch]         = useState('')
  const [toggling,       setToggling]       = useState<string | null>(null)

  const supabase = createClient()

  const filtered = useMemo(() => {
    let rows = registrations
    if (filterCategory !== 'all') {
      rows = rows.filter((r) => r.category?.id === filterCategory)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      rows = rows.filter(
        (r) =>
          r.athlete?.name.toLowerCase().includes(q) ||
          r.athlete?.email.toLowerCase().includes(q) ||
          r.team_name?.toLowerCase().includes(q),
      )
    }
    return rows
  }, [registrations, filterCategory, search])

  async function toggleCheckedIn(regId: string, current: boolean) {
    setToggling(regId)
    const now = new Date().toISOString()
    const patch = current
      ? { checked_in: false, checked_in_at: null }
      : { checked_in: true,  checked_in_at: now }

    const { error } = await supabase
      .from('registrations')
      .update(patch)
      .eq('id', regId)

    if (!error) {
      setRegistrations((prev) =>
        prev.map((r) =>
          r.id === regId ? { ...r, ...patch } : r,
        ),
      )
    }
    setToggling(null)
  }

  return {
    filtered,
    filterCategory, setFilterCategory,
    search, setSearch,
    toggleCheckedIn, toggling,
  }
}
