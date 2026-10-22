# Deploy Checklist: acceso privado por cohortes (`feat/cohortes`)

**Fecha prevista:** antes de finales de noviembre de 2026 · **Quién despliega:** Sebastián
**Qué sale:** control de acceso por cohortes en backend y front, pestaña Accesos, invitaciones, migración de datos (`accessMode`), cohorte «Carbono – Noviembre 2026» y, al final, los PDFs de Carbono pasan a Cloudinary `authenticated`.

Backend: VPS `srv601667`, `/root/campus-evenor/backend_learningprjct`, servicio **`campus-backend.service`** (no `gestiona-backend`).

---

## Pre-deploy

- [ ] `npm test` en verde en `backend_learningprjct` (≈ 300 tests) y en `front_learningprjct`; `npx vite build` sin errores.
- [ ] Revisión de código hecha y hallazgos importantes corregidos (rama `feat/cohortes`).
- [ ] Rama fusionada en `main` y subida (`git push`): hoy está solo en local.
- [ ] Variables de entorno del backend en el VPS:
  - [ ] `FRONTEND_URL=https://campus.evenor-tech.com` (los enlaces de invitación se construyen con ella).
  - [ ] `EMAIL_USER` / `EMAIL_PASS` válidos (invitaciones y enlaces de activación por email).
  - [ ] `CLOUDINARY_*` sin cambios.
- [ ] **Copia de seguridad** de la base de datos antes de los scripts:
  `mongodump --uri "$MONGODB_URI" --collection courses --out ~/backup-cohortes-$(date +%F)` (y `users`, `userprogresses`).
- [ ] Copia de seguridad de los PDFs de entregas: `tar czf ~/ejercicios-$(date +%F).tgz public/ejercicios` (no cambian de sitio, pero es barato).

## Deploy

Backend y front van **juntos**: el backend nuevo deja de servir `/ejercicios/*.pdf` como estáticos y el front antiguo los enlazaba así (vista previa de correcciones y «Descargar PDF» del alumno). Mientras no estén los dos, esas dos descargas fallan.

1. [ ] **Backend** (en el VPS):
   ```bash
   cd ~/campus-evenor && git pull
   cd backend_learningprjct
   # Solo cambian devDependencies (mongodb-memory-server). Si instalas, SIN dev: se evita bajar ~600 MB de mongod
   npm ci --omit=dev        # o no instales nada: no hay dependencias de producción nuevas
   sudo systemctl restart campus-backend
   sudo systemctl status campus-backend --no-pager
   ```
2. [ ] **Front**: desplegar `main` por el proceso habitual.
3. [ ] **Humo (todo sigue público todavía; nada debe haber cambiado para los alumnos):**
   ```bash
   curl -s https://campus.evenor-tech.com/api/courses/69d50406663e8648d7ee1f08 | jq '{accessMode, access}'   # "public", null
   curl -s https://campus.evenor-tech.com/api/courses/69d50406663e8648d7ee1f08/video | jq .mode            # "preview"
   curl -s -o /dev/null -w '%{http_code}\n' -X POST https://campus.evenor-tech.com/api/ejercicios -H 'Content-Type: application/json' -d '{}'   # 401 (antes 201/500)
   curl -s -o /dev/null -w '%{http_code}\n' 'https://campus.evenor-tech.com/api/pdf-proxy?url=https://evil.com/?cloudinary.com'                # 400
   ```
   - [ ] En el navegador: un curso público se ve e inscribe igual; un PDF de un tema se abre en el aula; en Panel → Correcciones se ve el PDF de una entrega.
4. [ ] **Migración `accessMode`** (en el VPS, desde `backend_learningprjct`):
   ```bash
   node src/scripts/migrarAccessMode.js            # simulacro: «Cursos sin accessMode: N»
   node src/scripts/migrarAccessMode.js --apply    # «Actualizados a 'public': N»
   node src/scripts/migrarAccessMode.js            # debe decir 0
   ```
5. [ ] **Cohorte de Carbono y curso privado:**
   ```bash
   node src/scripts/crearCohorteCarbono.js                                  # simulacro: revisa curso, fechas e «Inscripciones sin cohorte»
   node src/scripts/crearCohorteCarbono.js --apply [--starts=AAAA-MM-DDTHH:mm --ends=…] [--emails=lista.txt]
   ```
   - Sin `--starts/--ends` usa las fechas **provisionales** 30/11/2026 00:00 → 31/03/2027 23:59 (Madrid). Se cambian luego en Panel → Accesos → Editar.
   - Las «Inscripciones sin cohorte» que lista son las cuentas de prueba: pierden el acceso (no se borran).
