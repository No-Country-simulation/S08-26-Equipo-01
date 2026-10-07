import { Link } from 'react-router-dom'
import { formatQuotationDate } from '../model/quotationPresenter'
import type { QuotationSourceDto } from '../types/quotation.types'

interface QuotationSourceCardProps {
  source: QuotationSourceDto
}

function SourceItem({
  label,
  value,
}: {
  label: string
  value: string | number
}) {
  return (
    <div>
      <dt className="text-[8px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 truncate text-[10px] font-semibold text-slate-800">
        {value}
      </dd>
    </div>
  )
}

export function QuotationSourceCard({ source }: QuotationSourceCardProps) {
  const material =
    source.materialSpecification?.materialName ??
    source.materialRequirement ??
    'Sin especificar'
  const standard = source.materialSpecification?.standardOrGrade
  const materialLabel = standard ? `${material} / ${standard}` : material

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Origen comercial
          </p>
          <p className="mt-0.5 text-[9px] font-medium text-slate-500">
            {source.caseNumber} · {source.requestNumber}
          </p>
        </div>

        <Link
          to={`/job-cases/${source.caseId}`}
          className="inline-flex h-6 items-center rounded-md border border-slate-200 bg-white px-2 text-[7px] font-semibold text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
        >
          Abrir expediente
        </Link>
      </div>

      <dl className="grid gap-3 px-4 py-3 sm:grid-cols-2 xl:grid-cols-4">
        <SourceItem label="Trabajo" value={source.title} />
        <SourceItem label="Cantidad" value={`${source.quantity} piezas`} />
        <SourceItem label="Material" value={materialLabel} />
        <SourceItem
          label="Fecha solicitada"
          value={formatQuotationDate(source.requestedDeliveryDate)}
        />
      </dl>
    </section>
  )
}
