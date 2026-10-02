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
import {
  CustomerCompanyPage,
  CustomerMembersPage,
  CustomerPortalHomePage,
  CustomerPortalLandingPage,
  CustomerPortalShell,
  CustomerRequestCreatePage,
  CustomerRequestDetailPage,
  CustomerRequestsPage,
} from '@/modules/customer-portal'
import { DocumentCenterPage } from '@/modules/document-center'
import { HomePage } from '@/modules/home'
import { JobCaseDetailPage, JobCasesPage } from '@/modules/job-cases'
import {
  InternalCustomerDetailPage,
  InternalCustomersPage,
} from '@/modules/internal-customers'
import { InternalUsersPage } from '@/modules/internal-users'
import { OperationalResourcesPage } from '@/modules/operational-resources'
import {
  CustomerQuotationDetailPage,
  CustomerQuotationsPage,
  QuotationDetailPage,
  QuotationsPage,
} from '@/modules/quotations'
import {
  DeliveriesPage,
  ProductionPage,
  QualityPage,
  WorkOrderDetailPage,
  WorkOrdersPage,
} from '@/modules/work-orders'

export const router = createBrowserRouter([
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
      {
        element: <InternalOnlyRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              { path: '/', element: <HomePage /> },
              { path: '/job-cases', element: <JobCasesPage /> },
              {
                path: '/job-cases/:caseId',
                element: <JobCaseDetailPage />,
              },
              { path: '/quotations', element: <QuotationsPage /> },
              {
                path: '/quotations/:quotationId',
                element: <QuotationDetailPage />,
              },
              { path: '/work-orders', element: <WorkOrdersPage /> },
              {
                path: '/work-orders/:workOrderId',
                element: <WorkOrderDetailPage />,
              },
              { path: '/production', element: <ProductionPage /> },
              { path: '/resources', element: <OperationalResourcesPage /> },
              { path: '/quality', element: <QualityPage /> },
              { path: '/deliveries', element: <DeliveriesPage /> },
              { path: '/documents', element: <DocumentCenterPage /> },
              { path: '/customers', element: <InternalCustomersPage /> },
              {
                path: '/customers/:customerId',
                element: <InternalCustomerDetailPage />,
              },
              { path: '/internal-users', element: <InternalUsersPage /> },
            ],
          },
        ],
      },
      {
        element: <CustomerOnlyRoute />,
        children: [
          { path: '/portal', element: <CustomerPortalLandingPage /> },
          {
            element: <CustomerPortalShell />,
            children: [
              {
                path: '/portal/:customerId',
                element: <CustomerPortalHomePage />,
              },
              {
                path: '/portal/:customerId/requests',
                element: <CustomerRequestsPage />,
              },
              {
                path: '/portal/:customerId/requests/new',
                element: <CustomerRequestCreatePage />,
              },
              {
                path: '/portal/:customerId/requests/:requestId',
                element: <CustomerRequestDetailPage />,
              },
              {
                path: '/portal/:customerId/members',
                element: <CustomerMembersPage />,
              },
              {
                path: '/portal/:customerId/company',
                element: <CustomerCompanyPage />,
              },
              {
                path: '/portal/:customerId/quotations',
                element: <CustomerQuotationsPage />,
              },
              {
                path: '/portal/:customerId/quotations/:quotationId',
                element: <CustomerQuotationDetailPage />,
              },
            ],
          },
        ],
      },
      { path: '*', element: <AccountHomeRedirect /> },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
])
