export interface CurrentUser {
  id: string
  name: string
  lastName: string
  birthDate: string
  email: string
  verifiedEmail: boolean
  createdAt: string
  updatedAt: string
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
  access_token: string
}
