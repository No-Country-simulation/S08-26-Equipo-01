import { useState, type ReactNode } from 'react'
import type {
  FieldErrors,
  UseFormRegister,
  UseFormSetValue,
} from 'react-hook-form'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type {
  MaterialRequirementType,
  RequestDocumentUpload,
} from '../types/customerRequest.types'

interface CustomerRequestRequirementsStepProps {
  register: UseFormRegister<CustomerRequestFormValues>
  errors: FieldErrors<CustomerRequestFormValues>
  materialRequirementType: MaterialRequirementType
  setValue: UseFormSetValue<CustomerRequestFormValues>
  documents: RequestDocumentUpload[]
  documentError: string | null
  onAddFiles: (files: FileList | null) => void
  onRemoveFile: (index: number) => void
  onUpdateFile: (
    index: number,
    patch: Pick<RequestDocumentUpload, 'name' | 'description'>,
  ) => void
  actions: ReactNode
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toUpperCase() : 'DOC'
}

export function CustomerRequestRequirementsStep({
  register,
  errors,
  materialRequirementType,
  setValue,
  documents,
  documentError,
  onAddFiles,
  onRemoveFile,
  onUpdateFile,
  actions,
}: CustomerRequestRequirementsStepProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftDescription, setDraftDescription] = useState('')

  const editingDocument =
    editingIndex === null ? null : (documents[editingIndex] ?? null)

  const openEditor = (index: number) => {
    const document = documents[index]
    if (!document) return

    setDraftName(document.name?.trim() || document.file.name)
    setDraftDescription(document.description ?? '')
    setEditingIndex(index)
  }

  const closeEditor = () => {
    setEditingIndex(null)
    setDraftName('')
    setDraftDescription('')
  }

  const saveDocumentDetails = () => {
    if (editingIndex === null || !editingDocument) return

    const normalizedName = draftName.trim()
    if (!normalizedName) return

    onUpdateFile(editingIndex, {
      name: normalizedName,
      description: draftDescription.trim() || undefined,
    })
    closeEditor()
  }

  return (
    <>
      <div className="grid min-w-0 max-w-full gap-4 overflow-x-hidden lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
        <Card className="min-w-0 max-w-full overflow-hidden p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <SidebarNavIcon name="materials" className="h-[17px] w-[17px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-indigo-600">
                Definición técnica
              </p>
              <h2 className="mt-0.5 text-base font-semibold text-slate-950">
                Requisitos técnicos
              </h2>
              <p className="mt-0.5 text-[10px] leading-4 text-slate-500">
                Puedes especificar el material o pedir apoyo para definirlo.
              </p>
            </div>
          </div>

          <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-2">
            {[
              {
                value: 'SPECIFIED' as const,
                title: 'Ya conozco el material',
                detail: 'Indica material, norma y requisitos conocidos.',
              },
              {
                value: 'ASSISTANCE_REQUIRED' as const,
                title: 'Necesito asesoría técnica',
                detail: 'Describe el uso y el equipo propondrá una opción.',
              },
            ].map((option) => {
              const selected = materialRequirementType === option.value

              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setValue('materialRequirementType', option.value, {
                      shouldValidate: true,
                      shouldDirty: true,
                    })
                  }
                  className={
                    selected
                      ? 'flex min-w-0 items-start gap-3 rounded-xl border border-blue-500 bg-blue-50/70 p-3.5 text-left shadow-sm'
                      : 'flex min-w-0 items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-left transition hover:border-slate-300 hover:bg-white'
                  }
                >
                  <span
                    className={
                      selected
                        ? 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white'
                        : 'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-white'
                    }
                  >
                    {selected ? '✓' : ''}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-[11px] font-semibold text-slate-950 [overflow-wrap:anywhere]">
                      {option.title}
                    </span>
                    <span className="mt-1 block break-words text-[9px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                      {option.detail}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>

          <div className="mt-3 min-w-0 [&_label]:mb-1.5 [&_label]:text-[11px] [&_p]:mt-1 [&_p]:text-[9px]">
            <TextareaField
              label={
                materialRequirementType === 'SPECIFIED'
                  ? 'Material / norma / requisitos'
                  : 'Contexto para la asesoría'
              }
              className="!min-h-20 !px-3 !py-2 !text-[11px] !leading-4"
              maxLength={2000}
              hint="Incluye tolerancias, condiciones de uso u otros requisitos que ya conozcas."
              error={errors.materialRequirement?.message}
              {...register('materialRequirement')}
            />
          </div>

          <div className="mt-3 min-w-0 overflow-hidden rounded-xl border border-blue-200 bg-blue-50/65 px-3 py-2.5">
            <p className="break-words text-[9px] leading-4 text-slate-700 [overflow-wrap:anywhere]">
              No necesitas elegir el proceso de fabricación. Comercial e
              Ingeniería lo determinan durante la revisión.
            </p>
          </div>
        </Card>

        <div className="flex min-h-0 min-w-0 max-w-full flex-col gap-3 lg:h-full">
          <Card className="min-h-0 min-w-0 max-w-full flex-1 overflow-hidden p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)] lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <SidebarNavIcon
                    name="documents"
                    className="h-[17px] w-[17px]"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                    Archivos del trabajo
                  </p>
                  <h2 className="mt-0.5 text-base font-semibold text-slate-950">
                    Documentos
                  </h2>
                  <p className="mt-0.5 break-words text-[10px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                    Planos, fotos, especificaciones u otra referencia útil.
                  </p>
                </div>
              </div>

              {documents.length > 0 ? (
                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[8px] font-semibold text-slate-600">
                  {documents.length} / 5
                </span>
              ) : null}
            </div>

            <label className="group mt-3 flex min-w-0 max-w-full cursor-pointer items-center gap-3 overflow-hidden rounded-xl border border-dashed border-blue-300 bg-gradient-to-r from-blue-50/55 via-white to-slate-50/70 px-3.5 py-3 transition hover:border-blue-400 hover:from-blue-50/80 hover:to-blue-50/45">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-lg font-light text-blue-600 shadow-sm ring-1 ring-blue-100 transition group-hover:ring-blue-200">
                +
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[10px] font-semibold text-blue-700">
                  Agregar archivos
                </span>
                <span className="mt-0.5 block break-words text-[8px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                  Selecciona hasta 5 archivos de máximo 25 MB.
                </span>
              </span>
              <input
                type="file"
                multiple
                className="sr-only"
                onChange={(event) => {
                  onAddFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>

            {documentError ? (
              <p className="mt-2 break-words rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[10px] text-red-700 [overflow-wrap:anywhere]">
                {documentError}
              </p>
            ) : null}

            <div className="mt-3 min-w-0 max-w-full space-y-2">
              {documents.map((document, index) => (
                <div
                  key={`${document.file.name}-${index}`}
                  className="group flex min-w-0 max-w-full items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M7 3h7l4 4v14H7z" />
                      <path d="M14 3v5h5" />
                      <path d="M10 13h5M10 16h5" />
                    </svg>
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <p className="max-w-full truncate text-[10px] font-semibold text-slate-800">
                      {document.name?.trim() || document.file.name}
                    </p>
                    <div className="mt-0.5 flex min-w-0 items-center gap-2 text-[8px] text-slate-500">
                      <span className="shrink-0">
                        {(document.file.size / (1024 * 1024)).toFixed(1)} MB
                      </span>
                      <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
                      <span className="truncate">
                        {getFileExtension(document.file.name)}
                      </span>
                    </div>
                    {document.description ? (
                      <p className="mt-1 max-w-full truncate text-[8px] text-slate-400">
                        {document.description}
                      </p>
                    ) : null}
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditor(index)}
                    aria-label={`Editar detalles de ${document.file.name}`}
                    title="Editar detalles"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m4 20 4.5-1 9.7-9.7-3.5-3.5L5 15.5 4 20Z" />
                      <path d="m13.8 6.7 3.5 3.5" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => onRemoveFile(index)}
                    aria-label={`Eliminar ${document.file.name}`}
                    title="Eliminar archivo"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-100"
                  >
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 7h16" />
                      <path d="M9 7V4h6v3" />
                      <path d="m7 7 1 13h8l1-13" />
                      <path d="M10 11v5M14 11v5" />
                    </svg>
                  </button>
                </div>
              ))}

              {documents.length === 0 ? (
                <p className="py-1 text-center text-[8px] text-slate-400">
                  Aún no hay documentos adjuntos.
                </p>
              ) : null}
            </div>
          </Card>

          <div className="min-w-0 max-w-full">{actions}</div>
        </div>
      </div>

      {editingDocument ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4 backdrop-blur-[1px]"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeEditor()
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-editor-title"
            className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl"
          >
            <div className="flex min-w-0 items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3
                  id="document-editor-title"
                  className="text-sm font-semibold text-slate-950"
                >
                  Editar detalles
                </h3>
                <p
                  className="mt-1 truncate text-[9px] text-slate-500"
                  title={editingDocument.file.name}
                >
                  Archivo original · {editingDocument.file.name}
                </p>
              </div>

              <button
                type="button"
                onClick={closeEditor}
                aria-label="Cerrar"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
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

            <div className="mt-4 min-w-0 space-y-3">
              <label className="block min-w-0">
                <span className="mb-1.5 block text-[9px] font-semibold text-slate-700">
                  Nombre del documento
                </span>
                <input
                  type="text"
                  value={draftName}
                  maxLength={180}
                  onChange={(event) => setDraftName(event.target.value)}
                  className="h-9 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 text-[10px] text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </label>

              <label className="block min-w-0">
                <span className="mb-1.5 block text-[9px] font-semibold text-slate-700">
                  Descripción
                  <span className="ml-1 font-normal text-slate-400">
                    (opcional)
                  </span>
                </span>
                <textarea
                  value={draftDescription}
                  maxLength={500}
                  onChange={(event) => setDraftDescription(event.target.value)}
                  className="min-h-20 w-full min-w-0 resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-[10px] leading-4 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Añade contexto útil sobre este documento."
                />
              </label>
            </div>

            <div className="mt-3 flex min-w-0 items-start gap-2 rounded-lg bg-slate-50 px-3 py-2">
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M12 11v5M12 8h.01" />
              </svg>
              <p className="min-w-0 break-words text-[8px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                El nombre y la descripción son metadatos. El archivo original no
                se modifica.
              </p>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeEditor}
                className="inline-flex h-8 items-center justify-center rounded-lg border border-slate-300 bg-white px-3 text-[10px] font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={saveDocumentDetails}
                disabled={!draftName.trim()}
                className="inline-flex h-8 items-center justify-center rounded-lg bg-blue-600 px-4 text-[10px] font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
              >
                Guardar
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
