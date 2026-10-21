# Rendimiento y fluidez: informe final

Rama `perf/fluidez` (desde `main` 7df859b). Baseline y método en [baseline/REPORT.md](baseline/REPORT.md). Datos en `after/antes` y `after/despues`.

## Resumen

**Cero cambios visuales.** Los 20 tests de regresión visual (76 capturas, 4 anchos) y los 2 de navegación pasan contra las capturas tomadas con el código original: **22/22 en dos pasadas completas consecutivas** sobre la versión final. Además pasan los 54 tests unitarios existentes, el lint de los ficheros tocados, `test:perf` (9/9) y Lighthouse CI (5 rutas × 3 ejecuciones).

| Qué | Antes → después | Dónde se nota |
| --- | --- | --- |
| **Tirón al montar el globo 3D** (primer gesto en móvil, momento ocioso en escritorio) | peor frame 383 → **192 ms** (móvil 4x), 475 → **267 ms** (móvil 6x), 483 → **217 ms** (portátil 6x) | El tirón más perceptible de la web, justo al empezar a hacer scroll, se reduce a la mitad |
| **LCP de la home** (Lighthouse móvil) | 2480 → **2049 ms**; puntuación 96 → **98** | La home aparece antes y queda por debajo de 2,5 s |
| **JS inicial** | 174 → **134 KB gzip** (−23 %) | Menos que descargar y ejecutar en todas las rutas |
| **CLS durante el scroll en /sobre** | 0,13 → **0** (portátil), 0,08 → **0** (móvil) | La luz de fondo ya no salta al hacer scroll |
| **Hilo principal con el globo activo** | −8 % (móvil 4x), −11 % (portátil 4x) | Más margen por frame |
| **Portátil, recorrido completo de la home** | frames > 16,7 ms: 16 → **3** (4x), 74 → **43** (6x) | 60 fps más estables |

El portátil modesto (1366×768, CPU 4x y 6x) ya iba a 60 fps antes. Ahora pierde todavía menos frames y monta el globo sin el tirón de ~0,5 s.

**El móvil emulado sigue con un p5 de ~30 fps al hacer scroll.** No lo provoca un cuello de botella concreto que se pueda quitar sin cambiar algo visible. Lo demuestran dos controles:

- **Sin el globo**, la misma home sigue teniendo p5 de 30 y alrededor del 9 % de frames lentos.
- **El trabajo restante** es render nativo del navegador: estilo, layout y recomposición de capas con el scroll táctil del compositor y la CPU frenada por CDP.

Detalles y propuestas en «Pendientes».

## Qué se ha cambiado (un commit por optimización)

| Commit | Cambio | Por qué | Impacto medido (A/B intercalado) |
| --- | --- | --- | --- |
| `057b121` | **Shaders del globo compilados en paralelo antes del primer frame** (`compileAsync` + `KHR_parallel_shader_compile`). El lienzo no dibuja ni empieza su fundido (que sigue partiendo de opacidad 0) hasta tenerlos | El primer frame compilaba ~15 programas y three esperaba de forma síncrona a cada uno (`getProgramInfoLog`) | Peor frame al montar −44 a −55 %; bloqueo durante el recorrido móvil 205 → 103 ms |
| `8a036bb` | **Las señales del globo dejan de recompilar su programa en cada frame** (`forceSinglePass` en sus materiales) | three dibuja los materiales transparentes de doble cara en dos pasadas y marca `needsUpdate` en cada una: cientos de recálculos de programa por segundo. Son anillos planos, así que una pasada da exactamente los mismos píxeles | Hilo principal −2 a −2,4 puntos; 46 → 38 llamadas de dibujo por frame; 0 cambios de versión de material por frame |
| `c34a4f2` + `c483101` | **Code-splitting de las páginas que no son la home** (Contacto, Reseñas, Ajustes, Login, Guía, textos legales) con `lib/lazyRoute.js`. Entrada directa: el chunk baja en paralelo (`modulepreload`) y el primer render lo espera. Navegación: precarga con la intención (hover, foco, toque), en ocioso tras la primera interacción y de una en una; si aún no ha llegado, la navegación se suspende dentro de su transición y la página actual se queda en pantalla | La home cargaba ~150 KB sin comprimir de páginas que no usa | JS inicial −23 %; LCP de la home móvil −17 %; sin hueco vacío ni spinner al navegar (test permanente) |
| `a29045b` | **`/sobre` sin `content-visibility`, pero con la contención que esas secciones ya tenían en pantalla** (`contain: layout style paint`) | Al pintarse por primera vez cambiaban la altura de la página y la luz de fondo (al 38 % de esa altura) saltaba unos 145 px | CLS durante el scroll → 0; carga sin cambios |

