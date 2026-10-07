import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { getCustomerQuotationStatusPresentation } from '../model/customerQuotationPresenter'
import { formatQuotationDate } from '../model/quotationPresenter'
import type {
  CustomerQuotationDetailDto,
  CustomerQuotationSummaryDto,
} from '../types/customerQuotation.types'
import { CustomerQuotationRevisionHistory } from './CustomerQuotationRevisionHistory'

interface CustomerQuotationDecisionPanelProps {
  customerId: number
  quotation: CustomerQuotationDetailDto
  canDecide: boolean
  viewerReadOnly: boolean
  submitting: boolean
  revisions?: CustomerQuotationSummaryDto[]
  revisionsPending: boolean
  revisionsError: boolean
  onRequestAdjustment: () => void
  onReject: () => void
  onApprove: () => void
}

function statusDescription(quotation: CustomerQuotationDetailDto): string {
  if (
    quotation.customerStatus === 'SENT' &&
    quotation.adjustment?.notes &&
    quotation.adjustment?.response
  ) {
    return 'Comercial respondió tu solicitud de ajuste en esta revisión.'
  }

  if (quotation.customerStatus === 'ADJUSTMENT_REQUESTED') {
    return 'Tu solicitud de ajuste fue enviada. Comercial está preparando una nueva revisión.'
  }

  if (quotation.customerStatus === 'SENT') {
    return `Disponible para responder hasta ${formatQuotationDate(
      quotation.validUntil,
    )}.`
  }

  return getCustomerQuotationStatusPresentation(quotation.customerStatus)
    .description
}

