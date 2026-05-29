import { useState } from 'react'

import {
  EyeIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'

import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import { ExpenseDetailModal } from '@/features/expenses/application/components/expense-detail-modal'
import { ExpenseFormModal } from '@/features/expenses/application/components/expense-form-modal'
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenseDetail,
  useUpdateExpense,
} from '@/features/expenses/application/hooks/use-expenses'
import { ConfirmActionModal } from '@/features/homes/application/components/confirm-action-modal'
import { HomeMemberRow } from '@/features/homes/application/components/home-member-row'
import {
  HOME_QUERY_KEYS,
  useHomeCalculation,
  useHomeClosures,
  useHomeDetail,
  useHomeExpenses,
  useRemoveHomeMember,
  useUpdateHomeMemberRole,
} from '@/features/homes/application/hooks/use-homes'
import {
  formatCurrency,
  formatShortDate,
} from '@/features/homes/application/utils/formatters'
import type { HomeExpense, HomeMember, HomeRole } from '@/features/homes/domain/Home.entity'
import { useCurrentUser } from '@/features/auth/application/hooks/use-current-user'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { setActiveHomeSession } from '@/stores/active-home.actions'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'

export const DashboardPage = () => {
  const queryClient = useQueryClient()
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const activeUserRole = useActiveHomeStore(activeHomeSelectors.role)
  const isAdmin = activeUserRole === 'ADMIN'

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [selectedEditId, setSelectedEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<HomeExpense | null>(null)
  const [memberToRemove, setMemberToRemove] = useState<HomeMember | null>(null)

  const homeDetailQuery = useHomeDetail(activeHomeId)
  const homeCalculationQuery = useHomeCalculation(activeHomeId)
  const expensesQuery = useHomeExpenses(activeHomeId, 5)
  const closuresQuery = useHomeClosures(activeHomeId, 3)
  const currentUserQuery = useCurrentUser()
  const selectedExpenseQuery = useExpenseDetail(activeHomeId, selectedDetailId)
  const selectedEditExpenseQuery = useExpenseDetail(activeHomeId, selectedEditId)
  const updateMemberRoleMutation = useUpdateHomeMemberRole(activeHomeId)
  const removeMemberMutation = useRemoveHomeMember(activeHomeId)

  const createExpenseMutation = useCreateExpense(activeHomeId, { page: 1, limit: 5 })
  const updateExpenseMutation = useUpdateExpense(activeHomeId, { page: 1, limit: 5 })
  const deleteExpenseMutation = useDeleteExpense(activeHomeId, { page: 1, limit: 5 })

  const members = homeDetailQuery.data?.members ?? []
  const visibleMembers = members.slice(0, 4)
  const hasMoreMembers = members.length > 4
  const currentUserId = currentUserQuery.data?.id
  const userTotals = currentUserId
    ? homeCalculationQuery.data?.totalsByUser[currentUserId]
    : undefined
  const totalSpentByMe = userTotals?.paid ?? 0
  const mySplitsTotal = userTotals?.split ?? 0
  const myNetAmount = totalSpentByMe - mySplitsTotal
  const myNetLabel =
    myNetAmount > 0
      ? `Has pagado de mas ${formatCurrency(myNetAmount)}`
      : myNetAmount < 0
        ? `Te falta cubrir ${formatCurrency(Math.abs(myNetAmount))}`
        : 'Estas al dia con tus gastos'
  const hasDashboardError =
    homeDetailQuery.error ||
    homeCalculationQuery.error ||
    expensesQuery.error ||
    closuresQuery.error ||
    currentUserQuery.error
  const isDashboardLoading =
    homeDetailQuery.isLoading ||
    homeCalculationQuery.isLoading ||
    expensesQuery.isLoading ||
    closuresQuery.isLoading ||
    currentUserQuery.isLoading

  const refreshDashboardExpenseData = async () => {
    await queryClient.invalidateQueries({
      queryKey: HOME_QUERY_KEYS.expenses(activeHomeId ?? 'none', 5),
    })
    await queryClient.invalidateQueries({
      queryKey: HOME_QUERY_KEYS.calculation(activeHomeId ?? 'none'),
    })
  }

  const handleCreateExpense = async (values: {
    title: string
    description: string
    amount: number
    date: string
    payers: Array<{ userId: string; amountPaid: number }>
    splits: Array<{ userId: string; amount: number }>
    receipt?: File | null
  }) => {
    await createExpenseMutation.mutateAsync(values)
    await refreshDashboardExpenseData()

    toast({
      title: 'Gasto creado',
      description: 'El gasto se registro correctamente.',
      variant: 'success',
    })

    setIsCreateModalOpen(false)
  }

  const handleUpdateExpense = async (values: {
    title: string
    description: string
    amount: number
    date: string
    payers: Array<{ userId: string; amountPaid: number }>
    splits: Array<{ userId: string; amount: number }>
    receipt?: File | null
  }) => {
    if (!selectedEditId) {
      return
    }

    await updateExpenseMutation.mutateAsync({
      expenseId: selectedEditId,
      payload: values,
    })
    await refreshDashboardExpenseData()

    toast({
      title: 'Gasto actualizado',
      description: 'Los cambios se guardaron correctamente.',
      variant: 'success',
    })

    setSelectedEditId(null)
  }

  const handleDeleteExpense = async () => {
    if (!deleteTarget) {
      return
    }

    await deleteExpenseMutation.mutateAsync(deleteTarget.id)
    await refreshDashboardExpenseData()

    toast({
      title: 'Gasto eliminado',
      description: 'El gasto se elimino correctamente.',
      variant: 'success',
    })

    setDeleteTarget(null)
  }

  const syncActiveHomeRole = (nextRole: HomeRole) => {
    if (!activeHomeId || !currentUserId) {
      return
    }

    const currentMember = members.find((member) => member.userId === currentUserId)
    if (!currentMember) {
      return
    }

    setActiveHomeSession({
      id: activeHomeId,
      name: activeHomeName ?? 'Hogar activo',
      role: nextRole,
    })
  }

  const handleToggleMemberRole = async (member: HomeMember) => {
    const nextRole = member.role === 'ADMIN' ? 'GUEST' : 'ADMIN'

    await updateMemberRoleMutation.mutateAsync({ memberId: member.id, role: nextRole })
    if (member.userId === currentUserId) {
      syncActiveHomeRole(nextRole)
    }
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
      {hasDashboardError ? (
        <Alert variant="error">No pudimos cargar la informacion del hogar activo.</Alert>
      ) : null}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
              Periodo abierto
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground">
              {activeHomeName ?? 'Hogar activo'}
            </h1>
          </div>
          {isAdmin ? (
            <div className="flex flex-wrap gap-2 self-start lg:self-auto">
              <Button asChild type="button" variant="secondary">
                <Link to="/closures">Simular cierre</Link>
              </Button>
              <Button asChild type="button">
                <Link to="/closures">Crear cierre</Link>
              </Button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MetricCard
            label="Total gastado"
            value={isDashboardLoading ? '...' : formatCurrency(totalSpentByMe)}
            helper="Suma de tus pagos"
          />
          <MetricCard
            label="Tu saldo"
            value={isDashboardLoading ? '...' : formatCurrency(mySplitsTotal)}
            helper={myNetLabel}
            valueClassName="text-amber-300"
          />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card>
          <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
            <div>
              <CardTitle>Ultimos gastos</CardTitle>
            </div>
            <Link to="/expenses" className="text-sm font-medium text-primary transition hover:text-primary/80">
              {'Ver todos ->'}
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {expensesQuery.isLoading ? (
              <SkeletonRows />
            ) : expensesQuery.data?.length ? (
              expensesQuery.data.map((expense) => (
                <div
                  key={expense.id}
                  role="button"
                  tabIndex={0}
                  className="flex flex-wrap items-start gap-3 rounded-2xl border border-white/8 bg-background/45 px-3 py-3 transition hover:border-primary/40 hover:bg-background/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 sm:flex-nowrap sm:items-center"
                  onClick={() => {
                    setSelectedDetailId(expense.id)
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      setSelectedDetailId(expense.id)
                    }
                  }}
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white/6 text-xs font-semibold uppercase text-muted-foreground">
                    {expense.title.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                      {expense.title}
                    </p>
                    <p className="truncate text-xs text-muted-foreground sm:text-sm">
                      Fecha {formatShortDate(expense.date)}
                    </p>
                  </div>
                  <div className="ml-auto text-right sm:ml-0">
                    <p className="text-sm font-semibold text-foreground sm:text-base">
                      {formatCurrency(expense.amount)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    aria-label="Ver detalle"
                    onClick={(event) => {
                      event.stopPropagation()
                      setSelectedDetailId(expense.id)
                    }}
                  >
                    <EyeIcon className="size-4" />
                  </Button>
                  {isAdmin ? (
                    <div className="ml-auto hidden gap-2 sm:ml-0 sm:flex">
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={expense.closureId !== null}
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedEditId(expense.id)
                        }}
                      >
                        <PencilSquareIcon className="size-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={expense.closureId !== null}
                        onClick={(event) => {
                          event.stopPropagation()
                          setDeleteTarget(expense)
                        }}
                      >
                        <TrashIcon className="size-4" />
                      </Button>
                    </div>
                  ) : null}
                </div>
              ))
            ) : (
              <EmptyPanel message="Sin gastos en este periodo" />
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
              <CardTitle>Miembros</CardTitle>
              {isAdmin ? (
                <Link to="/members" className="text-sm font-medium text-primary transition hover:text-primary/80">
                  {'Invitar ->'}
                </Link>
              ) : null}
            </CardHeader>
            <CardContent className="space-y-3">
              {homeDetailQuery.isLoading ? (
                <SkeletonRows count={3} compact />
              ) : visibleMembers.length ? (
                <>
                  {visibleMembers.map((member) => (
                    <HomeMemberRow
                      key={member.id}
                      member={member}
                      isAdmin={isAdmin}
                      isUpdatingRole={updateMemberRoleMutation.isPending}
                      isRemoving={removeMemberMutation.isPending}
                      onToggleRole={(nextMember) => {
                        void handleToggleMemberRole(nextMember)
                      }}
                      onRequestRemove={(nextMember) => {
                        setMemberToRemove(nextMember)
                      }}
                    />
                  ))}
                  {hasMoreMembers ? (
                    <Link to="/members" className="inline-flex text-sm font-medium text-primary transition hover:text-primary/80">
                      {'Ver todos ->'}
                    </Link>
                  ) : null}
                </>
              ) : (
                <EmptyPanel message="Aun no hay miembros en este hogar" />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center sm:gap-4">
              <CardTitle>Cierres anteriores</CardTitle>
              <Link to="/closures" className="text-sm font-medium text-primary transition hover:text-primary/80">
                {'Ver historial ->'}
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {closuresQuery.isLoading ? (
                <SkeletonRows count={3} compact />
              ) : closuresQuery.data?.length ? (
                closuresQuery.data.map((closure) => (
                  <div
                    key={closure.id}
                    className="flex flex-col items-start gap-3 rounded-2xl border border-white/8 bg-background/45 px-3 py-3 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                        {formatShortDate(closure.startDate)} - {formatShortDate(closure.endDate)}
                      </p>
                      <p className="text-xs text-muted-foreground sm:text-sm">
                        Creado {formatShortDate(closure.createdAt)}
                      </p>
                    </div>
                    <Button type="button" variant="secondary" size="sm" className="w-full sm:w-auto">
                      Ver detalle
                    </Button>
                  </div>
                ))
              ) : (
                <EmptyPanel message="Aun no hay cierres en este hogar" />
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      {isAdmin ? (
        <Button
          type="button"
          onClick={() => {
            setIsCreateModalOpen(true)
          }}
          className="fixed bottom-5 right-4 z-30 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 sm:bottom-7 sm:right-7 sm:px-5 sm:py-3.5 sm:text-base"
        >
          <PlusIcon className="size-5 sm:size-6" />
          <span className="hidden sm:inline">Crear gasto</span>
        </Button>
      ) : null}

      <ConfirmActionModal
        title="Eliminar miembro"
        description={
          memberToRemove
            ? `Se eliminara a ${memberToRemove.name} del hogar activo. Esta accion no se puede deshacer.`
            : 'Se eliminara el miembro seleccionado del hogar activo.'
        }
        confirmLabel="Eliminar miembro"
        isOpen={Boolean(memberToRemove)}
        isPending={removeMemberMutation.isPending}
        error={removeMemberMutation.error}
        onClose={() => {
          setMemberToRemove(null)
          removeMemberMutation.reset()
        }}
        onConfirm={() => {
          void handleRemoveMember()
        }}
      />

      <ExpenseFormModal
        isOpen={isCreateModalOpen}
        mode="create"
        members={members}
        isPending={createExpenseMutation.isPending}
        error={createExpenseMutation.error}
        onClose={() => {
          setIsCreateModalOpen(false)
          createExpenseMutation.reset()
        }}
        onSubmit={handleCreateExpense}
      />

      <ExpenseFormModal
        isOpen={Boolean(selectedEditId)}
        mode="edit"
        members={members}
        isPending={updateExpenseMutation.isPending || selectedEditExpenseQuery.isLoading}
        error={updateExpenseMutation.error ?? selectedEditExpenseQuery.error}
        initialExpense={selectedEditExpenseQuery.data}
        onClose={() => {
          setSelectedEditId(null)
          updateExpenseMutation.reset()
        }}
        onSubmit={handleUpdateExpense}
      />

      <ExpenseDetailModal
        isOpen={Boolean(selectedDetailId)}
        expense={selectedExpenseQuery.data ?? null}
        onClose={() => {
          setSelectedDetailId(null)
        }}
      />

      <ConfirmActionModal
        title="Eliminar gasto"
        description={
          deleteTarget?.closureId
            ? 'Este gasto pertenece a un cierre y no puede eliminarse.'
            : 'Esta accion no se puede deshacer. El gasto se eliminara para todos los miembros.'
        }
        confirmLabel="Eliminar"
        isOpen={Boolean(deleteTarget)}
        isPending={deleteExpenseMutation.isPending}
        error={deleteExpenseMutation.error}
        onClose={() => {
          setDeleteTarget(null)
          deleteExpenseMutation.reset()
        }}
        onConfirm={() => {
          void handleDeleteExpense()
        }}
      />

      {(createExpenseMutation.error || updateExpenseMutation.error) && !isCreateModalOpen && !selectedEditId ? (
        <Alert variant="error">
          {getErrorMessage(
            createExpenseMutation.error ?? updateExpenseMutation.error,
            'No se pudo guardar el gasto.',
          )}
        </Alert>
      ) : null}
    </div>
  )
}

type MetricCardProps = {
  label: string
  value: string
  helper: string
  valueClassName?: string
}

const MetricCard = ({ label, value, helper, valueClassName }: MetricCardProps) => (
  <div className="rounded-[28px] border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,43,0.96),rgba(10,16,25,0.96))] p-5 shadow-lg shadow-black/15">
    <p className="text-sm text-muted-foreground">{label}</p>
    <p className={`mt-2 text-3xl font-semibold text-foreground ${valueClassName ?? ''}`}>{value}</p>
    <p className="mt-2 text-sm text-muted-foreground">{helper}</p>
  </div>
)

type SkeletonRowsProps = {
  count?: number
  compact?: boolean
}

const SkeletonRows = ({ count = 4, compact = false }: SkeletonRowsProps) => (
  <div className="space-y-3">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`animate-pulse rounded-2xl border border-white/8 bg-background/45 ${compact ? 'h-18' : 'h-20'}`}
      />
    ))}
  </div>
)

const EmptyPanel = ({ message }: { message: string }) => (
  <div className="rounded-2xl border border-dashed border-border bg-background/35 px-4 py-8 text-center text-sm text-muted-foreground">
    {message}
  </div>
)
