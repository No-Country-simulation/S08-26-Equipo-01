import { useState } from 'react'
import { getCustomerDeliveryEvidenceContent } from '../api/customerDeliveries.api'
import type { CustomerDeliveryDto } from '../types/customerDelivery.types'

function scheduleUrlRelease(url: string) {
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

function fallbackFileName(delivery: CustomerDeliveryDto): string {
  return delivery.evidenceFileName ?? `evidencia-entrega-${delivery.id}`
}

export function useCustomerDeliveryEvidence(
  customerId: number,
  requestId: number,
) {
  const [busyDeliveryId, setBusyDeliveryId] = useState<number | null>(null)
  const [error, setError] = useState<unknown>(null)

  const openEvidence = async (delivery: CustomerDeliveryDto) => {
    if (
      delivery.evidenceDocumentId === null ||
      delivery.evidenceDocumentVersionId === null
    ) {
      return
    }

    const previewWindow = window.open('', '_blank')
    if (previewWindow) {
      previewWindow.opener = null
      previewWindow.document.title = 'Cargando evidencia…'
      previewWindow.document.body.textContent = 'Cargando evidencia…'
    }

    setBusyDeliveryId(delivery.id)
    setError(null)

    try {
      const blob = await getCustomerDeliveryEvidenceContent(
        customerId,
        requestId,
        delivery.evidenceDocumentId,
        delivery.evidenceDocumentVersionId,
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
      setBusyDeliveryId(null)
    }
  }

  const downloadEvidence = async (delivery: CustomerDeliveryDto) => {
    if (
      delivery.evidenceDocumentId === null ||
      delivery.evidenceDocumentVersionId === null
    ) {
      return
    }

    setBusyDeliveryId(delivery.id)
    setError(null)

    try {
      const blob = await getCustomerDeliveryEvidenceContent(
        customerId,
        requestId,
        delivery.evidenceDocumentId,
        delivery.evidenceDocumentVersionId,
        true,
      )
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = fallbackFileName(delivery)
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      URL.revokeObjectURL(url)
    } catch (requestError) {
      setError(requestError)
    } finally {
      setBusyDeliveryId(null)
    }
  }

  return {
    busyDeliveryId,
    error,
    openEvidence,
    downloadEvidence,
  }
}
