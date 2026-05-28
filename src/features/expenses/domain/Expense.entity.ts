export type ExpenseRole = 'ADMIN' | 'GUEST'

export interface ExpenseUserSummary {
  name: string
  lastName: string
}

export interface ExpensePayer {
  id?: string
  userId: string
  amountPaid: number
  user?: ExpenseUserSummary
}

export interface ExpenseSplit {
  id?: string
  userId: string
  amount: number
  user?: ExpenseUserSummary
}

export interface Expense {
  id: string
  title: string
  description: string | null
  amount: number
  date: string
  receiptUrl: string | null
  receiptPublicId: string | null
  householdId: string
  closureId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  payers: ExpensePayer[]
  splits: ExpenseSplit[]
}

export interface ExpenseListItem {
  id: string
  title: string
  amount: number
  date: string
  closureId: string | null
}

export interface ExpenseListFilters {
  startDate?: string
  endDate?: string
  closureId?: string
  page?: number
  limit?: number
}

export interface ExpenseListResult {
  data: ExpenseListItem[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export type ExpensePayerInput = {
  userId: string
  amountPaid: number
}

export type ExpenseSplitInput = {
  userId: string
  amount: number
}

export interface CreateExpensePayload {
  householdId: string
  title: string
  description?: string
  amount: number
  date: string
  payers: ExpensePayerInput[]
  splits: ExpenseSplitInput[]
  receipt?: File | null
}

export interface UpdateExpensePayload {
  title?: string
  description?: string
  amount?: number
  date?: string
  payers?: ExpensePayerInput[]
  splits?: ExpenseSplitInput[]
  receipt?: File | null
}

export interface ExpenseListItemResponse {
  id: string
  title: string
  amount: number
  date: string
  closureId: string | null
}

export interface ExpenseListResponse {
  data: ExpenseListItemResponse[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

export interface ExpensePayerResponse {
  id: string
  userId: string
  amountPaid: number
  user: ExpenseUserSummary
}

export interface ExpenseSplitResponse {
  id: string
  userId: string
  amount: number
  user: ExpenseUserSummary
}

export interface ExpenseResponse {
  id: string
  title: string
  description: string | null
  amount: number
  date: string
  receiptUrl: string | null
  receiptPublicId: string | null
  householdId: string
  closureId: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
  payers?: ExpensePayerResponse[]
  splits?: ExpenseSplitResponse[]
}
