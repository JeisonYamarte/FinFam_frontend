import { useEffect } from 'react'

import { BanknotesIcon, CalendarDaysIcon, DocumentTextIcon } from '@heroicons/react/24/outline'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatShortDate } from '@/features/homes/application/utils/formatters'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import type { HomeMember } from '@/features/homes/domain/Home.entity'

import type { ClosureSimulation } from '../../domain/Closure.entity'
import { summarizeMemberBalances } from '../utils/closure-presenters'
import { ClosureBalanceList } from './closure-balance-list'

type ClosurePreviewModalProps = {
  isOpen: boolean
  mode: 'simulate' | 'create'
  members: HomeMember[]
  preview: ClosureSimulation | null
  isLoading: boolean
  isConfirming: boolean
  simulateError?: unknown
  createError?: unknown
  onClose: () => void
  onConfirm: () => void
}

export const ClosurePreviewModal = ({
  isOpen,
  mode,
  members,
  preview,
  isLoading,
  isConfirming,
  simulateError,
  createError,
  onClose,
  onConfirm,
}: ClosurePreviewModalProps) => {
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

  if (!isOpen) {
    return null
  }

  const summary = preview ? summarizeMemberBalances(preview.balances, members) : []
  const title = mode === 'create' ? 'Preview antes de crear cierre' : 'Simulacion del cierre'
  const description =
    mode === 'create'
      ? 'Verifica el resultado final antes de confirmar el cierre del periodo abierto.'
      : 'Este preview te muestra quien debe a quien si cierras ahora mismo el periodo abierto.'

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button type="button" aria-label="Cerrar preview" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-5xl overflow-y-auto rounded-[32px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40 max-h-[92dvh] sm:p-7">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">Cierre financiero</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>

        {simulateError ? (
          <Alert className="mt-5" variant="error">
            {getErrorMessage(simulateError, 'No pudimos simular el cierre del hogar activo.')}
          </Alert>
        ) : null}

        {createError ? (
          <Alert className="mt-5" variant="error">
            {getErrorMessage(createError, 'No pudimos crear el cierre con este preview.')}
          </Alert>
        ) : null}

        {isLoading ? (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="h-28 animate-pulse rounded-[24px] border border-white/10 bg-background/35" />
            ))}
          </div>
        ) : null}

        {!isLoading && preview ? (
          <>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  <CalendarDaysIcon className="size-4" />
                  Periodo
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">
                  {formatShortDate(preview.period.startDate)} - {formatShortDate(preview.period.endDate)}
                </p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  <DocumentTextIcon className="size-4" />
                  Gastos incluidos
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">{preview.expensesCount}</p>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-background/35 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                  <BanknotesIcon className="size-4" />
                  Movimientos finales
                </div>
                <p className="mt-3 text-lg font-semibold text-foreground">{preview.debts.length}</p>
              </div>
            </div>

            <section className="mt-7">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Quien debe a quien</h3>
                  <p className="text-sm text-muted-foreground">Movimientos optimizados para cerrar el periodo actual.</p>
                </div>
              </div>

              <ClosureBalanceList balances={preview.debts} members={members} className="mt-4" />
            </section>

            <section className="mt-7">
              <h3 className="text-lg font-semibold text-foreground">Balance final por miembro</h3>
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
                      {formatCurrency(Math.abs(item.netAmount))}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </>
        ) : null}

        <div className="mt-8 flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" onClick={onClose}>
            Volver
          </Button>
          <Button type="button" disabled={isLoading || !preview || isConfirming} onClick={onConfirm}>
            {isConfirming ? 'Creando cierre...' : 'Confirmar y crear cierre'}
          </Button>
        </div>
      </div>
    </div>
  )
}