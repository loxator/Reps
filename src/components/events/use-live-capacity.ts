'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLiveCapacity(
  eventId: string,
  initialFilled: number,
  capacity: number,
) {
  const [filled, setFilled] = useState(initialFilled)
  const supabase = createClient()

  useEffect(() => {
    // Re-fetch the actual count from DB
    async function refetch() {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', eventId)
      if (count !== null) setFilled(count)
    }

    const channel = supabase
      .channel(`capacity-${eventId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'registrations', filter: `event_id=eq.${eventId}` },
        () => refetch(),
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [eventId]) // eslint-disable-line react-hooks/exhaustive-deps

  const isFull      = capacity > 0 && filled >= capacity
  const isNearlyFull = capacity > 0 && filled / capacity >= 0.8
  const remaining   = capacity > 0 ? capacity - filled : null
  const pct         = capacity > 0 ? Math.min((filled / capacity) * 100, 100) : 0

  return { filled, isFull, isNearlyFull, remaining, pct }
}
