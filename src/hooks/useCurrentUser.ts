import { useQuery } from '@tanstack/react-query'

import { client } from '../lib/api/client'
import type { ApiResponse } from '../lib/api/types'

export interface CurrentUser {
	id: string
	email: string
	firstName?: string
	lastName?: string
	[key: string]: unknown
}

export const CURRENT_USER_QUERY_KEY = ['current-user'] as const

const getCurrentUser = async (): Promise<CurrentUser> => {
	const { data } = await client.get<ApiResponse<CurrentUser>>('/auth/me')
	return data.data
}

export const useCurrentUser = () =>
	useQuery({
		queryKey: CURRENT_USER_QUERY_KEY,
		queryFn: getCurrentUser,
		staleTime: Number.POSITIVE_INFINITY,
		retry: false,
	})
