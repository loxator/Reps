'use client'

import { useState } from 'react'
import type { Category } from '@/types'

type Step = 'pick' | 'details'

export function useRegistrationFlow(preselectedCategory?: Category | null) {
  const [step, setStep] = useState<Step>(preselectedCategory ? 'details' : 'pick')
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    preselectedCategory ?? null
  )

  function handlePick(cat: Category) {
    setSelectedCategory(cat)
    setStep('details')
  }

  function handleBack() {
    setStep('pick')
  }

  return { step, selectedCategory, handlePick, handleBack }
}
