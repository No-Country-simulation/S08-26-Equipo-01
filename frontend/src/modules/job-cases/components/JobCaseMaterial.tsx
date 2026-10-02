import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { formatJobCaseDateTime } from '../model/jobCasePresenter'
import type {
  CaseMaterialSpecificationDto,
  JobCaseRequestSummaryDto,
} from '../types/jobCase.types'

interface JobCaseMaterialProps {
  specification: CaseMaterialSpecificationDto | null
  request: JobCaseRequestSummaryDto
}

export function JobCaseMaterial({
  specification,
  request,
}: JobCaseMaterialProps) {
  if (!specification) {
    if (request.materialRequirementType === 'SPECIFIED') {
      return (
        <Card id="material-specification" className="scroll-mt-24 h-full border-blue-100/70 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Material del trabajo
              </p>
              <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                Especificado por el cliente
              </h2>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
            <p className="text-[8px] font-medium text-slate-500">
              Material solicitado
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-950">
              {request.materialRequirement ?? 'Sin detalle registrado'}
            </p>
          </div>

          <p className="mt-3 max-w-2xl text-[9px] leading-4 text-slate-500">
            La solicitud ya incluye una especificación de material. No se
            requiere una definición técnica adicional para completar la
            revisión, salvo que Ingeniería determine lo contrario.
          </p>
        </Card>
      )
    }

    return (
      <Card id="material-specification" className="scroll-mt-24 border-amber-100 bg-gradient-to-br from-white via-white to-amber-50/30 p-4">
        <EmptyState
          title="Definición técnica pendiente"
          description="El cliente solicitó asistencia para definir el material. Ingeniería debe completar esta definición antes de cerrar la revisión."
        />
      </Card>
    )
  }

  return (
    <Card id="material-specification" className="scroll-mt-24 border-blue-100/70 bg-gradient-to-br from-white via-white to-blue-50/20 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.24)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SidebarNavIcon name="cases" className="h-[17px] w-[17px]" />
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Material del trabajo
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Especificación técnica
          </h2>
        </div>
      </div>

      {request.materialRequirement ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-3">
          <p className="text-[8px] font-medium text-slate-500">
            Referencia de la solicitud
          </p>
          <p className="mt-1 text-[10px] font-semibold text-slate-900">
            {request.materialRequirement}
          </p>
        </div>
      ) : null}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
          <p className="text-[8px] text-slate-500">Material definido</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
            {specification.materialName}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
          <p className="text-[8px] text-slate-500">Norma o grado</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
            {specification.standardOrGrade ?? 'Sin registrar'}
          </p>
        </div>
      </div>

      {specification.technicalNotes ? (
        <div className="mt-3 border-t border-slate-100 pt-3">
          <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
            Notas técnicas
          </p>
          <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
            {specification.technicalNotes}
          </p>
        </div>
      ) : null}

      <p className="mt-3 text-[8px] text-slate-400">
        Definido por {specification.definedByName ?? 'Usuario interno'} ·{' '}
        {formatJobCaseDateTime(specification.definedAt)}
      </p>
    </Card>
  )
}
