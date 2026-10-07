import { z } from 'zod'
import type {
  QuotationDetailDto,
  UpdateQuotationPayload,
} from '../types/quotation.types'

const quotationItemSchema = z.object({
  id: z.number().positive().optional(),
  description: z
    .string()
    .trim()
    .min(1, 'La descripción es obligatoria.')
    .max(1000, 'La descripción no puede superar 1000 caracteres.'),
  quantity: z
    .number({ error: 'La cantidad es obligatoria.' })
    .positive('La cantidad debe ser mayor que cero.'),
  unitPrice: z
    .number({ error: 'El precio unitario es obligatorio.' })
    .min(0, 'El precio unitario no puede ser negativo.'),
})

export const quotationDraftSchema = z.object({
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/, 'Usa un código de moneda de 3 letras.'),
  taxRate: z
    .number({ error: 'La tasa de impuesto es obligatoria.' })
    .min(0, 'La tasa no puede ser negativa.')
    .max(100, 'La tasa no puede superar 100%.'),
  validUntil: z.string(),
  estimatedDeliveryDate: z.string(),
  adjustmentResponse: z
    .string()
    .max(2000, 'La respuesta no puede superar 2000 caracteres.'),
  items: z
    .array(quotationItemSchema)
    .max(100, 'La cotización no puede contener más de 100 conceptos.'),
})

export type QuotationFormValues = z.infer<typeof quotationDraftSchema>

export interface QuotationFormTotals {
  subtotal: number
  tax: number
  total: number
}

export interface QuotationPreviewData extends QuotationFormValues {
  totals: QuotationFormTotals
}

export function createQuotationFormValues(
  quotation: QuotationDetailDto,
): QuotationFormValues {
  return {
    currency: quotation.currency,
    taxRate: quotation.taxRate,
    validUntil: quotation.validUntil ?? '',
    estimatedDeliveryDate: quotation.estimatedDeliveryDate ?? '',
    adjustmentResponse: quotation.adjustmentResponse ?? '',
    items: quotation.items.map((item) => ({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  }
}

export function calculateQuotationTotals(
  values: Pick<QuotationFormValues, 'items' | 'taxRate'>,
): QuotationFormTotals {
  const subtotal = values.items.reduce(
    (sum, item) =>
      sum +
      (Number.isFinite(item.quantity) ? item.quantity : 0) *
        (Number.isFinite(item.unitPrice) ? item.unitPrice : 0),
    0,
  )
  const taxRate = Number.isFinite(values.taxRate) ? values.taxRate : 0
  const tax = subtotal * (taxRate / 100)

  return {
    subtotal,
    tax,
    total: subtotal + tax,
  }
}

export function toUpdateQuotationPayload(
  values: QuotationFormValues,
): UpdateQuotationPayload {
  return {
    currency: values.currency.trim().toUpperCase(),
    taxRate: values.taxRate,
    validUntil: values.validUntil || null,
    estimatedDeliveryDate: values.estimatedDeliveryDate || null,
    items: values.items.map((item) => ({
      ...(item.id ? { id: item.id } : {}),
      description: item.description.trim(),
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
  }
}

export function getSendValidationMessage(
  values: QuotationFormValues,
  requiresAdjustmentResponse: boolean,
): string | null {
  if (values.items.length === 0) {
    return 'Agrega al menos un concepto antes de enviar la cotización.'
  }

  if (!values.validUntil) {
    return 'Define la vigencia antes de enviar la cotización.'
  }

  if (!values.estimatedDeliveryDate) {
    return 'Define la fecha estimada de entrega antes de enviar.'
  }

  if (
    requiresAdjustmentResponse &&
    values.adjustmentResponse.trim().length === 0
  ) {
    return 'Responde la solicitud de ajuste antes de enviar la nueva revisión.'
  }

  return null
}
