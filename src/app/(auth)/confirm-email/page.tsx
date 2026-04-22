'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowRight } from 'lucide-react'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-[100svh] grid md:grid-cols-2">

      {/* ── Left: graphic panel ──────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col items-center justify-center bg-muted/40 border-r border-border p-14">
        <div className="max-w-xs text-center">
          <div className="size-16 rounded-full bg-foreground flex items-center justify-center mx-auto mb-8">
            <Mail className="size-7 text-background" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Almost there
          </p>
          <p className="text-xl font-bold leading-snug mb-3">
            One click and you&apos;re in.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Check your inbox and click the confirmation link to activate your account.
          </p>
        </div>
      </aside>

      {/* ── Right: content ─────────────────────────────────────────── */}
      <section className="flex items-center justify-center p-6 md:p-14">
        <div className="w-full max-w-sm">

          <Link href="/" className="inline-block mb-10 text-base font-bold tracking-tight">
            reps<span className="text-primary">.</span>
          </Link>

          <div className="h-px w-10 bg-foreground mb-8" />

          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Confirm your email
          </p>
          <h1 className="text-2xl font-bold tracking-tight leading-tight">
            Check your inbox.
          </h1>

          <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
            We just sent a confirmation link to{' '}
            {email
              ? <span className="font-semibold text-foreground break-all">{email}</span>
              : <span className="font-semibold text-foreground">your inbox</span>
            }. Click it to activate your account.
          </p>

          <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
            Not there? It&apos;s usually in spam or promotions. Emails can take a couple of minutes —
            we don&apos;t queue them but your provider might.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background
                         px-5 py-2.5 text-sm font-semibold hover:bg-muted
                         transition-colors duration-200"
            >
              Back to home
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-foreground text-background
                         px-5 py-2.5 text-sm font-semibold
                         hover:-translate-y-0.5 transition-all duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]"
            >
              Sign in
              <span className="flex size-5 items-center justify-center rounded-full bg-white/10">
                <ArrowRight className="size-3" strokeWidth={2} />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default function ConfirmEmailPage() {
  return (
    <Suspense>
      <ConfirmEmailContent />
    </Suspense>
  )
}
