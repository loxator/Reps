'use client'

import Link from 'next/link'
import { ArrowRight, MapPin } from 'lucide-react'
import { useProfileSetupForm, GENDER_OPTIONS } from './use-profile-setup-form'
import type { AthleteProfile } from '@/types'

type Props = {
  userId:         string
  userName:       string
  initialProfile: Partial<AthleteProfile> | null
}

const inputClass =
  'w-full border border-input rounded-lg px-3.5 py-3 text-sm bg-background ' +
  'placeholder:text-muted-foreground/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring ' +
  'transition-[border-color,box-shadow] duration-200'

export function ProfileSetupForm({ userId, userName, initialProfile }: Props) {
  const {
    dob, setDob,
    gender, setGender,
    location, setLocation,
    error, loading,
    handleSubmit,
  } = useProfileSetupForm(userId, initialProfile)

  const firstName = userName.split(' ')[0]

  return (
    <div className="min-h-[100svh] grid md:grid-cols-2">

      {/* ── Left: graphic panel ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col items-center justify-center bg-muted/40 border-r border-border p-14">
        <div className="max-w-xs text-center">
          <div className="size-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-8">
            <MapPin className="size-7 text-background" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Quick setup
          </p>
          <p className="text-xl font-bold leading-snug mb-3">
            Help us put the right events in front of you.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Three fields. That&apos;s all we need to surface competitions near you and in the right division.
          </p>
        </div>
      </aside>

      {/* ── Right: form ──────────────────────────────────────────────── */}
      <section className="flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-sm">

          <Link href="/" className="md:hidden inline-block mb-10 text-base font-bold tracking-tight">
            reps<span className="text-primary">.</span>
          </Link>

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Profile setup
          </p>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome, {firstName}.
          </h1>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Tell us a little about yourself to get started.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium block mb-2">
                Date of birth
              </label>
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
              <label className="text-sm font-medium block mb-2">
                Gender
              </label>
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
              <label className="text-sm font-medium block mb-2">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                placeholder="City, Country"
                className={inputClass}
              />
              <p className="text-xs text-muted-foreground mt-1.5">
                Used to surface competitions nearby.
              </p>
            </div>

            {error && (
              <p className="text-destructive text-sm rounded-lg bg-danger-50 px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full inline-flex items-center justify-center gap-2 rounded-full bg-foreground text-background
                         px-5 py-3 text-sm font-semibold
                         hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none
                         transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              {loading ? 'Saving…' : 'Save and browse events'}
              {!loading && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-3" strokeWidth={2} />
                </span>
              )}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
