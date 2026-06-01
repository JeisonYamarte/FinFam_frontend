import { useEffect, useRef, useState } from 'react'

import { ArrowPathIcon, EyeIcon } from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import { useHomeDetail } from '@/features/homes/application/hooks/use-homes'
import { formatShortDate } from '@/features/homes/application/utils/formatters'
import { closureActionSchema } from '@/features/closures/domain/closure.schemas'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'
import { homeMembersSelectors, useHomeMembersStore } from '@/stores/home-members.store'

import { ClosureDetailModal } from '../components/closure-detail-modal'
import { ClosurePreviewModal } from '../components/closure-preview-modal'
import { useClosures, useCreateClosure, useSimulateClosure } from '../hooks/use-closures'

type ClosuresPageProps = {
  initialAction?: 'simulate' | 'create' | null
}

export const ClosuresPage = ({ initialAction = null }: ClosuresPageProps) => {
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const activeHomeRole = useActiveHomeStore(activeHomeSelectors.role)
  const isAdmin = activeHomeRole === 'ADMIN'

  const members = useHomeMembersStore(homeMembersSelectors.members)
  const setMembers = useHomeMembersStore((state) => state.setMembers)
  const clearMembers = useHomeMembersStore((state) => state.clearMembers)

  const [previewMode, setPreviewMode] = useState<'simulate' | 'create'>('simulate')
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [selectedClosureId, setSelectedClosureId] = useState<string | null>(null)
  const pendingInitialActionRef = useRef<'simulate' | 'create' | null>(initialAction)

  const homeDetailQuery = useHomeDetail(activeHomeId)
  const closuresQuery = useClosures(activeHomeId)
  const simulateClosureMutation = useSimulateClosure(activeHomeId)
  const createClosureMutation = useCreateClosure(activeHomeId)

  useEffect(() => {
    if (!activeHomeId) {
      clearMembers()
      return
    }

    if (homeDetailQuery.data?.members) {
      setMembers(homeDetailQuery.data.members)
    }
  }, [activeHomeId, clearMembers, homeDetailQuery.data?.members, setMembers])

  useEffect(() => {
    const pendingInitialAction = pendingInitialActionRef.current

    if (!pendingInitialAction || !activeHomeId || !isAdmin) {
      return
    }

    pendingInitialActionRef.current = null

    const parsed = closureActionSchema.safeParse({ householdId: activeHomeId })

    if (!parsed.success) {
      return
    }

    setPreviewMode(pendingInitialAction)
    setIsPreviewOpen(true)
    createClosureMutation.reset()
    void simulateClosureMutation.mutateAsync(parsed.data).catch(() => undefined)
  }, [activeHomeId, createClosureMutation, isAdmin, simulateClosureMutation])

  const handleOpenPreview = async (mode: 'simulate' | 'create') => {
    const parsed = closureActionSchema.safeParse({ householdId: activeHomeId ?? '' })

    if (!parsed.success) {
      toast({
        title: 'No hay hogar activo',
        description: 'Selecciona un hogar antes de simular o crear un cierre.',
        variant: 'error',
      })
      return
    }

    setPreviewMode(mode)
    setIsPreviewOpen(true)
    createClosureMutation.reset()
    await simulateClosureMutation.mutateAsync(parsed.data)
  }

  const handleCreateClosure = async () => {
    const parsed = closureActionSchema.safeParse({ householdId: activeHomeId ?? '' })

    if (!parsed.success) {
      return
    }

    const result = await createClosureMutation.mutateAsync(parsed.data)

    toast({
      title: 'Cierre creado',
      description: 'El cierre se registro y el historial ya fue actualizado.',
      variant: 'success',
    })

    setIsPreviewOpen(false)
    setSelectedClosureId(result.closureId)
  }

  const latestClosure = closuresQuery.data?.[0] ?? null

  return (
    <div className="space-y-6 pb-24 sm:pb-20">
      <section className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Cierres financieros</p>
          <h1 className="mt-2 text-3xl font-semibold text-foreground">
            {activeHomeName ?? homeDetailQuery.data?.name ?? 'Hogar activo'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Simula el cierre del periodo abierto, confirma el resultado y revisa el historial completo sin perder el contexto del hogar.
          </p>
        </div>
        {isAdmin ? (
          <div className="flex flex-wrap gap-2 self-start lg:self-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                void handleOpenPreview('simulate')
              }}
            >
              <ArrowPathIcon className="size-4" />
              Simular cierre
            </Button>
            <Button
              type="button"
              onClick={() => {
                void handleOpenPreview('create')
              }}
            >
              Crear cierre con preview
            </Button>
          </div>
        ) : null}
      </section>

      {!isAdmin ? (
        <Alert variant="info">Tu rol es GUEST. Puedes ver historial y detalle, pero no crear cierres.</Alert>
      ) : null}

      {closuresQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(closuresQuery.error, 'No pudimos cargar el historial de cierres.')}
        </Alert>
      ) : null}

      {homeDetailQuery.error ? (
        <Alert variant="error">No pudimos cargar los miembros del hogar activo para resolver los balances.</Alert>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(16,24,38,0.96))]">
          <CardHeader>
            <CardTitle>Periodo abierto</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-white/10 bg-background/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Ultimo cierre</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {latestClosure
                  ? `${formatShortDate(latestClosure.startDate)} - ${formatShortDate(latestClosure.endDate)}`
                  : 'Sin cierres previos'}
              </p>
            </div>
            <div className="rounded-3xl border border-white/10 bg-background/35 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Estado actual</p>
              <p className="mt-3 text-lg font-semibold text-foreground">
                {latestClosure ? 'Listo para nueva simulacion' : 'Primer cierre pendiente'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Decision guiada</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>1. Simula para revisar quien debe a quien en el periodo abierto.</p>
            <p>2. Confirma el preview solo si el resultado coincide con lo esperado.</p>
            <p>3. Consulta el historial para revisar balances finales y gastos ya incluidos.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div>
            <CardTitle>Historial de cierres</CardTitle>
          </div>
          <Link to="/dashboard" className="text-sm font-medium text-primary transition hover:text-primary/80">
            Volver al dashboard
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {closuresQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-20 animate-pulse rounded-2xl border border-white/8 bg-background/45" />
              ))}
            </div>
          ) : closuresQuery.data?.length ? (
            closuresQuery.data.map((closure, index) => (
              <div
                key={closure.id}
                className="flex flex-col gap-3 rounded-3xl border border-white/8 bg-background/40 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      {formatShortDate(closure.startDate)} - {formatShortDate(closure.endDate)}
                    </p>
                    {index === 0 ? (
                      <span className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                        Ultimo cierre
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">Creado {formatShortDate(closure.createdAt)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      setSelectedClosureId(closure.id)
                    }}
                  >
                    <EyeIcon className="size-4" />
                    Ver detalle
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-background/35 px-4 py-10 text-center text-sm text-muted-foreground">
              Aun no hay cierres historicos. Ejecuta una simulacion para preparar el primer cierre.
            </div>
          )}
        </CardContent>
      </Card>

      <ClosurePreviewModal
        isOpen={isPreviewOpen}
        mode={previewMode}
        members={members}
        preview={simulateClosureMutation.data ?? null}
        isLoading={simulateClosureMutation.isPending}
        isConfirming={createClosureMutation.isPending}
        simulateError={simulateClosureMutation.error}
        createError={createClosureMutation.error}
        onClose={() => {
          setIsPreviewOpen(false)
          simulateClosureMutation.reset()
          createClosureMutation.reset()
        }}
        onConfirm={() => {
          void handleCreateClosure()
        }}
      />

      <ClosureDetailModal
        key={selectedClosureId ?? 'closures-page-detail'}
        closureId={selectedClosureId}
        members={members}
        isOpen={Boolean(selectedClosureId)}
        onClose={() => {
          setSelectedClosureId(null)
        }}
      />
    </div>
  )
}