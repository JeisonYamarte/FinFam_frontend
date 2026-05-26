import { Link } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-background px-4">
    <div className="max-w-md space-y-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">404</p>
      <h1 className="text-3xl font-semibold text-foreground">Pagina no encontrada</h1>
      <p className="text-sm text-muted-foreground">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/">
        <Button type="button">Volver al inicio</Button>
      </Link>
    </div>
  </main>
)
