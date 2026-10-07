import { z } from 'zod'

export const qualityCheckSchema = z
  .object({
    type: z.enum(['NUMERIC_RANGE', 'PASS_FAIL']),
    name: z
      .string()
      .trim()
      .min(1, 'Indica qué se está verificando.')
      .max(200, 'El nombre del control no puede superar 200 caracteres.'),
    nominalValue: z.number().optional(),
    lowerLimit: z.number().optional(),
    upperLimit: z.number().optional(),
    measuredValue: z.number().optional(),
    unit: z.string().trim().max(20, 'La unidad no puede superar 20 caracteres.'),
    result: z.enum(['PASS', 'FAIL']).optional(),
    notes: z.string().max(2000, 'Las notas no pueden superar 2000 caracteres.'),
  })
  .superRefine((values, context) => {
    if (values.type === 'PASS_FAIL') {
      if (!values.result) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['result'],
          message: 'Selecciona PASS o FAIL.',
        })
      }
      return
    }

    const requiredNumericFields = [
      ['nominalValue', values.nominalValue],
      ['lowerLimit', values.lowerLimit],
      ['upperLimit', values.upperLimit],
      ['measuredValue', values.measuredValue],
    ] as const

    requiredNumericFields.forEach(([field, value]) => {
      if (value === undefined) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [field],
          message: 'Este valor es obligatorio.',
        })
      }
    })

    if (!values.unit) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['unit'],
        message: 'Indica la unidad de medida.',
      })
    }

    if (
      values.lowerLimit !== undefined &&
      values.upperLimit !== undefined &&
      values.lowerLimit > values.upperLimit
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['lowerLimit'],
        message: 'El límite inferior no puede ser mayor al superior.',
      })
    }

    if (
      values.nominalValue !== undefined &&
      values.lowerLimit !== undefined &&
      values.upperLimit !== undefined &&
      (values.nominalValue < values.lowerLimit ||
        values.nominalValue > values.upperLimit)
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['nominalValue'],
        message: 'El valor nominal debe estar dentro del rango permitido.',
      })
    }
  })

export type QualityCheckFormValues = z.infer<typeof qualityCheckSchema>
