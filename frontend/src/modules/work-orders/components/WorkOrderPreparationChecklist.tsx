interface WorkOrderPreparationChecklistProps {
  planningReady: boolean
  documentsReady: boolean
  routingReady: boolean
  routingApproved: boolean
  readyForProduction: boolean
}

function Requirement({
  complete,
  label,
  detail,
}: {
  complete: boolean
  label: string
  detail: string
}) {
  return (
    <div className="flex gap-3">
      <span
        className={
          complete
            ? 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[9px] font-bold text-emerald-700'
            : 'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[9px] font-bold text-slate-400'
        }
      >
        {complete ? '✓' : '○'}
      </span>
      <div>
        <p className="text-[9px] font-semibold text-slate-900">{label}</p>
        <p className="mt-0.5 text-[7px] leading-3.5 text-slate-400">{detail}</p>
      </div>
    </div>
  )
}

export function WorkOrderPreparationChecklist({
  planningReady,
  documentsReady,
  routingReady,
  routingApproved,
  readyForProduction,
}: WorkOrderPreparationChecklistProps) {
  return (
    <aside className="flex h-full flex-col rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]">
      <div>
        <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
          Preparación para producción
        </p>
        <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
          Requisitos para liberar la OT
        </h2>
      </div>

      <div className="mt-5 space-y-5">
        <Requirement
          complete={planningReady}
          label="Fechas planeadas"
          detail={
            planningReady
              ? 'Planificación operativa completa'
              : 'Define inicio y fin planeados'
          }
        />
        <Requirement
          complete={documentsReady}
          label="Documento de fabricación"
          detail={
            documentsReady
              ? 'Versión concreta fijada para la OT'
              : 'Falta fijar una versión documental'
          }
        />
        <Requirement
          complete={routingReady}
          label="Hoja de ruta liberada"
          detail={
            routingReady
              ? 'Aprobada y liberada a Producción'
              : routingApproved
                ? 'Aprobada, pendiente de liberar'
                : 'La ruta aún no está cerrada'
          }
        />
      </div>

      <div
        className={
          readyForProduction
            ? 'mt-auto rounded-xl border border-emerald-200 bg-emerald-50/70 px-3 py-3'
            : 'mt-auto rounded-xl border border-blue-100 bg-blue-50/55 px-3 py-3'
        }
      >
        <p
          className={
            readyForProduction
              ? 'text-[8px] font-semibold text-emerald-900'
              : 'text-[8px] font-semibold text-blue-900'
          }
        >
          {readyForProduction
            ? 'Paquete operativo completo'
            : 'Todavía hay requisitos pendientes'}
        </p>
        <p
          className={
            readyForProduction
              ? 'mt-1 text-[7px] leading-3.5 text-emerald-800'
              : 'mt-1 text-[7px] leading-3.5 text-blue-800'
          }
        >
          {readyForProduction
            ? 'La orden puede avanzar a producción conforme a las reglas del backend.'
            : 'READY_FOR_PRODUCTION aparece cuando planificación, documentos y routing están cerrados.'}
        </p>
      </div>
    </aside>
  )
}
