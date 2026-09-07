import type { CreateRequestTemplateProps } from '../../types/props'
import { RequestForm } from '../organisms/RequestForm'

export const CreateRequestTemplate = ({
  onSubmit,
  isSubmitting,
  submitError,
  onCancel,
}: CreateRequestTemplateProps) => {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Nueva solicitud de producto</h1>
        <p className="text-base-content/70">
          Completa los datos del producto que necesitas
        </p>
      </header>

      <RequestForm
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        submitError={submitError}
        onCancel={onCancel}
      />
    </div>
  )
}