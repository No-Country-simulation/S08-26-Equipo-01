import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  qualityCheckSchema,
  type QualityCheckFormValues,
} from '../schemas/quality.schemas'
import type { QualityCheckDto } from '../types/quality.types'

interface QualityCheckDialogProps {
  open: boolean
  qualityCheck: QualityCheckDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: QualityCheckFormValues) => Promise<boolean>
}

const emptyValues: QualityCheckFormValues = {
  type: 'NUMERIC_RANGE',
  name: '',
  nominalValue: undefined,
  lowerLimit: undefined,
  upperLimit: undefined,
  measuredValue: undefined,
  unit: '',
  result: undefined,
  notes: '',
}

export function QualityCheckDialog({
  open,
  qualityCheck,
  submitting,
  error,
  onClose,
  onSubmit,
}: QualityCheckDialogProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<QualityCheckFormValues>({
    resolver: zodResolver(qualityCheckSchema),
    defaultValues: emptyValues,
  })

  const type = watch('type')

  useEffect(() => {
    if (!open) return

    reset(
      qualityCheck
        ? {
            type: qualityCheck.type,
            name: qualityCheck.name,
            nominalValue: qualityCheck.nominalValue ?? undefined,
            lowerLimit: qualityCheck.lowerLimit ?? undefined,
            upperLimit: qualityCheck.upperLimit ?? undefined,
            measuredValue: qualityCheck.measuredValue ?? undefined,
            unit: qualityCheck.unit ?? '',
            result:
              qualityCheck.type === 'PASS_FAIL'
                ? qualityCheck.result
                : undefined,
            notes: qualityCheck.notes ?? '',
          }
        : emptyValues,
    )
  }, [open, qualityCheck, reset])

  if (!open) return null

  const close = () => {
    reset(emptyValues)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values)) reset(emptyValues)
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="quality-check-title"
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Calidad · Control
          </p>
          <h2
            id="quality-check-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {qualityCheck ? 'Editar control' : 'Registrar control'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Usa medición con tolerancia para valores numéricos o conformidad
            PASS/FAIL para pruebas visuales, funcionales o documentales.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div>
            <label className="mb-1.5 block text-[10px] font-medium text-slate-700">
              Tipo de control
            </label>
            <select
              className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 !text-[10px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              {...register('type')}
            >
              <option value="NUMERIC_RANGE">Medición con tolerancia</option>
              <option value="PASS_FAIL">Conformidad PASS / FAIL</option>
            </select>
          </div>

          <TextField
            label="Control"
            maxLength={200}
            placeholder={
              type === 'NUMERIC_RANGE'
                ? 'Ej. Diámetro exterior'
                : 'Ej. Inspección visual de rebabas'
            }
            labelClassName="!mb-1.5 !text-[10px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            error={errors.name?.message}
            {...register('name')}
          />

          {type === 'NUMERIC_RANGE' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <TextField
                  label="Valor nominal"
                  type="number"
                  step="any"
                  labelClassName="!mb-1.5 !text-[10px]"
                  className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                  error={errors.nominalValue?.message}
                  {...register('nominalValue', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),
                  })}
                />
                <TextField
                  label="Unidad"
                  maxLength={20}
                  placeholder="mm, µm, °C…"
                  labelClassName="!mb-1.5 !text-[10px]"
                  className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                  error={errors.unit?.message}
                  {...register('unit')}
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <TextField
                  label="Límite inferior"
                  type="number"
                  step="any"
                  labelClassName="!mb-1.5 !text-[10px]"
                  className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                  error={errors.lowerLimit?.message}
                  {...register('lowerLimit', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),
                  })}
                />
                <TextField
                  label="Valor medido"
                  type="number"
                  step="any"
                  labelClassName="!mb-1.5 !text-[10px]"
                  className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                  error={errors.measuredValue?.message}
                  {...register('measuredValue', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),
                  })}
                />
                <TextField
                  label="Límite superior"
                  type="number"
                  step="any"
                  labelClassName="!mb-1.5 !text-[10px]"
                  className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
                  error={errors.upperLimit?.message}
                  {...register('upperLimit', {
                    setValueAs: (value) =>
                      value === '' ? undefined : Number(value),
                  })}
                />
              </div>

              <p className="rounded-lg border border-blue-100 bg-blue-50/45 px-3 py-2 text-[8px] leading-4 text-blue-800">
                PASS o FAIL se calcula automáticamente en backend usando el
                rango registrado.
              </p>
            </>
          ) : (
            <div>
              <label className="mb-1.5 block text-[10px] font-medium text-slate-700">
                Resultado
              </label>
              <select
                className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 !text-[10px] text-slate-900 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                {...register('result')}
              >
                <option value="">Selecciona el resultado</option>
                <option value="PASS">PASS · Conforme</option>
                <option value="FAIL">FAIL · No conforme</option>
              </select>
              {errors.result?.message ? (
                <p className="mt-1 text-[8px] text-red-600">
                  {errors.result.message}
                </p>
              ) : null}
            </div>
          )}

          <TextareaField
            label="Notas / evidencia observada"
            maxLength={2000}
            placeholder={
              type === 'NUMERIC_RANGE'
                ? 'Instrumento, condición u observaciones relevantes…'
                : 'Describe qué se revisó y cualquier evidencia u observación relevante…'
            }
            labelClassName="!mb-1.5 !text-[10px]"
            className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
            error={errors.notes?.message}
            {...register('notes')}
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
            {submitting
              ? 'Guardando…'
              : qualityCheck
                ? 'Guardar cambios'
                : 'Registrar control'}
          </Button>
        </div>
      </form>
    </div>
  )
}
