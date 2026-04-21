import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/layout/logout-button'
import { NavLinks } from '@/components/layout/nav-links'

export async function Navbar() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const role = user?.user_metadata?.role as string | undefined
  const isOrganizer = role === 'organizer'
  const dashboardHref = isOrganizer ? '/organizer' : '/athlete'

  return (
    <header className="fixed top-0 inset-x-0 z-modal border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-page-x h-14 flex items-center justify-between">
        <Link href="/" className="text-lg font-semibold tracking-tight">
          reps.
        </Link>

        <NavLinks isOrganizer={isOrganizer} isLoggedIn={!!user} />

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild size="sm" variant="ghost">
                <Link href={dashboardHref}>
                  {isOrganizer ? 'Organizer' : 'My account'}
                </Link>
              </Button>
              <LogoutButton />
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
