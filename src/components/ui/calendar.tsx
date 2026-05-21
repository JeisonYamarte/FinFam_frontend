import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

import { cn } from '@/lib/utils'

type CalendarProps = React.ComponentProps<typeof DayPicker>

export const Calendar = ({ className, showOutsideDays = true, ...props }: CalendarProps) => {
  return (
    <DayPicker
      animate
      captionLayout="dropdown"
      className={cn('p-3', className)}
      classNames={{
        root: 'rdp-root',
        months: 'flex flex-col gap-3 sm:flex-row',
        month: 'space-y-3',
        month_caption: 'relative flex h-9 items-center justify-center',
        caption_label: 'text-sm font-semibold text-zinc-900',
        dropdowns: 'flex items-center gap-2',
        dropdown_root: 'relative',
        dropdown:
          'h-8 rounded-md border border-zinc-200 bg-white px-2 pr-7 text-xs font-medium text-zinc-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20',
        months_dropdown: 'h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700',
        years_dropdown: 'h-8 rounded-md border border-zinc-200 bg-white px-2 text-xs font-medium text-zinc-700',
        nav: 'absolute inset-x-0 top-0 flex h-9 items-center justify-between',
        button_previous:
          'inline-flex size-8 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
        button_next:
          'inline-flex size-8 items-center justify-center rounded-md text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-[0.72rem] font-semibold uppercase tracking-wide text-zinc-500',
        weeks: 'mt-2',
        week: 'mt-1 flex w-full',
        day: 'relative size-9 p-0 text-center text-sm',
        day_button:
          'size-9 rounded-md p-0 text-sm font-normal text-zinc-800 transition-colors hover:bg-zinc-100 hover:text-zinc-900',
        selected:
          'bg-teal-600 text-white hover:bg-teal-600 hover:text-white focus:bg-teal-600 focus:text-white',
        today: 'bg-zinc-100 font-semibold text-zinc-900',
        outside: 'text-zinc-400 opacity-60',
        disabled: 'text-zinc-300 opacity-50',
        hidden: 'invisible',
      }}
      components={{
        Chevron: ({ orientation, className: iconClassName }) => {
          if (orientation === 'left') {
            return <ChevronLeftIcon className={cn('size-4', iconClassName)} />
          }

          return <ChevronRightIcon className={cn('size-4', iconClassName)} />
        },
      }}
      navLayout="after"
      showOutsideDays={showOutsideDays}
      {...props}
    />
  )
}

Calendar.displayName = 'Calendar'
