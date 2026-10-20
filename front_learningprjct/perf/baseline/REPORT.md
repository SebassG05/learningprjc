# Baseline de rendimiento — 20/10/2026

Rama `perf/fluidez`, commit de partida `7df859b`. Ningún cambio en la app: solo herramientas de medición.

## Resumen

- **Portátil (1366×768) ya va a 60 fps** en la home con la CPU frenada 4x y 6x: p5 de 59,5 fps y ningún frame de más de 50 ms. Las demás páginas, entre 57 y 60 fps. Con una GPU decente, aquí no hay problema de fluidez.
- **El problema está en el móvil**, y en concreto en la home:
  1. **Un tirón al empezar a hacer scroll.** El globo 3D se monta con el primer gesto y produce un frame de **134–317 ms**. Son dos tareas: compilar los shaders y crear la escena.
  2. **Frames perdidos sostenidos con CPU 4x mientras el globo está activo**: alrededor del 20 % en las escenas del hero, el proceso y la FAQ, con p5 de 30 fps.
- **Carga:** Lighthouse móvil da 96 en la home y 94 en `/cursos` y `/sobre`, pero solo **79 en `/contacto` y 78 en `/reseñas`** (LCP de 5,2 y 5,4 s). La causa es una animación de entrada desde opacidad 0 sobre el texto LCP: eso sí cambia lo que se ve, así que **es decisión tuya**.
- **JS:** el bundle inicial ocupa 174 KB gzip y Lighthouse marca unos 230 KB de JS sin usar en cada ruta. El globo es un chunk aparte de 228 KB gzip, y `three` pesa 669 KB sin comprimir de sus 841.
- **CLS durante el scroll** en `/sobre` (0,08–0,13) y en `/reseñas` (0,10). Lo provocan capas decorativas de fondo que cambian de tamaño al terminar de cargar. Lighthouse no lo ve porque solo mide la carga.
- **Memoria: sin fugas.** Tras 2 minutos de scroll continuo, el heap pasa de 10,8 a 10,9 MB en portátil y de 9,0 a 9,2 MB en móvil, con los mismos nodos DOM y listeners.
- **El código de animación ya es disciplinado**: transform y opacity, motion values sin re-render y listeners pasivos. El globo ya se carga en diferido, se pausa con la pestaña oculta y tiene `PerformanceMonitor`. No hay animaciones caras en bucle que corregir.

## Cómo se ha medido

| Pieza | Detalle |
| --- | --- |
| Build | `npm run perf:build`: build de producción idéntico, apuntando a la API simulada `tests/fixtures/mock-api.mjs` (datos fijos, 300 ms de latencia). Nunca se toca producción. |
| Servidor | `vite preview` del build en `dist-perf/` (puerto 4173) más el mock (puerto 8549): `npm run perf:serve`. |
| Navegador | Chrome instalado, headless, con la **GPU real** del equipo (RTX 3060, D3D11). Service worker bloqueado y consentimiento de cookies ya dado (el banner difumina la página). Terceros (Google Translate, avatares, Cloudinary) bloqueados o sustituidos en los recorridos para que la red sea determinista. En Lighthouse sí se cargan, como en una visita real. |
| Dispositivos | **Móvil gama media**: 412×823 a 1,75x, táctil (sin Lenis ni escenas fijadas, globo en calidad baja). **Portátil modesto**: 1366×768 a 1x, ratón (Lenis, escenas fijadas, globo en calidad alta). |
| Throttling | CPU 4x con Slow 4G y CPU 6x con Fast 3G (CDP). |
| Recorrido | De arriba abajo a unos 1800 px/s: rueda en portátil (la consume Lenis) y arrastres táctiles reales en móvil. En la home, además, se abren 3 preguntas de la FAQ para medir el INP. |
| Métricas | Frames por `rAF` (FPS medio y p5; perdido = intervalo > 18 ms, o sea, que se salta al menos un vsync a 60 Hz). Long Animation Frames con atribución de script. Traza de Chrome: main thread, layouts y recálculos de estilo, los **forzados** desde JS con la función culpable, y ocupación del proceso de GPU. LCP, CLS con sus fuentes, INP por Event Timing. Memoria (heap y contadores DOM) tras GC. |
| Repeticiones | 3 ejecuciones por celda, mediana. Antes de cada una, **calibración**: 2 s en una página vacía con el mismo perfil. Si no da ≥ 59 fps, la máquina está ocupada y se repite. |
| Lighthouse | 5 rutas × móvil y escritorio × 3 ejecuciones, mediana (`perf/scripts/lighthouse.mjs`). |
| Visual | 76 capturas de referencia (`tests/visual/__screenshots__/`): 8 puntos de la home (hero, ventajas, proceso, FAQ, reseñas, CTA, pie) y 3 alturas de `/cursos`, `/sobre`, `/contacto` y `/reseñas`, a 360, 768, 1280 y 1920 px. El reloj de la página arranca **congelado** (`clock.pauseAt`): el globo, los muelles y Lenis solo avanzan cuando el test lo indica, así que cada captura sale idéntica píxel a píxel. |

