'use client'

import { Button } from '@/components/ui/button'
import { useLogout } from './use-logout'

export function LogoutButton() {
  const { handleLogout } = useLogout()

  return (
    <Button variant="ghost" size="sm" onClick={handleLogout}>
      Sign out
    </Button>
  )
}
