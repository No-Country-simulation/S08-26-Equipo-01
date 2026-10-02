import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  createMaterialSchema,
  type CreateMaterialFormValues,
} from '../schemas/resource.schemas'

interface CreateMaterialDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateMaterialFormValues) => Promise<boolean>
}

export function CreateMaterialDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateMaterialDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateMaterialFormValues>({
    resolver: zodResolver(createMaterialSchema),
    defaultValues: { code: '', name: '', specification: '', unit: '' },
  })

  if (!open) return null

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
        aria-labelledby="create-material-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Recursos · Materiales
          </p>
          <h2
            id="create-material-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Registrar material
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Crea la referencia base. Las entradas físicas se registran después como lotes.
          </p>
        </div>

        <div className="grid gap-3 px-4 py-3.5 sm:grid-cols-2">
          <TextField
            label="Código"
            maxLength={50}
            placeholder="AL-6061"
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.code?.message}
            {...register('code')}
          />
          <TextField
            label="Unidad"
            maxLength={20}
            placeholder="kg, pza, m"
            disabled={submitting}
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.unit?.message}
            {...register('unit')}
          />
          <div className="sm:col-span-2">
            <TextField
              label="Nombre"
              maxLength={255}
              placeholder="Aluminio 6061"
              disabled={submitting}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.name?.message}
              {...register('name')}
            />
          </div>
          <div className="sm:col-span-2">
            <TextareaField
              label="Especificación"
              maxLength={500}
              placeholder="Norma, grado, dimensiones u otra referencia técnica…"
              disabled={submitting}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
              error={errors.specification?.message}
              {...register('specification')}
            />
          </div>

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
            {submitting ? 'Registrando…' : 'Registrar material'}
          </Button>
        </div>
      </form>
    </div>
  )
}
