import { Link } from 'react-router-dom'
import {
  InternalListingCard,
  InternalListingCardFooter,
  InternalListingCardTop,
  InternalListingSummaryCell,
  InternalListingSummaryGrid,
} from '@/shared/components/listing/InternalListingCard'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Badge } from '@/shared/components/ui/Badge'
import {
  getInternalCustomerContact,
  getInternalCustomerLocation,
  getInternalCustomerStatusPresentation,
} from '../model/internalCustomerPresenter'
import type {
  InternalCustomerStatus,
  InternalCustomerSummaryDto,
} from '../types/internalCustomer.types'

interface InternalCustomersTableProps {
  customers: InternalCustomerSummaryDto[]
}

const statusAccent: Record<InternalCustomerStatus, string> = {
  ACTIVE: 'from-emerald-500 to-teal-400',
  SUSPENDED: 'from-red-500 to-rose-400',
}

const statusSurface: Record<InternalCustomerStatus, string> = {
  ACTIVE: 'bg-emerald-50 text-emerald-600',
  SUSPENDED: 'bg-red-50 text-red-600',
}

export function InternalCustomersTable({
  customers,
}: InternalCustomersTableProps) {
  return (
    <div className="space-y-3">
      {customers.map((customer) => {
        const status = getInternalCustomerStatusPresentation(customer.status)

        return (
          <InternalListingCard
            key={customer.id}
            accentClassName={statusAccent[customer.status]}
          >
            <InternalListingCardTop
              icon={
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[customer.status]}`}
                >
                  <SidebarNavIcon
                    name="customers"
                    className="h-[17px] w-[17px]"
                  />
                </div>
              }
              actions={
                <>
                  <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
                    {status.label}
                  </Badge>
                  <Link
                    to={`/customers/${customer.id}`}
                    className="inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Abrir cliente
                  </Link>
                </>
              }
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Cliente
                </p>
                {customer.rfc ? (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-500">
                    RFC {customer.rfc}
                  </span>
                ) : null}
              </div>

              <Link
                to={`/customers/${customer.id}`}
                className="mt-1.5 block truncate text-sm font-semibold text-slate-950 transition group-hover:text-blue-700"
              >
                {customer.name}
              </Link>

              <p className="mt-1 truncate text-[10px] leading-4 text-slate-500">
                {getInternalCustomerContact(customer)} ·{' '}
                {getInternalCustomerLocation(customer)}
              </p>
            </InternalListingCardTop>

            <InternalListingSummaryGrid>
              <InternalListingSummaryCell
                label="Miembros activos"
                value={String(customer.activeMembers)}
              />
              <InternalListingSummaryCell
                label="Expedientes abiertos"
                value={
                  <span className={customer.openCases > 0 ? 'text-amber-700' : undefined}>
                    {customer.openCases}
                  </span>
                }
              />
              <InternalListingSummaryCell
                label="Trabajos completados"
                value={
                  <span
                    className={
                      customer.completedCases > 0 ? 'text-emerald-700' : undefined
                    }
                  >
                    {customer.completedCases}
                  </span>
                }
              />
            </InternalListingSummaryGrid>

            <InternalListingCardFooter>
              <p className="text-[9px] leading-4 text-slate-500">
                {customer.status === 'ACTIVE'
                  ? 'Empresa habilitada para continuar creando y siguiendo trabajos.'
                  : 'Empresa suspendida; conserva su historial para consulta interna.'}
              </p>
              <p className="shrink-0 text-[8px] font-semibold text-slate-500">
                Relación · {status.label}
              </p>
            </InternalListingCardFooter>
          </InternalListingCard>
        )
      })}
    </div>
  )
}
