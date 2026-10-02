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
      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
        <EmptyState
          title="Selecciona un material"
          description="Aquí verás sus lotes, proveedor, fecha de recepción, cantidad y certificado."
        />
      </section>
    )
  }

  const createLot = async (values: CreateMaterialLotFormValues) => {
    try {
      await mutations.createLot.mutateAsync({
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
      return true
    } catch {
      return false
    }
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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_14px_40px_-32px_rgba(15,23,42,0.34)]">
      <div className="flex flex-col gap-2.5 border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            {material.code} · {material.unit}
          </p>
          <h2 className="mt-0.5 truncate text-[12px] font-semibold text-slate-950">
            {material.name}
          </h2>
          <p className="mt-0.5 line-clamp-2 text-[8px] leading-4 text-slate-400">
            {material.specification ?? 'Sin especificación adicional'}
          </p>
        </div>

        {canManage ? (
          <Button
            size="sm"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={() => {
              mutations.createLot.reset()
              setCreateOpen(true)
            }}
          >
            Registrar lote
          </Button>
        ) : null}
      </div>

      {!lotsQuery.isPending && !lotsQuery.isError ? (
        <div className="border-b border-slate-100 bg-slate-50/45 px-4 py-2">
          <p className="text-[7px] font-medium text-slate-400">
            {lots.length} {lots.length === 1 ? 'lote registrado' : 'lotes registrados'}
          </p>
        </div>
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
        <div className="p-4">
          <EmptyState
            title="Sin lotes registrados"
            description="Registra una recepción para que el material pueda utilizarse con trazabilidad en producción."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {lots.map((lot) => (
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
                      <Button
                        size="sm"
                        variant="secondary"
                        className="!h-7 !px-2 !text-[8px]"
                        disabled={certificateFile.busyLotId === lot.id}
                        onClick={() =>
                          void certificateFile.open(
                            lot.id,
                            lot.certificateDocumentId as number,
                            lot.certificateDocumentVersionId as number,
                          )
                        }
                      >
                        {certificateFile.busyLotId === lot.id
                          ? 'Abriendo…'
                          : 'Ver'}
                      </Button>
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
                    className="!h-7 !px-2 !text-[8px]"
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
          ))}
        </div>
      )}

      <CreateMaterialLotDialog
        material={createOpen ? material : null}
        submitting={mutations.createLot.isPending}
        error={mutations.createLot.error}
        onClose={() => {
          mutations.createLot.reset()
          setCreateOpen(false)
        }}
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
    </section>
  )
}
