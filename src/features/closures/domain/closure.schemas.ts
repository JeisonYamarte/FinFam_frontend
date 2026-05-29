import { z } from 'zod'

export const closureActionSchema = z.object({
  householdId: z.string().min(1, 'Debes seleccionar un hogar activo.'),
})

export type ClosureActionSchema = z.infer<typeof closureActionSchema>