import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { SidebarNavIcon } from '@/shared/components/navigation/SidebarNavIcon'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { CustomerRequestDeliveryStep } from '../components/CustomerRequestDeliveryStep'
import { CustomerRequestDetailsStep } from '../components/CustomerRequestDetailsStep'
import { LeaveCustomerRequestDialog } from '../components/LeaveCustomerRequestDialog'
import { CustomerRequestRequirementsStep } from '../components/CustomerRequestRequirementsStep'
import { CustomerRequestReviewStep } from '../components/CustomerRequestReviewStep'
import { CustomerRequestStepActions } from '../components/CustomerRequestStepActions'
import { CustomerRequestsBackButton } from '../components/CustomerRequestsBackButton'
import { CustomerRequestWizardSteps } from '../components/CustomerRequestWizardSteps'
import { useCustomerAddresses } from '../hooks/useCustomerCompany'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'
import { useSubmitCustomerRequest } from '../hooks/useCustomerRequestMutations'
import {
  customerRequestFormSchema,
  type CustomerRequestFormValues,
} from '../schemas/customerRequest.schemas'
import type { RequestDocumentUpload } from '../types/customerRequest.types'

export function CustomerRequestCreatePage() {
  const { customer } = useCustomerPortalContext()
  const navigate = useNavigate()
  const mutation = useSubmitCustomerRequest(customer.customerId)
  const addressesQuery = useCustomerAddresses(customer.customerId)
  const [step, setStep] = useState(0)
  const [documents, setDocuments] = useState<RequestDocumentUpload[]>([])
  const [documentError, setDocumentError] = useState<string | null>(null)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const deliveryDefaultsInitialized = useRef(false)

  const {
    register,
    handleSubmit,
    trigger,
    control,
    getValues,
    setValue,
    formState: { errors, isDirty },
  } = useForm<CustomerRequestFormValues>({
    resolver: zodResolver(customerRequestFormSchema),
    defaultValues: {
      title: '',
      description: '',
      quantity: 1,
      requestedDeliveryDate: '',
      customerReference: '',
      materialRequirementType: 'SPECIFIED',
      materialRequirement: '',
      deliveryMode: 'DEFINE_LATER',
      customerAddressId: '',
      deliveryLabel: '',
      deliveryAddress: '',
      deliveryCity: '',
      deliveryState: '',
      deliveryPostalCode: '',
      deliveryCountry: 'México',
      deliveryContactName: '',
      deliveryContactPhone: '',
      deliveryInstructions: '',
    },
  })

  const materialRequirementType = useWatch({
    control,
    name: 'materialRequirementType',
  })
  const deliveryMode = useWatch({
    control,
    name: 'deliveryMode',
  })
  const selectedAddressId = useWatch({
    control,
    name: 'customerAddressId',
  })
  useEffect(() => {
    if (
      deliveryDefaultsInitialized.current ||
      addressesQuery.isPending ||
      addressesQuery.isError
    ) {
      return
    }

    deliveryDefaultsInitialized.current = true
    const addresses = addressesQuery.data ?? []
    const preferred =
      addresses.find((address) => address.defaultAddress) ?? addresses.at(0)

    if (preferred) {
      setValue('deliveryMode', 'SAVED_ADDRESS', { shouldDirty: false })
      setValue('customerAddressId', String(preferred.id), {
        shouldDirty: false,
      })
      setValue('deliveryContactName', preferred.contactName ?? '', {
        shouldDirty: false,
      })
      setValue('deliveryContactPhone', preferred.contactPhone ?? '', {
        shouldDirty: false,
      })
      setValue(
        'deliveryInstructions',
        preferred.deliveryInstructions ?? '',
        { shouldDirty: false },
      )
      return
    }

    setValue('deliveryMode', 'CUSTOM_ADDRESS', { shouldDirty: false })
  }, [
    addressesQuery.data,
    addressesQuery.isError,
    addressesQuery.isPending,
    setValue,
  ])

  const canCreate = customer.role !== 'VIEWER'
  const requestsPath = `/portal/${customer.customerId}/requests`

  const leaveRequestCreation = () => {
    if (isDirty || documents.length > 0) {
      setLeaveDialogOpen(true)
      return
    }

    navigate(requestsPath)
  }

  const confirmLeaveRequestCreation = () => {
    setLeaveDialogOpen(false)
    navigate(requestsPath)
  }

  if (!canCreate) {
    return (
      <PageContainer className="py-5 lg:py-4">
        <ErrorState
          error={
            new Error('Tu rol dentro de la empresa es únicamente de consulta.')
          }
          title="No puedes crear solicitudes"
        />
      </PageContainer>
    )
  }

  const goToRequirements = async () => {
    const valid = await trigger([
      'title',
      'description',
      'quantity',
      'requestedDeliveryDate',
      'customerReference',
    ])

    if (valid) setStep(1)
  }

  const goToDelivery = async () => {
    const valid = await trigger([
      'materialRequirementType',
      'materialRequirement',
    ])

    if (valid) setStep(2)
  }

  const goToReview = async () => {
    const valid = await trigger([
      'deliveryMode',
      'customerAddressId',
      'deliveryLabel',
      'deliveryAddress',
      'deliveryCity',
      'deliveryState',
      'deliveryPostalCode',
      'deliveryCountry',
      'deliveryContactName',
      'deliveryContactPhone',
      'deliveryInstructions',
    ])

    if (valid) setStep(3)
  }

  const addFiles = (files: FileList | null) => {
    if (!files) return

    const nextFiles = Array.from(files)

    if (documents.length + nextFiles.length > 5) {
      setDocumentError('Puedes adjuntar hasta 5 archivos por solicitud.')
      return
    }

    const oversized = nextFiles.find((file) => file.size > 25 * 1024 * 1024)

    if (oversized) {
      setDocumentError(
        `${oversized.name} supera el límite de 25 MB por archivo.`,
      )
      return
    }

    setDocuments((current) => [
      ...current,
      ...nextFiles.map((file) => ({
        file,
        documentType: 'REQUEST_ATTACHMENT',
        name: file.name,
      })),
    ])
    setDocumentError(null)
  }

  const submit = handleSubmit(async (formValues) => {
    try {
      const request = await mutation.mutateAsync({
        title: formValues.title.trim(),
        description: formValues.description.trim(),
        quantity: formValues.quantity,
        customerReference: formValues.customerReference.trim() || undefined,
        requestedDeliveryDate:
          formValues.requestedDeliveryDate.trim() || undefined,
        materialRequirementType: formValues.materialRequirementType,
        materialRequirement: formValues.materialRequirement.trim(),
        deliveryMode: formValues.deliveryMode,
        ...(formValues.deliveryMode === 'SAVED_ADDRESS' &&
        formValues.customerAddressId
          ? { customerAddressId: Number(formValues.customerAddressId) }
          : {}),
        ...(formValues.deliveryLabel.trim()
          ? { deliveryLabel: formValues.deliveryLabel.trim() }
          : {}),
        ...(formValues.deliveryAddress.trim()
          ? { deliveryAddress: formValues.deliveryAddress.trim() }
          : {}),
        ...(formValues.deliveryCity.trim()
          ? { deliveryCity: formValues.deliveryCity.trim() }
          : {}),
        ...(formValues.deliveryState.trim()
          ? { deliveryState: formValues.deliveryState.trim() }
          : {}),
        ...(formValues.deliveryPostalCode.trim()
          ? { deliveryPostalCode: formValues.deliveryPostalCode.trim() }
          : {}),
        ...(formValues.deliveryCountry.trim()
          ? { deliveryCountry: formValues.deliveryCountry.trim() }
          : {}),
        ...(formValues.deliveryContactName.trim()
          ? { deliveryContactName: formValues.deliveryContactName.trim() }
          : {}),
        ...(formValues.deliveryContactPhone.trim()
          ? { deliveryContactPhone: formValues.deliveryContactPhone.trim() }
          : {}),
        ...(formValues.deliveryInstructions.trim()
          ? { deliveryInstructions: formValues.deliveryInstructions.trim() }
          : {}),
        documents,
      })

      navigate(`/portal/${customer.customerId}/requests/${request.id}`, {
        replace: true,
      })
    } catch {
      // The normalized API error is shown below.
    }
  })

  return (
    <PageContainer className="py-4 lg:py-3">
      <div className="lg:flex lg:h-[calc(100dvh-100px)] lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <div className="mb-3 flex shrink-0 items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-200/70">
              <SidebarNavIcon name="requests" className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] text-blue-600">
                Gestión de trabajos
              </p>
              <div className="mt-0.5 flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
                <h1 className="text-xl font-bold tracking-tight text-slate-950 lg:text-[22px]">
                  {step === 3 ? 'Revisar y enviar' : 'Nueva solicitud'}
                </h1>
                <p className="truncate text-[10px] text-slate-500">
                  {step === 3
                    ? 'Confirma la información antes de enviarla.'
                    : 'Completa la información necesaria para iniciar el trabajo.'}
                </p>
              </div>
            </div>
          </div>

          <CustomerRequestsBackButton
            onClick={leaveRequestCreation}
            disabled={mutation.isPending}
          />
        </div>

        <CustomerRequestWizardSteps currentStep={step} />

        <form
          onSubmit={(event) => void submit(event)}
          className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col lg:overflow-hidden"
        >
          <div className="lg:min-h-0 lg:flex-1 lg:overflow-hidden">
            {step === 0 ? (
              <CustomerRequestDetailsStep
                register={register}
                errors={errors}
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToRequirements()}
                  />
                }
              />
            ) : null}

            {step === 1 ? (
              <CustomerRequestRequirementsStep
                register={register}
                errors={errors}
                materialRequirementType={materialRequirementType}
                setValue={setValue}
                documents={documents}
                documentError={documentError}
                onAddFiles={addFiles}
                onRemoveFile={(index) =>
                  setDocuments((current) =>
                    current.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
                onUpdateFile={(index, patch) =>
                  setDocuments((current) =>
                    current.map((document, itemIndex) =>
                      itemIndex === index
                        ? { ...document, ...patch }
                        : document,
                    ),
                  )
                }
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToDelivery()}
                  />
                }
              />
            ) : null}

            {step === 2 ? (
              <CustomerRequestDeliveryStep
                register={register}
                errors={errors}
                setValue={setValue}
                deliveryMode={deliveryMode}
                selectedAddressId={selectedAddressId}
                addresses={addressesQuery.data ?? []}
                addressesPending={addressesQuery.isPending}
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => void goToReview()}
                  />
                }
              />
            ) : null}

            {step === 3 ? (
              <CustomerRequestReviewStep
                values={getValues()}
                documents={documents}
                onEditDetails={() => setStep(0)}
                onEditRequirements={() => setStep(1)}
                onEditDelivery={() => setStep(2)}
                addresses={addressesQuery.data ?? []}
                actions={
                  <CustomerRequestStepActions
                    step={step}
                    pending={mutation.isPending}
                    onBack={() => setStep((current) => current - 1)}
                    onContinue={() => undefined}
                  />
                }
              />
            ) : null}
          </div>

          {mutation.error ? (
            <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[10px] text-red-700">
              {getErrorMessage(mutation.error)}
            </p>
          ) : null}
        </form>
      </div>

      <LeaveCustomerRequestDialog
        open={leaveDialogOpen}
        onClose={() => setLeaveDialogOpen(false)}
        onConfirm={confirmLeaveRequestCreation}
      />
    </PageContainer>
  )
}