export function CustomerQuotationDecisionPanel({
  customerId,
  quotation,
  canDecide,
  viewerReadOnly,
  submitting,
  revisions,
  revisionsPending,
  revisionsError,
  onRequestAdjustment,
  onReject,
  onApprove,
}: CustomerQuotationDecisionPanelProps) {
  const status = getCustomerQuotationStatusPresentation(
    quotation.customerStatus,
  )
  const hasAdjustmentRequest = Boolean(quotation.adjustment?.notes)
  const hasAdjustmentResponse = Boolean(quotation.adjustment?.response)
  const adjustmentMovedForward =
    quotation.customerStatus === 'REPLACED' &&
    hasAdjustmentRequest &&
    !hasAdjustmentResponse

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
          <SidebarNavIcon name="quality" className="h-[17px] w-[17px]" />
        </div>
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Decisión
          </p>
          <div className="mt-0.5 flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold text-slate-950">
              {status.label}
            </h2>
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              Rev. {quotation.revision}
            </Badge>
          </div>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            {statusDescription(quotation)}
          </p>
        </div>
      </div>

      {canDecide ? (
        <div className="mt-3 space-y-2">
          <Button
            className="!h-8 !w-full !text-[9px]"
            onClick={onApprove}
            disabled={submitting}
          >
            Aprobar cotización
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onRequestAdjustment}
              disabled={submitting}
            >
              Solicitar ajuste
            </Button>
            <Button
              variant="ghost"
              className="!h-7 !px-2.5 !text-[8px] !text-red-600 hover:!bg-red-50"
              onClick={onReject}
              disabled={submitting}
            >
              Rechazar
            </Button>
          </div>
        </div>
      ) : viewerReadOnly ? (
        <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/75 px-3 py-2.5">
          <p className="text-[8px] font-semibold text-slate-700">
            Solo consulta
          </p>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Un administrador o solicitante de la empresa debe responder esta cotización.
          </p>
        </div>
      ) : null}

      {quotation.customerStatus === 'REJECTED' &&
      quotation.rejectionReason ? (
        <div className="mt-3 rounded-xl border border-red-100 bg-red-50/55 px-3 py-2.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-red-600">
            Motivo de rechazo
          </p>
          <p className="mt-1 text-[9px] leading-4 text-slate-700">
            {quotation.rejectionReason}
          </p>
        </div>
      ) : null}

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Seguimiento
        </p>

        {quotation.adjustment?.notes || quotation.adjustment?.response ? (
          <div className="relative mt-3 space-y-3 pl-5">
            <span
              aria-hidden="true"
              className="absolute bottom-4 left-[3px] top-4 w-px bg-slate-200"
            />

            <div className="relative">
              <span
                aria-hidden="true"
                className="absolute -left-5 top-3 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-50"
              />
              <div className="rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-2.5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-blue-700">
                    Tu solicitud de ajuste
                  </p>
                  <span className="rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] font-semibold text-blue-600 ring-1 ring-blue-100">
                    Enviada
                  </span>
                </div>
                <p className="mt-1.5 text-[9px] leading-4 text-slate-700">
                  {quotation.adjustment?.notes ?? 'Sin detalle registrado.'}
                </p>
              </div>
            </div>

            <div className="relative">
              <span
                aria-hidden="true"
                className={
                  hasAdjustmentResponse
                    ? 'absolute -left-5 top-3 h-2 w-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50'
                    : adjustmentMovedForward
                      ? 'absolute -left-5 top-3 h-2 w-2 rounded-full bg-blue-400 ring-4 ring-blue-50'
                      : 'absolute -left-5 top-3 h-2 w-2 rounded-full bg-amber-400 ring-4 ring-amber-50'
                }
              />
              <div
                className={
                  hasAdjustmentResponse
                    ? 'rounded-xl border border-emerald-100 bg-emerald-50/55 px-3 py-2.5'
                    : adjustmentMovedForward
                      ? 'rounded-xl border border-blue-100 bg-blue-50/35 px-3 py-2.5'
                      : 'rounded-xl border border-dashed border-amber-200 bg-amber-50/55 px-3 py-2.5'
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <p
                    className={
                      hasAdjustmentResponse
                        ? 'text-[8px] font-bold uppercase tracking-[0.08em] text-emerald-700'
                        : adjustmentMovedForward
                          ? 'text-[8px] font-bold uppercase tracking-[0.08em] text-blue-700'
                          : 'text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700'
                    }
                  >
                    {adjustmentMovedForward
                      ? 'Continuación del ajuste'
                      : 'Respuesta de Comercial'}
                  </p>
                  <span
                    className={
                      hasAdjustmentResponse
                        ? 'rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] font-semibold text-emerald-700 ring-1 ring-emerald-100'
                        : adjustmentMovedForward
                          ? 'rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] font-semibold text-blue-700 ring-1 ring-blue-100'
                          : 'rounded-full bg-white/80 px-1.5 py-0.5 text-[7px] font-semibold text-amber-700 ring-1 ring-amber-100'
                    }
                  >
                    {hasAdjustmentResponse
                      ? 'Respondida'
                      : adjustmentMovedForward
                        ? 'Rev. siguiente'
                        : 'Pendiente'}
                  </span>
                </div>
                <p
                  className={
                    hasAdjustmentResponse
                      ? 'mt-1.5 text-[9px] leading-4 text-slate-700'
                      : adjustmentMovedForward
                        ? 'mt-1.5 text-[9px] leading-4 text-slate-600'
                        : 'mt-1.5 text-[9px] italic leading-4 text-slate-500'
                  }
                >
                  {hasAdjustmentResponse
                    ? quotation.adjustment?.response
                    : adjustmentMovedForward
                      ? 'Esta solicitud originó una nueva revisión. La respuesta de Comercial se refleja en la revisión posterior.'
                      : 'Comercial todavía no ha respondido esta solicitud.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 rounded-xl border border-slate-200 bg-white/80 px-3 py-2.5">
            <p className="text-[9px] font-medium text-slate-700">
              Sin solicitudes de ajuste
            </p>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
              No se ha solicitado ningún cambio sobre esta revisión.
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4 lg:mt-auto lg:pt-4">
        {revisionsPending ? (
          <p className="text-[8px] text-slate-500">Cargando revisiones…</p>
        ) : revisionsError ? (
          <p className="text-[8px] text-amber-700">
            No fue posible cargar el historial de revisiones.
          </p>
        ) : (
          <CustomerQuotationRevisionHistory
            customerId={customerId}
            currentId={quotation.id}
            revisions={revisions ?? []}
            embedded
          />
        )}
      </div>
    </aside>
  )
}
