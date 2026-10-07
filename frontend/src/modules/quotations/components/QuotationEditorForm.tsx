import { useEffect, useState, type ReactNode } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import { formatQuotationDate } from '../model/quotationPresenter'
import {
  calculateQuotationTotals,
  createQuotationFormValues,
  getSendValidationMessage,
  quotationDraftSchema,
  toUpdateQuotationPayload,
  type QuotationFormValues,
  type QuotationPreviewData,
} from '../schemas/quotation.schema'
import type {
  QuotationDetailDto,
  UpdateQuotationPayload,
} from '../types/quotation.types'
import { QuotationItemsEditor } from './QuotationItemsEditor'
import { QuotationTotalsCard } from './QuotationTotalsCard'

interface QuotationEditorFormProps {
  quotation: QuotationDetailDto
  editable: boolean
  saving: boolean
  sending: boolean
  onSave: (payload: UpdateQuotationPayload) => Promise<void>
  onSend: (
    payload: UpdateQuotationPayload,
    adjustmentResponse: string | null,
    preview: QuotationPreviewData,
  ) => Promise<void> | void
  onPreview: (preview: QuotationPreviewData) => void
  sidebarContent?: ReactNode
}

export function QuotationEditorForm({
  quotation,
  editable,
  saving,
  sending,
  onSave,
  onSend,
  onPreview,
  sidebarContent,
}: QuotationEditorFormProps) {
  const [actionError, setActionError] = useState<string | null>(null)
  const [adjustmentDialogOpen, setAdjustmentDialogOpen] = useState(false)
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationDraftSchema),
    defaultValues: createQuotationFormValues(quotation),
  })

  useEffect(() => {
    reset(createQuotationFormValues(quotation))
  }, [quotation, reset])

  const items = useWatch({ control, name: 'items' })
  const taxRate = useWatch({ control, name: 'taxRate' })
  const currency = useWatch({ control, name: 'currency' })
  const validUntil = useWatch({ control, name: 'validUntil' })
  const estimatedDeliveryDate = useWatch({
    control,
    name: 'estimatedDeliveryDate',
  })
  const adjustmentResponse = useWatch({
    control,
    name: 'adjustmentResponse',
  })
  const totals = calculateQuotationTotals({ items, taxRate })
  const requiresAdjustmentResponse = Boolean(quotation.adjustmentNotes)

  const save = handleSubmit(async (values) => {
    setActionError(null)
    await onSave(toUpdateQuotationPayload(values))
  })

  const send = handleSubmit(async (values) => {
    const message = getSendValidationMessage(values, requiresAdjustmentResponse)

    if (message) {
      setActionError(message)
      return
    }

    setActionError(null)
    await onSend(
      toUpdateQuotationPayload(values),
      values.adjustmentResponse.trim() || null,
      {
        ...values,
        totals: calculateQuotationTotals(values),
      },
    )
  })

  const preview = handleSubmit((values) => {
    setActionError(null)
    onPreview({
      ...values,
      totals: calculateQuotationTotals(values),
    })
  })

  return (
    <form
      className="grid gap-4 lg:grid-cols-[minmax(0,1.55fr)_minmax(285px,0.65fr)] lg:items-stretch"
      onSubmit={(event) => event.preventDefault()}
    >
      <section className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_35px_-30px_rgba(15,23,42,0.3)]">
        <div className="border-b border-blue-100 bg-gradient-to-r from-white via-white to-blue-50/50 px-4 py-2.5">
          <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-blue-600">
            Documento comercial
          </p>
          <h2 className="mt-0.5 text-[13px] font-semibold text-slate-950">
            Información comercial
          </h2>
          <p className="mt-0.5 text-[8px] text-slate-500">
            Define los términos económicos y el alcance que verá el cliente.
          </p>
        </div>

        <div className="flex min-h-0 flex-1 flex-col p-3.5">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <TextField
              label="Moneda"
              maxLength={3}
              disabled={!editable}
              labelClassName="!mb-1 !text-[8px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[9px] !uppercase !shadow-none"
              error={errors.currency?.message}
              {...register('currency')}
            />
            <TextField
              label="Válida hasta"
              type="date"
              disabled={!editable}
              labelClassName="!mb-1 !text-[8px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
              error={errors.validUntil?.message}
              {...register('validUntil')}
            />
            <TextField
              label="Entrega estimada"
              type="date"
              disabled={!editable}
              labelClassName="!mb-1 !text-[8px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
              error={errors.estimatedDeliveryDate?.message}
              {...register('estimatedDeliveryDate')}
            />
            <TextField
              label="Impuesto (%)"
              type="number"
              min="0"
              max="100"
              step="0.0001"
              disabled={!editable}
              labelClassName="!mb-1 !text-[8px]"
              className="!h-8 !rounded-lg !px-2.5 !text-[9px] !shadow-none"
              error={errors.taxRate?.message}
              {...register('taxRate', { valueAsNumber: true })}
            />
          </div>

          <p className="mt-1.5 text-[7px] leading-3.5 text-slate-400">
            La fecha solicitada por el cliente es{' '}
            <span className="font-medium text-slate-500">
              {formatQuotationDate(quotation.source.requestedDeliveryDate)}
            </span>
            ; la entrega estimada es el compromiso incluido en esta propuesta.
          </p>

          {quotation.adjustmentNotes ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/65 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-amber-700">
                    Ajuste solicitado por el cliente
                  </p>
                  <p className="mt-1 text-[9px] leading-4 text-slate-700">
                    {quotation.adjustmentNotes}
                  </p>
                  {adjustmentResponse?.trim() ? (
                    <p className="mt-2 line-clamp-2 text-[8px] leading-4 text-emerald-700">
                      Respuesta preparada: {adjustmentResponse.trim()}
                    </p>
                  ) : (
                    <p className="mt-2 text-[8px] text-amber-700">
                      Falta registrar la respuesta antes de enviar la nueva
                      revisión.
                    </p>
                  )}
                </div>

                {editable ? (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="!h-7 shrink-0 !px-2.5 !text-[8px]"
                    onClick={() => setAdjustmentDialogOpen(true)}
                  >
                    {adjustmentResponse?.trim()
                      ? 'Editar respuesta'
                      : 'Responder ajuste'}
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-3 min-h-0 flex-1">
            <QuotationItemsEditor
              control={control}
              register={register}
              errors={errors}
              editable={editable}
              currency={currency}
            />
          </div>
        </div>

        {editable ? (
          <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-3.5 py-2.5">
            <Button
              size="sm"
              variant="secondary"
              className="!h-7 !px-2.5 !text-[8px]"
              onClick={() => void save()}
              disabled={saving || sending}
            >
              {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        ) : null}
      </section>

      <div className="flex h-full min-h-0 flex-col gap-3 lg:sticky lg:top-[88px]">
        <QuotationTotalsCard
          totals={totals}
          currency={currency}
          taxRate={taxRate}
          validUntil={validUntil}
          estimatedDeliveryDate={estimatedDeliveryDate}
          editable={editable}
          saving={saving}
          sending={sending}
          actionError={actionError}
          sendLabel={
            quotation.adjustmentNotes
              ? 'Revisar y enviar nueva revisión'
              : 'Revisar y enviar'
          }
          onPreview={() => void preview()}
          onSend={() => void send()}
        />

        {sidebarContent}
      </div>

      {adjustmentDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="quotation-adjustment-response-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="border-b border-amber-100 bg-gradient-to-r from-white via-white to-amber-50/70 px-5 py-4">
              <p className="text-[8px] font-bold uppercase tracking-[0.12em] text-amber-700">
                Solicitud del cliente
              </p>
              <h2
                id="quotation-adjustment-response-title"
                className="mt-1 text-base font-semibold text-slate-950"
              >
                Responder al ajuste
              </h2>
              <p className="mt-1.5 text-[10px] leading-5 text-slate-600">
                {quotation.adjustmentNotes}
              </p>
            </div>

            <div className="px-5 py-4">
              <TextareaField
                id="quotation-adjustment-response"
                label="Respuesta comercial"
                placeholder="Explica qué puede ajustarse y cuál será la nueva propuesta."
                labelClassName="!mb-1.5 !text-[10px]"
                className="!min-h-28 !rounded-lg !px-3 !py-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
                hint="Esta respuesta acompañará la nueva revisión de la cotización."
                error={errors.adjustmentResponse?.message}
                autoFocus
                {...register('adjustmentResponse')}
              />
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 bg-slate-50/70 px-5 py-3.5">
              <Button
                size="sm"
                variant="ghost"
                className="!h-8 !px-3 !text-[9px]"
                onClick={() => setAdjustmentDialogOpen(false)}
              >
                Cerrar
              </Button>
              <Button
                size="sm"
                className="!h-8 !px-3 !text-[9px]"
                onClick={() => setAdjustmentDialogOpen(false)}
                disabled={!adjustmentResponse?.trim()}
              >
                Guardar respuesta
              </Button>
            </div>
          </section>
        </div>
      ) : null}
    </form>
  )
}
