import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { formatJobCaseDate } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseSourceCardProps {
  jobCase: JobCaseDetailDto
}

function Item({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-0">
      <dt className="text-[8px] font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 truncate text-[10px] font-semibold text-slate-900">
        {value}
      </dd>
    </div>
  )
}

export function JobCaseSourceCard({ jobCase }: JobCaseSourceCardProps) {
  const material =
    jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED'
      ? 'Asesoría técnica requerida'
      : jobCase.request.materialRequirement ?? 'Sin especificar'

  const destination = jobCase.request.deliveryDestination
  const delivery =
    destination.mode === 'CUSTOMER_PICKUP'
      ? 'Recolección en planta'
      : destination.mode === 'DEFINE_LATER'
        ? 'Destino por definir'
        : [
            destination.label,
            destination.city,
            destination.state,
          ]
            .filter(Boolean)
            .join(' · ') || 'Destino acordado'

  return (
    <section id="request-source" className="scroll-mt-24 rounded-xl border border-blue-100/80 bg-gradient-to-r from-white via-white to-blue-50/30 px-4 py-3 shadow-[0_10px_28px_-24px_rgba(15,23,42,0.22)]">
      <div className="flex items-center gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
          <SidebarNavIcon name="requests" className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Solicitud de origen
          </p>
          <p className="mt-0.5 text-[9px] font-medium text-slate-500">
            {jobCase.request.requestNumber} · {jobCase.request.customerName}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid gap-x-4 gap-y-2.5 border-t border-blue-100/70 pt-3 sm:grid-cols-2 xl:grid-cols-5">
        <Item label="Trabajo" value={jobCase.request.title} />
        <Item
          label="Cantidad"
          value={`${jobCase.request.quantity} pieza${
            jobCase.request.quantity === 1 ? '' : 's'
          }`}
        />
        <Item label="Material" value={material} />
        <Item
          label="Fecha solicitada"
          value={formatJobCaseDate(jobCase.request.requestedDeliveryDate)}
        />
        <Item label="Entrega" value={delivery} />
      </dl>
    </section>
  )
}
