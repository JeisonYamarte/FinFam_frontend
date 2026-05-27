import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import type {
  CreateHomePayload,
  HomeRole,
  InviteHomeMemberPayload,
  UpdateHomeNamePayload,
} from '@/features/homes/domain/Home.entity'

import { CreateHome } from '../use-cases/create-home'
import { GetHomes } from '../use-cases/get-homes'
import { apiHomesRepository } from '../../infrastructure/api-homes.repository'

const getHomesUseCase = new GetHomes(apiHomesRepository)
const createHomeUseCase = new CreateHome(apiHomesRepository)

export const HOME_QUERY_KEYS = {
  all: ['homes'] as const,
  list: () => ['homes', 'list'] as const,
  detail: (homeId: string) => ['homes', homeId, 'detail'] as const,
  calculation: (homeId: string) => ['homes', homeId, 'calculation'] as const,
  expenses: (homeId: string, limit: number) => ['expenses', homeId, { limit }] as const,
  closures: (homeId: string, limit: number) => ['closures', homeId, { limit }] as const,
}

export const useHomes = () =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.list(),
    queryFn: () => getHomesUseCase.execute(),
    staleTime: 0,
  })

export const useCreateHome = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CreateHomePayload) => createHomeUseCase.execute(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.all })
    },
  })
}

export const useHomeDetail = (homeId: string | null) =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none'),
    queryFn: () => apiHomesRepository.getHomeById(homeId ?? ''),
    enabled: Boolean(homeId),
  })

export const useHomeCalculation = (homeId: string | null) =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.calculation(homeId ?? 'none'),
    queryFn: () => apiHomesRepository.getHomeCalculation(homeId ?? ''),
    enabled: Boolean(homeId),
  })

export const useHomeExpenses = (homeId: string | null, limit = 5) =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.expenses(homeId ?? 'none', limit),
    queryFn: () => apiHomesRepository.getHomeExpenses(homeId ?? '', limit),
    enabled: Boolean(homeId),
  })

export const useHomeClosures = (homeId: string | null, limit = 3) =>
  useQuery({
    queryKey: HOME_QUERY_KEYS.closures(homeId ?? 'none', limit),
    queryFn: () => apiHomesRepository.getHomeClosures(homeId ?? '', limit),
    enabled: Boolean(homeId),
  })

export const useUpdateHomeName = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: UpdateHomeNamePayload) => apiHomesRepository.updateHomeName(homeId ?? '', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none') })
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.list() })
    },
  })
}

export const useInviteHomeMember = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: InviteHomeMemberPayload) => apiHomesRepository.inviteHomeMember(homeId ?? '', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none') })
    },
  })
}

export const useUpdateHomeMemberRole = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: HomeRole }) =>
      apiHomesRepository.updateHomeMemberRole(homeId ?? '', memberId, { role }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none') })
    },
  })
}

export const useRemoveHomeMember = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (memberId: string) => apiHomesRepository.removeHomeMember(homeId ?? '', memberId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none') })
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.calculation(homeId ?? 'none') })
    },
  })
}

export const useLeaveHome = (homeId: string | null) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiHomesRepository.leaveHome(homeId ?? ''),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.all })
      await queryClient.invalidateQueries({ queryKey: HOME_QUERY_KEYS.detail(homeId ?? 'none') })
    },
  })
}