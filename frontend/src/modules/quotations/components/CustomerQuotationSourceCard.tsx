import { Link } from 'react-router-dom'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { formatQuotationDate } from '../model/quotationPresenter'
import type { CustomerQuotationSourceDto } from '../types/customerQuotation.types'

interface CustomerQuotationSourceCardProps {
  source: CustomerQuotationSourceDto
  caseNumber: string
  requestNumber: string
  requestHref?: string
}

function Item({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-[8px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 truncate text-[10px] font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  )
}

export function CustomerQuotationSourceCard({
  source,
  caseNumber,
  requestNumber,
  requestHref,
}: CustomerQuotationSourceCardProps) {
  const technicalMaterial = [source.materialName, source.standardOrGrade]
    .filter(Boolean)
    .join(' / ')
  const material =
    technicalMaterial || source.materialRequirement || 'Sin especificar'

  return (
    <section className="rounded-xl border border-blue-100/80 bg-gradient-to-r from-white via-white to-blue-50/30 px-4 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
            <SidebarNavIcon name="requests" className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Solicitud de origen
            </p>
            <p className="mt-0.5 text-[9px] font-medium text-slate-500">
              {caseNumber} · {requestNumber}
            </p>
          </div>
        </div>

        {requestHref ? (
          <Link
            to={requestHref}
            className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-blue-100 bg-white px-2.5 text-[8px] font-semibold text-blue-700 transition hover:border-blue-200 hover:bg-blue-50"
          >
            <span aria-hidden="true">←</span>
            Abrir solicitud
          </Link>
        ) : null}
      </div>

      <dl className="mt-3 grid gap-x-4 gap-y-2.5 border-t border-blue-100/70 pt-3 sm:grid-cols-2 xl:grid-cols-4">
        <Item label="Solicitud" value={source.title} />
        <Item label="Cantidad" value={`${source.quantity} piezas`} />
        <Item label="Material" value={material} />
        <Item
          label="Fecha solicitada"
          value={formatQuotationDate(source.requestedDeliveryDate)}
        />
      </dl>
    </section>
  )
}
