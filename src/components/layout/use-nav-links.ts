'use client'

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function useNavLinks(isOrganizer: boolean) {
  const pathname      = usePathname()
  const dashboardHref = isOrganizer ? '/organizer' : '/athlete'

  function linkCn(href: string) {
    return cn(
      'transition-colors duration-150',
      pathname === href || (href !== '/' && pathname.startsWith(href))
        ? 'text-foreground font-medium'
        : 'text-muted-foreground hover:text-foreground',
    )
  }

  return { dashboardHref, linkCn }
}
