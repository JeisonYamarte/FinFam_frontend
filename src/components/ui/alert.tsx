import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'error' | 'success' | 'info'
}

const toneByVariant: Record<NonNullable<AlertProps['variant']>, string> = {
  error: 'border-rose-200 bg-rose-50 text-rose-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  info: 'border-sky-200 bg-sky-50 text-sky-700',
}

export const Alert = ({
  className,
  variant = 'info',
  role,
  'aria-live': ariaLive,
  ...props
}: AlertProps) => (
  <div
    aria-live={ariaLive ?? (variant === 'error' ? 'assertive' : 'polite')}
    className={cn(
      'rounded-xl border px-4 py-3 text-sm leading-relaxed',
      toneByVariant[variant],
      className,
    )}
    role={role ?? (variant === 'error' ? 'alert' : 'status')}
    {...props}
  />
)
