'use client'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { MailOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'

function ConfirmEmailContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? 'your inbox'

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center">
        <div className="flex items-center justify-center size-16 rounded-2xl bg-muted mx-auto mb-6">
          <MailOpen className="size-8 text-foreground" />
        </div>

        <h1 className="text-2xl font-medium mb-2">Check your inbox</h1>
        <p className="text-muted-foreground text-sm mb-1">
          We sent a confirmation link to
        </p>
        <p className="font-medium text-sm mb-6 break-all">{email}</p>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Click the link in that email to activate your account and complete your profile setup.
          <span className="block mt-2">
            Can&apos;t find it? Check your spam or junk folder.
          </span>
        </p>

        <Button asChild variant="outline" size="lg" className="w-full">
          <Link href="/">Back to home</Link>
        </Button>
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
