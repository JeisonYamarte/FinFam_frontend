import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AuthLayout } from '@/shared/application/components/layout/auth-layout'
import {
  ProtectedRoute,
  protectRoute,
  redirectAuthenticatedUser,
} from '@/shared/application/components/routes/protected-route'
import { tokenStore } from '@/shared/infrastructure/http/client'
import { ForgotPasswordPage } from '@/features/auth/application/pages/forgot-password-page'
import { LoginPage } from '@/features/auth/application/pages/login-page'
import { RegisterPage } from '@/features/auth/application/pages/register-page'
import { ResetPasswordPage } from '@/features/auth/application/pages/reset-password-page'
import { VerifyEmailPage } from '@/features/auth/application/pages/verify-email-page'
import { DashboardPage } from '../pages/app/dashboard-page'
import { NotFoundPage } from '@/shared/application/pages/not-found-page'
import { HomesPage } from '@/features/homes/application/pages/homes-page'
import { HomeSettingsPage } from '@/features/homes/application/pages/home-settings-page'
import { ComingSoonPage } from '@/shared/application/pages/coming-soon-page'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const publicGuard = (): void => {
  if (tokenStore.get()) {
    redirectAuthenticatedUser()
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (tokenStore.get()) {
      redirectAuthenticatedUser()
    }

    throw redirect({ to: '/login' })
  },
})

const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  beforeLoad: publicGuard,
  component: AuthLayout,
})

const tokenActionRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'token-action',
  component: AuthLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/login',
  component: LoginPage,
})

const registerRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/register',
  component: RegisterPage,
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/forgot-password',
  component: ForgotPasswordPage,
})

const resetPasswordSearchSchema = z.object({
  token: z.string().optional(),
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => tokenActionRoute,
  path: '/reset-password',
  validateSearch: (search) => resetPasswordSearchSchema.parse(search),
  component: () => {
    const search = resetPasswordRoute.useSearch()
    return <ResetPasswordPage token={search.token} />
  },
})

const verifyEmailSearchSchema = z.object({
  token: z.string().optional(),
})

const verifyEmailRoute = createRoute({
  getParentRoute: () => tokenActionRoute,
  path: '/verify-email',
  validateSearch: (search) => verifyEmailSearchSchema.parse(search),
  component: () => {
    const search = verifyEmailRoute.useSearch()
    return <VerifyEmailPage token={search.token} />
  },
})

const protectedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'protected',
  beforeLoad: protectRoute(),
  component: ProtectedRoute,
})

const homesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/homes',
  component: HomesPage,
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  beforeLoad: protectRoute({ requiresHome: true }),
  component: DashboardPage,
})

const expensesRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/expenses',
  beforeLoad: protectRoute({ requiresHome: true }),
  component: () => (
    <ComingSoonPage
      title="Gastos"
      description="La ruta ya esta lista dentro del shell protegido y quedara conectada al detalle de gastos del hogar activo."
    />
  ),
})

const closuresRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/closures',
  beforeLoad: protectRoute({ requiresHome: true }),
  component: () => (
    <ComingSoonPage
      title="Cierres"
      description="La ruta ya esta lista para recibir simulacion y creacion de cierres del hogar activo."
    />
  ),
})

const membersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/members',
  beforeLoad: protectRoute({ requiresHome: true }),
  component: () => (
    <ComingSoonPage
      title="Miembros"
      description="La ruta ya esta lista para conectar invitaciones, roles y administracion de miembros."
    />
  ),
})

const homeSettingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/homes/$homeId/settings',
  beforeLoad: protectRoute({ requiresHome: true, requiresAdmin: true }),
  component: HomeSettingsPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
  ]),
  tokenActionRoute.addChildren([resetPasswordRoute, verifyEmailRoute]),
  protectedRoute.addChildren([
    homesRoute,
    dashboardRoute,
    expensesRoute,
    closuresRoute,
    membersRoute,
    homeSettingsRoute,
  ]),
])

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
