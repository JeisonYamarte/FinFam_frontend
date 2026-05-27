import {
  EllipsisHorizontalIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline'
import { Link } from '@tanstack/react-router'

import { Alert } from '../../components/ui/alert'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import {
  useHomeCalculation,
  useHomeClosures,
  useHomeDetail,
  useHomeExpenses,
} from '@/features/homes/application/hooks/use-homes'
import {
  formatCurrency,
  formatShortDate,
  getInitials,
} from '@/features/homes/application/utils/formatters'
import { activeHomeSelectors, useActiveHomeStore } from '@/stores/active-home.store'

export const DashboardPage = () => {
  const activeHomeId = useActiveHomeStore(activeHomeSelectors.id)
  const activeHomeName = useActiveHomeStore(activeHomeSelectors.name)
  const activeUserRole = useActiveHomeStore(activeHomeSelectors.role)
  const isAdmin = activeUserRole === 'ADMIN'

  const homeDetailQuery = useHomeDetail(activeHomeId)
  const homeCalculationQuery = useHomeCalculation(activeHomeId)
  const expensesQuery = useHomeExpenses(activeHomeId, 5)
  const closuresQuery = useHomeClosures(activeHomeId, 3)

  const members = homeDetailQuery.data?.members ?? []
  const visibleMembers = members.slice(0, 4)
  const hasMoreMembers = members.length > 4
  const balance = homeCalculationQuery.data?.balance ?? 0
  const balanceLabel = balance >= 0 ? 'Te deben' : 'Debes'
  const balanceTone = balance >= 0 ? 'text-emerald-400' : 'text-rose-400'
  const hasDashboardError =
    homeDetailQuery.error || homeCalculationQuery.error || expensesQuery.error || closuresQuery.error
  const isDashboardLoading =
    homeDetailQuery.isLoading ||
    homeCalculationQuery.isLoading ||
    expensesQuery.isLoading ||
    closuresQuery.isLoading

  return (
    <div className="space-y-6">
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
              <Button type="button" variant="secondary">
                Simular cierre
              </Button>
              <Button type="button">Crear cierre</Button>
            </div>
          ) : null}
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <MetricCard
            label="Total gastado"
            value={isDashboardLoading ? '...' : formatCurrency(homeCalculationQuery.data?.totalSpent ?? 0)}
            helper={`${expensesQuery.data?.length ?? 0} gastos recientes`}
          />
          <MetricCard
            label="Tu saldo"
            value={isDashboardLoading ? '...' : formatCurrency(balance)}
            helper={balanceLabel}
            valueClassName={balanceTone}
          />
          <MetricCard
            label="Miembros"
            value={String(homeCalculationQuery.data?.membersCount ?? members.length)}
            helper={
              members.length > 0
                ? `${members.filter((member) => member.role === 'ADMIN').length} admin - ${members.filter((member) => member.role === 'GUEST').length} invitados`
                : 'Sin miembros cargados'
            }
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
                  className="flex flex-wrap items-start gap-3 rounded-2xl border border-white/8 bg-background/45 px-3 py-3 sm:flex-nowrap sm:items-center"
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
                  {isAdmin ? (
                    <div className="ml-auto hidden gap-2 sm:ml-0 sm:flex">
                      <Button type="button" size="icon-sm" variant="ghost">
                        <PencilSquareIcon className="size-4" />
                      </Button>
                      <Button type="button" size="icon-sm" variant="ghost">
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
                    <div
                      key={member.id}
                      className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/8 bg-background/45 px-3 py-3 sm:flex-nowrap"
                    >
                      <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sky-200/90 text-sm font-semibold text-sky-900">
                        {getInitials(member.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-foreground sm:text-base">
                          {member.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground sm:text-sm">
                          {member.email || 'Sin correo'}
                        </p>
                      </div>
                      <span className="order-3 rounded-full bg-emerald-400/15 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-100 ring-1 ring-emerald-300/20 sm:order-0">
                        {member.role}
                      </span>
                      {isAdmin ? (
                        <Button type="button" size="icon-sm" variant="ghost" className="order-2 ml-auto sm:order-0 sm:ml-0">
                          <EllipsisHorizontalIcon className="size-4" />
                        </Button>
                      ) : null}
                    </div>
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