6. [ ] **Comprobar el acceso privado:**
   ```bash
   curl -s https://campus.evenor-tech.com/api/courses/69d50406663e8648d7ee1f08 | jq '.accessMode, .access'           # "private", {"level":"denied","reason":"anonymous"}
   curl -s https://campus.evenor-tech.com/api/courses/69d50406663e8648d7ee1f08 | grep -c 'learning-platform/materiales' # 0
   curl -s https://campus.evenor-tech.com/api/courses | grep -c 'learning-platform/materiales/'                          # solo de cursos públicos
   ```
   - [ ] Sin sesión, la ficha muestra «Curso privado – acceso por invitación» y «Avísame de la próxima edición».
   - [ ] Como admin: Panel → Accesos → el curso aparece «· privado» con la cohorte.
   - [ ] Crea un enlace de invitación, ábrelo en una ventana privada con una cuenta de prueba: debe quedar «Plaza reservada · empieza el …» (o acceso, si ya empezó). Quita después esa cuenta de la cohorte.
7. [ ] **Materiales a Cloudinary `authenticated`** (solo con 1–6 bien; las URLs públicas antiguas dejarán de funcionar):
   ```bash
   node src/scripts/moverMaterialesAAuthenticated.js           # simulacro: lista los PDFs (ES/EN y actividades)
   node src/scripts/moverMaterialesAAuthenticated.js --apply
   ```
   - [ ] Con una cuenta miembro (o admin), abre un PDF de un tema en el aula: debe verse (la pasarela firma la descarga).
   - [ ] La URL antigua de ese PDF (copiada antes del paso 7) debe dar 401/404 en Cloudinary.
   - [ ] Si algún archivo sale con `✗`, vuelve a ejecutar `--apply` (es idempotente) o revisa ese public_id en Cloudinary.
   - Los PDFs que se suban después a un curso privado ya se suben como `authenticated`. Si más adelante otro curso pasa a privado, sus PDFs anteriores siguen públicos: `node src/scripts/moverMaterialesAAuthenticated.js --course=<id> --apply`.
   - [ ] Antes del paso 7, consulta de solo lectura en producción: materiales cuya URL no empiece por `https://res.cloudinary.com/<CLOUDINARY_CLOUD_NAME>/` (otra cuenta o `http:`). Esos no pasan por la pasarela y en el aula se abrirían como descarga en vez de verse.

## Post-deploy

- [ ] `journalctl -u campus-backend --since "30 min ago" | grep -iE "error|cloudinary respondió"`: sin errores nuevos durante 15 min.
- [ ] Prueba un registro nuevo con contraseña y vuelve a entrar: ahora funciona. Antes del despliegue la contraseña se hasheaba dos veces y quien se registraba con contraseña desde el 19/01/2026 no podía entrar. **Avisa a esos usuarios de que usen «He olvidado mi contraseña».**
- [ ] Añade a los participantes en Panel → Accesos → Miembros (pegando los emails, con «Enviar invitación» marcado) o comparte un enlace de N usos.
- [ ] Fija las fechas reales de la cohorte cuando las tengas (Panel → Accesos → Editar).
- [ ] Actualizar la memoria del proyecto y cerrar la rama.

## Rollback

Del más leve al más drástico. Los datos nuevos (cohortes, invitaciones, interesados) son inertes si el curso es público.

| Problema | Acción |
|---|---|
| Un participante no puede entrar | Panel → Accesos: revisa que esté **activo** (no «pendiente») y las fechas. Reenvíale una invitación individual. |
| El curso privado da problemas en general | `node src/scripts/crearCohorteCarbono.js --rollback --apply` → el curso vuelve a público al momento (cohortes conservadas). |
| Los PDFs de Carbono no se ven tras el paso 7 | `node src/scripts/moverMaterialesAAuthenticated.js --revert` → vuelven a `upload` y se guardan las URLs públicas. |
| El backend nuevo falla | En el VPS: `git checkout <commit anterior>` en `~/campus-evenor` y `sudo systemctl restart campus-backend`. Antes, `--revert` de materiales (si se hizo el paso 7) y `--rollback` del curso: el backend antiguo no conoce la pasarela ni `accessMode`. |
| Datos corruptos | Restaurar con `mongorestore` la copia del paso previo (solo `courses`; las colecciones nuevas se pueden borrar: `cohorts`, `cohortinvites`, `courseinterests`). |

### Cuándo dar marcha atrás

- Algún curso **público** deja de verse, de inscribir o de abrir sus PDFs → rollback del backend.
- Un miembro activo dentro de fechas recibe 403 en el aula y no se explica por la cohorte → `--rollback` del curso mientras se investiga.
- El paso 7 deja PDFs sin poder abrirse para miembros → `--revert` de materiales.
- Más de un puñado de errores 5xx nuevos en `journalctl` en los primeros 15 min.

## Notas

- El rate limit (canje de invitaciones, «Avísame») cuenta por IP leyendo `CF-Connecting-IP`/`X-Forwarded-For`, igual que el resto del backend: con Cloudflare delante es correcto; si alguien llegase al puerto 8547 directamente podría falsear la IP.
- Los PDFs de entregas siguen en `public/ejercicios` del VPS, pero ya solo se sirven por `GET /api/entregas/:id/archivo` (autor con acceso o admin).
