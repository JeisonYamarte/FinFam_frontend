import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { EllipsisHorizontalIcon, EnvelopeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { useNavigate, useParams } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import { ConfirmActionModal } from '@/features/homes/application/components/confirm-action-modal'
import {
  useHomeDetail,
  useInviteHomeMember,
  useLeaveHome,
  useRemoveHomeMember,
  useUpdateHomeMemberRole,
  useUpdateHomeName,
} from '@/features/homes/application/hooks/use-homes'
import {
  getInitials,
} from '@/features/homes/application/utils/formatters'
import {
  inviteHomeMemberSchema,
  updateHomeNameSchema,
  type InviteHomeMemberSchema,
  type UpdateHomeNameSchema,
} from '@/features/homes/domain/home.schemas'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { clearActiveHomeSession, setActiveHomeSession } from '@/stores/active-home.actions'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'

export const HomeSettingsPage = () => {
  const navigate = useNavigate()
  const { homeId } = useParams({ from: '/protected/homes/$homeId/settings' })
  const activeHomeRole = useActiveHomeStore(activeHomeSelectors.role)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

  const detailQuery = useHomeDetail(homeId)
  const updateHomeNameMutation = useUpdateHomeName(homeId)
  const inviteMemberMutation = useInviteHomeMember(homeId)
  const updateMemberRoleMutation = useUpdateHomeMemberRole(homeId)
  const removeMemberMutation = useRemoveHomeMember(homeId)
  const leaveHomeMutation = useLeaveHome(homeId)

  const nameForm = useForm<UpdateHomeNameSchema>({
    resolver: zodResolver(updateHomeNameSchema),
    defaultValues: { name: '' },
  })

  const inviteForm = useForm<InviteHomeMemberSchema>({
    resolver: zodResolver(inviteHomeMemberSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    if (!detailQuery.data?.name) {
      return
    }

    nameForm.reset({ name: detailQuery.data.name })

    if (activeHomeRole) {
      setActiveHomeSession({
        id: detailQuery.data.id,
        name: detailQuery.data.name,
        role: activeHomeRole,
      })
    }
  }, [activeHomeRole, detailQuery.data, nameForm])

  const handleSaveName = async (values: UpdateHomeNameSchema) => {
    const updatedHome = await updateHomeNameMutation.mutateAsync(values)

    if (activeHomeRole) {
      setActiveHomeSession({
        id: updatedHome.id,
        name: updatedHome.name,
        role: activeHomeRole,
      })
    }

    toast({
      title: 'Nombre actualizado',
      description: 'El hogar se actualizo correctamente.',
      variant: 'success',
    })
  }

  const handleInvite = async (values: InviteHomeMemberSchema) => {
    await inviteMemberMutation.mutateAsync(values)
    inviteForm.reset()
    toast({
      title: 'Invitacion enviada',
      description: `Enviamos la invitacion a ${values.email}.`,
      variant: 'success',
    })
  }

  const handleToggleRole = async (memberId: string, currentRole: 'ADMIN' | 'GUEST') => {
    const nextRole = currentRole === 'ADMIN' ? 'GUEST' : 'ADMIN'

    await updateMemberRoleMutation.mutateAsync({ memberId, role: nextRole })
    toast({
      title: 'Rol actualizado',
      description: `El miembro ahora es ${nextRole}.`,
      variant: 'success',
    })
  }

  const handleRemoveMember = async (memberId: string) => {
    await removeMemberMutation.mutateAsync(memberId)
    toast({
      title: 'Miembro eliminado',
      description: 'El miembro fue removido del hogar.',
      variant: 'success',
    })
  }

  const handleLeaveHome = async () => {
    await leaveHomeMutation.mutateAsync()
    clearActiveHomeSession()
    toast({
      title: 'Saliste del hogar',
      description: 'Puedes elegir o crear otro hogar desde la lista.',
      variant: 'success',
    })
    setIsLeaveModalOpen(false)
    await navigate({ to: '/homes' })
  }

  const isLastMember = (detailQuery.data?.members.length ?? 0) <= 1

  return (
    <>
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
            Configuracion
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            {activeHomeName ?? detailQuery.data?.name ?? 'Hogar activo'}
          </h1>
        </div>

        {detailQuery.error ? (
          <Alert variant="error">No pudimos cargar la configuracion del hogar.</Alert>
        ) : null}

        <Card>
          <CardHeader>
            <CardTitle>Nombre</CardTitle>
            <CardDescription>Actualiza el nombre visible del hogar.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...nameForm}>
              <form className="space-y-4" onSubmit={nameForm.handleSubmit(handleSaveName)}>
                <FormField
                  control={nameForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre del hogar</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del hogar" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {updateHomeNameMutation.error ? (
                  <Alert variant="error">
                    {getErrorMessage(updateHomeNameMutation.error, 'No se pudo actualizar el nombre.')}
                  </Alert>
                ) : null}
                <Button type="submit" disabled={updateHomeNameMutation.isPending || detailQuery.isLoading}>
                  {updateHomeNameMutation.isPending ? 'Guardando...' : 'Guardar'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Miembros</CardTitle>
            <CardDescription>Gestiona roles y elimina miembros del hogar.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {detailQuery.isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-20 animate-pulse rounded-2xl border border-border bg-background/40" />
                ))}
              </div>
            ) : detailQuery.data?.members.length ? (
              detailQuery.data.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center gap-3 rounded-2xl border border-white/8 bg-background/45 px-4 py-3"
                >
                  <div className="flex size-11 items-center justify-center rounded-full bg-sky-200/90 text-sm font-semibold text-sky-900">
                    {getInitials(member.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {member.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">{member.email || 'Sin correo'}</p>
                  </div>
                  <span className="rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 ring-1 ring-emerald-300/20">
                    {member.role}
                  </span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button type="button" size="icon-sm" variant="ghost">
                        <EllipsisHorizontalIcon className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-56 rounded-2xl border-white/10 bg-card/98 p-2">
                      <div className="space-y-1">
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start"
                          disabled={updateMemberRoleMutation.isPending}
                          onClick={() => {
                            void handleToggleRole(member.id, member.role)
                          }}
                        >
                          Cambiar a {member.role === 'ADMIN' ? 'GUEST' : 'ADMIN'}
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          className="w-full justify-start text-destructive hover:text-destructive"
                          disabled={removeMemberMutation.isPending}
                          onClick={() => {
                            void handleRemoveMember(member.id)
                          }}
                        >
                          <TrashIcon className="size-4" />
                          Eliminar miembro
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              ))
            ) : (
              <Alert variant="info">Aun no hay miembros cargados para este hogar.</Alert>
            )}

            {updateMemberRoleMutation.error ? (
              <Alert variant="error">
                {getErrorMessage(updateMemberRoleMutation.error, 'No se pudo actualizar el rol del miembro.')}
              </Alert>
            ) : null}
            {removeMemberMutation.error ? (
              <Alert variant="error">
                {getErrorMessage(removeMemberMutation.error, 'No se pudo eliminar el miembro.')}
              </Alert>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Invitaciones</CardTitle>
            <CardDescription>Invita nuevos miembros por correo.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...inviteForm}>
              <form className="space-y-4" onSubmit={inviteForm.handleSubmit(handleInvite)}>
                <FormField
                  control={inviteForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo del invitado</FormLabel>
                      <FormControl>
                        <Input placeholder="correo@dominio.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {inviteMemberMutation.error ? (
                  <Alert variant="error">
                    {getErrorMessage(inviteMemberMutation.error, 'No se pudo enviar la invitacion.')}
                  </Alert>
                ) : null}
                <Button type="submit" disabled={inviteMemberMutation.isPending}>
                  <EnvelopeIcon className="size-4" />
                  {inviteMemberMutation.isPending ? 'Enviando...' : 'Enviar invitacion'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle>Zona de peligro</CardTitle>
            <CardDescription>
              Si eres el ultimo miembro, el hogar completo podra eliminarse al salir.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button type="button" variant="destructive" onClick={() => {
              setIsLeaveModalOpen(true)
            }}>
              Salir del hogar
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmActionModal
        confirmLabel="Salir del hogar"
        description={
          isLastMember
            ? 'Eres el ultimo miembro. Si continuas, el hogar completo podra eliminarse.'
            : 'Se eliminara tu acceso al hogar activo y volveras al selector de hogares.'
        }
        error={leaveHomeMutation.error ?? undefined}
        isOpen={isLeaveModalOpen}
        isPending={leaveHomeMutation.isPending}
        onClose={() => {
          setIsLeaveModalOpen(false)
        }}
        onConfirm={() => {
          void handleLeaveHome()
        }}
        title="Confirmar salida"
      />
    </>
  )
}
