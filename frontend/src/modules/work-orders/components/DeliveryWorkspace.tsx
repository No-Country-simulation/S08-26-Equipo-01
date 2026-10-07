import { Badge } from '@/shared/components/ui/Badge'
import {
  formatDeliveryDateTime,
  formatDeliveryMethod,
  getDeliveryAddress,
  getDeliveryStatusPresentation,
} from '../model/deliveryPresenter'
import type { DeliveryDto } from '../types/delivery.types'
import type { WorkOrderDeliveryDestinationDto } from '../types/workOrder.types'

interface DeliveryWorkspaceProps {
  delivery: DeliveryDto | null
  plannedQuantity: number
  availableQuantity: number
  requestedDestination: WorkOrderDeliveryDestinationDto | null
}

function Step({
  label,
  state,
}: {
  label: string
  state: 'done' | 'current' | 'pending'
}) {
  const classes =
    state === 'done'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : state === 'current'
        ? 'border-blue-200 bg-blue-50 text-blue-700'
        : 'border-slate-200 bg-white text-slate-400'

  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[8px] font-bold ${classes}`}
      >
        {state === 'done' ? '✓' : '•'}
      </span>
      <span
        className={
          state === 'pending'
            ? 'truncate text-[8px] font-medium text-slate-400'
            : 'truncate text-[8px] font-semibold text-slate-800'
        }
      >
        {label}
      </span>
    </div>
  )
}

export function DeliveryWorkspace({
  delivery,
  plannedQuantity,
  availableQuantity,
  requestedDestination,
}: DeliveryWorkspaceProps) {
  if (!delivery) {
    return (
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Logística · Entrega
          </p>
          <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
            Preparar salida de producto terminado
          </h2>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Calidad ya liberó la orden. El siguiente registro define cantidad,
            destino y método de entrega.
          </p>
        </div>

        <div className="px-4 py-4">
          <div className="flex items-center gap-2">
            <Step label="Preparación" state="current" />
            <span className="h-px w-5 shrink-0 bg-slate-200" />
            <Step label="Despacho" state="pending" />
            <span className="h-px w-5 shrink-0 bg-slate-200" />
            <Step label="Recepción" state="pending" />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-blue-50/35 px-3.5 py-3">
              <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-blue-600">
                Producto disponible
              </p>
              <p className="mt-1 text-[13px] font-bold text-slate-950">
                {availableQuantity} de {plannedQuantity} piezas
              </p>
              <p className="mt-1 text-[8px] leading-4 text-slate-500">
                Puedes preparar una entrega total o parcial.
              </p>
            </div>

            <div
              className={
                requestedDestination?.mode === 'DEFINE_LATER' ||
                !requestedDestination
                  ? 'rounded-xl border border-amber-200 bg-amber-50/55 px-3.5 py-3'
                  : 'rounded-xl border border-emerald-200 bg-emerald-50/45 px-3.5 py-3'
              }
            >
              <p
                className={
                  requestedDestination?.mode === 'DEFINE_LATER' ||
                  !requestedDestination
                    ? 'text-[7px] font-bold uppercase tracking-[0.1em] text-amber-700'
                    : 'text-[7px] font-bold uppercase tracking-[0.1em] text-emerald-700'
                }
              >
                Destino acordado en la solicitud
              </p>

              {requestedDestination &&
              (requestedDestination.mode === 'SAVED_ADDRESS' ||
                requestedDestination.mode === 'CUSTOM_ADDRESS') ? (
                <>
                  <p className="mt-1 text-[9px] font-semibold text-slate-950">
                    {requestedDestination.label ?? 'Destino de entrega'}
                  </p>
                  <p className="mt-1 text-[8px] leading-4 text-slate-600">
                    {[
                      requestedDestination.address,
                      requestedDestination.city,
                      requestedDestination.state,
                      requestedDestination.postalCode,
                      requestedDestination.country,
                    ]
                      .filter(Boolean)
                      .join(', ')}
                  </p>
                </>
              ) : (
                <>
                  <p className="mt-1 text-[9px] font-semibold text-amber-900">
                    Destino por definir
                  </p>
                  <p className="mt-1 text-[8px] leading-4 text-amber-800/80">
                    Confirma la dirección real antes de crear el despacho.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const status = getDeliveryStatusPresentation(delivery.status)
  const dispatched =
    delivery.status === 'DISPATCHED' || delivery.status === 'DELIVERED'
  const delivered = delivery.status === 'DELIVERED'

  return (
    <section
      id={`delivery-${delivery.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)] target:ring-2 target:ring-blue-200"
    >
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              Logística · Entrega
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h2 className="text-[12px] font-semibold text-slate-950">
                Entrega #{delivery.id}
              </h2>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              {delivery.quantity} pieza{delivery.quantity === 1 ? '' : 's'} ·{' '}
              {formatDeliveryMethod(delivery.deliveryMethod)}
            </p>
          </div>

          {delivery.evidenceDocumentVersionId ? (
            <Badge tone="success" className="w-fit px-2 py-0.5 text-[7px]">
              Evidencia vinculada
            </Badge>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 px-4 py-3.5">
        {delivery.status !== 'CANCELLED' ? (
          <div className="flex items-center gap-2">
            <Step
              label="Preparación"
              state={delivery.status === 'PENDING' ? 'current' : 'done'}
            />
            <span className="h-px w-5 shrink-0 bg-slate-200" />
            <Step
              label="Despacho"
              state={delivered ? 'done' : dispatched ? 'current' : 'pending'}
            />
            <span className="h-px w-5 shrink-0 bg-slate-200" />
            <Step
              label="Recepción"
              state={delivered ? 'done' : 'pending'}
            />
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl border border-slate-200 bg-slate-50/45 px-3 py-3">
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-slate-400">
              Contacto en destino
            </p>
            <p className="mt-1 text-[10px] font-semibold text-slate-950">
              {delivery.destinationLabel ?? 'Destino de entrega'}
            </p>
            <p className="mt-1 text-[8px] text-slate-500">
              {delivery.destinationContactName
                ? 'Contacto: ' + delivery.destinationContactName
                : 'Sin contacto definido'}
            </p>
            <p className="mt-1 text-[8px] text-slate-500">
              {formatDeliveryMethod(delivery.deliveryMethod)}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50/45 px-3 py-3">
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-slate-400">
              Destino registrado
            </p>
            <p className="mt-1 text-[9px] font-semibold leading-4 text-slate-900">
              {getDeliveryAddress(delivery)}
            </p>
            <p className="mt-1 text-[7px] text-slate-400">
              Snapshot histórico de esta entrega
            </p>
          </div>
        </div>

        {delivery.destinationInstructions ? (
          <div className="rounded-xl border border-blue-100 bg-blue-50/35 px-3 py-2.5">
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-blue-600">
              Indicaciones de entrega
            </p>
            <p className="mt-1 text-[8px] leading-4 text-slate-600">
              {delivery.destinationInstructions}
            </p>
          </div>
        ) : null}

        <div className="grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-slate-400">
              Despacho
            </p>
            {delivery.dispatchedAt ? (
              <>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {formatDeliveryDateTime(delivery.dispatchedAt)}
                </p>
                <p className="mt-1 text-[8px] text-slate-500">
                  {[delivery.carrier, delivery.trackingNumber]
                    .filter(Boolean)
                    .join(' · ') || 'Sin transportista o guía registrada'}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[8px] text-slate-400">
                Aún no ha salido de planta.
              </p>
            )}
          </div>

          <div>
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-slate-400">
              Recepción
            </p>
            {delivery.deliveredAt ? (
              <>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {formatDeliveryDateTime(delivery.deliveredAt)}
                </p>
                <p className="mt-1 text-[8px] text-slate-500">
                  Recibió {delivery.receivedByName ?? 'sin nombre registrado'}
                </p>
              </>
            ) : (
              <p className="mt-1 text-[8px] text-slate-400">
                Pendiente de registrar por Logística.
              </p>
            )}
          </div>
        </div>

        {delivery.evidenceDocumentVersionId ? (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/45 px-3 py-2.5">
            <p className="text-[7px] font-bold uppercase tracking-[0.09em] text-emerald-700">
              Evidencia de entrega
            </p>
            <p className="mt-1 text-[9px] font-semibold text-emerald-950">
              {delivery.evidenceFileName ?? 'Documento de evidencia vinculado'}
            </p>
          </div>
        ) : null}

        {delivery.status === 'CANCELLED' ? (
          <div className="rounded-xl border border-red-200 bg-red-50/55 px-3 py-2.5">
            <p className="text-[8px] font-semibold text-red-900">
              Entrega cancelada
            </p>
            <p className="mt-1 text-[8px] leading-4 text-red-700">
              {formatDeliveryDateTime(delivery.cancelledAt)} ·{' '}
              {delivery.cancellationReason ?? 'Sin motivo registrado'}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  )
}
