'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useLogin } from './use-login'

const inputClass =
  'w-full border border-input rounded-md px-3 py-2.5 text-sm bg-background ' +
  'placeholder:text-muted-foreground/60 ' +
  'focus:outline-none focus:ring-2 focus:ring-ring/40 focus:border-ring ' +
  'transition-[border-color,box-shadow]'

export default function LoginPage() {
  const { email, setEmail, password, setPassword, error, loading, handleLogin } = useLogin()

  return (
    <div className="min-h-screen grid md:grid-cols-2">

      {/* ── Left: editorial panel (md+) ─────────────────────────────── */}
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
              &ldquo;Showed up to four events last year without chasing a single confirmation email.&rdquo;
            </p>
            <p className="mt-4 text-sm text-white/60">
              — Sana R., masters athlete
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

          <h1 className="text-heading font-bold tracking-tight">Welcome back.</h1>
          <p className="text-sm text-muted-foreground mt-2 mb-10">
            Sign in to manage your registrations.
          </p>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
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
                className={inputClass}
              />
            </div>

            {error && (
              <p role="alert" className="text-destructive text-sm">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} size="lg" className="w-full mt-2">
              {loading ? 'Signing in…' : 'Sign in'}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground mt-8">
            New here?{' '}
            <Link href="/register" className="text-foreground font-medium underline-offset-4 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
