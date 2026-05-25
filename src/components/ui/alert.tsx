import type { HTMLAttributes } from 'react'

import { cn } from '@/lib/utils'

type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: 'error' | 'success' | 'info'
}

const toneByVariant: Record<NonNullable<AlertProps['variant']>, string> = {
  error: 'border-destructive/40 bg-destructive/15 text-destructive',
  success: 'border-success/40 bg-success/15 text-success',
  info: 'border-info/40 bg-info/15 text-info',
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
