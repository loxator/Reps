'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

interface NavLinksProps {
  isOrganizer: boolean
  isLoggedIn: boolean
}

export function NavLinks({ isOrganizer, isLoggedIn }: NavLinksProps) {
  const pathname = usePathname()
  const dashboardHref = isOrganizer ? '/organizer' : '/athlete'

  const linkCn = (href: string) =>
    cn(
      'transition-colors duration-150',
      pathname === href || (href !== '/' && pathname.startsWith(href))
        ? 'text-foreground font-medium'
        : 'text-muted-foreground hover:text-foreground'
    )

  return (
    <nav className="hidden md:flex items-center gap-6 text-sm">
      <Link href="/events" className={linkCn('/events')}>
        Events
      </Link>
      {isLoggedIn && (
        <Link href={dashboardHref} className={linkCn(dashboardHref)}>
          {isOrganizer ? 'My events' : 'Dashboard'}
        </Link>
      )}
    </nav>
  )
}
