import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@/shared/components/ui/Button'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { TextField } from '@/shared/components/ui/TextField'
import {
  materialSpecificationSchema,
  type MaterialSpecificationFormValues,
} from '../schemas/jobCase.schemas'
import type { CaseMaterialSpecificationDto } from '../types/jobCase.types'

interface MaterialSpecificationFormProps {
  current: CaseMaterialSpecificationDto | null
  isSubmitting: boolean
  onCancel: () => void
  onSubmit: (values: MaterialSpecificationFormValues) => Promise<void>
}

export function MaterialSpecificationForm({
  current,
  isSubmitting,
  onCancel,
  onSubmit,
}: MaterialSpecificationFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MaterialSpecificationFormValues>({
    resolver: zodResolver(materialSpecificationSchema),
    defaultValues: {
      materialName: current?.materialName ?? '',
      standardOrGrade: current?.standardOrGrade ?? '',
      technicalNotes: current?.technicalNotes ?? '',
    },
  })

  return (
    <form
      className="rounded-xl border border-blue-100 bg-white p-3.5 shadow-[0_12px_32px_-30px_rgba(15,23,42,0.3)]"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2 className="text-[12px] font-semibold text-slate-950">
        Especificación técnica del material
      </h2>
      <p className="mt-1 text-[9px] text-slate-500">
        Define la referencia técnica que utilizará el equipo en las siguientes etapas.
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <TextField
          label="Material"
          labelClassName="!mb-1.5 !text-[10px]"
          className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
          error={errors.materialName?.message}
          {...register('materialName')}
        />
        <TextField
          label="Norma o grado"
          labelClassName="!mb-1.5 !text-[10px]"
          className="!h-8 !rounded-lg !px-2.5 !text-[10px] !shadow-none placeholder:!text-[9px]"
          error={errors.standardOrGrade?.message}
          {...register('standardOrGrade')}
        />
      </div>

      <div className="mt-3">
        <TextareaField
          label="Notas técnicas"
          labelClassName="!mb-1.5 !text-[10px]"
          className="!min-h-20 !rounded-lg !px-3 !py-2 !text-[10px] !shadow-none placeholder:!text-[9px]"
          error={errors.technicalNotes?.message}
          {...register('technicalNotes')}
        />
      </div>

      <div className="mt-3 flex justify-end gap-1.5">
        <Button
          size="sm"
          variant="ghost"
          className="!h-7 !px-2.5 !text-[8px]"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </Button>
        <Button
          size="sm"
          type="submit"
          className="!h-7 !px-2.5 !text-[8px]"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Guardando…' : 'Guardar especificación'}
        </Button>
      </div>
    </form>
  )
}
