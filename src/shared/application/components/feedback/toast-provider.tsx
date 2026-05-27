import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'

import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'

import { cn } from '@/lib/utils'

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: string
  title: string
  description?: string
  variant: ToastVariant
  duration: number
}

type ToastInput = {
  title: string
  description?: string
  variant?: ToastVariant
  duration?: number
}

type ToastContextValue = {
  showToast: (toast: ToastInput) => void
  dismissToast: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastListeners = new Set<(toast: ToastInput) => void>()

const DEFAULT_DURATION = 4000

const toastStyles: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success/10 text-foreground',
  error: 'border-destructive/30 bg-destructive/10 text-foreground',
  info: 'border-info/30 bg-info/10 text-foreground',
}

const toastIcons = {
  success: CheckCircleIcon,
  error: ExclamationCircleIcon,
  info: InformationCircleIcon,
} satisfies Record<ToastVariant, typeof CheckCircleIcon>

const getToastId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)

export const ToastProvider = ({ children }: PropsWithChildren) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismissToast = useCallback((id: string) => {
    setToasts((currentToasts) => currentToasts.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    ({ title, description, variant = 'info', duration = DEFAULT_DURATION }: ToastInput) => {
      const toast: Toast = {
        id: getToastId(),
        title,
        description,
        variant,
        duration,
      }

      setToasts((currentToasts) => [...currentToasts, toast])
    },
    [],
  )

  useEffect(() => {
    toastListeners.add(showToast)

    return () => {
      toastListeners.delete(showToast)
    }
  }, [showToast])

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => {
        dismissToast(toast.id)
      }, toast.duration),
    )

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer))
    }
  }, [dismissToast, toasts])

  const value = useMemo(
    () => ({
      showToast,
      dismissToast,
    }),
    [dismissToast, showToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}

type ToastViewportProps = {
  toasts: Toast[]
  onDismiss: (id: string) => void
}

const ToastViewport = ({ toasts, onDismiss }: ToastViewportProps) => (
  <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4 sm:left-auto sm:right-4 sm:top-4 sm:block sm:w-full sm:max-w-sm">
    <div className="flex w-full max-w-sm flex-col gap-3">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.variant]

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg shadow-black/30 backdrop-blur',
              toastStyles[toast.variant],
            )}
          >
            <Icon className="mt-0.5 size-5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description ? (
                <p className="mt-1 text-sm text-muted-foreground">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => {
                onDismiss(toast.id)
              }}
              className="cursor-pointer rounded-full p-1 text-muted-foreground transition hover:bg-white/10 hover:text-foreground"
              aria-label="Cerrar notificacion"
            >
              <XMarkIcon className="size-4" />
            </button>
          </div>
        )
      })}
    </div>
  </div>
)

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext)

  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.')
  }

  return context
}

export const toast = (input: ToastInput): void => {
  toastListeners.forEach((listener) => {
    listener(input)
  })
}