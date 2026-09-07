import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'
import { CreateRequestPage } from '@/pages/CreateRequestPage'
import { CustomerRequestsPage } from '@/pages/CustomerRequestsPage'
import { RequestDetailPage } from '@/pages/RequestDetailPage'
import { SystemDesignPage } from '@/pages/SystemDesignPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/design',
    element: <SystemDesignPage />,
  },
  {
    path: '/dashboard',
    element: <CustomerRequestsPage />,
  },
  {
    path: '/requests/new',
    element: <CreateRequestPage />,
  },
  {
    path: '/requests/:id',
    element: <RequestDetailPage />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '*',
    element: <Navigate to="/auth" replace />,
  },
])
