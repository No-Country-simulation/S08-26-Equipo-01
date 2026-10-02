import { useState } from 'react'
import type { WorkOrderStatus } from '../types/workOrder.types'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { useQualityMutations } from '../hooks/useQualityMutations'

interface QualityHandoffPanelProps {
  workOrderId: number
  workOrderStatus: WorkOrderStatus
  productionCompleted: boolean
  canHandoff: boolean
  materialConsumptionCount?: number
  embedded?: boolean
}

export function QualityHandoffPanel({
  workOrderId,
  workOrderStatus,
  productionCompleted,
  canHandoff,
  materialConsumptionCount = 0,
  embedded = false,
}: QualityHandoffPanelProps) {
  const mutations = useQualityMutations(workOrderId)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (!productionCompleted) return null

  if (workOrderStatus !== 'IN_PRODUCTION') {
    return (
      <section
        className={
          embedded
            ? 'rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-3'
            : 'rounded-xl border border-emerald-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(5,150,105,0.2)]'
        }
      >
        <p className="text-[9px] font-semibold text-emerald-900">
          Handoff de Calidad registrado
        </p>
        <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
          La producción original quedó cerrada y el flujo formal de inspección
          ya fue creado. Los resultados se gestionan en la etapa de Calidad.
        </p>
      </section>
    )
  }

  const handoff = async () => {
    mutations.handoff.reset()

    try {
      await mutations.handoff.mutateAsync()
      setConfirmOpen(false)
    } catch {
      // El error se presenta dentro del panel y del diálogo.
    }
  }

  return (
    <>
      <section
        className={
          embedded
            ? 'rounded-xl border border-blue-200 bg-blue-50/55 px-3 py-3'
            : 'rounded-xl border border-blue-200 bg-white px-3.5 py-3 shadow-[0_10px_28px_-26px_rgba(37,99,235,0.2)]'
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[9px] font-semibold text-blue-900">
              Producción completada · lista para Calidad
            </p>
            <p className="mt-0.5 max-w-2xl text-[8px] leading-4 text-slate-500">
              Antes del handoff todavía puedes registrar los últimos consumos
              de material. Al enviar la orden a Calidad, Producción queda
              formalmente cerrada.
            </p>
          </div>

          {canHandoff ? (
            <Button
              onClick={() => {
                mutations.handoff.reset()
                setConfirmOpen(true)
              }}
              disabled={mutations.handoff.isPending}
              className="!h-7 shrink-0 !px-2.5 !text-[8px]"
            >
              Enviar a Calidad
            </Button>
          ) : null}
        </div>

        {!canHandoff ? (
          <p className="mt-2 text-[8px] font-medium text-blue-700">
            Solo PRODUCTION o ADMIN pueden realizar el handoff.
          </p>
        ) : null}

        {mutations.handoff.error ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
            {getErrorMessage(mutations.handoff.error)}
          </p>
        ) : null}
      </section>

      {confirmOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quality-handoff-confirm-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-amber-100 bg-gradient-to-r from-white via-white to-amber-50/70 px-4 py-3.5">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-700">
                Cierre de Producción
              </p>
              <h2
                id="quality-handoff-confirm-title"
                className="mt-0.5 text-[14px] font-semibold text-slate-950"
              >
                ¿Enviar esta orden a Calidad?
              </h2>
              <p className="mt-1 text-[8px] leading-4 text-slate-500">
                Confirma que la ejecución y los consumos de material quedaron
                completos antes de cambiar de etapa.
              </p>
            </div>

            <div className="space-y-3 px-4 py-3.5">
              <div className="rounded-xl border border-amber-200 bg-amber-50/65 px-3 py-2.5">
                <p className="text-[8px] font-semibold text-amber-900">
                  Después de continuar
                </p>
                <p className="mt-1 text-[8px] leading-4 text-amber-800">
                  La OT pasará a QUALITY_PENDING y se creará la inspección de
                  Calidad. Ya no podrás registrar nuevos consumos de material
                  dentro de esta etapa de Producción.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/65 px-3 py-2.5">
                <p className="text-[7px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Lotes con consumo
                </p>
                <p className="mt-1 text-[11px] font-semibold text-slate-900">
                  {materialConsumptionCount}
                </p>
                <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                  Los consumos ya registrados se conservarán en la trazabilidad
                  de la orden.
                </p>
              </div>

              {mutations.handoff.error ? (
                <p
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
                >
                  {getErrorMessage(mutations.handoff.error)}
                </p>
              ) : null}
            </div>

            <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
              <Button
                variant="secondary"
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={mutations.handoff.isPending}
                onClick={() => {
                  mutations.handoff.reset()
                  setConfirmOpen(false)
                }}
              >
                Seguir en Producción
              </Button>
              <Button
                className="!h-7 !px-2.5 !text-[8px]"
                disabled={mutations.handoff.isPending}
                onClick={() => void handoff()}
              >
                {mutations.handoff.isPending
                  ? 'Enviando…'
                  : 'Confirmar envío a Calidad'}
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
