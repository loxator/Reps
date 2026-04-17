'use client'

import { X, Plus, Trash2, ChevronDown } from 'lucide-react'
import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useHeatManager, type HeatRow, type RegSummary } from './use-heat-manager'

type Props = {
  workoutId:        string
  workoutName:      string
  initialHeats:     HeatRow[]
  registrations:    RegSummary[]
}

export function HeatManager({ workoutId, workoutName, initialHeats, registrations }: Props) {
  const {
    heats, unassigned,
    saving, error, setError,
    addHeat, removeHeat, updateHeat,
    assign, unassign,
  } = useHeatManager(workoutId, initialHeats, registrations)

  return (
    <div>
      {error && (
        <div className="mb-4 flex items-center justify-between gap-2 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
          {error}
          <button onClick={() => setError(null)}><X className="size-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {registrations.length} athlete{registrations.length !== 1 ? 's' : ''} ·{' '}
          {registrations.length - unassigned.length} assigned · {unassigned.length} unassigned
        </p>
        <Button size="sm" onClick={addHeat} disabled={saving}>
          <Plus className="size-3.5 mr-1" />
          Add heat
        </Button>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-2">
        {/* Unassigned pool */}
        <div className="w-52 shrink-0">
          <div className="rounded-xl border border-border bg-muted/30 p-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">
              Unassigned ({unassigned.length})
            </p>
            <div className="flex flex-col gap-1.5 min-h-12">
              {unassigned.map((reg) => (
                <AthleteChip key={reg.id} reg={reg} />
              ))}
              {unassigned.length === 0 && (
                <p className="text-xs text-muted-foreground italic">All assigned</p>
              )}
            </div>
          </div>
        </div>

        {/* Heat columns */}
        {heats.map((heat) => (
          <HeatColumn
            key={heat.id}
            heat={heat}
            allRegistrations={registrations}
            unassigned={unassigned}
            onUpdate={(patch) => updateHeat(heat.id, patch)}
            onRemove={() => removeHeat(heat.id)}
            onAssign={(regId) => assign(regId, heat.id)}
            onUnassign={(regId) => unassign(regId, heat.id)}
          />
        ))}

        {heats.length === 0 && (
          <div className="flex-1 flex items-center justify-center py-12 rounded-xl border border-dashed border-border">
            <p className="text-sm text-muted-foreground">No heats yet. Add one to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Heat column ──────────────────────────────────────────────────────────────

function HeatColumn({
  heat, allRegistrations, unassigned,
  onUpdate, onRemove, onAssign, onUnassign,
}: {
  heat:             HeatRow
  allRegistrations: RegSummary[]
  unassigned:       RegSummary[]
  onUpdate:         (patch: Partial<Pick<HeatRow, 'name' | 'start_time' | 'capacity'>>) => void
  onRemove:         () => void
  onAssign:         (regId: string) => void
  onUnassign:       (regId: string) => void
}) {
  const [editingTime, setEditingTime] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const assignedRegs = allRegistrations.filter((r) => heat.assignedIds.includes(r.id))
  const isFull = heat.capacity > 0 && assignedRegs.length >= heat.capacity

  function formatTime(ts: string | null) {
    if (!ts) return null
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  // Convert UTC timestamp to local datetime-local input value
  function toLocalInput(ts: string | null) {
    if (!ts) return ''
    const d = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="w-52 shrink-0 rounded-xl border border-border bg-card shadow-card">
      {/* Header */}
      <div className="px-3 pt-3 pb-2 border-b border-border">
        <div className="flex items-center justify-between mb-1">
          <input
            type="text"
            value={heat.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            onBlur={(e) => onUpdate({ name: e.target.value })}
            className="text-sm font-semibold bg-transparent border-none outline-none w-full"
          />
          <button onClick={onRemove} className="p-0.5 hover:text-destructive transition-colors shrink-0">
            <Trash2 className="size-3.5 text-muted-foreground" />
          </button>
        </div>

        {/* Start time */}
        {editingTime ? (
          <input
            type="datetime-local"
            defaultValue={toLocalInput(heat.start_time)}
            onBlur={(e) => {
              const val = e.target.value
              onUpdate({ start_time: val ? new Date(val).toISOString() : null })
              setEditingTime(false)
            }}
            autoFocus
            className="text-xs w-full border border-border rounded px-2 py-1 bg-background focus:outline-none focus:ring-1 focus:ring-primary"
          />
        ) : (
          <button
            onClick={() => setEditingTime(true)}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {formatTime(heat.start_time) ?? '+ Set start time'}
          </button>
        )}

        <p className="text-xs text-muted-foreground mt-0.5">
          {assignedRegs.length}
          {heat.capacity > 0 ? ` / ${heat.capacity}` : ''} athletes
          {isFull && <span className="ml-1 text-warning-700">(full)</span>}
        </p>
      </div>

      {/* Assigned athletes */}
      <div className="p-3 flex flex-col gap-1.5 min-h-12">
        {assignedRegs.map((reg) => (
          <div key={reg.id} className="flex items-center gap-1.5 text-sm">
            <span className="flex-1 truncate text-sm">{reg.athleteName}</span>
            <button
              onClick={() => onUnassign(reg.id)}
              className="shrink-0 p-0.5 hover:text-destructive transition-colors"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}

        {/* Add athlete dropdown */}
        {!isFull && unassigned.length > 0 && (
          <div className="relative mt-1" ref={dropdownRef}>
            <button
              onClick={() => setShowDropdown((v) => !v)}
              className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
            >
              <Plus className="size-3" />
              Add athlete
              <ChevronDown className="size-3" />
            </button>
            {showDropdown && (
              <div className="absolute top-full left-0 mt-1 z-10 w-48 bg-card border border-border rounded-lg shadow-panel overflow-hidden">
                <div className="max-h-40 overflow-y-auto">
                  {unassigned.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => { onAssign(reg.id); setShowDropdown(false) }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors truncate"
                    >
                      {reg.athleteName}
                      {reg.teamName && <span className="text-xs text-muted-foreground ml-1">· {reg.teamName}</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Athlete chip (in unassigned pool) ───────────────────────────────────────

function AthleteChip({ reg }: { reg: RegSummary }) {
  return (
    <div className="text-sm text-muted-foreground truncate px-1">
      {reg.athleteName}
      {reg.teamName && <span className="text-xs ml-1">· {reg.teamName}</span>}
    </div>
  )
}