Banco de pruebas: `28336ef`, `4efb9f7`, `95601ed`.

## Descartadas

| Optimización | Motivo |
| --- | --- |
| Desactivar `checkShaderErrors` de three en producción | Con la caché de shaders en frío **empeora** el peor frame (150–300 → 300–480 ms en móvil): no ahorra la compilación, la mueve al primer dibujado. Redundante tras `compileAsync` |
| Diferir Google Translate a un momento ocioso (cargándolo de inmediato si hay cookie `googtrans`) | **Empeora** el LCP en Lighthouse móvil: home 2,2 → 3,6 s y `/sobre` 2,7 → 3,2–4,5 s. Su trabajo pasa a caer dentro de la ventana del LCP |
| Precargar en ocioso todos los chunks de rutas justo tras `load` | Retrasaba ~0,5 s el LCP de escritorio. Sustituido por la precarga tras la primera interacción (`c483101`) |
| Precargar el globo en móvil antes de la primera interacción | Decisión tuya (coste de 228 KB para quien no llega a hacer scroll) |
| Quitar el recálculo de estilo que fuerza Lenis en cada frame | ~0,18 ms por frame. Evitarlo obliga a reordenar Lenis respecto a framer-motion, lo que desplaza en un frame cuándo las escenas leen el scroll: cambio de comportamiento |
| Leer el rectángulo del ancla del globo en la fase de lectura de framer-motion | El horizonte de la llamada final iría un frame por detrás de la tarjeta (que se transforma con el scroll): cambio perceptible en teoría y ganancia no medible |
| Mover la luz de `/sobre` con `transform` para que no cuente como CLS | Solo maquillaría la métrica: el salto se seguiría viendo |
| `matrixAutoUpdate = false` en objetos estáticos del globo y otros micro-ajustes de three | Ahorro estimado < 0,5 % del hilo principal: no superaría el umbral de «mejora medible» |
| Reducir `backdrop-filter` / blur (cabecera y tarjetas de cristal) | Sin coste medible ni con la GPU real ni con GPU por software |
| Congelar la cabecera o el fondo ambiental para reducir la recomposición de capas | Diagnóstico: congelarlos no reduce el coste, así que no son la causa |

## Pendientes que necesitan tu decisión

1. **LCP de `/contacto` y `/reseñas` en móvil (~5,0–5,2 s, Lighthouse 78–79).** Todo el retraso es la animación de entrada del hero desde opacidad 0. Opciones: (a) dejarlo; (b) texto visible desde el primer frame y que solo suba, como la home; (c) empezar en opacidad 0,01, que solo maquilla la métrica. Por ahora: (a).
2. **Recortar three.js** (669 KB de los 842 del chunk del globo). `@react-three/fiber` v8 importa todo `three`. Es la mayor parte del frame largo restante al montar el globo en portátil (~0,5 s de parseo y evaluación con CPU 6x). Requiere migrar a R3F v9 y React 19.
3. **HTTP/2 o HTTP/3 en producción.** En la entrada directa a `/contacto` y `/reseñas` con Fast 3G (563 ms de latencia por petición) sobre HTTP/1.1, el LCP sale un 7–9 % peor, porque la página va ahora en varios chunks pequeños. Con Slow 4G mejora un 3–4 %. Si el servidor real ya usa HTTP/2 (Cloudflare lo hace), no aplica. Alternativa: `experimentalMinChunkSize` de Rollup para agrupar chunks pequeños.
4. **Fuentes en WOFF2** (−30–40 % de peso): depende de la licencia de Rondana.
5. **Google Translate**: no lo usa ninguna parte de la interfaz. Quitarlo es decisión de producto.
6. **Móvil a 60 fps estables** al hacer scroll. Exigiría reducir trabajo de render en cada frame, por ejemplo menos elementos animados ligados al scroll a la vez o globo estático en gama baja. Son cambios perceptibles, a discutir.