### Limitaciones (importante)

1. **La GPU no se puede frenar por software.** Con la RTX 3060, el globo y los `backdrop-filter` nunca son el cuello de botella: GPU ocupada al 5–15 %. En un portátil con gráfica integrada o en un móvil real, la GPU sí puede serlo. Probé a usar **SwiftShader** (GPU por software) como indicador relativo: queda saturada (89–99 %), pero la dispersión entre ejecuciones (±20 %) es mayor que el efecto de quitar el lienzo o los `backdrop-filter`. Está guardado en `gpu-software/`, pero **no lo uso para decidir**. Cualquier cambio dirigido a la GPU tendrá que justificarse por coste estimado (píxeles × capas), no por fps medidos aquí.
2. **Primer baseline descartado.** La primera tanda salió contaminada por carga ajena en la máquina: portátil a ~55 fps en todas las páginas, incluso las estáticas, y móvil a 37 fps. Además, mi instrumento inicial leía `scrollY` dentro de `rAF` y él mismo provocaba recálculos de estilo forzados. Corregí las dos cosas (calibración por ejecución y muestreo del scroll a 10 Hz, excluido por nombre del análisis) y repetí todo. Las cifras de abajo son las limpias. Lighthouse y la memoria son de la primera tanda: Lighthouse simula el throttling y la memoria no depende de la carga, pero se volverán a medir en las mismas condiciones en el "después".
3. **Variación entre ejecuciones en el móvil con CPU 4x.** Dos de las tres ejecuciones dan p5 de 30 fps y la tercera 59,5. Depende de en qué punto del recorrido llega el chunk del globo. Por eso todas las comparaciones irán siempre con mediana de 3.

## Cuellos de botella, por impacto

