import type { ReactNode } from 'react'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { Card } from '@/shared/components/ui/Card'
import {
  formatCustomerRequestDate,
  formatFileSize,
} from '../model/customerRequestPresenter'
import type { CustomerRequestFormValues } from '../schemas/customerRequest.schemas'
import type { CustomerAddressDto } from '../types/customerCompany.types'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

interface CustomerRequestReviewStepProps {
  values: CustomerRequestFormValues
  documents: RequestDocumentUpload[]
  onEditDetails: () => void
  onEditRequirements: () => void
  onEditDelivery: () => void
  addresses: CustomerAddressDto[]
  actions: ReactNode
}

function PencilIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m4 20 4.5-1 9.7-9.7-3.5-3.5L5 15.5 4 20Z" />
      <path d="m13.8 6.7 3.5 3.5" />
    </svg>
  )
}

function FileIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M7 3h7l4 4v14H7z" />
      <path d="M14 3v5h5" />
      <path d="M10 13h5M10 16h5" />
    </svg>
  )
}

function MetricIcon({ type }: { type: 'quantity' | 'date' | 'reference' }) {
  if (type === 'quantity') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="5" width="6" height="6" rx="1" />
        <rect x="14" y="5" width="6" height="6" rx="1" />
        <rect x="4" y="15" width="6" height="4" rx="1" />
        <rect x="14" y="15" width="6" height="4" rx="1" />
      </svg>
    )
  }

  if (type === 'date') {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-3.5 w-3.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="5" width="16" height="15" rx="2" />
        <path d="M8 3v4M16 3v4M4 10h16" />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4h10l4 4v12H5z" />
      <path d="M15 4v5h5" />
      <path d="M8 13h8M8 16h5" />
    </svg>
  )
}

function getFileExtension(fileName: string) {
  const parts = fileName.split('.')
  return parts.length > 1 ? parts.at(-1)?.toUpperCase() : 'DOC'
}

