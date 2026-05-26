import { z } from 'zod'

const email = z
  .string()
  .trim()
  .email('Correo invalido')
  .transform((value) => value.toLowerCase())

const isValidBirthDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false
  }

  const [year, month, day] = value.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day))

  const isRealDate =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day

  if (!isRealDate) {
    return false
  }

  const today = new Date()
  const todayUtcTime = Date.UTC(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate(),
  )

  return date.getTime() <= todayUtcTime
}

const password = z
  .string()
  .min(8, 'Debe tener al menos 8 caracteres')
  .max(72, 'No puede tener mas de 72 caracteres')

export const loginSchema = z.object({
  email,
  password,
})

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Minimo 2 caracteres').max(60, 'Maximo 60 caracteres'),
    lastName: z.string().trim().min(2, 'Minimo 2 caracteres').max(60, 'Maximo 60 caracteres'),
    email,
    birthDate: z.string().trim().refine(isValidBirthDate, 'Fecha invalida o futura'),
    password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contrasenas no coinciden',
  })

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token requerido'),
    newPassword: password,
    confirmPassword: z.string(),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Las contrasenas no coinciden',
  })

export type LoginSchema = z.infer<typeof loginSchema>
export type RegisterSchema = z.infer<typeof registerSchema>
export type ForgotPasswordSchema = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