| # | Problema | Dónde | Evidencia | Impacto |
| --- | --- | --- | --- | --- |
| 1 | **Tirón al montar el globo** con el primer gesto | Móvil, home | Peor frame de 134 ms (4x) y 317 ms (6x). LoAF de 117–168 ms en el primer frame de R3F y de 75–150 ms en el commit de React. Perfil de CPU (6x): unos 100 ms en `getProgramInfoLog` (three comprueba de forma síncrona cada shader, `checkShaderErrors`), unos 130 ms preparando programas WebGL y el parseo del chunk de 840 KB | **Alto**: es *el* tirón perceptible, justo cuando el usuario empieza a desplazarse |
| 2 | **Frames perdidos sostenidos con el globo activo** | Móvil 4x, home (hero → FAQ) | 14–24 % de frames de 33 ms por escena, p5 de 30 fps. Main thread al 24 % y GPU al 7 %: no es saturación de CPU. Queda por aislar en qué etapa del pipeline se pierde el frame | **Alto** si se confirma en dispositivo real. Primer paso: aislar la etapa con la traza (`PipelineReporter`) |
| 3 | **Recálculo de estilo forzado en cada frame del globo** | Home, ambos | El bucle del globo (`Director` → `getBoundingClientRect` del ancla del hero) lee layout después de que framer-motion escriba estilos: 266–293 recálculos forzados y 92–165 ms por recorrido en móvil | **Medio-bajo**. Puede que no sea trabajo extra (el navegador recalcula una vez por frame de todos modos): solo se aplicará si mejora de forma medible |
| 4 | **JS inicial con páginas que la home no usa** | Todas las rutas, carga | 174 KB gzip iniciales. Guía de usuario, textos legales, Contacto, Reseñas, Ajustes y Login van en el bundle de entrada (unos 120 KB sin comprimir). Lighthouse: unos 230 KB de JS sin usar y *bootup* de 350 ms en la home móvil | **Medio** en TBT y LCP móvil |
| 5 | **Google Translate en todas las páginas** | Todas, carga | 249 KB de JS de terceros y una tarea larga de 86 ms a los ~3,4 s. **Ninguna parte de la interfaz lo usa**: el widget está oculto y no hay selector que lo active. Solo actúa si el navegador trae una cookie `googtrans` antigua (traduce la página sola al cargar) | **Medio** en TBT |
| 6 | **CLS por capas decorativas** | `/sobre`, `/reseñas` | `/sobre`: la mancha `about-sky-mid` se coloca al 38 % de la altura de la página. Esa altura cambia cuando cada sección con `content-visibility: auto` se pinta por primera vez y sustituye su estimación (56rem) por la real, y la mancha salta unos 145 px. `/reseñas`: el contenedor del fondo pasa de 297 a 154 px de alto al llegar las reseñas | **Bajo-medio**: es un salto real, pero de un degradado muy suave sobre fondo oscuro |
| 7 | **Frames de 33 ms en `/sobre` móvil** | `/sobre`, móvil | 8–20 % por escena, con el main thread al 14 % (raster o composición: degradados grandes, animaciones ligadas al scroll a 1,75x) | **Medio-bajo**. Hay que aislar la etapa |
| 8 | **LCP de 5,2/5,4 s en `/contacto` y `/reseñas` móvil** | Carga | El 91–92 % es *render delay*: la columna del hero entra con variantes `opacity: 0 → 1` y el texto LCP está dentro | **Alto en Lighthouse (79/78)**, pero **arreglarlo cambia la animación de entrada** → decisión tuya |

### Lo que no es un problema (y por tanto no se toca)

- **Portátil con CPU 4x y 6x**: 60 fps con p5 de 59,5.
- **`backdrop-filter`** (cabecera y tarjetas de cristal sobre el lienzo): sin efecto medible ni con GPU real ni con SwiftShader.
- **Lenis**: fuerza un recálculo por frame (su `raf` va después del de framer-motion), unos 0,18 ms con CPU 4x. Evitarlo obligaría a cambiar el orden en que Lenis y las escenas leen el scroll, lo que desplaza en un frame lo que se ve. **Descartado.**
- **Memoria**: estable, sin fugas.
- **Animaciones de propiedades caras**: solo hay `height` en el diálogo de acceso (puntual) y `width` en barras de progreso de los tests (puntual, fuera de las rutas públicas).
- **Fuentes**: Rondana `.otf`, 4 × 20 KB, con `font-display: swap` y precarga del peso Black. No hay WOFF2 porque la licencia de Sudtipos no está en el repo. Ver decisiones.
- **Imágenes**: solo `globo.webp` (44 KB, *fallback* sin WebGL). Las portadas de cursos ya usan Cloudinary con `f_auto,q_auto` y `srcset`. No hay modelos 3D: todo es geometría procedural.

## Plan de optimización propuesto

Uno a uno, de mayor a menor impacto. Después de cada cambio: misma medición (3 ejecuciones con mediana y calibración) y los 76 tests visuales. Si no mejora de forma medible o falla una captura, se revierte. Cada cambio que sobreviva irá en su propio commit.

