import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type ConfirmActionModalProps = {
  title: string
  description: string
  confirmLabel: string
  isOpen: boolean
  isPending?: boolean
  error?: unknown
  onClose: () => void
  onConfirm: () => void
}

export const ConfirmActionModal = ({
  title,
  description,
  confirmLabel,
  isOpen,
  isPending = false,
  error,
  onClose,
  onConfirm,
}: ConfirmActionModalProps) => {
  if (!isOpen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 px-4 py-6 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        aria-label="Cerrar confirmacion"
        className="absolute inset-0"
        onClick={() => {
          if (!isPending) {
            onClose()
          }
        }}
      />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] border border-white/10 bg-card p-6 shadow-2xl shadow-black/40">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-destructive/80">
            Confirmacion
          </p>
          <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {error ? <Alert className="mt-4" variant="error">No se pudo completar la accion.</Alert> : null}

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" disabled={isPending} onClick={onClose}>
            Cancelar
          </Button>
          <Button type="button" variant="destructive" disabled={isPending} onClick={onConfirm}>
            {isPending ? 'Procesando...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
