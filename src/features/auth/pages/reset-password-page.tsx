import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Button } from '@/components/ui/button'
import { Alert } from '../../../components/ui/alert'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { AuthShell } from '../components/auth-shell'
import { PasswordField } from '../components/password-field'
import {
  resetPasswordSchema,
  type ResetPasswordSchema,
} from '../schemas/auth.schemas'
import { getErrorMessage } from '../services/error-message'
import { resetPassword } from '../services/auth-api.service'

type ResetPasswordPageProps = {
  token?: string
}

export const ResetPasswordPage = ({ token }: ResetPasswordPageProps) => {
  const navigate = useNavigate()
  const form = useForm<ResetPasswordSchema>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      token: token ?? '',
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: async () => {
      await navigate({ to: '/login' })
    },
  })

  const onSubmit = async (values: ResetPasswordSchema) => {
    mutation.reset()
    const payload = {
      token: values.token,
      password: values.password,
    }
    await mutation.mutateAsync(payload)
  }

  if (!token) {
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
            render={({ field }) => <input type="hidden" {...field} value={field.value ?? token} />}
          />

          <FormField
            control={form.control}
            name="password"
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
