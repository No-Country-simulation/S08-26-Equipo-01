import { useState } from 'react'
import { flushSync } from 'react-dom'
import {
  formatJobCaseDateTime,
  getJobCaseClarificationSummary,
  getJobCaseMaterialSummary,
  getJobCaseStatusPresentation,
} from '../model/jobCasePresenter'
import {
  prepareJobCasePrintAnnexes,
  type JobCasePrintAnnexBundle,
} from '../model/jobCasePrintAnnexes'
import type { JobCaseDetailDto } from '../types/jobCase.types'
import { JobCasePrintAnnexes } from './JobCasePrintAnnexes'

interface JobCaseSummaryProps {
  jobCase: JobCaseDetailDto
}

function waitForPrintImages(): Promise<void> {
  return new Promise((resolve) => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(async () => {
        const images = Array.from(
          document.querySelectorAll<HTMLImageElement>('.job-case-annex-image'),
        )

        await Promise.all(
          images.map(async (image) => {
            try {
              await image.decode()
            } catch {
              // If the browser cannot decode it, printing still proceeds with
              // the annex metadata instead of blocking the whole expediente.
            }
          }),
        )

        resolve()
      })
    })
  })
}

function annexSheetLabel(firstSheet: number, lastSheet: number) {
  return firstSheet === lastSheet
    ? `Hoja de anexo ${firstSheet}`
    : `Hojas de anexo ${firstSheet}–${lastSheet}`
}

