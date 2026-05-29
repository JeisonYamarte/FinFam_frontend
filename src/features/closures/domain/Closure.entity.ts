import type {
  Expense,
  ExpensePayerResponse,
  ExpenseResponse,
  ExpenseSplitResponse,
} from '@/features/expenses/domain/Expense.entity'

export interface ClosurePeriod {
  startDate: string
  endDate: string
}

export interface ClosureBalance {
  fromUserId: string
  toUserId: string
  amount: number
}

export interface ClosureMemberBalance {
  userId: string
  balance: number
}

export interface ClosureHistoryItem {
  id: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface ClosureSimulation {
  period: ClosurePeriod
  expensesCount: number
  balances: ClosureMemberBalance[]
  debts: ClosureBalance[]
}

export interface ClosureCreateResult {
  closureId: string
  balances: ClosureBalance[]
}

export interface ClosureDetail {
  id: string
  householdId: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  balances: ClosureBalance[]
}

export type ClosureExpense = Expense

export type SimulateClosurePayload = {
  householdId: string
}

export type CreateClosurePayload = {
  householdId: string
}

export interface ClosureBalanceResponse {
  fromUserId: string
  toUserId: string
  amount: number
}

export interface ClosureHistoryItemResponse {
  id: string
  startDate: string
  endDate: string
  createdAt: string
}

export interface ClosureSimulationResponse {
  period: ClosurePeriod
  expensesCount: number
  balances: ClosureMemberBalance[]
  debts: ClosureBalanceResponse[]
}

export interface ClosureCreateResponse {
  closureId: string
  balances: ClosureBalanceResponse[]
}

export interface ClosureDetailResponse {
  id: string
  householdId: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
  balances: ClosureBalanceResponse[]
}

export interface ClosureExpenseResponse extends Omit<ExpenseResponse, 'payers' | 'splits'> {
  payers: ExpensePayerResponse[]
  splits: ExpenseSplitResponse[]
}