## Tests permanentes

| Comando | Qué hace |
| --- | --- |
| `npm run test:visual` | Build de pruebas y 22 tests: 76 capturas (8 puntos de la home y 3 alturas de `/cursos`, `/sobre`, `/contacto` y `/reseñas`, a 360, 768, 1280 y 1920 px) con el reloj congelado, más 2 de navegación sin estado intermedio |
| `npm run test:perf` | Presupuestos de `perf/budgets.json`: fps y frames largos durante el scroll, LCP, INP y CLS (3 ejecuciones con mediana y calibración del equipo), peor frame al montar el globo en frío y tamaño de bundles |
| `npm run perf:lhci` | Lighthouse CI (`lighthouserc.cjs`): 5 rutas, 3 ejecuciones, umbrales de puntuación, LCP, TBT, CLS y peso |
| `bash perf/scripts/final-ab.sh <A> <B>` | Comparación intercalada completa entre dos builds (la usada en este informe) |

## Cómo se midió (y cuidados)

- **Comparaciones intercaladas.** A (código original) y B (versión final) se midieron alternándose (A, B, B, A, A, B) en la misma sesión. Medir en momentos distintos daba diferencias falsas de hasta el 10 % por la carga de la máquina, sobre todo la GPU compartida con otras ventanas.
- **Las cifras absolutas de esta tabla son peores que las del baseline limpio** (hilo principal del portátil al 70–97 % frente al 37–45 %): el equipo estaba más cargado. La comparación A/B sigue siendo justa porque ambos se midieron en las mismas condiciones.
- **Montaje del globo con la caché de shaders en frío.** Chrome guarda los shaders compilados y una segunda visita no paga la compilación; la primera visita es el caso que da el tirón.
- **La GPU no se puede frenar por software.** En gráficas integradas modestas el globo puede costar más de lo medido aquí; ninguno de los cambios aumenta el trabajo de GPU, y las señales dibujan menos.
- **Determinismo de la regresión visual.** El reloj de la página arranca congelado. Antes de capturar se terminan las Web Animations y se congela SMIL, y se espera a que lleguen los datos de la API. Un fallo intermitente en `/reseñas` (1 de cada ~4 pasadas completas, nunca en 24 ejecuciones aisladas) venía de que los datos llegaban en tiempo real durante el avance del reloj falso. Está corregido y la verificación final dio 22/22 en dos pasadas completas consecutivas.
- **Lighthouse de A tiene 2 muestras por celda y B tiene 3.** Una ronda de A se perdió por un cierre fallido de Chrome en Windows, ya corregido en el script.

---

## Datos ANTES / DESPUÉS

### Recorrido de scroll completo (mediana de 3 ejecuciones)

