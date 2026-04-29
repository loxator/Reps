'use client'

import { Loader2 } from 'lucide-react'
import {
  useScoreManager, parseScore,
  type InitialScore, type RankedEntry,
} from './use-score-manager'
import type { ScoringType } from '@/types'

const SCORING_HINTS: Record<ScoringType, { placeholder: string; hint: string }> = {
  time:   { placeholder: '3:45',  hint: 'MM:SS — lower is better' },
  reps:   { placeholder: '42',    hint: 'reps — higher is better' },
  load:   { placeholder: '135',   hint: 'kg — higher is better' },
  rounds: { placeholder: '5+12',  hint: 'rounds+reps — higher is better' },
}

const SCORING_TYPE_LABEL: Record<ScoringType, string> = {
  time:   'For Time',
  reps:   'Max Reps',
  load:   'Max Load',
  rounds: 'AMRAP',
}

function RankBadge({ rank }: { rank: number | null }) {
  if (rank === null) return <span className="text-muted-foreground tabular-nums">—</span>
  if (rank === 1) return <span className="text-lg leading-none">🥇</span>
  if (rank === 2) return <span className="text-lg leading-none">🥈</span>
  if (rank === 3) return <span className="text-lg leading-none">🥉</span>
  return <span className="tabular-nums text-sm font-medium text-muted-foreground">#{rank}</span>
}

export type RegistrationSummary = {
  regId: string
  athleteName: string
  teamName: string | null
  isTeam: boolean
}

export function ScoreManager({
  workoutId,
  scoringType,
  registrations,
  initialScores,
}: {
  workoutId: string
  scoringType: ScoringType
  registrations: RegistrationSummary[]
  initialScores: InitialScore[]
}) {
  const { ranked, setInput, setNotes, saveScore, error, setError } =
    useScoreManager(workoutId, scoringType, registrations, initialScores)

  const { placeholder, hint } = SCORING_HINTS[scoringType]
  const scored = ranked.filter((e) => e.score !== null).length

  return (
    <div>
      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center justify-between gap-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-xs font-semibold shrink-0 hover:underline">
            Dismiss
          </button>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-6 mb-6">
        <div className="flex gap-8 tabular-nums">
          <div>
            <p className="text-2xl font-bold leading-none">{scored}</p>
            <p className="text-xs text-muted-foreground mt-1">Scored</p>
          </div>
          <div>
            <p className="text-2xl font-bold leading-none">{registrations.length - scored}</p>
            <p className="text-xs text-muted-foreground mt-1">Pending</p>
          </div>
        </div>
        <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
          {SCORING_TYPE_LABEL[scoringType]} · {hint}
        </span>
      </div>

      {registrations.length === 0 ? (
        <div className="py-16 text-center rounded-xl border border-dashed border-border">
          <p className="text-sm text-muted-foreground">No confirmed registrations in this category yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-widest">
                <th className="text-center px-4 py-3 w-14">Rank</th>
                <th className="text-left px-4 py-3">Athlete</th>
                <th className="text-left px-4 py-3 w-40">Score</th>
                <th className="text-left px-4 py-3">Notes</th>
                <th className="px-4 py-3 w-16" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {ranked.map((entry) => (
                <ScoreRow
                  key={entry.regId}
                  entry={entry}
                  placeholder={placeholder}
                  scoringType={scoringType}
                  onInputChange={(v) => setInput(entry.regId, v)}
                  onNotesChange={(v) => setNotes(entry.regId, v)}
                  onSave={() => saveScore(entry.regId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function ScoreRow({
  entry,
  placeholder,
  scoringType,
  onInputChange,
  onNotesChange,
  onSave,
}: {
  entry: RankedEntry
  placeholder: string
  scoringType: ScoringType
  onInputChange: (v: string) => void
  onNotesChange: (v: string) => void
  onSave: () => void
}) {
  const isInvalid =
    entry.inputRaw.trim() !== '' && parseScore(entry.inputRaw, scoringType) === null

  const isSaved =
    entry.score !== null &&
    !entry.saving &&
    parseScore(entry.inputRaw, scoringType) === entry.score

  return (
    <tr className="bg-card hover:bg-muted/20 transition-colors">
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

      <td className="px-4 py-3">
        <input
          type="text"
          value={entry.inputRaw}
          onChange={(e) => onInputChange(e.target.value)}
          onBlur={onSave}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.currentTarget.blur() } }}
          placeholder={placeholder}
          disabled={entry.saving}
          className={`w-full px-2.5 py-1.5 text-sm border rounded-lg bg-background focus:outline-none focus:ring-2 transition-colors ${
            isInvalid
              ? 'border-destructive focus:ring-destructive/50'
              : 'border-border focus:ring-primary/50'
          } disabled:opacity-50`}
        />
      </td>

      <td className="px-4 py-3">
        <input
          type="text"
          value={entry.notes}
          onChange={(e) => onNotesChange(e.target.value)}
          onBlur={onSave}
          placeholder="optional…"
          disabled={entry.saving}
          className="w-full px-2.5 py-1.5 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50"
        />
      </td>

      <td className="px-4 py-3 text-center">
        {entry.saving ? (
          <Loader2 className="size-4 animate-spin text-muted-foreground mx-auto" />
        ) : isSaved ? (
          <span className="text-xs font-medium text-success-600">✓</span>
        ) : null}
      </td>
    </tr>
  )
}
