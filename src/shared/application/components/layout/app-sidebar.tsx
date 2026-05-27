import { type ComponentType, type SVGProps } from 'react'

import {
  ArrowLeftIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Link, useRouterState } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type AppSidebarNavigationItem = {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  disabled?: boolean
  matches?: (pathname: string) => boolean
}

type AppSidebarProps = {
  isDesktop: boolean
  isDesktopCollapsed: boolean
  appName: string
  appCaption: string
  homeIcon: ComponentType<SVGProps<SVGSVGElement>>
  homeSelectorHref: string
  activeHomeName: string | null
  navigationItems: AppSidebarNavigationItem[]
  onCreateHome: () => void
  isCreatingHome?: boolean
  onLeaveHome: () => void
  leaveHomeLabel: string
  logoutIcon: ComponentType<SVGProps<SVGSVGElement>>
  currentUserInitials: string
  currentUserName: string
  currentUserEmail: string
  onToggleDesktopCollapse: () => void
  onCloseMobileSidebar: () => void
}

export const AppSidebar = ({
  isDesktop,
  isDesktopCollapsed,
  appName,
  appCaption,
  homeIcon: HomeIcon,
  homeSelectorHref,
  activeHomeName,
  navigationItems,
  onCreateHome,
  isCreatingHome = false,
  onLeaveHome,
  leaveHomeLabel,
  logoutIcon: LogoutIcon,
  currentUserInitials,
  currentUserName,
  currentUserEmail,
  onToggleDesktopCollapse,
  onCloseMobileSidebar,
}: AppSidebarProps) => {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  const isDesktopIconRail = isDesktop && isDesktopCollapsed
  const hasActiveHome = Boolean(activeHomeName?.trim())
  const isHomeSelectorRoute = pathname === homeSelectorHref
  const canShowHomeActions = hasActiveHome && !isHomeSelectorRoute

  return (
    <div className="flex h-full flex-col bg-[#0a1019]/96 backdrop-blur-xl">
      <div
        className={cn(
          'border-b border-white/6',
          isDesktopIconRail ? 'space-y-2 px-2 py-3' : 'flex items-center justify-between px-4 py-4',
        )}
      >
        <Link to="/homes" className={cn(isDesktopIconRail ? 'flex justify-center' : 'min-w-0 flex-1')}>
          <div className={cn('flex items-center gap-3', isDesktopIconRail ? 'justify-center' : undefined)}>
            <div className="flex size-10 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary">
              <HomeIcon className="size-5" />
            </div>
            {!isDesktopIconRail ? (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{appName}</p>
                <p className="truncate text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {appCaption}
                </p>
              </div>
            ) : null}
          </div>
        </Link>

        {isDesktop ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onToggleDesktopCollapse}
            className={cn(isDesktopIconRail ? 'mx-auto block' : undefined)}
            aria-label={isDesktopCollapsed ? 'Expandir sidebar' : 'Colapsar sidebar'}
          >
            {isDesktopCollapsed ? (
              <ChevronDoubleRightIcon className="size-4" />
            ) : (
              <ChevronDoubleLeftIcon className="size-4" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            onClick={onCloseMobileSidebar}
            aria-label="Cerrar menu"
          >
            <XMarkIcon className="size-5" />
          </Button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-3">
          <div className={cn(isDesktopCollapsed ? 'flex justify-center py-1' : 'px-2')}>
            {isDesktopCollapsed ? (
              <>
                <span className="sr-only">Hogar activo</span>
                <span aria-hidden className="block h-px w-8 rounded-full bg-white/12" />
              </>
            ) : (
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                Hogar activo
              </p>
            )}
          </div>
          {canShowHomeActions ? (
            <Button
              asChild
              type="button"
              variant="ghost"
              size={isDesktopCollapsed ? 'icon-sm' : 'sm'}
              className={cn(
                'w-full rounded-2xl border border-white/10 bg-white/3 text-foreground hover:border-primary/35 hover:bg-primary/10',
                isDesktopCollapsed ? 'mx-auto' : 'justify-start',
              )}
            >
              <Link
                to={homeSelectorHref}
                aria-label={`Volver al selector de hogares${activeHomeName ? ` desde ${activeHomeName}` : ''}`}
              >
                <ArrowLeftIcon className="size-4" />
                {!isDesktopCollapsed ? <span>Volver</span> : null}
              </Link>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size={isDesktopCollapsed ? 'icon-sm' : 'sm'}
            onClick={onCreateHome}
            disabled={isCreatingHome}
            className={cn(
              'mt-2 w-full rounded-2xl border border-primary/35 bg-primary/10 text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] hover:bg-primary/18',
              isDesktopCollapsed ? 'mx-auto justify-center' : 'justify-start',
            )}
          >
            <PlusIcon className="size-4" />
            {!isDesktopCollapsed ? <span>{isCreatingHome ? 'Creando...' : 'Nuevo hogar'}</span> : null}
          </Button>
        </div>

        {canShowHomeActions ? (
          <div className="mt-8 space-y-2">
            <div className={cn(isDesktopCollapsed ? 'flex justify-center py-1' : 'px-2')}>
              {isDesktopCollapsed ? (
                <>
                  <span className="sr-only">Menu</span>
                  <span aria-hidden className="block h-px w-8 rounded-full bg-white/12" />
                </>
              ) : (
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground/80">
                  Menu
                </p>
              )}
            </div>
            {navigationItems.map((item) => {
              const isActive = item.matches
                ? item.matches(pathname)
                : pathname === item.to || pathname.startsWith(`${item.to}/`)

              return item.disabled ? (
                <button
                  key={item.label}
                  type="button"
                  disabled
                  className={cn(
                    'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm text-muted-foreground/60',
                    isDesktopCollapsed ? 'justify-center' : undefined,
                  )}
                >
                  <item.icon className="size-5 shrink-0" />
                  {!isDesktopCollapsed ? <span>{item.label}</span> : null}
                </button>
              ) : (
                <Link key={item.label} to={item.to}>
                  <div
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition',
                      isDesktopCollapsed ? 'justify-center' : undefined,
                      isActive
                        ? 'bg-primary/12 text-primary ring-1 ring-primary/20'
                        : 'text-muted-foreground hover:bg-white/4 hover:text-foreground',
                    )}
                  >
                    <item.icon className="size-5 shrink-0" />
                    {!isDesktopCollapsed ? <span className="font-medium">{item.label}</span> : null}
                  </div>
                </Link>
              )
            })}
          </div>
        ) : null}
      </div>

      <div className="space-y-3 border-t border-white/6 px-3 py-4">
        {canShowHomeActions ? (
          <button
            type="button"
            onClick={onLeaveHome}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-sm text-muted-foreground transition hover:bg-white/4 hover:text-foreground',
              isDesktopCollapsed ? 'justify-center' : undefined,
            )}
          >
            <LogoutIcon className="size-5 shrink-0" />
            {!isDesktopCollapsed ? <span>{leaveHomeLabel}</span> : null}
          </button>
        ) : null}

        <div className="rounded-2xl border border-white/8 bg-white/3 p-3">
          <div className={cn('flex items-center gap-3', isDesktopCollapsed ? 'justify-center' : undefined)}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-200/90 text-sm font-semibold text-sky-900">
              {currentUserInitials}
            </div>
            {!isDesktopCollapsed ? (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">{currentUserName}</p>
                <p className="truncate text-xs text-muted-foreground">{currentUserEmail}</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
