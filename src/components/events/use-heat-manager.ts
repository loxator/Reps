'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'

export type RegSummary = {
  id: string
  athleteName: string
  teamName: string | null
  isTeam: boolean
}

export type HeatRow = {
  id: string
  name: string
  start_time: string | null
  capacity: number
  order_num: number
  assignedIds: string[]  // registration IDs assigned to this heat
  saving: boolean
}

export function useHeatManager(
  workoutId: string,
  initialHeats: HeatRow[],
  allRegistrations: RegSummary[],
) {
  const [heats,   setHeats]   = useState<HeatRow[]>(initialHeats)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const supabase = createClient()

  // Derived: registrations not in any heat
  const assignedAll = useMemo(
    () => new Set(heats.flatMap((h) => h.assignedIds)),
    [heats],
  )
  const unassigned = useMemo(
    () => allRegistrations.filter((r) => !assignedAll.has(r.id)),
    [allRegistrations, assignedAll],
  )

  // ── Heat CRUD ──────────────────────────────────────────────────────────────

  async function addHeat() {
    setSaving(true)
    setError(null)
    const nextNum = heats.length + 1
    const { data, error: err } = await supabase
      .from('heats')
      .insert({
        workout_id: workoutId,
        name:       `Heat ${nextNum}`,
        order_num:  nextNum,
        capacity:   0,
      })
      .select('*')
      .single()

    if (err) { setError(err.message); setSaving(false); return }

    setHeats((prev) => [...prev, { ...data, assignedIds: [], saving: false }])
    setSaving(false)
  }

  async function removeHeat(heatId: string) {
    setHeats((h) => h.map((x) => (x.id === heatId ? { ...x, saving: true } : x)))
    const { error: err } = await supabase.from('heats').delete().eq('id', heatId)
    if (err) {
      setError(err.message)
      setHeats((h) => h.map((x) => (x.id === heatId ? { ...x, saving: false } : x)))
      return
    }
    setHeats((prev) => prev.filter((h) => h.id !== heatId))
  }

  async function updateHeat(heatId: string, patch: Partial<Pick<HeatRow, 'name' | 'start_time' | 'capacity'>>) {
    setHeats((h) => h.map((x) => (x.id === heatId ? { ...x, ...patch } : x)))
    const { error: err } = await supabase.from('heats').update(patch).eq('id', heatId)
    if (err) setError(err.message)
  }

  // ── Assignment CRUD ────────────────────────────────────────────────────────

  async function assign(regId: string, toHeatId: string) {
    // Optimistic: move reg into heat immediately
    setHeats((prev) =>
      prev.map((h) =>
        h.id === toHeatId ? { ...h, assignedIds: [...h.assignedIds, regId] } : h,
      ),
    )

    const { error: err } = await supabase
      .from('heat_assignments')
      .insert({ heat_id: toHeatId, registration_id: regId })

    if (err) {
      // Rollback
      setHeats((prev) =>
        prev.map((h) =>
          h.id === toHeatId
            ? { ...h, assignedIds: h.assignedIds.filter((id) => id !== regId) }
            : h,
        ),
      )
      setError(err.message)
    }
  }

  async function unassign(regId: string, fromHeatId: string) {
    // Optimistic: remove from heat
    setHeats((prev) =>
      prev.map((h) =>
        h.id === fromHeatId
          ? { ...h, assignedIds: h.assignedIds.filter((id) => id !== regId) }
          : h,
      ),
    )

    const { error: err } = await supabase
      .from('heat_assignments')
      .delete()
      .eq('heat_id', fromHeatId)
      .eq('registration_id', regId)

    if (err) {
      // Rollback
      setHeats((prev) =>
        prev.map((h) =>
          h.id === fromHeatId
            ? { ...h, assignedIds: [...h.assignedIds, regId] }
            : h,
        ),
      )
      setError(err.message)
    }
  }

  return {
    heats, unassigned,
    saving, error, setError,
    addHeat, removeHeat, updateHeat,
    assign, unassign,
  }
}
