# mxwatch-api — AGENTS.md

Backend API de inteligencia táctica. Bun + Hono + PostgreSQL + Drizzle ORM + Zod v4 + Biome 2.4.

## Comandos

- `bun run dev` — servidor con hot-reload
- `bun run start` — inicio producción
- `bun run lint` — Biome check + write (lint + format)
- `bun run check` — Biome check (solo validación)
- `bun run db:seed` — sembrar base de datos
- `bun run deploy` — deploy a Cloudflare Workers

## Convenciones

- Nombres de archivo: `kebab-case.ts` (ej. `health.route.ts`, `drizzle.config.ts`)
- Sufijos: `*.route.ts` para rutas, `*.ts` en `schemas/` para esquemas Zod
- Imports tipo-solo con `import type { ... }`
- JSDoc en español describiendo cada ruta/esquema/función
- Biome para lint + format (tabs, double quotes)
- `"type": "module"` — ES modules

## API

- Formato respuesta: `{ success, data?, error?, timestamp?, count? }`
- Definir rutas con `createRoute()` de `@hono/zod-openapi`, registrar con `api.openapi(route, handler)`
- Validar params con Zod vía `c.req.valid('param')`
- Autenticación: middleware `auth.ts` (fail-closed, API key en header `x-api-key`, omitir `/api/health`, `/api/docs`, `/api/doc`)
- CORS restringido a orígenes específicos
- OpenAPI spec en `GET /api/doc`, Swagger UI en `GET /api/docs`
- Documentar seguridad en ruta: `security: [{ apiKey: [] }]`

## DB

- PostgreSQL con Drizzle ORM, driver `postgres.js`
- IDs: UUID v4 con `.defaultRandom()`
- Timestamps: `createdAt`, `updatedAt` en todas las tablas
- Seed file: `src/db/seed.ts` (en .gitignore, no commitear)
