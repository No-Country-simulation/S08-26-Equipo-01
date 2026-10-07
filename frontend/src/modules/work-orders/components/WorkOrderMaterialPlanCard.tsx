import { useEffect, useMemo, useState } from 'react'
import { useSessionStore } from '@/modules/auth'
import {
  useMaterials,
  useWorkOrderMaterialPlanMutations,
  useWorkOrderMaterialPlans,
  type WorkOrderMaterialPlanDto,
} from '@/modules/materials'
import { ActionIconButton } from '@/shared/components/ui/ActionIconButton'
import { Button } from '@/shared/components/ui/Button'
import { TextField } from '@/shared/components/ui/TextField'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import type { WorkOrderStatus } from '../types/workOrder.types'

interface WorkOrderMaterialPlanCardProps {
  workOrderId: number
  workOrderStatus: WorkOrderStatus
}

export function WorkOrderMaterialPlanCard({
  workOrderId,
  workOrderStatus,
}: WorkOrderMaterialPlanCardProps) {
  const session = useSessionStore((state) => state.session)
  const roles = session?.user.roles ?? []
  const canPlanRole =
    roles.includes('ADMIN') ||
    roles.includes('COMMERCIAL') ||
    roles.includes('ENGINEERING')
  const planningOpen =
    workOrderStatus === 'CREATED' || workOrderStatus === 'READY_FOR_PRODUCTION'
  const canEdit = canPlanRole && planningOpen

  const plansQuery = useWorkOrderMaterialPlans(workOrderId, Boolean(session))
  const materialsQuery = useMaterials(canEdit)
  const mutations = useWorkOrderMaterialPlanMutations(workOrderId)

  const [formOpen, setFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] =
    useState<WorkOrderMaterialPlanDto | null>(null)
  const [removeCandidateId, setRemoveCandidateId] = useState<number | null>(null)
  const [materialId, setMaterialId] = useState('')
  const [plannedQuantity, setPlannedQuantity] = useState('')
  const [validationError, setValidationError] = useState<string | null>(null)

  const selectedMaterial = useMemo(
    () =>
      (materialsQuery.data ?? []).find(
        (material) => material.id === Number(materialId),
      ) ?? null,
    [materialId, materialsQuery.data],
  )

  useEffect(() => {
    if (!formOpen) return

    if (editingPlan) {
      setMaterialId(String(editingPlan.materialId))
      setPlannedQuantity(String(editingPlan.plannedQuantity))
      return
    }

    setMaterialId('')
    setPlannedQuantity('')
  }, [editingPlan, formOpen])

  const closeForm = () => {
    setFormOpen(false)
    setEditingPlan(null)
    setValidationError(null)
    mutations.upsert.reset()
  }

  const openCreate = () => {
    setEditingPlan(null)
    setValidationError(null)
    mutations.upsert.reset()
    setFormOpen(true)
  }

  const openEdit = (plan: WorkOrderMaterialPlanDto) => {
    setEditingPlan(plan)
    setValidationError(null)
    mutations.upsert.reset()
    setFormOpen(true)
  }

  const save = async () => {
    const parsedMaterialId = Number(materialId)
    const quantity = Number(plannedQuantity)

    if (!Number.isInteger(parsedMaterialId) || parsedMaterialId <= 0) {
      setValidationError('Selecciona un material.')
      return
    }
    if (!Number.isFinite(quantity) || quantity <= 0) {
      setValidationError('La cantidad prevista debe ser mayor a cero.')
      return
    }

    setValidationError(null)

    try {
      await mutations.upsert.mutateAsync({
        materialId: parsedMaterialId,
        plannedQuantity: quantity,
      })
      closeForm()
    } catch {
      // The normalized request error is rendered below.
    }
  }

  const remove = async (plan: WorkOrderMaterialPlanDto) => {
    try {
      await mutations.remove.mutateAsync(plan.id)
      setRemoveCandidateId(null)
      if (editingPlan?.id === plan.id) closeForm()
    } catch {
      // The normalized request error is rendered below.
    }
  }

  const requestError = mutations.upsert.error ?? mutations.remove.error
  const plans = plansQuery.data ?? []

  return (
    <div className="border-t border-slate-100 px-4 py-3.5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-blue-600">
            Material previsto
          </p>
          <p className="mt-1 text-[8px] leading-4 text-slate-500">
            Define el material maestro antes de iniciar Producción. El lote y el
            consumo real se registran después durante la ejecución.
          </p>
        </div>

        {canEdit && !formOpen ? (
          <Button
            size="sm"
            variant="secondary"
            className="!h-7 !px-2.5 !text-[8px]"
            onClick={openCreate}
          >
            Añadir material
          </Button>
        ) : null}
      </div>

      {plansQuery.isLoading ? (
        <p className="mt-3 text-[8px] text-slate-400">Cargando material previsto…</p>
      ) : plans.length === 0 ? (
        <div className="mt-3 rounded-lg border border-dashed border-slate-300 bg-slate-50/70 px-3 py-2.5">
          <p className="text-[8px] font-semibold text-slate-700">
            Aún no hay material previsto para esta orden.
          </p>
          <p className="mt-0.5 text-[7px] leading-3.5 text-slate-400">
            Puedes definirlo antes o después de liberar la hoja de ruta, siempre
            que la producción todavía no haya iniciado.
          </p>
        </div>
      ) : (
        <div className="mt-3 grid gap-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              className="flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50/60 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-[9px] font-semibold text-slate-900">
                  {plan.materialCode} · {plan.materialName}
                </p>
                <p className="mt-0.5 text-[7px] text-slate-500">
                  Cantidad prevista: {plan.plannedQuantity} {plan.unit}
                </p>
              </div>

              {canEdit ? (
                <div className="flex items-center gap-1.5">
                  <ActionIconButton
                    icon="edit"
                    label={`Editar material previsto ${plan.materialCode}`}
                    tone="primary"
                    onClick={() => openEdit(plan)}
                  />
                  {removeCandidateId === plan.id ? (
                    <>
                      <Button
                        size="sm"
                        variant="danger"
                        className="!h-[26px] !px-2 !text-[7.5px]"
                        disabled={mutations.remove.isPending}
                        onClick={() => void remove(plan)}
                      >
                        Confirmar
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="!h-[26px] !px-2 !text-[7.5px]"
                        disabled={mutations.remove.isPending}
                        onClick={() => setRemoveCandidateId(null)}
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <ActionIconButton
                      icon="delete"
                      label={`Quitar material previsto ${plan.materialCode}`}
                      tone="danger"
                      disabled={mutations.remove.isPending}
                      onClick={() => setRemoveCandidateId(plan.id)}
                    />
                  )}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      )}

      {formOpen ? (
        <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50/35 p-3">
          <div className="grid gap-3 sm:grid-cols-[minmax(260px,420px)_160px] sm:justify-start">
            <div>
              <label
                htmlFor="planned-material"
                className="mb-1.5 block text-[10px] font-semibold text-slate-800"
              >
                Material
              </label>
              <select
                id="planned-material"
                value={materialId}
                disabled={editingPlan !== null || materialsQuery.isLoading}
                onChange={(event) => setMaterialId(event.target.value)}
                className="h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 text-[8px] font-normal leading-none text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100 [&>option]:text-[8px]"
              >
                <option value="">Selecciona un material</option>
                {(materialsQuery.data ?? []).map((material) => (
                  <option key={material.id} value={material.id}>
                    {material.code} · {material.name}
                  </option>
                ))}
              </select>
            </div>

            <TextField
              label={`Cantidad prevista${selectedMaterial ? ` (${selectedMaterial.unit})` : ''}`}
              type="number"
              min="0.001"
              step="0.001"
              value={plannedQuantity}
              onChange={(event) => setPlannedQuantity(event.target.value)}
              labelClassName="!mb-1.5 !text-[10px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none"
            />
          </div>

          {validationError ? (
            <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[8px] text-amber-800">
              {validationError}
            </p>
          ) : null}

          {requestError ? (
            <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[8px] text-red-700">
              {getErrorMessage(requestError)}
            </p>
          ) : null}

          <div className="mt-3 flex justify-end gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              disabled={mutations.upsert.isPending}
              onClick={closeForm}
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              className="!h-7 !px-2.5 !text-[8px]"
              disabled={mutations.upsert.isPending}
              onClick={() => void save()}
            >
              {mutations.upsert.isPending
                ? 'Guardando…'
                : editingPlan
                  ? 'Guardar cambio'
                  : 'Guardar material'}
            </Button>
          </div>
        </div>
      ) : null}

      {!planningOpen && plans.length > 0 ? (
        <p className="mt-3 text-[7px] leading-3.5 text-slate-400">
          El plan de material quedó congelado al iniciar Producción.
        </p>
      ) : null}
    </div>
  )
}
