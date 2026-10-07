import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMaterial,
  createMaterialLot,
  getMaterialCertificateContent,
  getMaterialLots,
  getMaterials,
  getWorkOrderMaterialPlans,
  removeWorkOrderMaterialPlan,
  upsertWorkOrderMaterialPlan,
  uploadMaterialLotCertificate,
  uploadMaterialTechnicalSheet,
} from '../api/materials.api'
import type {
  CreateMaterialLotPayload,
  CreateMaterialPayload,
  UpsertWorkOrderMaterialPlanPayload,
} from '../types/material.types'

export const materialKeys = {
  all: ['materials'] as const,
  list: () => [...materialKeys.all, 'list'] as const,
  lots: (materialId: number | null) =>
    [...materialKeys.all, 'lots', materialId] as const,
  workOrderPlan: (workOrderId: number) =>
    [...materialKeys.all, 'work-order-plan', workOrderId] as const,
}

export function useMaterials(enabled = true) {
  return useQuery({
    queryKey: materialKeys.list(),
    queryFn: getMaterials,
    enabled,
  })
}

export function useMaterialLots(materialId: number | null) {
  return useQuery({
    queryKey: materialKeys.lots(materialId),
    queryFn: () => getMaterialLots(materialId as number),
    enabled: materialId !== null,
  })
}

export function useWorkOrderMaterialPlans(
  workOrderId: number,
  enabled = true,
) {
  return useQuery({
    queryKey: materialKeys.workOrderPlan(workOrderId),
    queryFn: () => getWorkOrderMaterialPlans(workOrderId),
    enabled,
  })
}

export function useWorkOrderMaterialPlanMutations(workOrderId: number) {
  const queryClient = useQueryClient()

  const invalidatePlan = async () => {
    await queryClient.invalidateQueries({
      queryKey: materialKeys.workOrderPlan(workOrderId),
    })
  }

  const upsert = useMutation({
    mutationFn: (payload: UpsertWorkOrderMaterialPlanPayload) =>
      upsertWorkOrderMaterialPlan(workOrderId, payload),
    onSuccess: invalidatePlan,
  })

  const remove = useMutation({
    mutationFn: (planId: number) =>
      removeWorkOrderMaterialPlan(workOrderId, planId),
    onSuccess: invalidatePlan,
  })

  return { upsert, remove }
}

export function useMaterialMutations() {
  const queryClient = useQueryClient()

  const create = useMutation({
    mutationFn: (payload: CreateMaterialPayload) => createMaterial(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: materialKeys.list() })
    },
  })

  const uploadTechnicalSheet = useMutation({
    mutationFn: ({ materialId, file }: { materialId: number; file: File }) =>
      uploadMaterialTechnicalSheet(materialId, file),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: materialKeys.list() }),
        queryClient.invalidateQueries({ queryKey: ['document-center'] }),
      ])
    },
  })

  const createLot = useMutation({
    mutationFn: ({
      materialId,
      payload,
    }: {
      materialId: number
      payload: CreateMaterialLotPayload
    }) => createMaterialLot(materialId, payload),
    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: materialKeys.lots(variables.materialId),
      })
    },
  })

  const uploadCertificate = useMutation({
    mutationFn: ({
      materialId,
      lotId,
      file,
    }: {
      materialId: number
      lotId: number
      file: File
    }) => uploadMaterialLotCertificate(materialId, lotId, file),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: materialKeys.lots(variables.materialId),
        }),
        queryClient.invalidateQueries({ queryKey: ['document-center'] }),
      ])
    },
  })

  return { create, uploadTechnicalSheet, createLot, uploadCertificate }
}

function scheduleUrlRelease(url: string) {
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function useMaterialCertificateFileActions() {
  const [busyLotId, setBusyLotId] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)

  const open = async (
    lotId: number,
    documentId: number,
    versionId: number,
  ) => {
    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.opener = null
      previewWindow.document.title = 'Cargando certificado…'
      previewWindow.document.body.textContent = 'Cargando certificado…'
    }

    setBusyLotId(lotId)
    setError(null)

    try {
      const blob = await getMaterialCertificateContent(
        documentId,
        versionId,
        false,
      )
      const url = URL.createObjectURL(blob)

      if (previewWindow) {
        previewWindow.location.replace(url)
      } else {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.target = '_blank'
        anchor.rel = 'noopener noreferrer'
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
      }

      scheduleUrlRelease(url)
    } catch (requestError) {
      previewWindow?.close()
      setError(requestError)
    } finally {
      setBusyLotId(null)
    }
  }

  return { busyLotId, error, open }
}
