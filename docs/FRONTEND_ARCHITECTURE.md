# 🏗️ Guía de Arquitectura Hexagonal — Frontend

> Basada en el enfoque de [venf-blog](https://venf-blog.vercel.app/posts/arquitectura-hexagonal).  
> Combina **Arquitectura Hexagonal (Puertos y Adaptadores)** + **Vertical Slicing** para un frontend limpio, escalable y testeable.

---

## 🧠 Principio fundamental

> Las capas de **alto nivel** no deben depender de las de **bajo nivel**.  
> Ambas deben depender de **abstracciones** (interfaces / puertos).

- **Puertos** → interfaces (abstracciones)
- **Adaptadores** → implementaciones concretas (dependencias reales)

La regla de oro: **las dependencias apuntan siempre hacia adentro** (hacia el Dominio).

```
Infraestructura → Aplicación → Dominio
```

El Dominio no conoce a nadie. La Aplicación solo conoce al Dominio. La Infraestructura conoce a todos.

---

## 📐 Las 3 capas

### 1. Dominio (`domain/`)
**Nivel: Alto — no depende de nadie.**

Aquí vive la lógica de negocio pura, independiente del framework, la UI y cualquier dependencia externa.

Contiene:
- Entidades y modelos de datos
- Interfaces de repositorios (puertos)
- Interfaces de casos de uso
- Funciones de transformación / validación de datos
- Types y enums del negocio

```ts
// domain/anime/Anime.entity.ts
export interface Anime {
  id: string
  title: string
  episodes: number
}

// domain/anime/Anime.repository.ts
export interface IAnimeRepository {
  getById(id: string): Promise<Anime>
}

export interface IGetAnimeById {
  execute(id: string): Promise<Anime>
}
```

> ❌ Nunca importes axios, fetch, React, Vue, ni nada externo aquí.

---

### 2. Aplicación (`application/`)
**Nivel: Medio — solo conoce al Dominio.**

Contiene los **casos de uso**: las acciones concretas que puede hacer el usuario o el sistema.  
También incluye los **componentes de UI** del framework (React, Vue, etc.), ya que desacoplarse del framework en frontend tiene un costo mayor al beneficio.

Contiene:
- Casos de uso (`GetAnimeById`, `CreateExpense`, etc.)
- Componentes, páginas y vistas del framework
- Lógica de estado relacionada a la UI
- Hooks / Composables

```ts
// application/anime/GetAnimeById.ts
import { IAnimeRepository } from '@/domain/anime/Anime.repository'

export class GetAnimeById {
  constructor(private readonly repo: IAnimeRepository) {}

  execute(id: string) {
    return this.repo.getById(id)
  }
}
```

> ✅ Los casos de uso reciben los repositorios por parámetro (inyección de dependencias).  
> ❌ No llaman directamente a APIs ni tocan detalles de infraestructura.

---

### 3. Infraestructura (`infrastructure/`)
**Nivel: Bajo — conoce a todas las capas.**

Contiene las implementaciones concretas: llamadas a APIs, rutas, acceso a localStorage, etc.

Contiene:
- Repositorios concretos (implementan las interfaces del Dominio)
- Clientes HTTP (axios, fetch)
- Adaptadores de librerías externas
- Configuración de rutas

```ts
// infrastructure/anime/ApiAnimeRepository.ts
import { IAnimeRepository } from '@/domain/anime/Anime.repository'
import { Anime } from '@/domain/anime/Anime.entity'

export class ApiAnimeRepository implements IAnimeRepository {
  async getById(id: string): Promise<Anime> {
    const res = await fetch(`/api/anime/${id}`)
    return res.json()
  }
}
```

> ✅ Si mañana cambias la API por localStorage o un mock, solo tocas esta capa.  
> ❌ Nunca importes esta capa desde el Dominio ni desde los casos de uso directamente.

---

## 🗂️ Estructura de carpetas con Vertical Slicing

> El **Vertical Slicing** organiza el proyecto por **contextos/features**, no solo por capas.  
> Cada feature tiene sus propias capas internas → más cohesión, más independencia.

```
src/
├── shared/                        # Utilidades reutilizables entre contextos
│   ├── domain/
│   ├── application/
│   └── infrastructure/
│
├── anime/                         # Contexto: Anime
│   ├── domain/
│   │   ├── Anime.entity.ts
│   │   └── Anime.repository.ts
│   ├── application/
│   │   ├── GetAnimeById.ts
│   │   └── components/
│   │       └── AnimeCard.tsx
│   └── infrastructure/
│       └── ApiAnimeRepository.ts
│
├── expenses/                      # Contexto: Gastos
│   ├── domain/
│   │   ├── Expense.entity.ts
│   │   └── Expense.repository.ts
│   ├── application/
│   │   ├── CreateExpense.ts
│   │   └── components/
│   │       └── ExpenseForm.tsx
│   └── infrastructure/
│       └── ApiExpenseRepository.ts
│
└── auth/                          # Contexto: Autenticación
    ├── domain/
    ├── application/
    └── infrastructure/
```

---

## ♻️ La carpeta `shared/`

Úsala **solo cuando una funcionalidad se repite en más de 2 contextos**.

```
shared/
├── domain/
│   └── types/              # Types globales (PaginatedResponse, etc.)
├── application/
│   └── components/         # Componentes UI reutilizables (Button, Modal, etc.)
└── infrastructure/
    └── http/               # Cliente HTTP base (instancia de axios, etc.)
```

> ⚠️ No metas todo en `shared` por comodidad. Cada contexto debe ser lo más autónomo posible.

---

## ✅ Checklist al crear una nueva feature

Antes de escribir código, hazte estas preguntas:

- [ ] ¿Definí la entidad y sus tipos en `domain/`?
- [ ] ¿Creé la interfaz del repositorio (puerto) en `domain/`?
- [ ] ¿El caso de uso recibe el repositorio como parámetro (no lo instancia)?
- [ ] ¿El caso de uso solo depende de interfaces, no de implementaciones?
- [ ] ¿La llamada HTTP / acceso a datos está en `infrastructure/`?
- [ ] ¿Los componentes de UI están en `application/`?
- [ ] ¿Puedo testear el caso de uso con un mock sin tocar infraestructura?

---

## 🧪 Ventaja en testing

La separación de capas permite testear la lógica de negocio **sin levantar nada externo**.

```ts
// __tests__/GetAnimeById.test.ts
import { GetAnimeById } from '@/anime/application/GetAnimeById'
import { IAnimeRepository } from '@/anime/domain/Anime.repository'

const mockRepo: IAnimeRepository = {
  getById: jest.fn().mockResolvedValue({ id: '1', title: 'Cowboy Bebop', episodes: 26 })
}

it('should return anime by id', async () => {
  const useCase = new GetAnimeById(mockRepo)
  const result = await useCase.execute('1')
  expect(result.title).toBe('Cowboy Bebop')
})
```

> El repositorio real (`ApiAnimeRepository`) nunca se invoca en el unit test.

---

## 🚦 Reglas de dependencia — resumen visual

```
┌─────────────────────────────────────────┐
│            INFRAESTRUCTURA              │  ← conoce todo
│  (API calls, HTTP, localStorage, rutas) │
└───────────────┬─────────────────────────┘
                │ depende de
┌───────────────▼─────────────────────────┐
│             APLICACIÓN                  │  ← conoce solo al Dominio
│  (casos de uso, componentes, hooks)     │
└───────────────┬─────────────────────────┘
                │ depende de
┌───────────────▼─────────────────────────┐
│               DOMINIO                   │  ← no conoce a nadie
│  (entidades, interfaces, validaciones)  │
└─────────────────────────────────────────┘
```

---

## ⚡ Cuándo aplicar esta arquitectura

**Vale la pena si:**
- El proyecto tiene múltiples features o contextos de negocio
- Hay equipo trabajando en paralelo
- Se requiere alta cobertura de tests
- Es probable que cambien proveedores (API, auth, storage)

**Puede ser overkill si:**
- Es un proyecto personal pequeño o un prototipo
- Solo hay 1-2 entidades simples
- No hay planes de escalar ni testear en profundidad

---

*Guía generada a partir de: https://venf-blog.vercel.app/posts/arquitectura-hexagonal*
