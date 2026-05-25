import * as React from 'react'
import { CalendarDaysIcon } from '@heroicons/react/24/outline'
import { format, parse, isValid } from 'date-fns'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

type DatePickerProps = {
  value?: string
  onChange: (value: string) => void
  onBlur?: () => void
  disabled?: boolean
  id?: string
  placeholder?: string
  className?: string
}

const DATE_FORMAT = 'yyyy-MM-dd'

function parseDateValue(value?: string): Date | undefined {
  if (!value) {
    return undefined
  }

  const parsedDate = parse(value, DATE_FORMAT, new Date())
  return isValid(parsedDate) ? parsedDate : undefined
}

export function DatePicker({
  value,
  onChange,
  onBlur,
  disabled,
  id,
  placeholder = 'Selecciona una fecha',
  className,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  const selectedDate = React.useMemo(() => parseDateValue(value), [value])

  const handleSelect = (date?: Date) => {
    if (!date) {
      onChange('')
      onBlur?.()
      return
    }

    onChange(format(date, DATE_FORMAT))
    onBlur?.()
    setOpen(false)
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)

    if (!nextOpen) {
      onBlur?.()
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          id={id}
          disabled={disabled}
          className={cn(
            'w-full justify-start font-normal',
            !selectedDate && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarDaysIcon className="size-4" aria-hidden="true" />
          {selectedDate ? format(selectedDate, 'PPP') : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={handleSelect}
          defaultMonth={selectedDate ?? new Date(new Date().getFullYear() - 18, 0)}
          captionLayout="dropdown"
          reverseYears
          disabled={(date) => date > new Date()}
        />
      </PopoverContent>
    </Popover>
  )
}