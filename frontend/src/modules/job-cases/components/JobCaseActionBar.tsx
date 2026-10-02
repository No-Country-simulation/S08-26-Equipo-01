import type { AuthenticatedUser } from '@/modules/auth'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getJobCaseCapabilities } from '../model/jobCaseCapabilities'
import {
  formatJobCaseDate,
  getJobCaseClarificationSummary,
  getJobCaseMaterialSummary,
  getJobCaseStatusPresentation,
} from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseActionBarProps {
  jobCase: JobCaseDetailDto
  user: AuthenticatedUser
  taking: boolean
  completing: boolean
  creatingQuotation: boolean
  quotationId: number | null
  quotationLookupReady: boolean
  onTake: () => void
  onRequestInformation: () => void
  onDefineMaterial: () => void
  onComplete: () => void
  onCreateQuotation: () => void
  onOpenQuotation: () => void
}

type ReviewTone = 'neutral' | 'info' | 'warning' | 'success' | 'danger'

interface ReviewContext {
  eyebrow: string
  title: string
  description: string
  tone: ReviewTone
}

const toneClasses: Record<ReviewTone, string> = {
  neutral: 'border-slate-200 bg-slate-50/70',
  info: 'border-blue-100 bg-blue-50/65',
  warning: 'border-amber-200 bg-amber-50/70',
  success: 'border-emerald-200 bg-emerald-50/70',
  danger: 'border-red-200 bg-red-50/70',
}

const eyebrowClasses: Record<ReviewTone, string> = {
  neutral: 'text-slate-500',
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
}

function getReviewContext(
  jobCase: JobCaseDetailDto,
  completeBlockReason: string | null,
): ReviewContext {
  switch (jobCase.status) {
    case 'SUBMITTED':
      return {
        eyebrow: 'Asignación pendiente',
        title: 'El expediente necesita un responsable',
        description:
          'Comercial debe tomar el expediente antes de iniciar la revisión interna.',
        tone: 'neutral',
      }
    case 'WAITING_CUSTOMER_INFO':
      return {
        eyebrow: 'Revisión pausada',
        title: 'Esperando información del cliente',
        description:
          'La revisión continuará cuando el cliente responda la aclaración pendiente.',
        tone: 'warning',
      }
    case 'UNDER_REVIEW':
      if (completeBlockReason) {
        return {
          eyebrow: 'Pendiente de revisión',
          title: 'Todavía falta resolver información',
          description: completeBlockReason,
          tone: 'warning',
        }
      }

      return {
        eyebrow: 'Decisión disponible',
        title: 'La revisión puede completarse',
        description:
          'La información bloqueante está resuelta. Confirma el expediente antes de enviarlo a cotización.',
        tone: 'info',
      }
    case 'READY_FOR_QUOTATION':
      return {
        eyebrow: 'Revisión completada',
        title: 'Expediente listo para cotizar',
        description:
          'No existen pendientes bloqueantes. Comercial puede preparar la propuesta.',
        tone: 'success',
      }
    case 'AWAITING_WORK_ORDER':
      return {
        eyebrow: 'Handoff a Operación',
        title: 'Cotización aprobada · pendiente de OT',
        description:
          'El cliente aprobó la propuesta. El siguiente paso se gestiona desde Órdenes de trabajo.',
        tone: 'warning',
      }
    case 'IN_PRODUCTION':
      return {
        eyebrow: 'Etapa operativa',
        title: 'El trabajo ya está en producción',
        description:
          'La revisión y la cotización quedaron atrás. El seguimiento continúa desde la orden de trabajo.',
        tone: 'info',
      }
    case 'COMPLETED':
      return {
        eyebrow: 'Trabajo finalizado',
        title: 'Expediente completado',
        description:
          'El trabajo terminó su recorrido operativo y el expediente quedó cerrado.',
        tone: 'success',
      }
    case 'CANCELLED':
      return {
        eyebrow: 'Flujo detenido',
        title: 'Expediente cancelado',
        description:
          jobCase.cancellationReason ??
          'El expediente se cerró antes de continuar con el trabajo.',
        tone: 'danger',
      }
  }
}

