# Fondo "Viaje de vuelta a la Tierra" — plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: superpowers:executing-plans (nativo) o superpowers:subagent-driven-development. Los pasos usan checkboxes (`- [ ]`).

**Objetivo:** un único lienzo WebGL fijo para toda la home cuya cámara viaja Hero → Proceso → FAQ (espacio profundo) → Reseñas (órbita) → CTA (horizonte al amanecer).

**Arquitectura:** `JourneyStage` (fijo, detrás del contenido) sustituye al `GlobeStage` que vive dentro del hero y monta el `GlobeCanvas` una sola vez. Cada sección registra su `scrollYProgress` en un store mutable (`journey/store.js`). El lienzo lee esos motion values en `useFrame`, calcula los pesos de las estaciones con funciones puras (`journey/keyframes.js`) y amortigua la cámara y el globo con una lerp exponencial propia. Las escenas son grupos propios que se montan cuando su sección está cerca.

**Stack:** React 18, React Three Fiber 8, three 0.170, framer-motion 12 y Tailwind 4. Sin dependencias nuevas. `maath` está instalado pero solo como dependencia de drei, así que no se importa: usamos una lerp propia.

**Spec:** el prompt de la opción G que hay en la conversación (tabla de escenas, límites y verificación).

## Restricciones globales

- Solo frontend visual: no se tocan el backend, la API, las URLs ni el enrutado.
- El acordeón, las reseñas y "Comenzar ahora" no cambian de lógica. El fondo solo **lee** `openIdx`, `reviews.length` y el hover/foco.
- Un solo contexto WebGL en la home, `dpr={[1, 1.5]}`, `PerformanceMonitor` y nada de `setState` en `useFrame`.
- Móvil (`quality: 'low'`): menos estrellas y nodos, como máximo 6 satélites y sin postprocesado.
- `prefers-reduced-motion`: sin viaje. Fotograma estático por sección y fundido de opacidad entre ellas, sin pulsos que recorran el arco.
- Satélites: un máximo de 12 (6 en móvil). Pulso del FAQ: 600–900 ms.
- En el DOM solo se animan `transform` y `opacity`.

## Revisión: puntos de fallo

1. **Salto con ancla o `glideTo(0)` desde la CTA** (el botón llama a `glideTo(0)` sin sesión): la cámara debe llegar al hero amortiguada, sin un fotograma con el globo en un sitio imposible. Prueba en la tarea 2.
2. **Redimensionar la ventana o cambiar de vertical a horizontal a mitad de escena:** los keyframes van en fracciones del viewport y se recalculan en cada frame. Prueba en la tarea 2.
3. **Reseñas en carga o con error:** se muestra el satélite de espera, nunca 0 satélites ni una excepción. Prueba en la tarea 4.
4. **Abrir varias preguntas seguidas muy rápido:** los pulsos se encolan, como mucho 3 a la vez, y no se pierde ninguno. Prueba en la tarea 3.
5. **Foco con teclado en "Comenzar ahora" y Tab fuera:** el amanecer sube y vuelve igual que con el ratón. Prueba en la tarea 5.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| Crear `src/components/globe/journey/store.js` | Puente UI→lienzo, mutable y sin React |
| Crear `src/components/globe/journey/keyframes.js` | Estaciones, pesos y mezcla (puro, testeable con `node --test`) |
| Crear `src/components/globe/journey/keyframes.test.js` | Tests con `node:test` (sin dependencias) |
| Crear `src/components/globe/journey/JourneyStage.jsx` | Contenedor fijo: carga diferida, pausa, fallback y fundido en reduced motion |
| Crear `src/components/globe/scenes/DeepSpaceScene.jsx` | Red de nodos y arcos más pulsos |
| Crear `src/components/globe/scenes/OrbitScene.jsx` | Elipse con satélites por reseña |
| Crear `src/components/globe/scenes/DawnScene.jsx` | Sol, barrido de luz, arcos hacia el botón y estrellas que se apagan |
| Modificar `src/components/globe/GlobeCanvas.jsx` | Modo `journey`: el `Rig` lee las estaciones y monta las escenas |
| Modificar `src/components/globe/Orbits.jsx` | Exportar `useSatelliteMaterials(palette)` (compartido con OrbitScene) |
| Modificar `src/components/globe/Extras.jsx` y `uniforms.js` | `shared.uStarFade` para que el amanecer apague las estrellas |
| Modificar `src/pages/Home.jsx` | Registrar secciones, `JourneyStage` en lugar de `GlobeStage`, leer estado y añadir velos |

`GlobeStage.jsx` se queda como está, porque lo siguen usando otras vistas o el fallback, si aplica.

---

### Tarea 0: rama y capturas "antes"

