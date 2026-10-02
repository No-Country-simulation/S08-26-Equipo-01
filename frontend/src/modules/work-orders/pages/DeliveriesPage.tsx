import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { useDeliveries } from '../hooks/useDeliveries'
import { useWorkOrders } from '../hooks/useWorkOrders'
import {
  formatDeliveryDateTime,
  formatDeliveryMethod,
  getAvailableDeliveryQuantity,
  getDeliveryStatusPresentation,
  isDeliveredToday,
} from '../model/deliveryPresenter'
import type {
  DeliveryDto,
  DeliveryQueueItem,
  DeliveryStatus,
} from '../types/delivery.types'
import type { WorkOrderDto } from '../types/workOrder.types'

function buildQueue(
  workOrders: WorkOrderDto[],
  deliveries: DeliveryDto[],
): DeliveryQueueItem[] {
  const workOrderById = new Map(
    workOrders.map((workOrder) => [workOrder.id, workOrder]),
  )
  const deliveriesByWorkOrder = new Map<number, DeliveryDto[]>()

  for (const delivery of deliveries) {
    const current = deliveriesByWorkOrder.get(delivery.workOrderId) ?? []
    current.push(delivery)
    deliveriesByWorkOrder.set(delivery.workOrderId, current)
  }

  const readyItems = workOrders
    .filter((workOrder) => workOrder.status === 'READY_FOR_DELIVERY')
    .map((workOrder) => {
      const workOrderDeliveries = deliveriesByWorkOrder.get(workOrder.id) ?? []
      const plannedQuantity = workOrder.plannedQuantity ?? 0

      return {
        workOrderId: workOrder.id,
        workOrderNumber: workOrder.workOrderNumber,
        workOrderStatus: workOrder.status,
        customerName: workOrder.customerName,
        plannedQuantity,
        availableQuantity: getAvailableDeliveryQuantity(
          workOrder.plannedQuantity,
          workOrderDeliveries,
        ),
        delivery: null,
      } satisfies DeliveryQueueItem
    })
    .filter((item) => item.availableQuantity > 0)

  const deliveryItems = deliveries.map((delivery) => {
    const workOrder = workOrderById.get(delivery.workOrderId)

    return {
      workOrderId: delivery.workOrderId,
      workOrderNumber: delivery.workOrderNumber,
      workOrderStatus: workOrder?.status ?? 'READY_FOR_DELIVERY',
      customerName: workOrder?.customerName ?? 'Cliente',
      plannedQuantity: workOrder?.plannedQuantity ?? delivery.quantity,
      availableQuantity: 0,
      delivery,
    } satisfies DeliveryQueueItem
  })

  const statusWeight = {
    PENDING: 0,
    DISPATCHED: 1,
    DELIVERED: 2,
    CANCELLED: 3,
  } as const

  return [...readyItems, ...deliveryItems].sort((left, right) => {
    if (!left.delivery && right.delivery) return -1
    if (left.delivery && !right.delivery) return 1
    if (!left.delivery || !right.delivery) return 0

    return (
      statusWeight[left.delivery.status] - statusWeight[right.delivery.status]
    )
  })
}

function movementLabel(delivery: DeliveryDto | null): string {
  if (!delivery) return 'Pendiente de preparar'
  if (delivery.status === 'DISPATCHED') {
    return formatDeliveryDateTime(delivery.dispatchedAt)
  }
  if (delivery.status === 'DELIVERED') {
    return formatDeliveryDateTime(delivery.deliveredAt)
  }
  if (delivery.status === 'CANCELLED') {
    return formatDeliveryDateTime(delivery.cancelledAt)
  }
  return 'Pendiente de despacho'
}

const statusAccent: Record<DeliveryStatus, string> = {
  PENDING: 'from-amber-500 to-orange-400',
  DISPATCHED: 'from-blue-500 to-cyan-400',
  DELIVERED: 'from-emerald-500 to-teal-400',
  CANCELLED: 'from-red-500 to-rose-400',
}

const statusSurface: Record<DeliveryStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-700',
  DISPATCHED: 'bg-blue-50 text-blue-600',
  DELIVERED: 'bg-emerald-50 text-emerald-600',
  CANCELLED: 'bg-red-50 text-red-600',
}

