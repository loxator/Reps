'use client'

import { useState } from 'react'
import type { Category, Workout } from '@/types'

export function useCategoryCard(
  category: Category & { workouts: Workout[] },
  defaultExpanded: boolean,
) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const workouts = (category.workouts ?? []).slice().sort((a, b) => a.order_num - b.order_num)
  const isTeam   = category.type === 'team'

  function toggle(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    setExpanded((v) => !v)
  }

  return { expanded, toggle, workouts, isTeam }
}
