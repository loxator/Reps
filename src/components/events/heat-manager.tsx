'use client'

import { X, Plus, Trash2, Search } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useHeatManager, type HeatRow, type RegSummary } from './use-heat-manager'

type Props = {
  workoutId:     string
  workoutName:   string
  initialHeats:  HeatRow[]
  registrations: RegSummary[]
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

      {/* Summary + action bar */}
      <div className="flex items-center justify-between mb-5">
        <p className="text-sm text-muted-foreground">
          {registrations.length} athlete{registrations.length !== 1 ? 's' : ''} ·{' '}
          {registrations.length - unassigned.length} assigned
          {unassigned.length > 0 && (
            <span className="text-warning-700 font-medium"> · {unassigned.length} unassigned</span>
          )}
        </p>
        <Button size="sm" onClick={addHeat} disabled={saving}>
          <Plus className="size-3.5 mr-1" />
          Add heat
        </Button>
      </div>

      {/* Heat columns */}
      <div className="flex gap-4 overflow-x-auto pb-2">
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
  const [editingTime,  setEditingTime]  = useState(false)
  const [showPopover,  setShowPopover]  = useState(false)
  const [search,       setSearch]       = useState('')
  const popoverRef = useRef<HTMLDivElement>(null)
  const searchRef  = useRef<HTMLInputElement>(null)

  const assignedRegs = allRegistrations.filter((r) => heat.assignedIds.includes(r.id))
  const isFull       = heat.capacity > 0 && assignedRegs.length >= heat.capacity

  const filteredUnassigned = unassigned.filter((r) =>
    [r.athleteName, r.teamName].filter(Boolean).join(' ').toLowerCase().includes(search.toLowerCase())
  )

  // Close popover on outside click
  useEffect(() => {
    if (!showPopover) return
    function handle(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [showPopover])

  // Focus search input when popover opens
  useEffect(() => {
    if (showPopover) searchRef.current?.focus()
  }, [showPopover])

  function formatTime(ts: string | null) {
    if (!ts) return null
    return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  }

  function toLocalInput(ts: string | null) {
    if (!ts) return ''
    const d   = new Date(ts)
    const pad = (n: number) => String(n).padStart(2, '0')
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
  }

  return (
    <div className="w-52 shrink-0 rounded-xl border border-border bg-card shadow-card flex flex-col">
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

      {/* Assigned athletes — scrollable so the column height stays fixed */}
      <div className="p-3 flex flex-col gap-1.5 overflow-y-auto max-h-64 flex-1">
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
      </div>

      {/* Add athlete — searchable popover */}
      {!isFull && unassigned.length > 0 && (
        <div className="px-3 pb-3 relative" ref={popoverRef}>
          <button
            onClick={() => setShowPopover((v) => !v)}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="size-3" />
            Add athlete
          </button>

          {showPopover && (
            <div className="absolute bottom-full left-0 mb-1 z-30 w-56 bg-card border border-border rounded-xl shadow-panel overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
                <Search className="size-3.5 text-muted-foreground shrink-0" />
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search athletes…"
                  className="flex-1 text-xs bg-transparent outline-none placeholder:text-muted-foreground"
                />
                {search && (
                  <button onClick={() => setSearch('')} className="shrink-0 text-muted-foreground hover:text-foreground">
                    <X className="size-3" />
                  </button>
                )}
              </div>

              {/* Filtered list */}
              <div className="max-h-48 overflow-y-auto">
                {filteredUnassigned.length > 0 ? (
                  filteredUnassigned.map((reg) => (
                    <button
                      key={reg.id}
                      onClick={() => { onAssign(reg.id); setShowPopover(false); setSearch('') }}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <span className="truncate block">{reg.athleteName}</span>
                      {reg.teamName && (
                        <span className="text-xs text-muted-foreground">{reg.teamName}</span>
                      )}
                    </button>
                  ))
                ) : (
                  <p className="px-3 py-3 text-xs text-muted-foreground italic">No matches</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
