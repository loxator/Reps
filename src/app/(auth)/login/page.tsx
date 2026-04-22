'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useLogin } from './use-login'

const inputClass =
  'w-full border border-input rounded-lg px-3.5 py-3 text-sm bg-background ' +
  'placeholder:text-muted-foreground/50 ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring ' +
  'transition-[border-color,box-shadow] duration-200'

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } = useLogin()

  return (
    <div className="min-h-[100svh] grid md:grid-cols-2">

      {/* ── Left: editorial panel ────────────────────────────────────── */}
      <aside className="hidden md:block relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=1600&fit=crop&q=85"
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
              Athlete
            </p>
            <p className="text-2xl font-bold leading-snug">
              &ldquo;Showed up to four events last year without chasing a single confirmation email.&rdquo;
            </p>
            <p className="mt-4 text-sm text-white/55">
              — Sana R., masters athlete
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
            Sign in
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back.</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-8">
            Sign in to manage your registrations.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-sm font-medium">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Forgot?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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
              {loading ? 'Signing in…' : 'Sign in'}
              {!loading && (
                <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-3" strokeWidth={2} />
                </span>
              )}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-8">
            New here?{' '}
            <Link href="/register" className="text-foreground font-semibold underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
