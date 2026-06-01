import { useEffect, useMemo, type FocusEvent } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import {
  ArrowPathIcon,
  CheckBadgeIcon,
  PlusIcon,
  ScaleIcon,
} from '@heroicons/react/24/outline'
import { useFieldArray, useForm, useWatch } from 'react-hook-form'

import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { getErrorMessage } from '@/features/auth/application/utils/error-message'
import type { HomeMember } from '@/features/homes/domain/Home.entity'

import {
  createExpenseSchema,
  isMoneyEqual,
  normalizeMoney,
  type CreateExpenseFormValues,
} from '../../domain/expense.schemas'
import type {
  Expense,
  ExpensePayerInput,
  ExpenseSplitInput,
} from '../../domain/Expense.entity'

type ExpenseFormSubmitPayload = {
  title: string
  description: string
  amount: number
  date: string
  payers: ExpensePayerInput[]
  splits: ExpenseSplitInput[]
  receipt?: File | null
}

type ExpenseFormModalProps = {
  isOpen: boolean
  mode: 'create' | 'edit'
  members: HomeMember[]
  isPending: boolean
  error: unknown
  initialExpense?: Expense | null
  onClose: () => void
  onSubmit: (values: ExpenseFormSubmitPayload) => Promise<void>
}

const getDefaultValues = (
  members: HomeMember[],
  initialExpense?: Expense | null,
): CreateExpenseFormValues => {
  if (initialExpense) {
    return {
      title: initialExpense.title,
      description: initialExpense.description ?? '',
      amount: initialExpense.amount,
      date: initialExpense.date.slice(0, 10),
      payers: initialExpense.payers.map((payer) => ({
        userId: payer.userId,
        amountPaid: payer.amountPaid,
      })),
      splits: initialExpense.splits.map((split) => ({
        userId: split.userId,
        amount: split.amount,
      })),
      receipt: null,
    }
  }

  const firstMember = members[0]

  return {
    title: '',
    description: '',
    amount: 0,
    date: new Date().toISOString().slice(0, 10),
    payers: firstMember
      ? [{ userId: firstMember.userId, amountPaid: 0 }]
      : [{ userId: '', amountPaid: 0 }],
    splits: firstMember
      ? [{ userId: firstMember.userId, amount: 0 }]
      : [{ userId: '', amount: 0 }],
    receipt: null,
  }
}

const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 2,
  }).format(value)

const getRemainingAmount = (target: number, values: number[]): number =>
  normalizeMoney(target - values.reduce((acc, value) => acc + normalizeMoney(value || 0), 0))

const distributeAmount = (amount: number, entries: number): number[] => {
  if (entries <= 0) {
    return []
  }

  const cents = Math.round(normalizeMoney(amount) * 100)
  const base = Math.floor(cents / entries)
  const remainder = cents - base * entries

  return Array.from({ length: entries }).map((_, index) =>
    normalizeMoney((base + (index === entries - 1 ? remainder : 0)) / 100),
  )
}

