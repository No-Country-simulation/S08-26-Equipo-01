import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import { formatCustomerRequestDate } from '../model/customerRequestPresenter'
import type { CustomerRequestDetailDto } from '../types/customerRequest.types'

interface CustomerRequestWorkDetailsProps {
  request: CustomerRequestDetailDto
}

export function CustomerRequestWorkDetails({
  request,
}: CustomerRequestWorkDetailsProps) {
  const destination = request.deliveryDestination
  const destinationLabel =
    destination.mode === 'CUSTOMER_PICKUP'
      ? 'Recolección en planta'
      : destination.mode === 'DEFINE_LATER'
        ? 'Destino por definir'
        : (destination.label ?? 'Destino acordado')
  const destinationDetail =
    destination.mode === 'CUSTOMER_PICKUP'
      ? 'La empresa recogerá el pedido cuando esté listo.'
      : destination.mode === 'DEFINE_LATER'
        ? 'El destino se acordará durante la revisión.'
        : [
            destination.address,
            destination.city,
            destination.state,
            destination.postalCode,
            destination.country,
          ]
            .filter(Boolean)
            .join(', ')

  return (
    <Card className="border-blue-100/80 bg-gradient-to-br from-white via-white to-blue-50/30 p-4 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.3)]">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
        </div>
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Información base
          </p>
          <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
            Detalles del trabajo
          </h2>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">Cantidad</p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
            {request.quantity} pieza{request.quantity === 1 ? '' : 's'}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">Material</p>
          <p className="mt-0.5 line-clamp-2 text-[10px] font-semibold leading-4 text-slate-950">
            {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
              ? 'Asesoría técnica'
              : request.materialRequirement}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-medium text-slate-500">
            Fecha requerida
          </p>
          <p className="mt-0.5 text-[10px] font-semibold text-slate-950">
            {formatCustomerRequestDate(request.requestedDeliveryDate)}
          </p>
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Descripción
        </p>
        <p className="mt-1.5 whitespace-pre-wrap text-[10px] leading-5 text-slate-700">
          {request.description}
        </p>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Entrega acordada
        </p>
        <div className="mt-2 rounded-xl bg-slate-50/80 px-3 py-2.5">
          <p className="text-[10px] font-semibold text-slate-900">
            {destinationLabel}
          </p>
          <p className="mt-0.5 text-[9px] leading-4 text-slate-600">
            {destinationDetail}
          </p>
          {destination.contactName ? (
            <p className="mt-1 text-[8px] text-slate-500">
              Contacto: {destination.contactName}
              {destination.contactPhone ? ' · ' + destination.contactPhone : ''}
            </p>
          ) : null}
        </div>
      </div>

      <div className="mt-3 border-t border-slate-100 pt-3">
        <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
          Requisitos técnicos
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-[0.38fr_0.62fr]">
          <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-[8px] text-slate-500">Definición</p>
            <p className="mt-0.5 text-[10px] font-semibold text-slate-900">
              {request.materialRequirementType === 'ASSISTANCE_REQUIRED'
                ? 'Asesoría técnica requerida'
                : 'Material especificado'}
            </p>
          </div>
          <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
            <p className="text-[8px] text-slate-500">Detalle</p>
            <p className="mt-0.5 whitespace-pre-wrap text-[9px] leading-4 text-slate-700">
              {request.materialRequirement}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
