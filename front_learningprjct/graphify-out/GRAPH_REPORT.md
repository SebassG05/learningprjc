# Graph Report - front_learningprjct  (2026-10-14)

## Corpus Check
- 90 files · ~491,171 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: .otf 4, .example 1, (none) 1)

## Summary
- 545 nodes · 1494 edges · 26 communities (19 shown, 7 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 28 edges (avg confidence: 0.92)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `84c5ef35`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- GlobeCanvas.jsx
- main.jsx
- react
- package.json
- App.jsx
- Home.jsx
- keyframes.js
- workbox-4772ad73.js
- StrategyHandler
- devDependencies
- CookieBanner.jsx
- WorkboxError
- Router
- PrecacheStrategy
- dependencies
- waitUntil
- PrecacheInstallReportPlugin
- registerRoute
- README.md
- eslint.config.js
- scripts
- vite.config.js
- autoprefixer

## God Nodes (most connected - your core abstractions)
1. `react` - 59 edges
2. `framer-motion` - 37 edges
3. `lucide-react` - 28 edges
4. `AnimatedRoutes()` - 25 edges
5. `react-router-dom` - 24 edges
6. `ease` - 24 edges
7. `duration` - 24 edges
8. `GlobeCanvas()` - 21 edges
9. `useUser()` - 21 edges
10. `Director()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Fondo "Viaje de vuelta a la Tierra" — plan de implementación` --references--> `GlobeCanvas()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/components/globe/GlobeCanvas.jsx
- `Tarea 5: `DawnScene` (CTA)` --references--> `setCtaBoost()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/components/globe/journey/store.js
- `Tarea 3: `DeepSpaceScene` (FAQ)` --references--> `DeepSpaceScene()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/components/globe/scenes/DeepSpaceScene.jsx
- `Tarea 5: `DawnScene` (CTA)` --references--> `Item()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/components/ui/Reveal.jsx
- `Tarea 4: `OrbitScene` (Reseñas)` --references--> `ReviewsCarousel()`  [INFERRED]
  front_learningprjct/docs/superpowers/plans/2026-10-13-inicio-fondo-viaje.md → front_learningprjct/src/pages/Home.jsx

## Import Cycles
- None detected.

## Communities (26 total, 7 thin omitted)

### Community 0 - "GlobeCanvas.jsx"
Cohesion: 0.06
Nodes (68): Tarea 4: `OrbitScene` (Reseñas), Tarea 5: `DawnScene` (CTA), @react-three/fiber, three, ARCS, GLOBE, HUB, LIGHT_DIR (+60 more)

### Community 1 - "main.jsx"
Cohesion: 0.33
Nodes (4): react-dom, @react-oauth/google, ToastProvider(), UserProvider()

### Community 2 - "react"
Cohesion: 0.06
Nodes (62): framer-motion, lucide-react, react, react-router-dom, AdminCursos(), GoogleAuthButton(), EjercicioOptativo(), EstructuraCurso() (+54 more)

### Community 3 - "package.json"
Cohesion: 0.13
Nodes (14): name, private, type, version, eslint, postcss, @react-three/drei, stylelint (+6 more)

### Community 4 - "App.jsx"
Cohesion: 0.08
Nodes (42): lenis, AnimatedRoutes(), App(), CorreccionesAdmin, CursoDetalle, CursoInscripcion, EntregaEjercicio, EstructuraCursoPage (+34 more)

### Community 5 - "Home.jsx"
Cohesion: 0.06
Nodes (65): Estructura de archivos, Fondo "Viaje de vuelta a la Tierra" — plan de implementación, Restricciones globales, Revisión: puntos de fallo, Tarea 0: rama y capturas "antes", Tarea 1: lienzo a nivel de página (`JourneyStage`), Tarea 3: `DeepSpaceScene` (FAQ), Tarea 6: reduced motion, móvil y gama baja (+57 more)

### Community 6 - "keyframes.js"
Cohesion: 0.11
Nodes (34): Tarea 2: trayectoria de cámara, Director(), ARRIVAL, base, blendFrames(), CAMERA_Z, carryAt(), centerForHorizon() (+26 more)

### Community 7 - "workbox-4772ad73.js"
Cohesion: 0.13
Nodes (13): addRoute(), cacheMatchIgnoreParams(), cacheWillUpdate(), canConstructResponseFromBodyStream(), copyResponse(), Deferred, executeQuotaErrorCallbacks(), generateURLVariations() (+5 more)

### Community 8 - "StrategyHandler"
Cohesion: 0.24
Nodes (3): Strategy, StrategyHandler, toRequest()

### Community 9 - "devDependencies"
Cohesion: 0.11
Nodes (19): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals (+11 more)

### Community 10 - "CookieBanner.jsx"
Cohesion: 0.20
Nodes (9): CookiePreferences(), CookieBanner(), CookieSettings(), Layout(), PageBackground(), CookieConsentContext, CookieConsentProvider(), useCookieConsent() (+1 more)

### Community 11 - "WorkboxError"
Cohesion: 0.19
Nodes (4): createCacheKey(), PrecacheController, PrecacheRoute, WorkboxError

### Community 14 - "dependencies"
Cohesion: 0.18
Nodes (11): dependencies, framer-motion, lenis, lucide-react, react, react-dom, @react-oauth/google, react-router-dom (+3 more)

### Community 15 - "waitUntil"
Cohesion: 0.28
Nodes (4): cleanupOutdatedCaches(), NetworkFirst, printCleanupDetails(), waitUntil()

### Community 16 - "PrecacheInstallReportPlugin"
Cohesion: 0.29
Nodes (3): _nestedGroup(), PrecacheInstallReportPlugin, printInstallDetails()

### Community 17 - "registerRoute"
Cohesion: 0.40
Nodes (3): RegExpRoute, registerRoute(), Route

### Community 22 - "eslint.config.js"
Cohesion: 0.33
Nodes (5): @eslint/js, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 23 - "scripts"
Cohesion: 0.33
Nodes (6): scripts, build, dev, lint, preview, test

### Community 24 - "vite.config.js"
Cohesion: 0.50
Nodes (3): vite, vite-plugin-pwa, @vitejs/plugin-react

## Knowledge Gaps
- **9 isolated node(s):** `@tailwindcss/postcss`, `@types/react`, `@types/react-dom`, `eslint`, `postcss` (+4 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 143 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `react` to `GlobeCanvas.jsx`, `main.jsx`, `package.json`, `App.jsx`, `Home.jsx`, `CookieBanner.jsx`?**
  _High betweenness centrality (0.233) - this node is a cross-community bridge._
- **What connects `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` to the rest of the system?**
  _9 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `GlobeCanvas.jsx` be split into smaller, more focused modules?**
  _Cohesion score 0.06317954745812518 - nodes in this community are weakly interconnected._
- **Why does `framer-motion` connect `react` to `package.json`, `App.jsx`, `Home.jsx`?**
  _High betweenness centrality (0.056) - this node is a cross-community bridge._
- **Should `react` be split into smaller, more focused modules?**
  _Cohesion score 0.06451033243486073 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `devDependencies` to `package.json`?**
  _High betweenness centrality (0.053) - this node is a cross-community bridge._
- **Should `package.json` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._