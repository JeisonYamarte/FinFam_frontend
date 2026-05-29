import { LockClosedIcon } from '@heroicons/react/24/outline'

import { Alert } from '@/components/ui/alert'
import { formatCurrency, formatShortDate } from '@/features/homes/application/utils/formatters'

import type { ClosureExpense } from '../../domain/Closure.entity'

type ClosureExpensesPanelProps = {
  expenses: ClosureExpense[]
  isLoading: boolean
  error?: unknown
}

export const ClosureExpensesPanel = ({
  expenses,
  isLoading,
  error,
}: ClosureExpensesPanelProps) => {
  if (error) {
    return <Alert variant="error">No pudimos cargar los gastos relacionados a este cierre.</Alert>
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-background/35" />
        ))}
      </div>
    )
  }

  if (expenses.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/30 px-4 py-6 text-center text-sm text-muted-foreground">
        Este cierre no tiene gastos relacionados.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {expenses.map((expense) => (
        <article
          key={expense.id}
          className="rounded-2xl border border-white/10 bg-background/35 px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-sm font-semibold text-foreground sm:text-base">{expense.title}</p>
                <span className="inline-flex items-center gap-1 rounded-full border border-info/35 bg-info/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-info">
                  <LockClosedIcon className="size-3" />
                  Cerrado
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{formatShortDate(expense.date)}</p>
              {expense.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{expense.description}</p>
              ) : null}
            </div>
            <p className="text-sm font-semibold text-foreground sm:text-base">{formatCurrency(expense.amount)}</p>
          </div>
        </article>
      ))}
    </div>
  )
}