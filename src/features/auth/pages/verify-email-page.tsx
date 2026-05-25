import { useMemo } from 'react'

import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'

import { Alert } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import { AuthShell } from '../components/auth-shell'
import { getErrorMessage } from '../services/error-message'
import { verifyEmail } from '../services/auth-api.service'

type VerifyEmailPageProps = {
  token?: string
}

export const VerifyEmailPage = ({ token }: VerifyEmailPageProps) => {
  const query = useQuery({
    queryKey: ['verify-email', token],
    queryFn: async () => verifyEmail(token as string),
    enabled: Boolean(token),
    retry: false,
  })

  const content = useMemo(() => {
    if (!token) {
      return (
        <Alert variant="error">
          No encontramos un token de verificacion valido en el enlace.
        </Alert>
      )
    }

    if (query.isPending) {
      return <Alert variant="info">Verificando tu correo, espera un momento...</Alert>
    }

    if (query.isError) {
      return (
        <Alert variant="error">
          {getErrorMessage(query.error, 'No pudimos verificar el correo.')}
        </Alert>
      )
    }

    return <Alert variant="success">{query.data}</Alert>
  }, [query.data, query.error, query.isError, query.isPending, token])

  return (
    <AuthShell
      description="Confirmamos tu direccion de correo para proteger tu cuenta."
      footerLinkText="Iniciar sesion"
      footerLinkTo="/login"
      footerText="Listo para entrar?"
      title="Verificacion de correo"
    >
      <div className="space-y-4">
        {query.isSuccess ? (
          <CheckCircleIcon className="mx-auto size-12 text-success" />
        ) : (
          <XCircleIcon className="mx-auto size-12 text-muted-foreground" />
        )}

        {content}

        <Link to="/login">
          <Button className="w-full" type="button">
            Ir a login
          </Button>
        </Link>
      </div>
    </AuthShell>
  )
}
