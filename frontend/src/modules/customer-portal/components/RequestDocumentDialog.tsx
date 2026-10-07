import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import {
  requestDocumentSchema,
  type RequestDocumentFormValues,
} from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

interface RequestDocumentDialogProps {
  open: boolean
  submitting: boolean
  error: unknown
  onClose: () => void
  onSubmit: (input: RequestDocumentUpload) => Promise<boolean>
}

export function RequestDocumentDialog({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: RequestDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<RequestDocumentFormValues>({
    resolver: zodResolver(requestDocumentSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  if (!open) return null

  const close = () => {
    reset()
    setFile(null)
    setFileError(null)
    onClose()
  }

  const selectFile = (selectedFile: File | null) => {
    setFile(selectedFile)
    setFileError(null)

    if (selectedFile && !getValues('name').trim()) {
      setValue('name', selectedFile.name, { shouldDirty: true })
    }
  }

  const submit = handleSubmit(async (values) => {
    if (!file) {
      setFileError('Selecciona un archivo.')
      return
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('El archivo no puede superar 25 MB.')
      return
    }

    if (
      await onSubmit({
        file,
        documentType: 'REQUEST_ATTACHMENT',
        name: values.name.trim() || file.name,
        ...(values.description.trim()
          ? { description: values.description.trim() }
          : {}),
      })
    ) {
      close()
    }
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !submitting) close()
      }}
    >
      <form
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-document-title"
        className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
        onSubmit={(event) => void submit(event)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="request-document-title"
              className="text-sm font-semibold text-slate-950"
            >
              Agregar documento
            </h2>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              Añade un archivo relacionado con esta solicitud.
            </p>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={submitting}
            aria-label="Cerrar"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              viewBox="0 0 24 24"
              aria-hidden="true"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.9"
              strokeLinecap="round"
            >
              <path d="m6 6 12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold text-slate-700">
              Nombre del documento
            </span>
            <input
              type="text"
              maxLength={180}
              className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-[10px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              {...register('name')}
            />
            {errors.name ? (
              <p className="mt-1 text-[8px] text-red-600">
                {errors.name.message}
              </p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[9px] font-semibold text-slate-700">
              Descripción
              <span className="ml-1 font-normal text-slate-400">
                (opcional)
              </span>
            </span>
            <textarea
              maxLength={500}
              className="min-h-20 w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] leading-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder="Añade contexto útil sobre este documento."
              {...register('description')}
            />
            {errors.description ? (
              <p className="mt-1 text-[8px] text-red-600">
                {errors.description.message}
              </p>
            ) : null}
          </label>

          <div>
            <span className="mb-1.5 block text-[9px] font-semibold text-slate-700">
              Archivo
            </span>

            <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-blue-300 bg-gradient-to-r from-blue-50/55 via-white to-slate-50/70 px-3.5 py-3 transition hover:border-blue-400 hover:from-blue-50/80 hover:to-blue-50/45">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-light text-blue-600 shadow-sm ring-1 ring-blue-100 transition group-hover:ring-blue-200">
                +
              </span>
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-semibold text-blue-700">
                  {file ? 'Cambiar archivo' : 'Seleccionar archivo'}
                </span>
                <span className="mt-0.5 block truncate text-[8px] leading-4 text-slate-500">
                  {file ? file.name : 'Archivo de máximo 25 MB.'}
                </span>
              </span>
              <input
                type="file"
                className="sr-only"
                onChange={(event) => {
                  selectFile(event.target.files?.[0] ?? null)
                  event.target.value = ''
                }}
              />
            </label>

            {fileError ? (
              <p className="mt-1.5 text-[8px] text-red-600">{fileError}</p>
            ) : null}
          </div>

          {error ? (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[9px] text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-4 text-[10px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {submitting ? 'Subiendo…' : 'Agregar'}
          </button>
        </div>
      </form>
    </div>
  )
}
