export type DashboardTone =
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'danger'

export interface DashboardOverviewDto {
  openCases: number
  activeProduction: number
  qualityAttention: number
  readyForDelivery: number
}

export interface DashboardPipelineDto {
  submitted: number
  underReview: number
  waitingCustomerInfo: number
  readyForQuotation: number
  awaitingWorkOrder: number
  inProduction: number
  completed: number
}

export interface DashboardCommercialDto {
  draftQuotations: number
  sentQuotations: number
}

export interface DashboardAttentionItemDto {
  key: string
  label: string
  description: string
  count: number
  tone: DashboardTone
  href: string
}

export interface DashboardRecentActivityDto {
  eventId: number
  caseId: number
  caseNumber: string
  eventType: string
  performedByName: string | null
  occurredAt: string
}

export interface InternalDashboardDto {
  overview: DashboardOverviewDto
  pipeline: DashboardPipelineDto
  commercial: DashboardCommercialDto
  attention: DashboardAttentionItemDto[]
  recentActivity: DashboardRecentActivityDto[]
}
