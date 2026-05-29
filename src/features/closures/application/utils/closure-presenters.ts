import type { HomeMember } from '@/features/homes/domain/Home.entity'
import { getInitials } from '@/features/homes/application/utils/formatters'

import type { ClosureBalance, ClosureMemberBalance } from '../../domain/Closure.entity'

export type ClosureMemberPresentation = {
  userId: string
  name: string
  initials: string
  email?: string
}

type MemberBalanceSummary = ClosureMemberPresentation & {
  netAmount: number
}

const normalizeUserId = (value: unknown, fallback = 'desconocido'): string => {
  if (typeof value === 'string') {
    const trimmedValue = value.trim()
    if (trimmedValue.length > 0) {
      return trimmedValue
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return fallback
}

const normalizeAmount = (value: unknown): number => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

const getFallbackName = (userId: unknown) => {
  const safeUserId = normalizeUserId(userId)
  return `Miembro ${safeUserId.slice(0, 6)}`
}

export const getClosureMemberPresentation = (
  userId: string | null | undefined,
  members: HomeMember[],
): ClosureMemberPresentation => {
  const safeUserId = normalizeUserId(userId)
  const member = members.find((item) => item.userId === safeUserId)
  const name = member?.name ?? getFallbackName(safeUserId)

  return {
    userId: safeUserId,
    name,
    initials: getInitials(name),
    email: member?.email,
  }
}

export const summarizeClosureBalances = (
  balances: ClosureBalance[],
  members: HomeMember[],
): MemberBalanceSummary[] => {
  const totals = new Map<string, number>()

  balances.forEach((balance, index) => {
    const fromUserId = normalizeUserId(balance.fromUserId, `deudor-${index + 1}`)
    const toUserId = normalizeUserId(balance.toUserId, `acreedor-${index + 1}`)
    const amount = normalizeAmount(balance.amount)

    totals.set(fromUserId, (totals.get(fromUserId) ?? 0) - amount)
    totals.set(toUserId, (totals.get(toUserId) ?? 0) + amount)
  })

  return Array.from(totals.entries())
    .map(([userId, netAmount]) => ({
      ...getClosureMemberPresentation(userId, members),
      netAmount,
    }))
    .sort((left, right) => Math.abs(right.netAmount) - Math.abs(left.netAmount))
}

export const summarizeMemberBalances = (
  balances: ClosureMemberBalance[],
  members: HomeMember[],
): MemberBalanceSummary[] =>
  balances
    .map((balance, index) => ({
      ...getClosureMemberPresentation(balance.userId, members),
      netAmount: normalizeAmount(balance.balance ?? `saldo-${index + 1}`),
    }))
    .sort((left, right) => Math.abs(right.netAmount) - Math.abs(left.netAmount))