import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { MaterialDto } from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createMaterialLotSchema,
  type CreateMaterialLotFormValues,
} from '../schemas/resource.schemas'

interface CreateMaterialLotDialogProps {
  material: MaterialDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateMaterialLotFormValues) => Promise<boolean>
}

export function CreateMaterialLotDialog({
  material,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateMaterialLotDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialLotFormValues>({
    resolver: zodResolver(createMaterialLotSchema),
    defaultValues: {
      lotNumber: '',
      supplier: '',
      receivedAt: '',
      quantityReceived: 1,
    },
  })

  if (!material) return null

  const close = () => {
    reset()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) {
      reset()
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-material-lot-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Materiales · Lotes
          </p>
          <h2
            id="create-material-lot-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Registrar lote
          </h2>
          <p className="mt-1 text-[9px] text-slate-500">
            {material.code} · {material.name} · {material.unit}
          </p>
        </div>

        <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2">
          <TextField
            label="Número de lote"
            maxLength={100}
            placeholder="L-2026-009"
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.lotNumber?.message}
            {...register('lotNumber')}
          />
          <TextField
            label="Proveedor"
            maxLength={255}
            placeholder="Opcional"
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.supplier?.message}
            {...register('supplier')}
          />
          <TextField
            label="Cantidad recibida"
            type="number"
            min="0.001"
            step="0.001"
            endAdornment={
              <span className="text-[8px] font-medium text-slate-500">
                {material.unit}
              </span>
            }
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.quantityReceived?.message}
            {...register('quantityReceived', { valueAsNumber: true })}
          />
          <TextField
            label="Fecha de recepción"
            type="datetime-local"
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.receivedAt?.message}
            hint="Vacío = hora actual del backend."
            {...register('receivedAt')}
          />

          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700 sm:col-span-2"
            >
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting ? 'Registrando…' : 'Registrar lote'}
          </Button>
        </div>
      </form>
    </div>
  )
}
