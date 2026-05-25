import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

type FormErrorProps = {
  message?: string
}

export const FormError = ({ message }: FormErrorProps) => {
  if (!message) {
    return null
  }

  return (
    <p className="mt-1 inline-flex items-center gap-1.5 text-xs text-destructive">
      <ExclamationCircleIcon className="size-4" />
      <span>{message}</span>
    </p>
  )
}
