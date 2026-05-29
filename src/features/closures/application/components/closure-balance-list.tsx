import { ArrowLongRightIcon } from '@heroicons/react/24/outline'

import { formatCurrency } from '@/features/homes/application/utils/formatters'
import { cn } from '@/lib/utils'
import type { HomeMember } from '@/features/homes/domain/Home.entity'

import type { ClosureBalance } from '../../domain/Closure.entity'
import { getClosureMemberPresentation } from '../utils/closure-presenters'

type ClosureBalanceListProps = {
  balances: ClosureBalance[]
  members: HomeMember[]
  emptyMessage?: string
  className?: string
}

export const ClosureBalanceList = ({
  balances,
  members,
  emptyMessage = 'No hay saldos pendientes entre miembros para este cierre.',
  className,
}: ClosureBalanceListProps) => {
  if (balances.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background/30 px-4 py-6 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={cn('space-y-3', className)}>
      {balances.map((balance) => {
        const debtor = getClosureMemberPresentation(balance.fromUserId, members)
        const creditor = getClosureMemberPresentation(balance.toUserId, members)

        return (
          <div
            key={`${balance.fromUserId}-${balance.toUserId}-${balance.amount}`}
            className="rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,36,0.96),rgba(9,14,22,0.96))] p-4 shadow-lg shadow-black/20"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-rose-500/12 text-sm font-semibold text-rose-200">
                  {debtor.initials}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{debtor.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-rose-200/80">Debe pagar</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-300/20 bg-amber-300/8 px-3 py-2 lg:min-w-[220px] lg:justify-center">
                <ArrowLongRightIcon className="size-5 text-amber-200" />
                <span className="text-sm font-semibold text-amber-50">{formatCurrency(balance.amount)}</span>
                <ArrowLongRightIcon className="size-5 text-amber-200" />
              </div>

              <div className="flex min-w-0 items-center gap-3 lg:justify-end">
                <div className="min-w-0 text-left lg:text-right">
                  <p className="truncate text-sm font-semibold text-foreground">{creditor.name}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-emerald-200/80">Recibe</p>
                </div>
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/12 text-sm font-semibold text-emerald-200">
                  {creditor.initials}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}