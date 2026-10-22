# Vídeo del curso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mostrar en la ficha del curso una preview de 30 s a no inscritos y el vídeo completo a inscritos, decidiendo el backend qué URL entrega.

**Architecture:** Endpoint `GET /api/courses/:id/video` con `optionalAuth` que construye solo la URL del modo que corresponde (service puro sobre `cloudinary.url`, firmado si `CLOUDINARY_VIDEO_TYPE=authenticated`). En el front, `useCourseVideo` la pide y `CourseVideo` pinta `PreviewPlayer` o `FullPlayer`.

**Tech Stack:** Express + Mongoose + Cloudinary SDK v1 · React 18 + Tailwind + Framer Motion · node:test · Playwright.

**Spec:** `docs/superpowers/specs/2026-10-22-course-video-design.md`

## Global Constraints
- Preview `so_0,eo_30,q_auto,f_auto`; póster `so_0,q_auto,f_jpg`; completo `q_auto,f_auto`.
- `full` ⇔ token válido ∧ `UserProgress{userId,courseId}` ∧ `course.isOpen`.
- Respuesta: `{ mode: 'preview'|'full', src, poster }`, `Cache-Control: private, no-store`, `Vary: Authorization`.
- Copy CTA: «Inscríbete para ver el curso completo» (en `coursesCopy.js`).
- Nunca ejecutar la migración de Cloudinary ni escribir en la BD de prod sin OK.
- Móvil: 16 px de margen, sin scroll horizontal. Reduced motion: sin autoplay ni desplazamientos.

## Review Focus
- Token caducado o manipulado → se trata como anónimo (preview), nunca 401 ni full. Test en Task 1.
- Curso cerrado con plaza reservada → preview sin CTA de inscripción. Test en Task 1 (backend) y Task 3 (render por estado).
- `courseId` no válido o curso sin vídeo → 404 y la ficha no muestra hueco. Test en Task 1; Task 3 no pinta la sección.
- `localStorage` bloqueado o valor corrupto → el reproductor funciona sin reanudar. Test en Task 2.
- El alumno se inscribe en la propia ficha → el vídeo pasa a completo sin recargar. Verificación e2e en Task 4.

---

### Task 1: Backend — servicio, config, endpoint, script de migración

**Files:**
- Create: `backend_learningprjct/src/config/courseVideos.js`, `src/service/courseVideoService.js`, `src/controller/courseVideoController.js`, `src/scripts/migrarVideoAuthenticated.js`, `test/courseVideo.test.js`
- Modify: `src/routes/course.routes.js` (ruta `GET /:id/video`), `.env.example`

**Interfaces:**
- Produces: `COURSE_VIDEOS: Record<courseId, {publicId, version}>`; `videoFor(courseId) → {publicId,version}|null`; `videoUrls(video, mode, type='upload') → {src, poster}`; `GET /api/courses/:id/video → {mode, src, poster}`.

- [ ] Tests: `videoUrls` preview contiene `so_0,eo_30` y nunca es igual a la URL full; full no contiene `eo_`; con `type='authenticated'` las URLs contienen `/authenticated/s--` y difieren de las de `upload`; endpoint: sin token / token basura / sin inscribir / inscrito con curso cerrado → `preview`; inscrito + abierto → `full`; el cuerpo preview no contiene la URL full; curso sin vídeo → 404; id inválido → 404; cabecera `cache-control` incluye `no-store`.
- [ ] Ejecutar `npm test` → falla.
- [ ] Implementar; el modo `preview` no llama nunca a la rama full.
- [ ] `npm test` → todo verde (34 previos + nuevos).
- [ ] Commit `feat(video): endpoint que decide preview o completo y firma en Cloudinary`.

### Task 2: Front — API, hook y lógica de reanudación

**Files:**
- Create: `front_learningprjct/src/components/courses/sheet/useCourseVideo.js`, `sheet/videoResume.js`, `sheet/videoResume.test.js`
- Modify: `src/lib/coursesApi.js` (`fetchCourseVideo(id, token, signal)`), `package.json` (añadir el test al script)

**Interfaces:**
- Produces: `useCourseVideo(id, key) → { status: 'loading'|'ready'|'none', video: {mode,src,poster}|null }` (key cambia con userId+enrolled); `readResume(id, duration) → number`, `saveResume(id, t)`, `clearResume(id)`.

- [ ] Tests `videoResume`: guarda/lee; ignora < 5 s y > duración−10 s; valor no numérico → 0; `localStorage` que lanza → 0 sin excepción.
- [ ] Implementar y `npm test` verde. Commit.

### Task 3: Front — componente `CourseVideo` (preview / full) en la ficha

**Files:**
- Create: `sheet/CourseVideo.jsx`
- Modify: `pages/CursoInscripcion.jsx` (entre `CourseHero` y `CourseOutcomes`), `courses/coursesCopy.js` (copy `VIDEO`)

- [ ] `status==='none'` → no renderiza nada. Preview: `muted loop playsInline autoPlay` gestionado por IntersectionObserver, sin `controls`, botón pausa (aria-pressed), CTA con `cta.onClick` (oculto si `cta.state==='reserved'`, texto alternativo). Full: `controls preload="metadata"`, reanudar con `videoResume`. Póster como capa `motion.img` que se desvanece en `playing`. `useReducedMotion()` → sin autoplay y transiciones de opacidad instantáneas.
- [ ] `npm run lint` y `npm run build` sin errores. Commit.

### Task 4: Verificación e2e

**Files:** solo scratchpad (servidor de prueba con mongodb-memory-server + backend real; script Playwright).

- [ ] Backend real en memoria (puerto 8549) con curso Carbono, alumno inscrito y alumno sin inscribir; front `VITE_API_URL=http://localhost:8549`.
- [ ] Playwright: anónimo, sin inscribir e inscrito; captura de red de todas las respuestas → los no inscritos nunca contienen la URL full; capturas 375 y 1280; sin scroll horizontal; reduced motion sin autoplay; flujo inscribirse en la ficha → modo full.
