import { useState, type ComponentType, type SVGProps } from 'react'

import {
  ArrowRightStartOnRectangleIcon,
  Cog6ToothIcon,
  CreditCardIcon,
  HomeModernIcon,
  QueueListIcon,
  Squares2X2Icon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Outlet, redirect, useNavigate } from '@tanstack/react-router'

import { useCurrentUser } from '@/features/auth/application/hooks/use-current-user'
import { logout } from '@/features/auth/infrastructure/api-auth.repository'
import { CreateHomeModal } from '@/features/homes/application/components/create-home-modal'
import { useCreateHome } from '@/features/homes/application/hooks/use-homes'
import { AppLayout, type AppLayoutNavigationItem } from '@/shared/application/components/layout/app-layout'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { tokenStore } from '@/shared/infrastructure/http/client'
import {
  clearActiveHomeSession,
  setActiveHomeSession,
} from '@/stores/active-home.actions'
import {
  activeHomeSelectors,
  useActiveHomeStore,
} from '@/stores/active-home.store'

type GuardOptions = {
  requiresHome?: boolean
  requiresAdmin?: boolean
}

type NavigationDefinition = {
  label: string
  to: string
  icon: ComponentType<SVGProps<SVGSVGElement>>
  disabled?: boolean
  matches?: (pathname: string) => boolean
}

const getAuthenticatedRedirectPath = (): string =>
  useActiveHomeStore.getState().activeHomeId ? '/dashboard' : '/homes'

export const redirectAuthenticatedUser = (): never => {
  throw redirect({ to: getAuthenticatedRedirectPath() })
}

export const protectRoute = ({ requiresHome = false, requiresAdmin = false }: GuardOptions = {}) => {
  return (): void => {
    if (!tokenStore.get()) {
      throw redirect({ to: '/login' })
    }

    const { activeHomeId, activeUserRole } = useActiveHomeStore.getState()

    if (requiresHome && !activeHomeId) {
      throw redirect({ to: '/homes' })
    }

    if (requiresAdmin && activeUserRole !== 'ADMIN') {
      toast({
        title: 'No tienes permisos',
        description: 'Necesitas rol ADMIN para entrar a esta seccion.',
        variant: 'error',
      })
      throw redirect({ to: '/dashboard' })
    }
  }
}

const getDisplayName = (name?: string, lastName?: string, email?: string): string => {
  const fullName = [name, lastName]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(' ')

  if (fullName) {
    return fullName
  }

  if (email) {
    return email.split('@')[0] || 'Usuario'
  }

  return 'Usuario'
}

const getUserInitials = (name?: string, lastName?: string, email?: string): string => {
  const fullName = getDisplayName(name, lastName, email)
  const words = fullName.split(' ').filter(Boolean)

  if (words.length >= 2) {
    return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase()
  }

  const firstWord = words[0] ?? ''
  const fallback = firstWord.slice(0, 2).toUpperCase()

  return fallback || 'FF'
}

export const ProtectedRoute = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isCreateHomeModalOpen, setIsCreateHomeModalOpen] = useState(false)

  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const activeUserRole = useActiveHomeStore(activeHomeSelectors.role)

  const { data: currentUser } = useCurrentUser()
  const currentUserDisplayName = getDisplayName(
    currentUser?.name,
    typeof currentUser?.lastName === 'string' ? currentUser.lastName : undefined,
    currentUser?.email,
  )
  const createHomeMutation = useCreateHome()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      clearActiveHomeSession()
      queryClient.clear()
      await navigate({ to: '/login' })
    },
  })

  const navigationItems: AppLayoutNavigationItem[] = [
    {
      label: 'Dashboard',
      to: '/dashboard',
      icon: Squares2X2Icon,
      disabled: !activeHomeId,
      matches: (pathname) => pathname === '/dashboard',
    },
    {
      label: 'Gastos',
      to: '/expenses',
      icon: CreditCardIcon,
      disabled: !activeHomeId,
      matches: (pathname) => pathname.startsWith('/expenses'),
    },
    {
      label: 'Cierres',
      to: '/closures',
      icon: QueueListIcon,
      disabled: !activeHomeId,
      matches: (pathname) => pathname.startsWith('/closures'),
    },
    {
      label: 'Miembros',
      to: '/members',
      icon: UsersIcon,
      disabled: !activeHomeId,
      matches: (pathname) => pathname.startsWith('/members'),
    },
    {
      label: 'Configuracion',
      to: activeHomeId ? `/homes/${activeHomeId}/settings` : '/homes',
      icon: Cog6ToothIcon,
      disabled: !activeHomeId,
      matches: (pathname) => pathname.includes('/settings'),
    },
  ] satisfies NavigationDefinition[]

  const handleCreateHome = async ({ name }: { name: string }) => {
    const createdHome = await createHomeMutation.mutateAsync({ name })

    setActiveHomeSession({
      id: createdHome.id,
      name: createdHome.name,
      role: createdHome.role,
    })

    toast({
      title: 'Hogar creado',
      description: `${createdHome.name} ya esta listo para usarse.`,
      variant: 'success',
    })

    setIsCreateHomeModalOpen(false)
    await navigate({ to: '/dashboard' })
  }

  return (
    <>
      <AppLayout
        activeHomeName={activeHomeName}
        activeUserRole={activeUserRole}
        currentUserEmail={currentUser?.email ?? ''}
        currentUserInitials={getUserInitials(
          currentUser?.name,
          typeof currentUser?.lastName === 'string' ? currentUser.lastName : undefined,
          currentUser?.email,
        )}
        currentUserName={currentUserDisplayName}
        homeSelectorHref="/homes"
        isCreatingHome={createHomeMutation.isPending}
        isLoggingOut={logoutMutation.isPending}
        navigationItems={navigationItems}
        onCreateHome={() => {
          setIsCreateHomeModalOpen(true)
        }}
        onLogout={() => {
          void logoutMutation.mutateAsync()
        }}
        onLeaveHome={() => {
          clearActiveHomeSession()
          toast({
            title: 'Hogar deseleccionado',
            description: 'Puedes elegir otro hogar desde la lista.',
            variant: 'info',
          })
          void navigate({ to: '/homes' })
        }}
        logoutLabel="Salir de la sesion"
        leaveHomeLabel="Salir del hogar"
        appName="FinFam"
        appCaption="Casas"
        homeIcon={HomeModernIcon}
        logoutIcon={ArrowRightStartOnRectangleIcon}
      >
        <Outlet />
      </AppLayout>
      <CreateHomeModal
        error={createHomeMutation.error}
        isOpen={isCreateHomeModalOpen}
        isPending={createHomeMutation.isPending}
        onClose={() => {
          setIsCreateHomeModalOpen(false)
          createHomeMutation.reset()
        }}
        onSubmit={handleCreateHome}
      />
    </>
  )
}