| Ruta · perfil | FPS medio | FPS p5 | Frames > 16,7 ms | Frames > 50 ms | LoAF (bloqueo ms) | Main thread ocupado | GPU ocupada | Recálculos de estilo forzados | Layouts forzados | LCP (ms) | INP (ms) | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / · Móvil · CPU 4x · slow-4g | 47,4 → **47,8** (+1 %) | 29,9 → **29,9** (+0 %) | 168 → **163** (-3 %) | 5 → **6** (+20 %) | 5 → **5** (+0 %) (334 → **231** (-31 %)) | 35,5 → **32,7** (-8 %) % | 11,1 → **10,4** (-6 %) % | 317 → **321** (+1 %) | 11 → **11** (+0 %) | 2188 → **1872** (-14 %) | 104 → **104** (+0 %) | 0,000 → **0,000** |
| / · Móvil · CPU 6x · fast-3g | 44,7 → **45,0** (+1 %) | 29,9 → **29,9** (+0 %) | 220 → **208** (-5 %) | 5 → **6** (+20 %) | 4 → **4** (+0 %) (297 → **255** (-14 %)) | 45,2 → **43,9** (-3 %) % | 7,8 → **7,7** (-1 %) % | 291 → **284** (-2 %) | 9 → **10** (+11 %) | 3184 → **2856** (-10 %) | 120 → **136** (+13 %) | 0,000 → **0,000** |
| / · Portátil · CPU 4x · slow-4g | 57,8 → **59,6** (+3 %) | 59,5 → **59,5** (+0 %) | 16 → **3** (-81 %) | 1 → **0** (-100 %) | 0 → **0** (0 → **0**) | 77,7 → **69,4** (-11 %) % | 14,5 → **14,2** (-2 %) % | 643 → **643** (+0 %) | 31 → **31** (+0 %) | 2120 → **1836** (-13 %) | 72 → **80** (+11 %) | 0,000 → **0,000** |
| / · Portátil · CPU 6x · fast-3g | 50,2 → **53,3** (+6 %) | 29,9 → **30,0** (+0 %) | 74 → **43** (-42 %) | 4 → **2** (-50 %) | 2 → **1** (-50 %) (4 → **3** (-25 %)) | 89,4 → **83,6** (-6 %) % | 11,2 → **11,5** (+3 %) % | 566 → **589** (+4 %) | 31 → **31** (+0 %) | 3256 → **2940** (-10 %) | 104 → **88** (-15 %) | 0,000 → **0,000** |
| /sobre · Móvil · CPU 4x · slow-4g | 54,0 → **53,8** (-0 %) | 30,0 → **29,9** (-0 %) | 65 → **67** (+3 %) | 1 → **1** (+0 %) | 2 → **1** (-50 %) (0 → **0**) | 19,2 → **20,0** (+4 %) % | 5,6 → **5,9** (+5 %) % | 84 → **74** (-12 %) | 0 → **0** | 2172 → **2040** (-6 %) |  | 0,000 → **0,000** |
| /sobre · Móvil · CPU 6x · fast-3g | 53,1 → **52,7** (-1 %) | 29,9 → **29,9** (+0 %) | 77 → **87** (+13 %) | 2 → **0** (-100 %) | 2 → **1** (-50 %) (0 → **0**) | 25,5 → **25,6** (+0 %) % | 3,7 → **4,0** (+8 %) % | 86 → **76** (-12 %) | 0 → **0** | 3684 → **3556** (-3 %) |  | 0,210 → **0,000** (-100 %) |
| /sobre · Portátil · CPU 4x · slow-4g | 59,5 → **60,0** (+1 %) | 59,5 → **59,5** (+0 %) | 3 → **0** (-100 %) | 0 → **0** | 1 → **0** (-100 %) (0 → **0**) | 43,5 → **45,6** (+5 %) % | 10,7 → **10,7** (+0 %) % | 291 → **306** (+5 %) | 57 → **58** (+2 %) | 2176 → **2068** (-5 %) |  | 0,130 → **0,000** (-100 %) |
| /sobre · Portátil · CPU 6x · fast-3g | 57,8 → **59,3** (+3 %) | 59,5 → **59,5** (+0 %) | 15 → **5** (-67 %) | 0 → **0** | 1 → **0** (-100 %) (0 → **0**) | 56,7 → **57,1** (+1 %) % | 9,6 → **9,8** (+2 %) % | 310 → **314** (+1 %) | 57 → **55** (-4 %) | 3640 → **3508** (-4 %) |  | 0,130 → **0,000** (-100 %) |
| /contacto · Móvil · CPU 4x · slow-4g | 55,5 → **54,9** (-1 %) | 30,0 → **30,0** (+0 %) | 32 → **35** (+9 %) | 1 → **1** (+0 %) | 1 → **1** (+0 %) (0 → **0**) | 49,8 → **52,1** (+5 %) % | 6,8 → **7,1** (+4 %) % | 102 → **102** (+0 %) | 102 → **102** (+0 %) | 2940 → **2808** (-4 %) |  | 0,000 → **0,000** |
| /contacto · Móvil · CPU 6x · fast-3g | 52,3 → **49,3** (-6 %) | 29,9 → **29,9** (+0 %) | 57 → **87** (+53 %) | 0 → **0** | 0 → **0** (0 → **0**) | 63,9 → **60,0** (-6 %) % | 4,6 → **4,8** (+4 %) % | 103 → **98** (-5 %) | 103 → **98** (-5 %) | 4132 → **4488** (+9 %) |  | 0,000 → **0,000** |
| /contacto · Portátil · CPU 4x · slow-4g | 54,9 → **54,8** (-0 %) | 30,0 → **30,0** (+0 %) | 19 → **20** (+5 %) | 0 → **0** | 0 → **0** (0 → **0**) | 86,8 → **89,0** (+3 %) % | 9,1 → **9,2** (+1 %) % | 154 → **158** (+3 %) | 153 → **157** (+3 %) | 2936 → **2808** (-4 %) |  | 0,000 → **0,000** |
| /contacto · Portátil · CPU 6x · fast-3g | 47,3 → **47,2** (-0 %) | 29,9 → **29,9** (+0 %) | 47 → **50** (+6 %) | 1 → **0** (-100 %) | 0 → **0** (0 → **0**) | 97,3 → **96,7** (-1 %) % | 8,5 → **8,4** (-1 %) % | 145 → **139** (-4 %) | 144 → **138** (-4 %) | 4172 → **4440** (+6 %) |  | 0,000 → **0,000** |
| /reseñas · Móvil · CPU 4x · slow-4g | 53,5 → **54,3** (+1 %) | 30,0 → **30,0** (+0 %) | 43 → **37** (-14 %) | 0 → **0** | 0 → **1** (0 → **0**) | 20,3 → **19,9** (-2 %) % | 8,3 → **8,1** (-2 %) % | 57 → **58** (+2 %) | 0 → **0** | 2804 → **2712** (-3 %) |  | 0,000 → **0,000** |
| /reseñas · Móvil · CPU 6x · fast-3g | 51,6 → **52,2** (+1 %) | 29,9 → **29,9** (+0 %) | 55 → **48** (-13 %) | 1 → **1** (+0 %) | 2 → **2** (+0 %) (2 → **1** (-50 %)) | 28,1 → **25,9** (-8 %) % | 7,7 → **7,3** (-5 %) % | 56 → **55** (-2 %) | 0 → **0** | 3920 → **4256** (+9 %) |  | 0,100 → **0,100** (+0 %) |
| /reseñas · Portátil · CPU 4x · slow-4g | 55,7 → **55,1** (-1 %) | 59,5 → **30,1** (-49 %) | 11 → **11** (+0 %) | 2 → **2** (+0 %) | 3 → **2** (-33 %) (19 → **37** (+95 %)) | 66,0 → **60,9** (-8 %) % | 19,0 → **17,8** (-6 %) % | 287 → **276** (-4 %) | 172 → **166** (-3 %) | 2844 → **2756** (-3 %) |  | 0,010 → **0,010** (+0 %) |
| /reseñas · Portátil · CPU 6x · fast-3g | 50,2 → **51,3** (+2 %) | 29,9 → **29,9** (+0 %) | 24 → **21** (-13 %) | 6 → **5** (-17 %) | 5 → **5** (+0 %) (71 → **65** (-8 %)) | 79,5 → **74,6** (-6 %) % | 15,3 → **15,4** (+1 %) % | 269 → **282** (+5 %) | 162 → **169** (+4 %) | 4096 → **4372** (+7 %) |  | 0,010 → **0,010** (+0 %) |

#### / · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Campus. | ¿Qué puedes esperar de los cursos? | ¿Cómo funciona el proceso? | Preguntas frecuentes | ¿Qué opinan nuestros estudiantes? | ¿Listo para encontrar tu próxima oportun | (fuera de secciones) |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 30,0 → **26,2** (-13 %) | 41,9 → **34,0** (-19 %) | 28,5 → **24,1** (-15 %) | 25,7 → **27,5** (+7 %) | 24,7 → **21,7** (-12 %) | 17,8 → **16,8** (-6 %) | 3,3 → **3,2** (-3 %) |
| Móvil · CPU 6x · fast-3g | 38,9 → **25,4** (-35 %) | 60,4 → **50,0** (-17 %) | 40,2 → **32,8** (-18 %) | 42,0 → **35,6** (-15 %) | 32,1 → **33,8** (+5 %) | 25,7 → **25,7** (+0 %) | 3,8 → **3,9** (+3 %) |
| Portátil · CPU 4x · slow-4g | 3,9 → **0,0** (-100 %) | — | 4,2 → **0,7** (-83 %) | 4,3 → **0,0** (-100 %) | 2,0 → **0,0** (-100 %) | 3,5 → **3,2** (-9 %) | 0,0 → **0,0** |
| Portátil · CPU 6x · fast-3g | 26,7 → **9,4** (-65 %) | — | 23,4 → **9,6** (-59 %) | 26,7 → **20,5** (-23 %) | 14,9 → **9,1** (-39 %) | 14,3 → **23,5** (+64 %) | 0,9 → **1,9** (+111 %) |

