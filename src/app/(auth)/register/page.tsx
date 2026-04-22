'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { UserRole } from '@/types'
import { useRegister } from './use-register'

const inputClass =
  'w-full border border-input rounded-lg px-3.5 py-3 text-sm bg-background ' +
  'placeholder:text-muted-foreground/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring ' +
  'transition-[border-color,box-shadow] duration-200'

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
    <div className="min-h-[100svh] grid md:grid-cols-2">

      {/* ── Left: editorial panel ────────────────────────────────────── */}
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
            background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.35) 45%, rgba(0,0,0,0.08) 100%)',
          }}
        />
        <div className="relative h-full flex flex-col justify-between p-12 text-white">
          <Link href="/" className="text-base font-bold tracking-tight">
            reps<span className="text-white/50">.</span>
          </Link>
          <div className="max-w-xs">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45 mb-4">
              Get started
            </p>
            <p className="text-2xl font-bold leading-snug">
              One account. Every event you&apos;ve ever done on reps., kept straight.
            </p>
            <p className="mt-4 text-sm text-white/55">
              Free forever for athletes. Free for organisers up to 100 registrations per event.
            </p>
          </div>
        </div>
      </aside>

      {/* ── Right: form ─────────────────────────────────────────────── */}
      <section className="flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <Link href="/" className="md:hidden inline-block mb-10 text-base font-bold tracking-tight">
            reps<span className="text-primary">.</span>
          </Link>

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Create account
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Join reps.</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-7">
            Takes about thirty seconds. You can change your mind later.
          </p>

          {/* Role picker */}
          <div className="mb-6">
            <p className="text-sm font-medium mb-2.5">I&apos;m signing up as…</p>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(roleCopy) as UserRole[]).map((r) => {
                const active = role === r
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRole(r)}
                    aria-pressed={active}
                    className={`rounded-xl border-2 px-3 py-3.5 text-left transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                      active
                        ? 'border-foreground bg-muted'
                        : 'border-border hover:border-muted-foreground/40 hover:bg-muted/40'
                    }`}
                  >
                    <p className="text-sm font-bold">{roleCopy[r].title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {roleCopy[r].body}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
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
                placeholder="Alex Johnson"
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
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="text-sm font-medium block mb-2">
                Password
                <span className="text-muted-foreground font-normal ml-2 text-xs">8+ characters</span>
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-destructive text-sm rounded-lg bg-danger-50 px-3 py-2">
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
              {loading ? 'Creating your account…' : 'Create account'}
              {!loading && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-3" strokeWidth={2} />
                </span>
              )}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-8">
            Already have one?{' '}
            <Link href="/login" className="text-foreground font-semibold underline-offset-4 hover:underline">
              Sign in instead
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
