'use client'

import { CategoryPicker } from './division-picker'
import { RegistrationDetailsForm } from './team-details-form'
import { useRegistrationFlow } from './use-registration-flow'
import type { Category } from '@/types'

type Props = {
  eventId:              string
  eventName:            string
  athleteId:            string
  categories:           Category[]
  preselectedCategory?: Category | null
}

export function RegistrationFlow({
  eventId,
  eventName,
  athleteId,
  categories,
  preselectedCategory,
}: Props) {
  const { step, selectedCategory, handlePick, handleBack } = useRegistrationFlow(preselectedCategory)

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {!preselectedCategory && (
          <>
            <StepDot n={1} label="Choose category" active={step === 'pick'} done={step === 'details'} />
            <div className="flex-1 h-px bg-border" />
          </>
        )}
        <StepDot
          n={preselectedCategory ? 1 : 2}
          label="Your details"
          active={step === 'details'}
          done={false}
        />
      </div>

      {step === 'pick' && (
        <CategoryPicker
          eventName={eventName}
          categories={categories}
          onPick={handlePick}
        />
      )}

      {step === 'details' && selectedCategory && (
        <RegistrationDetailsForm
          eventId={eventId}
          athleteId={athleteId}
          category={selectedCategory}
          onBack={preselectedCategory ? undefined : handleBack}
        />
      )}
    </div>
  )
}

function StepDot({ n, label, active, done }: {
  n: number; label: string; active: boolean; done: boolean
}) {
  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className={`flex items-center justify-center size-7 rounded-full text-xs font-semibold transition-colors ${
        done || active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}>
        {done ? '✓' : n}
      </div>
      <span className={`text-sm ${active ? 'font-medium' : 'text-muted-foreground'}`}>{label}</span>
    </div>
  )
}
