
import { useEffect } from 'react'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'

import { queryClient } from './lib/query-client'
import { startAuthInit } from '@/shared/infrastructure/http/auth-init'
import { setUnauthorizedHandler } from '@/shared/infrastructure/http/client'
import { ToastProvider } from '@/shared/application/components/feedback/toast-provider'
import { router } from './router'

startAuthInit()

function App() {
  useEffect(() => {
    setUnauthorizedHandler(() => {
      void router.navigate({ to: '/login' })
    })

    return () => {
      setUnauthorizedHandler(null)
    }
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <RouterProvider router={router} />
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </ToastProvider>
    </QueryClientProvider>
  )
}

export default App
