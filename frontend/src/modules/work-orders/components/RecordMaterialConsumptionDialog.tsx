import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  useMaterialLots,
  useMaterials,
  type RecordMaterialConsumptionPayload,
} from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  materialConsumptionSchema,
  type MaterialConsumptionFormValues,
} from '../schemas/production.schemas'

interface RecordMaterialConsumptionDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (payload: RecordMaterialConsumptionPayload) => Promise<boolean>
}

export function RecordMaterialConsumptionDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RecordMaterialConsumptionDialogProps) {
  const materialsQuery = useMaterials(open)
  const [materialId, setMaterialId] = useState<number | null>(null)
  const [lotId, setLotId] = useState<number | null>(null)
  const lotsQuery = useMaterialLots(open ? materialId : null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MaterialConsumptionFormValues>({
    resolver: zodResolver(materialConsumptionSchema),
    defaultValues: { quantityUsed: 0.001 },
  })

  if (!open) return null

  const close = () => {
    setMaterialId(null)
    setLotId(null)
    reset({ quantityUsed: 0.001 })
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (lotId === null) return

    if (
      await onSubmit({
        materialLotId: lotId,
        quantityUsed: values.quantityUsed,
      })
    ) {
      close()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-material-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Producción · Material
          </p>
          <h2
            id="record-material-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Registrar consumo
          </h2>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Registra el lote y la cantidad realmente consumida por esta orden.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div>
            <label
              htmlFor="material-consumption-material"
              className="mb-1 block text-[9px] font-semibold text-slate-800"
            >
              Material
            </label>
            <div className="relative">
              <select
                id="material-consumption-material"
                value={materialId ?? ''}
                disabled={materialsQuery.isPending || submitting}
                onChange={(event) => {
                  setMaterialId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                  setLotId(null)
                }}
                className="h-8 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2.5 pr-8 !text-[9px] !font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Seleccionar material</option>
                {(materialsQuery.data ?? []).map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.code} · {material.name} · {material.unit}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          <div>
            <label
              htmlFor="material-consumption-lot"
              className="mb-1 block text-[9px] font-semibold text-slate-800"
            >
              Lote
            </label>
            <div className="relative">
              <select
                id="material-consumption-lot"
                value={lotId ?? ''}
                disabled={
                  materialId === null || lotsQuery.isPending || submitting
                }
                onChange={(event) =>
                  setLotId(event.target.value ? Number(event.target.value) : null)
                }
                className="h-8 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2.5 pr-8 !text-[9px] !font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Seleccionar lote</option>
                {(lotsQuery.data ?? []).map((lot) => (
                  <option key={lot.id} value={lot.id}>
                    {lot.lotNumber} · recibido {lot.quantityReceived}
                  </option>
                ))}
              </select>
              <SelectChevron />
            </div>
          </div>

          <TextField
            label="Cantidad usada"
            labelClassName="!mb-1 !text-[9px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
            type="number"
            min="0.001"
            step="0.001"
            error={errors.quantityUsed?.message}
            {...register('quantityUsed', { valueAsNumber: true })}
          />

          {materialsQuery.isError || lotsQuery.isError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              No pudimos cargar el catálogo de materiales o lotes.
            </p>
          ) : null}

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            type="button"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
            onClick={close}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={lotId === null || submitting}
          >
            {submitting ? 'Registrando…' : 'Registrar consumo'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className="pointer-events-none absolute right-2.5 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
      fill="currentColor"
    >
      <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
    </svg>
  )
}
