---
name: hexagonal-architecture-frontend
description: >
  Arquitectura Hexagonal (Puertos y Adaptadores) + Vertical Slicing para frontend React/TypeScript.
  Usar cuando se cree una nueva feature, contexto de negocio, repositorio, caso de uso, o se refactorice
  código existente hacia esta arquitectura. Triggers: "nueva feature", "nuevo contexto", "crear repositorio",
  "caso de uso", "hexagonal", "ports and adapters", "vertical slice", cualquier tarea de scaffolding de módulos.
license: MIT
metadata:
  author: finfam
  version: "1.0.0"
---

# Arquitectura Hexagonal — Frontend (Finfam)

Guía definitiva para crear y organizar features en el proyecto frontend de Finfam siguiendo
**Arquitectura Hexagonal + Vertical Slicing**.

---

## Principio fundamental

Las dependencias siempre apuntan **hacia adentro** (hacia el Dominio):

```
Infraestructura → Aplicación → Dominio
```

- **Dominio** — no depende de nadie. Lógica de negocio pura.
- **Aplicación** — solo conoce al Dominio. Casos de uso + componentes UI.
- **Infraestructura** — conoce todo. Implementaciones concretas (HTTP, storage, etc.).

---

## Estructura de carpetas por feature

Cada feature vive bajo `src/features/<nombre-feature>/` con sus tres capas internas:

```
src/
├── features/
│   └── <feature>/
│       ├── domain/
│       │   ├── <Feature>.entity.ts          # Tipos/interfaces de la entidad
│       │   ├── <Feature>.repository.ts      # Puerto (interfaz del repositorio)
│       │   └── <feature>.schemas.ts         # Validaciones Zod puras (sin UI)
│       ├── application/
│       │   ├── use-cases/
│       │   │   ├── get-<feature>.ts         # Caso de uso lectura
│       │   │   └── create-<feature>.ts      # Caso de uso escritura
│       │   ├── hooks/
│       │   │   └── use-<feature>.ts         # TanStack Query hooks
│       │   ├── components/
│       │   │   ├── <Feature>Card.tsx
│       │   │   └── <Feature>Form.tsx
│       │   └── pages/
│       │       └── <feature>-page.tsx
│       └── infrastructure/
│           └── api-<feature>.repository.ts  # Implementación HTTP concreta
│
├── shared/
│   ├── domain/
│   │   └── types/                           # PaginatedResponse, ApiError, etc.
│   ├── application/
│   │   └── components/                      # Componentes UI reutilizables (>2 features)
│   └── infrastructure/
│       └── http/                            # Cliente HTTP base (ya en src/lib/api/)
```

---

## Plantillas de archivos

### 1. Entidad — `domain/<Feature>.entity.ts`

```ts
// Solo tipos/interfaces. Sin imports de librerías externas.
export interface Expense {
  id: string
  amount: number
  category: string
  date: string
  description?: string
}

export type CreateExpenseInput = Omit<Expense, 'id'>
export type UpdateExpenseInput = Partial<CreateExpenseInput>
```

### 2. Puerto (repositorio) — `domain/<Feature>.repository.ts`

```ts
import type { Expense, CreateExpenseInput } from './Expense.entity'

export interface IExpenseRepository {
  getAll(): Promise<Expense[]>
  getById(id: string): Promise<Expense>
  create(data: CreateExpenseInput): Promise<Expense>
  update(id: string, data: Partial<CreateExpenseInput>): Promise<Expense>
  remove(id: string): Promise<void>
}
```

### 3. Schemas Zod — `domain/<feature>.schemas.ts`

```ts
import { z } from 'zod'

export const createExpenseSchema = z.object({
  amount: z.number().positive('El monto debe ser positivo'),
  category: z.string().min(1, 'Categoría requerida'),
  date: z.string().min(1, 'Fecha requerida'),
  description: z.string().optional(),
})

export type CreateExpenseSchema = z.infer<typeof createExpenseSchema>
```

### 4. Caso de uso — `application/use-cases/create-<feature>.ts`

```ts
import type { IExpenseRepository } from '@/features/expenses/domain/Expense.repository'
import type { CreateExpenseInput, Expense } from '@/features/expenses/domain/Expense.entity'

export class CreateExpense {
  constructor(private readonly repo: IExpenseRepository) {}

  execute(data: CreateExpenseInput): Promise<Expense> {
    return this.repo.create(data)
  }
}
```

### 5. Repositorio concreto — `infrastructure/api-<feature>.repository.ts`

