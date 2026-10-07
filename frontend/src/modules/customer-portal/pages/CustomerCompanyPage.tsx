import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { ActionIconButton } from '@/shared/components/ui/ActionIconButton'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CustomerAddressDeleteDialog } from '../components/CustomerAddressDeleteDialog'
import { CustomerAddressDialog } from '../components/CustomerAddressDialog'
import { CustomerCompanyFields } from '../components/CustomerCompanyFields'
import { CustomerCompanyHeader } from '../components/CustomerCompanyHeader'
import {
  useCustomerAddresses,
  useCustomerCompany,
} from '../hooks/useCustomerCompany'
import { useCustomerCompanyMutations } from '../hooks/useCustomerCompanyMutations'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import {
  formatCustomerCompanyDate,
  getCustomerRoleLabel,
} from '../model/customerCompanyPresenter'
import {
  customerCompanySchema,
  type CustomerAddressFormValues,
  type CustomerCompanyFormValues,
} from '../schemas/customerCompany.schemas'

export function CustomerCompanyPage() {
  const { customer } = useCustomerPortalContext()
  const query = useCustomerCompany(customer.customerId)
  const addressesQuery = useCustomerAddresses(customer.customerId)
  const mutations = useCustomerCompanyMutations(customer.customerId)
  const isAdmin = customer.role === 'ADMIN'
  const [addressDialogOpen, setAddressDialogOpen] = useState(false)
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null)
  const [deletingAddressId, setDeletingAddressId] = useState<number | null>(null)

  const company = query.data
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<CustomerCompanyFormValues>({
    resolver: zodResolver(customerCompanySchema),
    values: {
      name: company?.name ?? '',
      rfc: company?.rfc ?? '',
      phone: company?.phone ?? '',
      administrativeEmail: company?.administrativeEmail ?? '',
      city: company?.city ?? '',
      state: company?.state ?? '',
      website: company?.website ?? '',
    },
  })

  if (query.isPending) {
    return (
      <PageContainer className="py-3 lg:py-2">
        <LoadingState label="Cargando empresa…" />
      </PageContainer>
    )
  }

  if (query.isError) {
    return (
      <PageContainer className="py-3 lg:py-2">
        <ErrorState error={query.error} title="No pudimos cargar la empresa" />
      </PageContainer>
    )
  }

  if (!company) {
    return (
      <PageContainer className="py-3 lg:py-2">
        <ErrorState
          error={new Error('La respuesta no incluyó información de empresa.')}
          title="No pudimos cargar la empresa"
        />
      </PageContainer>
    )
  }

  const editingAddress =
    addressesQuery.data?.find((address) => address.id === editingAddressId) ??
    null
  const deletingAddress =
    addressesQuery.data?.find((address) => address.id === deletingAddressId) ??
    null

  const saveAddress = async (values: CustomerAddressFormValues) => {
    const payload = {
      label: values.label.trim(),
      address: values.address.trim(),
      city: values.city.trim(),
      state: values.state.trim(),
      postalCode: values.postalCode.trim(),
      country: values.country.trim(),
      ...(values.contactName.trim()
        ? { contactName: values.contactName.trim() }
        : {}),
      ...(values.contactPhone.trim()
        ? { contactPhone: values.contactPhone.trim() }
        : {}),
      ...(values.deliveryInstructions.trim()
        ? { deliveryInstructions: values.deliveryInstructions.trim() }
        : {}),
      defaultAddress: values.defaultAddress,
    }

    try {
      if (editingAddressId !== null) {
        await mutations.updateAddress.mutateAsync({
          addressId: editingAddressId,
          payload,
        })
      } else {
        await mutations.createAddress.mutateAsync(payload)
      }
      return true
    } catch {
      return false
    }
  }

  const closeAddressDialog = () => {
    mutations.createAddress.reset()
    mutations.updateAddress.reset()
    setEditingAddressId(null)
    setAddressDialogOpen(false)
  }

  const closeDeleteAddressDialog = () => {
    mutations.deleteAddress.reset()
    setDeletingAddressId(null)
  }

  const deleteAddress = async () => {
    if (deletingAddressId === null) return

    try {
      await mutations.deleteAddress.mutateAsync(deletingAddressId)
      setDeletingAddressId(null)
    } catch {
      // The mutation error stays visible inside the confirmation dialog.
    }
  }

  const submit = handleSubmit(async (values) => {
    try {
      await mutations.updateCompany.mutateAsync({
        name: values.name.trim(),
        rfc: values.rfc.trim(),
        phone: values.phone.trim(),
        administrativeEmail: values.administrativeEmail.trim(),
        city: values.city.trim(),
        state: values.state.trim(),
        website: values.website.trim(),
      })
    } catch {
      // Mutation error is rendered below.
    }
  })

  return (
    <PageContainer className="py-3 lg:flex lg:h-[calc(100dvh-100px)] lg:min-h-0 lg:flex-col lg:overflow-hidden lg:py-2">
      <div className="shrink-0">
        <CustomerCompanyHeader
          name={company.name}
          status={company.status}
          city={company.city}
          state={company.state}
          administrativeEmail={company.administrativeEmail}
        />
      </div>

      <form
        className="mt-3 grid gap-3 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.3fr)_minmax(280px,0.7fr)] lg:items-stretch lg:overflow-hidden"
        onSubmit={(event) => void submit(event)}
      >
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-28px_rgba(15,23,42,0.28)] lg:flex lg:h-full lg:min-h-0 lg:flex-col">
          <div className="flex shrink-0 flex-col gap-2.5 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/65 px-4 py-2.5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <SidebarNavIcon name="company" className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                  Información administrativa
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                  Datos de la empresa
                </h2>
                <p className="mt-0.5 text-[9px] leading-4 text-slate-500">
                  {isAdmin
                    ? 'Mantén actualizados los datos generales de la empresa.'
                    : 'Puedes consultar estos datos, pero solo un administrador puede modificarlos.'}
                </p>
              </div>
            </div>

            {!isAdmin ? (
              <Badge
                tone="neutral"
                className="self-start px-2 py-0.5 text-[8px]"
              >
                Solo consulta
              </Badge>
            ) : isDirty ? (
              <span className="self-start rounded-full bg-amber-50 px-2 py-1 text-[8px] font-semibold text-amber-700 ring-1 ring-amber-100">
                Cambios sin guardar
              </span>
            ) : null}
          </div>

          <div className="p-3.5 sm:p-4 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
            <CustomerCompanyFields
              register={register}
              errors={errors}
              disabled={!isAdmin}
            />

            {mutations.updateCompany.error ? (
              <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[9px] leading-4 text-red-700">
                {getErrorMessage(mutations.updateCompany.error)}
              </p>
            ) : null}

            {mutations.updateCompany.isSuccess && !isDirty ? (
              <p className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/65 px-3 py-2.5 text-[9px] leading-4 text-emerald-700">
                Información actualizada correctamente.
              </p>
            ) : null}

            {isAdmin ? (
              <div className="mt-3.5 flex items-center justify-between gap-4 border-t border-slate-100 pt-3">
                <p className="text-[8px] leading-4 text-slate-400">
                  Los cambios afectan la información compartida por toda la
                  empresa.
                </p>
                <Button
                  type="submit"
                  size="sm"
                  className="!h-7 !px-3 !text-[8px]"
                  disabled={!isDirty || mutations.updateCompany.isPending}
                >
                  {mutations.updateCompany.isPending
                    ? 'Guardando…'
                    : 'Guardar cambios'}
                </Button>
              </div>
            ) : null}
          </div>
        </section>

        <aside className="overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-white via-white to-blue-50/20 p-3.5 shadow-[0_12px_35px_-28px_rgba(15,23,42,0.24)] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
              <SidebarNavIcon name="members" className="h-[17px] w-[17px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-slate-400">
                Tu acceso
              </p>
              <h2 className="mt-0.5 truncate text-sm font-semibold text-slate-950">
                {customer.customerName}
              </h2>
              <div className="mt-1.5">
                <Badge
                  tone={isAdmin ? 'info' : 'neutral'}
                  className="text-[8px]"
                >
                  {getCustomerRoleLabel(customer.role)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 px-3 py-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Permisos sobre la empresa
            </p>
            <p className="mt-1.5 text-[9px] leading-4 text-slate-600">
              {isAdmin
                ? 'Puedes modificar la información administrativa y gestionar el acceso de otros miembros.'
                : customer.role === 'REQUESTER'
                  ? 'Puedes crear y dar seguimiento a solicitudes, pero no modificar la información administrativa.'
                  : 'Tu acceso es de consulta. Puedes revisar la información y el avance de los trabajos.'}
            </p>
          </div>

          <dl className="mt-2.5 divide-y divide-slate-100 border-y border-slate-100">
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[8px] text-slate-500">Estado</dt>
              <dd className="text-[9px] font-semibold text-emerald-700">
                {company.status === 'ACTIVE' ? 'Activa' : company.status}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4 py-2">
              <dt className="text-[8px] text-slate-500">Empresa desde</dt>
              <dd className="text-right text-[8px] font-medium text-slate-700">
                {formatCustomerCompanyDate(company.createdAt)}
              </dd>
            </div>
          </dl>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
                  Direcciones de entrega
                </p>
                <p className="mt-1 text-[9px] leading-4 text-slate-500">
                  Ubicaciones reutilizables al crear solicitudes.
                </p>
              </div>
              {isAdmin ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="!h-7 !px-2.5 !text-[8px]"
                  onClick={() => {
                    setEditingAddressId(null)
                    mutations.createAddress.reset()
                    setAddressDialogOpen(true)
                  }}
                >
                  Agregar
                </Button>
              ) : null}
            </div>

            <div className="mt-2 space-y-2 lg:max-h-[184px] lg:overflow-y-auto lg:overscroll-contain lg:pr-1">
              {(addressesQuery.data ?? []).map((address) => (
                <div
                  key={address.id}
                  className="rounded-lg border border-slate-200 bg-white/80 px-3 py-2.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[9px] font-semibold text-slate-900">
                        {address.label}
                        {address.defaultAddress ? (
                          <span className="ml-1.5 text-[7px] font-semibold text-blue-600">
                            Predeterminada
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[8px] leading-4 text-slate-500">
                        {address.address}, {address.city}, {address.state},{' '}
                        {address.postalCode}
                      </p>
                    </div>
                    {isAdmin ? (
                      <div className="flex shrink-0 items-center gap-1">
                        <ActionIconButton
                          icon="edit"
                          label={`Editar dirección ${address.label}`}
                          tone="primary"
                          onClick={() => {
                            setEditingAddressId(address.id)
                            mutations.updateAddress.reset()
                            setAddressDialogOpen(true)
                          }}
                        />
                        <ActionIconButton
                          icon="delete"
                          label={`Eliminar dirección ${address.label}`}
                          tone="danger"
                          onClick={() => {
                            mutations.deleteAddress.reset()
                            setDeletingAddressId(address.id)
                          }}
                        />
                      </div>
                    ) : null}
                  </div>
                </div>
              ))}

              {!addressesQuery.isPending &&
              (addressesQuery.data?.length ?? 0) === 0 ? (
                <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50/70 px-3 py-2.5 text-[8px] leading-4 text-slate-500">
                  Aún no hay direcciones guardadas.
                </p>
              ) : null}
            </div>
          </div>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-slate-400">
              Accesos de la empresa
            </p>
            <p className="mt-1 text-[9px] leading-4 text-slate-500">
              Consulta quién puede entrar al portal y qué rol tiene cada
              persona.
            </p>

            <Link
              to={`/portal/${customer.customerId}/members`}
              className="mt-2.5 inline-flex h-7 items-center rounded-lg border border-slate-200 bg-white px-2.5 text-[8px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
            >
              {isAdmin ? 'Gestionar miembros' : 'Ver miembros'}
            </Link>
          </div>
        </aside>
      </form>

      <CustomerAddressDialog
        open={addressDialogOpen}
        address={editingAddress}
        submitting={
          mutations.createAddress.isPending || mutations.updateAddress.isPending
        }
        error={
          editingAddressId === null
            ? mutations.createAddress.error
            : mutations.updateAddress.error
        }
        onClose={closeAddressDialog}
        onSubmit={saveAddress}
      />

      <CustomerAddressDeleteDialog
        address={deletingAddress}
        deleting={mutations.deleteAddress.isPending}
        error={mutations.deleteAddress.error}
        onClose={closeDeleteAddressDialog}
        onConfirm={() => void deleteAddress()}
      />
    </PageContainer>
  )
}
