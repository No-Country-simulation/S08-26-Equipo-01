import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { DashboardAttention } from '../components/DashboardAttention'
import { DashboardHero } from '../components/DashboardHero'
import { DashboardMetricGrid } from '../components/DashboardMetricGrid'
import { DashboardPipeline } from '../components/DashboardPipeline'
import { DashboardRecentActivity } from '../components/DashboardRecentActivity'
import { useInternalDashboard } from '../hooks/useInternalDashboard'

export function HomePage() {
  const query = useInternalDashboard()

  if (query.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Cargando panel operacional…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={query.error}
          title="No pudimos cargar el panel operacional"
        />
      </PageContainer>
    )
  }

  const dashboard = query.data

  return (
    <PageContainer>
      <DashboardHero
        overview={dashboard.overview}
        pipeline={dashboard.pipeline}
        commercial={dashboard.commercial}
      />

      <div className="mt-5">
        <DashboardMetricGrid overview={dashboard.overview} />
      </div>

      <div className="mt-5">
        <DashboardPipeline
          pipeline={dashboard.pipeline}
          commercial={dashboard.commercial}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <DashboardAttention items={dashboard.attention} />
        <DashboardRecentActivity activity={dashboard.recentActivity} />
      </div>
    </PageContainer>
  )
}
