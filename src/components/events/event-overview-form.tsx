'use client'

import { CheckCircle2, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEventOverviewForm } from './use-event-overview-form'
import type { Event } from '@/types'

type EditableEvent = Pick<Event, 'id' | 'name' | 'location' | 'date' | 'description' | 'status' | 'capacity'>

const inputClass =
  'w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'

export function EventOverviewForm({
  event,
  lockedCapacity,
}: {
  event: EditableEvent
  lockedCapacity: number | null
}) {
  const {
    name, setName,
    location, setLocation,
    date, setDate,
    description, setDescription,
    capacity, setCapacity,
    status, setStatus,
    isDirty, saving, saved, error,
    handleSave,
  } = useEventOverviewForm(event, lockedCapacity)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Event name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className={inputClass} />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Status</label>
          <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)}
            className={inputClass}>
            <option value="draft">Draft</option>
            <option value="open">Open for registration</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Location / venue</label>
        <input type="text" value={location} onChange={(e) => setLocation(e.target.value)}
          className={inputClass} />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">
          Total capacity <span className="text-xs">(0 = unlimited)</span>
        </label>

        {lockedCapacity === null ? (
          <input
            type="number"
            min="0"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className={inputClass}
          />
        ) : (
          <>
            <div className={`${inputClass} bg-muted text-foreground cursor-default select-none`}>
              {lockedCapacity === 0 ? 'Unlimited' : lockedCapacity}
            </div>
            <p className="mt-2 flex items-start gap-1.5 text-xs text-muted-foreground">
              <Info className="size-3.5 mt-0.5 shrink-0" />
              {lockedCapacity === 0
                ? 'One or more categories allow unlimited registrations, so this event has no cap. To set a limit, update each category\'s spots.'
                : 'Total capacity is the sum of your category spots. To change it, update the spots in each category.'}
            </p>
          </>
        )}
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Description</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={!isDirty || saving} size="lg">
          {saving ? 'Saving…' : 'Save changes'}
        </Button>
        {saved && (
          <span className="flex items-center gap-1 text-sm text-success-700">
            <CheckCircle2 className="size-4" /> Saved
          </span>
        )}
      </div>
    </div>
  )
}
