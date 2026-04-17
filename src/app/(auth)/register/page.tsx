'use client'

import Link from 'next/link'
import type { UserRole } from '@/types'
import { Button } from '@/components/ui/button'
import { useRegister } from './use-register'

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
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-medium mb-1">Create account</h1>
        <p className="text-muted-foreground text-sm mb-8">Join reps. — it takes 30 seconds.</p>

        <div className="grid grid-cols-2 gap-2 mb-6">
          {(['athlete', 'organizer'] as UserRole[]).map((r) => (
            <Button
              key={r}
              type="button"
              variant="selector"
              size="lg"
              onClick={() => setRole(r)}
              aria-pressed={role === r}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </Button>
          ))}
        </div>

        <form onSubmit={handleRegister} className="flex flex-col gap-4">
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Full name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Amin Limbada"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Min. 8 characters"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" disabled={loading} size="lg" className="w-full">
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
