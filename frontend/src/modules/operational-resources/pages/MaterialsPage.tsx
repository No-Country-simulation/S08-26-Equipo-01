import { useSearchParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { MaterialsPanel } from '../components/MaterialsPanel'

function parsePositiveId(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function MaterialsPage() {
  const session = useSessionStore((state) => state.session)
  const [searchParams, setSearchParams] = useSearchParams()
  const requestedMaterialId = parsePositiveId(searchParams.get('materialId'))
  const requestedLotId = parsePositiveId(searchParams.get('lotId'))
  const roles = session?.user.roles ?? []
  const canManage = roles.includes('ADMIN') || roles.includes('PRODUCTION')

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="materials" className="h-4 w-4" />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Catálogo
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Materiales
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Administra referencias de material, sus documentos técnicos y los lotes físicos que aportan trazabilidad a Producción.
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-3">
            <p className="text-[8px] leading-4 text-slate-500">
              El material define la referencia técnica. Cada recepción se registra como un lote independiente con cantidad, proveedor y certificado propios.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <MaterialsPanel
          canManage={canManage}
          requestedMaterialId={requestedMaterialId}
          requestedLotId={requestedLotId}
          onSelectMaterial={(materialId) => {
            const next = new URLSearchParams(searchParams)
            next.set('materialId', String(materialId))
            next.delete('lotId')
            setSearchParams(next, { replace: true })
          }}
        />
      </div>
    </PageContainer>
  )
}
