import { initializeAuth } from './auth-http.service'

let authReadyPromise: Promise<void> | null = null

export const startAuthInit = (): void => {
  if (authReadyPromise) return
  authReadyPromise = initializeAuth().then(() => undefined)
}

export const waitForAuthReady = (): Promise<void> => {
  return authReadyPromise ?? Promise.resolve()
}
