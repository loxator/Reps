'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">

        <Link href="/" className="inline-block mb-12 text-lg font-semibold tracking-tight">
          reps<span className="text-primary">.</span>
        </Link>

        {/* A thin rule replaces the rounded-square icon block */}
        <div className="h-px w-12 bg-foreground mb-8" />

        <h1 className="text-heading md:text-title font-bold leading-tight tracking-tight">
          Check your inbox.
        </h1>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          We just sent a confirmation link to{' '}
          {email
            ? <span className="font-medium text-foreground break-all">{email}</span>
            : <span className="font-medium text-foreground">your inbox</span>}
          . Click it to activate your account.
        </p>

        <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
          Not there? It&apos;s usually in spam or promotions. Emails can take a couple of minutes to
          arrive — we don&apos;t queue them but your provider might.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild variant="outline">
            <Link href="/">Back to home</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/login">I&apos;ve confirmed → sign in</Link>
          </Button>
        </div>
      </div>
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
