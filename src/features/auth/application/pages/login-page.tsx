import { Link, useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { CURRENT_USER_QUERY_KEY } from '../hooks/use-current-user'
import { loginSchema, type LoginSchema } from '../../domain/auth.schemas'
import { getErrorMessage } from '../utils/error-message'
import { login } from '../../infrastructure/api-auth.repository'
import { AuthShell } from '../components/auth-shell'
import { PasswordField } from '../components/password-field'

export const LoginPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      void navigate({ to: '/dashboard' })
    },
  })

  const onSubmit = async (values: LoginSchema) => {
    mutation.reset()
    await mutation.mutateAsync(values)
  }

  return (
    <AuthShell
      description="Inicia sesion para administrar tus finanzas del hogar."
      footerLinkText="Crear cuenta"
      footerLinkTo="/register"
      footerText="No tienes cuenta?"
      title="Bienvenido"
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Correo</FormLabel>
                <FormControl>
                  <Input autoComplete="email" type="email" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contrasena</FormLabel>
                <FormControl>
                  <PasswordField autoComplete="current-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link
              className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              to="/forgot-password"
            >
              Olvide mi contrasena
            </Link>
          </div>

          {mutation.error ? (
            <Alert variant="error">
              {getErrorMessage(mutation.error, 'No se pudo iniciar sesion.', {
                401: 'Correo o contrasena incorrectos.',
              })}
            </Alert>
          ) : null}

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Ingresando...' : 'Ingresar'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}
