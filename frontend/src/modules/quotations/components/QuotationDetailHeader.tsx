import { useNavigate } from 'react-router-dom'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { getQuotationStatusPresentation } from '../model/quotationPresenter'
import type { QuotationDetailDto } from '../types/quotation.types'

interface QuotationDetailHeaderProps {
  quotation: QuotationDetailDto
  canCancel: boolean
  canCreateRevision: boolean
  creatingRevision: boolean
  onCancel: () => void
  onCreateRevision: () => void
}

export function QuotationDetailHeader({
  quotation,
  canCancel,
  canCreateRevision,
  creatingRevision,
  onCancel,
  onCreateRevision,
}: QuotationDetailHeaderProps) {
  const navigate = useNavigate()
  const status = getQuotationStatusPresentation(quotation.status)
  const hasAdjustment =
    quotation.status === 'DRAFT' && Boolean(quotation.adjustmentNotes)
  const hasMenuActions = canCancel || canCreateRevision

  const closeMenu = (target: EventTarget | null) => {
    const element = target instanceof HTMLElement ? target : null
    element?.closest('details')?.removeAttribute('open')
  }

  return (
    <section className="mb-4 rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/55 px-5 py-4 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)] sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="order-2 flex min-w-0 items-start gap-3 sm:order-1">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
            <SidebarNavIcon name="quotations" className="h-4 w-4" />
          </span>

          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
              Cotización interna
            </p>

            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h1 className="text-[20px] font-bold tracking-tight text-slate-950">
                {quotation.quotationNumber}
              </h1>
              <Badge
                tone={hasAdjustment ? 'warning' : status.tone}
                className="px-2 py-0.5 text-[8px]"
              >
                {hasAdjustment ? 'Ajuste pendiente' : status.label}
              </Badge>
            </div>

            <p className="mt-1 truncate text-[10px] font-medium text-slate-600">
              Revisión {quotation.revision} · {quotation.customerName}
            </p>
            <p className="mt-1 text-[8px] text-slate-400">
              Responsable ·{' '}
              <span className="font-medium text-slate-600">
                {quotation.source.assignedToName ?? 'Sin asignar'}
              </span>
            </p>
          </div>
        </div>

        <div className="order-1 flex w-full items-center justify-between gap-2 sm:order-2 sm:w-auto sm:shrink-0 sm:justify-end">
          <CompactBackButton
            label="Volver a cotizaciones"
            onClick={() => navigate('/quotations')}
          />

          {hasMenuActions ? (
            <details className="relative">
              <summary
                aria-label="Más acciones de cotización"
                className="flex h-8 w-8 cursor-pointer list-none items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 [&::-webkit-details-marker]:hidden"
              >
                <span aria-hidden="true" className="text-[15px] leading-none">
                  •••
                </span>
              </summary>

              <div className="absolute right-0 z-30 mt-2 w-48 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl shadow-slate-900/10">
                {canCreateRevision ? (
                  <button
                    type="button"
                    disabled={creatingRevision}
                    className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[9px] font-medium text-slate-700 transition hover:bg-slate-50 disabled:text-slate-400"
                    onClick={(event) => {
                      closeMenu(event.currentTarget)
                      onCreateRevision()
                    }}
                  >
                    {creatingRevision
                      ? 'Creando revisión…'
                      : 'Crear nueva revisión'}
                  </button>
                ) : null}

                {canCancel ? (
                  <>
                    {canCreateRevision ? (
                      <div className="my-1 border-t border-slate-100" />
                    ) : null}
                    <button
                      type="button"
                      className="flex w-full items-center rounded-lg px-2.5 py-2 text-left text-[9px] font-medium text-red-600 transition hover:bg-red-50"
                      onClick={(event) => {
                        closeMenu(event.currentTarget)
                        onCancel()
                      }}
                    >
                      Cancelar cotización
                    </button>
                  </>
                ) : null}
              </div>
            </details>
          ) : null}
        </div>
      </div>
    </section>
  )
}
