import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from 'axios'

let accessToken: string | null = null
let unauthorizedHandler: (() => void) | null = null

type RetriableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean
}

type QueueEntry = {
  request: RetriableRequestConfig
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
}

type RefreshResponseLike = {
  access_token: string
}

export const tokenStore = {
  get: () => accessToken,
  set: (token: string) => {
    accessToken = token
  },
  clear: () => {
    accessToken = null
  },
}

export const setUnauthorizedHandler = (handler: (() => void) | null): void => {
  unauthorizedHandler = handler
}

export const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

const setAuthorizationHeader = (
  config: RetriableRequestConfig,
  token: string,
): void => {
  if (!config.headers) {
    config.headers = new AxiosHeaders()
  }

  if (config.headers instanceof AxiosHeaders) {
    config.headers.set('Authorization', `Bearer ${token}`)
    return
  }

  ;(config.headers as Record<string, string>).Authorization = `Bearer ${token}`
}

client.interceptors.request.use((config) => {
  const token = tokenStore.get()

  if (token) {
    setAuthorizationHeader(config as RetriableRequestConfig, token)
  }

  return config
})

let isRefreshing = false
let queue: QueueEntry[] = []

const resolveQueue = (newToken: string): void => {
  queue.forEach(({ request, resolve }) => {
    setAuthorizationHeader(request, newToken)
    resolve(client(request))
  })
  queue = []
}

const rejectQueue = (error: unknown): void => {
  queue.forEach(({ reject }) => reject(error))
  queue = []
}

const getTokenFromRefresh = (data: RefreshResponseLike): string => {
  const token = data.access_token

  if (!token) {
    throw new Error('No se recibio token de refresh.')
  }

  return token
}

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined
    const isUnauthorized = error.response?.status === 401
    const requestUrl = originalRequest?.url ?? ''
    const isRefreshRequest = requestUrl.includes('/auth/refresh')

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isRefreshRequest
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ request: originalRequest, resolve, reject })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await client.post<RefreshResponseLike>('/auth/refresh')
        const newToken = getTokenFromRefresh(data)

        tokenStore.set(newToken)

        resolveQueue(newToken)

        setAuthorizationHeader(originalRequest, newToken)
        return client(originalRequest)
      } catch (refreshError) {
        tokenStore.clear()
        rejectQueue(refreshError)

        if (unauthorizedHandler) {
          unauthorizedHandler()
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
