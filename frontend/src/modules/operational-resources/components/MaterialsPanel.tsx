import { useMemo, useState } from 'react'
import { useMaterialMutations, useMaterials } from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import {
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
  InternalListingSearchInput,
} from '@/shared/components/listing/InternalListing'
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
  const [createdMaterialIdForRetry, setCreatedMaterialIdForRetry] = useState<
    number | null
  >(null)

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

  const createMaterial = async (
    values: CreateMaterialFormValues,
    technicalSheet: File | null,
  ) => {
    let materialId = createdMaterialIdForRetry

    try {
      if (!materialId) {
        const created = await mutations.create.mutateAsync({
          code: values.code.trim(),
          name: values.name.trim(),
          specification: values.specification.trim() || undefined,
          unit: values.unit.trim(),
        })
        materialId = created.id
        setCreatedMaterialIdForRetry(created.id)
      }

      if (technicalSheet) {
        await mutations.uploadTechnicalSheet.mutateAsync({
          materialId,
          file: technicalSheet,
        })
      }

      onSelectMaterial(materialId)
      setCreatedMaterialIdForRetry(null)
      return true
    } catch {
      return false
    }
  }

  const closeCreate = () => {
    mutations.create.reset()
    mutations.uploadTechnicalSheet.reset()
    setCreatedMaterialIdForRetry(null)
    setCreateOpen(false)
  }

  return (
    <>
      <div className="grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <InternalListingPanel className="mt-0 h-fit">
          <InternalListingHeader
            eyebrow="Referencias"
            title="Materiales"
            aside={
              canManage ? (
                <Button
                  size="sm"
                  className="!h-8 !px-3 !text-[9px]"
                  onClick={() => {
                    mutations.create.reset()
                    mutations.uploadTechnicalSheet.reset()
                    setCreatedMaterialIdForRetry(null)
                    setCreateOpen(true)
                  }}
                >
                  Nuevo material
                </Button>
              ) : undefined
            }
          />

          <div className="border-b border-slate-200 bg-slate-50/65 px-3 py-2.5">
            <InternalListingSearchInput
              value={search}
              onChange={setSearch}
              placeholder="Buscar código, nombre o especificación…"
              ariaLabel="Buscar material"
            />
          </div>

          <InternalListingResultsBar
            count={filtered.length}
            singular="material visible"
            plural="materiales visibles"
            onClear={search ? () => setSearch('') : undefined}
            clearLabel="Limpiar búsqueda"
          />

          {filtered.length === 0 ? (
            <div className="bg-slate-50/40 p-4">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
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
            </div>
          ) : (
            <div className="max-h-[540px] divide-y divide-slate-100 overflow-y-auto bg-white">
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
        </InternalListingPanel>

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
        submitting={
          mutations.create.isPending || mutations.uploadTechnicalSheet.isPending
        }
        error={mutations.create.error ?? mutations.uploadTechnicalSheet.error}
        onClose={closeCreate}
        onSubmit={createMaterial}
      />
    </>
  )
}
