'use client'

import { Pencil, Trash2, Plus, Check, X, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  useCategoryManager,
  type CategoryRow,
  type WorkoutRow,
} from './use-category-manager'
import type { ScoringType } from '@/types'

const SCORING_TYPES: { value: ScoringType; label: string }[] = [
  { value: 'time',   label: 'For Time' },
  { value: 'reps',   label: 'Max Reps' },
  { value: 'load',   label: 'Max Load' },
  { value: 'rounds', label: 'AMRAP' },
]

const inputClass =
  'w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary'

type Props = {
  eventId:    string
  initial:    CategoryRow[]
}

export function CategoryManager({ eventId, initial }: Props) {
  const {
    categories, saving, error,
    startAddCategory, startEditCategory, cancelEditCategory,
    updateCategoryField, saveCategory, deleteCategory,
    startAddWorkout, startEditWorkout, cancelEditWorkout,
    updateWorkoutField, saveWorkout, deleteWorkout,
  } = useCategoryManager(eventId, initial)

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex flex-col gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            cat={cat}
            saving={saving}
            onEdit={() => startEditCategory(cat.id)}
            onCancel={() => cancelEditCategory(cat.id)}
            onSave={() => saveCategory(cat)}
            onDelete={() => deleteCategory(cat.id)}
            onFieldChange={(key, val) => updateCategoryField(cat.id, key, val)}
            onAddWorkout={() => startAddWorkout(cat.id)}
            onEditWorkout={(wid) => startEditWorkout(cat.id, wid)}
            onCancelWorkout={(wid) => cancelEditWorkout(cat.id, wid)}
            onSaveWorkout={(w) => saveWorkout(cat.id, w)}
            onDeleteWorkout={(wid) => deleteWorkout(cat.id, wid)}
            onWorkoutFieldChange={(wid, key, val) => updateWorkoutField(cat.id, wid, key, val)}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={startAddCategory}
        className="mt-4 flex items-center gap-2 text-sm font-medium text-primary hover:underline"
      >
        <Plus className="size-4" />
        Add category
      </button>
    </div>
  )
}

// ─── Category card ────────────────────────────────────────────────────────────

