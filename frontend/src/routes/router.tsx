import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AuthPage } from '@/pages/AuthPage'
import { CreateRequestPage } from '@/pages/CreateRequestPage'
import { CustomerRequestsPage } from '@/pages/CustomerRequestsPage'
import { SystemDesignPage } from '@/pages/SystemDesignPage'
import { AppLayout } from '@/shared/components/layouts/AppLayout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/auth" replace />,
  },
  {
    path: '/auth',
    element: <AuthPage />,
  },
  {
    element: <AppLayout />,
    children: [
      {
        path: '/dashboard',
        element: <CustomerRequestsPage />,
      },
      {
        path: '/requests/new',
        element: <CreateRequestPage />,
      },
      {
        path: '/design',
        element: <SystemDesignPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/auth" replace />,
  },
])