export const ExpenseFormModal = ({
  isOpen,
  mode,
  members,
  isPending,
  error,
  initialExpense,
  onClose,
  onSubmit,
}: ExpenseFormModalProps) => {
  const form = useForm<CreateExpenseFormValues>({
    resolver: zodResolver(createExpenseSchema),
    defaultValues: getDefaultValues(members, initialExpense),
    mode: 'onSubmit',
    reValidateMode: 'onBlur',
  })

  const {
    fields: payerFields,
    append: appendPayer,
    remove: removePayer,
  } = useFieldArray({
    control: form.control,
    name: 'payers',
  })

  const {
    fields: splitFields,
    append: appendSplit,
    remove: removeSplit,
  } = useFieldArray({
    control: form.control,
    name: 'splits',
  })

  const amount = useWatch({ control: form.control, name: 'amount' }) ?? 0
  const payers = useWatch({ control: form.control, name: 'payers' })
  const splits = useWatch({ control: form.control, name: 'splits' })
  const receipt = useWatch({ control: form.control, name: 'receipt' })
  const receiptPreviewUrl = useMemo(
    () => (receipt instanceof File ? URL.createObjectURL(receipt) : null),
    [receipt],
  )

  const payerRemaining = useMemo(
    () => getRemainingAmount(amount, (payers ?? []).map((payer) => payer.amountPaid || 0)),
    [amount, payers],
  )

  const splitRemaining = useMemo(
    () => getRemainingAmount(amount, (splits ?? []).map((split) => split.amount || 0)),
    [amount, splits],
  )

  useEffect(() => {
    if (!isOpen) {
      form.reset(getDefaultValues(members, initialExpense))
    }
  }, [form, initialExpense, isOpen, members])

  useEffect(() => {
    if (!isOpen || mode !== 'edit' || !initialExpense) {
      return
    }

    // When editing, hydrate the form with the fetched expense once it is available.
    form.reset(getDefaultValues(members, initialExpense))
  }, [form, initialExpense, isOpen, members, mode])

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

  useEffect(() => {
    if (!receiptPreviewUrl) {
      return
    }

    return () => {
      URL.revokeObjectURL(receiptPreviewUrl)
    }
  }, [receiptPreviewUrl])

  if (!isOpen) {
    return null
  }

  const addMemberToPayers = () => {
    const usedIds = new Set((form.getValues('payers') ?? []).map((payer) => payer.userId))
    const availableMember = members.find((member) => !usedIds.has(member.userId))

    appendPayer({
      userId: availableMember?.userId ?? '',
      amountPaid: 0,
    })
  }

  const addMemberToSplits = () => {
    const usedIds = new Set((form.getValues('splits') ?? []).map((split) => split.userId))
    const availableMember = members.find((member) => !usedIds.has(member.userId))

    appendSplit({
      userId: availableMember?.userId ?? '',
      amount: 0,
    })
  }

  const assignPayerRemaining = (index: number) => {
    const values = form.getValues('payers')
    const remaining = getRemainingAmount(
      form.getValues('amount') || 0,
      values.map((payer) => payer.amountPaid || 0),
    )
    const currentAmount = values[index]?.amountPaid || 0

    form.setValue(
      `payers.${index}.amountPaid`,
      normalizeMoney(Math.max(0, currentAmount + remaining)),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const assignSplitRemaining = (index: number) => {
    const values = form.getValues('splits')
    const remaining = getRemainingAmount(
      form.getValues('amount') || 0,
      values.map((split) => split.amount || 0),
    )
    const currentAmount = values[index]?.amount || 0

    form.setValue(
      `splits.${index}.amount`,
      normalizeMoney(Math.max(0, currentAmount + remaining)),
      { shouldDirty: true, shouldValidate: true },
    )
  }

  const dividePayers = () => {
    const values = form.getValues('payers')
    const distributed = distributeAmount(form.getValues('amount') || 0, values.length)

    distributed.forEach((value, index) => {
      form.setValue(`payers.${index}.amountPaid`, value, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const divideSplits = () => {
    const values = form.getValues('splits')
    const distributed = distributeAmount(form.getValues('amount') || 0, values.length)

    distributed.forEach((value, index) => {
      form.setValue(`splits.${index}.amount`, value, {
        shouldDirty: true,
        shouldValidate: true,
      })
    })
  }

  const handleFileChange = (file: File | null) => {
    form.setValue('receipt', file, {
      shouldDirty: true,
      shouldValidate: true,
    })
  }

  const handleSubmit = async (values: CreateExpenseFormValues) => {
    await onSubmit({
      title: values.title.trim(),
      description: values.description?.trim() ?? '',
      amount: normalizeMoney(values.amount),
      date: values.date,
      payers: values.payers.map((payer) => ({
        userId: payer.userId,
        amountPaid: normalizeMoney(payer.amountPaid),
      })),
      splits: values.splits.map((split) => ({
        userId: split.userId,
        amount: normalizeMoney(split.amount),
      })),
      receipt: values.receipt ?? undefined,
    })

    form.reset(getDefaultValues(members, null))
  }

  const payersIsBalanced = isMoneyEqual(payerRemaining, 0)
  const splitsIsBalanced = isMoneyEqual(splitRemaining, 0)
  const totalIsBalanced = payersIsBalanced && splitsIsBalanced

  const handleMoneyInputFocus = (event: FocusEvent<HTMLInputElement>) => {
    event.currentTarget.select()
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end justify-center overflow-y-auto bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0"
        onClick={() => {
          if (!isPending) {
            onClose()
          }
        }}
      />
      <div className="relative z-10 w-full max-w-5xl overflow-y-auto overscroll-contain rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40 max-h-[92dvh] touch-pan-y [-webkit-overflow-scrolling:touch]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary/80">
            {mode === 'create' ? 'Nuevo gasto' : 'Editar gasto'}
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            {mode === 'create' ? 'Registrar gasto' : 'Actualizar gasto'}
          </h2>
          <p className="text-sm text-muted-foreground">
            Empieza por el monto y luego reparte el pago entre payers y splits hasta cuadrar.
          </p>
        </div>

        <Form {...form}>
          <form className="mt-6 space-y-6" onSubmit={form.handleSubmit(handleSubmit)}>
            <section className="grid gap-4 rounded-2xl border border-white/10 bg-white/3 p-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Titulo</span>
                <Input
                  autoFocus
                  placeholder="Ej. Mercado semanal"
                  {...form.register('title')}
                />
                {form.formState.errors.title ? (
                  <p className="text-xs text-destructive">{form.formState.errors.title.message}</p>
                ) : null}
              </label>
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Fecha</span>
                <Input type="date" {...form.register('date')} />
                {form.formState.errors.date ? (
                  <p className="text-xs text-destructive">{form.formState.errors.date.message}</p>
                ) : null}
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="font-medium text-foreground">Monto total</span>
                <Input
                  type="number"
                  min={0}
                  step="0.01"
                  className="h-12 text-lg font-semibold"
                  onFocus={handleMoneyInputFocus}
                  {...form.register('amount', { valueAsNumber: true })}
                />
                {form.formState.errors.amount ? (
                  <p className="text-xs text-destructive">{form.formState.errors.amount.message}</p>
                ) : null}
              </label>
              <label className="space-y-2 text-sm sm:col-span-2">
                <span className="font-medium text-foreground">Descripcion</span>
                <textarea
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  placeholder="Opcional"
                  {...form.register('description')}
                />
                {form.formState.errors.description ? (
                  <p className="text-xs text-destructive">{form.formState.errors.description.message}</p>
                ) : null}
              </label>
            </section>

            <section className="rounded-2xl border border-primary/25 bg-primary/8 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">
                    Estado de balance
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalIsBalanced
                      ? 'Todo cuadra. Puedes guardar el gasto.'
                      : 'Ajusta payers y splits hasta cuadrar con el monto total.'}
                  </p>
                </div>
                {totalIsBalanced ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-success/40 bg-success/12 px-3 py-1 text-xs font-semibold text-success">
                    <CheckBadgeIcon className="size-4" />
                    OK
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full border border-info/40 bg-info/12 px-3 py-1 text-xs font-semibold text-info">
                    <ScaleIcon className="size-4" />
                    Pendiente
                  </span>
                )}
              </div>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2">
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Payers</p>
                  <p className="mt-1 font-medium text-foreground">Restante: {formatCurrency(payerRemaining)}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-black/15 px-3 py-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Splits</p>
                  <p className="mt-1 font-medium text-foreground">Restante: {formatCurrency(splitRemaining)}</p>
                </div>
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-foreground">Payers</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" variant="ghost" className="flex-1 sm:flex-none" onClick={dividePayers}>
                      <ArrowPathIcon className="size-4" />
                      Dividir
                    </Button>
                    <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={addMemberToPayers}>
                      <PlusIcon className="size-4" />
                      Agregar miembro
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {payerFields.map((field, index) => (
                    <div key={field.id} className="grid min-w-0 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[minmax(0,1fr)_130px_auto_auto]">
                      <select
                        className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                        {...form.register(`payers.${index}.userId` as const)}
                      >
                        <option value="" className="bg-card text-muted-foreground">
                          Selecciona miembro
                        </option>
                        {members.map((member) => (
                          <option key={member.userId} value={member.userId} className="bg-card text-foreground">
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        onFocus={handleMoneyInputFocus}
                        {...form.register(`payers.${index}.amountPaid` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          assignPayerRemaining(index)
                        }}
                      >
                        Resto
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={payerFields.length <= 1}
                        onClick={() => {
                          removePayer(index)
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.payers?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.payers.message}</p>
                ) : null}
              </div>

              <div className="space-y-3 rounded-2xl border border-white/10 bg-white/3 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-foreground">Splits</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button type="button" size="sm" variant="ghost" className="flex-1 sm:flex-none" onClick={divideSplits}>
                      <ArrowPathIcon className="size-4" />
                      Dividir
                    </Button>
                    <Button type="button" size="sm" className="flex-1 sm:flex-none" onClick={addMemberToSplits}>
                      <PlusIcon className="size-4" />
                      Agregar miembro
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {splitFields.map((field, index) => (
                    <div key={field.id} className="grid min-w-0 gap-2 rounded-xl border border-white/10 p-3 sm:grid-cols-[minmax(0,1fr)_130px_auto_auto]">
                      <select
                        className="h-9 w-full min-w-0 rounded-md border border-input bg-card px-3 text-sm text-foreground"
                        {...form.register(`splits.${index}.userId` as const)}
                      >
                        <option value="" className="bg-card text-muted-foreground">
                          Selecciona miembro
                        </option>
                        {members.map((member) => (
                          <option key={member.userId} value={member.userId} className="bg-card text-foreground">
                            {member.name} ({member.role})
                          </option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        onFocus={handleMoneyInputFocus}
                        {...form.register(`splits.${index}.amount` as const, {
                          valueAsNumber: true,
                        })}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="w-full sm:w-auto"
                        onClick={() => {
                          assignSplitRemaining(index)
                        }}
                      >
                        Resto
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full sm:w-auto"
                        disabled={splitFields.length <= 1}
                        onClick={() => {
                          removeSplit(index)
                        }}
                      >
                        Quitar
                      </Button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.splits?.message ? (
                  <p className="text-xs text-destructive">{form.formState.errors.splits.message}</p>
                ) : null}
              </div>
            </section>

            <section className="rounded-2xl border border-white/10 bg-white/3 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-foreground">Comprobante (opcional)</p>
                  
                </div>
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-sm text-foreground hover:bg-accent">
                  Seleccionar imagen
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(event) => {
                      handleFileChange(event.target.files?.[0] ?? null)
                    }}
                  />
                </label>
              </div>

              {receiptPreviewUrl ? (
                <div className="mt-3 space-y-3">
                  <img
                    src={receiptPreviewUrl}
                    alt="Preview del comprobante"
                    className="max-h-52 w-full rounded-xl border border-white/10 object-cover"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      handleFileChange(null)
                    }}
                  >
                    Quitar imagen
                  </Button>
                </div>
              ) : initialExpense?.receiptUrl ? (
                <div className="mt-3 text-xs text-muted-foreground">
                  Este gasto ya tiene comprobante cargado. Puedes reemplazarlo seleccionando una nueva imagen.
                </div>
              ) : null}
            </section>

            {error ? (
              <Alert variant="error">
                {getErrorMessage(error, 'No se pudo guardar el gasto.')}
              </Alert>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending || !totalIsBalanced || members.length === 0}>
                {isPending
                  ? 'Guardando...'
                  : mode === 'create'
                    ? 'Crear gasto'
                    : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
