'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Category, Workout, ScoringType } from '@/types'

export type WorkoutRow = Workout & { isEditing: boolean; isNew: boolean }
export type CategoryRow = Category & { workouts: WorkoutRow[]; isEditing: boolean; isNew: boolean }

export function useCategoryManager(eventId: string, initial: CategoryRow[]) {
  const [categories, setCategories] = useState<CategoryRow[]>(initial)
  const [saving, setSaving] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // ── Category CRUD ──────────────────────────────────────────────────────────

  function startAddCategory() {
    const tempId = `new-${Date.now()}`
    setCategories((prev) => [
      ...prev,
      {
        id: tempId,
        event_id: eventId,
        name: '',
        type: 'individual',
        capacity: 0,
        team_size: 1,
        order_num: prev.length + 1,
        created_at: '',
        workouts: [],
        isEditing: true,
        isNew: true,
      },
    ])
  }

  function startEditCategory(id: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isEditing: true } : c)),
    )
  }

  function cancelEditCategory(id: string) {
    setCategories((prev) =>
      prev
        .filter((c) => !(c.id === id && c.isNew))
        .map((c) => (c.id === id ? { ...c, isEditing: false } : c)),
    )
  }

  function updateCategoryField<K extends keyof CategoryRow>(id: string, key: K, value: CategoryRow[K]) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [key]: value } : c)),
    )
  }

  async function saveCategory(cat: CategoryRow) {
    setSaving(cat.id)
    setError(null)

    if (cat.isNew) {
      const { data, error: err } = await supabase
        .from('categories')
        .insert({
          event_id: eventId,
          name: cat.name.trim(),
          type: cat.type,
          capacity: cat.capacity,
          team_size: cat.team_size,
          order_num: cat.order_num,
        })
        .select('*')
        .single()

      if (err) { setError(err.message); setSaving(null); return }

      setCategories((prev) =>
        prev.map((c) =>
          c.id === cat.id
            ? { ...data, workouts: [], isEditing: false, isNew: false }
            : c,
        ),
      )
    } else {
      const { error: err } = await supabase
        .from('categories')
        .update({
          name: cat.name.trim(),
          type: cat.type,
          capacity: cat.capacity,
          team_size: cat.team_size,
        })
        .eq('id', cat.id)

      if (err) { setError(err.message); setSaving(null); return }

      setCategories((prev) =>
        prev.map((c) => (c.id === cat.id ? { ...c, isEditing: false } : c)),
      )
    }

    setSaving(null)
  }

  async function deleteCategory(id: string) {
    setSaving(id)
    const { error: err } = await supabase.from('categories').delete().eq('id', id)
    if (err) { setError(err.message); setSaving(null); return }
    setCategories((prev) => prev.filter((c) => c.id !== id))
    setSaving(null)
  }

  // ── Workout CRUD ───────────────────────────────────────────────────────────

  function startAddWorkout(categoryId: string) {
    const tempId = `new-${Date.now()}`
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : {
            ...c,
            workouts: [
              ...c.workouts,
              {
                id: tempId,
                category_id: categoryId,
                name: '',
                description: '',
                scoring_type: 'time' as ScoringType,
                order_num: c.workouts.length + 1,
                isEditing: true,
                isNew: true,
              },
            ],
          },
      ),
    )
  }

  function startEditWorkout(categoryId: string, workoutId: string) {
    setCategories((prev: CategoryRow[]) =>
      prev.map((c: CategoryRow) =>
        c.id !== categoryId
          ? c
          : {
            ...c,
            workouts: c.workouts.map((w: WorkoutRow) =>
              w.id === workoutId ? { ...w, isEditing: true } : w,
            ),
          },
      ),
    )
  }

  function cancelEditWorkout(categoryId: string, workoutId: string) {
    setCategories((prev) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : {
            ...c,
            workouts: c.workouts
              .filter((w: WorkoutRow) => !(w.id === workoutId && w.isNew))
              .map((w: WorkoutRow) => (w.id === workoutId ? { ...w, isEditing: false } : w)),
          },
      ),
    )
  }

  function updateWorkoutField<K extends keyof WorkoutRow>(
    categoryId: string,
    workoutId: string,
    key: K,
    value: WorkoutRow[K],
  ) {
    setCategories((prev: CategoryRow[]) =>
      prev.map((c: CategoryRow) =>
        c.id !== categoryId
          ? c
          : {
            ...c,
            workouts: c.workouts.map((w: WorkoutRow) =>
              w.id === workoutId ? { ...w, [key]: value } : w,
            ),
          },
      ),
    )
  }

  async function saveWorkout(categoryId: string, w: WorkoutRow) {
    setSaving(w.id)
    setError(null)

    if (w.isNew) {
      const { data, error: err } = await supabase
        .from('workouts')
        .insert({
          category_id: categoryId,
          name: w.name.trim(),
          description: w.description.trim(),
          scoring_type: w.scoring_type,
          order_num: w.order_num,
        })
        .select('*')
        .single()

      if (err) { setError(err.message); setSaving(null); return }

      setCategories((prev) =>
        prev.map((c) =>
          c.id !== categoryId
            ? c
            : {
              ...c,
              workouts: c.workouts.map((wo) =>
                wo.id === w.id
                  ? { ...data, isEditing: false, isNew: false }
                  : wo,
              ),
            },
        ),
      )
    } else {
      const { error: err } = await supabase
        .from('workouts')
        .update({
          name: w.name.trim(),
          description: w.description.trim(),
          scoring_type: w.scoring_type,
        })
        .eq('id', w.id)

      if (err) { setError(err.message); setSaving(null); return }

      setCategories((prev: CategoryRow[]) =>
        prev.map((c) =>
          c.id !== categoryId
            ? c
            : {
              ...c,
              workouts: c.workouts.map((wo: WorkoutRow) =>
                wo.id === w.id ? { ...wo, isEditing: false } : wo,
              ),
            },
        ),
      )
    }

    setSaving(null)
  }

  async function deleteWorkout(categoryId: string, workoutId: string) {
    setSaving(workoutId)
    const { error: err } = await supabase.from('workouts').delete().eq('id', workoutId)
    if (err) { setError(err.message); setSaving(null); return }
    setCategories((prev: CategoryRow[]) =>
      prev.map((c) =>
        c.id !== categoryId
          ? c
          : { ...c, workouts: c.workouts.filter((w: WorkoutRow) => w.id !== workoutId) },
      ),
    )
    setSaving(null)
  }

  return {
    categories,
    saving, error,
    startAddCategory, startEditCategory, cancelEditCategory,
    updateCategoryField, saveCategory, deleteCategory,
    startAddWorkout, startEditWorkout, cancelEditWorkout,
    updateWorkoutField, saveWorkout, deleteWorkout,
  }
}
