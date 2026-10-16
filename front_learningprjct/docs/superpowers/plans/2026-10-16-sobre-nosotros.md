# Sobre Nosotros — plan

Spec: `docs/superpowers/specs/2026-10-16-sobre-nosotros-design.md`. Un commit por paso; build y lint en cada uno.

1. **Estructura y contenido.** Crear `src/components/about/aboutCopy.js` con los textos, valores, equipo y testimonios de `pages/SobreNosotros.jsx`, más la meta. La página pasa a componer escenas (`AboutHero`, `MissionVision`, `ValuesSection`/`ValueItem`, `AboutTeam`/`TeamMember`, `AboutTestimonials`, `AboutClosing`) con un `h1`, un `h2` por sección y landmarks. Añadir `usePageMeta`.
2. **Fondo y luz.** `AboutBackdrop.jsx` y el bloque `.about-*` en `src/index.css`: cielo, estrellas, aurora, halos y limbo del globo.
3. **Valores.** Lista en filas y `ValuesConstellation.jsx` (SVG de unos 15 nodos, `:has()` para hover).
4. **Misión y visión.** Titular de lectura, párrafo de 65–75 caracteres y libélula.
5. **Equipo, testimonios y cierre.** Horizonte con `view()`, botones «Comenzar ahora» y «Ver cursos».
6. **Móvil.** De 360 a 390 px: orden, decoración reducida, sin desbordes.
7. **Movimiento, reduced motion y gama baja.**
8. **Optimización.** `content-visibility` y mediciones «después».
9. **Verificación.** Capturas a 1440, 1024, 768, 390 y 360 px más reduce y lite, vídeo, Lighthouse, teclado, contraste, Firefox y WebKit, y `git diff --stat` contra `main`.
