import { Link, useNavigate } from 'react-router-dom'
import type { CustomerQuotationStatus } from '@/modules/quotations'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge, type BadgeProps } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import {
  formatCustomerRequestDate,
  formatCustomerRequestDateTime,
  getCustomerRequestStatusPresentation,
} from '../model/customerRequestPresenter'
import type {
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
} from '../types/customerRequest.types'
import { CustomerRequestFlowSteps } from './CustomerRequestFlowSteps'
import { CustomerRequestsBackButton } from './CustomerRequestsBackButton'

interface CustomerRequestOverviewProps {
  customerId: number
  request: CustomerRequestDetailDto
  quotationId?: number
  quotationStatus?: CustomerQuotationStatus
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'
  canWrite: boolean
  canCancel: boolean
  openInformationRequest: CustomerInformationRequestDto | null
  latestResponse: CustomerInformationRequestDto | null
  onRespond: (request: CustomerInformationRequestDto) => void
  onCancel: () => void
}

interface DisplayStatus {
  label: string
  tone: BadgeProps['tone']
}

interface NextStepPresentation {
  eyebrow: string
  title: string
  description: string
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger'
  action?: 'respond' | 'quotation'
}

const nextStepToneClasses: Record<NextStepPresentation['tone'], string> = {
  neutral: 'border-slate-200 bg-slate-50/70',
  info: 'border-blue-100 bg-blue-50/65',
  warning: 'border-amber-200 bg-amber-50/70',
  success: 'border-emerald-200 bg-emerald-50/70',
  danger: 'border-red-200 bg-red-50/70',
}

const nextStepEyebrowClasses: Record<NextStepPresentation['tone'], string> = {
  neutral: 'text-slate-500',
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
}

function getDisplayStatus(
  request: CustomerRequestDetailDto,
  deliveryProgress?: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED',
): DisplayStatus {
  const requestStatus = getCustomerRequestStatusPresentation(
    request.jobCase.status,
  )

  if (request.jobCase.status === 'COMPLETED') return requestStatus
  if (deliveryProgress === 'IN_TRANSIT') {
    return { label: 'En camino', tone: 'info' }
  }
  if (deliveryProgress === 'PARTIAL') {
    return { label: 'Entrega parcial', tone: 'warning' }
  }
  if (deliveryProgress === 'DELIVERED') {
    return { label: 'Entregada', tone: 'success' }
  }

  return requestStatus
}