#### /sobre · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Misión, Visión y Valores | Nuestro equipo | Testimonios | Tu próximo curso empieza aquí. | (fuera de secciones) |
| --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 9,5 → **12,0** (+26 %) | 17,5 → **11,3** (-35 %) | 10,2 → **9,6** (-6 %) | 5,8 → **14,0** (+141 %) | 7,8 → **9,0** (+15 %) |
| Móvil · CPU 6x · fast-3g | 11,3 → **14,0** (+24 %) | 14,5 → **12,3** (-15 %) | 9,6 → **13,8** (+44 %) | 9,1 → **10,0** (+10 %) | 12,2 → **13,9** (+14 %) |
| Portátil · CPU 4x · slow-4g | 2,4 → **0,0** (-100 %) | 0,0 → **0,0** | 0,0 → **0,0** | 0,0 → **0,0** | 0,0 → **0,0** |
| Portátil · CPU 6x · fast-3g | 5,6 → **1,7** (-70 %) | 9,7 → **3,6** (-63 %) | 0,0 → **0,0** | 0,0 → **2,9** | 2,2 → **1,6** (-27 %) |

#### /contacto · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Contacto directo | Escríbenos | Quizá ya tengas la respuesta | Dónde estamos | (fuera de secciones) |
| --- | --- | --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 0,0 → **13,3** | 13,8 → **14,2** (+3 %) | 0,0 → **6,3** | 10,3 → **9,1** (-12 %) | 3,9 → **4,7** (+21 %) |
| Móvil · CPU 6x · fast-3g | 0,0 → **38,9** | 17,9 → **28,2** (+58 %) | 11,1 → **20,0** (+80 %) | 27,0 → **16,2** (-40 %) | 10,3 → **15,3** (+49 %) |
| Portátil · CPU 4x · slow-4g | — | 35,4 → **32,0** (-10 %) | — | 0,0 → **7,7** | 1,3 → **1,4** (+8 %) |
| Portátil · CPU 6x · fast-3g | — | 44,2 → **52,4** (+19 %) | — | 12,5 → **6,3** (-50 %) | 17,2 → **13,6** (-21 %) |

#### /reseñas · frames perdidos por escena (% de frames > 16,7 ms; entre paréntesis, el peor frame)

| Perfil | Valoración de los alumnos | Lo que cuentan los alumnos | (fuera de secciones) |
| --- | --- | --- | --- |
| Móvil · CPU 4x · slow-4g | 0,0 → **0,0** | 19,9 → **17,6** (-12 %) | 6,8 → **5,7** (-16 %) |
| Móvil · CPU 6x · fast-3g | 0,0 → **0,0** | 30,5 → **26,1** (-14 %) | 6,8 → **5,8** (-15 %) |
| Portátil · CPU 4x · slow-4g | 0,0 → **0,0** | 18,3 → **16,9** (-8 %) | 0,7 → **0,7** (+0 %) |
| Portátil · CPU 6x · fast-3g | 22,2 → **22,2** (+0 %) | 23,2 → **21,9** (-6 %) | 3,9 → **3,3** (-15 %) |

