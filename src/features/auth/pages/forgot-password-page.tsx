import { useMutation } from '@tanstack/react-query'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

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
import { AuthShell } from '../components/auth-shell'
import {
  forgotPasswordSchema,
  type ForgotPasswordSchema,
} from '../schemas/auth.schemas'
import { forgotPassword } from '../services/auth-api.service'
import { getErrorMessage } from '../services/error-message'

export const ForgotPasswordPage = () => {
  const form = useForm<ForgotPasswordSchema>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  const mutation = useMutation({
    mutationFn: forgotPassword,
  })

  const onSubmit = async (values: ForgotPasswordSchema) => {
    mutation.reset()
    await mutation.mutateAsync(values)
  }

  return (
    <AuthShell
      description="Te enviaremos un enlace para recuperar acceso."
      footerLinkText="Volver a login"
      footerLinkTo="/login"
      footerText="Recordaste tu contrasena?"
      title="Recuperar contrasena"
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

          {mutation.isSuccess ? <Alert variant="success">{mutation.data}</Alert> : null}
          {mutation.error ? (
            <Alert variant="error">
              {getErrorMessage(mutation.error, 'No se pudo procesar la solicitud.', {
                422: 'Revisa el correo ingresado e intenta nuevamente.',
              })}
            </Alert>
          ) : null}

          <Button className="w-full" disabled={mutation.isPending} type="submit">
            {mutation.isPending ? 'Enviando...' : 'Enviar enlace'}
          </Button>
        </form>
      </Form>
    </AuthShell>
  )
}
