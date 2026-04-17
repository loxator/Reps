'use client'

import { Button } from '@/components/ui/button'
import { useEventForm } from './use-event-form'

const inputClass =
  'w-full border border-border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'

export function EventCreateForm({ organizerId }: { organizerId: string }) {
  const {
    name, setName,
    location, setLocation,
    date, setDate,
    description, setDescription,
    capacity, setCapacity,
    status, setStatus,
    saving, error,
    handleSubmit,
  } = useEventForm(organizerId)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Event name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          required placeholder="Desert Throwdown 2026" className={inputClass} />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-1.5">Date</label>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            required className={inputClass} />
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
          required placeholder="CrossFit DXB, Dubai" className={inputClass} />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">
          Total capacity <span className="text-xs">(0 = unlimited)</span>
        </label>
        <input type="number" min="0" value={capacity} onChange={(e) => setCapacity(e.target.value)}
          className={inputClass} />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-1.5">Description <span className="text-xs">(optional)</span></label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)}
          rows={3} placeholder="Brief overview of the event…"
          className={`${inputClass} resize-none`} />
      </div>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button type="submit" disabled={saving} size="lg" className="w-full">
        {saving ? 'Creating…' : 'Create event'}
      </Button>
    </form>
  )
}
