import {
  Outlet,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { z } from 'zod'

import { AuthLayout } from '@/shared/application/components/layout/auth-layout'
import { LandingLayout } from '@/shared/application/components/layout/landing-layout'
import LandingPage from '@/features/auth/application/pages/landing-page'
import {
  ProtectedRoute,
  protectRoute,
  redirectAuthenticatedUser,
} from '@/shared/application/components/routes/protected-route'
import { tokenStore } from '@/shared/infrastructure/http/client'
import { waitForAuthReady } from '@/shared/infrastructure/http/auth-init'
import { ForgotPasswordPage } from '@/features/auth/application/pages/forgot-password-page'
import { LoginPage } from '@/features/auth/application/pages/login-page'
import { RegisterPage } from '@/features/auth/application/pages/register-page'
import { ResetPasswordPage } from '@/features/auth/application/pages/reset-password-page'
import { VerifyEmailPage } from '@/features/auth/application/pages/verify-email-page'
import { DashboardPage } from '../pages/app/dashboard-page'
import { NotFoundPage } from '@/shared/application/pages/not-found-page'
import { ClosuresPage } from '@/features/closures/application/pages/closures-page'
import { HomesPage } from '@/features/homes/application/pages/homes-page'
import { HomeSettingsPage } from '@/features/homes/application/pages/home-settings-page'
import { MembersPage } from '@/features/homes/application/pages/members-page'
import { AcceptInvitationPage } from '@/features/invitations/application/pages/accept-invitation-page'
import { ExpensesPage } from '@/features/expenses/application/pages/expenses-page'

const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: NotFoundPage,
})

const publicGuard = async (): Promise<void> => {
  await waitForAuthReady()
  if (tokenStore.get()) {
    redirectAuthenticatedUser()
  }
}

const landingLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'landing',
  component: LandingLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => landingLayoutRoute,
  path: '/',
  component: LandingPage,
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

const closuresSearchSchema = z.object({
  action: z.enum(['simulate', 'create']).optional(),
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

const verifyEmailTokenRoute = createRoute({
  getParentRoute: () => tokenActionRoute,
  path: '/verify-email/$token',
  component: () => {
    const { token } = verifyEmailTokenRoute.useParams()
    return <VerifyEmailPage token={token} />
  },
})

const invitationRoute = createRoute({
  getParentRoute: () => tokenActionRoute,
  path: '/invitations/$invitationId',
  component: () => {
    const { invitationId } = invitationRoute.useParams()
    return <AcceptInvitationPage invitationId={invitationId} />
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
  component: ExpensesPage,
})

const closuresRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/closures',
  validateSearch: (search) => closuresSearchSchema.parse(search),
  beforeLoad: protectRoute({ requiresHome: true }),
  component: () => {
    const search = closuresRoute.useSearch()
    return <ClosuresPage initialAction={search.action ?? null} />
  },
})

const membersRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/members',
  beforeLoad: protectRoute({ requiresHome: true }),
  component: MembersPage,
})

const homeSettingsRoute = createRoute({
  getParentRoute: () => protectedRoute,
  path: '/homes/$homeId/settings',
  beforeLoad: protectRoute({ requiresHome: true, requiresAdmin: true }),
  component: HomeSettingsPage,
})

const routeTree = rootRoute.addChildren([
  landingLayoutRoute.addChildren([indexRoute]),
  publicRoute.addChildren([
    loginRoute,
    registerRoute,
    forgotPasswordRoute,
  ]),
  tokenActionRoute.addChildren([
    resetPasswordRoute,
    verifyEmailRoute,
    verifyEmailTokenRoute,
    invitationRoute,
  ]),
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
