import { z } from 'zod'

export const informationRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(1, 'Escribe la aclaración que necesita el equipo.')
    .max(2000, 'La pregunta no puede superar 2000 caracteres.'),
})

export const materialSpecificationSchema = z.object({
  materialName: z
    .string()
    .trim()
    .min(1, 'El material es obligatorio.')
    .max(255, 'El material no puede superar 255 caracteres.'),
  standardOrGrade: z
    .string()
    .trim()
    .max(255, 'La norma o grado no puede superar 255 caracteres.'),
  technicalNotes: z
    .string()
    .trim()
    .max(4000, 'Las notas no pueden superar 4000 caracteres.'),
})

export type InformationRequestFormValues = z.infer<
  typeof informationRequestSchema
>

export type MaterialSpecificationFormValues = z.infer<
  typeof materialSpecificationSchema
>
