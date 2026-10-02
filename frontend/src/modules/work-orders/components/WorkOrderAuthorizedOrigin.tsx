import { Link } from 'react-router-dom'
import { formatWorkOrderDate } from '../model/workOrderPresenter'
import type { WorkOrderDetailDto } from '../types/workOrder.types'

interface WorkOrderAuthorizedOriginProps {
  workOrder: WorkOrderDetailDto
}

export function WorkOrderAuthorizedOrigin({
  workOrder,
}: WorkOrderAuthorizedOriginProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-26px_rgba(15,23,42,0.24)]">
      <div className="grid gap-3 px-4 py-3 sm:grid-cols-[1.3fr_0.95fr_0.9fr_0.45fr] sm:items-center">
        <div className="min-w-0">
          <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700">
            Origen autorizado
          </p>
          <Link
            to={`/quotations/${workOrder.agreement.quotationId}`}
            className="mt-1 block truncate text-[9px] font-semibold text-slate-900 hover:text-blue-700"
          >
            {workOrder.agreement.quotationNumber} · Revisión{' '}
            {workOrder.agreement.revision} · APROBADA
          </Link>
          <p className="mt-1 text-[7px] text-slate-400">
            {workOrder.source.caseNumber} · {workOrder.source.requestNumber}
          </p>
        </div>

        <div>
          <p className="text-[7px] text-slate-400">Cliente</p>
          <p className="mt-1 truncate text-[9px] font-semibold text-slate-900">
            {workOrder.source.customerName}
          </p>
        </div>

        <div>
          <p className="text-[7px] text-slate-400">Entrega comprometida</p>
          <p className="mt-1 text-[9px] font-semibold text-slate-900">
            {formatWorkOrderDate(workOrder.agreedDeliveryDate)}
          </p>
        </div>

        <div className="sm:text-right">
          <p className="text-[7px] text-slate-400">Cantidad</p>
          <p className="mt-1 text-[9px] font-semibold text-slate-900">
            {workOrder.plannedQuantity ?? workOrder.source.quantity} piezas
          </p>
        </div>
      </div>
    </section>
  )
}
