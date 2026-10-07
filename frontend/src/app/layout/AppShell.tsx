import { useEffect, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import {
  clearCurrentSession,
  useSessionExpiry,
  useSessionStore,
} from '@/modules/auth'
import { queryClient } from '@/app/query/queryClient'
import { Sidebar } from '@/app/layout/Sidebar'
import { Topbar } from '@/app/layout/Topbar'

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const navigate = useNavigate()
  const session = useSessionStore((state) => state.session)

  useSessionExpiry()

  useEffect(() => {
    if (!sidebarOpen) return

    const previousBodyOverflow = document.body.style.overflow
    const previousBodyOverscroll = document.body.style.overscrollBehavior
    const previousHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = 'hidden'
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousBodyOverflow
      document.body.style.overscrollBehavior = previousBodyOverscroll
      document.documentElement.style.overflow = previousHtmlOverflow
    }
  }, [sidebarOpen])

  if (!session) return null

  const logout = () => {
    clearCurrentSession()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <Sidebar
        open={sidebarOpen}
        user={session.user}
        onNavigate={() => setSidebarOpen(false)}
      />

      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Cerrar navegación"
        />
      ) : null}

      <div className="min-w-0">
        <Topbar
          user={session.user}
          onOpenMenu={() => setSidebarOpen(true)}
          onLogout={logout}
        />
        <main className="min-h-[calc(100vh-76px)]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
