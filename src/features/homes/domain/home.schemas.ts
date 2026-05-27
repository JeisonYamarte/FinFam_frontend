import { z } from 'zod'

export const createHomeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Minimo 3 caracteres')
    .max(80, 'Maximo 80 caracteres'),
})

export const updateHomeNameSchema = createHomeSchema

export const inviteHomeMemberSchema = z.object({
  email: z.string().trim().email('Correo invalido').transform((value) => value.toLowerCase()),
})

export type CreateHomeSchema = z.infer<typeof createHomeSchema>
export type UpdateHomeNameSchema = z.infer<typeof updateHomeNameSchema>
export type InviteHomeMemberSchema = z.infer<typeof inviteHomeMemberSchema>