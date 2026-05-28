import { useEffect } from 'react'

import { CalendarDateRangeIcon, LockClosedIcon } from '@heroicons/react/24/outline'

import { Button } from '@/components/ui/button'
import type { Expense } from '@/features/expenses/domain/Expense.entity'

type ExpenseDetailModalProps = {
  expense: Expense | null
  isOpen: boolean
  onClose: () => void
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

export const ExpenseDetailModal = ({ expense, isOpen, onClose }: ExpenseDetailModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  if (!isOpen || !expense) {
    return null
  }

  const isClosedExpense = expense.closureId !== null

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cerrar detalle"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-3xl overflow-y-auto overscroll-contain rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40 max-h-[92dvh] touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Detalle de gasto</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{expense.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <CalendarDateRangeIcon className="size-4" />
                {formatDate(expense.date)}
              </span>
              <span>{formatCurrency(expense.amount)}</span>
              {isClosedExpense ? (
                <span className="inline-flex items-center gap-1 rounded-full border border-info/40 bg-info/12 px-2 py-0.5 text-xs font-semibold text-info">
                  <LockClosedIcon className="size-3" />
                  Gasto cerrado
                </span>
              ) : null}
            </div>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {expense.description ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-foreground">
            {expense.description}
          </p>
        ) : null}

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <section className="rounded-xl border border-white/10 bg-white/3 p-4">
            <h3 className="text-sm font-semibold text-foreground">Payers</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {expense.payers.map((payer) => (
                <li key={payer.id ?? `${payer.userId}-${payer.amountPaid}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2">
                  <span className="text-foreground">
                    {payer.user?.name} {payer.user?.lastName}
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(payer.amountPaid)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-xl border border-white/10 bg-white/3 p-4">
            <h3 className="text-sm font-semibold text-foreground">Splits</h3>
            <ul className="mt-3 space-y-2 text-sm">
              {expense.splits.map((split) => (
                <li key={split.id ?? `${split.userId}-${split.amount}`} className="flex items-center justify-between gap-3 rounded-lg border border-white/8 px-3 py-2">
                  <span className="text-foreground">
                    {split.user?.name} {split.user?.lastName}
                  </span>
                  <span className="font-medium text-foreground">{formatCurrency(split.amount)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {expense.receiptUrl ? (
          <section className="mt-5 rounded-xl border border-white/10 bg-white/3 p-4">
            <h3 className="text-sm font-semibold text-foreground">Comprobante</h3>
            <img
              src={expense.receiptUrl}
              alt="Comprobante del gasto"
              className="mt-3 max-h-72 w-full rounded-xl border border-white/10 object-contain"
            />
          </section>
        ) : null}
      </div>
    </div>
  )
}
