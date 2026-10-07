import { Link } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

interface WorkProgressStepsProps {
  currentStep: number
  cancelled?: boolean
  deliveryComplete?: boolean
  variant?: 'light' | 'dark'
  heading?: string
  stepHrefs?: Partial<Record<number, string>>
  stepDetails?: Partial<Record<number, string>>
}

const steps = [
  'Solicitud',
  'Cotización',
  'Orden de trabajo',
  'Producción',
  'Calidad',
  'Entrega',
]

export function WorkProgressSteps({
  currentStep,
  cancelled = false,
  deliveryComplete = false,
  variant = 'light',
  heading = 'Progreso del trabajo',
  stepHrefs = {},
  stepDetails = {},
}: WorkProgressStepsProps) {
  const current = Math.max(0, Math.min(currentStep, steps.length - 1))
  const currentLabel = cancelled ? 'Cancelada' : steps[current]
  const dark = variant === 'dark'

  const getState = (index: number) => {
    const completeDelivery = index === 5 && deliveryComplete
    const complete = !cancelled && (index < current || completeDelivery)
    const active = !cancelled && index === current && !completeDelivery
    const cancelledStep = cancelled && index === 0

    return { complete, active, cancelledStep }
  }

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        dark
          ? 'mt-5 border-t border-white/10 pt-4'
          : 'mb-3 rounded-xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/75 px-4 py-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]',
      )}
    >
      {!dark ? (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between',
          !dark && 'mb-3',
        )}
      >
        <div>
          <p
            className={cn(
              'text-[9px] font-bold uppercase tracking-[0.12em]',
              dark ? 'text-blue-300' : 'text-blue-700',
            )}
          >
            {heading}
          </p>
          <p
            className={cn(
              'mt-0.5 text-[10px] font-medium',
              dark ? 'text-slate-300' : 'text-slate-600',
            )}
          >
            Selecciona una etapa disponible para abrir su proceso.
          </p>
        </div>

        <p
          className={cn(
            'text-[9px] font-medium',
            dark ? 'text-slate-400' : 'text-slate-600',
          )}
        >
          Etapa actual ·{' '}
          <span
            className={cn(
              'font-semibold',
              cancelled
                ? dark
                  ? 'text-red-300'
                  : 'text-red-700'
                : dark
                  ? 'text-blue-200'
                  : 'text-blue-700',
            )}
          >
            {currentLabel}
          </span>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:hidden">
        {steps.map((step, index) => {
          const { complete, active, cancelledStep } = getState(index)
          const href = stepHrefs[index]
          const detail = stepDetails[index]
          const navigable = Boolean(href) && !cancelled

          const content = (
            <>
              <span
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                  complete && 'bg-emerald-600 text-white',
                  active && 'bg-blue-600 text-white ring-2 ring-blue-100',
                  !complete &&
                    !active &&
                    !cancelledStep &&
                    (dark
                      ? 'border border-white/15 bg-white/[0.045] text-slate-400'
                      : 'border border-slate-300 bg-white text-slate-600'),
                  cancelledStep && 'bg-red-500 text-white',
                )}
              >
                {complete ? '✓' : index + 1}
              </span>
              <span className="min-w-0">
                <span
                  className={cn(
                    'block text-[10px] font-semibold leading-4',
                    active
                      ? dark
                        ? 'text-blue-200'
                        : 'text-blue-700'
                      : complete
                        ? dark
                          ? 'text-slate-200'
                          : 'text-slate-800'
                        : cancelledStep
                          ? dark
                            ? 'text-red-300'
                            : 'text-red-700'
                          : dark
                            ? 'text-slate-400'
                            : 'text-slate-600',
                  )}
                >
                  {step}
                </span>
                {detail || navigable ? (
                  <span
                    className={cn(
                      'mt-0.5 block truncate text-[9px]',
                      navigable
                        ? dark
                          ? 'text-blue-300'
                          : 'text-blue-700'
                        : dark
                          ? 'text-slate-400'
                          : 'text-slate-500',
                    )}
                  >
                    {detail ?? 'Abrir etapa'}
                    {navigable ? ' ↗' : ''}
                  </span>
                ) : null}
              </span>
            </>
          )

          const className = cn(
            'flex min-h-11 items-center gap-2 rounded-lg border px-2.5 py-2 text-left',
            dark
              ? 'border-white/10 bg-white/[0.035]'
              : 'border-slate-200 bg-white/75',
            active && (dark ? 'border-blue-400/40' : 'border-blue-200 bg-blue-50/70'),
          )

          return navigable && href ? (
            <Link key={step} to={href} className={className}>
              {content}
            </Link>
          ) : (
            <div key={step} className={className}>
              {content}
            </div>
          )
        })}
      </div>

      <div className={cn('hidden overflow-x-auto lg:block', dark ? 'pt-3' : 'pb-0.5')}>
        <div className="flex min-w-[800px] items-start">
          {steps.map((step, index) => {
            const { complete, active, cancelledStep } = getState(index)
            const href = stepHrefs[index]
            const detail = stepDetails[index]
            const navigable = Boolean(href) && !cancelled

            const marker = (
              <>
                <span
                  className={cn(
                    'flex h-5.5 w-5.5 shrink-0 items-center justify-center rounded-full text-[8px] font-bold',
                    complete && 'bg-emerald-600 text-white',
                    active &&
                      (dark
                        ? 'bg-blue-500 text-white shadow-sm shadow-blue-950/40 ring-2 ring-slate-950'
                        : 'bg-blue-600 text-white shadow-sm shadow-blue-200 ring-2 ring-white'),
                    !complete &&
                      !active &&
                      !cancelledStep &&
                      (dark
                        ? 'border border-white/15 bg-white/[0.045] text-slate-400'
                        : 'border border-slate-300 bg-white/80 text-slate-600'),
                    cancelledStep && 'bg-red-500 text-white',
                  )}
                >
                  {complete ? '✓' : index + 1}
                </span>

                <span className="min-w-0">
                  <span
                    className={cn(
                      'block whitespace-nowrap text-[10px]',
                      active
                        ? dark
                          ? 'font-semibold text-blue-200'
                          : 'font-semibold text-blue-700'
                        : complete
                          ? dark
                            ? 'font-medium text-slate-300'
                            : 'font-medium text-slate-700'
                          : cancelledStep
                            ? dark
                              ? 'font-semibold text-red-300'
                              : 'font-semibold text-red-700'
                            : dark
                              ? 'font-medium text-slate-400'
                              : 'font-medium text-slate-600',
                    )}
                  >
                    {step}
                  </span>
                  {detail || navigable ? (
                    <span
                      className={cn(
                        'mt-0.5 block max-w-[122px] truncate text-[8px]',
                        navigable
                          ? dark
                            ? 'text-blue-300/90'
                            : 'text-blue-700'
                          : dark
                            ? 'text-slate-400'
                            : 'text-slate-500',
                      )}
                    >
                      {detail ?? 'Abrir etapa'}
                      {navigable ? ' ↗' : ''}
                    </span>
                  ) : null}
                </span>
              </>
            )

            return (
              <div key={step} className="flex min-w-0 flex-1 items-start">
                {navigable && href ? (
                  <Link
                    to={href}
                    className={cn(
                      '-m-1.5 flex min-w-0 shrink-0 items-center gap-2 rounded-lg p-1.5 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-200',
                      dark
                        ? 'hover:bg-white/[0.06]'
                        : 'hover:bg-blue-50 hover:ring-1 hover:ring-blue-100',
                    )}
                    title={`Abrir ${step.toLocaleLowerCase('es-MX')}`}
                  >
                    {marker}
                  </Link>
                ) : (
                  <div className="flex min-w-0 shrink-0 items-center gap-2">
                    {marker}
                  </div>
                )}

                {index < steps.length - 1 ? (
                  <div
                    className={cn(
                      'mx-3 mt-2.5 h-px min-w-8 flex-1',
                      !cancelled && index < current
                        ? dark
                          ? 'bg-emerald-400/70'
                          : 'bg-emerald-600'
                        : dark
                          ? 'bg-white/10'
                          : 'bg-slate-200',
                    )}
                  />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>

      {cancelled ? (
        <p
          className={cn(
            'mt-2.5 text-[10px] font-medium',
            dark ? 'text-red-300' : 'text-red-700',
          )}
        >
          La solicitud fue cancelada antes de continuar el flujo.
        </p>
      ) : null}
    </section>
  )
}
