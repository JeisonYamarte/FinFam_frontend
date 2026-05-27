
import { useEffect, useState } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from './lib/query-client'
import { initializeAuth } from '@/shared/infrastructure/http/auth-http.service'
import { setUnauthorizedHandler } from '@/shared/infrastructure/http/client'
import { AppLoadingPage } from '@/shared/application/pages/app-loading-page'
import { ToastProvider } from '@/shared/application/components/feedback/toast-provider'
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
      <ToastProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
