import { Link } from 'react-router-dom'
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
          <article
            key={customer.id}
            className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_10px_28px_-24px_rgba(15,23,42,0.32)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
          >
            <div
              className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${statusAccent[customer.status]}`}
            />

            <div className="p-4">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex min-w-0 gap-3">
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${statusSurface[customer.status]}`}
                  >
                    <SidebarNavIcon
                      name="customers"
                      className="h-[17px] w-[17px]"
                    />
                  </div>

                  <div className="min-w-0">
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
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <Badge tone={status.tone} className="px-2.5 py-0.5 text-[9px]">
                    {status.label}
                  </Badge>
                  <Link
                    to={`/customers/${customer.id}`}
                    className="inline-flex h-9 min-w-28 items-center justify-center rounded-lg border border-slate-200 bg-white px-3.5 text-[10px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Abrir cliente
                  </Link>
                </div>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <SummaryCell
                  label="Miembros activos"
                  value={String(customer.activeMembers)}
                />
                <SummaryCell
                  label="Expedientes abiertos"
                  value={String(customer.openCases)}
                  valueClassName={
                    customer.openCases > 0 ? 'text-amber-700' : undefined
                  }
                />
                <SummaryCell
                  label="Trabajos completados"
                  value={String(customer.completedCases)}
                  valueClassName={
                    customer.completedCases > 0
                      ? 'text-emerald-700'
                      : undefined
                  }
                />
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[9px] leading-4 text-slate-500">
                  {customer.status === 'ACTIVE'
                    ? 'Empresa habilitada para continuar creando y siguiendo trabajos.'
                    : 'Empresa suspendida; conserva su historial para consulta interna.'}
                </p>
                <p className="shrink-0 text-[8px] font-semibold text-slate-500">
                  Relación · {status.label}
                </p>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function SummaryCell({
  label,
  value,
  valueClassName = 'text-slate-900',
}: {
  label: string
  value: string
  valueClassName?: string
}) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50/70 px-3 py-2.5">
      <p className="text-[8px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <p className={`mt-1 truncate text-[10px] font-semibold ${valueClassName}`}>
        {value}
      </p>
    </div>
  )
}
