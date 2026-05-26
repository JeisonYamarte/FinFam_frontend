import { client, tokenStore } from '@/shared/infrastructure/http/client'
import type { ApiResponse } from '@/shared/domain/types/api.types'
import type {
  CurrentUser,
  AuthTokenResponse,
  LoginPayload,
  RegisterPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
} from '../domain/Auth.entity'

type AuthMessageResponse = {
  message?: string
}

const getTokenFromResponse = (data: AuthTokenResponse): string => {
  const token = data.access_token ?? data.accessToken ?? data.token

  if (!token) {
    throw new Error('No se recibio token de autenticacion.')
  }

  return token
}

export const login = async (payload: LoginPayload): Promise<void> => {
  const { data } = await client.post<AuthTokenResponse>('/auth/login', payload)
  tokenStore.set(getTokenFromResponse(data))
}

export const getCurrentUser = async (): Promise<CurrentUser> => {
  const { data } = await client.get<ApiResponse<CurrentUser>>('/auth/me')
  return data.data
}

export const register = async (payload: RegisterPayload): Promise<void> => {
  const { data } = await client.post<AuthTokenResponse>('/auth/register', payload)
  tokenStore.set(getTokenFromResponse(data))
}

export const forgotPassword = async (payload: ForgotPasswordPayload): Promise<string> => {
  await client.post<AuthMessageResponse>('/auth/forgot-password', payload)
  return 'Si el correo existe, recibiras instrucciones pronto.'
}

export const resetPassword = async (payload: ResetPasswordPayload): Promise<string> => {
  await client.post<AuthMessageResponse>('/auth/reset-password', payload)
  return 'Contrasena actualizada correctamente.'
}

export const verifyEmail = async (token: string): Promise<string> => {
  await client.get<AuthMessageResponse>('/auth/verify-email', {
    params: { token },
  })
  return 'Correo verificado correctamente.'
}

export const logout = async (): Promise<void> => {
  try {
    await client.post('/auth/logout')
  } finally {
    tokenStore.clear()
  }
}
