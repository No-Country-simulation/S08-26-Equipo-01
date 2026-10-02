import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  nonConformityDetailsSchema,
  type NonConformityDetailsFormValues,
} from '../schemas/nonConformity.schemas'
import type { NonConformityDto } from '../types/quality.types'

interface EditNonConformityDialogProps {
  open: boolean
  nonConformity: NonConformityDto
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: NonConformityDetailsFormValues) => Promise<boolean>
}

export function EditNonConformityDialog({
  open,
  nonConformity,
  submitting,
  error,
  onClose,
  onSubmit,
}: EditNonConformityDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NonConformityDetailsFormValues>({
    resolver: zodResolver(nonConformityDetailsSchema),
    defaultValues: {
      affectedQuantity: nonConformity.affectedQuantity ?? 1,
      severity: nonConformity.severity ?? '',
      description: nonConformity.description ?? '',
    },
  })

  useEffect(() => {
    if (!open) return

    reset({
      affectedQuantity: nonConformity.affectedQuantity ?? 1,
      severity: nonConformity.severity ?? '',
      description: nonConformity.description ?? '',
    })
  }, [nonConformity, open, reset])

  if (!open) return null

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) onClose()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-nc-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-red-100 bg-gradient-to-r from-white via-white to-red-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
            {nonConformity.number}
          </p>
          <h2
            id="edit-nc-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Datos de la no conformidad
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Estos datos quedan bloqueados cuando se define una disposición.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextField
              label="Cantidad afectada"
              type="number"
              min="1"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.affectedQuantity?.message}
              {...register('affectedQuantity', { valueAsNumber: true })}
            />
            <TextField
              label="Severidad"
              maxLength={50}
              placeholder="Ej. MAJOR"
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
              error={errors.severity?.message}
              {...register('severity')}
            />
          </div>

          <TextareaField
            label="Descripción"
            maxLength={4000}
            placeholder="Describe la desviación, criterio incumplido y evidencia relevante…"
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.description?.message}
            {...register('description')}
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
            onClick={onClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Guardar datos'}
          </Button>
        </div>
      </form>
    </div>
  )
}
