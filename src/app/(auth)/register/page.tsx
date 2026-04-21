'use client'

import Link from 'next/link'
import type { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { useRegister } from './use-register'

const inputClass =
  'w-full border border-input rounded-md px-3 py-2.5 text-sm bg-background ' +
  'placeholder:text-muted-foreground/60 ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring ' +
  'transition-[border-color,box-shadow]'

const roleCopy: Record<UserRole, { title: string; body: string }> = {
  athlete:   { title: 'Athlete',   body: 'I want to find and register for competitions.' },
  organizer: { title: 'Organiser', body: 'I want to host my own competition.' },
}

export default function RegisterPage() {
  const {
    name, setName,
    email, setEmail,
    password, setPassword,
    role, setRole,
    error, loading,
    handleRegister,
  } = useRegister()

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left: editorial panel (md+) ─────────────────────────────── */}
      <aside className="hidden md:block relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=1200&h=1600&fit=crop&q=85"
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.1) 100%)',
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            reps<span className="text-white/60">.</span>
          </Link>
          <div className="max-w-sm">
            <p className="text-2xl font-semibold leading-tight">
              One account. Every event you&apos;ve ever done on reps., kept straight.
            </p>
            <p className="mt-4 text-sm text-white/60">
              Free forever for athletes. Free for organisers up to 100 registrations per event.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Right: form ─────────────────────────────────────────────── */}
      <section className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-sm">
          <Link href="/" className="md:hidden inline-block mb-10 text-lg font-semibold tracking-tight">
            reps<span className="text-primary">.</span>
          </Link>

          <h1 className="text-heading font-bold tracking-tight">Create your account.</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Takes about thirty seconds. You can change your mind later.
          </p>

          {/* Role picker — replaces the generic "Athlete / Organizer" two-button row */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2">I&apos;m signing up as…</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleCopy) as UserRole[]).map((r) => {
                const active = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    className={
                      'rounded-md border px-3 py-3 text-left transition-all ' +
                      (active
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40')
                    }
                  >
                    <p className="text-sm font-semibold">{roleCopy[r].title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {roleCopy[r].body}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-5">
            <div>
              <label htmlFor="name" className="text-sm font-medium block mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className="text-sm font-medium block mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium block mb-2">
                Password
                <span className="text-muted-foreground font-normal ml-2">8+ characters</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
              {loading ? 'Creating your account…' : 'Create account'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-8">
            Already have one?{' '}
            <Link href="/login" className="text-foreground font-medium underline-offset-4 hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
