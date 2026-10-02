import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { CreateWorkOrderDialog } from './CreateWorkOrderDialog'
import { useCreateWorkOrder } from '../hooks/useCreateWorkOrder'
import type { CreateWorkOrderFormValues } from '../schemas/createWorkOrder.schema'
import { formatWorkOrderDate } from '../model/workOrderPresenter'
import type { PendingWorkOrderDto } from '../types/workOrder.types'

interface PendingWorkOrderQueueProps {
  pendingWorkOrders: PendingWorkOrderDto[]
  canCreate: boolean
}

export function PendingWorkOrderQueue({
  pendingWorkOrders,
  canCreate,
}: PendingWorkOrderQueueProps) {
  if (pendingWorkOrders.length === 0) return null

  return (
    <section className="mt-4 overflow-hidden rounded-2xl border border-blue-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
      <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/65 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Handoff comercial → operación
          </p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
            Pendientes de crear OT
          </h2>
          <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-500">
            Cotizaciones aprobadas por el cliente que ya salieron del flujo
            comercial y esperan convertirse en una orden de trabajo.
          </p>
        </div>

        <Badge tone="info" className="w-fit px-2 py-0.5 text-[8px]">
          {pendingWorkOrders.length} pendiente
          {pendingWorkOrders.length === 1 ? '' : 's'}
        </Badge>
      </div>

      <div className="divide-y divide-slate-100">
        {pendingWorkOrders.map((candidate) => (
          <PendingWorkOrderRow
            key={candidate.caseId}
            candidate={candidate}
            canCreate={canCreate}
          />
        ))}
      </div>
    </section>
  )
}

function PendingWorkOrderRow({
  candidate,
  canCreate,
}: {
  candidate: PendingWorkOrderDto
  canCreate: boolean
}) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const mutation = useCreateWorkOrder(candidate.caseId)

  const create = async (values: CreateWorkOrderFormValues) => {
    try {
      const workOrder = await mutation.mutateAsync(values)
      setOpen(false)
      navigate(`/work-orders/${workOrder.id}`)
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <article className="grid gap-3 px-4 py-3 transition hover:bg-blue-50/25 sm:px-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(150px,0.7fr)_110px_minmax(145px,0.7fr)_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-[11px] font-semibold text-slate-950">
              {candidate.requestTitle}
            </p>
            <Badge tone="warning" className="px-2 py-0.5 text-[7px]">
              Pendiente de OT
            </Badge>
          </div>
          <p className="mt-0.5 truncate text-[9px] font-medium text-slate-700">
            {candidate.customerName}
          </p>
          <p className="mt-0.5 truncate text-[8px] text-slate-400">
            {candidate.caseNumber} · {candidate.requestNumber}
          </p>
        </div>

        <div>
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Cotización aprobada
          </p>
          <Link
            to={`/quotations/${candidate.quotationId}`}
            className="mt-1 block text-[9px] font-semibold text-blue-700 hover:text-blue-800"
          >
            {candidate.quotationNumber} · Rev {candidate.quotationRevision}
          </Link>
          <p className="mt-0.5 text-[7px] text-slate-400">
            {formatWorkOrderDate(candidate.approvedAt.slice(0, 10))}
          </p>
        </div>

        <div>
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Cantidad
          </p>
          <p className="mt-1 text-[9px] font-semibold text-slate-800">
            {candidate.quantity} piezas
          </p>
        </div>

        <div>
          <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
            Entrega acordada
          </p>
          <p className="mt-1 text-[9px] font-medium text-slate-700">
            {formatWorkOrderDate(candidate.estimatedDeliveryDate)}
          </p>
        </div>

        <div className="flex justify-start lg:justify-end">
          {canCreate ? (
            <Button
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => {
                mutation.reset()
                setOpen(true)
              }}
            >
              Crear OT
            </Button>
          ) : (
            <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[7px] font-medium text-slate-500">
              Esperando rol autorizado
            </span>
          )}
        </div>
      </article>

      <CreateWorkOrderDialog
        open={open}
        quotationNumber={candidate.quotationNumber}
        quotationRevision={candidate.quotationRevision}
        customerName={candidate.customerName}
        plannedQuantity={candidate.quantity}
        agreedDeliveryDate={candidate.estimatedDeliveryDate}
        submitting={mutation.isPending}
        error={mutation.error}
        onClose={() => {
          mutation.reset()
          setOpen(false)
        }}
        onSubmit={create}
      />
    </>
  )
}
