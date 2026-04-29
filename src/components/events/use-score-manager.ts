'use client'

import { useState, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ScoringType } from '@/types'

export type ScoreEntry = {
  regId: string
  athleteName: string
  teamName: string | null
  isTeam: boolean
  score: number | null
  notes: string
  saving: boolean
  inputRaw: string
}

export type RankedEntry = ScoreEntry & { rank: number | null }

// Rounds stored as rounds*1000+reps (e.g. 5 rounds 12 reps = 5012)
export function parseScore(raw: string, type: ScoringType): number | null {
  const s = raw.trim()
  if (!s) return null

  if (type === 'time') {
    if (s.includes(':')) {
      const parts = s.split(':').map(Number)
      if (parts.some(isNaN)) return null
      if (parts.length === 2) return parts[0] * 60 + parts[1]
      if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2]
      return null
    }
    const n = Number(s)
    return isNaN(n) ? null : n
  }

  if (type === 'rounds') {
    if (s.includes('+')) {
      const [r, reps] = s.split('+').map((x) => Number(x.trim()))
      if (isNaN(r) || isNaN(reps)) return null
      return r * 1000 + reps
    }
    const n = Number(s)
    return isNaN(n) ? null : n * 1000
  }

  const n = Number(s)
  return isNaN(n) ? null : n
}

// Canonical input representation of a stored score
export function formatScore(value: number, type: ScoringType): string {
  if (type === 'time') {
    const total = Math.round(value)
    const h = Math.floor(total / 3600)
    const m = Math.floor((total % 3600) / 60)
    const s = total % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  if (type === 'rounds') {
    const r = Math.floor(value / 1000)
    const reps = Math.round(value % 1000)
    return reps > 0 ? `${r}+${reps}` : `${r}`
  }
  return String(value)
}

// Human-readable display (for leaderboard)
export function displayScore(value: number, type: ScoringType): string {
  if (type === 'time') return formatScore(value, type)
  if (type === 'rounds') {
    const r = Math.floor(value / 1000)
    const reps = Math.round(value % 1000)
    return reps > 0 ? `${r} rounds + ${reps} reps` : `${r} rounds`
  }
  if (type === 'reps') return `${value} reps`
  if (type === 'load') return `${value} kg`
  return String(value)
}

export function isLowerBetter(type: ScoringType) {
  return type === 'time'
}

export function rankEntries(entries: ScoreEntry[], type: ScoringType): RankedEntry[] {
  const scored = entries.filter((e) => e.score !== null)
  const unscored = entries.filter((e) => e.score === null)

  scored.sort((a, b) =>
    isLowerBetter(type)
      ? (a.score ?? 0) - (b.score ?? 0)
      : (b.score ?? 0) - (a.score ?? 0)
  )

  const ranked: RankedEntry[] = []
  let rank = 1
  for (let i = 0; i < scored.length; i++) {
    if (i > 0 && scored[i].score !== scored[i - 1].score) rank = i + 1
    ranked.push({ ...scored[i], rank })
  }

  return [...ranked, ...unscored.map((e) => ({ ...e, rank: null }))]
}

export type InitialScore = {
  regId: string
  value: number | null
  notes: string
}

type RegistrationSummary = {
  regId: string
  athleteName: string
  teamName: string | null
  isTeam: boolean
}

export function useScoreManager(
  workoutId: string,
  scoringType: ScoringType,
  registrations: RegistrationSummary[],
  initialScores: InitialScore[],
) {
  const scoreMap = new Map(initialScores.map((s) => [s.regId, s]))

  const [entries, setEntries] = useState<ScoreEntry[]>(() =>
    registrations.map((r) => {
      const s = scoreMap.get(r.regId)
      const value = s?.value ?? null
      return {
        ...r,
        score: value,
        notes: s?.notes ?? '',
        saving: false,
        inputRaw: value !== null ? formatScore(value, scoringType) : '',
      }
    })
  )

  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  function setInput(regId: string, raw: string) {
    setEntries((prev) =>
      prev.map((e) => (e.regId === regId ? { ...e, inputRaw: raw } : e))
    )
  }

  function setNotes(regId: string, notes: string) {
    setEntries((prev) =>
      prev.map((e) => (e.regId === regId ? { ...e, notes } : e))
    )
  }

  async function saveScore(regId: string) {
    const entry = entries.find((e) => e.regId === regId)
    if (!entry) return

    const value = parseScore(entry.inputRaw, scoringType)

    setEntries((prev) =>
      prev.map((e) => (e.regId === regId ? { ...e, saving: true } : e))
    )
    setError(null)

    if (value === null) {
      if (entry.inputRaw.trim() !== '') {
        // Invalid input — don't persist
        setEntries((prev) =>
          prev.map((e) => (e.regId === regId ? { ...e, saving: false } : e))
        )
        return
      }
      // Empty input — delete existing score
      const { error: err } = await supabase
        .from('workout_scores')
        .delete()
        .eq('registration_id', regId)
        .eq('workout_id', workoutId)

      if (err) setError(err.message)
      setEntries((prev) =>
        prev.map((e) =>
          e.regId === regId ? { ...e, score: null, saving: false } : e
        )
      )
      return
    }

    const { error: err } = await supabase.from('workout_scores').upsert(
      {
        registration_id: regId,
        workout_id: workoutId,
        score_value: value,
        notes: entry.notes || null,
      },
      { onConflict: 'registration_id,workout_id' }
    )

    if (err) {
      setError(err.message)
      setEntries((prev) =>
        prev.map((e) => (e.regId === regId ? { ...e, saving: false } : e))
      )
      return
    }

    setEntries((prev) =>
      prev.map((e) =>
        e.regId === regId
          ? { ...e, score: value, saving: false, inputRaw: formatScore(value, scoringType) }
          : e
      )
    )
  }

  const ranked = useMemo(() => rankEntries(entries, scoringType), [entries, scoringType])

  return { ranked, setInput, setNotes, saveScore, error, setError }
}
