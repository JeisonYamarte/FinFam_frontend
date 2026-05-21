
import { useEffect, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from './lib/query-client'
import { initializeAuth } from './lib/api/auth.service'
import { setUnauthorizedHandler } from './lib/api/client'
import { AppLoadingPage } from './pages/shared/app-loading-page'
import { router } from './router'

function App() {
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    let isMounted = true

    setUnauthorizedHandler(() => {
      void router.navigate({ to: '/login' })
    })

    const bootstrapAuth = async (): Promise<void> => {
      await initializeAuth()

      if (isMounted) {
        setIsInitializing(false)
      }
    }

    void bootstrapAuth()

    return () => {
      setUnauthorizedHandler(null)
      isMounted = false
    }
  }, [])

  if (isInitializing) {
    return <AppLoadingPage />
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
