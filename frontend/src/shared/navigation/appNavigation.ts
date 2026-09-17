import { FilePlus2, House } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export type AppRole = 'CLIENT'

export type NavTab = {
  id: string
  label: string
  icon: LucideIcon
  destination: string
  roles: AppRole[]
}

export const NAV_TABS: NavTab[] = [
  {
    id: 'home',
    label: 'Inicio',
    icon: House,
    destination: '/dashboard',
    roles: ['CLIENT'],
  },
  {
    id: 'new-request',
    label: 'Nueva solicitud',
    icon: FilePlus2,
    destination: '/requests/new',
    roles: ['CLIENT'],
  },
]

export const getNavTabsForRole = (role: AppRole): NavTab[] =>
  NAV_TABS.filter((tab) => tab.roles.includes(role))