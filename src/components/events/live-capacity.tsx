'use client'

import { Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useLiveCapacity } from './use-live-capacity'

type Props = {
  eventId:      string
  initialFilled: number
  capacity:     number
}

export function LiveCapacity({ eventId, initialFilled, capacity }: Props) {
  const { filled, isFull, isNearlyFull, remaining, pct } = useLiveCapacity(
    eventId, initialFilled, capacity,
  )

  if (capacity === 0) return null

  return (
    <div className="mt-4 max-w-xs">
      <div className="flex items-center justify-between mb-1.5 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Users className="size-4" />
          {filled} / {capacity} spots filled
        </span>
        {isFull && <Badge variant="full">Full</Badge>}
        {!isFull && isNearlyFull && (
          <Badge variant="nearlyFull">{remaining} spot{remaining !== 1 ? 's' : ''} left</Badge>
        )}
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            isFull ? 'bg-danger-500' : isNearlyFull ? 'bg-warning-500' : 'bg-success-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
