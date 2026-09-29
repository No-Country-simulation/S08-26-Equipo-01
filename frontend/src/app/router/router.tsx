import { createBrowserRouter, Navigate } from 'react-router-dom'
import { HomePage } from '@/modules/home'

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <Navigate to="/" replace /> },
])
