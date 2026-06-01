import { describe, expect, it } from 'vitest'

import type { HomeMember } from '@/features/homes/domain/Home.entity'

import {
  summarizeClosureBalances,
  summarizeMemberBalances,
} from './closure-presenters'

const members: HomeMember[] = [
  { id: '1', userId: 'u1', name: 'Ana Lopez', email: 'ana@mail.com', role: 'ADMIN' },
  { id: '2', userId: 'u2', name: 'Beto Diaz', email: 'beto@mail.com', role: 'GUEST' },
  { id: '3', userId: 'u3', name: 'Carla Vega', email: 'carla@mail.com', role: 'GUEST' },
]

describe('closure-presenters', () => {
  it('resume balances de cierre calculando neto por miembro y orden por magnitud', () => {
    const summary = summarizeClosureBalances(
      [
        { fromUserId: 'u1', toUserId: 'u2', amount: 1000 },
        { fromUserId: 'u3', toUserId: 'u2', amount: 500 },
        { fromUserId: 'u1', toUserId: 'u3', amount: 200 },
      ],
      members,
    )

    expect(summary).toHaveLength(3)
    expect(summary[0]?.userId).toBe('u2')
    expect(summary[0]?.netAmount).toBe(1500)
    expect(summary[1]?.userId).toBe('u1')
    expect(summary[1]?.netAmount).toBe(-1200)
    expect(summary[2]?.userId).toBe('u3')
    expect(summary[2]?.netAmount).toBe(-300)
  })

  it('resume balances por miembro y ordena por valor absoluto', () => {
    const summary = summarizeMemberBalances(
      [
        { userId: 'u1', balance: -100 },
        { userId: 'u2', balance: 200 },
        { userId: 'u3', balance: -50 },
      ],
      members,
    )

    expect(summary.map((item) => item.userId)).toEqual(['u2', 'u1', 'u3'])
    expect(summary.map((item) => item.netAmount)).toEqual([200, -100, -50])
  })

  it('normaliza balances invalidos a 0 cuando llegan datos no numericos', () => {
    const summary = summarizeMemberBalances(
      [{ userId: 'u4', balance: Number.NaN } as never],
      members,
    )

    expect(summary[0]?.netAmount).toBe(0)
    expect(summary[0]?.name.startsWith('Miembro')).toBe(true)
  })
})