| Paso | Cambio | Ataca | Efecto visible esperado |
| --- | --- | --- | --- |
| 1 | Desactivar `renderer.debug.checkShaderErrors` en producción: elimina la espera síncrona de unos 100 ms por compilación | #1 | Ninguno |
| 2 | Compilar los shaders en paralelo (`compileAsync` + `KHR_parallel_shader_compile`) antes del primer frame visible, mientras el lienzo aún está a opacidad 0 | #1 | Ninguno en el fundido. El fundido empieza cuando están listos los shaders (ahora depende igualmente de la red) |
| 3 | En móvil, descargar y evaluar el chunk del globo en un momento ocioso tras la carga; el montaje sigue esperando a la primera interacción, como ahora | #1 | Ninguno. Contrapartida: +228 KB gzip para quien no llega a interactuar |
| 4 | Aislar con la traza (`PipelineReporter`) en qué etapa se pierden los frames del móvil con el globo activo y actuar según el resultado (p. ej. resolución del lienzo en calidad baja, solo si a simple vista no se nota) | #2 | Ninguno, o imperceptible (la excepción que permites para el globo) |
| 5 | Leer el rectángulo del ancla del globo en la fase de lectura de framer-motion en lugar de dentro del bucle de R3F. **Se queda solo si mejora de forma medible** | #3 | Ninguno, salvo un posible desfase de un frame durante la transición de entrada de página. Si se nota, se descarta |
| 6 | Code-splitting de las rutas que no son la home (guía, legales, contacto, reseñas, ajustes, login) con **precarga en ocioso y en hover/foco**, y componente perezoso que no muestra *fallback* si el chunk ya está cargado | #4 | Ninguno: la precarga evita el spinner al navegar. Se verificará navegando entre rutas |
| 7 | Reservar el tamaño final de las capas decorativas de `/sobre` y `/reseñas` para que no salten al cargar | #6 | Ninguno en el estado final. Desaparece el salto |
| 8 | Aislar la etapa de los frames de 33 ms en `/sobre` móvil y actuar si la causa lo permite sin cambio visual | #7 | Ninguno |
| 9 | Google Translate: **con cookie `googtrans`** se carga como ahora, de inmediato, y la página se traduce igual. **Sin ella** se difiere a un momento ocioso tras la carga | #5 | Ninguno para nadie |
| 10 | Dejar los presupuestos (`perf/budgets.json`) ajustados a los valores *después*, `npm run test:perf`, `npm run test:visual` y Lighthouse CI (`lighthouserc.cjs`) | — | — |

### Decisiones que necesito de ti (cambian algo visible o tienen contrapartida)

1. **LCP de `/contacto` y `/reseñas`** (Lighthouse móvil 79/78, LCP 5,2/5,4 s). Opciones:
   - **a)** dejarlo como está;
   - **b)** que el texto del hero sea visible desde el primer frame y solo suba, como ya hace la home. La entrada se ve algo distinta: sin el fundido del texto;
   - **c)** empezar el fundido en opacidad 0,01 en vez de 0. Es visualmente indistinguible, pero **solo mejora la métrica**: el usuario lo sigue viendo aparecer igual de tarde. No lo recomiendo.
2. **Paso 3 (precargar el globo en móvil)**: ¿aceptas descargar 228 KB gzip a usuarios móviles que quizá nunca hagan scroll?
3. **Pendiente de mayor calado, no incluido**: `@react-three/fiber` v8 importa *todo* `three` (669 KB). Recortarlo exige migrar a R3F v9 con React 19. Es una actualización con riesgo, que propondría por separado.
4. **Google Translate**: si nadie lo usa (no hay selector visible), se podría **quitar del todo**. Es decisión de producto, no de rendimiento, así que con el paso 9 basta.
5. **Fuentes WOFF2**: convertir los `.otf` reduciría alrededor de un 30–40 % su peso, pero depende de la licencia de Rondana.

## Reproducir

```bash
cd front_learningprjct
npm run perf:build                     # build contra la API simulada → dist-perf/
npm run perf:serve                     # mock (8549) + preview (4173)
node perf/scripts/scroll.mjs --out perf/runs/x --gpu real --routes "/,/sobre,/contacto,/reseñas" [--memory 120]
node perf/scripts/lighthouse.mjs --out perf/runs/x
node perf/scripts/bundles.mjs --out perf/runs/x
node perf/scripts/tables.mjs --dir perf/baseline --compare perf/runs/x   # tabla antes/después
npx playwright test --project=visual   # regresión visual
```

