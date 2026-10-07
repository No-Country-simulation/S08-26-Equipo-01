import { Link } from 'react-router-dom'
import type { WorkOrder360Dto } from '../types/workOrder360.types'

interface WorkOrderOriginChainProps {
  data: WorkOrder360Dto
}

export function WorkOrderOriginChain({ data }: WorkOrderOriginChainProps) {
  const { workOrder } = data
  const latestDelivery = [...data.deliveries]
    .sort(
      (left, right) =>
        new Date(left.createdAt).getTime() -
        new Date(right.createdAt).getTime(),
    )
    .at(-1)

  const nodes = [
    {
      label: 'Solicitud',
      value: workOrder.source.requestNumber,
      href: `/job-cases/${workOrder.source.caseId}`,
    },
    {
      label: 'Expediente',
      value: workOrder.source.caseNumber,
      href: `/job-cases/${workOrder.source.caseId}`,
    },
    {
      label: 'Cotización',
      value: `${workOrder.agreement.quotationNumber} · R${workOrder.agreement.revision}`,
      href: `/quotations/${workOrder.agreement.quotationId}`,
    },
    {
      label: 'Orden de trabajo',
      value: workOrder.workOrderNumber,
      href: null,
    },
    ...(latestDelivery
      ? [
          {
            label: 'Entrega',
            value: `#${latestDelivery.id}`,
            href: `/work-orders/${workOrder.id}?view=delivery#delivery-${latestDelivery.id}`,
          },
        ]
      : []),
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Cadena de origen
        </p>
        <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
          Un trabajo, una historia vinculada
        </h2>
      </div>

      <div className="overflow-x-auto px-4 py-3">
        <div className="flex min-w-max items-center">
          {nodes.map((node, index) => {
            const current = node.label === 'Orden de trabajo'
            const nodeClassName = current
              ? 'border-blue-200 bg-blue-50 text-blue-700'
              : 'border-slate-200 bg-white text-slate-700'

            const body = (
              <span
                className={`block min-w-[118px] rounded-lg border px-3 py-2 ${nodeClassName}`}
              >
                <span className="block text-[7px] font-bold uppercase tracking-[0.08em] opacity-65">
                  {node.label}
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold">
                  {node.value}
                </span>
              </span>
            )

            return (
              <div key={`${node.label}-${node.value}`} className="flex items-center">
                {node.href ? (
                  <Link
                    to={node.href}
                    className="rounded-lg transition hover:ring-2 hover:ring-blue-100"
                  >
                    {body}
                  </Link>
                ) : (
                  body
                )}

                {index < nodes.length - 1 ? (
                  <span className="mx-2 h-px w-5 bg-slate-200" />
                ) : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
