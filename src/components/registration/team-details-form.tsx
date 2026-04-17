'use client'

import { ArrowLeft, User, Users, Check, AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useTeamDetailsForm, type MemberState, type MemberStatus } from './use-team-details-form'
import type { Category } from '@/types'

type Props = {
  eventId:   string
  athleteId: string
  category:  Category
  onBack?:   () => void
}

export function RegistrationDetailsForm({ eventId, athleteId, category, onBack }: Props) {
  const {
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
  } = useTeamDetailsForm(eventId, athleteId, category)

  const inputClass =
    'w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="size-4" />
          Back to categories
        </button>
      )}

      {/* Category summary */}
      <div className="flex items-center gap-3 rounded-xl border border-border p-card mb-8 shadow-card">
        <div className="flex items-center justify-center size-10 rounded-lg bg-muted shrink-0">
          {isTeam
            ? <Users className="size-5 text-foreground" />
            : <User  className="size-5 text-foreground" />}
        </div>
        <div>
          <p className="font-semibold">{category.name}</p>
          <p className="text-sm text-muted-foreground">
            {isTeam ? `Team event · ${teamSize} members per team` : 'Individual event'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {isTeam ? (
          <>
            <div>
              <label className="text-sm text-muted-foreground block mb-1.5">
                Team name <span className="text-xs">(optional)</span>
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="e.g. Desert Wolves"
                className={inputClass}
              />
            </div>

            {members.map((member, i) => (
              <MemberBlock
                key={i}
                index={i}
                member={member}
                inputClass={inputClass}
                onChange={(patch) => updateMember(i, patch)}
                onEmailBlur={() => checkEmail(i, member.email)}
              />
            ))}

            {inviteCount > 0 && (
              <p className="text-xs text-muted-foreground -mt-1">
                {members.filter((m) => m.name.trim() && m.email.trim()).length} of {inviteCount}{' '}
                team {inviteCount !== 1 ? 'members' : 'member'} added
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-muted-foreground">
            You&apos;re registering as an individual. Hit confirm to secure your spot.
          </p>
        )}

        {error && <p className="text-destructive text-sm">{error}</p>}

        <Button type="submit" disabled={!canSubmit} size="lg" className="w-full">
          {loading ? 'Registering…' : 'Confirm registration'}
        </Button>
      </form>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MemberBlock({
  index,
  member,
  inputClass,
  onChange,
  onEmailBlur,
}: {
  index:       number
  member:      MemberState
  inputClass:  string
  onChange:    (patch: Partial<MemberState>) => void
  onEmailBlur: () => void
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border p-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium">Team member {index + 2}</p>
        <StatusPill status={member.status} />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
        <input
          type="email"
          value={member.email}
          onChange={(e) => onChange({ email: e.target.value, status: 'idle', userId: null })}
          onBlur={onEmailBlur}
          placeholder="teammate@example.com"
          className={inputClass}
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Full name</label>
        <input
          type="text"
          value={member.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder="Full name"
          className={inputClass}
        />
      </div>

      {member.status === 'not-found' && (
        <p className="text-xs text-muted-foreground -mt-1">
          They don&apos;t have a reps account yet. We&apos;ll prompt them to sign up and accept your invite.
        </p>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: MemberStatus }) {
  if (status === 'idle') return null

  if (status === 'checking') {
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Loader2 className="size-3 animate-spin" />
        Checking…
      </span>
    )
  }

  if (status === 'found') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-success-100 text-success-700">
        <Check className="size-3" />
        Has an account
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium bg-warning-100 text-warning-700">
      <AlertCircle className="size-3" />
      New to reps
    </span>
  )
}