En Git Bash en Windows hay que anteponer `MSYS_NO_PATHCONV=1`; si no, `/` se convierte en una ruta del disco.

Ficheros: `scroll.json` (recorridos, con desglose por escena, LoAF y causantes de layouts forzados), `lighthouse.json`, `memory.json`, `bundles.json`, `gpu-software/` (indicador no concluyente).

---

## Datos

### Recorrido de scroll completo (mediana de 3 ejecuciones)

| Ruta · perfil | FPS medio | FPS p5 | Frames > 16,7 ms | Frames > 50 ms | LoAF (bloqueo ms) | Main thread ocupado | GPU ocupada | Recálculos de estilo forzados | Layouts forzados | LCP (ms) | INP (ms) | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / · Móvil · CPU 4x · slow-4g | 53,4 | 30,0 | 86 | 1 | 1 (129) | 24,1 % | 6,8 % | 374 | 15 | 2028 | 80 | 0,000 |
| / · Móvil · CPU 6x · fast-3g | 57,0 | 59,5 | 20 | 1 | 2 (217) | 39,1 % | 4,5 % | 342 | 12 | 3076 | 104 | 0,000 |
| / · Portátil · CPU 4x · slow-4g | 60,0 | 59,5 | 0 | 0 | 0 (0) | 45,4 % | 11,8 % | 638 | 31 | 2060 | 48 | 0,000 |
| / · Portátil · CPU 6x · fast-3g | 59,6 | 59,5 | 3 | 0 | 0 (0) | 43,6 % | 11,2 % | 620 | 31 | 3040 | 56 | 0,000 |
| /sobre · Móvil · CPU 4x · slow-4g | 59,7 | 59,5 | 3 | 0 | 1 (0) | 14,0 % | 2,4 % | 97 | 0 | 2144 | — | 0,080 |
| /sobre · Móvil · CPU 6x · fast-3g | 56,1 | 30,0 | 44 | 0 | 0 (0) | 14,1 % | 3,8 % | 90 | 0 | 3444 | — | 0,000 |
| /sobre · Portátil · CPU 4x · slow-4g | 60,0 | 59,5 | 0 | 0 | 0 (0) | 22,9 % | 9,0 % | 270 | 51 | 2132 | — | 0,130 |
| /sobre · Portátil · CPU 6x · fast-3g | 58,2 | 59,5 | 12 | 1 | 0 (0) | 38,9 % | 9,1 % | 289 | 51 | 3460 | — | 0,130 |
| /contacto · Móvil · CPU 4x · slow-4g | 58,6 | 59,5 | 12 | 0 | 0 (0) | 28,4 % | 4,5 % | 98 | 98 | 2920 | — | 0,000 |
| /contacto · Móvil · CPU 6x · fast-3g | 58,3 | 59,2 | 12 | 0 | 0 (0) | 24,6 % | 4,4 % | 98 | 98 | 3836 | — | 0,000 |
| /contacto · Portátil · CPU 4x · slow-4g | 58,9 | 59,5 | 4 | 0 | 0 (0) | 55,8 % | 8,7 % | 152 | 151 | 2892 | — | 0,000 |
| /contacto · Portátil · CPU 6x · fast-3g | 56,9 | 59,2 | 8 | 1 | 0 (0) | 51,1 % | 8,4 % | 158 | 157 | 4060 | — | 0,000 |
| /reseñas · Móvil · CPU 4x · slow-4g | 55,8 | 30,0 | 25 | 0 | 0 (0) | 13,0 % | 6,9 % | 57 | 0 | 2760 | — | 0,000 |
| /reseñas · Móvil · CPU 6x · fast-3g | 55,3 | 30,0 | 28 | 0 | 0 (0) | 15,6 % | 7,2 % | 58 | 0 | 3792 | — | 0,100 |
| /reseñas · Portátil · CPU 4x · slow-4g | 59,4 | 59,5 | 1 | 0 | 1 (1) | 36,7 % | 14,7 % | 283 | 169 | 2804 | — | 0,010 |
| /reseñas · Portátil · CPU 6x · fast-3g | 58,1 | 59,5 | 5 | 1 | 0 (0) | 42,6 % | 14,3 % | 273 | 164 | 3844 | — | 0,010 |

#### / · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Campus. | ¿Qué puedes esperar de los curso | ¿Cómo funciona el proceso? | Preguntas frecuentes | ¿Qué opinan nuestros estudiantes | ¿Listo para encontrar tu próxima | (fuera de secciones) | ¿Cómo funciona el proceso? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 13,6 % (33 ms) | 23,7 % (134 ms) | 20,9 % (33 ms) | 22,0 % (33 ms) | 7,1 % (33 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | — |
| Móvil · CPU 6x · fast-3g | 1,6 % (33 ms) | 9,6 % (317 ms) | 5,4 % (50 ms) | 3,8 % (34 ms) | 0,0 % (18 ms) | 0,9 % (33 ms) | 0,0 % (17 ms) | — |
| Portátil · CPU 4x · slow-4g | 0,0 % (17 ms) | — | — | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (18 ms) |
| Portátil · CPU 6x · fast-3g | 0,0 % (17 ms) | — | — | 0,0 % (17 ms) | 5,9 % (34 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) |

#### /sobre · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Misión, Visión y Valores | Nuestro equipo | Testimonios | Tu próximo curso empieza aquí.Tu | (fuera de secciones) |
| --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 1,1 % (34 ms) | 1,4 % (33 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (18 ms) |
| Móvil · CPU 6x · fast-3g | 10,6 % (34 ms) | 11,4 % (33 ms) | 9,0 % (34 ms) | 2,1 % (33 ms) | 2,9 % (34 ms) |
| Portátil · CPU 4x · slow-4g | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) |
| Portátil · CPU 6x · fast-3g | 8,5 % (67 ms) | 0,0 % (17 ms) | 2,1 % (33 ms) | 0,0 % (17 ms) | 1,2 % (33 ms) |

#### /contacto · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Contacto directo | Escríbenos | Quizá ya tengas la respuesta | Dónde estamos | (fuera de secciones) |
| --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 0,0 % (17 ms) | 7,1 % (34 ms) | 0,0 % (17 ms) | 2,1 % (34 ms) | 0,4 % (33 ms) |
| Móvil · CPU 6x · fast-3g | 0,0 % (17 ms) | 7,9 % (34 ms) | 0,0 % (17 ms) | 0,0 % (17 ms) | 0,4 % (33 ms) |
| Portátil · CPU 4x · slow-4g | — | 0,0 % (17 ms) | — | 0,0 % (17 ms) | 2,7 % (34 ms) |
| Portátil · CPU 6x · fast-3g | — | 8,5 % (50 ms) | — | 0,0 % (17 ms) | 2,9 % (33 ms) |

#### /reseñas · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Valoración de los alumnos | Lo que cuentan los alumnos | (fuera de secciones) |
| --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 0,0 % (17 ms) | 12,5 % (34 ms) | 4,0 % (34 ms) |
| Móvil · CPU 6x · fast-3g | 0,0 % (17 ms) | 13,4 % (33 ms) | 7,4 % (50 ms) |
| Portátil · CPU 4x · slow-4g | 0,0 % (17 ms) | 4,8 % (50 ms) | 0,0 % (18 ms) |
| Portátil · CPU 6x · fast-3g | 0,0 % (17 ms) | 6,7 % (50 ms) | 1,4 % (33 ms) |

### Lighthouse (mediana de 3 ejecuciones, visita de primera vez)