export function DeliveriesPage() {
  const deliveriesQuery = useDeliveries()
  const workOrdersQuery = useWorkOrders()

  const queue = useMemo(
    () => buildQueue(workOrdersQuery.data ?? [], deliveriesQuery.data ?? []),
    [deliveriesQuery.data, workOrdersQuery.data],
  )

  if (deliveriesQuery.isPending || workOrdersQuery.isPending) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <LoadingState label="Cargando cola de entregas…" />
      </PageContainer>
    )
  }

  if (deliveriesQuery.isError || workOrdersQuery.isError) {
    return (
      <PageContainer className="py-4 lg:py-3">
        <ErrorState
          error={deliveriesQuery.error ?? workOrdersQuery.error}
          title="No pudimos cargar Entregas"
        />
      </PageContainer>
    )
  }

  const deliveries = deliveriesQuery.data
  const readyCount = queue.filter((item) => item.delivery === null).length
  const pendingCount = deliveries.filter(
    (delivery) => delivery.status === 'PENDING',
  ).length
  const inTransitCount = deliveries.filter(
    (delivery) => delivery.status === 'DISPATCHED',
  ).length
  const deliveredTodayCount = deliveries.filter(isDeliveredToday).length

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="deliveries" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Entregas
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Gestiona órdenes listas para despacho, entregas preparadas y
                movimientos en tránsito hasta completar la cantidad comprometida.
              </p>
            </div>
          </div>

          <div className="mt-4 grid border-t border-slate-200/80 pt-3 sm:grid-cols-4">
            <Metric label="Listas para preparar" value={readyCount} />
            <Metric label="Preparadas" value={pendingCount} separated />
            <Metric
              label="En tránsito"
              value={inTransitCount}
              valueClassName="text-blue-700"
              separated
            />
            <Metric
              label="Entregadas hoy"
              value={deliveredTodayCount}
              valueClassName="text-emerald-700"
              separated
              last
            />
          </div>
        </div>
      </section>

      <section className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <div className="flex flex-col gap-2 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Entregas registradas
            </p>
            <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
              Seguimiento logístico
            </h2>
            <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-400">
              Las entregas parciales permanecen visibles hasta completar la
              cantidad comprometida de la orden.
            </p>
          </div>
          <span className="text-[8px] font-medium text-slate-400">
            {queue.length}{' '}
            {queue.length === 1 ? 'movimiento visible' : 'movimientos visibles'}
          </span>
        </div>

        <div className="bg-slate-50/40 p-3.5 sm:p-4">
          {queue.length === 0 ? (
            <div className="px-5 py-7 text-center">
              <p className="text-[10px] font-semibold text-slate-700">
                No hay entregas ni órdenes listas para despacho
              </p>
              <p className="mt-1 text-[8px] text-slate-400">
                Las órdenes aparecerán aquí cuando Calidad las libere para entrega.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {queue.map((item) => (
                <DeliveryCard
                  key={
                    item.delivery
                      ? `delivery-${item.delivery.id}`
                      : `ready-${item.workOrderId}`
                  }
                  item={item}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  )
}

function DeliveryCard({ item }: { item: DeliveryQueueItem }) {
  const delivery = item.delivery
  const status = delivery
    ? getDeliveryStatusPresentation(delivery.status)
    : {
        label: 'Lista para preparar',
        stage: 'Preparación',
        description:
          'Calidad liberó la orden y todavía falta preparar el movimiento de entrega.',
        tone: 'success' as const,
      }

  const accentClass = delivery
    ? statusAccent[delivery.status]
    : 'from-emerald-500 to-teal-400'
  const surfaceClass = delivery
    ? statusSurface[delivery.status]
    : 'bg-emerald-50 text-emerald-600'
  const actionLabel =
    delivery?.status === 'PENDING'
      ? 'Despachar'
      : delivery?.status === 'DELIVERED'
        ? 'Abrir historial'
        : delivery
          ? 'Abrir entrega'
          : 'Preparar'
  const primaryAction = !delivery || delivery.status === 'PENDING'

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md">
      <div
        className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accentClass}`}
      />

      <div className="p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 gap-3">
            <div
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${surfaceClass}`}
            >
              <SidebarNavIcon
                name="deliveries"
                className="h-[17px] w-[17px]"
              />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  {item.workOrderNumber}
                </p>
                {delivery ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                    Entrega #{delivery.id}
                  </span>
                ) : null}
              </div>

              <Link
                to={`/work-orders/${item.workOrderId}?tab=delivery`}
                className="mt-1.5 block truncate text-sm font-semibold text-slate-950 transition group-hover:text-blue-700"
              >
                {item.customerName}
              </Link>

              <p className="mt-1 truncate text-[10px] leading-4 text-slate-500">
                {delivery
                  ? delivery.trackingNumber
                    ? `Guía ${delivery.trackingNumber}`
                    : 'Movimiento de entrega registrado'
                  : 'Orden liberada para preparar entrega'}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
              {status.label}
            </Badge>
            <Link
              to={`/work-orders/${item.workOrderId}?tab=delivery`}
              className={
                primaryAction
                  ? 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg bg-blue-600 px-3.5 text-[10px] font-semibold text-white shadow-sm shadow-blue-200 transition hover:bg-blue-700'
                  : 'inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700'
              }
            >
              {actionLabel}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <SummaryCell
            label="Cantidad"
            value={
              delivery
                ? `${delivery.quantity} pieza${delivery.quantity === 1 ? '' : 's'}`
                : `${item.availableQuantity} de ${item.plannedQuantity} disponibles`
            }
          />
          <SummaryCell
            label="Método"
            value={
              delivery
                ? formatDeliveryMethod(delivery.deliveryMethod)
                : 'Por definir al preparar'
            }
          />
          <SummaryCell label="Movimiento" value={movementLabel(delivery)} />
        </div>

        <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[9px] leading-4 text-slate-500">
            {status.description}
          </p>
          <p className="shrink-0 text-[8px] font-semibold text-slate-500">
            Etapa · {status.stage}
          </p>
        </div>
      </div>
    </article>
  )
}

function SummaryCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className="mt-1 truncate text-[10px] font-semibold text-slate-900">
        {value}
      </p>
    </div>
  )
}

function Metric({
  label,
  value,
  valueClassName = 'text-slate-950',
  separated = false,
  last = false,
}: {
  label: string
  value: number
  valueClassName?: string
  separated?: boolean
  last?: boolean
}) {
  return (
    <div
      className={[
        'py-1',
        separated
          ? 'border-t border-slate-100 py-2 sm:border-l sm:border-t-0 sm:px-4 sm:py-1'
          : 'sm:pr-4',
        last ? 'sm:pr-0' : '',
      ].join(' ')}
    >
      <p className="text-[8px] font-medium text-slate-400">{label}</p>
      <p className={`mt-0.5 text-[16px] font-bold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
