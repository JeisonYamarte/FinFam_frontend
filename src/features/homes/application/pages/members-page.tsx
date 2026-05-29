import { useEffect, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { EnvelopeIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'
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
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import { useCurrentUser } from '@/features/auth/application/hooks/use-current-user'
import { ConfirmActionModal } from '@/features/homes/application/components/confirm-action-modal'
import { HomeMemberRow } from '@/features/homes/application/components/home-member-row'
import {
  useHomeDetail,
  useInviteHomeMember,
  useRemoveHomeMember,
  useUpdateHomeMemberRole,
} from '@/features/homes/application/hooks/use-homes'
import type { HomeMember, HomeRole } from '@/features/homes/domain/Home.entity'
import { inviteHomeMemberSchema, type InviteHomeMemberSchema } from '@/features/homes/domain/home.schemas'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { setActiveHomeSession } from '@/stores/active-home.actions'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'

export const MembersPage = () => {
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const activeHomeRole = useActiveHomeStore(activeHomeSelectors.role)
  const isAdmin = activeHomeRole === 'ADMIN'

  const [memberToRemove, setMemberToRemove] = useState<HomeMember | null>(null)

  const detailQuery = useHomeDetail(activeHomeId)
  const currentUserQuery = useCurrentUser()
  const inviteMemberMutation = useInviteHomeMember(activeHomeId)
  const updateMemberRoleMutation = useUpdateHomeMemberRole(activeHomeId)
  const removeMemberMutation = useRemoveHomeMember(activeHomeId)

  const inviteForm = useForm<InviteHomeMemberSchema>({
    resolver: zodResolver(inviteHomeMemberSchema),
    defaultValues: { email: '' },
  })

  useEffect(() => {
    setMemberToRemove((current) =>
      current && !detailQuery.data?.members.some((member) => member.id === current.id)
        ? null
        : current,
    )
  }, [detailQuery.data?.members])

  const syncActiveHomeRole = (member: HomeMember, nextRole: HomeRole) => {
    const currentUserId = currentUserQuery.data?.id
    if (!activeHomeId || !currentUserId || member.userId !== currentUserId) {
      return
    }

    setActiveHomeSession({
      id: activeHomeId,
      name: activeHomeName ?? detailQuery.data?.name ?? 'Hogar activo',
      role: nextRole,
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

  const handleToggleRole = async (member: HomeMember) => {
    const nextRole = member.role === 'ADMIN' ? 'GUEST' : 'ADMIN'

    await updateMemberRoleMutation.mutateAsync({ memberId: member.id, role: nextRole })
    syncActiveHomeRole(member, nextRole)
    toast({
      title: 'Rol actualizado',
      description: `El miembro ahora es ${nextRole}.`,
      variant: 'success',
    })
  }

  const handleRemoveMember = async () => {
    if (!memberToRemove) {
      return
    }

    await removeMemberMutation.mutateAsync(memberToRemove.id)
    toast({
      title: 'Miembro eliminado',
      description: 'El miembro fue removido del hogar.',
      variant: 'success',
    })
    setMemberToRemove(null)
  }

  return (
    <div className="space-y-6 pb-24 sm:pb-20">
      <section className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Miembros</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            {activeHomeName ?? detailQuery.data?.name ?? 'Hogar activo'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Revisa quienes participan en el hogar y administra roles, invitaciones y accesos.
          </p>
        </div>
        <Link to="/dashboard" className="text-sm font-medium text-primary transition hover:text-primary/80">
          Volver al dashboard
        </Link>
      </section>

      {detailQuery.error ? (
        <Alert variant="error">No pudimos cargar los miembros del hogar activo.</Alert>
      ) : null}

      {!isAdmin ? <Alert variant="info">Tu rol es GUEST. Solo puedes ver la lista de miembros.</Alert> : null}

      {isAdmin ? (
        <Card>
          <CardHeader>
            <CardTitle>Invitar miembro</CardTitle>
            <CardDescription>Envía una invitacion por correo para sumar a otra persona al hogar.</CardDescription>
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
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Listado de miembros</CardTitle>
          <CardDescription>{detailQuery.data?.members.length ?? 0} miembros cargados en este hogar.</CardDescription>
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
              <HomeMemberRow
                key={member.id}
                member={member}
                isAdmin={isAdmin}
                isUpdatingRole={updateMemberRoleMutation.isPending}
                isRemoving={removeMemberMutation.isPending}
                onToggleRole={(nextMember) => {
                  void handleToggleRole(nextMember)
                }}
                onRequestRemove={(nextMember) => {
                  setMemberToRemove(nextMember)
                }}
              />
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

      <ConfirmActionModal
        confirmLabel="Eliminar miembro"
        description={
          memberToRemove
            ? `Se eliminara a ${memberToRemove.name} del hogar activo. Esta accion no se puede deshacer.`
            : 'Se eliminara el miembro seleccionado del hogar activo.'
        }
        error={removeMemberMutation.error ?? undefined}
        isOpen={Boolean(memberToRemove)}
        isPending={removeMemberMutation.isPending}
        onClose={() => {
          setMemberToRemove(null)
          removeMemberMutation.reset()
        }}
        onConfirm={() => {
          void handleRemoveMember()
        }}
        title="Confirmar eliminacion"
      />
    </div>
  )
}