### Lighthouse (mediana de 2 ejecuciones, visita de primera vez)

| Ruta | Forma | Puntuación | FCP (ms) | LCP (ms) | TBT (ms) | CLS | Speed Index (ms) | Peso total (KB) | JS (KB) |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | móvil | 96 → **98** (+2 %) | 1847 → **1739** (-6 %) | 2480 → **2049** (-17 %) | 97 → **108** (+11 %) | 0,000 → **0,000** | 1995 → **1825** (-8 %) | 474 → **438** (-8 %) | 383 → **346** (-10 %) |
| / | escritorio | 100 → **100** (+0 %) | 462 → **363** (-21 %) | 657 → **595** (-9 %) | 8 → **0** (-100 %) | 0,000 → **0,000** | 925 → **849** (-8 %) | 707 → **667** (-6 %) | 615 → **575** (-7 %) |
| /cursos | móvil | 95 → **95** (+1 %) | 2204 → **2105** (-4 %) | 2683 → **2601** (-3 %) | 21 → **19** (-7 %) | 0,000 → **0,000** | 2248 → **2105** (-6 %) | 617 → **643** (+4 %) | 344 → **365** (+6 %) |
| /cursos | escritorio | 98 → **98** (+0 %) | 484 → **464** (-4 %) | 1139 → **1152** (+1 %) | 0 → **0** | 0,000 → **0,000** | 667 → **654** (-2 %) | 616 → **643** (+4 %) | 344 → **365** (+6 %) |
| /sobre | móvil | 95 → **95** (+0 %) | 1914 → **1850** (-3 %) | 2715 → **2757** (+2 %) | 19 → **27** (+46 %) | 0,000 → **0,000** | 2083 → **1928** (-7 %) | 514 → **478** (-7 %) | 394 → **357** (-9 %) |
| /sobre | escritorio | 97 → **97** (+0 %) | 429 → **412** (-4 %) | 1293 → **1263** (-2 %) | 0 → **0** | 0,000 → **0,000** | 668 → **648** (-3 %) | 540 → **504** (-7 %) | 394 → **357** (-9 %) |
| /contacto | móvil | 78 → **79** (+1 %) | 1911 → **2063** (+8 %) | 5167 → **4978** (-4 %) | 130 → **132** (+2 %) | 0,000 → **0,000** | 2163 → **2175** (+1 %) | 476 → **460** (-3 %) | 387 → **369** (-5 %) |
| /contacto | escritorio | 97 → **97** (+1 %) | 569 → **503** (-12 %) | 1330 → **1302** (-2 %) | 0 → **0** | 0,000 → **0,000** | 728 → **716** (-2 %) | 476 → **460** (-3 %) | 386 → **369** (-4 %) |
| /reseñas | móvil | 78 → **78** (+1 %) | 2183 → **2179** (-0 %) | 5449 → **5231** (-4 %) | 72 → **63** (-13 %) | 0,003 → **0,003** (+0 %) | 2404 → **2179** (-9 %) | 498 → **484** (-3 %) | 387 → **372** (-4 %) |
| /reseñas | escritorio | 96 → **96** (+0 %) | 536 → **530** (-1 %) | 1363 → **1389** (+2 %) | 0 → **0** | 0,016 → **0,016** (+0 %) | 731 → **724** (-1 %) | 500 → **484** (-3 %) | 388 → **372** (-4 %) |

### Memoria (tras GC, al inicio y tras 240 s de scroll continuo)

| Perfil | Heap inicio (MB) | Heap final (MB) | Crecimiento (MB) | Nodos DOM | Listeners JS | Pasadas |
| --- | --- | --- | --- | --- | --- | --- |
| Portátil | 10,8 → **10,3** (-5 %) | 10,9 → **10,5** (-4 %) | 0,10 → **0,16** (+60 %) | 757 → 760 | 259 → 260 | 33 |
| Móvil | 9,0 → **8,6** (-4 %) | 9,2 → **8,8** (-5 %) | 0,27 → **0,22** (-19 %) | 694 → 694 | 223 → 223 | 10 |

