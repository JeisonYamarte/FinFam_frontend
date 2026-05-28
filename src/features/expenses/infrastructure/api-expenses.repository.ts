import { client } from '@/shared/infrastructure/http/client'

import type {
  CreateExpensePayload,
  Expense,
  ExpenseListFilters,
  ExpenseListItemResponse,
  ExpenseListResponse,
  ExpenseListResult,
  ExpensePayerResponse,
  ExpenseResponse,
  ExpenseSplitResponse,
  UpdateExpensePayload,
} from '../domain/Expense.entity'
import type { IExpenseRepository } from '../domain/Expense.repository'

const mapExpensePayer = (payer: ExpensePayerResponse) => ({
  id: payer.id,
  userId: payer.userId,
  amountPaid: payer.amountPaid,
  user: payer.user,
})

const mapExpenseSplit = (split: ExpenseSplitResponse) => ({
  id: split.id,
  userId: split.userId,
  amount: split.amount,
  user: split.user,
})

const mapExpense = (expense: ExpenseResponse): Expense => ({
  id: expense.id,
  title: expense.title,
  description: expense.description,
  amount: expense.amount,
  date: expense.date,
  receiptUrl: expense.receiptUrl,
  receiptPublicId: expense.receiptPublicId,
  householdId: expense.householdId,
  closureId: expense.closureId,
  createdBy: expense.createdBy,
  createdAt: expense.createdAt,
  updatedAt: expense.updatedAt,
  payers: (expense.payers ?? []).map(mapExpensePayer),
  splits: (expense.splits ?? []).map(mapExpenseSplit),
})

const mapExpenseListItem = (expense: ExpenseListItemResponse) => ({
  id: expense.id,
  title: expense.title,
  amount: expense.amount,
  date: expense.date,
  closureId: expense.closureId,
})

const buildMultipartPayload = (payload: CreateExpensePayload | UpdateExpensePayload): FormData => {
  const formData = new FormData()

  if ('householdId' in payload) {
    formData.append('householdId', payload.householdId)
  }

  if (payload.title !== undefined) {
    formData.append('title', payload.title)
  }

  if (payload.description !== undefined) {
    formData.append('description', payload.description)
  }

  if (payload.amount !== undefined) {
    formData.append('amount', String(payload.amount))
  }

  if (payload.date !== undefined) {
    formData.append('date', payload.date)
  }

  if (payload.payers !== undefined) {
    formData.append('payers', JSON.stringify(payload.payers))
  }

  if (payload.splits !== undefined) {
    formData.append('splits', JSON.stringify(payload.splits))
  }

  if (payload.receipt) {
    formData.append('receipt', payload.receipt)
  }

  return formData
}

const shouldUseMultipartPayload = (payload: CreateExpensePayload | UpdateExpensePayload): boolean =>
  Boolean(payload.receipt)

export class ApiExpensesRepository implements IExpenseRepository {
  async getExpenses(householdId: string, filters?: ExpenseListFilters): Promise<ExpenseListResult> {
    const { data } = await client.get<ExpenseListResponse>(`/households/${householdId}/expenses`, {
      params: filters,
    })

    return {
      data: data.data.map(mapExpenseListItem),
      meta: data.meta,
    }
  }

  async getExpenseById(expenseId: string): Promise<Expense> {
    const { data } = await client.get<ExpenseResponse>(`/expenses/${expenseId}`)
    return mapExpense(data)
  }

  async createExpense(payload: CreateExpensePayload): Promise<Expense> {
    const requestPayload = shouldUseMultipartPayload(payload)
      ? buildMultipartPayload(payload)
      : payload

    const { data } = await client.post<ExpenseResponse>('/expenses', requestPayload)

    return mapExpense(data)
  }

  async updateExpense(expenseId: string, payload: UpdateExpensePayload): Promise<Expense> {
    const requestPayload = shouldUseMultipartPayload(payload)
      ? buildMultipartPayload(payload)
      : payload

    const { data } = await client.patch<ExpenseResponse>(`/expenses/${expenseId}`, requestPayload)

    return mapExpense(data)
  }

  async deleteExpense(expenseId: string): Promise<void> {
    await client.delete(`/expenses/${expenseId}`)
  }
}

export const apiExpensesRepository = new ApiExpensesRepository()
