import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  completeDeliverySchema,
  type CompleteDeliveryFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'

export interface DeliveryEvidenceOption {
  id: number
  label: string
}

interface CompleteDeliveryDialogProps {
  delivery: DeliveryDto | null
  evidenceOptions: DeliveryEvidenceOption[]
  submitting: boolean
  uploading: boolean
  error: unknown
  uploadError: unknown
  onClose: () => void
  onSubmit: (
    values: CompleteDeliveryFormValues,
    evidenceFile: File | null,
  ) => Promise<boolean>
}

const MAX_FILE_SIZE = 25 * 1024 * 1024

function currentLocalDateTime(): string {
  const date = new Date()
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return local.toISOString().slice(0, 16)
}

export function CompleteDeliveryDialog({
  delivery,
  evidenceOptions,
  submitting,
  uploading,
  error,
  uploadError,
  onClose,
  onSubmit,
}: CompleteDeliveryDialogProps) {
  const [dateError, setDateError] = useState<string | null>(null)
  const [evidenceFile, setEvidenceFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CompleteDeliveryFormValues>({
    resolver: zodResolver(completeDeliverySchema),
    defaultValues: {
      receivedByName: '',
      deliveredAt: currentLocalDateTime(),
      evidenceDocumentVersionId: '',
    },
  })

  useEffect(() => {
    if (!delivery) return
    setEvidenceFile(null)
    setFileError(null)
    reset({
      receivedByName: '',
      deliveredAt: currentLocalDateTime(),
      evidenceDocumentVersionId: delivery.evidenceDocumentVersionId
        ? String(delivery.evidenceDocumentVersionId)
        : '',
    })
  }, [delivery, reset])

  if (!delivery) return null

  const busy = submitting || uploading
  const evidenceRegister = register('evidenceDocumentVersionId')

  const close = () => {
    reset()
    setDateError(null)
    setEvidenceFile(null)
    setFileError(null)
    onClose()
  }

  const submit = handleSubmit(async (values) => {
    setDateError(null)
    setFileError(null)

    const deliveredAt = new Date(values.deliveredAt)
    const dispatchedAt = delivery.dispatchedAt
      ? new Date(delivery.dispatchedAt)
      : null

    if (Number.isNaN(deliveredAt.getTime()) || deliveredAt > new Date()) {
      setDateError('La fecha de entrega debe ser válida y no puede ser futura.')
      return
    }

    if (dispatchedAt && deliveredAt < dispatchedAt) {
      setDateError('La entrega no puede registrarse antes del despacho.')
      return
    }

    if (evidenceFile && evidenceFile.size > MAX_FILE_SIZE) {
      setFileError('La evidencia no puede superar 25 MB.')
      return
    }

    if (await onSubmit(values, evidenceFile)) close()
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-delivery-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="border-b border-emerald-100 bg-gradient-to-r from-white via-white to-emerald-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-emerald-700">
            Entrega #{delivery.id}
          </p>
          <h2
            id="complete-delivery-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            Registrar recepción
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Registra quién recibió y, si aplica, adjunta una foto o comprobante
            de la entrega antes de cerrarla.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <TextField
            label="Recibido por"
            maxLength={160}
            labelClassName="!mb-1 !text-[9px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
            error={errors.receivedByName?.message}
            {...register('receivedByName')}
          />
          <TextField
            label="Fecha real de entrega"
            type="datetime-local"
            labelClassName="!mb-1 !text-[9px]"
            className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
            error={errors.deliveredAt?.message}
            {...register('deliveredAt')}
          />

          <section className="rounded-xl border border-blue-100 bg-blue-50/35 px-3 py-3">
            <p className="text-[8px] font-semibold text-slate-900">
              Evidencia de entrega
              <span className="ml-1 font-normal text-slate-400">(opcional)</span>
            </p>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
              Puedes adjuntar una foto o PDF ahora, o reutilizar una evidencia
              ya cargada en el expediente.
            </p>

            <div className="mt-2.5">
              <label
                htmlFor="delivery-evidence-file"
                className="mb-1 block text-[8px] font-semibold text-slate-700"
              >
                Subir foto o archivo
              </label>
              <input
                id="delivery-evidence-file"
                type="file"
                accept="image/*,application/pdf"
                disabled={busy}
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null
                  setFileError(null)
                  setEvidenceFile(file)
                  if (file) {
                    setValue('evidenceDocumentVersionId', '', {
                      shouldDirty: true,
                    })
                  }
                }}
                className="block w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-[8px] text-slate-600 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-[8px] file:font-semibold file:text-slate-700"
              />
              {evidenceFile ? (
                <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-emerald-100 bg-emerald-50/65 px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="truncate text-[8px] font-semibold text-emerald-900">
                      {evidenceFile.name}
                    </p>
                    <p className="mt-0.5 text-[7px] text-emerald-700">
                      {(evidenceFile.size / 1024 / 1024).toFixed(2)} MB · se
                      subirá al confirmar
                    </p>
                  </div>
                  <button
                    type="button"
                    className="shrink-0 text-[8px] font-semibold text-slate-500 hover:text-slate-700"
                    onClick={() => setEvidenceFile(null)}
                  >
                    Quitar
                  </button>
                </div>
              ) : null}
              {fileError ? (
                <p className="mt-1 text-[8px] text-amber-700">{fileError}</p>
              ) : null}
            </div>

            {evidenceOptions.length > 0 ? (
              <div className="mt-2.5 border-t border-blue-100 pt-2.5">
                <label
                  htmlFor="delivery-evidence"
                  className="mb-1 block text-[8px] font-semibold text-slate-700"
                >
                  O vincular evidencia existente
                </label>
                <div className="relative">
                  <select
                    id="delivery-evidence"
                    disabled={busy || evidenceFile !== null}
                    className="h-7 w-full appearance-none rounded-lg border border-slate-300 bg-white px-2 pr-7 !text-[8px] !font-normal text-slate-700 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-400"
                    {...evidenceRegister}
                    onChange={(event) => {
                      void evidenceRegister.onChange(event)
                      if (event.target.value) setEvidenceFile(null)
                    }}
                  >
                    <option value="">Sin evidencia documental</option>
                    {evidenceOptions.map((option) => (
                      <option
                        key={option.id}
                        value={option.id}
                        className="text-[8px] font-normal"
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    className="pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-400"
                    fill="currentColor"
                  >
                    <path d="M5.22 7.47a.75.75 0 0 1 1.06 0L10 11.19l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 8.53a.75.75 0 0 1 0-1.06Z" />
                  </svg>
                </div>
              </div>
            ) : null}

            {delivery.evidenceFileName && !evidenceFile ? (
              <p className="mt-2 text-[8px] text-emerald-700">
                Evidencia vinculada actualmente: {delivery.evidenceFileName}
              </p>
            ) : null}
          </section>

          {dateError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              {dateError}
            </p>
          ) : null}

          {uploadError ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              No pudimos subir la evidencia. {getErrorMessage(uploadError)}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="flex justify-end gap-1.5 border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            type="button"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={busy}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="!h-7 !px-2.5 !text-[8px]"
            disabled={busy}
          >
            {uploading
              ? 'Subiendo evidencia…'
              : submitting
                ? 'Registrando…'
                : 'Confirmar entrega'}
          </Button>
        </div>
      </form>
    </div>
  )
}
