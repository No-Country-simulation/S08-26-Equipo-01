import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import type { RoutingOperationDto } from '../types/workOrder.types'

interface RoutingOperationsListProps {
  operations: RoutingOperationDto[]
  editable: boolean
  removing: boolean
  onEdit: (operation: RoutingOperationDto) => void
  onRemove: (operationId: number) => Promise<void>
}

export function RoutingOperationsList({
  operations,
  editable,
  removing,
  onEdit,
  onRemove,
}: RoutingOperationsListProps) {
  const [deleteCandidateId, setDeleteCandidateId] = useState<number | null>(
    null,
  )

  if (operations.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-4 py-4 text-center">
        <p className="text-[10px] font-semibold text-slate-800">
          Ruta sin operaciones
        </p>
        <p className="mt-1 text-[8px] text-slate-400">
          Agrega al menos una operación antes de aprobar.
        </p>
      </div>
    )
  }

  return (
    <div className="divide-y divide-slate-100 rounded-lg border border-slate-200 bg-white">
      {operations.map((item) => (
        <article
          id={`routing-operation-${item.id}`}
          key={item.id}
          className="scroll-mt-24 px-3 py-2.5 target:bg-blue-50/40"
        >
          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-start gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[9px] font-bold text-blue-700 ring-1 ring-blue-100">
                {item.sequenceNumber}
              </span>
              <div className="min-w-0">
                <p className="text-[8px] font-bold uppercase tracking-wide text-blue-600">
                  {item.code}
                </p>
                <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
                  {item.name}
                </p>
                {item.instructions ? (
                  <p className="mt-0.5 line-clamp-2 text-[8px] leading-4 text-slate-500">
                    {item.instructions}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
              <span className="rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-500">
                {item.estimatedMinutes} min
              </span>

              {editable ? (
                <>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="!h-7 !px-2 !text-[8px]"
                    onClick={() => onEdit(item)}
                  >
                    Editar
                  </Button>

                  {deleteCandidateId === item.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        className="!h-7 !px-2 !text-[8px]"
                        disabled={removing}
                        onClick={() => {
                          void onRemove(item.id)
                          setDeleteCandidateId(null)
                        }}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!h-7 !px-2 !text-[8px]"
                        onClick={() => setDeleteCandidateId(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="!h-7 !px-2 !text-[8px] text-red-600"
                      onClick={() => setDeleteCandidateId(item.id)}
                    >
                      Eliminar
                    </Button>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
