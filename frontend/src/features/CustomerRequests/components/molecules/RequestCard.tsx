import { formatDate } from '../../helpers'
import type { RequestCardProps } from '../../types/props'
import { StatusBadge } from '../atoms/StatusBadge'

export const RequestCard = ({ request, onSelect }: RequestCardProps) => {
  return (
    <article className="card bg-base-100 shadow-xl">
      <div className="card-body gap-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="card-title">{request.requestNumber}</h2>
          <StatusBadge status={request.status} />
        </div>
        <p className="line-clamp-2 text-sm">{request.description}</p>
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          <div>
            <dt className="text-base-content/70">Cantidad</dt>
            <dd className="font-semibold">{request.quantity}</dd>
          </div>
          <div>
            <dt className="text-base-content/70">Entrega solicitada</dt>
            <dd className="font-semibold">
              {formatDate(request.requestDeliveryDate)}
            </dd>
          </div>
        </dl>
        <div className="card-actions justify-end">
          <button
            type="button"
            className="btn btn-sm btn-outline"
            onClick={() => onSelect(request.id)}
          >
            Ver detalle
          </button>
        </div>
      </div>
    </article>
  )
}