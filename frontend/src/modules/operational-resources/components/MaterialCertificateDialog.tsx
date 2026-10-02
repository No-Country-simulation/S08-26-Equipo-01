import { useState } from 'react'
import type { MaterialDto, MaterialLotDto } from '@/modules/materials'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'

interface MaterialCertificateDialogProps {
  material: MaterialDto
  lot: MaterialLotDto | null
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (file: File) => Promise<boolean>
}

const MAX_FILE_SIZE = 25 * 1024 * 1024

export function MaterialCertificateDialog(
  props: MaterialCertificateDialogProps,
) {
  if (!props.lot) return null

  return (
    <MaterialCertificateDialogContent
      key={props.lot.id}
      {...props}
      lot={props.lot}
    />
  )
}

interface MaterialCertificateDialogContentProps
  extends Omit<MaterialCertificateDialogProps, 'lot'> {
  lot: MaterialLotDto
}

function MaterialCertificateDialogContent({
  material,
  lot,
  submitting,
  error,
  onClose,
  onSubmit,
}: MaterialCertificateDialogContentProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const close = () => {
    setFile(null)
    setFileError(null)
    onClose()
  }

  const submit = async () => {
    setFileError(null)

    if (!file) {
      setFileError('Selecciona el archivo del certificado.')
      return
    }
    if (file.size > MAX_FILE_SIZE) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (await onSubmit(file)) close()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="material-certificate-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/60 px-4 py-3.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            {material.code} · Lote {lot.lotNumber}
          </p>
          <h2
            id="material-certificate-title"
            className="mt-0.5 text-[14px] font-semibold text-slate-950"
          >
            {lot.certificateDocumentVersionId
              ? 'Actualizar certificado'
              : 'Adjuntar certificado'}
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            La nueva carga quedará vinculada al lote y, si ya existe un
            certificado, se conservará como una nueva versión.
          </p>
        </div>

        <div className="space-y-3 px-4 py-3.5">
          {lot.certificateFileName ? (
            <div className="rounded-lg border border-slate-200 bg-slate-50/70 px-3 py-2.5">
              <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                Versión vigente
              </p>
              <p className="mt-0.5 truncate text-[9px] font-semibold text-slate-800">
                {lot.certificateFileName}
              </p>
            </div>
          ) : null}

          <label className="block">
            <span className="mb-1.5 block text-[10px] font-semibold text-slate-800">
              Archivo del certificado
            </span>
            <input
              type="file"
              disabled={submitting}
              onChange={(event) => {
                setFileError(null)
                setFile(event.target.files?.[0] ?? null)
              }}
              className="block w-full rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-[9px] text-slate-700 file:mr-2 file:rounded-md file:border-0 file:bg-slate-100 file:px-2.5 file:py-1.5 file:text-[8px] file:font-semibold file:text-slate-700"
            />
            <p className="mt-1 text-[8px] text-slate-400">
              Máximo 25 MB.
            </p>
          </label>

          {fileError ? (
            <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] leading-4 text-amber-800">
              {fileError}
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
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={close}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => void submit()}
            disabled={submitting}
          >
            {submitting ? 'Guardando…' : 'Guardar certificado'}
          </Button>
        </div>
      </section>
    </div>
  )
}
