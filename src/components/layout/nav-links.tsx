'use client'

import Link from 'next/link'
import { useNavLinks } from './use-nav-links'

interface NavLinksProps {
  isOrganizer: boolean
  isLoggedIn:  boolean
}

export function NavLinks({ isOrganizer, isLoggedIn }: NavLinksProps) {
  const { dashboardHref, linkCn } = useNavLinks(isOrganizer)

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
