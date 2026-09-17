import { Outlet } from 'react-router-dom'
import { useAppTabs } from '@/shared/hooks/useAppTabs'
import { MobileNavBar } from './MobileNavBar'
import { Sidebar } from './Sidebar'

export const AppLayout = () => {
  const tabs = useAppTabs()

  return (
    <div className="min-h-screen">
      <Sidebar tabs={tabs} />
      <main className="pb-16 md:pb-0 md:pl-64">
        <Outlet />
      </main>
      <MobileNavBar tabs={tabs} />
    </div>
  )
}