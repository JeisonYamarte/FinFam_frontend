import { useCallback, useSyncExternalStore } from 'react'

export const useMediaQuery = (query: string): boolean => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (typeof window === 'undefined') {
        return () => undefined
      }

      const mediaQuery = window.matchMedia(query)
      mediaQuery.addEventListener('change', onStoreChange)

      return () => {
        mediaQuery.removeEventListener('change', onStoreChange)
      }
    },
    [query],
  )

  const getSnapshot = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false
    }

    return window.matchMedia(query).matches
  }, [query])
  const getServerSnapshot = useCallback((): boolean => false, [])

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}