import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Navigate, Outlet, useNavigate, useParams } from 'react-router-dom'
import {
  clearCurrentSession,
  useSessionExpiry,
  useSessionStore,
} from '@/modules/auth'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { CustomerPortalContextProvider } from '../context/CustomerPortalContext'
import { useCustomerContexts } from '../hooks/useCustomerContexts'
import '../customerPortal.css'
import { CustomerPortalSidebar } from './CustomerPortalSidebar'
import { CustomerPortalTopbar } from './CustomerPortalTopbar'

export function CustomerPortalShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { customerId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const session = useSessionStore((state) => state.session)
  const contextsQuery = useCustomerContexts()

  useSessionExpiry()

  if (!session) return null

  if (contextsQuery.isPending) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.3)]">
          <LoadingState label="Cargando empresa…" />
        </div>
      </main>
    )
  }

  if (contextsQuery.isError) {
    return (
      <main className="min-h-screen bg-[#f6f8fc] px-5 py-6 sm:px-8">
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.3)]">
          <ErrorState
            error={contextsQuery.error}
            title="No pudimos cargar tu empresa"
          />
        </div>
      </main>
    )
  }

  const numericCustomerId = Number(customerId)
  const customer = contextsQuery.data.find(
    (context) => context.customerId === numericCustomerId,
  )

  if (!customer) {
    return <Navigate to="/portal" replace />
  }

  const logout = () => {
    clearCurrentSession()
    queryClient.clear()
    navigate('/login', { replace: true })
  }

  return (
    <CustomerPortalContextProvider
      value={{ customer, contexts: contextsQuery.data }}
    >
      <div className="qt-customer-portal min-h-screen bg-[#f6f8fc] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
        <CustomerPortalSidebar
          customer={customer}
          hasMultipleCustomers={contextsQuery.data.length > 1}
          open={sidebarOpen}
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
          <CustomerPortalTopbar
            customer={customer}
            user={session.user}
            onOpenMenu={() => setSidebarOpen(true)}
            onProfile={() => navigate(`/portal/${customer.customerId}/profile`)}
            onLogout={logout}
          />
          <main className="min-h-[calc(100vh-76px)]">
            <Outlet />
          </main>
        </div>
      </div>
    </CustomerPortalContextProvider>
  )
}
