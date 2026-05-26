import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { AppLayout } from '@/shared/application/components/layout/app-layout'
import { Alert } from '../../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useCurrentUser } from '@/features/auth/application/hooks/use-current-user'
import { logout } from '@/features/auth/infrastructure/api-auth.repository'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { data: currentUser, isLoading } = useCurrentUser()

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: async () => {
      queryClient.clear()
      await navigate({ to: '/login' })
    },
  })

  return (
    <AppLayout
      isLoggingOut={logoutMutation.isPending}
      onLogout={() => {
        void logoutMutation.mutateAsync()
      }}
    >
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Alert variant="info">Cargando informacion de tu sesion...</Alert>
          ) : (
            <div className="space-y-2 text-sm text-foreground">
              <p>
                Hola, <span className="font-semibold">{currentUser?.firstName ?? 'Usuario'}</span>
              </p>
              <p className="text-muted-foreground">{currentUser?.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
