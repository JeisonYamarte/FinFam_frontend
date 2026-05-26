import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import * as React from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

type PasswordFieldProps = React.InputHTMLAttributes<HTMLInputElement>

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)

    return (
      <div className="relative">
        <Input
          ref={ref}
          className={cn('pr-11', className)}
          type={isVisible ? 'text' : 'password'}
          {...props}
        />
        <Button
          aria-label={isVisible ? 'Ocultar contrasena' : 'Mostrar contrasena'}
          className="absolute right-1 top-1 h-9 w-9 rounded-lg"
          onClick={() => setIsVisible((value) => !value)}
          size="sm"
          type="button"
          variant="ghost"
        >
          {isVisible ? (
            <EyeSlashIcon className="size-4" />
          ) : (
            <EyeIcon className="size-4" />
          )}
        </Button>
      </div>
    )
  },
)

PasswordField.displayName = 'PasswordField'
