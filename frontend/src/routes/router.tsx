import { createBrowserRouter, Navigate } from 'react-router-dom'
import AuthPage from '@/pages/AuthPage'
import SystemDesignPage from '@/pages/SystemDesignPage'

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
    path: '/auth',
    element: <AuthPage />,
  },
  {
    path: '*',
    element: <Navigate to="/auth" replace />,
  },
])
