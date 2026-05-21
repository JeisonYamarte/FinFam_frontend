# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

intrcucciones del backend

Instrucción de uso en el proyecto

Esta API soporta un flujo de finanzas compartidas por hogar: autenticación, gestión de hogares, gastos, invitaciones y cierres financieros.
Regla de negocio clave: varios endpoints exigen membresía activa al hogar y algunos exigen rol ADMIN.
Los cierres financieros “congelan” gastos incluidos en ese período; esos gastos ya no se pueden editar/eliminar.
Endpoints de autenticación

POST /api/v1/auth/login
Qué hace: autentica credenciales (estrategia local), crea sesión en tabla sessions, devuelve access token y setea cookie refresh_token.
Para qué sirve: iniciar sesión persistente (JWT corto + refresh token rotativo).

POST /api/v1/auth/register
Qué hace: crea usuario, genera sesión, envía correo de verificación y retorna access token + cookie refresh_token.
Para qué sirve: alta de usuarios con onboarding autenticado inmediato.

POST /api/v1/auth/refresh
Qué hace: valida refresh_token en cookie, rota token de sesión y devuelve nuevo access token + nueva cookie.
Para qué sirve: mantener sesión sin pedir login frecuente.

POST /api/v1/auth/logout
Qué hace: invalida refresh token en base de datos y limpia cookie.
Para qué sirve: cierre de sesión seguro.

GET /api/v1/auth/verify-email?token=...
Qué hace: valida token temporal en caché y marca correo como verificado.
Para qué sirve: habilitar confianza de cuenta y reducir cuentas no confirmadas.

POST /api/v1/auth/forgot-password
Qué hace: genera token temporal para reset y envía email (respuesta neutra para no filtrar si existe el correo).
Para qué sirve: recuperación segura de contraseña.

POST /api/v1/auth/reset-password
Qué hace: valida token de reset y actualiza contraseña hasheada.
Para qué sirve: completar recuperación de acceso.

GET /api/v1/auth/me
Qué hace: devuelve datos del usuario autenticado por JWT.
Para qué sirve: hidratar perfil actual en frontend.

Endpoints de usuarios

POST /api/v1/users
Qué hace: crea usuario (hash de contraseña, control de email único).
Para qué sirve: alta directa de usuarios (flujo administrativo o alternativo).

GET /api/v1/users
Qué hace: lista usuarios con filtros por nombre/apellido/email y paginación.
Para qué sirve: consulta administrativa y exploración de usuarios.

GET /api/v1/users/:id
Qué hace: obtiene un usuario por UUID.
Para qué sirve: detalle de perfil.

PATCH /api/v1/users/:id
Qué hace: actualiza datos de usuario; si cambia password, se rehashea.
Para qué sirve: mantenimiento de perfil.

DELETE /api/v1/users/:id
Qué hace: elimina usuario por ID.
Para qué sirve: administración/limpieza de cuentas.

Endpoints de hogares

POST /api/v1/homes
Qué hace: crea hogar y asigna al creador como ADMIN.
Para qué sirve: iniciar un espacio financiero compartido.

GET /api/v1/homes
Qué hace: lista hogares donde el usuario tiene membresía activa.
Para qué sirve: selector de contexto de trabajo.

GET /api/v1/homes/:homeId
Qué hace: devuelve detalle del hogar y cantidad de miembros activos.
Para qué sirve: vista general del hogar.

PATCH /api/v1/homes/:homeId
Qué hace: actualiza nombre del hogar (solo ADMIN).
Para qué sirve: gestión básica del hogar.

DELETE /api/v1/homes/:homeId
Qué hace: elimina hogar y datos relacionados (membresías, gastos, cierres).
Para qué sirve: baja total de un hogar.

GET /api/v1/homes/:homeId/members
Qué hace: lista miembros activos y roles.
Para qué sirve: administración de participantes.

PATCH /api/v1/homes/:homeId/members/:memberId/role
Qué hace: cambia rol de miembro (solo ADMIN, protege no degradar al último admin).
Para qué sirve: control de permisos internos.

DELETE /api/v1/homes/:homeId/members/:memberId
Qué hace: elimina miembro (ADMIN o auto-remoción, con reglas de último admin).
Para qué sirve: moderación/salida de miembros.