function Checkpoint({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'success' | 'warning' | 'neutral'
}) {
  const dotClass =
    tone === 'success'
      ? 'bg-emerald-500'
      : tone === 'warning'
        ? 'bg-amber-500'
        : 'bg-slate-300'

  return (
    <div className="relative flex gap-3 pb-3 last:pb-0">
      <div className="relative flex w-3 shrink-0 justify-center">
        <span className={`mt-1.5 h-2 w-2 rounded-full ${dotClass}`} />
        <span className="absolute bottom-0 top-4 w-px bg-slate-100 last:hidden" />
      </div>
      <div className="min-w-0">
        <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
          {label}
        </p>
        <p className="mt-0.5 text-[8px] font-medium leading-4 text-slate-700">
          {value}
        </p>
      </div>
    </div>
  )
}

export function JobCaseActionBar({
  jobCase,
  user,
  taking,
  completing,
  creatingQuotation,
  quotationId,
  quotationLookupReady,
  onTake,
  onRequestInformation,
  onDefineMaterial,
  onComplete,
  onCreateQuotation,
  onOpenQuotation,
}: JobCaseActionBarProps) {
  const capabilities = getJobCaseCapabilities(jobCase, user)
  const status = getJobCaseStatusPresentation(jobCase.status)
  const canOpenQuotation = quotationId !== null
  const canCreateQuotation =
    capabilities.canCreateQuotation &&
    quotationLookupReady &&
    quotationId === null
  const context = getReviewContext(
    jobCase,
    capabilities.completeBlockReason,
  )
  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const materialSummary = getJobCaseMaterialSummary(jobCase)
  const openClarifications = jobCase.informationRequests.filter(
    (request) => request.open,
  ).length
  const materialPending =
    jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED' &&
    jobCase.materialSpecification === null
  const isOperationalHandoff =
    jobCase.status === 'AWAITING_WORK_ORDER' ||
    jobCase.status === 'IN_PRODUCTION' ||
    jobCase.status === 'COMPLETED'

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <SidebarNavIcon name="quality" className="h-[17px] w-[17px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            {isOperationalHandoff ? 'Expediente' : 'Revisión'}
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-950">
              {status.label}
            </h2>
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              Interno
            </Badge>
          </div>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            {jobCase.status === 'AWAITING_WORK_ORDER'
              ? 'La responsabilidad operativa ya pasó a la bandeja de Órdenes de trabajo.'
              : jobCase.status === 'IN_PRODUCTION'
                ? 'La ejecución continúa desde la orden de trabajo vinculada.'
                : jobCase.status === 'COMPLETED'
                  ? 'Consulta aquí el cierre y la trazabilidad del expediente.'
                  : 'Valida que exista información suficiente antes de iniciar la cotización.'}
          </p>
        </div>
      </div>

      <div
        className={`mt-4 rounded-xl border px-3.5 py-3 ${toneClasses[context.tone]}`}
      >
        <p
          className={`text-[8px] font-bold uppercase tracking-[0.1em] ${eyebrowClasses[context.tone]}`}
        >
          {context.eyebrow}
        </p>
        <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-950">
          {context.title}
        </p>
        <p className="mt-1 text-[9px] leading-4 text-slate-600">
          {context.description}
        </p>

        <div className="mt-3 space-y-2.5">
          {capabilities.canRequestInformation ||
          capabilities.canDefineMaterial ? (
            <div className="flex gap-1.5">
              {capabilities.canRequestInformation ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="!h-7 !min-w-0 !flex-1 !px-2.5 !text-[8px]"
                  onClick={onRequestInformation}
                >
                  Solicitar aclaración
                </Button>
              ) : null}

              {capabilities.canDefineMaterial ? (
                <Button
                  size="sm"
                  variant="secondary"
                  className="!h-7 !min-w-0 !flex-1 !px-2.5 !text-[8px]"
                  onClick={onDefineMaterial}
                >
                  {jobCase.materialSpecification
                    ? 'Actualizar material'
                    : jobCase.request.materialRequirementType ===
                        'ASSISTANCE_REQUIRED'
                      ? 'Definir material'
                      : 'Añadir criterio técnico'}
                </Button>
              ) : null}
            </div>
          ) : null}

          {capabilities.canTake ||
          capabilities.canAttemptComplete ||
          canOpenQuotation ||
          canCreateQuotation ? (
            <div className="border-t border-current/10 pt-2.5">
              {capabilities.canTake ? (
                <Button
                  size="sm"
                  className="!h-8 !w-full !justify-center !px-3 !text-[8px]"
                  onClick={onTake}
                  disabled={taking}
                >
                  {taking ? 'Tomando…' : 'Tomar expediente'}
                </Button>
              ) : null}

              {capabilities.canAttemptComplete ? (
                <Button
                  size="sm"
                  className="!h-8 !w-full !justify-center !px-3 !text-[8px]"
                  onClick={onComplete}
                  disabled={completing || !capabilities.canCompleteReview}
                >
                  {completing ? 'Completando…' : 'Completar revisión'}
                </Button>
              ) : null}

              {canOpenQuotation ? (
                <Button
                  size="sm"
                  className="!h-8 !w-full !justify-center !px-3 !text-[8px]"
                  onClick={onOpenQuotation}
                >
                  Abrir cotización
                </Button>
              ) : canCreateQuotation ? (
                <Button
                  size="sm"
                  className="!h-8 !w-full !justify-center !px-3 !text-[8px]"
                  onClick={onCreateQuotation}
                  disabled={creatingQuotation}
                >
                  {creatingQuotation ? 'Creando…' : 'Crear cotización'}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="mt-5">
        <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Estado de la revisión
        </p>

        <div className="mt-3">
          <Checkpoint
            label="Solicitud"
            value="Información base recibida"
            tone="success"
          />
          <Checkpoint
            label="Documentación"
            value={
              jobCase.documents.length > 0
                ? `${jobCase.documents.length} archivo${
                    jobCase.documents.length === 1 ? '' : 's'
                  } disponible${
                    jobCase.documents.length === 1 ? '' : 's'
                  }`
                : 'Sin archivos adjuntos'
            }
            tone={jobCase.documents.length > 0 ? 'success' : 'neutral'}
          />
          <Checkpoint
            label="Aclaraciones"
            value={clarificationSummary}
            tone={openClarifications > 0 ? 'warning' : 'success'}
          />
          <Checkpoint
            label="Material"
            value={materialSummary}
            tone={materialPending ? 'warning' : 'success'}
          />
        </div>
      </div>

      <div className="mt-auto border-t border-slate-100 pt-4">
        <p className="text-[7px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Gestión interna
        </p>
        <dl className="mt-2 divide-y divide-slate-100">
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">Responsable</dt>
            <dd className="truncate text-[9px] font-semibold text-slate-900">
              {jobCase.assignedToName ?? 'Sin asignar'}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">
              Tomado para revisión
            </dt>
            <dd className="text-right text-[8px] font-medium text-slate-700">
              {formatJobCaseDate(jobCase.assignedAt)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">Documentos</dt>
            <dd className="text-[9px] font-semibold text-slate-900">
              {jobCase.documents.length}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-2.5">
            <dt className="text-[8px] text-slate-500">Aclaraciones</dt>
            <dd className="text-right text-[9px] font-semibold text-slate-900">
              {clarificationSummary}
            </dd>
          </div>
        </dl>
      </div>
    </aside>
  )
}
