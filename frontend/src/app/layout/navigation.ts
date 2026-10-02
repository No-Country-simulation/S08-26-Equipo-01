import type { SystemRole } from '@/modules/auth'
import type { SidebarNavIconName } from '@/shared/components/navigation/SidebarNavIcon'

export interface NavigationItem {
  label: string
  href: string
  icon: SidebarNavIconName
  workOrderTab?: 'production' | 'quality' | 'delivery'
  resourceTab?: 'machines' | 'materials'
  requiredRole?: SystemRole
}

export interface NavigationGroup {
  label: string
  items: NavigationItem[]
}

export const navigationGroups: NavigationGroup[] = [
  {
    label: 'Principal',
    items: [{ label: 'Panel', href: '/', icon: 'panel' }],
  },
  {
    label: 'Comercial',
    items: [
      { label: 'Clientes', href: '/customers', icon: 'customers' },
      { label: 'Expedientes', href: '/job-cases', icon: 'cases' },
      { label: 'Cotizaciones', href: '/quotations', icon: 'quotations' },
    ],
  },
  {
    label: 'Operación',
    items: [
      { label: 'Órdenes de trabajo', href: '/work-orders', icon: 'work-orders' },
      {
        label: 'Producción',
        href: '/production',
        icon: 'production',
        workOrderTab: 'production',
      },
      {
        label: 'Calidad',
        href: '/quality',
        icon: 'quality',
        workOrderTab: 'quality',
      },
      {
        label: 'Entregas',
        href: '/deliveries',
        icon: 'deliveries',
        workOrderTab: 'delivery',
      },
      { label: 'Documentos', href: '/documents', icon: 'documents' },
    ],
  },
  {
    label: 'Catálogos',
    items: [
      {
        label: 'Máquinas',
        href: '/resources?tab=machines',
        icon: 'machines',
        resourceTab: 'machines',
      },
      {
        label: 'Materiales',
        href: '/resources?tab=materials',
        icon: 'materials',
        resourceTab: 'materials',
      },
    ],
  },
  {
    label: 'Administración',
    items: [
      {
        label: 'Usuarios internos',
        href: '/internal-users',
        icon: 'users',
        requiredRole: 'ADMIN',
      },
    ],
  },
]
