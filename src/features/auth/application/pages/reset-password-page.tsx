import { useEffect } from 'react'

import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Alert } from '@/components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { AuthShell } from '../components/auth-shell'
import { PasswordField } from '../components/password-field'
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '../../domain/auth.schemas'
import { getErrorMessage } from '../utils/error-message'
import { resetPassword } from '../../infrastructure/api-auth.repository'

type ResetPasswordPageProps = {
  token?: string
}

const normalizeToken = (value?: string): string | undefined => {
  if (!value) {
    return undefined
  }

  const trimmed = value.trim()

  if (!trimmed) {
    return undefined
  }

  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    const unwrapped = trimmed.slice(1, -1).trim()
    return unwrapped || undefined
  }

  return trimmed
}

export const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  const navigate = useNavigate()
  const normalizedToken = normalizeToken(token)

  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: normalizedToken ?? '',
      newPassword: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: resetPassword,
  })

  useEffect(() => {
    if (!normalizedToken) {
      return
    }

    if (form.getValues('token') === normalizedToken) {
      return
    }

    form.setValue('token', normalizedToken, {
      shouldDirty: false,
      shouldValidate: true,
    })
    form.clearErrors('token')
  }, [form, normalizedToken])

  useEffect(() => {
    if (!mutation.isSuccess) {
      return
    }

    const timeoutId = window.setTimeout(() => {
      void navigate({ to: '/login' })
    }, 1400)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [mutation.isSuccess, navigate])

  const onSubmit = async (values: ResetPasswordSchema) => {
    mutation.reset()

    const tokenValue = normalizedToken ?? values.token

    if (!tokenValue) {
      form.setError('token', {
        type: 'manual',
        message: 'No encontramos un token valido para restablecer tu contrasena.',
      })
      return
    }

    const payload = {
      token: tokenValue,
      newPassword: values.newPassword,
    }

    await mutation.mutateAsync(payload)
  }

  if (!normalizedToken) {
    return (
      <AuthShell
        description="El enlace de recuperacion es invalido o vencido."
        footerLinkText="Ir a login"
        footerLinkTo="/login"
        footerText="Ya tienes acceso?"
        title="Token no valido"
      >
        <Alert variant="error">
          No encontramos un token valido. Solicita un nuevo enlace de recuperacion.
        </Alert>
      </AuthShell>
    )
  }

  if (mutation.isSuccess) {
    return (
      <AuthShell
        description="Tu contrasena se actualizo correctamente."
        footerLinkText="Ir a login ahora"
        footerLinkTo="/login"
        footerText="Te redirigiremos automaticamente en un momento."
        title="Contrasena actualizada"
      >
        <Alert variant="success">Contrasena cambiada. Redirigiendo a login...</Alert>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      description="Define una nueva contrasena para continuar."
      footerLinkText="Volver a login"
      footerLinkTo="/login"
      footerText="Recordaste tu contrasena?"
      title="Restablecer contrasena"
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="token"
            render={({ field }) => (
              <input type="hidden" {...field} value={normalizedToken ?? field.value ?? ''} />
            )}
          />

          {form.formState.errors.token?.message ? (
            <Alert variant="error">{form.formState.errors.token.message}</Alert>
          ) : null}

          <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nueva contrasena</FormLabel>
                <FormControl>
                  <PasswordField autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirmar nueva contrasena</FormLabel>
                <FormControl>
                  <PasswordField autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mutation.error ? (
            <Alert variant="error">
              {getErrorMessage(mutation.error, 'No se pudo cambiar la contrasena.', {
                400: 'El enlace de recuperacion es invalido o vencido.',
                410: 'El enlace de recuperacion ya no esta disponible.',
                422: 'La nueva contrasena no cumple los requisitos.',
              })}
            </Alert>
          ) : null}

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Guardando...' : 'Actualizar contrasena'}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        <Link className="font-semibold text-primary hover:text-primary/80" to="/login">
          Volver a iniciar sesion
        </Link>
      </p>
    </AuthShell>
  )
}
