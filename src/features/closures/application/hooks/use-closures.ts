import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type { ClosureActionSchema } from '@/features/closures/domain/closure.schemas'

import { apiClosuresRepository } from '../../infrastructure/api-closures.repository'
import { CreateClosure } from '../use-cases/create-closure'
import { GetClosureBalances } from '../use-cases/get-closure-balances'
import { GetClosureDetail } from '../use-cases/get-closure-detail'
import { GetClosureExpenses } from '../use-cases/get-closure-expenses'
import { GetClosureHistory } from '../use-cases/get-closure-history'
import { SimulateClosure } from '../use-cases/simulate-closure'

const getClosureHistoryUseCase = new GetClosureHistory(apiClosuresRepository)
const simulateClosureUseCase = new SimulateClosure(apiClosuresRepository)
const createClosureUseCase = new CreateClosure(apiClosuresRepository)
const getClosureDetailUseCase = new GetClosureDetail(apiClosuresRepository)
const getClosureBalancesUseCase = new GetClosureBalances(apiClosuresRepository)
const getClosureExpensesUseCase = new GetClosureExpenses(apiClosuresRepository)

export const CLOSURE_QUERY_KEYS = {
  all: ['closures'] as const,
  list: (homeId: string, limit?: number) => ['closures', homeId, { limit }] as const,
  detail: (closureId: string) => ['closures', closureId, 'detail'] as const,
  balances: (closureId: string) => ['closures', closureId, 'balances'] as const,
  expenses: (closureId: string) => ['closures', closureId, 'expenses'] as const,
  preview: (homeId: string) => ['closures', homeId, 'preview'] as const,
}

export const useClosures = (homeId: string | null, limit?: number) =>
  useQuery({
    queryKey: CLOSURE_QUERY_KEYS.list(homeId ?? 'none', limit),
    queryFn: () => getClosureHistoryUseCase.execute(homeId ?? '', limit),
    enabled: Boolean(homeId),
  })

export const useClosureDetail = (closureId: string | null) =>
  useQuery({
    queryKey: CLOSURE_QUERY_KEYS.detail(closureId ?? 'none'),
    queryFn: () => getClosureDetailUseCase.execute(closureId ?? ''),
    enabled: Boolean(closureId),
  })

export const useClosureBalances = (closureId: string | null) =>
  useQuery({
    queryKey: CLOSURE_QUERY_KEYS.balances(closureId ?? 'none'),
    queryFn: () => getClosureBalancesUseCase.execute(closureId ?? ''),
    enabled: Boolean(closureId),
  })

export const useClosureExpenses = (closureId: string | null) =>
  useQuery({
    queryKey: CLOSURE_QUERY_KEYS.expenses(closureId ?? 'none'),
    queryFn: () => getClosureExpensesUseCase.execute(closureId ?? ''),
    enabled: Boolean(closureId),
  })

export const useSimulateClosure = (homeId: string | null) =>
  useMutation({
    mutationKey: CLOSURE_QUERY_KEYS.preview(homeId ?? 'none'),
    mutationFn: (payload: ClosureActionSchema) => simulateClosureUseCase.execute(payload),
  })

export const useCreateClosure = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload?: ClosureActionSchema) =>
      createClosureUseCase.execute({ householdId: payload?.householdId ?? homeId ?? '' }),
    onSuccess: async (_, variables) => {
      const resolvedHomeId = variables?.householdId ?? homeId ?? 'none'

      await queryClient.invalidateQueries({ queryKey: ['closures', resolvedHomeId] })
      await queryClient.invalidateQueries({ queryKey: ['homes', resolvedHomeId, 'calculation'] })
      await queryClient.invalidateQueries({ queryKey: ['expenses', resolvedHomeId] })
    },
  })
}