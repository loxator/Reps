import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/layout/logout-button'
import { NavLinks } from '@/components/layout/nav-links'
import { ArrowRight } from 'lucide-react'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role        = user?.user_metadata?.role as string | undefined
  const isOrganizer = role === 'organizer'
  const dashboardHref = isOrganizer ? '/organizer' : '/athlete'

  return (
    <header className="fixed top-0 inset-x-0 z-modal border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-page-x h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-base font-bold tracking-tight hover:opacity-80 transition-opacity duration-150"
        >
          reps<span className="text-primary">.</span>
        </Link>

        <NavLinks isOrganizer={isOrganizer} isLoggedIn={!!user} />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href={dashboardHref}
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground
                           transition-colors duration-150"
              >
                {isOrganizer ? 'Organizer' : 'Dashboard'}
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground
                           transition-colors duration-150"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-1.5 rounded-full bg-foreground text-background
                           px-4 py-1.5 text-sm font-semibold
                           hover:-translate-y-px transition-all duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]"
              >
                Get started
                <span className="flex size-4 items-center justify-center rounded-full bg-white/10">
                  <ArrowRight className="size-2.5" strokeWidth={2} />
                </span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
