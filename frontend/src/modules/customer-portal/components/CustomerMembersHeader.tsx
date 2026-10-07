import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'

interface CustomerMembersHeaderProps {
  customerName: string
  total: number
  admins: number
  pendingInvitations: number | null
  isAdmin: boolean
  onInvite: () => void
}

export function CustomerMembersHeader({
  customerName,
  total,
  admins,
  pendingInvitations,
  isAdmin,
  onInvite,
}: CustomerMembersHeaderProps) {
  return (
    <PortalPageHeader
      icon="members"
      eyebrow="Accesos de empresa"
      title="Miembros"
      context={customerName}
      description="Consulta quién puede entrar al portal y el nivel de acceso asignado."
      action={
        isAdmin ? (
          <button
            type="button"
            onClick={onInvite}
            className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 text-[9px] font-semibold text-white shadow-sm shadow-blue-200/70 transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <span className="text-[11px] font-light leading-none">+</span>
            Invitar miembro
          </button>
        ) : null
      }
      metrics={[
        { value: total, label: 'miembros activos' },
        {
          value: admins,
          label: 'administradores',
          dotClassName: 'bg-blue-500',
          valueClassName: 'text-blue-700',
        },
        {
          value: pendingInvitations ?? '—',
          label: 'invitaciones pendientes',
          dotClassName: 'bg-amber-500',
          valueClassName: 'text-amber-700',
        },
      ]}
    />
  )
}
