import { useState, type ComponentType, type ReactNode, type SVGProps } from 'react'

import {
  Bars3Icon,
} from '@heroicons/react/24/outline'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/shared/application/hooks/use-media-query'

import { AppSidebar, type AppSidebarNavigationItem } from './app-sidebar'

export type AppLayoutNavigationItem = AppSidebarNavigationItem

type AppLayoutProps = {
  children: ReactNode
  activeHomeName: string | null
  activeUserRole: 'ADMIN' | 'GUEST' | null
  currentUserEmail: string
  currentUserInitials: string
  currentUserName: string
  homeSelectorHref: string
  navigationItems: AppLayoutNavigationItem[]
  onLogout: () => void
  onLeaveHome: () => void
  onCreateHome: () => void
  isCreatingHome?: boolean
  isLoggingOut?: boolean
  logoutLabel: string
  leaveHomeLabel: string
  appName: string
  appCaption: string
  homeIcon: ComponentType<SVGProps<SVGSVGElement>>
  logoutIcon: ComponentType<SVGProps<SVGSVGElement>>
}

const roleBadgeClassName = {
  ADMIN: 'bg-sky-400/15 text-sky-200 ring-1 ring-sky-300/25',
  GUEST: 'bg-emerald-400/15 text-emerald-100 ring-1 ring-emerald-300/25',
}

export const AppLayout = ({
  children,
  activeHomeName,
  activeUserRole,
  currentUserEmail,
  currentUserInitials,
  currentUserName,
  homeSelectorHref,
  navigationItems,
  onLogout,
  onLeaveHome,
  onCreateHome,
  isCreatingHome = false,
  isLoggingOut = false,
  logoutLabel,
  leaveHomeLabel,
  appName,
  appCaption,
  homeIcon: HomeIcon,
  logoutIcon: LogoutIcon,
}: AppLayoutProps) => {
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#132435_0%,#0a1019_42%,#050913_100%)] text-foreground">
      {!isDesktop && isMobileSidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-[2px]"
          onClick={() => {
            setIsMobileSidebarOpen(false)
          }}
          aria-label="Cerrar sidebar"
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-white/6 shadow-2xl shadow-black/35 transition-transform lg:w-auto lg:translate-x-0',
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full',
          isDesktopCollapsed ? 'lg:w-16' : 'lg:w-60',
        )}
      >
        <AppSidebar
          isDesktop={isDesktop}
          isDesktopCollapsed={isDesktopCollapsed}
          appName={appName}
          appCaption={appCaption}
          homeIcon={HomeIcon}
          homeSelectorHref={homeSelectorHref}
          activeHomeName={activeHomeName}
          navigationItems={navigationItems}
          onCreateHome={onCreateHome}
          isCreatingHome={isCreatingHome}
          onLeaveHome={onLeaveHome}
          leaveHomeLabel={leaveHomeLabel}
          logoutIcon={LogoutIcon}
          currentUserInitials={currentUserInitials}
          currentUserName={currentUserName}
          currentUserEmail={currentUserEmail}
          onToggleDesktopCollapse={() => {
            setIsDesktopCollapsed((currentValue) => !currentValue)
          }}
          onCloseMobileSidebar={() => {
            setIsMobileSidebarOpen(false)
          }}
        />
      </aside>

      <div className={cn('min-h-screen transition-[padding] duration-200', isDesktopCollapsed ? 'lg:pl-16' : 'lg:pl-60')}>
        <header className="sticky top-0 z-30 border-b border-white/6 bg-background/80 backdrop-blur-xl">
          <div className="flex items-center justify-between gap-3 p-4 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-center gap-3">
              {!isDesktop ? (
                <Button
                  type="button"
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => {
                    setIsMobileSidebarOpen(true)
                  }}
                  aria-label="Abrir menu"
                >
                  <Bars3Icon className="size-5" />
                </Button>
              ) : null}
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate text-base font-semibold text-foreground sm:text-lg">
                    {activeHomeName ?? 'Sin hogar activo'}
                  </p>
                  {activeUserRole ? (
                    <span
                      className={cn(
                        'inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em]',
                        roleBadgeClassName[activeUserRole],
                      )}
                    >
                      {activeUserRole}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground/80">
                  Gestion del hogar activo
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-semibold text-foreground">{currentUserName}</p>
                <p className="text-xs text-muted-foreground">{currentUserEmail}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-full bg-sky-200/90 text-sm font-semibold text-sky-900">
                {currentUserInitials}
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onLogout}
                disabled={isLoggingOut}
                className="inline-flex"
                aria-label={logoutLabel}
              >
                <LogoutIcon className="size-4" />
                <span className="hidden sm:inline">{isLoggingOut ? 'Saliendo...' : logoutLabel}</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</div>
      </div>
    </main>
  )
}