### Montaje del globo 3D (primera visita: caché de shaders en frío; 5 s desde que se dispara)

| Perfil | Peor frame (ms) | Frames > 50 ms | LoAF (ms) | Bloqueo (ms) |
| --- | --- | --- | --- | --- |
| Móvil · CPU 6x | 475 → **267** (-44 %) | 1,5 → **3,0** (+100 %) | 571 → **554** (-3 %) | 432 → **301** (-30 %) |
| Móvil · CPU 4x | 383 → **192** (-50 %) | 1,0 → **2,0** (+100 %) | 430 → **322** (-25 %) | 333 → **205** (-38 %) |
| Portátil · CPU 6x | 483 → **217** (-55 %) | 2,0 → **4,5** (+125 %) | 1296 → **1269** (-2 %) | 895 → **758** (-15 %) |

### Bundles

| Paquete | KB bruto / gzip / brotli |
| --- | --- |
| JS inicial (todas las rutas) | 569,8 → **414,4** (-27 %) / 173,9 → **133,7** (-23 %) / 148,5 → **116,4** (-22 %) |
| CSS inicial | 171,4 → **173,5** (+1 %) / 26,1 → **26,2** (+0 %) / 20,3 → **20,4** (+0 %) |
| diferido: components/globe/GlobeCanvas.jsx | 841,4 → **841,7** (+0 %) / 227,6 → **227,7** (+0 %) / 187,0 → **187,0** (+0 %) |
| diferido: components/admin/gestion-cursos/CourseEditor.jsx | 79,8 → **88,6** (+11 %) / 31,7 → **36,9** (+16 %) / 28,1 → **32,7** (+16 %) |
| diferido: components/admin/correcciones/SubmissionDrawer.jsx | 69,2 → **77,5** (+12 %) / 29,8 → **35,0** (+17 %) / 26,6 → **31,0** (+17 %) |
| diferido: _CorreccionesTab-EetKQs0P.js | 47,8 / 21,8 / 19,4 |
| diferido: components/admin/reservas/ReservasTab.jsx | 46,9 → **51,4** (+10 %) / 20,4 → **23,2** (+14 %) / 18,2 → **20,6** (+13 %) |
| diferido: pages/CursoDetalle.jsx | 58,1 → **61,2** (+5 %) / 18,2 → **20,3** (+12 %) / 16,0 → **17,8** (+11 %) |
| diferido: components/admin/progreso/ProgresoTab.jsx | 40,7 → **44,9** (+10 %) / 17,3 → **20,0** (+16 %) / 15,6 → **17,8** (+14 %) |
| diferido: pages/CursoInscripcion.jsx | 42,6 → **45,4** (+7 %) / 16,9 → **18,6** (+10 %) / 15,0 → **16,5** (+10 %) |
| diferido: _GestionCursosTab-noGE_Dt_.js | 29,5 / 13,3 / 11,7 |
| diferido: pages/Cursos.jsx | 24,9 → **32,8** (+32 %) / 10,2 → **14,1** (+38 %) / 9,1 → **12,6** (+38 %) |
| diferido: components/auth/AuthModal.jsx | 20,4 → **25,7** (+26 %) / 7,6 → **10,7** (+41 %) / 6,8 → **9,5** (+40 %) |
| diferido: pages/SobreNosotros.jsx | 19,1 → **23,8** (+25 %) / 7,0 → **9,4** (+34 %) / 6,1 → **8,3** (+36 %) |

#### Inventario de recursos estáticos (public/)

| Tipo | Fichero | KB |
| --- | --- | --- |
| imagen | inicio/globo.webp | 43,8 |
| fuente | Corporatives/Typography/Rondana Black.otf | 20,8 |
| fuente | Corporatives/Typography/Rondana Ultra Light.otf | 20,6 |
| fuente | Corporatives/Typography/Rondana Light.otf | 20,3 |
| fuente | Corporatives/Typography/Rondana Regular.otf | 20,2 |
| imagen | vite.svg | 1,5 |
