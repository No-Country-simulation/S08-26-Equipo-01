import { Link } from 'react-router-dom'
import type { CustomerQuotationStatus } from '@/modules/quotations'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { formatCustomerRequestDateTime } from '../model/customerRequestPresenter'
import {
  getCustomerRequestDisplayStatus,
  getCustomerRequestNextStep,
  type CustomerDeliveryProgress,
  type CustomerRequestNextStepPresentation,
} from '../model/customerRequestOverviewPresenter'
import type {
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
} from '../types/customerRequest.types'

interface CustomerRequestFollowUpProps {
  customerId: number
  request: CustomerRequestDetailDto
  quotationId?: number
  quotationStatus?: CustomerQuotationStatus
  deliveryProgress?: CustomerDeliveryProgress
  canWrite: boolean
  canCancel: boolean
  openInformationRequest: CustomerInformationRequestDto | null
  latestResponse: CustomerInformationRequestDto | null
  onRespond: (request: CustomerInformationRequestDto) => void
  onCancel: () => void
}

const nextStepToneClasses: Record<
  CustomerRequestNextStepPresentation['tone'],
  string
> = {
  neutral: 'border-slate-200 bg-slate-50/70',
  info: 'border-blue-100 bg-blue-50/65',
  warning: 'border-amber-200 bg-amber-50/70',
  success: 'border-emerald-200 bg-emerald-50/70',
  danger: 'border-red-200 bg-red-50/70',
}

const nextStepEyebrowClasses: Record<
  CustomerRequestNextStepPresentation['tone'],
  string
> = {
  neutral: 'text-slate-500',
  info: 'text-blue-700',
  warning: 'text-amber-700',
  success: 'text-emerald-700',
  danger: 'text-red-700',
}

export function CustomerRequestFollowUp({
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
}: CustomerRequestFollowUpProps) {
  const status = getCustomerRequestDisplayStatus(request, deliveryProgress)
  const nextStep = getCustomerRequestNextStep(
    request,
    deliveryProgress,
    openInformationRequest,
    quotationId,
    quotationStatus,
  )

  return (
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
          className="mt-2 inline-flex h-11 items-center gap-1.5 rounded-md px-1.5 text-[9px] font-medium text-red-500 transition hover:bg-red-50 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100 sm:h-7 sm:text-[8px]"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M7 7l10 10M17 7 7 17" />
          </svg>
          Cancelar solicitud
        </button>
      ) : null}
    </Card>
  )
}
