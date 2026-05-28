import { useEffect, useMemo, useState } from 'react'

import {
  EyeIcon,
  LockClosedIcon,
  PencilSquareIcon,
  PlusIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import { ConfirmActionModal } from '@/features/homes/application/components/confirm-action-modal'
import { useHomeDetail } from '@/features/homes/application/hooks/use-homes'
import { toast } from '@/shared/application/components/feedback/toast-provider'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'
import { homeMembersSelectors, useHomeMembersStore } from '@/stores/home-members.store'

import { ExpenseDetailModal } from '../components/expense-detail-modal'
import { ExpenseFormModal } from '../components/expense-form-modal'
import {
  useCreateExpense,
  useDeleteExpense,
  useExpenseDetail,
  useExpenses,
  useUpdateExpense,
} from '../hooks/use-expenses'
import type { ExpenseListItem } from '../../domain/Expense.entity'

type ExpenseListFiltersState = {
  page: number
  limit: number
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(value)

const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(isoDate))

export const ExpensesPage = () => {
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeRole = useActiveHomeStore(activeHomeSelectors.role)

  const members = useHomeMembersStore(homeMembersSelectors.members)
  const setMembers = useHomeMembersStore((state) => state.setMembers)
  const clearMembers = useHomeMembersStore((state) => state.clearMembers)

  const [filters, setFilters] = useState<ExpenseListFiltersState>({
    page: 1,
    limit: 8,
  })
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedDetailId, setSelectedDetailId] = useState<string | null>(null)
  const [selectedEditId, setSelectedEditId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<ExpenseListItem | null>(null)

  const queryFilters = useMemo(
    () => ({ page: filters.page, limit: filters.limit }),
    [filters.limit, filters.page],
  )

  const homeDetailQuery = useHomeDetail(activeHomeId)
  const expensesQuery = useExpenses(activeHomeId, queryFilters)
  const selectedExpenseQuery = useExpenseDetail(activeHomeId, selectedDetailId)
  const selectedEditExpenseQuery = useExpenseDetail(activeHomeId, selectedEditId)

  const createExpenseMutation = useCreateExpense(activeHomeId, queryFilters)
  const updateExpenseMutation = useUpdateExpense(activeHomeId, queryFilters)
  const deleteExpenseMutation = useDeleteExpense(activeHomeId, queryFilters)

  const canManageExpenses = activeRole === 'ADMIN'

  useEffect(() => {
    if (!activeHomeId) {
      clearMembers()
      return
    }

    if (homeDetailQuery.data?.members) {
      setMembers(homeDetailQuery.data.members)
    }
  }, [activeHomeId, clearMembers, homeDetailQuery.data?.members, setMembers])

  const totalPages = expensesQuery.data?.meta.totalPages ?? 1

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

    toast({
      title: 'Gasto eliminado',
      description: 'El gasto se elimino correctamente.',
      variant: 'success',
    })

    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Gastos</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground">Gastos del hogar activo</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Administra gastos con payers y splits balanceados. Los gastos cerrados solo se pueden consultar.
          </p>
        </div>
        {canManageExpenses ? (
          <Button
            type="button"
            onClick={() => {
              setIsCreateModalOpen(true)
            }}
          >
            <PlusIcon className="size-4" />
            Nuevo gasto
          </Button>
        ) : null}
      </div>

      {!canManageExpenses ? (
        <Alert variant="info">Tu rol es GUEST. Puedes ver gastos, pero no crear, editar ni eliminar.</Alert>
      ) : null}

      {expensesQuery.error ? (
        <Alert variant="error">
          {getErrorMessage(expensesQuery.error, 'No se pudo cargar el listado de gastos.')}
        </Alert>
      ) : null}

      {homeDetailQuery.error ? (
        <Alert variant="error">No se pudieron cargar los miembros del hogar activo.</Alert>
      ) : null}

      {expensesQuery.isLoading ? (
        <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(16,24,38,0.96))]">
          <CardContent className="grid gap-4 py-6 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-background/40" />
            ))}
          </CardContent>
        </Card>
      ) : null}

      {!expensesQuery.isLoading && (expensesQuery.data?.data.length ?? 0) === 0 ? (
        <Card className="border-primary/20 bg-[linear-gradient(180deg,rgba(20,184,166,0.08),rgba(16,24,38,0.96))]">
          <CardContent className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <p className="text-xl font-semibold text-foreground">Todavia no hay gastos en este hogar</p>
            <p className="max-w-lg text-sm text-muted-foreground">
              Registra el primer gasto para empezar a distribuir pagos entre miembros.
            </p>
            {canManageExpenses ? (
              <Button
                type="button"
                onClick={() => {
                  setIsCreateModalOpen(true)
                }}
              >
                <PlusIcon className="size-4" />
                Registrar primer gasto
              </Button>
            ) : null}
          </CardContent>
        </Card>
      ) : null}

      {!expensesQuery.isLoading && (expensesQuery.data?.data.length ?? 0) > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {expensesQuery.data?.data.map((expense) => {
            const isClosedExpense = expense.closureId !== null
            const canEditOrDelete = canManageExpenses && !isClosedExpense

            return (
              <article
                key={expense.id}
                className="rounded-2xl border border-white/8 bg-[linear-gradient(180deg,rgba(18,28,43,0.96),rgba(10,16,25,0.96))] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold text-foreground">{expense.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{formatDate(expense.date)}</p>
                  </div>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(expense.amount)}</p>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDetailId(expense.id)
                    }}
                  >
                    <EyeIcon className="size-4" />
                    Ver detalle
                  </Button>

                  {canManageExpenses ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={!canEditOrDelete}
                        onClick={() => {
                          setSelectedEditId(expense.id)
                        }}
                      >
                        <PencilSquareIcon className="size-4" />
                        Editar
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        disabled={!canEditOrDelete}
                        onClick={() => {
                          setDeleteTarget(expense)
                        }}
                      >
                        <TrashIcon className="size-4" />
                        Eliminar
                      </Button>
                    </>
                  ) : null}

                  {isClosedExpense ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-info/40 bg-info/12 px-2 py-1 text-xs font-semibold text-info">
                      <LockClosedIcon className="size-3" />
                      Cierre aplicado
                    </span>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}

      {!expensesQuery.isLoading && totalPages > 1 ? (
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={filters.page <= 1}
            onClick={() => {
              setFilters((previous) => ({
                ...previous,
                page: Math.max(1, previous.page - 1),
              }))
            }}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Pagina {filters.page} de {totalPages}
          </span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={filters.page >= totalPages}
            onClick={() => {
              setFilters((previous) => ({
                ...previous,
                page: Math.min(totalPages, previous.page + 1),
              }))
            }}
          >
            Siguiente
          </Button>
        </div>
      ) : null}

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
        confirmLabel="Eliminar gasto"
        isOpen={Boolean(deleteTarget)}
        isPending={deleteExpenseMutation.isPending}
        error={deleteExpenseMutation.error}
        onClose={() => {
          setDeleteTarget(null)
          deleteExpenseMutation.reset()
        }}
        onConfirm={() => {
          if (deleteTarget?.closureId) {
            toast({
              title: 'Gasto bloqueado',
              description: 'No puedes eliminar un gasto con cierre aplicado.',
              variant: 'info',
            })
            return
          }

          void handleDeleteExpense()
        }}
      />
    </div>
  )
}
