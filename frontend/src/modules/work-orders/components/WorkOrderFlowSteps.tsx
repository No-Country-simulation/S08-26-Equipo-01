import type { WorkOrderStatus } from '../types/workOrder.types'

export type WorkOrderWorkspaceView =
  | 'summary'
  | 'preparation'
  | 'production'
  | 'quality'
  | 'delivery'
  | 'traceability'

type OperationalView = Exclude<
  WorkOrderWorkspaceView,
  'summary' | 'traceability'
>

interface WorkOrderFlowStepsProps {
  status: WorkOrderStatus
  activeView: WorkOrderWorkspaceView
  onSelect: (view: WorkOrderWorkspaceView) => void
}

const operationalStages: Array<{
  view: OperationalView
  number: string
  label: string
  description: string
}> = [
  {
    view: 'preparation',
    number: '01',
    label: 'Preparación',
    description: 'Plan, material y ruta',
  },
  {
    view: 'production',
    number: '02',
    label: 'Producción',
    description: 'Operaciones y consumos',
  },
  {
    view: 'quality',
    number: '03',
    label: 'Calidad',
    description: 'Inspección y resolución',
  },
  {
    view: 'delivery',
    number: '04',
    label: 'Entrega',
    description: 'Despacho y evidencia',
  },
]

export function getCurrentWorkOrderView(
  status: WorkOrderStatus,
): OperationalView {
  if (status === 'CREATED' || status === 'CANCELLED') return 'preparation'

  if (status === 'READY_FOR_PRODUCTION' || status === 'IN_PRODUCTION') {
    return 'production'
  }

  if (
    status === 'QUALITY_PENDING' ||
    status === 'QUALITY_HOLD' ||
    status === 'REWORK_IN_PROGRESS'
  ) {
    return 'quality'
  }

  return 'delivery'
}

export function canOpenWorkOrderView(
  status: WorkOrderStatus,
  view: WorkOrderWorkspaceView,
): boolean {
  if (view === 'summary' || view === 'traceability') return true

  const currentView = getCurrentWorkOrderView(status)
  const currentIndex = operationalStages.findIndex(
    (stage) => stage.view === currentView,
  )
  const targetIndex = operationalStages.findIndex((stage) => stage.view === view)

  return targetIndex >= 0 && targetIndex <= currentIndex
}

export function WorkOrderFlowSteps({
  status,
  activeView,
  onSelect,
}: WorkOrderFlowStepsProps) {
  const currentView = getCurrentWorkOrderView(status)
  const currentIndex = operationalStages.findIndex(
    (stage) => stage.view === currentView,
  )

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-3.5 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Flujo de la orden
          </p>
          <p className="mt-0.5 text-[8px] text-slate-400">
            Consulta lo ya realizado y trabaja únicamente sobre la etapa disponible.
          </p>
        </div>
        <span className="hidden rounded-full bg-slate-100 px-2.5 py-1 text-[7px] font-semibold text-slate-500 sm:inline-flex">
          {status === 'DELIVERED' ? 'Proceso completado' : 'Proceso en curso'}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex min-w-[760px] items-stretch gap-1.5 p-2.5">
          <WorkspaceButton
            active={activeView === 'summary'}
            label="Resumen"
            description="Contexto completo"
            marker="⌂"
            onClick={() => onSelect('summary')}
          />

          {operationalStages.map((stage, index) => {
            const unlocked = index <= currentIndex
            const completed =
              index < currentIndex ||
              (status === 'DELIVERED' && stage.view === 'delivery')
            const current = index === currentIndex && status !== 'DELIVERED'

            return (
              <WorkspaceButton
                key={stage.view}
                active={activeView === stage.view}
                disabled={!unlocked}
                label={`${stage.number} · ${stage.label}`}
                description={
                  !unlocked
                    ? 'Pendiente de etapa anterior'
                    : completed
                      ? 'Completada · solo lectura'
                      : current
                        ? 'Etapa actual'
                        : stage.description
                }
                marker={completed ? '✓' : !unlocked ? '○' : '●'}
                state={completed ? 'complete' : current ? 'current' : 'locked'}
                onClick={() => onSelect(stage.view)}
              />
            )
          })}

          <WorkspaceButton
            active={activeView === 'traceability'}
            label="Trazabilidad"
            description="Historial completo"
            marker="↗"
            onClick={() => onSelect('traceability')}
          />
        </div>
      </div>
    </section>
  )
}

function WorkspaceButton({
  active,
  disabled = false,
  label,
  description,
  marker,
  state,
  onClick,
}: {
  active: boolean
  disabled?: boolean
  label: string
  description: string
  marker: string
  state?: 'complete' | 'current' | 'locked'
  onClick: () => void
}) {
  const stateClass =
    state === 'complete'
      ? 'bg-emerald-50 text-emerald-700'
      : state === 'current'
        ? 'bg-blue-50 text-blue-700'
        : 'bg-slate-100 text-slate-400'

  return (
    <button
      type="button"
      disabled={disabled}
      aria-current={active ? 'page' : undefined}
      title={disabled ? 'Esta etapa se habilita cuando concluya la anterior.' : undefined}
      onClick={onClick}
      className={
        active
          ? 'flex min-w-[116px] flex-1 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50/70 px-2.5 py-2 text-left shadow-sm transition'
          : disabled
            ? 'flex min-w-[116px] flex-1 cursor-not-allowed items-center gap-2 rounded-lg border border-transparent bg-slate-50/70 px-2.5 py-2 text-left opacity-65'
            : 'flex min-w-[116px] flex-1 items-center gap-2 rounded-lg border border-transparent px-2.5 py-2 text-left transition hover:border-slate-200 hover:bg-slate-50'
      }
    >
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[8px] font-bold ${stateClass}`}
      >
        {marker}
      </span>
      <span className="min-w-0">
        <span
          className={
            active
              ? 'block truncate text-[8.5px] font-semibold text-blue-950'
              : disabled
                ? 'block truncate text-[8.5px] font-semibold text-slate-400'
                : 'block truncate text-[8.5px] font-semibold text-slate-800'
          }
        >
          {label}
        </span>
        <span className="mt-0.5 block truncate text-[6.5px] text-slate-400">
          {description}
        </span>
      </span>
    </button>
  )
}