POST /api/v1/homes/:homeId/invitations
Qué hace: crea invitación por email (solo ADMIN), con TTL y control de duplicados en caché.
Para qué sirve: incorporar nuevos miembros de forma controlada.

POST /api/v1/homes/:homeId/leave
Qué hace: permite salir del hogar; si es el último miembro, elimina el hogar.
Para qué sirve: salida voluntaria con consistencia de datos.

Endpoints de invitaciones

POST /api/v1/invitations/:invitationId/accept
Qué hace: acepta invitación, valida existencia y agrega membresía tipo GUEST.
Para qué sirve: alta de miembro invitado sin flujo manual.

POST /api/v1/invitations/:invitationId/decline
Qué hace: rechaza invitación y limpia claves temporales.
Para qué sirve: cerrar invitaciones pendientes.

Endpoints de gastos

POST /api/v1/expenses
Qué hace: crea gasto (solo ADMIN), valida integridad financiera (suma de payers/splits = monto), valida miembros y opcionalmente sube comprobante.
Para qué sirve: registrar movimientos económicos del hogar.

GET /api/v1/households/:householdId/expenses
Qué hace: lista gastos con paginación y filtros (closureId, rango de fechas).
Para qué sirve: historial y análisis de gastos.

GET /api/v1/households/:householdId/expenses/calculation
Qué hace: devuelve gastos en formato para motor de balance.
Para qué sirve: base de cálculo para deudas/saldos.

GET /api/v1/expenses/:expenseId
Qué hace: detalle completo de gasto con payers y splits.
Para qué sirve: auditoría y vista detallada.

PATCH /api/v1/expenses/:expenseId
Qué hace: actualiza gasto (solo ADMIN), valida integridad y membresías, maneja reemplazo de comprobante.
Para qué sirve: corrección de registros antes de cierre.

DELETE /api/v1/expenses/:expenseId
Qué hace: elimina gasto (solo ADMIN), incluyendo relaciones y archivo de comprobante.
Para qué sirve: depuración de datos erróneos.

PUT /api/v1/expenses/:expenseId/payers
Qué hace: reemplaza pagadores del gasto (solo ADMIN), validando suma contra monto.
Para qué sirve: corregir quién pagó y cuánto.

PUT /api/v1/expenses/:expenseId/splits
Qué hace: reemplaza distribución del gasto (solo ADMIN), validando suma contra monto.
Para qué sirve: corregir reparto de deuda entre miembros.

Nota operativa de gastos

Si un gasto pertenece a un cierre (closureId no nulo), no se puede modificar ni eliminar.
Endpoints de cierres financieros

POST /api/v1/closures/simulate
Qué hace: simula cierre sin persistir, calcula balances y deudas del período abierto.
Para qué sirve: previsualizar resultados antes de cerrar.

POST /api/v1/closures
Qué hace: crea cierre real del período abierto (solo ADMIN), guarda balances y marca gastos con closureId.
Para qué sirve: consolidación contable del período.

GET /api/v1/households/:householdId/closures
Qué hace: lista cierres de un hogar con paginación.
Para qué sirve: historial de cierres.

GET /api/v1/closures/:closureId
Qué hace: devuelve metadata del cierre y balances finales.
Para qué sirve: consulta principal de un cierre puntual.

GET /api/v1/closures/:closureId/balances
Qué hace: lista balances finales (quién paga a quién y cuánto).
Para qué sirve: ejecución de liquidación entre miembros.

GET /api/v1/closures/:closureId/expenses
Qué hace: lista gastos incluidos en ese cierre.
Para qué sirve: trazabilidad y auditoría del cierre.

Endpoints de prueba interna

GET /api/v1/tests
Qué hace: endpoint de verificación básica protegido por JWT.
Para qué sirve: smoke test de autenticación y conectividad.

POST /api/v1/tests/upload
Qué hace: sube archivo de prueba a Cloudinary.
Para qué sirve: validar integración de carga de archivos.

Seguridad y autorización (resumen)

JWT requerido en la mayoría de módulos de negocio.
Roles en hogar: ADMIN y GUEST.
Operaciones sensibles (crear/editar/borrar gastos, invitar, cambios de rol) restringidas a ADMIN.
Invitaciones usan tokens temporales en caché con expiración.
