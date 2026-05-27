import { useState } from 'react'

import { HomeModernIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import { useNavigate } from '@tanstack/react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { setActiveHomeSession } from '@/stores/active-home.actions'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'

import { CreateHomeModal } from '../components/create-home-modal'
import { useCreateHome, useHomes } from '../hooks/use-homes'

export const HomesPage = () => {
  const navigate = useNavigate()
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const homesQuery = useHomes()
  const createHomeMutation = useCreateHome()

  const handleSelectHome = async (homeId: string, homeName: string, role: 'ADMIN' | 'GUEST') => {
    setActiveHomeSession({
      id: homeId,
      name: homeName,
      role,
    })

    await navigate({ to: '/dashboard' })
  }

  const handleCreateHome = async ({ name }: { name: string }) => {
    const createdHome = await createHomeMutation.mutateAsync({ name })

    setActiveHomeSession({
      id: createdHome.id,
      name: createdHome.name,
      role: createdHome.role,
    })

    toast({
      title: 'Hogar creado',
      description: `${createdHome.name} ya esta listo para usarse.`,
      variant: 'success',
    })

    setIsCreateModalOpen(false)
    await navigate({ to: '/dashboard' })
  }

  const hasHomes = (homesQuery.data?.length ?? 0) >= 1
  const hasNoHomes = (homesQuery.data?.length ?? 0) === 0

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            Casas
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">
            Elige el hogar activo
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Selecciona tu hogar activo o crea uno nuevo.
          </p>
        </div>
        <Button
          type="button"
          className="hidden sm:inline-flex"
          onClick={() => {
            setIsCreateModalOpen(true)
          }}
        >
          <PlusIcon className="size-4" />
          Crear hogar
        </Button>
      </div>

      {homesQuery.isLoading ? (
        <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(16,24,38,0.96))]">
          <CardContent className="grid gap-4 py-8 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-36 animate-pulse rounded-3xl border border-border bg-background/40" />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {homesQuery.error ? (
        <Alert variant="error">No se pudieron cargar tus hogares.</Alert>
      ) : null}

      {!homesQuery.isLoading && hasNoHomes ? (
        <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(16,24,38,0.96))]">
          <CardContent className="flex flex-col items-center justify-center gap-5 py-14 text-center">
            <div className="flex size-20 items-center justify-center rounded-[28px] bg-primary/12 text-primary ring-1 ring-primary/20">
              <HomeModernIcon className="size-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Aun no tienes hogares</h2>
              <p className="max-w-lg text-sm text-muted-foreground">
                Crea tu primer hogar para empezar a organizar gastos, cierres y miembros desde un mismo lugar.
              </p>
            </div>
            <Button
              type="button"
              size="lg"
              onClick={() => {
                setIsCreateModalOpen(true)
              }}
            >
              <PlusIcon className="size-4" />
              Crear mi primer hogar
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {!homesQuery.isLoading && hasHomes ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {homesQuery.data?.map((home) => (
            <button
              key={home.id}
              type="button"
              onClick={() => {
                void handleSelectHome(home.id, home.name, home.role)
              }}
              className="group rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,43,0.96),rgba(10,16,25,0.96))] p-5 text-left shadow-lg shadow-black/15 transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-black/30"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-lg font-semibold text-foreground">{home.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Tu rol: {home.role}
                  </p>
                </div>
                <div className="rounded-full bg-white/6 p-2 text-muted-foreground transition group-hover:bg-primary/12 group-hover:text-primary">
                  <HomeModernIcon className="size-5" />
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
                <UserGroupIcon className="size-4" />
                <span>
                  {home.membersCount} {home.membersCount === 1 ? 'miembro' : 'miembros'}
                </span>
              </div>

              {activeHomeId === home.id ? (
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  Actualmente seleccionado
                </p>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}

      <div className="fixed bottom-6 right-6 sm:hidden">
        <Button
          type="button"
          size="icon-lg"
          className="rounded-full shadow-lg shadow-black/30"
          onClick={() => {
            setIsCreateModalOpen(true)
          }}
        >
          <PlusIcon className="size-5" />
          <span className="sr-only">Crear hogar</span>
        </Button>
      </div>

      <CreateHomeModal
        error={createHomeMutation.error}
        isOpen={isCreateModalOpen}
        isPending={createHomeMutation.isPending}
        onClose={() => {
          setIsCreateModalOpen(false)
          createHomeMutation.reset()
        }}
        onSubmit={handleCreateHome}
      />
    </div>
  )
}