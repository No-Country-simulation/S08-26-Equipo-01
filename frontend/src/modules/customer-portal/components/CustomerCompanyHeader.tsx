import { PortalPageHeader } from '@/shared/components/portal/PortalPageHeader'
import { Badge } from '@/shared/components/ui/Badge'

interface CustomerCompanyHeaderProps {
  name: string
  status: string
  city: string | null
  state: string | null
  administrativeEmail: string | null
}

function formatStatus(status: string): string {
  if (status === 'ACTIVE') return 'Activa'

  return status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}

export function CustomerCompanyHeader({
  name,
  status,
  city,
  state,
  administrativeEmail,
}: CustomerCompanyHeaderProps) {
  const location = [city, state].filter(Boolean).join(', ')

  return (
    <PortalPageHeader
      icon="company"
      eyebrow="Perfil de empresa"
      title={name}
      description="Información administrativa y de contacto usada dentro de QualityTrack."
      titleAdornment={
        <Badge
          tone={status === 'ACTIVE' ? 'success' : 'neutral'}
          className="px-2 py-0.5 text-[8px]"
        >
          {formatStatus(status)}
        </Badge>
      }
      footer={
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            <span className="text-[8px] font-medium text-slate-500">
              {location || 'Ubicación sin registrar'}
            </span>
          </div>
          <span className="hidden h-3.5 w-px bg-slate-200 sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="truncate text-[8px] font-medium text-slate-500">
              {administrativeEmail || 'Correo administrativo sin registrar'}
            </span>
          </div>
        </div>
      }
    />
  )
}
