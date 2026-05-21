import { client, tokenStore } from '../../../lib/api/client'

type AuthTokenResponse = {
  access_token?: string
  accessToken?: string
  token?: string
}

type AuthMessageResponse = {
  message?: string
}

type LoginPayload = {
  email: string
  password: string
}

type RegisterPayload = {
  name: string
  lastName: string
  email: string
  birthDate: string
  password: string
}

type ForgotPasswordPayload = {
  email: string
}

type ResetPasswordPayload = {
  token: string
  password: string
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

export const register = async (payload: RegisterPayload): Promise<void> => {
  const { data } = await client.post<AuthTokenResponse>('/auth/register', payload)
  tokenStore.set(getTokenFromResponse(data))
}

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<string> => {
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