```ts
import { apiClient } from '@/lib/api/client'
import type { IExpenseRepository } from '../domain/Expense.repository'
import type { Expense, CreateExpenseInput } from '../domain/Expense.entity'

export class ApiExpenseRepository implements IExpenseRepository {
  async getAll(): Promise<Expense[]> {
    const res = await apiClient.get<Expense[]>('/expenses')
    return res.data
  }

  async getById(id: string): Promise<Expense> {
    const res = await apiClient.get<Expense>(`/expenses/${id}`)
    return res.data
  }

  async create(data: CreateExpenseInput): Promise<Expense> {
    const res = await apiClient.post<Expense>('/expenses', data)
    return res.data
  }

  async update(id: string, data: Partial<CreateExpenseInput>): Promise<Expense> {
    const res = await apiClient.patch<Expense>(`/expenses/${id}`, data)
    return res.data
  }

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/expenses/${id}`)
  }
}
```

### 6. Hook TanStack Query — `application/hooks/use-<feature>.ts`

```ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ApiExpenseRepository } from '../../infrastructure/api-expense.repository'
import { CreateExpense } from '../use-cases/create-expense'

const repo = new ApiExpenseRepository()
const createExpenseUC = new CreateExpense(repo)

export const EXPENSE_KEYS = {
  all: ['expenses'] as const,
  detail: (id: string) => ['expenses', id] as const,
}

export function useExpenses() {
  return useQuery({
    queryKey: EXPENSE_KEYS.all,
    queryFn: () => repo.getAll(),
  })
}

export function useCreateExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createExpenseUC.execute>[0]) =>
      createExpenseUC.execute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all })
    },
  })
}
```

---

## Reglas estrictas

| Capa | ✅ Permitido | ❌ Prohibido |
|------|-------------|-------------|
| `domain/` | Types, interfaces, enums, Zod schemas puros | axios, fetch, React, hooks, cualquier lib externa |
| `application/use-cases/` | Imports de `domain/` únicamente | Llamadas HTTP directas, instanciar repos |
| `application/hooks/` | TanStack Query, instanciar repos e inyectarlos | Lógica de negocio directa, fetch crudo |
| `application/components/` | React, shadcn/ui, Heroicons, hooks propios | Llamadas HTTP directas |
| `infrastructure/` | apiClient, localStorage, cualquier lib externa | — |

---

## Checklist antes de crear una feature

- [ ] ¿Definí la entidad y tipos en `domain/`?
- [ ] ¿Creé la interfaz del repositorio (puerto) en `domain/`?
- [ ] ¿Los schemas Zod están en `domain/` sin imports de React?
- [ ] ¿El caso de uso recibe el repositorio por parámetro?
- [ ] ¿La llamada HTTP está solo en `infrastructure/`?
- [ ] ¿Los componentes usan el hook de TanStack Query (no el repo directo)?
- [ ] ¿La página se registra en el router de `src/router/index.tsx`?

---

## Shared vs Feature-local

Mover a `shared/` **solo si** la funcionalidad se usa en **más de 2 features**:

- `shared/domain/types/` → `PaginatedResponse<T>`, `ApiError`, tipos globales
- `shared/application/components/` → componentes UI verdaderamente reutilizables
- `shared/infrastructure/http/` → cliente HTTP base (ya existe en `src/lib/api/client.ts`)

---

## Ejemplo de estructura completa: feature `expenses`

```
src/features/expenses/
├── domain/
│   ├── Expense.entity.ts
│   ├── Expense.repository.ts
│   └── expense.schemas.ts
├── application/
│   ├── use-cases/
│   │   ├── get-expenses.ts
│   │   ├── get-expense-by-id.ts
│   │   ├── create-expense.ts
│   │   └── delete-expense.ts
│   ├── hooks/
│   │   └── use-expenses.ts
│   ├── components/
│   │   ├── ExpenseCard.tsx
│   │   ├── ExpenseForm.tsx
│   │   └── ExpenseList.tsx
│   └── pages/
│       ├── expenses-page.tsx
│       └── expense-detail-page.tsx
└── infrastructure/
    └── api-expense.repository.ts
```

---

## Convenciones de nombrado

| Artefacto | Convención | Ejemplo |
|-----------|-----------|---------|
| Entidad | `PascalCase.entity.ts` | `Expense.entity.ts` |
| Puerto | `PascalCase.repository.ts` | `Expense.repository.ts` |
| Schema Zod | `kebab-case.schemas.ts` | `expense.schemas.ts` |
| Caso de uso | `kebab-case.ts` | `create-expense.ts` |
| Repo concreto | `api-kebab-case.repository.ts` | `api-expense.repository.ts` |
| Hook | `use-kebab-case.ts` | `use-expenses.ts` |
| Componente | `PascalCase.tsx` | `ExpenseForm.tsx` |
| Página | `kebab-case-page.tsx` | `expenses-page.tsx` |
