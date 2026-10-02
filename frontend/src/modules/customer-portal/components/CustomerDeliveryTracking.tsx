import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  formatCustomerDeliveryDateTime,
  getCustomerDeliveryAddress,
  getCustomerDeliveryStatusPresentation,
  getCustomerDeliverySummary,
} from '../model/customerDeliveryPresenter'
import { useCustomerDeliveryEvidence } from '../hooks/useCustomerDeliveryEvidence'
import type { CustomerDeliveryDto } from '../types/customerDelivery.types'

interface CustomerDeliveryTrackingProps {
  customerId: number
  requestId: number
  deliveries: CustomerDeliveryDto[] | undefined
  requestedQuantity: number
  pending: boolean
  error: unknown
}

function DeliveryCard({
  delivery,
  busy,
  onOpenEvidence,
  onDownloadEvidence,
}: {
  delivery: CustomerDeliveryDto
  busy: boolean
  onOpenEvidence: () => void
  onDownloadEvidence: () => void
}) {
  const status = getCustomerDeliveryStatusPresentation(delivery.status)

  return (
    <article
      className={
        delivery.status === 'DELIVERED'
          ? 'rounded-xl border border-emerald-100 bg-gradient-to-br from-white via-white to-emerald-50/35 p-4'
          : delivery.status === 'CANCELLED'
            ? 'rounded-xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50/25 p-4'
            : 'rounded-xl border border-blue-100 bg-gradient-to-br from-white via-white to-blue-50/30 p-4'
      }
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-500">
            Entrega #{delivery.id} · {delivery.workOrderNumber}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-slate-950">
            {delivery.quantity} pieza{delivery.quantity === 1 ? '' : 's'}
          </h3>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <dl className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-slate-200/80 bg-white/75 p-3">
          <dt className="text-[9px] text-slate-500">Método</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {delivery.deliveryMethod}
          </dd>
        </div>
        <div className="rounded-lg border border-slate-200/80 bg-white/75 p-3">
          <dt className="text-[9px] text-slate-500">Destino</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {delivery.destinationLabel ?? 'Destino de entrega'}
          </dd>
          <p className="mt-1 text-[9px] text-slate-500">
            {delivery.destinationContactName
              ? 'Contacto: ' + delivery.destinationContactName
              : 'Sin contacto definido'}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 sm:col-span-2">
          <dt className="text-[9px] text-slate-500">Destino</dt>
          <dd className="mt-1 text-[11px] font-semibold text-slate-900">
            {getCustomerDeliveryAddress(delivery)}
          </dd>
        </div>
      </dl>

      <div className="mt-4 grid gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Despacho
          </p>
          <p className="mt-1 text-[10px] leading-5 text-slate-700">
            {formatCustomerDeliveryDateTime(delivery.dispatchedAt)}
            {delivery.carrier ? ` · ${delivery.carrier}` : ''}
            {delivery.trackingNumber
              ? ` · Guía ${delivery.trackingNumber}`
              : ''}
          </p>
        </div>

        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">
            Entrega
          </p>
          {delivery.status === 'DELIVERED' ? (
            <p className="mt-1 text-[10px] leading-5 text-slate-700">
              {formatCustomerDeliveryDateTime(delivery.deliveredAt)}
              {delivery.receivedByName
                ? ` · Recibió ${delivery.receivedByName}`
                : ''}
            </p>
          ) : delivery.status === 'CANCELLED' ? (
            <p className="mt-1 text-[10px] text-red-700">
              El despacho fue cancelado por logística.
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-blue-700">
              En tránsito. El estado se actualiza cuando logística registra la
              entrega.
            </p>
          )}
        </div>
      </div>

      {delivery.evidenceDocumentId !== null &&
      delivery.evidenceDocumentVersionId !== null ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-[10px] font-semibold text-emerald-800">
                Evidencia de entrega
              </p>
              <p className="mt-1 truncate text-[9px] text-emerald-700">
                {delivery.evidenceFileName ?? 'Archivo registrado por logística'}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={busy}
                onClick={onOpenEvidence}
              >
                {busy ? 'Abriendo…' : 'Ver'}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                disabled={busy}
                onClick={onDownloadEvidence}
              >
                Descargar
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </article>
  )
}

export function CustomerDeliveryTracking({
  customerId,
  requestId,
  deliveries,
  requestedQuantity,
  pending,
  error,
}: CustomerDeliveryTrackingProps) {
  const evidence = useCustomerDeliveryEvidence(customerId, requestId)
  if (pending) {
    return (
      <Card className="p-5">
        <LoadingState label="Consultando entregas…" />
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-5">
        <ErrorState error={error} title="No pudimos consultar las entregas" />
      </Card>
    )
  }

  if (!deliveries || deliveries.length === 0) return null

  const summary = getCustomerDeliverySummary(deliveries, requestedQuantity)

  return (
    <section className="space-y-4">
      <div
        className={
          summary.hasInTransit
            ? 'rounded-xl border border-blue-200 bg-blue-50 p-5'
            : summary.completedAgainstRequestedQuantity
              ? 'rounded-xl border border-emerald-200 bg-emerald-50 p-5'
              : 'rounded-xl border border-slate-200 bg-white p-5'
        }
      >
        <p
          className={
            summary.hasInTransit
              ? 'text-[9px] font-semibold uppercase tracking-wide text-blue-700'
              : summary.completedAgainstRequestedQuantity
                ? 'text-[9px] font-semibold uppercase tracking-wide text-emerald-700'
                : 'text-[9px] font-semibold uppercase tracking-wide text-slate-500'
          }
        >
          {summary.hasInTransit
            ? 'Entrega en camino'
            : summary.completedAgainstRequestedQuantity
              ? 'Entrega completada'
              : 'Entregas registradas'}
        </p>

        <p className="mt-2 text-sm font-semibold text-slate-950">
          {summary.hasInTransit
            ? `${summary.dispatchedQuantity} pieza${summary.dispatchedQuantity === 1 ? '' : 's'} actualmente en tránsito.`
            : summary.completedAgainstRequestedQuantity
              ? `${summary.deliveredQuantity} de ${requestedQuantity} piezas solicitadas figuran como entregadas.`
              : `${summary.deliveredQuantity} de ${requestedQuantity} piezas solicitadas figuran como entregadas.`}
        </p>

        <p className="mt-2 text-[10px] leading-5 text-slate-600">
          El cliente no confirma manualmente la recepción. QualityTrack refleja
          el estado registrado por el equipo de logística al realizar la
          entrega.
        </p>
      </div>

      {evidence.error ? (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {getErrorMessage(evidence.error)}
        </p>
      ) : null}

      <div className="space-y-3">
        {deliveries.map((delivery) => (
          <DeliveryCard
            key={delivery.id}
            delivery={delivery}
            busy={evidence.busyDeliveryId === delivery.id}
            onOpenEvidence={() => void evidence.openEvidence(delivery)}
            onDownloadEvidence={() => void evidence.downloadEvidence(delivery)}
          />
        ))}
      </div>
    </section>
  )
}
