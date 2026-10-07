import { Link } from 'react-router-dom'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import {
  formatDashboardDateTime,
  getDashboardEventLabel,
} from '../model/dashboardPresenter'
import type { DashboardRecentActivityDto } from '../types/dashboard.types'

interface DashboardRecentActivityProps {
  activity: DashboardRecentActivityDto[]
}

export function DashboardRecentActivity({
  activity,
}: DashboardRecentActivityProps) {
  return (
    <Card className="overflow-hidden shadow-[0_12px_35px_-24px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-gradient-to-r from-white to-teal-50/35 px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
            <SidebarNavIcon name="documents" className="h-[18px] w-[18px]" />
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-teal-700">
              Trazabilidad
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-950">
              Actividad reciente
            </h2>
            <p className="mt-1 text-[10px] text-slate-500">
              Últimos movimientos registrados en los expedientes.
            </p>
          </div>
        </div>

        <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[9px] font-semibold text-teal-700">
          {activity.length} eventos
        </span>
      </div>

      {activity.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin actividad todavía"
            description="Los eventos relevantes aparecerán aquí conforme avance la operación."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {activity.map((event, index) => (
            <Link
              key={event.eventId}
              to={`/job-cases/${event.caseId}?tab=traceability`}
              className="group grid grid-cols-[28px_minmax(0,1fr)] gap-3 px-5 py-3.5 transition hover:bg-slate-50/80"
            >
              <div className="relative flex justify-center">
                <span className="mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-teal-500 shadow-[0_0_0_3px_rgba(20,184,166,0.12)]" />
                {index < activity.length - 1 ? (
                  <span className="absolute bottom-[-14px] top-4 w-px bg-slate-200" />
                ) : null}
              </div>

              <div className="min-w-0">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 transition group-hover:text-blue-700">
                      {getDashboardEventLabel(event.eventType)}
                    </p>
                    <p className="mt-1 text-[10px] text-slate-500">
                      {event.caseNumber}
                      {event.performedByName
                        ? ` · ${event.performedByName}`
                        : ' · Sistema'}
                    </p>
                  </div>
                  <time className="shrink-0 text-[9px] text-slate-400">
                    {formatDashboardDateTime(event.occurredAt)}
                  </time>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Card>
  )
}
