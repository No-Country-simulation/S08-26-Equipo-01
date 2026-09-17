import type { NavTab } from '@/shared/navigation/appNavigation'
import { getNavTabsForRole } from '@/shared/navigation/appNavigation'
import { useCurrentRole } from './useCurrentRole'

export const useAppTabs = (): NavTab[] => getNavTabsForRole(useCurrentRole())