export interface ApiResponse<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  statusCode: number
  message: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface RefreshTokenResponse {
  accessToken: string
}
