import { client, tokenStore } from './client'
import type { RefreshTokenResponse } from './types'

export const refreshToken = async (): Promise<string> => {
	const { data } = await client.post<RefreshTokenResponse>('/auth/refresh')

	tokenStore.set(data.accessToken)

	return data.accessToken
}

export const initializeAuth = async (): Promise<boolean> => {
	try {
		await refreshToken()
		return true
	} catch {
		tokenStore.clear()
		return false
	}
}