function getNextStep(
  request: CustomerRequestDetailDto,
  deliveryProgress: 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED' | undefined,
  openInformationRequest: CustomerInformationRequestDto | null,
  quotationId?: number,
  quotationStatus?: CustomerQuotationStatus,
): NextStepPresentation {
  if (request.jobCase.status === 'CANCELLED') {
    return {
      eyebrow: 'Flujo detenido',
      title: 'Solicitud cancelada',
      description:
        request.jobCase.cancellationReason ??
        'La solicitud se cerró antes de continuar con el trabajo.',
      tone: 'danger',
    }
  }

  if (
    request.jobCase.status === 'COMPLETED' ||
    deliveryProgress === 'DELIVERED'
  ) {
    return {
      eyebrow: 'Trabajo finalizado',
      title: 'Entrega completada',
      description:
        'La cantidad solicitada figura como entregada y el trabajo llegó al final de su recorrido.',
      tone: 'success',
    }
  }

  if (deliveryProgress === 'IN_TRANSIT' || deliveryProgress === 'PARTIAL') {
    return {
      eyebrow: 'Entrega en curso',
      title:
        deliveryProgress === 'IN_TRANSIT'
          ? 'Tu trabajo va en camino'
          : 'La entrega ya comenzó',
      description:
        'Logística actualizará el seguimiento conforme se registren los movimientos de entrega.',
      tone: 'info',
    }
  }

  if (openInformationRequest) {
    return {
      eyebrow: 'Acción requerida',
      title: 'Necesitamos información de tu empresa',
      description: openInformationRequest.question,
      tone: 'warning',
      action: 'respond',
    }
  }

  switch (request.jobCase.status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return {
        eyebrow: 'Revisión en curso',
        title: 'El equipo está revisando tu solicitud',
        description:
          'No necesitas hacer nada por ahora. Te avisaremos si necesitamos información adicional.',
        tone: 'neutral',
      }
    case 'WAITING_CUSTOMER_INFO':
      return {
        eyebrow: 'Pendiente de información',
        title: 'La revisión está esperando datos de tu empresa',
        description:
          'Revisa la actividad de la solicitud para identificar la información pendiente.',
        tone: 'warning',
      }
    case 'READY_FOR_QUOTATION':
      if (!quotationId || !quotationStatus) {
        return {
          eyebrow: 'Siguiente etapa',
          title: 'La revisión técnica terminó',
          description:
            'El equipo está preparando la propuesta comercial. Te avisaremos cuando esté disponible.',
          tone: 'info',
        }
      }

      switch (quotationStatus) {
        case 'SENT':
          return {
            eyebrow: 'Propuesta disponible',
            title: 'Tu cotización ya está lista',
            description:
              'Comercial ya envió una propuesta para esta solicitud. Puedes revisarla directamente desde aquí.',
            tone: 'info',
            action: 'quotation',
          }
        case 'ADJUSTMENT_REQUESTED':
          return {
            eyebrow: 'Ajuste en preparación',
            title: 'Comercial está preparando una nueva revisión',
            description:
              'Tu solicitud de ajuste fue recibida. La revisión anterior permanece disponible como referencia.',
            tone: 'warning',
            action: 'quotation',
          }
        case 'APPROVED':
          return {
            eyebrow: 'Propuesta aprobada',
            title: 'La cotización ya fue aceptada',
            description:
              'El equipo interno está preparando la orden de trabajo para iniciar la etapa operativa.',
            tone: 'success',
            action: 'quotation',
          }
        case 'REJECTED':
          return {
            eyebrow: 'Propuesta cerrada',
            title: 'La cotización fue rechazada',
            description:
              'Comercial puede preparar una nueva revisión si el trabajo continúa.',
            tone: 'danger',
            action: 'quotation',
          }
        case 'EXPIRED':
          return {
            eyebrow: 'Vigencia terminada',
            title: 'La cotización venció',
            description:
              'La propuesta ya no admite respuesta. Comercial deberá emitir una nueva revisión para continuar.',
            tone: 'warning',
            action: 'quotation',
          }
        case 'CANCELLED':
          return {
            eyebrow: 'Revisión cancelada',
            title: 'La cotización ya no está activa',
            description:
              'Comercial puede generar una nueva revisión si el proceso debe continuar.',
            tone: 'danger',
            action: 'quotation',
          }
        case 'REPLACED':
          return {
            eyebrow: 'Revisión reemplazada',
            title: 'Existe una revisión posterior',
            description:
              'Consulta la cotización para revisar el historial comercial de esta solicitud.',
            tone: 'neutral',
            action: 'quotation',
          }
      }
    case 'IN_PRODUCTION':
      return {
        eyebrow: 'Producción activa',
        title: 'El trabajo está en fabricación',
        description:
          'El equipo continúa con la ejecución. El seguimiento avanzará cuando existan movimientos de entrega.',
        tone: 'info',
      }
  }
}