- [ ] `git checkout -b feat/inicio-fondo-viaje` desde `feat/inicio-globo`.
- [ ] Capturas con Playwright (webapp-testing) de FAQ, Reseñas y CTA a 1440 y 390 px, en el scratchpad.
- [ ] Figma `0CbDEt5dHb9vI8THAzoxu5`: `get_variable_defs` y la página "Notas de movimiento". Si la cuota del plan Starter lo bloquea, la fuente son los tokens de `index.css`, que `palette.js` ya lee.

### Tarea 1: lienzo a nivel de página (`JourneyStage`)

**Interfaces que produce:**
- `store.js`: `journey` (objeto mutable) y las funciones `registerSection(key: 'hero'|'process'|'faq'|'reviews'|'cta', progress: MotionValue|null)`, `emitPulse(index: number, screenY: number)`, `takePulses(): {index, screenY, t0}[]`, `setReviewCount(n: number|null)` (null = cargando o error) y `setCtaBoost(on: boolean, screen?: {x,y})`.
- Hook en `store.js`: `useJourneySection(ref, key)`, que llama a `useScroll({ target: ref, offset: ['start end', 'end start'] })` y registra la sección.
- `JourneyStage({ heroProgress, heroAnchor })`: `div` `fixed inset-0 -z-10 pointer-events-none aria-hidden`. Usa la misma carga diferida, la misma comprobación de WebGL y el mismo `CanvasBoundary` que `GlobeStage` (se extraen a funciones compartidas, sin copiarlas).

- [ ] En `Home.jsx`, rama de escenas: quitar `<GlobeStage>` del sticky del hero. `FloatingCards` se queda en un `motion.div absolute inset-0` con el mismo `globeOpacity`. La opacidad del globo en el hero pasa al lienzo como un factor de la estación `hero`.
- [ ] En la rama sin escenas (móvil o reduced motion), el `<GlobeStage layout="center">` en flujo se sustituye por un **ancla vacía** con el mismo tamaño (`aspect-square max-w-[30rem]`). El rig coloca el globo sobre el rectángulo del ancla (con `getBoundingClientRect` en `useFrame`, sin escribir layout). En escritorio sin escenas, el ancla es el `absolute inset-0` de ahora.
- [ ] Montar `<JourneyStage>` una sola vez en `Home`, antes de `HeroScene`.
- [ ] Verificación: `npm run build` y `npm run lint` sin errores. Con Playwright, `document.querySelectorAll('canvas').length === 1` en todo el recorrido y el hero se ve igual que en la captura "antes" (comparación visual a 1440 y 390 px).
- [ ] Commit `fondo: lienzo único a nivel de página para la home`.

### Tarea 2: trayectoria de cámara

**Interfaces que produce (`keyframes.js`):**
- `STATIONS`: un mapa `{ hero, process, faq, reviews, cta }`. Cada entrada es `{ globe: {x, y, s} en fracciones del viewport, camY, starFade, moon, dawn, opacity }`.
  - `faq`: el globo queda bajo el borde inferior (`y: -0.95`, `s: 0.25`), la cámara sube y la luna se acerca.
  - `reviews`: el globo asoma abajo a la izquierda y la cámara queda centrada.
  - `cta`: el globo es enorme (`s ≈ 1.15·vw`) y su borde superior queda a ~18 % del fondo. Eso es el horizonte.
- `stationWeights(progress: Record<key, number|null>): Record<key, number>`: el peso de cada sección es su "centrado" (`1 − |p − 0.5|·2`, recortado). Se normaliza a suma 1. El hero usa su propio progreso, que ya existe.
- `blendStations(weights, vw, vh): Frame`, una mezcla lineal de los campos.
- `damp(current, target, lambda, dt)`, que devuelve `current + (target − current)·(1 − e^(−λ·dt))`.

- [ ] Tests (`node --test src/components/globe/journey`):
  - `stationWeights` con solo la FAQ centrada da `faq === 1`.
  - Dos secciones al 50 % dan pesos de 0,5 y 0,5.
  - Todo `null` da `hero: 1`.
  - `damp` con `dt` enorme no se pasa del objetivo. Esto es el punto de fallo 1.
  - `blendStations` con `vw/vh` distintos escala el globo de forma proporcional. Esto es el punto de fallo 2.
- [ ] El `Rig` en modo journey toma su objetivo de `blendStations` y lo amortigua con `damp` (λ ≈ 4). La transición neutra en Proceso es la estación `process`: el globo se aleja y queda a media opacidad, como ahora.
- [ ] Commit `fondo: trayectoria de cámara por estaciones`.

### Tarea 3: `DeepSpaceScene` (FAQ)

