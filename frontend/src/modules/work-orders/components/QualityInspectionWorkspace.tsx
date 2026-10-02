import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import {
  countQualityCheckResults,
  formatQualityDateTime,
  formatQualityNumber,
  getQualityCheckTypeLabel,
  getQualityInspectionStatusPresentation,
} from '../model/qualityPresenter'
import type {
  QualityCheckDto,
  QualityInspectionDto,
} from '../types/quality.types'

interface QualityInspectionWorkspaceProps {
  inspection: QualityInspectionDto | null
  canStart: boolean
  canEdit: boolean
  canComplete: boolean
  starting: boolean
  onStart: () => void
  onAddCheck: () => void
  onEditCheck: (qualityCheck: QualityCheckDto) => void
  onComplete: () => void
}

export function QualityInspectionWorkspace({
  inspection,
  canStart,
  canEdit,
  canComplete,
  starting,
  onStart,
  onAddCheck,
  onEditCheck,
  onComplete,
}: QualityInspectionWorkspaceProps) {
  if (!inspection) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Control de calidad
        </p>
        <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
          Sin inspección disponible
        </h2>
        <p className="mt-2 text-[8px] leading-4 text-slate-500">
          La inspección aparece cuando Producción realiza el handoff formal a
          Calidad.
        </p>
      </section>
    )
  }

  const status = getQualityInspectionStatusPresentation(inspection.status)
  const totals = countQualityCheckResults(inspection.checks)
  const isReinspection = inspection.reworkNonConformityId !== null

  return (
    <section
      id={`quality-inspection-${inspection.id}`}
      className="scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)] target:ring-2 target:ring-blue-200"
    >
      <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/55 px-4 py-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
              {isReinspection ? 'Reinspección de calidad' : 'Control de calidad'}
            </p>
            <div className="mt-0.5 flex flex-wrap items-center gap-2">
              <h2 className="text-[12px] font-semibold text-slate-950">
                Inspección #{inspection.id}
              </h2>
              <Badge tone={status.tone} className="px-2 py-0.5 text-[7px]">
                {status.label}
              </Badge>
            </div>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              {inspection.inspectorName ?? 'Inspector por asignar'} · creada{' '}
              {formatQualityDateTime(inspection.createdAt)}
            </p>
          </div>

          <div className="flex gap-1.5">
            <Badge tone="success" className="px-2 py-0.5 text-[7px]">
              {totals.pass} PASS
            </Badge>
            <Badge
              tone={totals.fail > 0 ? 'danger' : 'neutral'}
              className="px-2 py-0.5 text-[7px]"
            >
              {totals.fail} FAIL
            </Badge>
          </div>
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="mb-3 grid gap-2 text-[8px] sm:grid-cols-3">
          <div>
            <p className="text-slate-400">Inicio</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {formatQualityDateTime(inspection.startedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Cierre</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {formatQualityDateTime(inspection.completedAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Controles</p>
            <p className="mt-0.5 font-medium text-slate-700">
              {inspection.checks.length}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h3 className="text-[9px] font-semibold text-slate-950">
              Controles de inspección
            </h3>
            <p className="mt-0.5 text-[7px] text-slate-400">
              Combina mediciones con tolerancia y verificaciones de conformidad
              según lo que requiera la pieza.
            </p>
          </div>

          {inspection.status === 'IN_PROGRESS' && canEdit ? (
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onAddCheck}
            >
              Registrar control
            </Button>
          ) : null}
        </div>

        {inspection.checks.length === 0 ? (
          <div className="mt-3 rounded-xl border border-dashed border-slate-200 bg-slate-50/55 px-3 py-5 text-center">
            <p className="text-[8px] font-medium text-slate-600">
              Todavía no hay controles registrados
            </p>
            <p className="mt-1 text-[7px] text-slate-400">
              Se requiere al menos uno para finalizar la inspección.
            </p>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[670px] text-left">
              <thead className="bg-slate-50 text-[7px] font-bold uppercase tracking-wide text-slate-400">
                <tr>
                  <th className="px-3 py-2">Control</th>
                  <th className="px-3 py-2">Tipo</th>
                  <th className="px-3 py-2">Criterio / valor</th>
                  <th className="px-3 py-2">Resultado</th>
                  <th className="px-3 py-2 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[8px] text-slate-600">
                {inspection.checks.map((qualityCheck) => (
                  <tr
                    id={`quality-check-${qualityCheck.id}`}
                    key={qualityCheck.id}
                    className="scroll-mt-24 target:bg-blue-50/40"
                  >
                    <td className="px-3 py-2.5">
                      <p className="font-semibold text-slate-900">
                        {qualityCheck.name}
                      </p>
                      {qualityCheck.notes ? (
                        <p className="mt-0.5 max-w-sm text-[7px] leading-3.5 text-slate-400">
                          {qualityCheck.notes}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
                        {getQualityCheckTypeLabel(qualityCheck.type)}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5">
                      {qualityCheck.type === 'NUMERIC_RANGE' ? (
                        <div>
                          <p className="font-semibold text-slate-900">
                            {formatQualityNumber(qualityCheck.measuredValue)}{' '}
                            {qualityCheck.unit}
                          </p>
                          <p className="mt-0.5 text-[7px] text-slate-400">
                            Rango {formatQualityNumber(qualityCheck.lowerLimit)} –{' '}
                            {formatQualityNumber(qualityCheck.upperLimit)}{' '}
                            {qualityCheck.unit} · nominal{' '}
                            {formatQualityNumber(qualityCheck.nominalValue)}
                          </p>
                        </div>
                      ) : (
                        <p className="font-medium text-slate-700">
                          Evaluación de conformidad del inspector
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge
                        tone={
                          qualityCheck.result === 'PASS' ? 'success' : 'danger'
                        }
                        className="px-2 py-0.5 text-[7px]"
                      >
                        {qualityCheck.result}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      {inspection.status === 'IN_PROGRESS' && canEdit ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="!h-7 !px-2 !text-[8px]"
                          onClick={() => onEditCheck(qualityCheck)}
                        >
                          Editar
                        </Button>
                      ) : (
                        <span className="text-[7px] text-slate-400">
                          Bloqueado
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {inspection.status === 'PENDING' && canStart ? (
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
            <Button
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onStart}
              disabled={starting}
            >
              {starting
                ? 'Iniciando…'
                : isReinspection
                  ? 'Iniciar reinspección'
                  : 'Iniciar inspección'}
            </Button>
          </div>
        ) : null}

        {inspection.status === 'IN_PROGRESS' && canComplete ? (
          <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
            <Button
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={onComplete}
              disabled={inspection.checks.length === 0}
            >
              {isReinspection
                ? 'Finalizar reinspección'
                : 'Finalizar inspección'}
            </Button>
          </div>
        ) : null}
      </div>
    </section>
  )
}
