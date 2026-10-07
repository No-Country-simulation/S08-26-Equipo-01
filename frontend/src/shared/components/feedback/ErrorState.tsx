import { getErrorMessage } from '@/shared/lib/getErrorMessage'

interface ErrorStateProps {
  error: unknown
  title?: string
}

export function ErrorState({
  error,
  title = 'No pudimos cargar la información',
}: ErrorStateProps) {
  return (
    <div
      className="rounded-xl border border-red-200 bg-red-50 p-6"
      role="alert"
    >
      <h2 className="text-sm font-semibold text-red-900">{title}</h2>
      <p className="mt-2 text-sm text-red-700">{getErrorMessage(error)}</p>
    </div>
  )
}
