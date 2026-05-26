import { useQuery } from '@tanstack/react-query'

import { getCurrentUser } from '../../infrastructure/api-auth.repository'

export const CURRENT_USER_QUERY_KEY = ['current-user'] as const

export const useCurrentUser = () =>
  useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })
