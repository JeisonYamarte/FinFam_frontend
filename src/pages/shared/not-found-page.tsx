import { Link } from '@tanstack/react-router'

import { Button } from '../../components/ui/button'

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-zinc-50 px-4">
    <div className="max-w-md space-y-5 text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-600">404</p>
      <h1 className="text-3xl font-semibold text-zinc-900">Pagina no encontrada</h1>
      <p className="text-sm text-zinc-600">
        La ruta que buscas no existe o fue movida.
      </p>
      <Link to="/">
        <Button type="button">Volver al inicio</Button>
      </Link>
    </div>
  </main>
)
