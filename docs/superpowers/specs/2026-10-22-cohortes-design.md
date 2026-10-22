# Acceso privado por cohortes — diseño

Fecha: 2026-10-22 · Rama prevista: `feat/cohortes`

El diseño de producto es el de la tarea original (modelos `Cohort`, `CohortInvite`, cambios en `Course`,
decisiones 1–5, control de acceso, panel, canje, tests mínimos). Este documento lo resume y añade lo que
el código actual obliga a decidir.

## Modelo

- `Cohort { name, course, startsAt, endsAt, afterEnd: 'revoke'|'readonly', members[] }`
  - `members[]: { user: ObjectId|null, email (normalizado), status: 'pending'|'active', addedAt, addedBy, source: 'email'|'invite' }`
  - Índices: `{ 'members.user': 1 }`, `{ 'members.email': 1 }`, `{ course: 1 }`.
- `CohortInvite { cohort, tokenHash (sha256 hex, unique), email?, expiresAt, maxUses=1, uses=0, createdBy, revokedAt? }`
  - El token en claro solo existe en la respuesta de creación (32 bytes de `crypto.randomBytes`, base64url).
- `CourseInterest { course, email, user?, createdAt }` — índice único `{ course, email }` («Avísame de la próxima edición»).
- `Course.accessMode: 'public'|'private'` (default `'public'`), `Course.cohorts: [ObjectId]`.

## Regla de acceso

`resolveAccess({ user, course, cohorts, now }) → { level: 'full'|'readonly'|'denied', reason }`

| Caso | level | reason |
|---|---|---|
| admin/superadmin | full | `admin` |
| `accessMode !== 'private'` | full | `public` (las comprobaciones actuales —inscripción, `isOpen`— siguen igual en cada controlador) |
| privado, sin sesión | denied | `anonymous` |
| privado, sin membresía `active` | denied | `not-member` |
| miembro activo, `now < startsAt` | denied | `reserved` (+ `startsAt`) |
| miembro activo, `startsAt ≤ now < endsAt` | full | `member` |
| miembro activo, `now ≥ endsAt`, `afterEnd='readonly'` | readonly | `ended` |
| miembro activo, `now ≥ endsAt`, `afterEnd='revoke'` | denied | `revoked` |

Con varias cohortes gana la mejor: full > readonly > denied(reserved) > denied(resto).
Las comprobaciones de `isOpen` e inscripción existentes se mantienen **además** para los privados.

Acciones: `read` exige `full|readonly`; `write` (entregar, borrar entrega, inscribirse) exige `full`.
En readonly se permite seguir leyendo, marcar progreso y hacer los tests autocorregidos (no «piden corrección»).

## Hallazgos del código que condicionan el diseño

1. **Materiales en Cloudinary con URL pública** (`type: upload`, `resource_type: raw`, carpeta
   `learning-platform/materiales`). Hoy `GET /api/courses/:id` y `GET /api/courses` devuelven esas URLs a
   cualquiera. Quitar las URLs de la API impide descubrirlas, pero quien ya tenga una URL la conserva para
   siempre. Protección real = pasar los materiales del curso privado a `type: authenticated` y servirlos
   por una pasarela del backend que firma URLs de vida corta. Se construye la pasarela; el traslado en
   Cloudinary es un script aparte que solo se ejecuta con OK explícito (como la migración del vídeo).
2. **Rutas de administración sin autenticación hoy**: `POST/PUT/DELETE /api/ejercicios` y
   `POST /api/tests/test`. Cualquiera puede crear/editar/borrar ejercicios de cualquier curso. Se cierran
   con `autenticar, soloAdmin`.
3. **`GET /api/pdf-proxy?url=`** es un proxy abierto con validación por subcadena (`includes('cloudinary.com')`).
   Se valida el host exacto (`res.cloudinary.com`) y, si la URL es material de un curso privado, se exige acceso.
4. **`POST /api/entregas/ejercicio/:id`** toma `cursoId` del body: hay que derivarlo del ejercicio, si no
   bastaría con mandar el id de un curso público.
5. Los tests del backend usan `node:test` sustituyendo métodos de los modelos (sin Mongo en memoria). La
   regla se implementa como función pura para probarla exhaustivamente y las rutas con el mismo estilo de stubs.