export function CustomerRequestReviewStep({
  values,
  documents,
  onEditDetails,
  onEditRequirements,
  onEditDelivery,
  addresses,
  actions,
}: CustomerRequestReviewStepProps) {
  const selectedAddress =
    values.deliveryMode === 'SAVED_ADDRESS'
      ? (addresses.find(
          (address) => String(address.id) === values.customerAddressId,
        ) ?? null)
      : null

  const deliveryLabel =
    values.deliveryMode === 'SAVED_ADDRESS'
      ? (selectedAddress?.label ?? 'Dirección de la empresa')
      : values.deliveryMode === 'CUSTOM_ADDRESS'
        ? values.deliveryLabel || 'Otro destino'
        : values.deliveryMode === 'CUSTOMER_PICKUP'
          ? 'Recolección en planta'
          : 'Destino por definir'

  const deliveryAddress =
    values.deliveryMode === 'SAVED_ADDRESS' && selectedAddress
      ? [
          selectedAddress.address,
          selectedAddress.city,
          selectedAddress.state,
          selectedAddress.postalCode,
          selectedAddress.country,
        ].join(', ')
      : values.deliveryMode === 'CUSTOM_ADDRESS'
        ? [
            values.deliveryAddress,
            values.deliveryCity,
            values.deliveryState,
            values.deliveryPostalCode,
            values.deliveryCountry,
          ]
            .filter(Boolean)
            .join(', ')
        : values.deliveryMode === 'CUSTOMER_PICKUP'
          ? 'El cliente recogerá el pedido en planta.'
          : 'Se acordará con el equipo durante la revisión.'

  const metrics = [
    {
      label: 'Cantidad',
      value: `${values.quantity} pieza${values.quantity === 1 ? '' : 's'}`,
      type: 'quantity' as const,
    },
    {
      label: 'Fecha requerida',
      value: values.requestedDeliveryDate
        ? formatCustomerRequestDate(values.requestedDeliveryDate)
        : 'Sin fecha',
      type: 'date' as const,
    },
    {
      label: 'Referencia cliente',
      value: values.customerReference || 'Sin referencia',
      type: 'reference' as const,
    },
  ]

  return (
    <div className="grid min-w-0 max-w-full gap-4 overflow-x-hidden lg:h-full lg:min-h-0 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)]">
      <Card className="min-w-0 max-w-full overflow-hidden p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.32)] lg:h-full lg:min-h-0 lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <SidebarNavIcon name="requests" className="h-[17px] w-[17px]" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
                Confirmación
              </p>
              <h2 className="mt-0.5 text-base font-semibold text-slate-950">
                Resumen de la solicitud
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onEditDetails}
            aria-label="Editar detalles"
            title="Editar detalles"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
          >
            <PencilIcon />
          </button>
        </div>

        <div className="mt-3 min-w-0 rounded-xl border border-slate-200 bg-slate-50/55 px-3.5 py-3">
          <p className="break-words text-[13px] font-semibold text-slate-950 [overflow-wrap:anywhere]">
            {values.title}
          </p>
          <p className="mt-1 whitespace-pre-wrap break-words text-[9px] leading-4 text-slate-600 [overflow-wrap:anywhere]">
            {values.description}
          </p>
        </div>

        <div className="mt-3 grid min-w-0 gap-2 sm:grid-cols-3">
          {metrics.map((metric) => (
            <div
              key={metric.label}
              className="flex min-w-0 items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <MetricIcon type={metric.type} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[8px] font-medium text-slate-500">
                  {metric.label}
                </p>
                <p className="mt-0.5 truncate text-[10px] font-semibold text-slate-950">
                  {metric.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 min-w-0 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Definición técnica
              </p>
              <h3 className="mt-0.5 text-[11px] font-semibold text-slate-950">
                Requisitos técnicos
              </h3>
            </div>

            <button
              type="button"
              onClick={onEditRequirements}
              aria-label="Editar requisitos"
              title="Editar requisitos"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <PencilIcon />
            </button>
          </div>

          <div className="mt-2.5 grid min-w-0 gap-2 sm:grid-cols-2">
            <div className="min-w-0 rounded-lg bg-slate-50/75 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">
                Definición
              </p>
              <p className="mt-0.5 break-words text-[10px] font-semibold text-slate-800 [overflow-wrap:anywhere]">
                {values.materialRequirementType === 'SPECIFIED'
                  ? 'Material especificado'
                  : 'Asesoría técnica requerida'}
              </p>
            </div>
            <div className="min-w-0 rounded-lg bg-slate-50/75 px-3 py-2.5">
              <p className="text-[8px] font-medium text-slate-500">
                Requisitos
              </p>
              <p className="mt-0.5 whitespace-pre-wrap break-words text-[9px] leading-4 text-slate-700 [overflow-wrap:anywhere]">
                {values.materialRequirement}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-3 min-w-0 border-t border-slate-200 pt-3">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Entrega acordada
              </p>
              <h3 className="mt-0.5 break-words text-[11px] font-semibold text-slate-950 [overflow-wrap:anywhere]">
                {deliveryLabel}
              </h3>
            </div>

            <button
              type="button"
              onClick={onEditDelivery}
              aria-label="Editar entrega"
              title="Editar entrega"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100"
            >
              <PencilIcon />
            </button>
          </div>

          <div className="mt-2.5 min-w-0 rounded-xl border border-slate-200 bg-slate-50/55 px-3 py-2.5">
            <p className="break-words text-[9px] font-medium leading-4 text-slate-700 [overflow-wrap:anywhere]">
              {deliveryAddress}
            </p>
            {values.deliveryContactName ? (
              <p className="mt-1 break-words text-[8px] text-slate-500 [overflow-wrap:anywhere]">
                Contacto: {values.deliveryContactName}
                {values.deliveryContactPhone
                  ? ' · ' + values.deliveryContactPhone
                  : ''}
              </p>
            ) : null}
            {values.deliveryInstructions ? (
              <p className="mt-1 break-words text-[8px] leading-4 text-slate-500 [overflow-wrap:anywhere]">
                {values.deliveryInstructions}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-3 min-w-0">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-slate-950">
              Documentos
            </p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[8px] font-semibold text-slate-600">
              {documents.length}
            </span>
          </div>

          <div className="mt-2 grid min-w-0 gap-2 sm:grid-cols-2">
            {documents.length > 0 ? (
              documents.map((document, index) => (
                <div
                  key={`${document.file.name}-review-${index}`}
                  className="flex min-w-0 max-w-full items-center gap-2.5 overflow-hidden rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-[0_1px_2px_rgba(15,23,42,0.03)]"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <FileIcon />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="max-w-full truncate text-[9px] font-semibold text-slate-800">
                      {document.name?.trim() || document.file.name}
                    </p>
                    <p className="mt-0.5 text-[8px] text-slate-500">
                      {formatFileSize(document.file.size)} ·{' '}
                      {getFileExtension(document.file.name)}
                    </p>
                    {document.description ? (
                      <p className="mt-1 max-w-full truncate text-[8px] text-slate-400">
                        {document.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <p className="sm:col-span-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-center text-[9px] text-slate-500">
                Sin documentos adjuntos.
              </p>
            )}
          </div>
        </div>

        <p className="mt-2.5 text-[8px] text-slate-400">
          Los archivos se registrarán como versiones iniciales al enviar.
        </p>
      </Card>

      <div className="flex min-w-0 min-h-0 max-w-full flex-col gap-2.5 lg:h-full">
        <div className="hidden min-h-0 flex-1 space-y-2.5 lg:block lg:overflow-y-auto lg:[scrollbar-gutter:stable]">
          <Card className="p-3.5 shadow-[0_12px_35px_-26px_rgba(15,23,42,0.28)]">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <SidebarNavIcon name="quality" className="h-4 w-4" />
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-emerald-700">
                  Validación final
                </p>
                <h2 className="mt-0.5 text-sm font-semibold text-slate-950">
                  Antes de enviar
                </h2>
              </div>
            </div>

            <div className="mt-2.5 space-y-2.5">
              {[
                {
                  title: 'La solicitud quedará registrada',
                  detail: 'Podrás seguir su estado desde Solicitudes.',
                },
                {
                  title: 'Puede haber preguntas',
                  detail: 'Comercial puede pedir información adicional.',
                },
                {
                  title: 'Aún no es una cotización',
                  detail: 'Precio y condiciones se definen después.',
                },
              ].map((item) => (
                <div key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-700">
                    <svg
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                      className="h-3.5 w-3.5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m7 12 3 3 7-7" />
                    </svg>
                  </span>
                  <div>
                    <p className="text-[9px] font-semibold text-slate-900">
                      {item.title}
                    </p>
                    <p className="mt-0.5 text-[8px] leading-4 text-slate-500">
                      {item.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="border-amber-300 bg-gradient-to-r from-amber-50/90 via-white to-amber-50/65 p-3.5 shadow-none">
            <div className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-700">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.9"
                  strokeLinecap="round"
                >
                  <path d="M12 8v5" />
                  <path d="M12 17h.01" />
                  <circle cx="12" cy="12" r="9" />
                </svg>
              </span>
              <div>
                <p className="text-[8px] font-bold uppercase tracking-[0.08em] text-amber-700">
                  Si necesitas corregir algo
                </p>
                <p className="mt-1.5 text-[9px] leading-4 text-slate-700">
                  Mientras la solicitud siga en revisión podrás modificarla. Los
                  cambios quedarán en la actividad y, si afectan el análisis, la
                  revisión puede reiniciarse.
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="min-w-0 max-w-full shrink-0">{actions}</div>
      </div>
    </div>
  )
}
