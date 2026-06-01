import { describe, expect, it } from 'vitest'

import type { HomeExpense } from '@/features/homes/domain/Home.entity'

import {
  getDashboardUserTotals,
  getOpenExpensesPreview,
} from './dashboard.utils'

const buildExpense = (id: string, closureId: string | null): HomeExpense => ({
  id,
  title: `Expense ${id}`,
  closureId,
  date: '2026-05-01',
  amount: 100,
})

describe('dashboard.utils', () => {
  it('retorna totales del usuario usando net enviado cuando existe', () => {
    const totals = getDashboardUserTotals(
      {
        period: { startDate: null, endDate: null },
        openExpensesCount: 0,
        totalSpentOpenPeriod: 0,
        totalsByUser: {
          u1: { paid: 1200, split: 1000, net: 250 },
        },
      },
      'u1',
    )

    expect(totals.totalSpentByMe).toBe(1200)
    expect(totals.mySplitsTotal).toBe(1000)
    expect(totals.myNetAmount).toBe(250)
  })

  it('calcula net localmente cuando el backend no lo trae', () => {
    const totals = getDashboardUserTotals(
      {
        period: { startDate: null, endDate: null },
        openExpensesCount: 0,
        totalSpentOpenPeriod: 0,
        totalsByUser: {
          u1: { paid: 800, split: 500 } as never,
        },
      },
      'u1',
    )

    expect(totals.myNetAmount).toBe(300)
  })

  it('retorna 0 cuando no hay usuario actual', () => {
    const totals = getDashboardUserTotals(undefined, undefined)

    expect(totals).toEqual({
      totalSpentByMe: 0,
      mySplitsTotal: 0,
      myNetAmount: 0,
    })
  })

  it('filtra gastos abiertos y respeta limite manteniendo orden', () => {
    const preview = getOpenExpensesPreview(
      [
        buildExpense('1', null),
        buildExpense('2', 'closure-1'),
        buildExpense('3', null),
        buildExpense('4', null),
      ],
      2,
    )

    expect(preview.map((item) => item.id)).toEqual(['1', '3'])
  })
})
