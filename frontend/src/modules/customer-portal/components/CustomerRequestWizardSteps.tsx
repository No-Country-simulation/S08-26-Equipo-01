import { Fragment } from 'react'
import { Card } from '@/shared/components/ui/Card'

const steps = ['Detalles', 'Requisitos y documentos', 'Entrega', 'Revisar y enviar']

interface CustomerRequestWizardStepsProps {
  currentStep: number
}

export function CustomerRequestWizardSteps({
  currentStep,
}: CustomerRequestWizardStepsProps) {
  return (
    <Card className="relative mb-3 overflow-hidden border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/75 px-4 py-2 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />

      <div className="flex items-center">
        {steps.map((label, index) => {
          const completed = index < currentStep
          const active = index === currentStep

          return (
            <Fragment key={label}>
              <div className="flex min-w-0 items-center gap-2">
                <span
                  className={
                    completed
                      ? 'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white'
                      : active
                        ? 'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white shadow-sm shadow-blue-200 ring-2 ring-white'
                        : 'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-[8px] font-semibold text-slate-500'
                  }
                >
                  {completed ? '✓' : index + 1}
                </span>

                <span
                  className={
                    active
                      ? 'truncate text-[9px] font-semibold text-blue-700'
                      : completed
                        ? 'truncate text-[9px] font-medium text-slate-700'
                        : 'truncate text-[9px] font-medium text-slate-500'
                  }
                >
                  {label}
                </span>
              </div>

              {index < steps.length - 1 ? (
                <div
                  className={
                    index < currentStep
                      ? 'mx-3 h-px min-w-8 flex-1 bg-emerald-600'
                      : 'mx-3 h-px min-w-8 flex-1 bg-slate-200'
                  }
                />
              ) : null}
            </Fragment>
          )
        })}
      </div>
    </Card>
  )
}
