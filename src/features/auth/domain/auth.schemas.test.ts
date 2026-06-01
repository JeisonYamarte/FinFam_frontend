import { describe, expect, it } from 'vitest'

import {
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schemas'

describe('auth.schemas', () => {
  it('normaliza email en login a lower-case y trim', () => {
    const parsed = loginSchema.parse({
      email: '  USER@MAIL.COM  ',
      password: 'password123',
    })

    expect(parsed.email).toBe('user@mail.com')
  })

  it('rechaza fecha de nacimiento futura en registro', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      lastName: 'Lopez',
      email: 'ana@mail.com',
      birthDate: '2999-01-01',
      password: 'password123',
      confirmPassword: 'password123',
    })

    expect(result.success).toBe(false)
  })

  it('rechaza confirmacion de password distinta', () => {
    const result = registerSchema.safeParse({
      name: 'Ana',
      lastName: 'Lopez',
      email: 'ana@mail.com',
      birthDate: '1990-01-10',
      password: 'password123',
      confirmPassword: 'different123',
    })

    expect(result.success).toBe(false)
  })

  it('rechaza mismatch en reset password', () => {
    const result = resetPasswordSchema.safeParse({
      token: 'token-1',
      newPassword: 'password123',
      confirmPassword: 'passwordABC',
    })

    expect(result.success).toBe(false)
  })
})
