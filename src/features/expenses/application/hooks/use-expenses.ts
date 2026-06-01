import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CreateExpensePayload,
  ExpenseListFilters,
  UpdateExpensePayload,
} from '@/features/expenses/domain/Expense.entity'

import { apiExpensesRepository } from '../../infrastructure/api-expenses.repository'
import { CreateExpense } from '../use-cases/create-expense'
import { DeleteExpense } from '../use-cases/delete-expense'
import { GetExpenseById } from '../use-cases/get-expense-by-id'
import { GetExpenses } from '../use-cases/get-expenses'
import { UpdateExpense } from '../use-cases/update-expense'

const getExpensesUseCase = new GetExpenses(apiExpensesRepository)
const getExpenseByIdUseCase = new GetExpenseById(apiExpensesRepository)
const createExpenseUseCase = new CreateExpense(apiExpensesRepository)
const updateExpenseUseCase = new UpdateExpense(apiExpensesRepository)
const deleteExpenseUseCase = new DeleteExpense(apiExpensesRepository)

export const EXPENSE_QUERY_KEYS = {
  all: ['expenses'] as const,
  byHome: (homeId: string) => ['expenses', homeId] as const,
  list: (homeId: string, filters: ExpenseListFilters) => ['expenses', homeId, 'list', filters] as const,
  detail: (homeId: string, expenseId: string) => ['expenses', homeId, 'detail', expenseId] as const,
}

const withDefaultFilters = (filters?: ExpenseListFilters): ExpenseListFilters => ({
  page: filters?.page ?? 1,
  limit: filters?.limit ?? 10,
  startDate: filters?.startDate,
  endDate: filters?.endDate,
  closureId: filters?.closureId,
})

export const useExpenses = (homeId: string | null, filters?: ExpenseListFilters) => {
  const resolvedFilters = withDefaultFilters(filters)

  return useQuery({
    queryKey: EXPENSE_QUERY_KEYS.list(homeId ?? 'none', resolvedFilters),
    queryFn: () => getExpensesUseCase.execute(homeId ?? '', resolvedFilters),
    enabled: Boolean(homeId),
  })
}

export const useExpenseDetail = (homeId: string | null, expenseId: string | null) =>
  useQuery({
    queryKey: EXPENSE_QUERY_KEYS.detail(homeId ?? 'none', expenseId ?? 'none'),
    queryFn: () => getExpenseByIdUseCase.execute(expenseId ?? ''),
    enabled: Boolean(homeId && expenseId),
  })

export const useCreateExpense = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: Omit<CreateExpensePayload, 'householdId'>) =>
      createExpenseUseCase.execute({
        ...payload,
        householdId: homeId ?? '',
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: EXPENSE_QUERY_KEYS.byHome(homeId ?? 'none'),
        refetchType: 'all',
      })
    },
  })
}

export const useUpdateExpense = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      expenseId,
      payload,
    }: {
      expenseId: string
      payload: UpdateExpensePayload
    }) => updateExpenseUseCase.execute(expenseId, payload),
    onSuccess: async (updatedExpense) => {
      await queryClient.invalidateQueries({
        queryKey: EXPENSE_QUERY_KEYS.byHome(homeId ?? 'none'),
        refetchType: 'all',
      })
      await queryClient.invalidateQueries({
        queryKey: EXPENSE_QUERY_KEYS.detail(homeId ?? 'none', updatedExpense.id),
        refetchType: 'all',
      })
    },
  })
}

export const useDeleteExpense = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (expenseId: string) => deleteExpenseUseCase.execute(expenseId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: EXPENSE_QUERY_KEYS.byHome(homeId ?? 'none'),
        refetchType: 'all',
      })
    },
  })
}
