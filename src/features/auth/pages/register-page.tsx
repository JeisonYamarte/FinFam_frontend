import { useNavigate } from '@tanstack/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { DatePicker } from '@/components/ui/date-picker'
import { Alert } from '../../../components/ui/alert'
import { Button } from '../../../components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form'
import { Input } from '../../../components/ui/input'
import { CURRENT_USER_QUERY_KEY } from '../../../hooks/useCurrentUser'
import { AuthShell } from '../components/auth-shell'
import { PasswordField } from '../components/password-field'
import { registerSchema, type RegisterSchema } from '../schemas/auth.schemas'
import { register as registerUser } from '../services/auth-api.service'
import { getErrorMessage } from '../services/error-message'

export const RegisterPage = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useForm<RegisterSchema>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      lastName: '',
      email: '',
      birthDate: '',
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY })
      await navigate({ to: '/dashboard' })
    },
  })

  const onSubmit = async (values: RegisterSchema) => {
    mutation.reset()
    const payload = {
      name: values.name,
      lastName: values.lastName,
      email: values.email,
      birthDate: values.birthDate,
      password: values.password,
    }
    await mutation.mutateAsync(payload)
  }

  return (
    <AuthShell
      description="Crea tu cuenta y comienza a organizar gastos compartidos."
      footerLinkText="Iniciar sesion"
      footerLinkTo="/login"
      footerText="Ya tienes cuenta?"
      title="Registro"
    >
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input autoComplete="given-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apellido</FormLabel>
                  <FormControl>
                    <Input autoComplete="family-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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
            name="birthDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de nacimiento</FormLabel>
                <FormControl>
                  <DatePicker {...field} value={field.value ?? ''} />
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
                <FormLabel>Confirmar contrasena</FormLabel>
                <FormControl>
                  <PasswordField autoComplete="new-password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {mutation.error ? (
            <Alert variant="error">
              {getErrorMessage(mutation.error, 'No se pudo crear la cuenta.', {
                409: 'Este correo ya esta registrado.',
                422: 'Revisa los datos ingresados e intenta nuevamente.',
              })}
            </Alert>
          ) : null}

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Creando cuenta...' : 'Crear cuenta'}
          </Button>
        </form>
      </Form>

      <p className="mt-4 text-xs text-muted-foreground">
        Al registrarte, aceptas nuestros terminos y politicas de privacidad.
      </p>
    </AuthShell>
  )
}
