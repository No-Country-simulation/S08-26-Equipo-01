import { useState } from 'react'
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

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024

interface CreateMaterialDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (
    values: CreateMaterialFormValues,
    technicalSheet: File | null,
  ) => Promise<boolean>
}

export function CreateMaterialDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: CreateMaterialDialogProps) {
  const [technicalSheet, setTechnicalSheet] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
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

  const clear = () => {
    reset()
    setTechnicalSheet(null)
    setFileError(null)
  }

  const close = () => {
    clear()
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    if (await onSubmit(values, technicalSheet)) {
      clear()
      onClose()
    }
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-material-title"
        className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Materiales
          </p>
          <h2
            id="create-material-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Registrar material
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Crea la referencia base y, si ya la tienes, adjunta su ficha técnica en el mismo registro.
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

          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50/70 p-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[9px] font-semibold text-slate-800">
                  Ficha técnica o documento de referencia
                </p>
                <p className="mt-0.5 text-[7px] leading-3.5 text-slate-500">
                  Opcional. Se adjuntará automáticamente al material al registrarlo. Máximo 25 MB.
                </p>
              </div>
              <label className="inline-flex h-7 cursor-pointer items-center justify-center rounded-lg border border-slate-300 bg-white px-2.5 text-[8px] font-semibold text-slate-700 transition hover:bg-slate-50">
                {technicalSheet ? 'Cambiar archivo' : 'Seleccionar archivo'}
                <input
                  type="file"
                  className="sr-only"
                  disabled={submitting}
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    if (file && file.size > MAX_FILE_SIZE_BYTES) {
                      setTechnicalSheet(null)
                      setFileError('El archivo no puede superar 25 MB.')
                      event.target.value = ''
                      return
                    }
                    setTechnicalSheet(file)
                    setFileError(null)
                  }}
                />
              </label>
            </div>
            {technicalSheet ? (
              <p className="mt-2 truncate text-[8px] font-medium text-blue-700">
                {technicalSheet.name}
              </p>
            ) : null}
            {fileError ? (
              <p className="mt-2 text-[8px] text-red-700">{fileError}</p>
            ) : null}
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
            disabled={submitting || Boolean(fileError)}
          >
            {submitting ? 'Guardando…' : 'Registrar material'}
          </Button>
        </div>
      </form>
    </div>
  )
}
