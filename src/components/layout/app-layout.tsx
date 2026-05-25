import type { ReactNode } from 'react'

import { ArrowRightStartOnRectangleIcon } from '@heroicons/react/24/outline'

import { Button } from '../ui/button'

type AppLayoutProps = {
  children: ReactNode
  onLogout: () => void
  isLoggingOut?: boolean
}

export const AppLayout = ({
  children,
  onLogout,
  isLoggingOut = false,
}: AppLayoutProps) => (
  <main className="min-h-screen bg-background px-4 py-6 sm:px-6 sm:py-8">
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <header className="flex items-center justify-between rounded-2xl border border-border bg-card px-4 py-3 shadow-sm shadow-black/20">
        <h1 className="text-lg font-semibold text-foreground">FinFam</h1>
        <Button onClick={onLogout} size="sm" variant="secondary" disabled={isLoggingOut}>
          <ArrowRightStartOnRectangleIcon className="size-4" />
          {isLoggingOut ? 'Saliendo...' : 'Salir'}
        </Button>
      </header>
      {children}
    </div>
  </main>
)
