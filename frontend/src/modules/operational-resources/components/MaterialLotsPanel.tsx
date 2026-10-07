import { useEffect, useMemo, useState } from 'react'
import {
  useMaterialCertificateFileActions,
  useMaterialLots,
  useMaterialMutations,
  type MaterialDto,
  type MaterialLotDto,
} from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import {
  InternalListingHeader,
  InternalListingPanel,
  InternalListingResultsBar,
} from '@/shared/components/listing/InternalListing'
import { ActionIconButton } from '@/shared/components/ui/ActionIconButton'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { formatResourceDate } from '../model/resourcePresenter'
import type { CreateMaterialLotFormValues } from '../schemas/resource.schemas'
import { CreateMaterialLotDialog } from './CreateMaterialLotDialog'
import { MaterialCertificateDialog } from './MaterialCertificateDialog'

interface MaterialLotsPanelProps {
  material: MaterialDto | null
  canManage: boolean
  highlightedLotId: number | null
}

export function MaterialLotsPanel({
  material,
  canManage,
  highlightedLotId,
}: MaterialLotsPanelProps) {
  const lotsQuery = useMaterialLots(material?.id ?? null)
  const mutations = useMaterialMutations()
  const certificateFile = useMaterialCertificateFileActions()
  const [createOpen, setCreateOpen] = useState(false)
  const [createdLotIdForRetry, setCreatedLotIdForRetry] = useState<number | null>(
    null,
  )
  const [certificateLot, setCertificateLot] = useState<MaterialLotDto | null>(
    null,
  )

  const lots = useMemo(() => lotsQuery.data ?? [], [lotsQuery.data])

  useEffect(() => {
    if (
      !highlightedLotId ||
      !lots.some((lot) => lot.id === highlightedLotId)
    ) {
      return
    }

    const timeout = window.setTimeout(() => {
      document
        .getElementById(`material-lot-${highlightedLotId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)

    return () => window.clearTimeout(timeout)
  }, [highlightedLotId, lots])

  if (!material) {
    return (
      <InternalListingPanel className="mt-0">
        <div className="p-4">
          <EmptyState
            title="Selecciona un material"
            description="Aquí verás sus lotes, proveedor, fecha de recepción, cantidad y certificado."
          />
        </div>
      </InternalListingPanel>
    )
  }

  const createLot = async (
    values: CreateMaterialLotFormValues,
    certificate: File | null,
  ) => {
    let lotId = createdLotIdForRetry

    try {
      if (!lotId) {
        const created = await mutations.createLot.mutateAsync({
          materialId: material.id,
          payload: {
            lotNumber: values.lotNumber.trim(),
            supplier: values.supplier.trim() || undefined,
            receivedAt: values.receivedAt
              ? new Date(values.receivedAt).toISOString()
              : undefined,
            quantityReceived: values.quantityReceived,
          },
        })
        lotId = created.id
        setCreatedLotIdForRetry(created.id)
      }

      if (certificate) {
        await mutations.uploadCertificate.mutateAsync({
          materialId: material.id,
          lotId,
          file: certificate,
        })
      }

      setCreatedLotIdForRetry(null)
      return true
    } catch {
      return false
    }
  }

  const closeCreate = () => {
    mutations.createLot.reset()
    mutations.uploadCertificate.reset()
    setCreatedLotIdForRetry(null)
    setCreateOpen(false)
  }

  const uploadCertificate = async (file: File) => {
    if (!certificateLot) return false

    try {
      await mutations.uploadCertificate.mutateAsync({
        materialId: material.id,
        lotId: certificateLot.id,
        file,
      })
      setCertificateLot(null)
      return true
    } catch {
      return false
    }
  }

  return (
    <InternalListingPanel className="mt-0">
      <InternalListingHeader
        eyebrow={`${material.code} · ${material.unit}`}
        title={material.name}
        description={
          <>
            <p className="line-clamp-2">
              {material.specification ?? 'Sin especificación adicional'}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {material.technicalSheetDocumentVersionId ? (
                <>
                  <Badge tone="success" className="px-2 py-0.5 text-[7px]">
                    Ficha técnica
                  </Badge>
                  {material.technicalSheetDocumentId ? (
                    <ActionIconButton
                      icon="view"
                      label={
                        certificateFile.busyLotId === material.id
                          ? 'Abriendo ficha técnica…'
                          : `Ver ficha técnica de ${material.name}`
                      }
                      tone="primary"
                      busy={certificateFile.busyLotId === material.id}
                      onClick={() =>
                        void certificateFile.open(
                          material.id,
                          material.technicalSheetDocumentId as number,
                          material.technicalSheetDocumentVersionId as number,
                        )
                      }
                    />
                  ) : null}
                </>
              ) : (
                <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
                  Sin ficha técnica
                </Badge>
              )}
            </div>
          </>
        }
        aside={
          canManage ? (
            <Button
              size="sm"
              className="!h-8 !px-3 !text-[9px]"
              onClick={() => {
                mutations.createLot.reset()
                mutations.uploadCertificate.reset()
                setCreatedLotIdForRetry(null)
                setCreateOpen(true)
              }}
            >
              Registrar lote
            </Button>
          ) : undefined
        }
      />

      {!lotsQuery.isPending && !lotsQuery.isError ? (
        <InternalListingResultsBar
          count={lots.length}
          singular="lote registrado"
          plural="lotes registrados"
        />
      ) : null}

      {certificateFile.error ? (
        <div className="px-4 pt-3">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] leading-4 text-red-700">
            {getErrorMessage(certificateFile.error)}
          </p>
        </div>
      ) : null}

      {lotsQuery.isPending ? (
        <div className="p-4">
          <LoadingState label="Cargando lotes…" />
        </div>
      ) : lotsQuery.isError ? (
        <div className="p-4">
          <ErrorState
            error={lotsQuery.error}
            title="No pudimos cargar los lotes"
          />
        </div>
      ) : lots.length === 0 ? (
        <div className="bg-slate-50/40 p-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <EmptyState
              title="Sin lotes registrados"
              description="Registra una recepción para que el material pueda utilizarse con trazabilidad en producción."
            />
          </div>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 bg-white">
          {lots.map((lot) => {
            const openingCertificate = certificateFile.busyLotId === lot.id

            return (
              <article
                id={`material-lot-${lot.id}`}
                key={lot.id}
                className={cn(
                  'scroll-mt-24 grid gap-3 px-4 py-3 transition md:grid-cols-[minmax(150px,1fr)_minmax(130px,0.8fr)_130px_minmax(190px,auto)] md:items-center',
                  highlightedLotId === lot.id &&
                    'bg-blue-50/60 ring-2 ring-inset ring-blue-100',
                )}
              >
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-semibold text-slate-950">
                    {lot.lotNumber}
                  </p>
                  <p className="mt-0.5 truncate text-[8px] text-slate-400">
                    {lot.supplier ?? 'Proveedor no especificado'}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Recepción
                  </p>
                  <p className="mt-1 text-[9px] text-slate-700">
                    {formatResourceDate(lot.receivedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
                    Cantidad
                  </p>
                  <p className="mt-1 text-[9px] font-semibold text-slate-900">
                    {lot.quantityReceived} {material.unit}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-1.5 md:justify-end">
                  {lot.certificateDocumentVersionId ? (
                    <>
                      <Badge tone="success" className="px-2 py-0.5 text-[7px]">
                        Certificado
                      </Badge>
                      {lot.certificateDocumentId ? (
                        <ActionIconButton
                          icon="view"
                          label={
                            openingCertificate
                              ? 'Abriendo certificado…'
                              : `Ver certificado del lote ${lot.lotNumber}`
                          }
                          tone="primary"
                          busy={openingCertificate}
                          onClick={() =>
                            void certificateFile.open(
                              lot.id,
                              lot.certificateDocumentId as number,
                              lot.certificateDocumentVersionId as number,
                            )
                          }
                        />
                      ) : null}
                    </>
                  ) : (
                    <Badge tone="neutral" className="px-2 py-0.5 text-[7px]">
                      Sin certificado
                    </Badge>
                  )}

                  {canManage ? (
                    <Button
                      size="sm"
                      variant={
                        lot.certificateDocumentVersionId ? 'ghost' : 'secondary'
                      }
                      className="!h-8 !px-3 !text-[9px]"
                      onClick={() => {
                        mutations.uploadCertificate.reset()
                        setCertificateLot(lot)
                      }}
                    >
                      {lot.certificateDocumentVersionId
                        ? 'Actualizar'
                        : 'Adjuntar'}
                    </Button>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      )}

      <CreateMaterialLotDialog
        material={createOpen ? material : null}
        submitting={
          mutations.createLot.isPending || mutations.uploadCertificate.isPending
        }
        error={mutations.createLot.error ?? mutations.uploadCertificate.error}
        onClose={closeCreate}
        onSubmit={createLot}
      />

      <MaterialCertificateDialog
        material={material}
        lot={certificateLot}
        submitting={mutations.uploadCertificate.isPending}
        error={mutations.uploadCertificate.error}
        onClose={() => {
          mutations.uploadCertificate.reset()
          setCertificateLot(null)
        }}
        onSubmit={uploadCertificate}
      />
    </InternalListingPanel>
  )
}
