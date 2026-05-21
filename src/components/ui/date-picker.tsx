import * as React from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { format, isValid, parseISO } from 'date-fns'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

type DatePickerProps = {
  value?: string
  onChange?: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  name?: string
  id?: string
  className?: string
  'aria-describedby'?: string
  'aria-invalid'?: boolean
}

const parseDateValue = (value?: string): Date | undefined => {
  if (!value) {
    return undefined
  }

  const date = parseISO(value)
  return isValid(date) ? date : undefined
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      className,
      value,
      onChange,
      onBlur,
      disabled,
      id,
      name,
      'aria-describedby': ariaDescribedBy,
      'aria-invalid': ariaInvalid,
    },
    ref,
  ) => {
    const [isOpen, setIsOpen] = React.useState(false)
    const selectedDate = parseDateValue(value)

    return (
      <Popover onOpenChange={setIsOpen} open={isOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={ref}
            aria-describedby={ariaDescribedBy}
            aria-invalid={ariaInvalid}
            className={cn(
              'h-11 w-full justify-start rounded-xl border border-zinc-300 bg-white px-3 text-left text-sm font-normal text-zinc-900 shadow-xs hover:bg-white',
              !selectedDate && 'text-zinc-400',
              className,
            )}
            disabled={disabled}
            id={id}
            name={name}
            type="button"
            variant="ghost"
          >
            <CalendarDaysIcon className="mr-2 size-4 text-zinc-500" />
            {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Selecciona una fecha'}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            disabled={{ after: new Date() }}
            endMonth={new Date()}
            mode="single"
            onSelect={(date) => {
              onChange?.(date ? format(date, 'yyyy-MM-dd') : '')
              onBlur?.()
              setIsOpen(false)
            }}
            selected={selectedDate}
            startMonth={new Date(1900, 0)}
          />
        </PopoverContent>
      </Popover>
    )
  },
)

DatePicker.displayName = 'DatePicker'
