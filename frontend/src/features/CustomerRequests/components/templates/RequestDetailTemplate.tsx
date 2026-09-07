import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { Spinner } from '@/shared/components/Spinner'
import { formatDate } from '../../helpers'
import type { RequestDetailTemplateProps } from '../../types/props'
import { StatusBadge } from '../atoms/StatusBadge'

export const RequestDetailTemplate = ({
  request,
  isLoading,
  isError,
  error,
  onRetry,
  onBack,
}: RequestDetailTemplateProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 p-8">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-4xl font-bold">Detalle de la solicitud</h1>
        <button type="button" className="btn btn-ghost" onClick={onBack}>
          Volver
        </button>
      </header>

      {isLoading && <Spinner />}

      {isError && error && <ErrorAlert message={error} onRetry={onRetry} />}

      {!isLoading && !isError && request && (
        <article className="card bg-base-100 shadow-xl">
          <div className="card-body gap-6">
            <div className="flex items-center justify-between gap-2">
              <h2 className="card-title">{request.requestNumber}</h2>
              <StatusBadge status={request.status} />
            </div>

            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm text-base-content/70">Descripción</dt>
                <dd className="mt-1">{request.description}</dd>
              </div>

              <div className="stats stats-vertical shadow sm:stats-horizontal">
                <div className="stat">
                  <div className="stat-title">Número</div>
                  <div className="stat-value text-2xl">
                    {request.requestNumber}
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Estado</div>
                  <div className="stat-value text-2xl">
                    <StatusBadge status={request.status} />
                  </div>
                </div>
                <div className="stat">
                  <div className="stat-title">Cantidad</div>
                  <div className="stat-value text-2xl">
                    {request.quantity}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-base-content/70">
                    Entrega solicitada
                  </dt>
                  <dd className="font-semibold">
                    {formatDate(request.requestDeliveryDate)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-base-content/70">Recibida</dt>
                  <dd className="font-semibold">
                    {formatDate(request.receivedAt)}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-base-content/70">Creada</dt>
                  <dd className="font-semibold">
                    {formatDate(request.createdAt)}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </article>
      )}
    </div>
  )
}