| Ruta | Forma | Puntuación | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Speed Index (ms) | Peso total (KB) | JS (KB) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | móvil | 96 | 1891 | 2501 | 67 | 0,000 | 2156 | 478 | 386 |
| / | escritorio | 100 | 405 | 620 | 7 | 0,000 | 905 | 707 | 615 |
| /cursos | móvil | 94 | 2205 | 2759 | 35 | 0,000 | 2298 | 677 | 399 |
| /cursos | escritorio | 100 | 487 | 621 | 0 | 0,000 | 689 | 677 | 399 |
| /sobre | móvil | 94 | 1928 | 2831 | 18 | 0,000 | 2199 | 514 | 394 |
| /sobre | escritorio | 97 | 432 | 1286 | 0 | 0,000 | 673 | 539 | 394 |
| /contacto | móvil | 79 | 1906 | 5188 | 121 | 0,000 | 1906 | 476 | 386 |
| /contacto | escritorio | 96 | 435 | 1368 | 0 | 0,000 | 767 | 476 | 386 |
| /reseñas | móvil | 78 | 2028 | 5416 | 61 | 0,003 | 2320 | 498 | 386 |
| /reseñas | escritorio | 96 | 537 | 1378 | 0 | 0,016 | 728 | 498 | 386 |

### Memoria (tras GC, al inicio y tras 120 s de scroll continuo)

| Perfil | Heap inicio (MB) | Heap final (MB) | Crecimiento (MB) | Nodos DOM | Listeners JS | Pasadas |
| --- | --- | --- | --- | --- | --- | --- |
| Portátil | 10,8 | 10,9 | 0,07 | 757 → 760 | 259 → 260 | 8 |
| Móvil | 9,0 | 9,2 | 0,27 | 694 → 694 | 223 → 223 | 10 |

### Bundles

| Paquete | KB bruto / gzip / brotli |
| --- | --- |
| JS inicial (todas las rutas) | 569,9 / 174,0 / 148,6 |
| CSS inicial | 173,5 / 26,2 / 20,4 |
| diferido: components/globe/GlobeCanvas.jsx | 841,4 / 227,6 / 187,0 |
| diferido: components/admin/gestion-cursos/CourseEditor.jsx | 79,8 / 31,7 / 28,1 |
| diferido: components/admin/correcciones/SubmissionDrawer.jsx | 69,2 / 29,8 / 26,5 |
| diferido: _CorreccionesTab-Ur7RfplV.js | 47,8 / 21,8 / 19,4 |
| diferido: components/admin/reservas/ReservasTab.jsx | 46,9 / 20,4 / 18,2 |
| diferido: pages/CursoDetalle.jsx | 58,1 / 18,2 / 16,0 |
| diferido: components/admin/progreso/ProgresoTab.jsx | 40,7 / 17,3 / 15,5 |
| diferido: pages/CursoInscripcion.jsx | 42,6 / 16,9 / 15,0 |
| diferido: _GestionCursosTab-C1RUPwv0.js | 29,5 / 13,3 / 11,8 |
| diferido: pages/Cursos.jsx | 24,9 / 10,2 / 9,1 |
| diferido: components/auth/AuthModal.jsx | 20,4 / 7,6 / 6,8 |
| diferido: pages/SobreNosotros.jsx | 19,1 / 7,0 / 6,1 |

#### Inventario de recursos estáticos (public/)

| Tipo | Fichero | KB |
| --- | --- | --- |
| imagen | inicio/globo.webp | 43,8 |
| fuente | Corporatives/Typography/Rondana Black.otf | 20,8 |
| fuente | Corporatives/Typography/Rondana Ultra Light.otf | 20,6 |
| fuente | Corporatives/Typography/Rondana Light.otf | 20,3 |
| fuente | Corporatives/Typography/Rondana Regular.otf | 20,2 |
| imagen | vite.svg | 1,5 |

### GPU por software (SwiftShader) — indicador no concluyente


| Ruta · perfil | FPS medio | FPS p5 | Frames > 16,7 ms | Frames > 50 ms | LoAF (bloqueo ms) | Main thread ocupado | GPU ocupada | Recálculos de estilo forzados | Layouts forzados | LCP (ms) | INP (ms) | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / · Portátil · GPU software | 23,0 | 12,0 | 226 | 87 | 85 (134) | 23,4 % | 99,3 % | 357 | 30 | 188 | 72 | 0,000 |
| / · Móvil · GPU software | 35,1 | 15,0 | 338 | 57 | 78 (59) | 12,3 % | 89,5 % | 406 | 14 | 132 | 128 | 0,000 |

