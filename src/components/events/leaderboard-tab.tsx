'use client'

import { displayScore } from './use-score-manager'
import { useLeaderboardTab } from './use-leaderboard-tab'
import type { ScoringType } from '@/types'

export type LeaderboardWorkout = {
  id: string
  name: string
  orderNum: number
  scoringType: ScoringType
  entries: {
    regId: string
    athleteName: string
    teamName: string | null
    isTeam: boolean
    score: number
    rank: number
  }[]
}

export type LeaderboardCategory = {
  id: string
  name: string
  orderNum: number
  workouts: LeaderboardWorkout[]
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <span className="text-lg leading-none">🥇</span>
  if (rank === 2) return <span className="text-lg leading-none">🥈</span>
  if (rank === 3) return <span className="text-lg leading-none">🥉</span>
  return <span className="tabular-nums text-sm text-muted-foreground font-medium">#{rank}</span>
}

export function LeaderboardTab({ categories }: { categories: LeaderboardCategory[] }) {
  const {
    activeCatId,
    activeWorkoutId,
    setActiveWorkoutId,
    workouts,
    activeWorkout,
    hasAnyScores,
    switchCat,
  } = useLeaderboardTab(categories)

  if (categories.length === 0 || !hasAnyScores) {
    return (
      <div className="py-20 text-center">
        <p className="font-semibold">No results yet.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Scores will appear here once the organiser enters them.
        </p>
      </div>
    )
  }

  const effectiveWorkoutId =
    activeWorkoutId && workouts.some((w) => w.id === activeWorkoutId)
      ? activeWorkoutId
      : workouts[0]?.id ?? ''

  return (
    <div>
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => switchCat(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                cat.id === activeCatId
                  ? 'bg-foreground text-background'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {workouts.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          {workouts.map((w) => (
            <button
              key={w.id}
              onClick={() => setActiveWorkoutId(w.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                w.id === effectiveWorkoutId
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {w.name}
            </button>
          ))}
        </div>
      )}

      {activeWorkout ? (
        <WorkoutLeaderboard workout={activeWorkout} />
      ) : (
        <div className="py-16 text-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No workouts in this category yet.</p>
        </div>
      )}
    </div>
  )
}

function WorkoutLeaderboard({ workout }: { workout: LeaderboardWorkout }) {
  if (workout.entries.length === 0) {
    return (
      <div className="py-16 text-center rounded-xl border border-dashed border-border">
        <p className="text-sm font-medium">No scores recorded yet for {workout.name}.</p>
        <p className="mt-1 text-xs text-muted-foreground">Check back after the event.</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-widest">
            <th className="text-center px-4 py-3 w-14">Rank</th>
            <th className="text-left px-4 py-3">Athlete</th>
            <th className="text-right px-4 py-3">Score</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {workout.entries.map((entry) => (
            <tr key={entry.regId} className="bg-card hover:bg-muted/20 transition-colors">
              <td className="px-4 py-3 text-center">
                <RankBadge rank={entry.rank} />
              </td>
              <td className="px-4 py-3">
                <p className="font-medium">
                  {entry.isTeam ? (entry.teamName ?? entry.athleteName) : entry.athleteName}
                </p>
                {entry.isTeam && entry.teamName && (
                  <p className="text-xs text-muted-foreground">Cap: {entry.athleteName}</p>
                )}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-medium">
                {displayScore(entry.score, workout.scoringType)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