function CategoryCard({
  cat, saving,
  onEdit, onCancel, onSave, onDelete, onFieldChange,
  onAddWorkout, onEditWorkout, onCancelWorkout, onSaveWorkout,
  onDeleteWorkout, onWorkoutFieldChange,
}: {
  cat:               CategoryRow
  saving:            string | null
  onEdit:            () => void
  onCancel:          () => void
  onSave:            () => void
  onDelete:          () => void
  onFieldChange:     (key: keyof CategoryRow, val: CategoryRow[keyof CategoryRow]) => void
  onAddWorkout:      () => void
  onEditWorkout:     (id: string) => void
  onCancelWorkout:   (id: string) => void
  onSaveWorkout:     (w: WorkoutRow) => void
  onDeleteWorkout:   (id: string) => void
  onWorkoutFieldChange: (id: string, key: keyof WorkoutRow, val: WorkoutRow[keyof WorkoutRow]) => void
}) {
  const isSaving = saving === cat.id

  return (
    <div className="rounded-xl border border-border bg-card shadow-card overflow-hidden">
      {/* Category header */}
      <div className="px-5 py-4">
        {cat.isEditing ? (
          <div className="flex flex-col gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Name</label>
                <input type="text" value={cat.name}
                  onChange={(e) => onFieldChange('name', e.target.value)}
                  placeholder="e.g. RX Individual" className={inputClass} autoFocus />
              </div>
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Type</label>
                <select value={cat.type}
                  onChange={(e) => onFieldChange('type', e.target.value as 'individual' | 'team')}
                  className={inputClass}>
                  <option value="individual">Individual</option>
                  <option value="team">Team</option>
                </select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Capacity (0 = unlimited)</label>
                <input type="number" min="0" value={cat.capacity}
                  onChange={(e) => onFieldChange('capacity', parseInt(e.target.value) || 0)}
                  className={inputClass} />
              </div>
              {cat.type === 'team' && (
                <div>
                  <label className="text-xs text-muted-foreground block mb-1">Team size</label>
                  <input type="number" min="2" max="20" value={cat.team_size}
                    onChange={(e) => onFieldChange('team_size', parseInt(e.target.value) || 2)}
                    className={inputClass} />
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={onSave} disabled={!cat.name.trim() || isSaving}>
                <Check className="size-3.5 mr-1" />
                {isSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="font-semibold">{cat.name}</span>
              <span className={`text-xs rounded-md px-2 py-0.5 font-medium ${
                cat.type === 'team' ? 'bg-brand-100 text-brand-700' : 'bg-neutral-100 text-neutral-600'
              }`}>
                {cat.type === 'team' ? `Team of ${cat.team_size}` : 'Individual'}
              </span>
              {cat.capacity > 0 && (
                <span className="text-xs text-muted-foreground">{cat.capacity} spots</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Pencil className="size-3.5 text-muted-foreground" />
              </button>
              <button onClick={onDelete} disabled={isSaving}
                className="p-1.5 rounded-lg hover:bg-danger-50 hover:text-danger-600 transition-colors">
                <Trash2 className="size-3.5 text-muted-foreground" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Workouts */}
      {!cat.isNew && (
        <div className="border-t border-border bg-muted/30 px-5 py-3">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-2">
            Workouts
          </p>
          <div className="flex flex-col gap-2">
            {cat.workouts.map((w) => (
              <WorkoutRow
                key={w.id}
                w={w}
                saving={saving}
                onEdit={() => onEditWorkout(w.id)}
                onCancel={() => onCancelWorkout(w.id)}
                onSave={() => onSaveWorkout(w)}
                onDelete={() => onDeleteWorkout(w.id)}
                onFieldChange={(key, val) => onWorkoutFieldChange(w.id, key, val)}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={onAddWorkout}
            className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Plus className="size-3.5" />
            Add workout
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Workout row ──────────────────────────────────────────────────────────────

function WorkoutRow({
  w, saving, onEdit, onCancel, onSave, onDelete, onFieldChange,
}: {
  w:             WorkoutRow
  saving:        string | null
  onEdit:        () => void
  onCancel:      () => void
  onSave:        () => void
  onDelete:      () => void
  onFieldChange: (key: keyof WorkoutRow, val: WorkoutRow[keyof WorkoutRow]) => void
}) {
  const isSaving = saving === w.id

  if (w.isEditing) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 flex flex-col gap-2">
        <div className="grid sm:grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Name</label>
            <input type="text" value={w.name}
              onChange={(e) => onFieldChange('name', e.target.value)}
              placeholder="e.g. Grace" className={inputClass} autoFocus />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Scoring</label>
            <select value={w.scoring_type}
              onChange={(e) => onFieldChange('scoring_type', e.target.value as ScoringType)}
              className={inputClass}>
              {SCORING_TYPES.map(({ value, label }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="text-xs text-muted-foreground block mb-1">Description / movements</label>
          <textarea value={w.description}
            onChange={(e) => onFieldChange('description', e.target.value)}
            rows={2} placeholder="30 Clean & Jerks for time…"
            className={`${inputClass} resize-none`} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={onSave} disabled={!w.name.trim() || isSaving}>
            <Check className="size-3.5 mr-1" />
            {isSaving ? 'Saving…' : 'Save'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
        </div>
      </div>
    )
  }

  const scoring = SCORING_TYPES.find((s) => s.value === w.scoring_type)

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <div className="min-w-0">
        <span className="text-sm font-medium">{w.name}</span>
        <span className="ml-2 text-xs text-muted-foreground">{scoring?.label}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        <button onClick={onEdit} className="p-1 rounded hover:bg-muted transition-colors">
          <Pencil className="size-3 text-muted-foreground" />
        </button>
        <button onClick={onDelete} disabled={isSaving}
          className="p-1 rounded hover:bg-danger-50 hover:text-danger-600 transition-colors">
          <Trash2 className="size-3 text-muted-foreground" />
        </button>
      </div>
    </div>
  )
}