export function JobCaseSummary({ jobCase }: JobCaseSummaryProps) {
  const [printAnnexes, setPrintAnnexes] =
    useState<JobCasePrintAnnexBundle | null>(null)
  const [preparingPrint, setPreparingPrint] = useState(false)
  const clarificationSummary = getJobCaseClarificationSummary(
    jobCase.informationRequests,
  )
  const materialSummary = getJobCaseMaterialSummary(jobCase)
  const status = getJobCaseStatusPresentation(jobCase.status)

  const printJobCase = async () => {
    if (preparingPrint) return

    const previousTitle = document.title
    setPreparingPrint(true)

    try {
      const annexes = await prepareJobCasePrintAnnexes(jobCase.documents)
      flushSync(() => setPrintAnnexes(annexes))

      document.title = `${jobCase.caseNumber}-Expediente`
      document.body.classList.add('printing-job-case')
      await waitForPrintImages()
      window.print()
    } finally {
      document.body.classList.remove('printing-job-case')
      document.title = previousTitle
      setPrintAnnexes(null)
      setPreparingPrint(false)
    }
  }

  return (
    <div
      id="case-overview"
      className="scroll-mt-24 flex h-full flex-col rounded-xl border border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/25 p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]"
    >
      <div className="job-case-print-hidden mb-3 flex items-start justify-between gap-4">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Expediente de revisión
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Información para cotización
          </h2>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Consolida lo recibido del cliente y el criterio interno previo a la
            propuesta comercial.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void printJobCase()}
          disabled={preparingPrint}
          className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-2.5 text-[8px] font-semibold text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100 disabled:cursor-wait disabled:opacity-60"
        >
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="h-3.5 w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 8V3h10v5" />
            <rect x="5" y="14" width="14" height="7" rx="1.5" />
            <path d="M5 17H3V10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7h-2" />
            <path d="M17 11h.01" />
          </svg>
          {preparingPrint ? 'Preparando anexos…' : 'Imprimir'}
        </button>
      </div>

      <article className="job-case-print-area flex flex-1 flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.45)] sm:px-5 sm:py-5">
        <header className="job-case-sheet-header flex items-start justify-between gap-4 border-b border-slate-200 pb-3.5">
          <div className="flex items-center gap-2.5">
            <img
              src="/brand/qualitytrack-mark.svg"
              alt="QualityTrack"
              className="h-10 w-10 shrink-0"
            />
            <div>
              <p className="text-[12px] font-bold tracking-tight text-slate-950">
                Quality<span className="text-blue-600">Track</span>
              </p>
              <p className="mt-0.5 text-[6.5px] uppercase tracking-[0.08em] text-slate-400">
                Revisión de expediente
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[6px] font-bold uppercase tracking-[0.1em] text-blue-600">
              Expediente
            </p>
            <p className="mt-1 text-[10px] font-bold text-slate-950">
              {jobCase.caseNumber}
            </p>
            <p className="mt-0.5 text-[7px] text-slate-400">
              {status.label}
            </p>
          </div>
        </header>

        <div className="job-case-sheet-meta mt-4 grid gap-3 rounded-xl border border-slate-100 bg-slate-50/55 px-3.5 py-3 sm:grid-cols-[1.35fr_0.8fr_0.85fr]">
          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Cliente
            </p>
            <p className="mt-1 text-[9px] font-semibold text-slate-900">
              {jobCase.request.customerName}
            </p>
            <p className="mt-0.5 text-[7px] text-slate-400">
              {jobCase.request.requestNumber}
            </p>
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Solicitada por
            </p>
            <p className="mt-1 text-[8px] font-semibold text-slate-900">
              {jobCase.request.requestedByName ?? 'Sin registrar'}
            </p>
          </div>

          <div>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Enviada
            </p>
            <p className="mt-1 text-[8px] font-semibold text-slate-900">
              {formatJobCaseDateTime(jobCase.request.submittedAt)}
            </p>
          </div>
        </div>

        <section className="job-case-sheet-requirement mt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Requerimiento del cliente
            </h3>
            <span className="text-[6.5px] font-medium text-slate-400">
              Información original
            </span>
          </div>

          <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/65 px-3.5 py-3">
            <p className="whitespace-pre-wrap text-[8px] leading-4 text-slate-700">
              {jobCase.request.description?.trim() ||
                'El cliente no agregó una descripción adicional a la solicitud.'}
            </p>
          </div>
        </section>

        <section className="job-case-sheet-review mt-5">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-[10px] font-semibold text-slate-950">
              Condiciones de revisión
            </h3>
            <span className="text-[6.5px] font-medium text-slate-400">
              Previas a cotización
            </span>
          </div>

          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid gap-2.5 bg-slate-50/70 px-3 py-3 sm:grid-cols-3">
              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Material técnico
                </p>
                <p className="mt-1 text-[8px] font-semibold leading-4 text-slate-900">
                  {materialSummary}
                </p>
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Documentación
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {jobCase.documents.length} archivo
                  {jobCase.documents.length === 1 ? '' : 's'} disponible
                  {jobCase.documents.length === 1 ? '' : 's'}
                </p>
              </div>

              <div>
                <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Aclaraciones
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-900">
                  {clarificationSummary}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="job-case-print-only hidden">
          <div className="job-case-sheet-print-details mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Gestión interna
              </p>
              <dl className="mt-2 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-3">
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[7px] text-slate-500">Responsable</dt>
                  <dd className="text-right text-[8px] font-semibold text-slate-900">
                    {jobCase.assignedToName ?? 'Sin asignar'}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[7px] text-slate-500">Estado</dt>
                  <dd className="text-right text-[8px] font-semibold text-slate-900">
                    {status.label}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4 py-2">
                  <dt className="text-[7px] text-slate-500">
                    Referencia cliente
                  </dt>
                  <dd className="text-right text-[8px] font-semibold text-slate-900">
                    {jobCase.request.customerReference ?? 'Sin referencia'}
                  </dd>
                </div>
              </dl>
            </div>

            <div>
              <p className="text-[7px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Material definido
              </p>
              <div className="mt-2 rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-2.5">
                <p className="text-[8px] font-semibold text-slate-900">
                  {materialSummary}
                </p>
                {jobCase.materialSpecification?.technicalNotes ? (
                  <p className="mt-1.5 whitespace-pre-wrap text-[7px] leading-3.5 text-slate-600">
                    {jobCase.materialSpecification.technicalNotes}
                  </p>
                ) : null}
              </div>
            </div>
          </div>

          <div className="job-case-sheet-print-documents mt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-[9px] font-semibold text-slate-950">
                  Documentos relacionados
                </p>
                {jobCase.documents.length > 0 ? (
                  <p className="mt-0.5 text-[6.5px] leading-3.5 text-slate-400">
                    Cada archivo se incorpora al final del expediente y se referencia por su hoja de anexo.
                  </p>
                ) : null}
              </div>
              <span className="text-[6.5px] text-slate-400">
                {jobCase.documents.length} archivo
                {jobCase.documents.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-2 overflow-hidden rounded-xl border border-slate-200">
              {jobCase.documents.length === 0 ? (
                <p className="px-3 py-2.5 text-[7.5px] text-slate-500">
                  Sin documentos asociados.
                </p>
              ) : (
                jobCase.documents.map((document, index) => {
                  const reference = printAnnexes?.references.find(
                    (item) => item.documentId === document.id,
                  )

                  return (
                    <div
                      key={document.id}
                      className={
                        index === 0
                          ? 'grid gap-2 bg-slate-50/70 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_130px]'
                          : 'grid gap-2 border-t border-slate-200 px-3 py-2.5 sm:grid-cols-[minmax(0,1fr)_130px]'
                      }
                    >
                      <div className="min-w-0">
                        <p className="text-[8px] font-semibold text-slate-900">
                          {document.name}
                        </p>
                        <p className="mt-0.5 text-[6.5px] text-slate-400">
                          {document.documentType} · {document.currentVersion.fileName}
                        </p>
                      </div>
                      <div className="self-center text-right">
                        <p className="text-[7px] font-semibold text-blue-700">
                          {reference ? `Anexo ${reference.annexLabel}` : 'Anexo'}
                        </p>
                        <p className="mt-0.5 text-[6.5px] font-medium text-slate-500">
                          {reference
                            ? annexSheetLabel(
                                reference.firstSheet,
                                reference.lastSheet,
                              )
                            : `v${document.currentVersion.version}`}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="job-case-sheet-print-clarifications mt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-[9px] font-semibold text-slate-950">
                Aclaraciones
              </p>
              <span className="text-[6.5px] text-slate-400">
                {clarificationSummary}
              </span>
            </div>

            {jobCase.informationRequests.length === 0 ? (
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-2.5 text-[7.5px] text-slate-500">
                No se registraron aclaraciones para este expediente.
              </p>
            ) : (
              <div className="mt-2 space-y-2">
                {jobCase.informationRequests.map((request) => (
                  <div
                    key={request.id}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2.5"
                  >
                    <p className="text-[7.5px] font-semibold leading-3.5 text-slate-900">
                      {request.question}
                    </p>
                    <p className="mt-1 text-[7px] leading-3.5 text-slate-600">
                      {request.response ?? 'Pendiente de respuesta del cliente.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <div className="job-case-screen-only mt-auto grid gap-4 pt-6 sm:grid-cols-[1fr_0.72fr]">
          <section>
            <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Referencia
            </p>
            <p className="mt-2 text-[7px] leading-3.5 text-slate-600">
              {jobCase.request.customerReference ?? 'Sin referencia de cliente'}
            </p>
          </section>

          <div className="rounded-xl border border-blue-100 bg-blue-50/45 px-3 py-2.5">
            <p className="text-[6.5px] text-slate-500">
              Evidencia disponible
            </p>
            <p className="mt-1.5 text-[8px] font-semibold text-slate-900">
              {jobCase.documents.length} documento
              {jobCase.documents.length === 1 ? '' : 's'} ·{' '}
              {clarificationSummary}
            </p>
          </div>
        </div>

        <footer className="job-case-sheet-note mt-5 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[6.5px] leading-3.5 text-slate-400">
              Expediente previo a la preparación de la propuesta comercial.
            </p>
            <p className="text-[6.5px] font-medium text-slate-400">
              QualityTrack · {jobCase.caseNumber}
            </p>
          </div>
        </footer>

        <JobCasePrintAnnexes
          caseNumber={jobCase.caseNumber}
          bundle={printAnnexes}
        />
      </article>
    </div>
  )
}
