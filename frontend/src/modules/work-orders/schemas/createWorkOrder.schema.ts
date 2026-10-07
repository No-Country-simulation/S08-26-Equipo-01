import { z } from 'zod'

export const createWorkOrderSchema = z.object({
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  plannedStartDate: z.string().min(1, 'Selecciona la fecha de inicio.'),
  plannedEndDate: z.string().min(1, 'Selecciona la fecha de fin.'),
})

export type CreateWorkOrderFormValues = z.infer<typeof createWorkOrderSchema>
