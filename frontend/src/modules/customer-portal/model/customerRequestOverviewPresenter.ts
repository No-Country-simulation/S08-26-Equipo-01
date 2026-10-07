import type { CustomerQuotationStatus } from '@/modules/quotations'
import type { BadgeProps } from '@/shared/components/ui/Badge'
import { getCustomerRequestStatusPresentation } from './customerRequestPresenter'
import type {
  CustomerInformationRequestDto,
  CustomerRequestDetailDto,
} from '../types/customerRequest.types'

export type CustomerDeliveryProgress = 'IN_TRANSIT' | 'PARTIAL' | 'DELIVERED'

export interface CustomerRequestDisplayStatus {
  label: string
  tone: BadgeProps['tone']
}

export interface CustomerRequestNextStepPresentation {
  eyebrow: string
  title: string
  description: string
  tone: 'neutral' | 'info' | 'warning' | 'success' | 'danger'
  action?: 'respond' | 'quotation'
}

export function getCustomerRequestDisplayStatus(
  request: CustomerRequestDetailDto,
  deliveryProgress?: CustomerDeliveryProgress,
): CustomerRequestDisplayStatus {
  const requestStatus = getCustomerRequestStatusPresentation(
    request.jobCase.status,
  )

  if (request.jobCase.status === 'COMPLETED') return requestStatus
  if (deliveryProgress === 'IN_TRANSIT') {
    return { label: 'En camino', tone: 'info' }
  }
  if (deliveryProgress === 'PARTIAL') {
    return { label: 'Entrega parcial', tone: 'warning' }
  }
  if (deliveryProgress === 'DELIVERED') {
    return { label: 'Entregada', tone: 'success' }
  }

  return requestStatus
}

export function getCustomerRequestNextStep(
  request: CustomerRequestDetailDto,
  deliveryProgress: CustomerDeliveryProgress | undefined,
  openInformationRequest: CustomerInformationRequestDto | null,
  quotationId?: number,
  quotationStatus?: CustomerQuotationStatus,
): CustomerRequestNextStepPresentation {
  if (request.jobCase.status === 'CANCELLED') {
    return {
      eyebrow: 'Flujo detenido',
      title: 'Solicitud cancelada',
      description:
        request.jobCase.cancellationReason ??
        'La solicitud se cerró antes de continuar con el trabajo.',
      tone: 'danger',
    }
  }

  if (
    request.jobCase.status === 'COMPLETED' ||
    deliveryProgress === 'DELIVERED'
  ) {
    return {
      eyebrow: 'Trabajo finalizado',
      title: 'Entrega completada',
      description:
        'La cantidad solicitada figura como entregada y el trabajo llegó al final de su recorrido.',
      tone: 'success',
    }
  }

  if (deliveryProgress === 'IN_TRANSIT' || deliveryProgress === 'PARTIAL') {
    return {
      eyebrow: 'Entrega en curso',
      title:
        deliveryProgress === 'IN_TRANSIT'
          ? 'Tu trabajo va en camino'
          : 'La entrega ya comenzó',
      description:
        'Logística actualizará el seguimiento conforme se registren los movimientos de entrega.',
      tone: 'info',
    }
  }

  if (openInformationRequest) {
    return {
      eyebrow: 'Acción requerida',
      title: 'Necesitamos información adicional sobre tu solicitud',
      description: openInformationRequest.question,
      tone: 'warning',
      action: 'respond',
    }
  }

  switch (request.jobCase.status) {
    case 'SUBMITTED':
    case 'UNDER_REVIEW':
      return {
        eyebrow: 'Revisión en curso',
        title: 'El equipo está revisando tu solicitud',
        description:
          'No necesitas hacer nada por ahora. Te avisaremos si necesitamos información adicional.',
        tone: 'neutral',
      }
    case 'WAITING_CUSTOMER_INFO':
      return {
        eyebrow: 'Pendiente de información',
        title: 'La revisión está esperando información adicional',
        description:
          'Revisa la actividad de la solicitud para identificar la información pendiente.',
        tone: 'warning',
      }
    case 'READY_FOR_QUOTATION':
      if (!quotationId || !quotationStatus) {
        return {
          eyebrow: 'Siguiente etapa',
          title: 'La revisión técnica terminó',
          description:
            'El equipo está preparando la propuesta comercial. Te avisaremos cuando esté disponible.',
          tone: 'info',
        }
      }

      switch (quotationStatus) {
        case 'SENT':
          return {
            eyebrow: 'Propuesta disponible',
            title: 'Tu cotización ya está lista',
            description:
              'Comercial ya envió una propuesta para esta solicitud. Puedes revisarla directamente desde aquí.',
            tone: 'info',
            action: 'quotation',
          }
        case 'ADJUSTMENT_REQUESTED':
          return {
            eyebrow: 'Ajuste en preparación',
            title: 'Comercial está preparando una nueva revisión',
            description:
              'Tu solicitud de ajuste fue recibida. La revisión anterior permanece disponible como referencia.',
            tone: 'warning',
            action: 'quotation',
          }
        case 'APPROVED':
          return {
            eyebrow: 'Propuesta aprobada',
            title: 'La cotización ya fue aceptada',
            description:
              'El equipo interno está preparando la orden de trabajo para iniciar la etapa operativa.',
            tone: 'success',
            action: 'quotation',
          }
        case 'REJECTED':
          return {
            eyebrow: 'Propuesta cerrada',
            title: 'La cotización fue rechazada',
            description:
              'Comercial puede preparar una nueva revisión si el trabajo continúa.',
            tone: 'danger',
            action: 'quotation',
          }
        case 'EXPIRED':
          return {
            eyebrow: 'Vigencia terminada',
            title: 'La cotización venció',
            description:
              'La propuesta ya no admite respuesta. Comercial deberá emitir una nueva revisión para continuar.',
            tone: 'warning',
            action: 'quotation',
          }
        case 'CANCELLED':
          return {
            eyebrow: 'Revisión cancelada',
            title: 'La cotización ya no está activa',
            description:
              'Comercial puede generar una nueva revisión si el proceso debe continuar.',
            tone: 'danger',
            action: 'quotation',
          }
        case 'REPLACED':
          return {
            eyebrow: 'Revisión reemplazada',
            title: 'Existe una revisión posterior',
            description:
              'Consulta la cotización para revisar el historial comercial de esta solicitud.',
            tone: 'neutral',
            action: 'quotation',
          }
        default:
          return {
            eyebrow: 'Siguiente etapa',
            title: 'La propuesta comercial está en preparación',
            description:
              'El equipo está preparando la cotización para que puedas revisarla cuando esté disponible.',
            tone: 'info',
          }
      }
    case 'IN_PRODUCTION':
      return {
        eyebrow: 'Producción activa',
        title: 'El trabajo está en fabricación',
        description:
          'El equipo continúa con la ejecución. El seguimiento avanzará cuando existan movimientos de entrega.',
        tone: 'info',
      }
  }
}
