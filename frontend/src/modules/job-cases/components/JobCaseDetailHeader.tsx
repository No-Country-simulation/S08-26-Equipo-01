import { useNavigate } from 'react-router-dom'
import { CompactBackButton } from '@/shared/components/navigation/CompactBackButton'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import { getJobCaseStatusPresentation } from '../model/jobCasePresenter'
import type { JobCaseDetailDto } from '../types/jobCase.types'

interface JobCaseDetailHeaderProps {
  jobCase: JobCaseDetailDto
}

export function JobCaseDetailHeader({ jobCase }: JobCaseDetailHeaderProps) {
  const navigate = useNavigate()
  const status = getJobCaseStatusPresentation(jobCase.status)

  return (
    <header className="job-case-detail-header mb-3 flex min-w-0 items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
          <SidebarNavIcon name="cases" className="h-4 w-4" />
        </div>

        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
            Expediente 360
          </p>

          <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2.5 gap-y-1">
            <h1 className="min-w-0 truncate text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
              {jobCase.caseNumber}
            </h1>
            <Badge tone={status.tone} className="px-2 py-0.5 text-[8px]">
              {status.label}
            </Badge>
          </div>

          <p className="mt-0.5 truncate text-[10px] text-slate-500">
            {jobCase.request.title} · {jobCase.request.customerName} · historial
            y contexto del caso
          </p>
        </div>
      </div>

      <CompactBackButton
        label="Volver a expedientes"
        onClick={() => navigate('/job-cases')}
      />
    </header>
  )
}
