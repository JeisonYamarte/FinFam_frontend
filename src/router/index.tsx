import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AuthLayout } from '../components/layout/auth-layout'
import { tokenStore } from '../lib/api/client'
import { ForgotPasswordPage } from '../features/auth/pages/forgot-password-page'
import { LoginPage } from '../features/auth/pages/login-page'
import { RegisterPage } from '../features/auth/pages/register-page'
import { ResetPasswordPage } from '../features/auth/pages/reset-password-page'
import { VerifyEmailPage } from '../features/auth/pages/verify-email-page'
import { DashboardPage } from '../pages/app/dashboard-page'
import { NotFoundPage } from '../pages/shared/not-found-page'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const publicGuard = (): void => {
  if (tokenStore.get()) {
    throw redirect({ to: '/dashboard' })
  }
}

const protectedGuard = (): void => {
  if (!tokenStore.get()) {
    throw redirect({ to: '/login' })
  }
}

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (tokenStore.get()) {
      throw redirect({ to: '/dashboard' })
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
  getParentRoute: () => publicRoute,
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
  getParentRoute: () => publicRoute,
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
  beforeLoad: protectedGuard,
  component: Outlet,
})

const dashboardRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/dashboard',
  component: DashboardPage,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  publicRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
    resetPasswordRoute,
    verifyEmailRoute,
  ]),
  protectedRoute.addChildren([dashboardRoute]),
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
