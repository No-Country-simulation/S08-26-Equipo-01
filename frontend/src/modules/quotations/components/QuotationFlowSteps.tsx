interface Step {
  number: number
  label: string
  state: 'done' | 'current' | 'pending'
}

const steps: Step[] = [
  { number: 1, label: 'Solicitud', state: 'done' },
  { number: 2, label: 'Revisión', state: 'done' },
  { number: 3, label: 'Cotización', state: 'current' },
  { number: 4, label: 'Producción', state: 'pending' },
  { number: 5, label: 'Entrega', state: 'pending' },
]

export function QuotationFlowSteps() {
  return (
    <section className="relative overflow-x-auto rounded-xl border border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/75 px-4 py-2.5 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.28)]">
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400" />

      <div className="mb-2 flex min-w-[620px] items-center justify-between gap-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Progreso del trabajo
          </p>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Solicitud a entrega
          </p>
        </div>
        <p className="text-[8px] font-medium text-slate-500">
          Etapa actual · <span className="font-semibold text-blue-700">Cotización</span>
        </p>
      </div>

      <div className="flex min-w-[620px] items-start">
        {steps.map((step, index) => (
          <div
            key={step.label}
            className="flex min-w-0 flex-1 items-start last:flex-none"
          >
            <div className="flex flex-col items-center">
              <span
                className={
                  step.state === 'done'
                    ? 'flex h-5.5 w-5.5 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-semibold text-white'
                    : step.state === 'current'
                      ? 'flex h-5.5 w-5.5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-semibold text-white shadow-sm shadow-blue-200 ring-2 ring-white'
                      : 'flex h-5.5 w-5.5 items-center justify-center rounded-full border border-slate-300 bg-white/80 text-[8px] font-semibold text-slate-500'
                }
              >
                {step.state === 'done' ? '✓' : step.number}
              </span>
              <span
                className={
                  step.state === 'current'
                    ? 'mt-1.5 text-[9px] font-semibold text-blue-700'
                    : 'mt-1.5 text-[9px] font-medium text-slate-500'
                }
              >
                {step.label}
              </span>
            </div>

            {index < steps.length - 1 ? (
              <span
                className={
                  step.state === 'done'
                    ? 'mx-3 mt-2.5 h-px min-w-8 flex-1 bg-emerald-600'
                    : 'mx-3 mt-2.5 h-px min-w-8 flex-1 bg-slate-200'
                }
              />
            ) : null}
          </div>
        ))}
      </div>
    </section>
  )
}
