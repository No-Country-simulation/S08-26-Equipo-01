import type { AuthenticatedUser } from '@/modules/auth'
import type { JobCaseDetailDto } from '../types/jobCase.types'

function hasRole(user: AuthenticatedUser, role: string): boolean {
  return user.roles.some((currentRole) => currentRole === role)
}

function isAssignedToUser(
  jobCase: JobCaseDetailDto,
  user: AuthenticatedUser,
): boolean {
  return (
    jobCase.assignedToUserId !== null &&
    String(jobCase.assignedToUserId) === user.id
  )
}

export function getJobCaseCapabilities(
  jobCase: JobCaseDetailDto,
  user: AuthenticatedUser,
) {
  const isAdmin = hasRole(user, 'ADMIN')
  const isCommercial = hasRole(user, 'COMMERCIAL')
  const isEngineering = hasRole(user, 'ENGINEERING')
  const assignedToUser = isAssignedToUser(jobCase, user)
  const commercialOwner = isCommercial && assignedToUser
  const openClarification = jobCase.informationRequests.some(
    (request) => request.open,
  )
  const missingRequiredMaterial =
    jobCase.request.materialRequirementType === 'ASSISTANCE_REQUIRED' &&
    jobCase.materialSpecification === null

  const canTake =
    jobCase.status === 'SUBMITTED' &&
    jobCase.assignedToUserId === null &&
    (isAdmin || isCommercial)

  const canRequestInformation =
    jobCase.status === 'UNDER_REVIEW' &&
    !openClarification &&
    (isAdmin || commercialOwner)

  const canDefineMaterial =
    jobCase.status === 'UNDER_REVIEW' && (isAdmin || isEngineering)

  const canAttemptComplete =
    jobCase.status === 'UNDER_REVIEW' && (isAdmin || commercialOwner)

  const canCompleteReview =
    canAttemptComplete && !openClarification && !missingRequiredMaterial

  const canCreateQuotation =
    jobCase.status === 'READY_FOR_QUOTATION' && (isAdmin || commercialOwner)

  let completeBlockReason: string | null = null

  if (canAttemptComplete && openClarification) {
    completeBlockReason =
      'Espera la respuesta del cliente antes de completar la revisión.'
  } else if (canAttemptComplete && missingRequiredMaterial) {
    completeBlockReason = canDefineMaterial
      ? 'Define la especificación técnica del material antes de completar.'
      : 'Ingeniería debe definir la especificación técnica del material antes de completar.'
  }

  return {
    canTake,
    canRequestInformation,
    canDefineMaterial,
    canAttemptComplete,
    canCompleteReview,
    canCreateQuotation,
    completeBlockReason,
  }
}
