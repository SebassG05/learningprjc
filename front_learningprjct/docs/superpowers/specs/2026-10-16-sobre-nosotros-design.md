# Sobre Nosotros — diseño

Rama `feat/sobre-nosotros` (desde `main`, que incluye Ajustes). Solo visual y organización del código de presentación.

## 1. Decisiones aprobadas (2026-10-16)

- Dirección: **manifiesto editorial** (escenas tipográficas sobre la atmósfera de la home) con la **constelación** solo en los valores (escritorio) y el horizonte de la home como cierre.
- Introducción A: «Evenor-Tech ayuda a gestionar el territorio de forma sostenible con tecnología e innovación. En este campus compartimos ese conocimiento en cursos online, para que cualquier persona pueda aplicarlo.»
- Testimonios: mismo texto, citas estáticas sin slider (`lang="en"`, `<blockquote>`), iniciales calculadas a partir del nombre (antes «PS» y «JF» eran erróneas) y un enlace a `/reseñas`.
- Árbol en `src/components/about/` (convención por dominio, imports relativos, sin barrels). `App.jsx`, header, footer y Contacto no se tocan; el horizonte se copia a clases `.about-*`.

## 2. Estructura y contenido

| Escena | Contenido | Encabezado |
|---|---|---|
| Hero | titular «Sobre **Evenor-Tech**» + introducción A; guiño al globo (limbo del planeta, estático) | `h1` |
| Esencia | foto de la libélula (ParallaxImage existente), Misión y Visión (texto literal: la primera frase pasa a titular de lectura y el resto a párrafo), Valores | `h2` «Misión, Visión y Valores» y `h3` Misión, Visión y Valores |
| Equipo | 5 personas con monograma, cargo y LinkedIn (`aria-label` con el nombre y aviso de pestaña nueva) | `h2` «Nuestro equipo» |
| Testimonios | 4 citas estáticas, valoración en estrellas con texto para lectores de pantalla, enlace a `/reseñas` | `h2` «Testimonios» |
| Cierre | «¿Quieres colaborar o tienes dudas?» y su texto (mismos destinos: el enlace de Outlook web y `/contacto`), botones «Comenzar ahora» (acción de la home: `/cursos` con sesión y diálogo de acceso sin ella) y «Ver cursos»; horizonte con amanecer verde que enlaza con el footer | `h2` |

Se eliminan el chip (repetía el `h1`) y las etiquetas sobre los titulares. Los valores pasan a una sola lista `<ul>` con iconos distintos: Lightbulb, HeartHandshake, BadgeCheck, Accessibility y ScanEye.

## 3. Fondo y luz

- Cielo: degradados radiales de la marca (`brand-700`/`night-teal`) sobre `night` → `canvas`, con la misma dirección de luz que Contacto/Reseñas.
- Estrellas: una sola capa de `background-image`, enmascarada hacia abajo.
- Aurora: una elipse con degradado radial (sin `filter: blur`) que deriva solo con `transform`; se pausa fuera de pantalla y queda quieta en móvil, con movimiento reducido y en pantallas estrechas (`useScenesEnabled`).
- Halos tras los titulares: degradados radiales que se encienden con `opacity`.
- **Sin `backdrop-filter` ni `filter: blur`** en toda la página: la gama baja y `prefers-reduced-transparency` no necesitan alternativa.

## 4. Movimiento

| Escena | Técnica | Por qué |
|---|---|---|
| Titular e introducción | `@keyframes` CSS de `transform` (sube 0,18 em) sin tocar la opacidad | se pintan en el primer frame (LCP) |
| Halos | `@keyframes` de `opacity` | barato, en el compositor |
| Misión, Visión, equipo, citas | `Reveal` existente (IntersectionObserver, una vez) | cero listeners de scroll |
| Valores | `Reveal` en grupo (escalonado) y líneas de la constelación con `pathLength` de Motion al aparecer | 5 trazos cortos; hover y foco con CSS `:has()` |
| Horizonte | `animation-timeline: view()` dentro de `@supports`; sin soporte queda estático | ligado al scroll sin JS |

Con `prefers-reduced-motion` no hay desplazamientos, escalados ni trazos dibujados: la escena final ya está compuesta y solo quedan fundidos cortos (regla global de `index.css` y `useReducedMotion`).

## 5. Rendimiento

- Bajo el pliegue: `content-visibility: auto` y `contain-intrinsic-size` en Equipo, Testimonios y Cierre.
- Sin dependencias nuevas, sin Canvas y sin `LazyMotion` (`motion` completo ya está en el bundle principal: no ahorraría bytes).
- Medir «antes» y «después» igual: Lighthouse 12.8.2 en móvil y escritorio sobre `vite preview`, y fps en scroll con CPU 4× más lenta.

## 6. Pendiente de decisión

- Fotos del equipo (hoy son monogramas).
- Testimonios propios del campus en español que sustituyan a los de Trustburn.
- Cambiar el enlace de Outlook web por `mailto:`.
- Un titular de cierre orientado a empezar un curso (hoy se mantiene «¿Quieres colaborar o tienes dudas?»).
- `lazy()` de `/sobre` en `App.jsx`, `LazyMotion` global, `preload` de Rondana y paso a WOFF2, Google Translate con `async`, fundido de `PageTransition` (afecta al LCP de todas las rutas).
- Datos estructurados `EducationalOrganization`.
- Extraer el horizonte a una pieza compartida con Contacto.
- Header: el `aria-label` del logo no coincide con su texto visible (Lighthouse).
