export interface CurrentUser {
  id: string
  email: string
  firstName?: string
  lastName?: string
  [key: string]: unknown
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  lastName: string
  email: string
  birthDate: string
  password: string
}

export type ForgotPasswordPayload = {
  email: string
}

export type ResetPasswordPayload = {
  token: string
  newPassword: string
}

export type AuthTokenResponse = {
  access_token?: string
  accessToken?: string
  token?: string
}
