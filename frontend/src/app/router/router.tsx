import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { AccountHomeRedirect } from '@/app/router/AccountHomeRedirect'
import { CustomerOnlyRoute } from '@/app/router/CustomerOnlyRoute'
import { InternalOnlyRoute } from '@/app/router/InternalOnlyRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import {
  CustomerInvitationPage,
  ForgotPasswordPage,
  InternalInvitationPage,
  LoginPage,
  RegisterPage,
  ResendVerificationPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/modules/auth'

function lazyComponent<TModule extends object>(
  loader: () => Promise<TModule>,
  exportName: keyof TModule,
) {
  return async () => {
    const module = await loader()
    return { Component: module[exportName] as ComponentType }
  }
}

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyComponent(() => import('@/modules/landing'), 'LandingPage'),
  },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/customer-invitations/accept',
    element: <CustomerInvitationPage />,
  },
  {
    path: '/internal-invitations/accept',
    element: <InternalInvitationPage />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/resend-verification', element: <ResendVerificationPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/account', element: <AccountHomeRedirect /> },
      {
        element: <InternalOnlyRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: '/dashboard',
                lazy: lazyComponent(() => import('@/modules/home'), 'HomePage'),
              },
              {
                path: '/profile',
                lazy: lazyComponent(
                  () => import('@/modules/user-profile'),
                  'InternalProfilePage',
                ),
              },
              {
                path: '/job-cases',
                lazy: lazyComponent(
                  () => import('@/modules/job-cases'),
                  'JobCasesPage',
                ),
              },
              {
                path: '/job-cases/:caseId',
                lazy: lazyComponent(
                  () => import('@/modules/job-cases'),
                  'JobCaseDetailPage',
                ),
              },
              {
                path: '/quotations',
                lazy: lazyComponent(
                  () => import('@/modules/quotations'),
                  'QuotationsPage',
                ),
              },
              {
                path: '/quotations/:quotationId',
                lazy: lazyComponent(
                  () => import('@/modules/quotations'),
                  'QuotationDetailPage',
                ),
              },
              {
                path: '/work-orders',
                lazy: lazyComponent(
                  () => import('@/modules/work-orders'),
                  'WorkOrdersPage',
                ),
              },
              {
                path: '/work-orders/:workOrderId',
                lazy: lazyComponent(
                  () => import('@/modules/work-orders'),
                  'WorkOrderDetailPage',
                ),
              },
              {
                path: '/production',
                lazy: lazyComponent(
                  () => import('@/modules/work-orders'),
                  'ProductionPage',
                ),
              },
              {
                path: '/machines',
                lazy: lazyComponent(
                  () => import('@/modules/operational-resources'),
                  'MachinesPage',
                ),
              },
              {
                path: '/materials',
                lazy: lazyComponent(
                  () => import('@/modules/operational-resources'),
                  'MaterialsPage',
                ),
              },
              {
                path: '/resources',
                lazy: lazyComponent(
                  () => import('@/modules/operational-resources'),
                  'OperationalResourcesPage',
                ),
              },
              {
                path: '/quality',
                lazy: lazyComponent(
                  () => import('@/modules/work-orders'),
                  'QualityPage',
                ),
              },
              {
                path: '/deliveries',
                lazy: lazyComponent(
                  () => import('@/modules/work-orders'),
                  'DeliveriesPage',
                ),
              },
              {
                path: '/documents',
                lazy: lazyComponent(
                  () => import('@/modules/document-center'),
                  'DocumentCenterPage',
                ),
              },
              {
                path: '/customers',
                lazy: lazyComponent(
                  () => import('@/modules/internal-customers'),
                  'InternalCustomersPage',
                ),
              },
              {
                path: '/customers/:customerId',
                lazy: lazyComponent(
                  () => import('@/modules/internal-customers'),
                  'InternalCustomerDetailPage',
                ),
              },
              {
                path: '/internal-users',
                lazy: lazyComponent(
                  () => import('@/modules/internal-users'),
                  'InternalUsersPage',
                ),
              },
            ],
          },
        ],
      },
      {
        element: <CustomerOnlyRoute />,
        children: [
          {
            path: '/portal',
            lazy: lazyComponent(
              () => import('@/modules/customer-portal'),
              'CustomerPortalLandingPage',
            ),
          },
          {
            lazy: lazyComponent(
              () => import('@/modules/customer-portal'),
              'CustomerPortalShell',
            ),
            children: [
              {
                path: '/portal/:customerId',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerPortalHomePage',
                ),
              },
              {
                path: '/portal/:customerId/profile',
                lazy: lazyComponent(
                  () => import('@/modules/user-profile'),
                  'CustomerProfilePage',
                ),
              },
              {
                path: '/portal/:customerId/requests',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerRequestsPage',
                ),
              },
              {
                path: '/portal/:customerId/requests/new',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerRequestCreatePage',
                ),
              },
              {
                path: '/portal/:customerId/requests/:requestId',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerRequestDetailPage',
                ),
              },
              {
                path: '/portal/:customerId/members',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerMembersPage',
                ),
              },
              {
                path: '/portal/:customerId/company',
                lazy: lazyComponent(
                  () => import('@/modules/customer-portal'),
                  'CustomerCompanyPage',
                ),
              },
              {
                path: '/portal/:customerId/quotations',
                lazy: lazyComponent(
                  () => import('@/modules/quotations'),
                  'CustomerQuotationsPage',
                ),
              },
              {
                path: '/portal/:customerId/quotations/:quotationId',
                lazy: lazyComponent(
                  () => import('@/modules/quotations'),
                  'CustomerQuotationDetailPage',
                ),
              },
            ],
          },
        ],
      },
      { path: '*', element: <AccountHomeRedirect /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
