import { useEffect, useRef } from 'react'
import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { Spinner } from '@/shared/components/Spinner'
import { formatDate } from '../../helpers'
import { getCancellationTooltip } from '../../helpers/getCancellationTooltip'
import type { RequestDetailModalProps } from '../../types/props'
import { StatusBadge } from '../atoms/StatusBadge'

export const RequestDetailModal = ({
  request,
  isLoading,
  isError,
  error,
  onRetry,
  onClose,
  onCancelRequest,
  isCancelling,
  cancelError,
}: RequestDetailModalProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const isOpen = isLoading || isError || Boolean(request)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (isOpen) {
      dialog.showModal()
    } else {
      dialog.close()
    }
  }, [isOpen])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => {
      if (isOpen) onClose()
    }
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [isOpen, onClose])

  const canCancel = request?.status === 'RECEIVED'

  return (
    <dialog ref={dialogRef} className="modal" onCancel={onClose}>
      <div className="modal-box w-full max-w-2xl overflow-x-hidden">
        {isLoading && <Spinner />}

        {isError && error && <ErrorAlert message={error} onRetry={onRetry} />}

        {!isLoading && !isError && request && (
          <>
            <h2 className="card-title">{request.requestNumber}</h2>

            <dl className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <dt className="text-sm text-base-content/70">Descripción</dt>
                <dd className="mt-1 break-words">{request.description}</dd>
              </div>

              <div>
                <dt className="text-sm text-base-content/70">Cantidad</dt>
                <dd className="font-semibold">{request.quantity}</dd>
              </div>
              <div>
                <dt className="text-sm text-base-content/70">Estado</dt>
                <dd className="font-semibold">
                  <StatusBadge status={request.status} />
                </dd>
              </div>

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
            </dl>

            {cancelError && (
              <div role="alert" className="alert alert-error mt-6 text-sm">
                {cancelError}
              </div>
            )}

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cerrar
              </button>
              {canCancel ? (
                <button
                  type="button"
                  className="btn btn-error"
                  onClick={onCancelRequest}
                  disabled={isCancelling}
                >
                  {isCancelling ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : (
                    'Cancelar pedido'
                  )}
                </button>
              ) : (
                <div
                  className="tooltip tooltip-error"
                  data-tip={getCancellationTooltip(request.status)}
                >
                  <span
                    className="btn btn-error btn-outline"
                    aria-disabled="true"
                  >
                    Cancelar pedido
                  </span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <form method="dialog" className="modal-backdrop">
        <button>cerrar</button>
      </form>
    </dialog>
  )
}