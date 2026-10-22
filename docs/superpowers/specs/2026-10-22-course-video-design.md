# Vídeo del curso: preview para no inscritos, completo para inscritos

Fecha: 2026-10-22 · Rama: `feat/curso-video`

## Objetivo
En la ficha pública del curso (`/curso/:id/inscripcion`) se muestra el vídeo del curso:
- **Preview** (sin sesión, sin inscribir o con plaza reservada en un curso cerrado): 30 s, en silencio, en bucle, sin controles de seek, con CTA «Inscríbete para ver el curso completo» que reutiliza el flujo de inscripción existente.
- **Completo** (inscrito y curso abierto): controles, sonido, `preload="metadata"`, recuerda dónde se quedó.

## Decisiones del usuario (2026-10-22)
- Solo en la ficha, no en el aula.
- Asociación curso→vídeo en `backend/src/config/courseVideos.js` (sin escribir en la BD).
- Código preparado para Cloudinary `authenticated` + URLs firmadas; la migración del asset en prod solo se ejecuta con el OK explícito del usuario.

## Seguridad
- La decisión la toma el backend: `GET /api/courses/:id/video` (con `optionalAuth`) devuelve `{ mode, src, poster }`. En modo preview la URL completa ni se construye.
- `Cache-Control: private, no-store` y `Vary: Authorization`: ninguna caché compartida puede servir la respuesta de un alumno a otro.
- Endpoint aparte (no dentro de `GET /api/courses/:id`) porque ese JSON es público, se precarga sin token (`vite/routeModulePreload.js`, `useCourseSheet`) y se cachea en el cliente.
- Mientras el asset sea `upload` (público), la URL de la preview contiene el `public_id` y quitando la transformación se obtiene el completo: la protección real exige `CLOUDINARY_VIDEO_TYPE=authenticated` tras migrar. Con `authenticated`, toda URL va firmada y la firma cubre la transformación.
- Plan Free de Cloudinary: las URLs firmadas **no caducan** (la caducidad requiere token auth, de pago). Riesgo residual: un inscrito puede compartir su URL completa.

## Diseño del control de acceso

```
Navegador ──GET /api/courses/:id/video (Bearer opcional)──▶ Express
                                                            │ optionalAuth: token válido → req.user, si no anónimo
                                                            │ Course.findById(id).select('isOpen')   ─┐ en paralelo
                                                            │ UserProgress.exists({userId, courseId}) ─┘ (solo con req.user)
                                                            │ mode = enrolled && isOpen ? full : preview
                                                            │ videoUrls(video, mode, CLOUDINARY_VIDEO_TYPE)  ← firma local con API_SECRET, sin red
                                                            ▼
                                       { mode, src, poster }  (private, no-store, Vary: Authorization)
Navegador ──GET src (firmada)──▶ res.cloudinary.com  (CDN; con authenticated, firma inválida/alterada → 401)
```

- **Requisitos no funcionales**: una consulta indexada (`UserProgress` por `userId+courseId`) y un `findById`; la firma es un SHA local, sin llamada a Cloudinary → latencia ≈ la de `/enrollment/:id`. Carga despreciable (decenas de alumnos).
- **Errores**: id no válido o curso sin vídeo → 404 (la ficha oculta la sección). Fallo de BD → 500 y la ficha oculta la sección (no degrada a «full»). Token inválido → anónimo (nunca más permisos, nunca 401 que rompa la ficha pública).
- **Fail-closed**: cualquier rama no prevista devuelve preview. La URL full solo se construye dentro de la rama `full`.
- **Caché**: el JSON es personal → `no-store`. El vídeo en sí lo cachea la CDN de Cloudinary por URL; con URLs firmadas estables la caché del navegador y de la CDN se aprovecha (no se regeneran firmas por petición).
- **Trade-offs**: firmar sin caducidad (Free) vs. token auth (de pago, caducidad por URL); proxy propio de streaming (caducidad sin pagar, pero todo el ancho de banda pasa por el servidor Node y pierde la CDN) descartado.
- **A revisar al crecer**: token auth con `duration` si se sube de plan; marcas de agua o HLS cifrado si la redistribución se convierte en problema; mover `courseVideos.js` al modelo + Gestión de cursos cuando haya más de 2–3 vídeos.

## Backend
- `src/config/courseVideos.js`: `courseId → { publicId, version }`.
- `src/service/courseVideoService.js`: `videoUrls(video, mode, type)` puro con `cloudinary.url`.
  - preview: `so_0,eo_30,q_auto,f_auto` (determinista; `e_preview` descartado: se genera en diferido y la primera petición puede fallar).
  - póster: `so_0,q_auto,f_jpg`.
  - completo: `q_auto,f_auto`.
- `obtenerVideoCurso`: 404 si el curso no existe o no tiene vídeo; `full` solo si token válido + `UserProgress` + `course.isOpen`.
- `scripts/migrarVideoAuthenticated.js`: dry-run por defecto, `--apply`, `--revert`; invalida la CDN.
- Env nueva: `CLOUDINARY_VIDEO_TYPE` (`upload` por defecto | `authenticated`).

## Frontend
- `lib/coursesApi.js`: `fetchCourseVideo(id, token, signal)`.
- `components/courses/sheet/useCourseVideo.js`: pide el vídeo cuando se conoce la inscripción; se repite al inscribirse.
- `components/courses/sheet/CourseVideo.jsx`: sección bajo la portada, 16:9.
  - Preview: reproduce solo visible (IntersectionObserver), botón pausa/reproducir (WCAG 2.2.2), CTA en degradado inferior. Reduced motion: sin autoplay, póster + botón.
  - Completo: `controls`, `preload="metadata"`; posición en `localStorage` (`video_pos_<id>`, try/catch, cada 5 s y en pausa/salida); reanuda si 5 s < t < duración−10 s; se borra al terminar.
  - Movimiento: póster→vídeo por opacidad (~300 ms ease-out) al `playing`; CTA entra con muelle corto; sin movimiento con reduced motion.
- Sin subtítulos en el asset: se señala como pendiente.

## Pruebas
- Backend `node --test`: anónimo/token basura → preview; sin inscribir → preview; inscrito+abierto → full; reservado → preview; la preview nunca contiene la URL completa; cabeceras no-store; firma en modo authenticated.
- Frontend `node --test`: lógica de reanudación.
- Playwright contra el backend real en memoria (mongodb-memory-server, nunca prod): los tres casos + inspección de red de que el no inscrito nunca recibe la URL completa; capturas 375/1280; reduced motion.
