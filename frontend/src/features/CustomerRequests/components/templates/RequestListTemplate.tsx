import { ErrorAlert } from '@/shared/components/ErrorAlert'
import { Spinner } from '@/shared/components/Spinner'
import type { RequestListTemplateProps } from '../../types/props'
import { RequestList } from '../organisms/RequestList'

export const RequestListTemplate = ({
  requests,
  isLoading,
  isError,
  error,
  onRetry,
  onSelectRequest,
}: RequestListTemplateProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Mis solicitudes</h1>
        <p className="text-base-content/70">
          Gestiona tus pedidos de producto y sigue su estado
        </p>
      </header>

      {isLoading && <Spinner />}

      {isError && error && <ErrorAlert message={error} onRetry={onRetry} />}

      {!isLoading && !isError && requests.length === 0 && (
        <p className="text-base-content/70">
          Aún no hay solicitudes de producto
        </p>
      )}

      {!isLoading && !isError && requests.length > 0 && (
        <RequestList requests={requests} onSelect={onSelectRequest} />
      )}
    </div>
  )
}