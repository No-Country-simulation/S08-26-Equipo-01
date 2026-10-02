import { useCustomerQuotations } from '@/modules/quotations'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { CustomerDashboardHero } from '../components/CustomerDashboardHero'
import { CustomerDashboardJourney } from '../components/CustomerDashboardJourney'
import { CustomerDashboardMetrics } from '../components/CustomerDashboardMetrics'
import { CustomerDashboardNextSteps } from '../components/CustomerDashboardNextSteps'
import { CustomerDashboardRecentWork } from '../components/CustomerDashboardRecentWork'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useCustomerRequests } from '../hooks/useCustomerRequests'

export function CustomerPortalHomePage() {
  const { customer } = useCustomerPortalContext()
  const requestsQuery = useCustomerRequests(customer.customerId)
  const quotationsQuery = useCustomerQuotations(customer.customerId)

  if (requestsQuery.isPending || quotationsQuery.isPending) {
    return (
      <PageContainer>
        <LoadingState label="Preparando tu panel…" />
      </PageContainer>
    )
  }

  if (requestsQuery.isError || quotationsQuery.isError) {
    return (
      <PageContainer>
        <ErrorState
          error={requestsQuery.error ?? quotationsQuery.error}
          title="No pudimos preparar tu panel"
        />
      </PageContainer>
    )
  }

  const requests = requestsQuery.data
  const quotations = quotationsQuery.data
  const canCreate = customer.role !== 'VIEWER'

  const activeRequests = requests.filter(
    (request) =>
      !['COMPLETED', 'CANCELLED'].includes(request.jobCase.status),
  ).length

  const waitingCustomerInfo = requests.filter(
    (request) => request.jobCase.status === 'WAITING_CUSTOMER_INFO',
  ).length

  const inProduction = requests.filter(
    (request) => request.jobCase.status === 'IN_PRODUCTION',
  ).length

  const quotationsToReview = quotations.filter(
    (quotation) => quotation.customerStatus === 'SENT',
  ).length

  const reviewCount = requests.filter((request) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'WAITING_CUSTOMER_INFO'].includes(
      request.jobCase.status,
    ),
  ).length

  const quotationCount = requests.filter(
    (request) => request.jobCase.status === 'READY_FOR_QUOTATION',
  ).length

  const completedCount = requests.filter(
    (request) => request.jobCase.status === 'COMPLETED',
  ).length

  return (
    <PageContainer>
      <CustomerDashboardHero
        customer={customer}
        activeRequests={activeRequests}
        waitingCustomerInfo={waitingCustomerInfo}
        quotationsToReview={quotationsToReview}
      />

      <div className="mt-5">
        <CustomerDashboardMetrics
          customerId={customer.customerId}
          activeRequests={activeRequests}
          waitingCustomerInfo={waitingCustomerInfo}
          inProduction={inProduction}
          quotationsToReview={quotationsToReview}
        />
      </div>

      <div className="mt-5">
        <CustomerDashboardJourney
          customerId={customer.customerId}
          reviewCount={reviewCount}
          quotationCount={quotationCount}
          productionCount={inProduction}
          completedCount={completedCount}
        />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[0.88fr_1.12fr]">
        <CustomerDashboardNextSteps
          customerId={customer.customerId}
          waitingCustomerInfo={waitingCustomerInfo}
          quotationsToReview={quotationsToReview}
          canCreate={canCreate}
        />
        <CustomerDashboardRecentWork
          customerId={customer.customerId}
          requests={requests}
        />
      </div>
    </PageContainer>
  )
}
