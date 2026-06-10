import { Link } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import {
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  QuestionMarkCircleIcon,
  ScaleIcon,
  ShoppingCartIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

const LandingPage = () => {
  const scrollToSection = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/80 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <p className="text-lg font-extrabold tracking-tight text-primary">FinFam</p>

          <nav className="hidden items-center gap-6 md:flex">
            <button
              type="button"
              onClick={() => scrollToSection('como-funciona')}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Cómo funciona
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('caracteristicas')}
              className="text-sm font-semibold text-muted-foreground transition-colors hover:text-primary"
            >
              Características
            </button>
          </nav>

          <Button asChild size="sm" className="transition-colors">
            <Link to="/login">Iniciar sesión</Link>
          </Button>
        </div>
      </header>

      <main>
        <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 md:items-center md:gap-12 md:py-20 lg:px-8">
          <div>
            <p className="mb-3 inline-flex rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              Gestion de gastos compartidos
            </p>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl md:text-5xl">
              Divide gastos, no amistades.
            </h1>
            <p className="mt-4 max-w-xl text-sm text-muted-foreground sm:text-base">
              Lleva el control de los gastos de tu hogar sin conflictos ni confusiones.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="transition-colors">
                <Link to="/register">Comenzar gratis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="transition-colors"
                onClick={() => scrollToSection('como-funciona')}
              >
                Ver demo
              </Button>
            </div>
          </div>

          <div className="w-full md:justify-self-end md:max-w-xl">
            <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm shadow-black/20">
            {/* IMAGE: mockup de la app en pantalla de dashboard
                Tamano sugerido: 600x400px, fondo transparente o blanco
                Coloca aqui: ![HogarPay dashboard](/images/hero-mockup.png) */}
              <img
                src="https://res.cloudinary.com/dy8f3lczs/image/upload/v1781045588/mockup-dashboard_hizx9v.png"
                alt="Vista dashboard de FinFam"
                className="block h-auto w-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section id="como-funciona" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">¿Te suena familiar?</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            <Card className="border-border/80 bg-card/95">
              <CardContent className="flex items-center gap-4 p-6 sm:p-7">
                <div className="rounded-lg bg-primary/10 p-2.5" aria-hidden="true">
                  <ShoppingCartIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm font-medium">¿Quién pagó el supermercado este mes?</p>
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card/95">
              <CardContent className="flex items-center gap-4 p-6 sm:p-7">
                <div className="rounded-lg bg-primary/10 p-2.5" aria-hidden="true">
                  <QuestionMarkCircleIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm font-medium">¿Cuánto te debo exactamente?</p>
              </CardContent>
            </Card>
            <Card className="border-border/80 bg-card/95">
              <CardContent className="flex items-center gap-4 p-6 sm:p-7">
                <div className="rounded-lg bg-primary/10 p-2.5" aria-hidden="true">
                  <ExclamationTriangleIcon className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm font-medium">Cada cierre de mes es un caos</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Simple en 3 pasos</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            <Card className="border-border/80 bg-card/95">
              <CardHeader>
                <p className="text-4xl font-black text-primary/45">01</p>
                <CardTitle className="text-lg">Crea tu hogar</CardTitle>
                <CardDescription>Invita a tus compañeros facilmente.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/80 bg-card/95">
              <CardHeader>
                <p className="text-4xl font-black text-primary/45">02</p>
                <CardTitle className="text-lg">Registra gastos</CardTitle>
                <CardDescription>Cada gasto queda documentado al instante.</CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border/80 bg-card/95">
              <CardHeader>
                <p className="text-4xl font-black text-primary/45">03</p>
                <CardTitle className="text-lg">Cierra el periodo</CardTitle>
                <CardDescription>Salda cuentas con un solo clic.</CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="mt-8 rounded-2xl border border-border/80 bg-card p-4 shadow-sm shadow-black/20 sm:p-6">
            {/* IMAGE: ilustracion del flujo de los 3 pasos o screenshot del modulo de gastos
                Tamano sugerido: 900x350px
                Coloca aqui: ![Flujo de HogarPay](/images/steps-illustration.png) */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <img
                src="https://res.cloudinary.com/dy8f3lczs/image/upload/v1781045588/mockup-gasto_u1nxss.png"
                alt="Flujo de registro de gastos en FinFam"
                className="h-55 w-full rounded-xl border border-border/70 object-cover sm:h-70"
                loading="lazy"
              />
              <img
                src="https://res.cloudinary.com/dy8f3lczs/image/upload/v1781045589/mockup-cierre_dngk8l.png"
                alt="Vista de cierre y balances en FinFam"
                className="h-55 w-full rounded-xl border border-border/70 object-cover sm:h-70"
                loading="lazy"
              />
            </div>
          </div>
        </section>

        <section id="caracteristicas" className="mx-auto w-full max-w-6xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Todo lo que necesitas</h2>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
            <Card className="h-full border-border/80 bg-card/95">
              <CardContent className="p-6 sm:p-7">
                <div className="inline-flex rounded-lg bg-primary/10 p-3" aria-hidden="true">
                  <ScaleIcon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="mt-5 text-lg">Balances automáticos</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Calcula quién le debe a quién sin hacer cuentas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full border-border/80 bg-card/95">
              <CardContent className="p-6 sm:p-7">
                <div className="inline-flex rounded-lg bg-primary/10 p-3" aria-hidden="true">
                  <ClipboardDocumentListIcon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="mt-5 text-lg">Historial de cierres</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Cada período queda guardado con todos sus detalles.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="h-full border-border/80 bg-card/95">
              <CardContent className="p-6 sm:p-7">
                <div className="inline-flex rounded-lg bg-primary/10 p-3" aria-hidden="true">
                  <UserGroupIcon className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="mt-5 text-lg">Roles y permisos</CardTitle>
                <CardDescription className="mt-2 text-sm">
                  Tú controlas quién puede registrar o editar gastos.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="border-y border-border/70 bg-accent/55 px-4 py-14 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto flex w-full max-w-4xl flex-col items-center text-center">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Sin cuentas pendientes, mejor convivencia.
            </h2>
            <p className="mt-3 text-sm text-muted-foreground sm:text-base">Empieza hoy, es gratis.</p>
            <Button asChild size="lg" className="mt-7 transition-colors">
              <Link to="/register">Crear mi hogar</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-4 py-6 text-center text-sm text-muted-foreground sm:px-6 lg:px-8">
        © 2025 FinFam. Todos los derechos reservados.
      </footer>
    </div>
  )
}

export default LandingPage