- [ ] Red con semilla fija (determinista): 14 nodos (8 en móvil) y arcos bezier entre ellos, con opacidad ≤ 0,12. Las estrellas son las de siempre (parpadeo lento). La luna, con la misma `LIGHT_DIR`.
- [ ] El pulso de la pregunta `i` usa el arco fijo `ARC_FOR_QUESTION[i]` y sale a la altura `screenY` de la pregunta. Dura 750 ms con `ease.outExpo` y al final enciende un nodo que se apaga en unos 1,6 s. Como mucho 3 pulsos a la vez; los demás esperan en la cola (punto de fallo 4). Con reduced motion, el nodo se enciende sin recorrido.
- [ ] En `FAQSection`: `useEffect(() => { if (openIdx !== null) emitPulse(openIdx, y del botón con aria-controls) }, [openIdx])`. Al cerrar no hay pulso. El acordeón no cambia.
- [ ] Velo: un degradado radial de `canvas` detrás de la columna de preguntas.
- [ ] Verificación con Playwright: abrir y cerrar las 5 preguntas con clic y con teclado, contenido y `aria-expanded` iguales que antes. Abrir 4 preguntas en menos de 300 ms no da errores en consola.
- [ ] Commit `fondo: espacio profundo con pulsos en la FAQ`.

### Tarea 4: `OrbitScene` (Reseñas)

- [ ] Una elipse inclinada de unas 1,4 veces el ancho de la tarjeta, con trazo `brand200` a 0,22. Un satélite por reseña (`min(n, 12)` y 6 en móvil), con los materiales de `useSatelliteMaterials` y velocidades `0.05 + (i % 4)·0.012`.
- [ ] Con `n === 0` o `null` (cargando o error): un solo satélite con un parpadeo de "señal" de 2,4 s (punto de fallo 3).
- [ ] En `ReviewsCarousel`: `useEffect(() => setReviewCount(loading || error ? null : reviews.length), [loading, error, reviews.length])`. Usa el fetch que ya existe, sin llamadas nuevas.
- [ ] Verificación: con la ruta `/api/reviews` interceptada en Playwright para 0, 3, 20 y error, el número de satélites es 1, 3, 12 (6 a 390 px) y 1.
- [ ] Commit `fondo: órbita de reseñas`.

### Tarea 5: `DawnScene` (CTA)

- [ ] Sol: un sprite `glowTexture` en el punto del horizonte que sube según el peso de la estación `cta`. Un barrido (una banda en el shader `Dawn`, con `uSweep` en `shared`) recorre los puntos de tierra una vez al entrar. `shared.uStarFade` lleva las estrellas a 0,25.
- [ ] Refuerzo con hover o foco: un muelle amortiguado propio en `useFrame` (rigidez ≈ 170 y amortiguación ≈ 26), que se puede interrumpir. Sube la intensidad del amanecer y dibuja 2 arcos desde el horizonte hasta la posición del botón en pantalla, pasada a coordenadas de mundo.
- [ ] En `CTAScene`: un envoltorio del `Reveal.Item` del botón con `onPointerEnter/Leave` y `onFocus/onBlur` → `setCtaBoost`. El `Button` y su `onClick` no cambian.
- [ ] La tarjeta pasa de `bg-surface` a `bg-surface/75`, con velo inferior, para que se vea el horizonte real. Se elimina el horizonte CSS (`top-[90%]`). Contraste AA: se mide el color de los píxeles bajo el texto y el botón en el estado de máximo refuerzo.
- [ ] Verificación: Tab hasta el botón y Tab fuera (punto de fallo 5). El clic sigue llevando a `/cursos` o abre el modal.
- [ ] Commit `fondo: amanecer orbital en la llamada final`.

### Tarea 6: reduced motion, móvil y gama baja

- [ ] Reduced motion: `frameloop="demand"`. La estación activa sale de `IntersectionObserver` (con `setState` solo cuando cambia) y se cambia con un fundido de 240 ms del contenedor y `invalidate()`.
- [ ] `PerformanceMonitor.onDecline` repetido (gama baja): `frameloop="demand"` con un fotograma estático por estación.
- [ ] Pausa con la pestaña oculta (`visibilitychange`). Cada escena se monta cuando su sección está a menos de un 50 % del viewport y libera sus materiales en el cleanup.
- [ ] Commit `fondo: reduced motion y móvil`.

### Tarea 7: revisión y cierre

- [ ] Skills de revisión: improve-animations, break-ui (scroll rápido, anclas, redimensionar, zoom 200 %, teclado, 0 y muchas reseñas), impeccable critique/polish y apple-design (accesibilidad).
- [ ] Capturas "después" a 1440, 1024, 390 y 360 px, más un vídeo del recorrido (Playwright `recordVideo`).
- [ ] `git diff --name-only feat/inicio-globo` sin archivos de backend. `npm run build` y `npm run lint` en verde. Variación del bundle anotada.
- [ ] Rendimiento: traza con Playwright y CDP (fps y número de contextos) y conteo de renders con React Profiler en desarrollo durante el scroll.
- [ ] requesting-code-review y verification-before-completion.
