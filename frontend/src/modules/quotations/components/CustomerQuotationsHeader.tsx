import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'

interface CustomerQuotationsHeaderProps {
  customerName: string
  total: number
  pendingDecision: number
  adjustmentRequested: number
  approved: number
}

export function CustomerQuotationsHeader({
  customerName,
  total,
  pendingDecision,
  adjustmentRequested,
  approved,
}: CustomerQuotationsHeaderProps) {
  return (
    <PortalPageHeader
      icon="quotations"
      eyebrow="Gestión comercial"
      title="Cotizaciones"
      context={customerName}
      description="Revisa las propuestas comerciales y responde cuando alguna requiera tu decisión."
      metrics={[
        { value: total, label: 'registradas' },
        {
          value: pendingDecision,
          label: 'por decidir',
          dotClassName: 'bg-blue-500',
          valueClassName: 'text-blue-700',
        },
        {
          value: adjustmentRequested,
          label: 'en ajuste',
          dotClassName: 'bg-amber-500',
          valueClassName: 'text-amber-700',
        },
        {
          value: approved,
          label: 'aprobadas',
          dotClassName: 'bg-emerald-500',
          valueClassName: 'text-emerald-700',
        },
      ]}
    />
  )
}
