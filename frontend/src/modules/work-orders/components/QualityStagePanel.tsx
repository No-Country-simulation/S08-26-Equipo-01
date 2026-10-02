import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  countQualityCheckResults,
  getNonConformityDispositionLabel,
  getQualityInspectionStatusPresentation,
} from '../model/qualityPresenter'
import type {
  NonConformityDto,
  QualityInspectionDto,
} from '../types/quality.types'
import type { WorkOrderStatus } from '../types/workOrder.types'

interface QualityStagePanelProps {
  inspection: QualityInspectionDto | null
  openNonConformity: NonConformityDto | null
  workOrderStatus: WorkOrderStatus
  canStart: boolean
  canComplete: boolean
  starting: boolean
  onStart: () => void
  onComplete: () => void
  onOpenNonConformity: () => void
  onOpenHistory: () => void
  inspectionCount: number
}

export function QualityStagePanel({
  inspection,
  openNonConformity,
  workOrderStatus,
  canStart,
  canComplete,
  starting,
  onStart,
  onComplete,
  onOpenNonConformity,
  onOpenHistory,
  inspectionCount,
}: QualityStagePanelProps) {
  const totals = inspection
    ? countQualityCheckResults(inspection.checks)
    : { pass: 0, fail: 0 }
  const status = inspection
    ? getQualityInspectionStatusPresentation(inspection.status)
    : null
  const isReinspection =
    inspection !== null && inspection.reworkNonConformityId !== null

  const nextStep = (() => {
    if (workOrderStatus === 'QUALITY_HOLD' && openNonConformity) {
      return {
        eyebrow: 'Decisión requerida',
        title: 'Resolver no conformidad',
        description:
          'La orden está retenida hasta definir y ejecutar una disposición válida.',
        tone: 'danger' as const,
      }
    }

    if (workOrderStatus === 'REWORK_IN_PROGRESS' && openNonConformity) {
      return {
        eyebrow: 'Retrabajo activo',
        title: 'Corregir y reinspeccionar',
        description:
          'La NC conserva la historia original y el retrabajo genera un nuevo ciclo trazable.',
        tone: 'warning' as const,
      }
    }

    if (inspection?.status === 'PENDING') {
      return {
        eyebrow: 'Inspección pendiente',
        title: isReinspection ? 'Iniciar reinspección' : 'Iniciar inspección',
        description:
          'El inspector debe tomar la inspección antes de registrar controles.',
        tone: 'info' as const,
      }
    }

    if (inspection?.status === 'IN_PROGRESS') {
      return {
        eyebrow: 'Inspección en curso',
        title: 'Completar controles',
        description:
          inspection.checks.length === 0
            ? 'Registra al menos una control antes de poder cerrar la inspección.'
            : 'Revisa PASS y FAIL antes de finalizar. El resultado quedará histórico.',
        tone: 'info' as const,
      }
    }

    if (inspection?.status === 'APPROVED') {
      return {
        eyebrow: 'Calidad aprobada',
        title: 'Lista para entrega',
        description:
          'La inspección fue aprobada y la orden puede continuar a Logística.',
        tone: 'success' as const,
      }
    }

    if (inspection?.status === 'REJECTED') {
      return {
        eyebrow: 'Inspección rechazada',
        title: 'No conformidad abierta',
        description:
          'El resultado rechazado debe resolverse antes de continuar el flujo.',
        tone: 'danger' as const,
      }
    }

    return {
      eyebrow: 'Calidad',
      title: 'Esperando inspección',
      description:
        'La inspección aparece después del handoff formal desde Producción.',
      tone: 'neutral' as const,
    }
  })()

  const toneClasses = {
    success: 'border-emerald-200 bg-emerald-50/65 text-emerald-900',
    danger: 'border-red-200 bg-red-50/65 text-red-900',
    warning: 'border-amber-200 bg-amber-50/65 text-amber-900',
    info: 'border-blue-100 bg-blue-50/60 text-blue-900',
    neutral: 'border-slate-200 bg-slate-50/70 text-slate-700',
  }

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Estado de calidad
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2 className="text-[12px] font-semibold text-slate-950">
            {inspection
              ? (isReinspection ? 'Reinspección' : 'Inspección') +
                ' #' +
                inspection.id
              : 'Sin inspección activa'}
          </h2>
          {status ? (
            <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
              {status.label}
            </Badge>
          ) : null}
        </div>
      </div>

      {inspection ? (
        <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/45">
          <div className="px-2.5 py-2.5">
            <p className="text-[7px] text-slate-400">Controles</p>
            <p className="mt-0.5 text-[12px] font-bold text-slate-950">
              {inspection.checks.length}
            </p>
          </div>
          <div className="px-2.5 py-2.5">
            <p className="text-[7px] text-slate-400">PASS</p>
            <p className="mt-0.5 text-[12px] font-bold text-emerald-700">
              {totals.pass}
            </p>
          </div>
          <div className="px-2.5 py-2.5">
            <p className="text-[7px] text-slate-400">FAIL</p>
            <p className="mt-0.5 text-[12px] font-bold text-red-600">
              {totals.fail}
            </p>
          </div>
        </div>
      ) : null}

      <div
        className={
          'mt-4 rounded-xl border px-3 py-3 ' +
          toneClasses[nextStep.tone]
        }
      >
        <p className="text-[7px] font-bold uppercase tracking-[0.09em] opacity-75">
          {nextStep.eyebrow}
        </p>
        <p className="mt-1 text-[9px] font-semibold">{nextStep.title}</p>
        <p className="mt-1 text-[7px] leading-3.5 opacity-80">
          {nextStep.description}
        </p>
      </div>

      {openNonConformity ? (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50/35 px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-red-600">
                No conformidad activa
              </p>
              <p className="mt-1 text-[9px] font-semibold text-slate-900">
                {openNonConformity.number}
              </p>
            </div>
            <Badge tone="danger" className="px-2 py-0.5 text-[7px]">
              OPEN
            </Badge>
          </div>
          <p className="mt-1 text-[7px] text-slate-500">
            {openNonConformity.affectedQuantity ?? '—'} piezas ·{' '}
            {openNonConformity.severity ?? 'severidad pendiente'} ·{' '}
            {getNonConformityDispositionLabel(openNonConformity.disposition)}
          </p>
          <Button
            variant="secondary"
            className="mt-2.5 !h-7 !w-full !justify-center !text-[7.5px]"
            onClick={onOpenNonConformity}
          >
            Gestionar no conformidad
          </Button>
        </div>
      ) : null}

      <div className="mt-auto space-y-2 pt-4">
        {canStart ? (
          <Button
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onStart}
            disabled={starting}
          >
            {starting
              ? 'Iniciando…'
              : isReinspection
                ? 'Iniciar reinspección'
                : 'Iniciar inspección'}
          </Button>
        ) : null}

        {canComplete ? (
          <Button
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onComplete}
            disabled={!inspection || inspection.checks.length === 0}
          >
            {isReinspection
              ? 'Revisar y finalizar reinspección'
              : 'Revisar y finalizar inspección'}
          </Button>
        ) : null}

        {inspectionCount > 1 ? (
          <Button
            variant="secondary"
            className="!h-7 !w-full !justify-center !text-[7.5px]"
            onClick={onOpenHistory}
          >
            Ver historial de inspecciones
          </Button>
        ) : null}
      </div>
    </aside>
  )
}