export function CustomerRequestOverview({
  customerId,
  request,
  quotationId,
  quotationStatus,
  deliveryProgress,
  canWrite,
  canCancel,
  openInformationRequest,
  latestResponse,
  onRespond,
  onCancel,
}: CustomerRequestOverviewProps) {
  const navigate = useNavigate()
  const status = getDisplayStatus(request, deliveryProgress)
  const nextStep = getNextStep(
    request,
    deliveryProgress,
    openInformationRequest,
    quotationId,
    quotationStatus,
  )
  const destination = request.deliveryDestination
  const destinationLabel =
    destination.mode === 'CUSTOMER_PICKUP'
      ? 'Recolección en planta'
      : destination.mode === 'DEFINE_LATER'
        ? 'Destino por definir'
        : destination.label ?? 'Destino acordado'
  const destinationDetail =
    destination.mode === 'CUSTOMER_PICKUP'
      ? 'La empresa recogerá el pedido cuando esté listo.'
      : destination.mode === 'DEFINE_LATER'
        ? 'El destino se acordará durante la revisión.'
        : [
            destination.address,
            destination.city,
            destination.state,
            destination.postalCode,
            destination.country,
          ]
            .filter(Boolean)
            .join(', ')

  return (
    <>
      <div className="mb-3 flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
            <SidebarNavIcon name="requests" className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Gestión de trabajos
            </p>

            <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
              <h1 className="max-w-3xl truncate text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
                {request.title}
              </h1>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
                {status.label}
              </Badge>
              <span className="text-[8px] font-semibold text-slate-400">
                {request.requestNumber}
              </span>
            </div>

            <p className="mt-0.5 truncate text-[10px] text-slate-500">
              Seguimiento del trabajo desde la solicitud hasta la entrega.
            </p>
          </div>
        </div>

        <CustomerRequestsBackButton
          onClick={() => navigate(`/portal/${customerId}/requests`)}
        />
      </div>

      <CustomerRequestFlowSteps
        status={request.jobCase.status}
        deliveryProgress={deliveryProgress}
      />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Card className="border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Información base
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Detalles del trabajo
              </h2>
            </div>
          </div>

          <div className="mt-3 grid gap-2 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">Material</p>
              <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-950">
                {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                  ? 'Asesoría técnica'
                  : request.materialRequirement}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">
                Fecha requerida
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                {formatCustomerRequestDate(request.requestedDeliveryDate)}
              </p>
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Descripción
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
              {request.description}
            </p>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Entrega acordada
            </p>
            <div className="mt-2 rounded-xl bg-slate-50/80 px-3 py-2.5">
              <p className="text-[10px] font-semibold text-slate-900">
                {destinationLabel}
              </p>
              <p className="mt-0.5 text-[9px] leading-4 text-slate-600">
                {destinationDetail}
              </p>
              {destination.contactName ? (
                <p className="mt-1 text-[8px] text-slate-500">
                  Contacto: {destination.contactName}
                  {destination.contactPhone
                    ? ' · ' + destination.contactPhone
                    : ''}
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Requisitos técnicos
            </p>
            <div className="mt-2 grid gap-2 sm:grid-cols-[0.38fr_0.62fr]">
              <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                <p className="text-[8px] text-slate-500">Definición</p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
                  {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                    ? 'Asesoría técnica requerida'
                    : 'Material especificado'}
                </p>
              </div>
              <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
                <p className="text-[8px] text-slate-500">Detalle</p>
                <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-4 text-slate-700">
                  {request.materialRequirement}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Seguimiento
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-950">
                  {status.label}
                </h2>
                <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
            </div>
          </div>

          <div
            className={`mt-3 rounded-xl border px-3.5 py-3 ${nextStepToneClasses[nextStep.tone]}`}
          >
            <p
              className={`text-[8px] font-bold uppercase tracking-[0.1em] ${nextStepEyebrowClasses[nextStep.tone]}`}
            >
              {nextStep.eyebrow}
            </p>
            <p className="mt-1 text-[11px] font-semibold leading-5 text-slate-950">
              {nextStep.title}
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-600">
              {nextStep.description}
            </p>

            {nextStep.action === 'respond' && openInformationRequest ? (
              canWrite ? (
                <Button
                  size="sm"
                  className="mt-3 !h-7 !px-3 !text-[9px]"
                  onClick={() => onRespond(openInformationRequest)}
                >
                  Responder
                </Button>
              ) : (
                <p className="mt-2 text-[8px] font-medium text-amber-700">
                  Tu rol es de consulta. Un administrador o solicitante debe
                  responder.
                </p>
              )
            ) : null}

            {nextStep.action === 'quotation' && quotationId ? (
              <Link
                to={`/portal/${customerId}/quotations/${quotationId}`}
                className="mt-3 inline-flex h-7 items-center rounded-lg border border-blue-200 bg-white px-3 text-[8px] font-semibold text-blue-700 transition hover:bg-blue-50"
              >
                Ver cotización
              </Link>
            ) : null}
          </div>

          {latestResponse && !openInformationRequest ? (
            <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-3 py-2.5">
              <span className="mt-0.5 text-[10px] text-emerald-600">✓</span>
              <div>
                <p className="text-[8px] font-semibold text-emerald-800">
                  Última respuesta registrada
                </p>
                <p className="mt-0.5 text-[8px] leading-4 text-emerald-700">
                  {formatCustomerRequestDateTime(latestResponse.respondedAt ?? '')}
                </p>
              </div>
            </div>
          ) : null}

          <dl className="mt-3 divide-y divide-slate-100 border-t border-slate-100">
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Expediente</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.jobCase.caseNumber}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Solicitada por</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.requestedByName}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Referencia</dt>
              <dd className="truncate text-[9px] font-semibold text-slate-900">
                {request.customerReference ?? 'Sin referencia'}
              </dd>
            </div>
            {quotationId ? (
              <div className="flex items-center justify-between gap-4 py-2.5">
                <dt className="text-[8px] text-slate-500">Cotización</dt>
                <dd>
                  <Link
                    to={`/portal/${customerId}/quotations/${quotationId}`}
                    className="text-[8px] font-semibold text-blue-600 transition hover:text-blue-700 hover:underline"
                  >
                    Ver propuesta
                  </Link>
                </dd>
              </div>
            ) : null}
            <div className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-[8px] text-slate-500">Última actualización</dt>
              <dd className="text-right text-[8px] font-medium text-slate-700">
                {formatCustomerRequestDateTime(request.updatedAt)}
              </dd>
            </div>
          </dl>

          {canCancel ? (
            <button
              type="button"
              onClick={onCancel}
              className="mt-3 inline-flex h-6 items-center rounded-md border border-red-200/80 bg-white/70 px-2 text-[7px] font-medium text-red-500 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600"
            >
              Cancelar solicitud
            </button>
          ) : null}
        </Card>
      </div>
    </>
  )
}
