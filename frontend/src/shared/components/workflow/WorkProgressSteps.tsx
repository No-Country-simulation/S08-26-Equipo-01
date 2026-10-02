import { cn } from '@/shared/lib/cn'

interface WorkProgressStepsProps {
  currentStep: number
  cancelled?: boolean
  deliveryComplete?: boolean
  variant?: 'light' | 'dark'
}

const steps = ['Solicitud', 'Revisión', 'Cotización', 'Producción', 'Entrega']

export function WorkProgressSteps({
  currentStep,
  cancelled = false,
  deliveryComplete = false,
  variant = 'light',
}: WorkProgressStepsProps) {
  const current = Math.max(0, Math.min(currentStep, steps.length - 1))
  const currentLabel = cancelled ? 'Cancelada' : steps[current]
  const dark = variant === 'dark'

  return (
    <section
      className={cn(
        'relative overflow-hidden',
        dark
          ? 'mt-5 border-t border-white/10 pt-4'
          : 'mb-3 rounded-xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/75 px-4 py-2.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]',
      )}
    >
      {!dark ? (
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />
      ) : null}

      <div
        className={cn(
          'flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between',
          !dark && 'mb-2',
        )}
      >
        <div>
          <p
            className={cn(
              'text-[8px] font-bold uppercase tracking-[0.12em]',
              dark ? 'text-blue-300' : 'text-blue-600',
            )}
          >
            Progreso del trabajo
          </p>
          <p
            className={cn(
              'mt-0.5 text-[9px] font-medium',
              dark ? 'text-slate-300' : 'text-slate-500',
            )}
          >
            Solicitud a entrega
          </p>
        </div>

        <p
          className={cn(
            'text-[8px] font-medium',
            dark ? 'text-slate-400' : 'text-slate-500',
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

      <div className={cn('overflow-x-auto', dark ? 'pt-3' : 'pb-0.5')}>
        <div className="flex min-w-[560px] items-start">
          {steps.map((step, index) => {
            const completeDelivery = index === 4 && deliveryComplete
            const complete =
              !cancelled && (index < current || completeDelivery)
            const active = !cancelled && index === current && !completeDelivery
            const cancelledStep = cancelled && index === 0

            return (
              <div key={step} className="flex min-w-0 flex-1 items-start">
                <div className="flex min-w-0 shrink-0 items-center gap-2">
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
                          ? 'border border-white/15 bg-white/[0.045] text-slate-500'
                          : 'border border-slate-300 bg-white/80 text-slate-500'),
                      cancelledStep && 'bg-red-500 text-white',
                    )}
                  >
                    {complete ? '✓' : index + 1}
                  </span>

                  <span
                    className={cn(
                      'whitespace-nowrap text-[9px]',
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
                              ? 'font-medium text-slate-500'
                              : 'font-medium text-slate-500',
                    )}
                  >
                    {step}
                  </span>
                </div>

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

        {cancelled ? (
          <p
            className={cn(
              'mt-2.5 text-[9px] font-medium',
              dark ? 'text-red-300' : 'text-red-700',
            )}
          >
            La solicitud fue cancelada antes de continuar el flujo.
          </p>
        ) : null}
      </div>
    </section>
  )
}
