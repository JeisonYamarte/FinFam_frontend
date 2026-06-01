import type { HomeCalculation, HomeExpense } from '@/features/homes/domain/Home.entity'

type DashboardUserTotals = {
  totalSpentByMe: number
  mySplitsTotal: number
  myNetAmount: number
}

export const getDashboardUserTotals = (
  calculation: HomeCalculation | undefined,
  currentUserId: string | undefined,
): DashboardUserTotals => {
  const userTotals = currentUserId ? calculation?.totalsByUser[currentUserId] : undefined
  const totalSpentByMe = userTotals?.paid ?? 0
  const mySplitsTotal = userTotals?.split ?? 0

  return {
    totalSpentByMe,
    mySplitsTotal,
    myNetAmount: userTotals?.net ?? totalSpentByMe - mySplitsTotal,
  }
}

export const getOpenExpensesPreview = (
  expenses: HomeExpense[] | undefined,
  visibleLimit: number,
): HomeExpense[] =>
  (expenses ?? [])
    .filter((expense) => expense.closureId === null)
    .slice(0, visibleLimit)
