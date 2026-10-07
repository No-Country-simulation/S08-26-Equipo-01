import { formatJobCaseDateTime } from '../model/jobCasePresenter'
import type { JobCasePrintAnnexBundle } from '../model/jobCasePrintAnnexes'

interface JobCasePrintAnnexesProps {
  caseNumber: string
  bundle: JobCasePrintAnnexBundle | null
}

function sourcePageLabel(pageNumber: number | null, pageCount: number | null) {
  if (pageNumber === null || pageCount === null) return null
  if (pageCount === 1) return 'Documento completo'
  return `Página ${pageNumber} de ${pageCount} del archivo`
}

export function JobCasePrintAnnexes({
  caseNumber,
  bundle,
}: JobCasePrintAnnexesProps) {
  if (!bundle || bundle.pages.length === 0) return null

  return (
    <section className="job-case-print-annexes job-case-print-only hidden">
      {bundle.pages.map((page) => {
        const pageLabel = sourcePageLabel(
          page.sourcePageNumber,
          page.sourcePageCount,
        )

        return (
          <article key={page.key} className="job-case-annex-page">
            <header className="flex items-start justify-between gap-5 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2.5">
                <img
                  src="/brand/qualitytrack-mark.svg"
                  alt="QualityTrack"
                  className="h-9 w-9 shrink-0"
                />
                <div>
                  <p className="text-[11px] font-bold tracking-tight text-slate-950">
                    Quality<span className="text-blue-600">Track</span>
                  </p>
                  <p className="mt-0.5 text-[6.5px] uppercase tracking-[0.1em] text-slate-400">
                    Anexo documental del expediente
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-[6px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Anexo {page.annexLabel}
                </p>
                <p className="mt-1 text-[9px] font-semibold text-slate-950">
                  Hoja de anexo {page.annexSheetNumber}
                </p>
                {pageLabel ? (
                  <p className="mt-0.5 text-[6.5px] text-slate-400">
                    {pageLabel}
                  </p>
                ) : null}
              </div>
            </header>

            <section className="mt-3 rounded-xl border border-slate-200 bg-slate-50/60 px-3.5 py-3">
              <div className="grid gap-x-5 gap-y-2 sm:grid-cols-[1.35fr_0.8fr_0.85fr]">
                <div className="min-w-0">
                  <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Documento
                  </p>
                  <p className="mt-1 text-[8px] font-semibold text-slate-950">
                    {page.documentName}
                  </p>
                  <p className="mt-0.5 text-[6.5px] text-slate-500">
                    {page.documentType} · {page.fileName}
                  </p>
                </div>

                <div>
                  <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Versión
                  </p>
                  <p className="mt-1 text-[8px] font-semibold text-slate-950">
                    v{page.version}
                  </p>
                  <p className="mt-0.5 text-[6.5px] text-slate-500">
                    {page.uploadedByName ?? 'Usuario no disponible'}
                  </p>
                </div>

                <div>
                  <p className="text-[6px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Incorporado
                  </p>
                  <p className="mt-1 text-[7px] font-semibold text-slate-950">
                    {formatJobCaseDateTime(page.uploadedAt)}
                  </p>
                </div>
              </div>

              {page.description ? (
                <p className="mt-2 border-t border-slate-200 pt-2 text-[7px] leading-3.5 text-slate-600">
                  {page.description}
                </p>
              ) : null}
            </section>

            <div className="job-case-annex-content mt-4 flex flex-1 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white p-2">
              {page.imageDataUrl ? (
                <img
                  src={page.imageDataUrl}
                  alt={`${page.documentName} · ${pageLabel ?? page.annexLabel}`}
                  className="job-case-annex-image block h-auto max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="max-w-md px-8 py-10 text-center">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-base text-blue-600">
                    📄
                  </div>
                  <p className="mt-3 text-[9px] font-semibold text-slate-950">
                    Archivo conservado como evidencia digital
                  </p>
                  <p className="mt-1.5 text-[7.5px] leading-4 text-slate-500">
                    {page.note}
                  </p>
                </div>
              )}
            </div>

            <footer className="mt-3 flex items-center justify-between gap-4 border-t border-slate-100 pt-2.5 text-[6.5px] text-slate-400">
              <p>
                {caseNumber} · Anexo {page.annexLabel}
              </p>
              <p>Hoja de anexo {page.annexSheetNumber}</p>
            </footer>
          </article>
        )
      })}
    </section>
  )
}
