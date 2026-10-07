import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  formatDeliveryMethod,
  getDeliveryStatusPresentation,
} from '../model/deliveryPresenter'
import type { DeliveryDto } from '../types/delivery.types'

interface DeliveryStagePanelProps {
  delivery: DeliveryDto | null
  plannedQuantity: number
  inProgressQuantity: number
  deliveredQuantity: number
  availableQuantity: number
  canManage: boolean
  canCreate: boolean
  onCreate: () => void
  onDispatch: () => void
  onComplete: () => void
  onEvidence: () => void
  onCancel: () => void
}

export function DeliveryStagePanel({
  delivery,
  plannedQuantity,
  inProgressQuantity,
  deliveredQuantity,
  availableQuantity,
  canManage,
  canCreate,
  onCreate,
  onDispatch,
  onComplete,
  onEvidence,
  onCancel,
}: DeliveryStagePanelProps) {
  const status = delivery ? getDeliveryStatusPresentation(delivery.status) : null

  const nextStep = (() => {
    if (!delivery) {
      return {
        eyebrow: 'Siguiente paso',
        title: 'Preparar entrega',
        description:
          'Define cantidad, destinatario, destino y método antes de liberar el despacho.',
        tone: 'info' as const,
      }
    }

    if (delivery.status === 'PENDING') {
      return {
        eyebrow: 'Lista para salida',
        title: 'Confirmar despacho',
        description:
          'Registra la salida de planta. Transportista y guía son opcionales.',
        tone: 'info' as const,
      }
    }

    if (delivery.status === 'DISPATCHED') {
      return {
        eyebrow: 'En tránsito',
        title: 'Registrar entrega',
        description:
          'Al entregar, Logística registra quién recibió y la fecha real de recepción.',
        tone: 'warning' as const,
      }
    }

    if (delivery.status === 'DELIVERED' && availableQuantity > 0) {
      return {
        eyebrow: 'Entrega parcial completada',
        title: 'Quedan piezas por entregar',
        description: `${availableQuantity} pieza${availableQuantity === 1 ? '' : 's'} siguen disponibles para un nuevo despacho.`,
        tone: 'info' as const,
      }
    }

    if (delivery.status === 'DELIVERED') {
      return {
        eyebrow: 'Entrega completada',
        title: 'Orden cerrada',
        description:
          'La cantidad entregada acumulada cubre la cantidad planificada de la OT.',
        tone: 'success' as const,
      }
    }

    return {
      eyebrow: 'Entrega cancelada',
      title: availableQuantity > 0 ? 'Producto nuevamente disponible' : 'Sin acción pendiente',
      description:
        availableQuantity > 0
          ? 'La cantidad cancelada puede reservarse en una nueva entrega.'
          : 'No hay cantidad disponible para preparar otro despacho.',
      tone: 'danger' as const,
    }
  })()

  const toneClasses = {
    success: 'border-emerald-200 bg-emerald-50/65 text-emerald-900',
    danger: 'border-red-200 bg-red-50/65 text-red-900',
    warning: 'border-amber-200 bg-amber-50/65 text-amber-900',
    info: 'border-blue-100 bg-blue-50/60 text-blue-900',
  }

  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Estado de entrega
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h2 className="text-[12px] font-semibold text-slate-950">
            {delivery ? `Entrega #${delivery.id}` : 'Sin entrega preparada'}
          </h2>
          {status ? (
            <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
              {status.label}
            </Badge>
          ) : null}
        </div>
        {delivery ? (
          <p className="mt-1 text-[8px] text-slate-400">
            {delivery.quantity} pieza{delivery.quantity === 1 ? '' : 's'} ·{' '}
            {formatDeliveryMethod(delivery.deliveryMethod)}
          </p>
        ) : null}
      </div>

      <div className="mt-4 grid grid-cols-3 divide-x divide-slate-100 rounded-xl border border-slate-200 bg-slate-50/45">
        <div className="px-2.5 py-2.5">
          <p className="text-[7px] text-slate-400">Disponibles</p>
          <p className="mt-0.5 text-[12px] font-bold text-slate-950">
            {availableQuantity}
          </p>
        </div>
        <div className="px-2.5 py-2.5">
          <p className="text-[7px] text-slate-400">En proceso</p>
          <p className="mt-0.5 text-[12px] font-bold text-slate-950">
            {inProgressQuantity}
          </p>
        </div>
        <div className="px-2.5 py-2.5">
          <p className="text-[7px] text-slate-400">Entregadas</p>
          <p className="mt-0.5 text-[12px] font-bold text-emerald-700">
            {deliveredQuantity}/{plannedQuantity}
          </p>
        </div>
      </div>

      <div className={`mt-4 rounded-xl border px-3 py-3 ${toneClasses[nextStep.tone]}`}>
        <p className="text-[7px] font-bold uppercase tracking-[0.09em] opacity-75">
          {nextStep.eyebrow}
        </p>
        <p className="mt-1 text-[9px] font-semibold">{nextStep.title}</p>
        <p className="mt-1 text-[7px] leading-3.5 opacity-80">
          {nextStep.description}
        </p>
      </div>

      <div className="mt-auto space-y-2 pt-4">
        {canManage && delivery?.status === 'PENDING' ? (
          <Button
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onDispatch}
          >
            Confirmar despacho
          </Button>
        ) : null}

        {canManage && delivery?.status === 'DISPATCHED' ? (
          <Button
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onComplete}
          >
            Registrar entrega
          </Button>
        ) : null}

        {canCreate &&
        (!delivery ||
          delivery.status === 'DELIVERED' ||
          delivery.status === 'CANCELLED') ? (
          <Button
            className="!h-8 !w-full !justify-center !text-[8px]"
            onClick={onCreate}
          >
            {delivery ? 'Preparar otra entrega' : 'Preparar entrega'}
          </Button>
        ) : null}

        {canCreate &&
        delivery &&
        (delivery.status === 'PENDING' || delivery.status === 'DISPATCHED') ? (
          <Button
            variant="secondary"
            className="!h-7 !w-full !justify-center !text-[7.5px]"
            onClick={onCreate}
          >
            Preparar otra entrega
          </Button>
        ) : null}

        {canManage &&
        delivery &&
        (delivery.status === 'PENDING' || delivery.status === 'DISPATCHED') ? (
          <>
            <Button
              variant="secondary"
              className="!h-7 !w-full !justify-center !text-[7.5px]"
              onClick={onEvidence}
            >
              {delivery.evidenceDocumentVersionId
                ? 'Actualizar evidencia'
                : 'Agregar evidencia'}
            </Button>
            <Button
              variant="ghost"
              className="!h-7 !w-full !justify-center !text-[7.5px] !text-red-600 hover:!bg-red-50"
              onClick={onCancel}
            >
              Cancelar entrega
            </Button>
          </>
        ) : null}

        {!canManage ? (
          <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center text-[7px] leading-3.5 text-slate-500">
            Vista de solo lectura para tu rol.
          </p>
        ) : null}
      </div>
    </aside>
  )
}
