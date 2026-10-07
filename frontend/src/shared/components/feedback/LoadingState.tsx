interface LoadingStateProps {
  label?: string
}

export function LoadingState({
  label = 'Cargando información…',
}: LoadingStateProps) {
  return (
    <div
      className="flex min-h-40 items-center justify-center rounded-xl border border-slate-200 bg-white p-8 text-sm text-slate-500"
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  )
}
