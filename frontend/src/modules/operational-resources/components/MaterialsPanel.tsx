import { useMemo, useState } from 'react'
import { useMaterialMutations, useMaterials } from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type { CreateMaterialFormValues } from '../schemas/resource.schemas'
import { CreateMaterialDialog } from './CreateMaterialDialog'
import { MaterialLotsPanel } from './MaterialLotsPanel'

interface MaterialsPanelProps {
  canManage: boolean
  requestedMaterialId: number | null
  requestedLotId: number | null
  onSelectMaterial: (materialId: number) => void
}

export function MaterialsPanel({
  canManage,
  requestedMaterialId,
  requestedLotId,
  onSelectMaterial,
}: MaterialsPanelProps) {
  const query = useMaterials()
  const mutations = useMaterialMutations()
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)

  const materials = useMemo(() => query.data ?? [], [query.data])

  const selectedMaterial = useMemo(() => {
    if (requestedMaterialId) {
      const requested = materials.find(
        (material) => material.id === requestedMaterialId,
      )
      if (requested) return requested
    }

    return materials[0] ?? null
  }, [materials, requestedMaterialId])

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase()
    if (!term) return materials

    return materials.filter((material) =>
      [
        material.code,
        material.name,
        material.specification ?? '',
        material.unit,
      ].some((value) => value.toLocaleLowerCase().includes(term)),
    )
  }, [materials, search])

  if (query.isPending) return <LoadingState label="Cargando materiales…" />

  if (query.isError) {
    return (
      <ErrorState error={query.error} title="No pudimos cargar los materiales" />
    )
  }

  const createMaterial = async (values: CreateMaterialFormValues) => {
    try {
      const created = await mutations.create.mutateAsync({
        code: values.code.trim(),
        name: values.name.trim(),
        specification: values.specification.trim() || undefined,
        unit: values.unit.trim(),
      })
      onSelectMaterial(created.id)
      return true
    } catch {
      return false
    }
  }

  return (
    <>
      <div className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="h-fit overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
          <div className="flex items-center justify-between gap-3 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3">
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
                Referencias
              </p>
              <h2 className="mt-0.5 text-[12px] font-semibold text-slate-950">
                Materiales
              </h2>
              <p className="mt-0.5 text-[8px] text-slate-400">
                {materials.length} registrados
              </p>
            </div>

            {canManage ? (
              <Button
                size="sm"
                className="!h-7 !px-2.5 !text-[8px]"
                onClick={() => {
                  mutations.create.reset()
                  setCreateOpen(true)
                }}
              >
                Nuevo material
              </Button>
            ) : null}
          </div>

          <div className="border-b border-slate-100 bg-slate-50/55 px-3 py-2.5">
            <label className="relative block">
              <span className="sr-only">Buscar material</span>
              <svg
                viewBox="0 0 24 24"
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar código, nombre o especificación…"
                className="h-9 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-[10px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>
          </div>

          {filtered.length === 0 ? (
            <div className="p-4">
              <EmptyState
                title={
                  materials.length === 0
                    ? 'Sin materiales registrados'
                    : 'Sin coincidencias'
                }
                description={
                  materials.length === 0
                    ? 'Registra una referencia antes de capturar sus lotes.'
                    : 'Ajusta la búsqueda para encontrar otra referencia.'
                }
              />
            </div>
          ) : (
            <div className="max-h-[540px] divide-y divide-slate-100 overflow-y-auto">
              {filtered.map((material) => (
                <button
                  key={material.id}
                  type="button"
                  onClick={() => onSelectMaterial(material.id)}
                  className={cn(
                    'w-full px-4 py-3 text-left transition',
                    selectedMaterial?.id === material.id
                      ? 'bg-blue-50/70'
                      : 'hover:bg-slate-50',
                  )}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-[10px] font-semibold text-slate-950">
                        {material.code} · {material.name}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-[8px] leading-4 text-slate-400">
                        {material.specification ??
                          'Sin especificación adicional'}
                      </p>
                    </div>
                    <Badge
                      tone="neutral"
                      className="shrink-0 px-2 py-0.5 text-[7px]"
                    >
                      {material.unit}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          )}
        </section>

        <MaterialLotsPanel
          material={selectedMaterial}
          canManage={canManage}
          highlightedLotId={
            selectedMaterial?.id === requestedMaterialId
              ? requestedLotId
              : null
          }
        />
      </div>

      <CreateMaterialDialog
        open={createOpen}
        submitting={mutations.create.isPending}
        error={mutations.create.error}
        onClose={() => {
          mutations.create.reset()
          setCreateOpen(false)
        }}
        onSubmit={createMaterial}
      />
    </>
  )
}
