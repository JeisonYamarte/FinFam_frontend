import { client, tokenStore } from './client'
import type { RefreshTokenResponse } from './types'

type RefreshResponseLike = RefreshTokenResponse & {
	access_token?: string
}

const getTokenFromRefresh = (data: RefreshResponseLike): string => {
	const token = data.access_token ?? data.accessToken

	if (!token) {
		throw new Error('No se recibio token de refresh.')
	}

	return token
}

export const refreshToken = async (): Promise<string> => {
	const { data } = await client.post<RefreshResponseLike>('/auth/refresh')
	const token = getTokenFromRefresh(data)

	tokenStore.set(token)

	return token
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
