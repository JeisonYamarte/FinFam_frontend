import { z } from 'zod'

const MONEY_PRECISION = 100
export const MONEY_TOLERANCE = 0.01

export const normalizeMoney = (value: number): number =>
  Math.round((value + Number.EPSILON) * MONEY_PRECISION) / MONEY_PRECISION

export const isMoneyEqual = (left: number, right: number): boolean =>
  Math.abs(normalizeMoney(left) - normalizeMoney(right)) <= MONEY_TOLERANCE

const amountPaidSchema = z.number({ message: 'Monto invalido.' }).min(0, 'No puede ser negativo.')

const amountSchema = z.number({ message: 'Monto invalido.' }).positive('El monto debe ser mayor a 0.')

const expenseMemberBaseSchema = z.object({
  userId: z.string().min(1, 'Selecciona un miembro.'),
})

export const payerSchema = expenseMemberBaseSchema.extend({
  amountPaid: amountPaidSchema,
})

export const splitSchema = expenseMemberBaseSchema.extend({
  amount: amountPaidSchema,
})

const expenseBaseSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, 'El titulo debe tener al menos 2 caracteres.')
    .max(120, 'El titulo es demasiado largo.'),
  description: z.string().trim().max(400, 'La descripcion es demasiado larga.').optional().or(z.literal('')),
  amount: amountSchema,
  date: z.string().min(1, 'Selecciona una fecha.'),
  payers: z.array(payerSchema).min(1, 'Agrega al menos un payer.'),
  splits: z.array(splitSchema).min(1, 'Agrega al menos un split.'),
  receipt: z.instanceof(File).optional().nullable(),
})

const validateMemberUniqueness = (members: Array<{ userId: string }>): boolean => {
  const ids = members.map((member) => member.userId)
  return new Set(ids).size === ids.length
}

export const createExpenseSchema = expenseBaseSchema
  .refine((value) => validateMemberUniqueness(value.payers), {
    message: 'No repitas miembros en payers.',
    path: ['payers'],
  })
  .refine((value) => validateMemberUniqueness(value.splits), {
    message: 'No repitas miembros en splits.',
    path: ['splits'],
  })
  .refine(
    (value) => {
      const payerSum = value.payers.reduce((acc, payer) => acc + normalizeMoney(payer.amountPaid), 0)
      return isMoneyEqual(payerSum, value.amount)
    },
    {
      message: 'La suma de payers debe ser igual al monto total.',
      path: ['payers'],
    },
  )
  .refine(
    (value) => {
      const splitSum = value.splits.reduce((acc, split) => acc + normalizeMoney(split.amount), 0)
      return isMoneyEqual(splitSum, value.amount)
    },
    {
      message: 'La suma de splits debe ser igual al monto total.',
      path: ['splits'],
    },
  )

export const updateExpenseSchema = expenseBaseSchema.partial()

export type CreateExpenseFormValues = z.infer<typeof createExpenseSchema>
export type UpdateExpenseFormValues = z.infer<typeof updateExpenseSchema>
