import { Badge } from '@/shared/components/ui/Badge'
import {
  formatDeliveryDateTime,
  formatDeliveryMethod,
  getDeliveryStatusPresentation,
} from '../model/deliveryPresenter'
import type { DeliveryDto } from '../types/delivery.types'

interface DeliveryCardProps {
  delivery: DeliveryDto
  selected: boolean
  onSelect: () => void
}

export function DeliveryCard({
  delivery,
  selected,
  onSelect,
}: DeliveryCardProps) {
  const status = getDeliveryStatusPresentation(delivery.status)
  const timestamp =
    delivery.deliveredAt ??
    delivery.dispatchedAt ??
    delivery.cancelledAt ??
    delivery.createdAt

  return (
    <button
      type="button"
      onClick={onSelect}
      className={
        selected
          ? 'grid w-full gap-2 border-l-2 border-blue-500 bg-blue-50/35 px-4 py-3 text-left transition sm:grid-cols-[minmax(0,1fr)_110px_130px_auto] sm:items-center'
          : 'grid w-full gap-2 border-l-2 border-transparent px-4 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_110px_130px_auto] sm:items-center'
      }
    >
      <div className="min-w-0">
        <p className="text-[9px] font-semibold text-slate-900">
          Entrega #{delivery.id} · {delivery.quantity} pieza
          {delivery.quantity === 1 ? '' : 's'}
        </p>
        <p className="mt-0.5 truncate text-[7px] text-slate-400">
          {delivery.destinationContactName ?? delivery.destinationLabel ?? 'Sin contacto'} ·{' '}
          {formatDeliveryMethod(delivery.deliveryMethod)}
        </p>
      </div>

      <Badge tone={status.tone} className="w-fit px-2 py-0.5 text-[7px]">
        {status.label}
      </Badge>

      <span className="text-[7px] text-slate-400">
        {formatDeliveryDateTime(timestamp)}
      </span>

      <span className="text-[8px] font-semibold text-blue-600">
        {selected ? 'En detalle' : 'Ver detalle'}
      </span>
    </button>
  )
}
