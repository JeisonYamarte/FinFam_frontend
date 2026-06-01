# FinFam Frontend

Aplicacion web para gestionar finanzas compartidas por hogar.

FinFam permite que varias personas registren gastos, repartan montos entre miembros, revisen saldos individuales y cierren periodos con balances finales.

Este repositorio esta enfocado en frontend con React, TypeScript y Vite, siguiendo arquitectura hexagonal + vertical slicing.

## Demo del producto

Casos de uso principales:

- Registro e inicio de sesion.
- Creacion y seleccion de hogares.
- Gestion de miembros por rol (ADMIN y GUEST).
- Registro, edicion y eliminacion de gastos (segun permisos).
- Calculo de saldo por usuario.
- Simulacion y creacion de cierres financieros.
- Historial y detalle de cierres.

## Stack tecnico

- React 19
- TypeScript
- Vite 8
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui + Radix UI
- React Hook Form + Zod
- Axios
- Zustand

## Arquitectura

El proyecto esta organizado por contextos funcionales (auth, homes, expenses, closures, invitations), y cada contexto separa:

- domain
- application
- infrastructure

Documentacion de arquitectura:

- [Guia de arquitectura frontend](docs/FRONTEND_ARCHITECTURE.md)
- [Contratos de endpoints y DTOs](docs/ENDPOITS_DTOS.MD)

## Requisitos

- Node.js 20+
- pnpm 9+

## Instalacion local

1. Instala dependencias:

```bash
pnpm install
```

1. Configura variables de entorno:

```bash
cp .env .env.local
```

Edita `.env.local` y define:

# FinFam Frontend

Aplicacion web para gestionar finanzas compartidas en el hogar.

FinFam centraliza el ciclo completo de gastos colaborativos: miembros, registro de consumos, distribucion de montos, seguimiento de saldos y cierres financieros por periodo.

Este repositorio corresponde al frontend construido con React, TypeScript y Vite, siguiendo arquitectura hexagonal con vertical slicing por contexto funcional.

## Vision del producto

FinFam esta disenado para resolver un problema cotidiano: cuando varias personas comparten gastos, la informacion suele quedar fragmentada y es dificil entender quien pago, cuanto corresponde a cada integrante y como cerrar un periodo de forma ordenada.

La aplicacion ofrece una experiencia clara para:

- Autenticarse y operar con sesion segura.
- Crear y administrar hogares.
- Gestionar miembros y roles (ADMIN y GUEST).
- Registrar, editar y eliminar gastos segun permisos.
- Visualizar saldos individuales y resumen del periodo abierto.
- Simular y crear cierres financieros con trazabilidad.

## Stack tecnico

- React 19
- TypeScript
- Vite 8
- TanStack Router
- TanStack Query
- Tailwind CSS v4
- shadcn/ui + Radix UI
- React Hook Form + Zod
- Axios
- Zustand
- Vitest

## Arquitectura

La base del proyecto se organiza por contextos funcionales (`auth`, `homes`, `expenses`, `closures`, `invitations`).

Cada contexto separa responsabilidades en tres capas:

- `domain`: entidades, contratos y reglas de negocio.
- `application`: casos de uso, hooks y componentes de interfaz.
- `infrastructure`: repositorios HTTP y adaptadores externos.

Esta estructura permite escalar funcionalidades de forma mantenible, con limites claros entre logica de negocio y detalles de implementacion.

Documentacion complementaria:

- [Guia de arquitectura frontend](docs/FRONTEND_ARCHITECTURE.md)
- [Contratos de endpoints y DTOs](docs/ENDPOITS_DTOS.MD)

## Estado del proyecto

El frontend se encuentra en estado funcional y utilizable de punta a punta para el flujo principal de finanzas compartidas.

Incluye:

- Experiencia de autenticacion con refresh token.
- Navegacion por rutas protegidas.
- Gestion de hogares y miembros por rol.
- Gestion de gastos con validaciones de dominio.
- Modulo de cierres con simulacion y confirmacion.
- Suite de calidad automatizada con lint, tests y build.
- Workflow de CI para validaciones en `main` y `develop`.

## Requisitos

- Node.js 20+
- pnpm 9+

## Instalacion y ejecucion local

1. Instalar dependencias:

```bash
pnpm install
```

2. Configurar entorno:

```bash
cp .env .env.local
```

Definir en `.env.local`:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

3. Ejecutar proyecto:

```bash
pnpm dev
```

4. Abrir aplicacion:

```text
http://localhost:5173
```

## Scripts

- `pnpm dev`: levanta entorno de desarrollo.
- `pnpm lint`: ejecuta ESLint.
- `pnpm test:ci`: ejecuta tests con Vitest en modo CI.
- `pnpm build`: typecheck y build de produccion.
- `pnpm quality`: corre lint + tests + build.
- `pnpm preview`: sirve el build generado localmente.
- `pnpm doctor`: escaneo de salud React con react-doctor.

## Flujo funcional recomendado

1. Registro o inicio de sesion.
2. Creacion y seleccion de hogar activo.
3. Invitacion y gestion de miembros.
4. Registro de gastos con payers y splits.
5. Revision de dashboard y balances por usuario.
6. Simulacion de cierre del periodo.
7. Creacion de cierre y validacion de inmutabilidad de gastos cerrados.

## Calidad y CI

El proyecto incorpora un flujo de calidad automatizado:

- Lint estatico de codigo.
- Tests de dominio y utilidades.
- Build de produccion.

Comando unificado:

```bash
pnpm quality
```

## Contribucion

Para colaborar en el proyecto:

1. Crear una rama por feature o fix.
2. Mantener la separacion por capas del contexto afectado.
3. Ejecutar `pnpm quality` antes de abrir PR.
4. Documentar impacto funcional y tecnico en la descripcion del PR.

## Licencia

Proyecto de uso privado.
