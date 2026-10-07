import { Link } from 'react-router-dom'
import { formatWorkOrderDate } from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderAuthorizedOriginProps {
  workOrder: WorkOrderDetailDto
}

function getMaterialLabel(workOrder: WorkOrderDetailDto): string {
  const specification = workOrder.source.materialSpecification

  if (specification && typeof specification === 'object') {
    const value = specification as Record<string, unknown>
    const materialName =
      typeof value.materialName === 'string' ? value.materialName.trim() : ''
    const standardOrGrade =
      typeof value.standardOrGrade === 'string'
        ? value.standardOrGrade.trim()
        : ''
    const parts = [materialName, standardOrGrade].filter(Boolean)

    if (parts.length > 0) return parts.join(' / ')
  }

  return workOrder.source.materialRequirement?.trim() || 'Sin especificar'
}

export function WorkOrderAuthorizedOrigin({
  workOrder,
}: WorkOrderAuthorizedOriginProps) {
  const material = getMaterialLabel(workOrder)

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex flex-col gap-3 border-b border-slate-100 bg-gradient-to-r from-white via-white to-blue-50/40 px-4 py-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700">
            Contexto de fabricación
          </p>
          <h2 className="mt-1 text-[11px] font-semibold text-slate-950">
            {workOrder.source.title}
          </h2>
          {workOrder.source.description?.trim() ? (
            <p className="mt-1 max-w-4xl text-[8px] leading-4 text-slate-500">
              {workOrder.source.description}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-wrap gap-1.5">
          <Link
            to={`/job-cases/${workOrder.source.caseId}`}
            className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Ver expediente
          </Link>
          <Link
            to={`/quotations/${workOrder.agreement.quotationId}`}
            className="inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Ver cotización
          </Link>
        </div>
      </div>

      <dl className="grid gap-x-5 gap-y-3 px-4 py-3 sm:grid-cols-2 lg:grid-cols-6">
        <ContextItem
          label="Solicitud"
          value={workOrder.source.requestNumber}
          detail={workOrder.source.caseNumber}
        />
        <ContextItem
          label="Cliente"
          value={workOrder.source.customerName}
          detail={
            workOrder.source.customerReference?.trim()
              ? `Ref. ${workOrder.source.customerReference}`
              : null
          }
        />
        <ContextItem
          label="Cantidad"
          value={`${workOrder.plannedQuantity ?? workOrder.source.quantity} piezas`}
        />
        <ContextItem label="Material" value={material} />
        <ContextItem
          label="Entrega comprometida"
          value={formatWorkOrderDate(workOrder.agreedDeliveryDate)}
        />
        <ContextItem
          label="Cotización aprobada"
          value={workOrder.agreement.quotationNumber}
          detail={`Revisión ${workOrder.agreement.revision}`}
        />
      </dl>
    </section>
  )
}

function ContextItem({
  label,
  value,
  detail,
}: {
  label: string
  value: string | number
  detail?: string | null
}) {
  return (
    <div className="min-w-0">
      <dt className="text-[7px] font-medium text-slate-400">{label}</dt>
      <dd className="mt-1 truncate text-[9px] font-semibold text-slate-900">
        {value}
      </dd>
      {detail ? (
        <dd className="mt-0.5 truncate text-[6.5px] text-slate-400">{detail}</dd>
      ) : null}
    </div>
  )
}
