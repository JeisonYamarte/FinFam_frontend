import { useEffect, useMemo, useState } from 'react'

import { CalendarDaysIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { formatShortDate } from '@/features/homes/application/utils/formatters'
import type { HomeMember } from '@/features/homes/domain/Home.entity'

import { useClosureBalances, useClosureDetail, useClosureExpenses } from '../hooks/use-closures'
import { summarizeClosureBalances } from '../utils/closure-presenters'
import { ClosureBalanceList } from './closure-balance-list'
import { ClosureExpensesPanel } from './closure-expenses-panel'

type ClosureDetailModalProps = {
  closureId: string | null
  members: HomeMember[]
  isOpen: boolean
  onClose: () => void
}

export const ClosureDetailModal = ({
  closureId,
  members,
  isOpen,
  onClose,
}: ClosureDetailModalProps) => {
  const [showExpenses, setShowExpenses] = useState(false)

  const detailQuery = useClosureDetail(isOpen ? closureId : null)
  const balancesQuery = useClosureBalances(isOpen ? closureId : null)
  const expensesQuery = useClosureExpenses(isOpen && showExpenses ? closureId : null)

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

  const balances = useMemo(
    () => balancesQuery.data ?? detailQuery.data?.balances ?? [],
    [balancesQuery.data, detailQuery.data?.balances],
  )

  const summary = useMemo(
    () => summarizeClosureBalances(balances, members),
    [balances, members],
  )

  if (!isOpen) {
    return null
  }

  const handleClose = () => {
    setShowExpenses(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label="Cerrar detalle de cierre" className="absolute inset-0" onClick={handleClose} />
      <div className="relative z-10 w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40 max-h-[92dvh] sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Historial de cierres</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">Detalle del cierre</h2>
            {detailQuery.data ? (
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <CalendarDaysIcon className="size-4" />
                  {formatShortDate(detailQuery.data.startDate)} - {formatShortDate(detailQuery.data.endDate)}
                </span>
                <span>Creado {formatShortDate(detailQuery.data.createdAt)}</span>
              </div>
            ) : null}
          </div>
          <Button type="button" variant="ghost" onClick={handleClose}>
            Cerrar
          </Button>
        </div>

        {detailQuery.error || balancesQuery.error ? (
          <Alert className="mt-5" variant="error">
            No pudimos cargar el detalle completo de este cierre.
          </Alert>
        ) : null}

        {detailQuery.isLoading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[24px] border border-white/10 bg-background/35" />
            ))}
          </div>
        ) : null}

        {!detailQuery.isLoading && detailQuery.data ? (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Periodo cerrado</p>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {formatShortDate(detailQuery.data.startDate)} - {formatShortDate(detailQuery.data.endDate)}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Fecha de cierre</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{formatShortDate(detailQuery.data.createdAt)}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Movimientos</p>
                <p className="mt-3 text-lg font-semibold text-foreground">{balances.length}</p>
              </div>
            </div>

            <section className="mt-7">
              <h3 className="text-lg font-semibold text-foreground">Balances finales</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {summary.map((item) => (
                  <div key={item.userId} className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-11 items-center justify-center rounded-2xl bg-white/8 text-sm font-semibold text-foreground">
                        {item.initials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{item.name}</p>
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                          {item.netAmount >= 0 ? 'Recibe' : 'Debe cubrir'}
                        </p>
                      </div>
                    </div>
                    <p className="mt-4 text-xl font-semibold text-foreground">
                      {Math.abs(item.netAmount).toLocaleString('es-CL', {
                        style: 'currency',
                        currency: 'CLP',
                        maximumFractionDigits: 0,
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-7">
              <h3 className="text-lg font-semibold text-foreground">Quien debe a quien</h3>
              <p className="text-sm text-muted-foreground">Relaciones finales registradas despues del cierre.</p>
              <ClosureBalanceList balances={balances} members={members} className="mt-4" />
            </section>

            <section className="mt-7 rounded-[28px] border border-white/10 bg-background/25 p-4 sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    <DocumentTextIcon className="size-4" />
                    Gastos relacionados
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Revisa los gastos incluidos en este cierre sin salir del historial.
                  </p>
                </div>
                <Button
                  type="button"
                  variant={showExpenses ? 'secondary' : 'outline'}
                  onClick={() => {
                    setShowExpenses((current) => !current)
                  }}
                >
                  {showExpenses ? 'Ocultar gastos' : 'Ver gastos relacionados'}
                </Button>
              </div>

              {showExpenses ? (
                <div className="mt-4">
                  <ClosureExpensesPanel
                    expenses={expensesQuery.data ?? []}
                    isLoading={expensesQuery.isLoading}
                    error={expensesQuery.error}
                  />
                </div>
              ) : null}
            </section>
          </>
        ) : null}
      </div>
    </div>
  )
}