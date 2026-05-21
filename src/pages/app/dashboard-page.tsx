import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'

import { AppLayout } from '../../components/layout/app-layout'
import { Alert } from '../../components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { useCurrentUser } from '../../hooks/useCurrentUser'
import { logout } from '../../features/auth/services/auth-api.service'

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
            <div className="space-y-2 text-sm text-zinc-700">
              <p>
                Hola, <span className="font-semibold">{currentUser?.firstName ?? 'Usuario'}</span>
              </p>
              <p className="text-zinc-500">{currentUser?.email}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </AppLayout>
  )
}
