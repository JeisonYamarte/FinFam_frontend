import { useState } from 'react'

import {
  CheckCircleIcon,
  HomeIcon,
  XCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AuthShell } from '@/features/auth/application/components/auth-shell'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import {
  acceptInvitation,
  declineInvitation,
} from '../../infrastructure/api-invitations.repository'

type InvitationAction = 'accept' | 'decline'
type InvitationState = 'idle' | 'accepted' | 'declined' | 'error'

type AcceptInvitationPageProps = {
  invitationId: string
}

export const AcceptInvitationPage = ({ invitationId }: AcceptInvitationPageProps) => {
  const [state, setState] = useState<InvitationState>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const acceptMutation = useMutation({
    mutationFn: () => acceptInvitation(invitationId),
    onSuccess: () => setState('accepted'),
    onError: (error) => {
      setErrorMessage(
        getErrorMessage(error, 'No pudimos aceptar la invitacion. El enlace puede haber expirado.', {
          404: 'Esta invitacion no existe o ya fue utilizada.',
          410: 'Esta invitacion ha expirado.',
        }),
      )
      setState('error')
    },
  })

  const declineMutation = useMutation({
    mutationFn: () => declineInvitation(invitationId),
    onSuccess: () => setState('declined'),
    onError: (error) => {
      setErrorMessage(
        getErrorMessage(error, 'No pudimos rechazar la invitacion. El enlace puede haber expirado.', {
          404: 'Esta invitacion no existe o ya fue utilizada.',
          410: 'Esta invitacion ha expirado.',
        }),
      )
      setState('error')
    },
  })

  const isLoading = acceptMutation.isPending || declineMutation.isPending

  const handleAction = (action: InvitationAction) => {
    if (isLoading) return
    if (action === 'accept') {
      acceptMutation.mutate()
    } else {
      declineMutation.mutate()
    }
  }

  if (state === 'accepted') {
    return (
      <AuthShell
        title="Bienvenido al hogar"
        description="Ya eres parte de este hogar en FinFam."
        footerText="Tienes una cuenta?"
        footerLinkText="Iniciar sesion"
        footerLinkTo="/login"
      >
        <div className="space-y-4">
          <CheckCircleIcon className="mx-auto size-12 text-success" />
          <Alert variant="success">
            Aceptaste la invitacion exitosamente. Inicia sesion para ver tu hogar.
          </Alert>
          <Link to="/login">
            <Button className="w-full" type="button">
              Ir a iniciar sesion
            </Button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  if (state === 'declined') {
    return (
      <AuthShell
        title="Invitacion rechazada"
        description="Has rechazado la invitacion a este hogar."
        footerText="Tienes una cuenta?"
        footerLinkText="Iniciar sesion"
        footerLinkTo="/login"
      >
        <div className="space-y-4">
          <XCircleIcon className="mx-auto size-12 text-muted-foreground" />
          <Alert variant="info">
            Rechazaste la invitacion. Si fue un error, contacta al administrador del hogar para
            que te envie una nueva.
          </Alert>
          <Link to="/login">
            <Button className="w-full" variant="outline" type="button">
              Ir a iniciar sesion
            </Button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  if (state === 'error') {
    return (
      <AuthShell
        title="Algo salio mal"
        description="No pudimos procesar tu respuesta a la invitacion."
      >
        <div className="space-y-4">
          <XCircleIcon className="mx-auto size-12 text-destructive" />
          <Alert variant="error">{errorMessage}</Alert>
          <Link to="/login">
            <Button className="w-full" variant="outline" type="button">
              Ir a iniciar sesion
            </Button>
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="Invitacion a un hogar"
      description="Te invitaron a unirte a un hogar en FinFam."
    >
      <div className="space-y-6">
        <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/40 px-4 py-6 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-primary/10">
            <HomeIcon className="size-7 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">Tienes una invitacion pendiente</p>
            <p className="text-xs text-muted-foreground">
              Acepta para unirte y empezar a gestionar gastos compartidos con tu hogar.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <UserGroupIcon className="size-4" />
            <span>Podras ver y compartir gastos con los miembros del hogar</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            className="flex-1"
            type="button"
            disabled={isLoading}
            onClick={() => handleAction('accept')}
          >
            {acceptMutation.isPending ? 'Aceptando...' : 'Aceptar invitacion'}
          </Button>
          <Button
            className="flex-1"
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => handleAction('decline')}
          >
            {declineMutation.isPending ? 'Rechazando...' : 'Rechazar'}
          </Button>
        </div>
      </div>
    </AuthShell>
  )
}
