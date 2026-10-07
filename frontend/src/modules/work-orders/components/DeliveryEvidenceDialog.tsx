import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  attachDeliveryEvidenceSchema,
  type AttachDeliveryEvidenceFormValues,
} from '../schemas/delivery.schemas'
import type { DeliveryDto } from '../types/delivery.types'
import type { DeliveryEvidenceOption } from './CompleteDeliveryDialog'

interface DeliveryEvidenceDialogProps {
  delivery: DeliveryDto | null
  options: DeliveryEvidenceOption[]
  submitting: boolean
  uploading: boolean
  error: unknown
  uploadError: unknown
  onClose: () => void
  onSubmit: (values: AttachDeliveryEvidenceFormValues) => Promise<boolean>
  onUpload: (file: File) => Promise<boolean>
}

const MAX_FILE_SIZE = 25 * 1024 * 1024

export function DeliveryEvidenceDialog({
  delivery,
  options,
  submitting,
  uploading,
  error,
  uploadError,
  onClose,
  onSubmit,
  onUpload,
}: DeliveryEvidenceDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AttachDeliveryEvidenceFormValues>({
    resolver: zodResolver(attachDeliveryEvidenceSchema),
    defaultValues: { documentVersionId: '' },
  })

  if (!delivery) return null

  const busy = submitting || uploading

  const close = () => {
    reset()
    setFile(null)
    setFileError(null)
    onClose()
  }

  const submitExisting = handleSubmit(async (values) => {
    if (await onSubmit(values)) close()
  })

  const upload = async () => {
    setFileError(null)

    if (!file) {
      setFileError('Selecciona el archivo de evidencia.')
      return
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (await onUpload(file)) close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="delivery-evidence-title"
        className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Entrega #{delivery.id}
          </p>
          <h2
            id="delivery-evidence-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {delivery.evidenceDocumentVersionId
              ? 'Actualizar evidencia'
              : 'Agregar evidencia de entrega'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Puedes subir un archivo nuevo o vincular una versión ya existente.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          <div className="rounded-lg border border-blue-100 bg-blue-50/45 px-3 py-2.5">
            <p className="text-[9px] font-semibold text-slate-900">
              Subir archivo
            </p>
            <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
              Se guardará como evidencia de entrega y quedará vinculada a este despacho.
            </p>

            <input
              type="file"
              disabled={busy}
              onChange={(event) => {
                setFileError(null)
                setFile(event.target.files?.[0] ?? null)
              }}
              className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[9px] text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-[8px] file:font-semibold file:text-slate-700"
            />

            {fileError ? (
              <p className="mt-1.5 text-[8px] text-amber-700">{fileError}</p>
            ) : null}

            {uploadError ? (
              <p className="mt-1.5 text-[8px] text-red-700">
                {getErrorMessage(uploadError)}
              </p>
            ) : null}

            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => void upload()}
                disabled={busy}
              >
                {uploading ? 'Subiendo…' : 'Subir y vincular'}
              </Button>
            </div>
          </div>

          {options.length > 0 ? (
            <form
              className="rounded-lg border border-slate-200 px-3 py-2.5"
              onSubmit={(event) => void submitExisting(event)}
            >
              <p className="text-[9px] font-semibold text-slate-900">
                Vincular versión existente
              </p>
              <p className="mt-0.5 text-[8px] leading-4 text-slate-400">
                Úsalo si la evidencia ya fue cargada al expediente.
              </p>

              <label
                htmlFor="evidence-version"
                className="mb-1.5 mt-2 block text-[10px] font-semibold text-slate-800"
              >
                Documento
              </label>
              <select
                id="evidence-version"
                disabled={busy}
                className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[10px] text-slate-950 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                {...register('documentVersionId')}
              >
                <option value="">Selecciona una evidencia</option>
                {options.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>

              {errors.documentVersionId ? (
                <p className="mt-1 text-[8px] text-red-600">
                  {errors.documentVersionId.message}
                </p>
              ) : null}

              {error ? (
                <p className="mt-1.5 text-[8px] text-red-700">
                  {getErrorMessage(error)}
                </p>
              ) : null}

              <div className="mt-2 flex justify-end">
                <Button
                  size="sm"
                  variant="secondary"
                  type="submit"
                  className="!h-7 !px-2.5 !text-[8px]"
                  disabled={busy}
                >
                  {submitting ? 'Vinculando…' : 'Vincular existente'}
                </Button>
              </div>
            </form>
          ) : (
            <p className="text-[8px] leading-4 text-slate-400">
              No hay otras evidencias cargadas en el expediente.
            </p>
          )}
        </div>

        <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-4 py-2.5">
          <Button
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={busy}
          >
            Cerrar
          </Button>
        </div>
      </section>
    </div>
  )
}
