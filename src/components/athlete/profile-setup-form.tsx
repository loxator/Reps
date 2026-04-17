'use client'

import { Button } from '@/components/ui/button'
import { useProfileSetupForm, GENDER_OPTIONS } from './use-profile-setup-form'
import type { AthleteProfile } from '@/types'

type Props = {
  userId:         string
  userName:       string
  initialProfile: Partial<AthleteProfile> | null
}

export function ProfileSetupForm({ userId, userName, initialProfile }: Props) {
  const {
    dob, setDob,
    gender, setGender,
    location, setLocation,
    error, loading,
    handleSubmit,
  } = useProfileSetupForm(userId, initialProfile)

  const inputClass =
    'w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium mb-1">
          Welcome, {userName.split(' ')[0]}
        </h1>
        <p className="text-muted-foreground text-sm mb-8">
          Tell us a little about yourself to get started.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Date of birth</label>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]}
              className={inputClass}
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              required
              className={inputClass}
            >
              <option value="" disabled>Select…</option>
              {GENDER_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="City, Country"
              className={inputClass}
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Saving…' : 'Save and browse events'}
          </Button>
        </form>
      </div>
    </div>
  )
}
