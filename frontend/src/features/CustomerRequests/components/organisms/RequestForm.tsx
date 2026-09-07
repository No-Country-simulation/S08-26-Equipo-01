import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import {
  createRequestSchema,
  type CreateRequestFormValues,
} from '../../schemas/createRequestSchema'
import type { RequestFormProps } from '../../types/props'

export const RequestForm = ({
  onSubmit,
  isSubmitting,
  submitError,
  onCancel,
}: RequestFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateRequestFormValues>({
    resolver: zodResolver(createRequestSchema),
    defaultValues: {
      description: '',
      quantity: 0,
      requestDeliveryDate: '',
    },
  })

  return (
    <form
      className="card max-w-2xl bg-base-100 shadow-xl"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="card-body gap-4">
        <div className="form-control">
          <label className="label" htmlFor="description">
            <span className="label-text">Descripción del producto</span>
          </label>
          <textarea
            id="description"
            className={`textarea textarea-bordered ${errors.description ? 'textarea-error' : ''}`}
            placeholder="Ej.: piezas de mecanizado, material, plano o especificación"
            rows={4}
            {...register('description')}
          />
          {errors.description && (
            <span className="label-text-alt mt-1 text-error">
              {errors.description.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="form-control">
            <label className="label" htmlFor="quantity">
              <span className="label-text">Cantidad</span>
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              step={1}
              className={`input input-bordered ${errors.quantity ? 'input-error' : ''}`}
              {...register('quantity', { valueAsNumber: true })}
            />
            {errors.quantity && (
              <span className="label-text-alt mt-1 text-error">
                {errors.quantity.message}
              </span>
            )}
          </div>

          <div className="form-control">
            <label className="label" htmlFor="requestDeliveryDate">
              <span className="label-text">Fecha de entrega solicitada</span>
            </label>
            <input
              id="requestDeliveryDate"
              type="date"
              className={`input input-bordered ${errors.requestDeliveryDate ? 'input-error' : ''}`}
              {...register('requestDeliveryDate')}
            />
            {errors.requestDeliveryDate && (
              <span className="label-text-alt mt-1 text-error">
                {errors.requestDeliveryDate.message}
              </span>
            )}
          </div>
        </div>

        {submitError && (
          <div role="alert" className="alert alert-error text-sm">
            {submitError}
          </div>
        )}

        <div className="card-actions mt-2 justify-end">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              'Enviar solicitud'
            )}
          </button>
        </div>
      </div>
    </form>
  )
}