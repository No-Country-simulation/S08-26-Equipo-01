import { useSearchParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { MaterialsPanel } from '../components/MaterialsPanel'
import { MachinesPanel } from '../components/MachinesPanel'
import {
  ResourceTabs,
  type ResourceTab,
} from '../components/ResourceTabs'

function parsePositiveId(value: string | null): number | null {
  if (!value) return null
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null
}

export function OperationalResourcesPage() {
  const session = useSessionStore((state) => state.session)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: ResourceTab =
    searchParams.get('tab') === 'materials' ? 'materials' : 'machines'
  const requestedMaterialId = parsePositiveId(searchParams.get('materialId'))
  const requestedLotId = parsePositiveId(searchParams.get('lotId'))
  const roles = session?.user.roles ?? []
  const canManage =
    roles.includes('ADMIN') || roles.includes('PRODUCTION')

  return (
    <PageContainer className="py-4 lg:py-3">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-white via-white to-blue-50/70 shadow-[0_16px_44px_-36px_rgba(15,23,42,0.34)]">
        <div className="px-5 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon
                name={tab === 'machines' ? 'machines' : 'materials'}
                className="h-4 w-4"
              />
            </span>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Operación
              </p>
              <h1 className="mt-0.5 text-[20px] font-bold tracking-tight text-slate-950">
                Recursos de producción
              </h1>
              <p className="mt-1 max-w-2xl text-[10px] leading-4 text-slate-500">
                Administra máquinas, referencias de material y lotes trazables
                que alimentan la ejecución real de las órdenes de trabajo.
              </p>
            </div>
          </div>

          <div className="mt-4 border-t border-slate-200/80 pt-3">
            <p className="text-[8px] leading-4 text-slate-500">
              Todos los usuarios internos pueden consultar estos recursos. Solo
              ADMIN o PRODUCTION pueden registrar nuevos elementos o cambiar su
              disponibilidad.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-4">
        <ResourceTabs
          value={tab}
          onChange={(nextTab) => {
            const next = new URLSearchParams(searchParams)
            next.set('tab', nextTab)
            if (nextTab !== 'materials') {
              next.delete('materialId')
              next.delete('lotId')
            }
            setSearchParams(next, { replace: true })
          }}
        />
      </div>

      <div className="mt-3">
        {tab === 'machines' ? (
          <MachinesPanel canManage={canManage} />
        ) : (
          <MaterialsPanel
            canManage={canManage}
            requestedMaterialId={requestedMaterialId}
            requestedLotId={requestedLotId}
            onSelectMaterial={(materialId) => {
              const next = new URLSearchParams(searchParams)
              next.set('tab', 'materials')
              next.set('materialId', String(materialId))
              next.delete('lotId')
              setSearchParams(next, { replace: true })
            }}
          />
        )}
      </div>
    </PageContainer>
  )
}
