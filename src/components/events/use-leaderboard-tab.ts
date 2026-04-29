'use client'

import { useState } from 'react'
import type { LeaderboardCategory } from './leaderboard-tab'

export function useLeaderboardTab(categories: LeaderboardCategory[]) {
  const [activeCatId,     setActiveCatId]     = useState(categories[0]?.id ?? '')
  const [activeWorkoutId, setActiveWorkoutId] = useState('')

  const activeCat = categories.find((c) => c.id === activeCatId)
  const workouts  = activeCat?.workouts ?? []

  const effectiveWorkoutId =
    activeWorkoutId && workouts.some((w) => w.id === activeWorkoutId)
      ? activeWorkoutId
      : workouts[0]?.id ?? ''

  const activeWorkout  = workouts.find((w) => w.id === effectiveWorkoutId)
  const hasAnyScores   = categories.some((c) => c.workouts.some((w) => w.entries.length > 0))

  function switchCat(id: string) {
    setActiveCatId(id)
    setActiveWorkoutId('')
  }

  return {
    activeCatId,
    activeWorkoutId,
    setActiveWorkoutId,
    workouts,
    activeWorkout,
    hasAnyScores,
    switchCat,
  }
}
