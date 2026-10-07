import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  useAsIsSchema,
  type UseAsIsFormValues,
} from '../schemas/nonConformity.schemas'
import type { NonConformityDto } from '../types/quality.types'

interface UseAsIsDialogProps {
  open: boolean
  nonConformity: NonConformityDto
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: UseAsIsFormValues) => Promise<boolean>
}

export function UseAsIsDialog({
  open,
  nonConformity,
  submitting,
  error,
  onClose,
  onSubmit,
}: UseAsIsDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UseAsIsFormValues>({
    resolver: zodResolver(useAsIsSchema),
    defaultValues: { reason: '' },
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
        aria-labelledby="use-as-is-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            USE_AS_IS · {nonConformity.number}
          </p>
          <h2
            id="use-as-is-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Autorizar aceptación bajo concesión
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Cierra la NC y permite avanzar a entrega conservando la inspección original como REJECTED.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <TextareaField
            label="Justificación de la concesión"
            maxLength={4000}
            placeholder="Explica por qué la desviación puede aceptarse para esta aplicación…"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.reason?.message}
            {...register('reason')}
          />

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
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
            {submitting ? 'Autorizando…' : 'Autorizar concesión'}
          </Button>
        </div>
      </form>
    </div>
  )
}
