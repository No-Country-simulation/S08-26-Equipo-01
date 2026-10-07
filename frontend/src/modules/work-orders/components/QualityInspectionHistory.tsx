import { Badge } from '@/shared/components/ui/Badge'
import {
  countQualityCheckResults,
  formatQualityDateTime,
  getQualityInspectionStatusPresentation,
} from '../model/qualityPresenter'
import type { QualityInspectionDto } from '../types/quality.types'

interface QualityInspectionHistoryProps {
  inspections: QualityInspectionDto[]
  activeInspectionId: number | null
  onSelect: (inspectionId: number) => void
}

export function QualityInspectionHistory({
  inspections,
  activeInspectionId,
  onSelect,
}: QualityInspectionHistoryProps) {
  if (inspections.length <= 1) return null

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Historial de calidad
          </p>
          <h2 className="mt-0.5 text-[11px] font-semibold text-slate-950">
            Inspecciones anteriores
          </h2>
        </div>
        <span className="text-[8px] text-slate-400">
          {inspections.length} registros
        </span>
      </div>

      <div className="divide-y divide-slate-100">
        {inspections.map((inspection) => {
          const status = getQualityInspectionStatusPresentation(
            inspection.status,
          )
          const totals = countQualityCheckResults(inspection.checks)
          const current = inspection.id === activeInspectionId

          return (
            <button
              key={inspection.id}
              type="button"
              className="grid w-full gap-2 px-4 py-3 text-left transition hover:bg-slate-50 sm:grid-cols-[minmax(0,1fr)_120px_100px_auto] sm:items-center"
              onClick={() => onSelect(inspection.id)}
            >
              <div>
                <p className="text-[9px] font-semibold text-slate-900">
                  {inspection.reworkNonConformityId
                    ? 'Reinspección'
                    : 'Inspección'}{' '}
                  #{inspection.id}
                  {current ? ' · Actual' : ''}
                </p>
                <p className="mt-0.5 text-[7px] text-slate-400">
                  {inspection.inspectorName ?? 'Inspector por asignar'} ·{' '}
                  {formatQualityDateTime(inspection.createdAt)}
                </p>
              </div>
              <Badge
                tone={status.tone}
                className="w-fit px-2 py-0.5 text-[7px]"
              >
                {status.label}
              </Badge>
              <span className="text-[8px] text-slate-500">
                {totals.pass} PASS · {totals.fail} FAIL
              </span>
              <span className="text-[8px] font-semibold text-blue-600">
                Ver detalle
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
