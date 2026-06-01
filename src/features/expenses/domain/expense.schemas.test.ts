import { describe, expect, it } from 'vitest'

import {
  createExpenseSchema,
  isMoneyEqual,
  normalizeMoney,
} from './expense.schemas'

describe('expense.schemas', () => {
  it('normaliza montos a 2 decimales', () => {
    expect(normalizeMoney(10.005)).toBe(10.01)
  })

  it('compara montos con tolerancia para floating point', () => {
    expect(isMoneyEqual(0.1 + 0.2, 0.3)).toBe(true)
  })

  it('acepta payload valido cuando payers y splits cuadran con monto', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Cena',
      description: 'Restaurante',
      amount: 100,
      date: '2026-05-01',
      payers: [
        { userId: 'u1', amountPaid: 60 },
        { userId: 'u2', amountPaid: 40 },
      ],
      splits: [
        { userId: 'u1', amount: 50 },
        { userId: 'u2', amount: 50 },
      ],
    })

    expect(result.success).toBe(true)
  })

  it('rechaza miembros duplicados en payers', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Supermercado',
      description: '',
      amount: 100,
      date: '2026-05-01',
      payers: [
        { userId: 'u1', amountPaid: 40 },
        { userId: 'u1', amountPaid: 60 },
      ],
      splits: [
        { userId: 'u1', amount: 50 },
        { userId: 'u2', amount: 50 },
      ],
    })

    expect(result.success).toBe(false)
  })

  it('rechaza cuando suma de splits no coincide con monto total', () => {
    const result = createExpenseSchema.safeParse({
      title: 'Taxi',
      description: '',
      amount: 100,
      date: '2026-05-01',
      payers: [
        { userId: 'u1', amountPaid: 100 },
      ],
      splits: [
        { userId: 'u1', amount: 30 },
        { userId: 'u2', amount: 30 },
      ],
    })

    expect(result.success).toBe(false)
  })
})
