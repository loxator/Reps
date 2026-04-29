'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function useLogout() {
  const router   = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return { handleLogout }
}
