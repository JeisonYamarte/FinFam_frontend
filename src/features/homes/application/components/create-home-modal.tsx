import { useEffect } from 'react'

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
import { getErrorMessage } from '@/features/auth/application/utils/error-message'

import {
  createHomeSchema,
  type CreateHomeSchema,
} from '../../domain/home.schemas'

type CreateHomeModalProps = {
  isOpen: boolean
  isPending: boolean
  error: unknown
  onClose: () => void
  onSubmit: (values: CreateHomeSchema) => Promise<void>
}

export const CreateHomeModal = ({
  isOpen,
  isPending,
  error,
  onClose,
  onSubmit,
}: CreateHomeModalProps) => {
  const form = useForm<CreateHomeSchema>({
    resolver: zodResolver(createHomeSchema),
    defaultValues: {
      name: '',
    },
  })

  useEffect(() => {
    if (!isOpen) {
      form.reset()
    }
  }, [form, isOpen])

  if (!isOpen) {
    return null
  }

  const handleSubmit = async (values: CreateHomeSchema) => {
    await onSubmit(values)
    form.reset()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0"
        onClick={() => {
          if (!isPending) {
            onClose()
          }
        }}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Nuevo hogar
          </p>
          <h2 className="text-2xl font-semibold text-foreground">Crear hogar</h2>
          <p className="text-sm text-muted-foreground">
            Define el nombre del hogar para activarlo de inmediato y entrar al dashboard.
          </p>
        </div>

        <Form {...form}>
          <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del hogar</FormLabel>
                  <FormControl>
                    <Input autoFocus maxLength={80} placeholder="Ej. Casa Martinez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {error ? (
              <Alert variant="error">
                {getErrorMessage(error, 'No se pudo crear el hogar.')}
              </Alert>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isPending}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creando...' : 'Crear hogar'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}