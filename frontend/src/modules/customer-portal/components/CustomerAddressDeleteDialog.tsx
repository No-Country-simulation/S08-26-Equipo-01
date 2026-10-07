import { Button } from '@/shared/components/ui/Button'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { CustomerAddressDto } from '../types/customerCompany.types'

interface CustomerAddressDeleteDialogProps {
  address: CustomerAddressDto | null
  deleting: boolean
  error: unknown
  onClose: () => void
  onConfirm: () => void
}

export function CustomerAddressDeleteDialog({
  address,
  deleting,
  error,
  onClose,
  onConfirm,
}: CustomerAddressDeleteDialogProps) {
  if (!address) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-[2px]">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-address-delete-title"
        className="w-full max-w-md overflow-hidden rounded-2xl border border-red-100 bg-white shadow-[0_28px_90px_-32px_rgba(15,23,42,0.55)]"
      >
        <header className="border-b border-red-100 bg-gradient-to-r from-white via-white to-red-50/70 px-5 py-4">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-red-600">
            Empresa · Direcciones
          </p>
          <h2
            id="customer-address-delete-title"
            className="mt-1 text-[15px] font-semibold tracking-tight text-slate-950"
          >
            Eliminar dirección
          </h2>
          <p className="mt-1 text-[9px] leading-4 text-slate-500">
            Esta acción quitará la dirección guardada de tu empresa.
          </p>
        </header>

        <div className="px-5 py-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 px-3.5 py-3">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-semibold text-slate-900">
                {address.label}
              </p>
              {address.defaultAddress ? (
                <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[7px] font-semibold text-blue-700">
                  Predeterminada
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[8px] leading-4 text-slate-500">
              {address.address}, {address.city}, {address.state},{' '}
              {address.postalCode}
            </p>
          </div>

          <p className="mt-3 text-[9px] leading-4 text-slate-600">
            No podrás seleccionarla en nuevas solicitudes después de eliminarla.
          </p>

          {error ? (
            <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[8px] leading-4 text-red-700">
              {getErrorMessage(error)}
            </p>
          ) : null}
        </div>

        <footer className="flex items-center justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3">
          <Button
            variant="secondary"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onClose}
            disabled={deleting}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            className="!h-8 !px-3 !text-[9px]"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? 'Eliminando…' : 'Eliminar dirección'}
          </Button>
        </footer>
      </section>
    </div>
  )
}
