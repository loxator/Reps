import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { emails, redirectTo } = await req.json() as { emails: string[]; redirectTo: string }
  if (!emails?.length) return NextResponse.json({ sent: 0 })

  const admin = createAdminClient()

  const results = await Promise.allSettled(
    emails.map((email) => admin.auth.admin.inviteUserByEmail(email, { redirectTo }))
  )

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return NextResponse.json({ sent })
}
